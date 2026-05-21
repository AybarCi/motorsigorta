"use client";

import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { supabase } from "@/lib/supabase";

const formatWaPhone = (phone?: string) => {
  if (!phone) return "";
  const cleaned = phone.replace(/\D/g, "");
  if (cleaned.startsWith("90")) return cleaned;
  if (cleaned.startsWith("0")) return "90" + cleaned.substring(1);
  return "90" + cleaned;
};

export default function AdminPanel() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [leads, setLeads] = useState<any[]>([]);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [policies, setPolicies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'leads' | 'renewals'>('leads');
  const [search, setSearch] = useState("");
  const [selectedLeadId, setSelectedLeadId] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;

  // New state for Quote Modal
  const [quoteModalLeadId, setQuoteModalLeadId] = useState<string | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [leadQuotes, setLeadQuotes] = useState<any[]>([]);
  const [isUploadingQuote, setIsUploadingQuote] = useState(false);
  const [quotePremium, setQuotePremium] = useState("");
  const [policyPremium, setPolicyPremium] = useState("");

  const formatPremium = (val: string) => {
    let clean = val.replace(/[^0-9,]/g, '');
    if(clean.includes(',')) {
      const parts = clean.split(',');
      clean = parts[0] + ',' + parts.slice(1).join('').substring(0, 2);
    }
    const parts = clean.split(',');
    if (parts[0]) {
      parts[0] = parseInt(parts[0], 10).toLocaleString('tr-TR');
    }
    return parts.join(',');
  };

  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab, search]);

  const thisMonthLeads = leads.filter(l => new Date(l.created_at).getMonth() === new Date().getMonth()).length;
  const thisMonthSales = policies.filter(p => new Date(p.created_at).getMonth() === new Date().getMonth()).length;
  const conversionRate = thisMonthLeads > 0 ? Math.round((thisMonthSales / thisMonthLeads) * 100) : 0;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const upcomingRenewals = policies.filter((p: any) => {
    const days = Math.floor((new Date(p.end_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
    return days >= 0 && days <= 30;
  }).length;

  useEffect(() => {
    Promise.all([
      fetch("/api/v1/leads").then(res => res.json()),
      fetch("/api/v1/policies").then(res => res.json())
    ]).then(([leadsData, policiesData]) => {
      if(leadsData.success) setLeads(leadsData.data);
      if(policiesData.success) setPolicies(policiesData.data);
      setLoading(false);
    });
  }, []);

  const handleUpdateStatus = async (id: string, status: string) => {
    await fetch(`/api/v1/leads/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    });
    setLeads(leads.map(l => l.id === id ? { ...l, status } : l));
  };

  const handleCreatePolicy = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const lead = leads.find(l => l.id === selectedLeadId);
    if (!lead) return;

    let document_url = null;
    let mime_type = null;
    let file_size = null;

    const file = formData.get("policy_file") as File;
    if (file && file.size > 0) {
      const fileExt = file.name.split('.').pop();
      const fileName = `${lead.customer_id}-${Date.now()}.${fileExt}`;
      const filePath = `policies/${fileName}`;

      const { error } = await supabase.storage
        .from('documents')
        .upload(filePath, file);

      if (error) {
        console.error("Upload error", error);
        alert("Dosya yüklenemedi. Lütfen Supabase üzerinden 'documents' adında bir Storage Bucket oluşturduğunuzdan emin olun.");
        // We can either return or continue without the file
      } else {
        const { data: publicUrlData } = supabase.storage
          .from('documents')
          .getPublicUrl(filePath);

        document_url = publicUrlData.publicUrl;
        mime_type = file.type;
        file_size = file.size;
      }
    }

    await fetch("/api/v1/policies", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        policy_number: formData.get("policy_number"),
        customer_id: lead.customer_id,
        lead_id: lead.id,
        insurance_type: lead.insurance_type,
        company_name: formData.get("company_name"),
        premium_amount: parseFloat((formData.get("premium_amount") as string).replace(/\./g, '').replace(',', '.')),
        start_date: new Date().toISOString(),
        end_date: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString(),
        document_url,
        mime_type,
        file_size,
      })
    });
    
    window.location.reload();
  };

  const openQuoteModal = async (leadId: string) => {
    setQuoteModalLeadId(leadId);
    setLeadQuotes([]);
    try {
      const res = await fetch(`/api/v1/leads/${leadId}/quotes`);
      const data = await res.json();
      if(data.success) {
        setLeadQuotes(data.data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleUploadQuote = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if(!quoteModalLeadId) return;
    setIsUploadingQuote(true);
    
    const formData = new FormData(e.currentTarget);
    const actualPremium = formData.get("premium_display") as string;
    formData.set("premium", actualPremium.replace(/\./g, '').replace(',', '.'));
    
    try {
      const res = await fetch(`/api/v1/leads/${quoteModalLeadId}/quotes`, {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if(data.success) {
        setLeadQuotes([data.data, ...leadQuotes]);
        setQuotePremium("");
        (e.target as HTMLFormElement).reset();
      } else {
        alert("Teklif yüklenemedi: " + data.error);
      }
    } catch(err) {
      console.error(err);
      alert("Bir hata oluştu.");
    } finally {
      setIsUploadingQuote(false);
    }
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const filteredLeads = leads.filter((l: any) => 
    l.customer?.phone?.includes(search) || 
    l.tracking_id.toLowerCase().includes(search.toLowerCase()) ||
    l.customer?.full_name?.toLowerCase().includes(search.toLowerCase())
  );

  const paginatedLeads = filteredLeads.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  const totalLeadsPages = Math.ceil(filteredLeads.length / itemsPerPage);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const renewals = policies.map((p: any) => {
    const days = Math.floor((new Date(p.end_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
    return { ...p, daysLeft: days };
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  }).filter((p: any) => p.daysLeft >= 0 && p.daysLeft <= 30).sort((a: any, b: any) => a.daysLeft - b.daysLeft);

  const paginatedRenewals = renewals.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  const totalRenewalsPages = Math.ceil(renewals.length / itemsPerPage);

  const totalPages = activeTab === 'leads' ? totalLeadsPages : totalRenewalsPages;

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 font-sans pb-20">
      
      {/* Header */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold">M</div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">Sigorta Operasyon Merkezi</h1>
          </div>
          
          <div className="flex bg-slate-100 p-1 rounded-lg">
            <button 
              onClick={() => setActiveTab('leads')}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${activeTab === 'leads' ? 'bg-white shadow-sm text-blue-700' : 'text-slate-500 hover:text-slate-700'}`}
            >
              Talepler (Leads)
            </button>
            <button 
              onClick={() => setActiveTab('renewals')}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-all flex items-center gap-2 ${activeTab === 'renewals' ? 'bg-white shadow-sm text-blue-700' : 'text-slate-500 hover:text-slate-700'}`}
            >
              Yenilemeler
              {upcomingRenewals > 0 && (
                <span className="bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full animate-pulse">
                  {upcomingRenewals}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 mt-8 space-y-8">
        
        {/* Metric Widgets */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-center">
            <span className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Bu Ay Gelen Lead</span>
            <span className="text-4xl font-black text-slate-900 mt-2">{thisMonthLeads}</span>
          </div>
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-center">
            <span className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Kesilen Poliçe</span>
            <span className="text-4xl font-black text-green-600 mt-2">{thisMonthSales}</span>
          </div>
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-center">
            <span className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Dönüşüm Oranı</span>
            <span className="text-4xl font-black text-blue-600 mt-2">%{conversionRate}</span>
          </div>
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-center relative overflow-hidden">
            <div className="absolute -right-4 -top-4 w-24 h-24 bg-orange-100 rounded-full opacity-50 blur-xl"></div>
            <span className="text-sm font-semibold text-slate-500 uppercase tracking-wider relative z-10">Yaklaşan Yenileme</span>
            <span className="text-4xl font-black text-orange-600 mt-2 relative z-10">{upcomingRenewals}</span>
          </div>
        </div>

        {/* Content Area */}
        <div className="bg-white border border-slate-200 shadow-sm rounded-2xl overflow-hidden">
          
          <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
            <h2 className="text-lg font-bold text-slate-800">
              {activeTab === 'leads' ? 'Aktif Talepler' : 'Yenileme Radarı'}
            </h2>
            {activeTab === 'leads' && (
              <input 
                type="text"
                placeholder="Telefon, Plaka veya TRK ID ara..." 
                className="px-4 py-2 bg-white border border-slate-300 rounded-lg text-sm w-72 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            )}
          </div>

          <div className="mt-4">
            {/* LEADS KARTLARI */}
            {activeTab === 'leads' && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                {paginatedLeads.map((lead: any) => (
                  <div key={lead.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 hover:shadow-md transition-shadow flex flex-col h-full">
                    
                    {/* Header: Phone & Status */}
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="font-bold text-lg text-slate-900">{lead.customer?.phone || "İsimsiz Müşteri"}</h3>
                        <p className="text-xs text-slate-500 mt-0.5">{lead.lead_source || 'Organik Web'}</p>
                      </div>
                      <span className={`inline-flex px-2 py-1 rounded-md text-[10px] uppercase font-bold tracking-wider ${
                        lead.status === 'NEW' ? 'bg-orange-100 text-orange-700' :
                        lead.status === 'CONTACTED' ? 'bg-purple-100 text-purple-700' :
                        lead.status === 'QUOTE_SENT' ? 'bg-yellow-100 text-yellow-700' :
                        lead.status === 'SOLD' ? 'bg-green-100 text-green-700' :
                        'bg-slate-100 text-slate-700'
                      }`}>
                        {lead.status}
                      </span>
                    </div>

                    {/* Middle: Details */}
                    <div className="flex-1 space-y-3 mb-5 border-t border-b border-slate-100 py-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-slate-500">Tür</span>
                        <span className="inline-flex px-2 py-1 rounded-md text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-100">
                          {lead.insurance_type}
                        </span>
                      </div>
                      
                      {lead.dynamic_fields && Object.keys(lead.dynamic_fields).length > 0 && (
                        <div className="grid grid-cols-2 gap-2 mt-2 pt-2 border-t border-slate-50 border-dashed">
                          {lead.dynamic_fields.tc_no && <div className="text-xs text-slate-600"><span className="text-slate-400 font-medium">TC:</span><br/>{lead.dynamic_fields.tc_no}</div>}
                          {lead.dynamic_fields.plate && <div className="text-xs text-slate-600"><span className="text-slate-400 font-medium">Plaka:</span><br/><span className="uppercase">{lead.dynamic_fields.plate}</span></div>}
                          {lead.dynamic_fields.city && <div className="text-xs text-slate-600"><span className="text-slate-400 font-medium">Şehir:</span><br/>{lead.dynamic_fields.city}</div>}
                          {lead.dynamic_fields.ageGroup && <div className="text-xs text-slate-600"><span className="text-slate-400 font-medium">Yaş:</span><br/>{lead.dynamic_fields.ageGroup}</div>}
                          {lead.dynamic_fields.sector && <div className="text-xs text-slate-600"><span className="text-slate-400 font-medium">Sektör:</span><br/>{lead.dynamic_fields.sector}</div>}
                        </div>
                      )}
                      
                      <div className="flex items-center justify-between pt-2">
                        <span className="text-[10px] text-slate-400 font-mono">{lead.tracking_id}</span>
                        <span className="text-[10px] text-slate-400">{new Date(lead.created_at).toLocaleDateString('tr-TR')}</span>
                      </div>
                    </div>

                    {/* Footer: Actions */}
                    <div className="grid grid-cols-2 gap-2 mt-auto">
                      <button 
                        onClick={() => openQuoteModal(lead.id)}
                        className="col-span-2 py-2 bg-slate-100 text-slate-800 border border-slate-200 hover:bg-slate-200 font-bold text-xs rounded-lg transition-colors flex items-center justify-center gap-2"
                      >
                        Teklif Ekle / Gör
                      </button>

                      <button 
                        onClick={() => window.open(`https://wa.me/${formatWaPhone(lead.customer?.phone)}`, '_blank')}
                        className="col-span-2 py-2 bg-[#25D366]/10 text-[#25D366] hover:bg-[#25D366]/20 font-bold text-xs rounded-lg transition-colors flex items-center justify-center gap-1"
                      >
                        WhatsApp&apos;tan Yaz
                      </button>
                      
                      {lead.status !== 'CONTACTED' && lead.status !== 'QUOTE_SENT' && lead.status !== 'SOLD' && (
                        <button 
                          onClick={() => handleUpdateStatus(lead.id, 'CONTACTED')}
                          className="py-2 bg-slate-100 text-slate-700 hover:bg-slate-200 font-medium text-xs rounded-lg transition-colors"
                        >
                          Arandı Yap
                        </button>
                      )}
                      
                      {lead.status !== 'QUOTE_SENT' && lead.status !== 'SOLD' && (
                        <button 
                          onClick={() => handleUpdateStatus(lead.id, 'QUOTE_SENT')}
                          className="py-2 bg-slate-100 text-slate-700 hover:bg-slate-200 font-medium text-xs rounded-lg transition-colors"
                        >
                          Teklif İletildi
                        </button>
                      )}

                      {lead.status !== 'SOLD' && (
                        <button 
                          onClick={() => setSelectedLeadId(lead.id)}
                          className={`${lead.status === 'QUOTE_SENT' ? 'col-span-2' : ''} py-2 bg-blue-600 text-white hover:bg-blue-700 font-bold text-xs rounded-lg shadow-sm transition-colors`}
                        >
                          Satıldı (Poliçe)
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'leads' && filteredLeads.length === 0 && !loading && (
              <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-500">
                Hiç talep bulunmuyor veya arama sonucu boş.
              </div>
            )}

            {/* RENEWALS KARTLARI */}
            {activeTab === 'renewals' && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                {paginatedRenewals.map((policy: any) => (
                  <div key={policy.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 hover:shadow-md transition-shadow flex flex-col h-full">
                    
                    {/* Header */}
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="font-bold text-lg text-slate-900">{policy.customer?.phone}</h3>
                        <p className="text-xs text-slate-500 font-mono mt-0.5">{policy.policy_number}</p>
                      </div>
                      <span className="inline-flex px-2 py-1 rounded-md text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                        {policy.insurance_type}
                      </span>
                    </div>

                    {/* Middle */}
                    <div className="flex-1 flex flex-col justify-center items-center py-6 border-t border-b border-slate-100 mb-5">
                      {policy.daysLeft <= 7 ? (
                        <div className="inline-flex flex-col items-center justify-center w-24 h-24 rounded-full bg-red-50 border-4 border-red-100 text-red-700 shadow-[0_0_20px_rgba(239,68,68,0.3)] relative">
                          <span className="absolute top-1 right-1 w-3 h-3 rounded-full bg-red-500 animate-pulse border-2 border-white"></span>
                          <span className="text-3xl font-black leading-none">{policy.daysLeft}</span>
                          <span className="text-[10px] font-bold uppercase tracking-wider mt-1">Gün Kaldı</span>
                        </div>
                      ) : (
                        <div className="inline-flex flex-col items-center justify-center w-24 h-24 rounded-full bg-yellow-50 border-4 border-yellow-100 text-yellow-700">
                          <span className="text-3xl font-black leading-none">{policy.daysLeft}</span>
                          <span className="text-[10px] font-bold uppercase tracking-wider mt-1">Gün Kaldı</span>
                        </div>
                      )}
                      <p className="text-xs text-slate-500 mt-4 font-medium">
                        Bitiş: {new Date(policy.end_date).toLocaleDateString('tr-TR')}
                      </p>
                    </div>

                    {/* Footer */}
                    <div className="mt-auto">
                      <button 
                        onClick={() => window.open(`https://wa.me/${formatWaPhone(policy.customer?.phone)}?text=Merhaba, sigorta poliçenizin süresi dolmak üzere. Yenileme için yardımcı olabilir miyim?`, '_blank')}
                        className="w-full py-3 bg-slate-900 text-white hover:bg-slate-800 font-bold text-xs rounded-xl shadow-sm transition-colors"
                      >
                        Yenileme Mesajı At
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'renewals' && renewals.length === 0 && !loading && (
              <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-500">
                Yaklaşan yenileme fırsatı bulunmuyor.
              </div>
            )}
            
            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-8 pb-4">
                <button 
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-700 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50 transition-colors"
                >
                  Önceki
                </button>
                <div className="flex items-center gap-1 px-2">
                  {[...Array(totalPages)].map((_, i) => (
                    <button
                      key={i + 1}
                      onClick={() => setCurrentPage(i + 1)}
                      className={`w-8 h-8 flex items-center justify-center rounded-lg text-sm font-medium transition-colors ${currentPage === i + 1 ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'}`}
                    >
                      {i + 1}
                    </button>
                  ))}
                </div>
                <button 
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-700 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50 transition-colors"
                >
                  Sonraki
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Satış Modalı */}
      <Dialog open={!!selectedLeadId} onOpenChange={() => setSelectedLeadId(null)}>
        <DialogContent className="bg-white sm:max-w-md p-6 rounded-2xl border border-slate-200 shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-slate-900">Satışı Tamamla (Poliçe Kes)</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreatePolicy} className="space-y-5 mt-4">
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-slate-700">Poliçe Numarası</label>
              <input name="policy_number" required placeholder="Örn: 123456789" className="w-full px-4 py-2 border border-slate-300 rounded-lg text-slate-900 bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none" />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-slate-700">Sigorta Şirketi</label>
              <input name="company_name" required placeholder="Örn: AXA, Allianz, Anadolu" className="w-full px-4 py-2 border border-slate-300 rounded-lg text-slate-900 bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none" />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-slate-700">Prim Tutarı (TL)</label>
              <input name="premium_amount" type="text" inputMode="decimal" required placeholder="Örn: 5.000,00" value={policyPremium} onChange={e => setPolicyPremium(formatPremium(e.target.value))} className="w-full px-4 py-2 border border-slate-300 rounded-lg text-slate-900 bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none" />
            </div>
            <div className="space-y-1.5 bg-slate-50 p-3 rounded-lg border border-slate-200 border-dashed">
              <label className="text-sm font-semibold text-slate-700">Poliçe Dosyası (PDF / JPG)</label>
              <input type="file" name="policy_file" accept=".pdf,image/jpeg,image/png" className="w-full text-sm text-slate-500 file:mr-4 file:py-1.5 file:px-4 file:rounded-md file:border-0 file:text-xs file:font-bold file:bg-blue-100 file:text-blue-700 hover:file:bg-blue-200 transition-colors cursor-pointer" />
              <p className="text-[10px] text-slate-400 font-medium pt-1">Gelecekte Supabase Storage ile direkt buluta yedeklenecek.</p>
            </div>
            <button type="submit" className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-md transition-colors mt-2">
              Satışı Onayla ve Kaydet
            </button>
          </form>
        </DialogContent>
      </Dialog>

      {/* Teklif Modalı */}
      <Dialog open={!!quoteModalLeadId} onOpenChange={() => setQuoteModalLeadId(null)}>
        <DialogContent className="bg-white sm:max-w-md p-6 rounded-2xl border border-slate-200 shadow-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-slate-900">Teklifler</DialogTitle>
          </DialogHeader>
          
          <div className="mt-2 space-y-6">
            {/* Yeni Teklif Yükleme Formu */}
            <form onSubmit={handleUploadQuote} className="space-y-4 bg-slate-50 p-4 rounded-xl border border-slate-200 border-dashed">
              <h4 className="text-sm font-bold text-slate-800">Yeni Teklif Ekle</h4>
              
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700">Sigorta Şirketi</label>
                <input name="company_name" required placeholder="Örn: Allianz" className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-sm text-slate-900 bg-white focus:ring-2 focus:ring-blue-500 outline-none" />
              </div>
              
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700">Prim Tutarı (TL)</label>
                <input name="premium_display" type="text" inputMode="decimal" required placeholder="Örn: 5.000,00" value={quotePremium} onChange={e => setQuotePremium(formatPremium(e.target.value))} className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-sm text-slate-900 bg-white focus:ring-2 focus:ring-blue-500 outline-none" />
              </div>
              
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700">Teklif Dosyası (PDF)</label>
                <input type="file" name="file" accept=".pdf" required className="w-full text-xs text-slate-500 file:mr-3 file:py-1 file:px-3 file:rounded file:border-0 file:text-xs file:font-bold file:bg-blue-100 file:text-blue-700 hover:file:bg-blue-200 cursor-pointer" />
              </div>

              <button type="submit" disabled={isUploadingQuote} className="w-full py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-bold text-sm rounded-lg shadow-sm transition-colors">
                {isUploadingQuote ? 'Yükleniyor...' : 'Teklifi Kaydet'}
              </button>
            </form>

            {/* Mevcut Teklifler */}
            <div>
              <h4 className="text-sm font-bold text-slate-800 mb-3 border-b border-slate-100 pb-2">Müşteriye İletilen Teklifler</h4>
              {leadQuotes.length === 0 ? (
                <p className="text-xs text-slate-500 text-center py-4">Henüz bir teklif kaydedilmemiş.</p>
              ) : (
                <div className="space-y-2">
                  {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                  {leadQuotes.map((q: any) => (
                    <div key={q.id} className="flex items-center justify-between p-3 bg-white border border-slate-200 rounded-lg shadow-sm hover:border-blue-300 transition-colors">
                      <div className="flex flex-col">
                        <span className="font-bold text-sm text-slate-900">{q.company_name}</span>
                        <span className="text-xs text-slate-500">{new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(q.premium)}</span>
                        <span className="text-[10px] text-slate-400 mt-1">{new Date(q.created_at).toLocaleString('tr-TR')}</span>
                      </div>
                      <a 
                        href={`/api/v1/quotes/${q.id}/download`} 
                        download={q.file_name}
                        className="px-3 py-1.5 bg-slate-100 text-slate-700 hover:bg-slate-200 text-xs font-bold rounded-md transition-colors"
                      >
                        İndir (PDF)
                      </a>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

    </div>
  );
}
