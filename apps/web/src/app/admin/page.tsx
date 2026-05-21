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
        premium_amount: parseFloat(formData.get("premium_amount") as string),
        start_date: new Date().toISOString(),
        end_date: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString(),
        document_url,
        mime_type,
        file_size,
      })
    });
    
    window.location.reload();
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const filteredLeads = leads.filter((l: any) => 
    l.customer?.phone?.includes(search) || 
    l.tracking_id.toLowerCase().includes(search.toLowerCase()) ||
    l.customer?.full_name?.toLowerCase().includes(search.toLowerCase())
  );

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const renewals = policies.map((p: any) => {
    const days = Math.floor((new Date(p.end_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
    return { ...p, daysLeft: days };
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  }).filter((p: any) => p.daysLeft >= 0 && p.daysLeft <= 30).sort((a: any, b: any) => a.daysLeft - b.daysLeft);

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

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider border-b border-slate-200">
                  {activeTab === 'leads' ? (
                    <>
                      <th className="px-6 py-4 font-semibold">Müşteri</th>
                      <th className="px-6 py-4 font-semibold">Tarih / ID</th>
                      <th className="px-6 py-4 font-semibold">Sigorta Türü</th>
                      <th className="px-6 py-4 font-semibold">Durum</th>
                      <th className="px-6 py-4 font-semibold text-right">Aksiyonlar</th>
                    </>
                  ) : (
                    <>
                      <th className="px-6 py-4 font-semibold">Müşteri</th>
                      <th className="px-6 py-4 font-semibold">Poliçe Tipi</th>
                      <th className="px-6 py-4 font-semibold">Bitiş Tarihi</th>
                      <th className="px-6 py-4 font-semibold">Kalan Gün</th>
                      <th className="px-6 py-4 font-semibold text-right">Aksiyon</th>
                    </>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                
                {/* LEADS TABLO İÇERİĞİ */}
                {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                {activeTab === 'leads' && filteredLeads.map((lead: any) => (
                  <tr key={lead.id} className="hover:bg-slate-50/80 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="font-semibold text-slate-900">{lead.customer?.phone || "İsimsiz Müşteri"}</div>
                      <div className="text-xs text-slate-500 mt-1">{lead.lead_source || 'Organik Web'}</div>
                      {lead.dynamic_fields && Object.keys(lead.dynamic_fields).length > 0 && (
                        <div className="text-xs font-mono text-slate-500 mt-1.5 flex flex-col gap-0.5 border-t border-slate-100 pt-1.5">
                          {lead.dynamic_fields.tc_no && <span>TC: {lead.dynamic_fields.tc_no}</span>}
                          {lead.dynamic_fields.plate && <span>Plaka: {lead.dynamic_fields.plate}</span>}
                          {lead.dynamic_fields.city && <span>Şehir: {lead.dynamic_fields.city}</span>}
                          {lead.dynamic_fields.ageGroup && <span>Yaş: {lead.dynamic_fields.ageGroup}</span>}
                          {lead.dynamic_fields.sector && <span>Sektör: {lead.dynamic_fields.sector}</span>}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-slate-700">{new Date(lead.created_at).toLocaleDateString('tr-TR')}</div>
                      <div className="text-xs font-mono text-slate-400 mt-1">{lead.tracking_id}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex px-2.5 py-1 rounded-md text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-100">
                        {lead.insurance_type}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-2.5 py-1 rounded-md text-xs font-bold ${
                        lead.status === 'NEW' ? 'bg-orange-100 text-orange-700' :
                        lead.status === 'CONTACTED' ? 'bg-purple-100 text-purple-700' :
                        lead.status === 'QUOTE_SENT' ? 'bg-yellow-100 text-yellow-700' :
                        lead.status === 'SOLD' ? 'bg-green-100 text-green-700' :
                        'bg-slate-100 text-slate-700'
                      }`}>
                        {lead.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-100 lg:opacity-60 group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={() => window.open(`https://wa.me/${formatWaPhone(lead.customer?.phone)}`, '_blank')}
                          className="px-3 py-1.5 bg-[#25D366]/10 text-[#25D366] hover:bg-[#25D366]/20 font-medium text-xs rounded-lg transition-colors"
                        >
                          WP&apos;dan Yaz
                        </button>
                        <button 
                          onClick={() => handleUpdateStatus(lead.id, 'CONTACTED')}
                          className="px-3 py-1.5 bg-slate-100 text-slate-700 hover:bg-slate-200 font-medium text-xs rounded-lg transition-colors"
                        >
                          Arandı
                        </button>
                        <button 
                          onClick={() => handleUpdateStatus(lead.id, 'QUOTE_SENT')}
                          className="px-3 py-1.5 bg-slate-100 text-slate-700 hover:bg-slate-200 font-medium text-xs rounded-lg transition-colors"
                        >
                          Teklif
                        </button>
                        <button 
                          onClick={() => setSelectedLeadId(lead.id)}
                          className="px-3 py-1.5 bg-blue-600 text-white hover:bg-blue-700 font-medium text-xs rounded-lg shadow-sm transition-colors"
                        >
                          Satıldı
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}

                {activeTab === 'leads' && filteredLeads.length === 0 && !loading && (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                      Hiç talep bulunmuyor veya arama sonucu boş.
                    </td>
                  </tr>
                )}

                {/* RENEWALS TABLO İÇERİĞİ */}
                {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                {activeTab === 'renewals' && renewals.map((policy: any) => (
                  <tr key={policy.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-semibold text-slate-900">{policy.customer?.phone}</div>
                      <div className="text-xs text-slate-500 mt-1">{policy.policy_number}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex px-2.5 py-1 rounded-md text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                        {policy.insurance_type}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-slate-700">{new Date(policy.end_date).toLocaleDateString('tr-TR')}</div>
                    </td>
                    <td className="px-6 py-4">
                      {policy.daysLeft <= 7 ? (
                        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-red-50 border border-red-200 text-red-700 font-bold text-xs shadow-[0_0_15px_rgba(239,68,68,0.4)]">
                          <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
                          {policy.daysLeft} Gün Kaldı (Acil)
                        </div>
                      ) : (
                        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-yellow-50 border border-yellow-200 text-yellow-700 font-bold text-xs">
                          {policy.daysLeft} Gün Kaldı
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button 
                        onClick={() => window.open(`https://wa.me/${formatWaPhone(policy.customer?.phone)}?text=Merhaba, sigorta poliçenizin süresi dolmak üzere. Yenileme için yardımcı olabilir miyim?`, '_blank')}
                        className="px-4 py-2 bg-slate-900 text-white hover:bg-slate-800 font-medium text-xs rounded-lg shadow-sm transition-colors"
                      >
                        Yenileme Mesajı At
                      </button>
                    </td>
                  </tr>
                ))}

                {activeTab === 'renewals' && renewals.length === 0 && !loading && (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                      Yaklaşan yenileme fırsatı bulunmuyor.
                    </td>
                  </tr>
                )}

              </tbody>
            </table>
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
              <input name="policy_number" required placeholder="Örn: 123456789" className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none" />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-slate-700">Sigorta Şirketi</label>
              <input name="company_name" required placeholder="Örn: AXA, Allianz, Anadolu" className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none" />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-slate-700">Prim Tutarı (TL)</label>
              <input name="premium_amount" type="number" required placeholder="Örn: 5000" className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none" />
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

    </div>
  );
}
