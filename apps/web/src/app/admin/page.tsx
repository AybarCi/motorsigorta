"use client";

import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
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
  const [activeTab, setActiveTab] = useState<'leads' | 'renewals' | 'archived'>('leads');
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
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [editingQuote, setEditingQuote] = useState<any | null>(null);
  const [policyPremium, setPolicyPremium] = useState("");
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [historyModalLead, setHistoryModalLead] = useState<any | null>(null);

  // Toast notifications state
  const [toasts, setToasts] = useState<{ id: string; message: string; type: 'success' | 'error' | 'info' }[]>([]);
  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    const id = Math.random().toString();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  };

  // Custom Confirmation Modal state
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    variant: 'danger' | 'warning' | 'info';
    onConfirm: () => void | Promise<void>;
  }>({
    isOpen: false,
    title: "",
    message: "",
    variant: "info",
    onConfirm: () => {},
  });
  const showConfirm = (
    title: string, 
    message: string, 
    onConfirm: () => void | Promise<void>,
    variant: 'danger' | 'warning' | 'info' = 'info'
  ) => {
    setConfirmModal({
      isOpen: true,
      title,
      message,
      variant,
      onConfirm: async () => {
        await onConfirm();
        setConfirmModal(prev => ({ ...prev, isOpen: false }));
      }
    });
  };

  // Custom Prompt Modal state for the WhatsApp Failure Reason
  const [promptModal, setPromptModal] = useState<{
    isOpen: boolean;
    title: string;
    defaultValue: string;
    onConfirm: (val: string) => void | Promise<void>;
  }>({
    isOpen: false,
    title: "",
    defaultValue: "",
    onConfirm: () => {},
  });
  const showPrompt = (title: string, defaultValue: string, onConfirm: (val: string) => void | Promise<void>) => {
    setPromptModal({
      isOpen: true,
      title,
      defaultValue,
      onConfirm: async (val) => {
        await onConfirm(val);
        setPromptModal(prev => ({ ...prev, isOpen: false }));
      }
    });
  };

  // Manuel Talep Ekleme State'leri
  const [isEditLeadOpen, setIsEditLeadOpen] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [editingLead, setEditingLead] = useState<any | null>(null);
  const [isSavingLead, setIsSavingLead] = useState(false);
  const [editTravelCitizenship, setEditTravelCitizenship] = useState("tc");
  const [editHasPreviousPolicy, setEditHasPreviousPolicy] = useState("no");
  const [editHealthInsuredFor, setEditHealthInsuredFor] = useState("myself");
  const [editHealthPlanType, setEditHealthPlanType] = useState("inpatient_only");
  const [editHealthPolicyStatus, setEditHealthPolicyStatus] = useState("new_policy");
  const [isCreateLeadOpen, setIsCreateLeadOpen] = useState(false);
  const [manualCategory, setManualCategory] = useState("vehicle");
  const [manualType, setManualType] = useState("TRAFFIC");
  const [isCreatingLead, setIsCreatingLead] = useState(false);
  const [manualHasPreviousPolicy, setManualHasPreviousPolicy] = useState("no");
  const [manualHealthInsuredFor, setManualHealthInsuredFor] = useState("myself");
  const [manualHealthPlanType, setManualHealthPlanType] = useState("inpatient_only");
  const [manualHealthPolicyStatus, setManualHealthPolicyStatus] = useState("new_policy");

  // Seyahat Sağlık Sigortası State'leri
  const [manualTravelCitizenship, setManualTravelCitizenship] = useState("tc");
  const [manualTravelPassportNo, setManualTravelPassportNo] = useState("");
  const [manualTravelNationality, setManualTravelNationality] = useState("");
  const [manualTravelBirthDate, setManualTravelBirthDate] = useState("");
  const [manualTravelBirthPlace, setManualTravelBirthPlace] = useState("");
  const [manualTravelGender, setManualTravelGender] = useState("male");
  const [manualTravelAddress, setManualTravelAddress] = useState("");
  const [manualTravelDepartureDate, setManualTravelDepartureDate] = useState("");
  const [manualTravelReturnDate, setManualTravelReturnDate] = useState("");
  const [manualTravelReason, setManualTravelReason] = useState("Turistik Gezi");
  const [manualTravelRegion, setManualTravelRegion] = useState("Avrupa Schengen");
  const [manualTravelCountry, setManualTravelCountry] = useState("");

  const insuranceCategories = [
    { id: "vehicle", label: "Araç Sigortaları" },
    { id: "home", label: "Ev & Konut" },
    { id: "health", label: "Sağlık" },
    { id: "business", label: "Kurumsal" },
  ];

  const insuranceTypes = [
    { id: "TRAFFIC", category: "vehicle", label: "Trafik Sigortası" },
    { id: "KASKO", category: "vehicle", label: "Genişletilmiş Kasko" },
    { id: "MOTORCYCLE", category: "vehicle", label: "Motosiklet Sigortası" },
    { id: "DASK", category: "home", label: "Zorunlu Deprem (DASK)" },
    { id: "HOME_CONTENT", category: "home", label: "Ev & Eşya Sigortası" },
    { id: "FIRE", category: "home", label: "Ev Yangın Sigortası" },
    { id: "HEALTH", category: "health", label: "Özel & Tamamlayıcı Sağlık" },
    { id: "PET", category: "health", label: "Evcil Hayvan Sigortası" },
    { id: "TRAVEL", category: "health", label: "Seyahat Sağlık Sigortası" },
    { id: "BUSINESS", category: "business", label: "İş Yeri & Fabrika" },
    { id: "FIRE", category: "business", label: "İş Yeri Yangın Sigortası" },
  ];

  const handleCategoryChange = (catId: string) => {
    setManualCategory(catId);
    const firstType = insuranceTypes.find(t => t.category === catId);
    if (firstType) {
      setManualType(firstType.id);
    }
    setManualHasPreviousPolicy("no");
    setManualHealthInsuredFor("myself");
    setManualHealthPlanType("inpatient_only");
    setManualHealthPolicyStatus("new_policy");
  };

  const handleCreateLead = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsCreatingLead(true);

    const formData = new FormData(e.currentTarget);
    const phone = formData.get("phone") as string;
    const full_name = formData.get("full_name") as string;
    const lead_source = formData.get("lead_source") as string;

    const dynamic_fields: Record<string, string> = {};
    if (manualCategory === "vehicle") {
      dynamic_fields.plate = (formData.get("plate") as string)?.toUpperCase();
      dynamic_fields.tc_no = formData.get("tc_no") as string;
      dynamic_fields.document_no = (formData.get("document_no") as string)?.toUpperCase();
    } else if (manualCategory === "home") {
      dynamic_fields.city = formData.get("city") as string;
      if (["DASK", "HOME_CONTENT"].includes(manualType)) {
        dynamic_fields.tc_no = formData.get("tc_no") as string;
        dynamic_fields.has_previous_policy = manualHasPreviousPolicy;
        if (manualHasPreviousPolicy === "yes") {
          dynamic_fields.previous_policy_number = formData.get("previous_policy_number") as string;
        }
      }
    } else if (manualCategory === "health") {
      dynamic_fields.ageGroup = formData.get("ageGroup") as string;
      if (manualType === "HEALTH") {
        dynamic_fields.tc_no = formData.get("tc_no") as string;
        dynamic_fields.health_insured_for = manualHealthInsuredFor;
        dynamic_fields.health_plan_type = manualHealthPlanType;
        dynamic_fields.health_policy_status = manualHealthPolicyStatus;
      } else if (manualType === "TRAVEL") {
        dynamic_fields.travel_citizenship = manualTravelCitizenship;
        dynamic_fields.full_name = full_name; // Sync main full_name field
        if (manualTravelCitizenship === "tc") {
          dynamic_fields.tc_no = formData.get("tc_no") as string;
        } else {
          dynamic_fields.passport_no = manualTravelPassportNo;
          dynamic_fields.nationality = manualTravelNationality;
          dynamic_fields.birth_date = manualTravelBirthDate;
          dynamic_fields.birth_place = manualTravelBirthPlace;
          dynamic_fields.gender = manualTravelGender;
          dynamic_fields.address = manualTravelAddress;
        }
        dynamic_fields.departure_date = manualTravelDepartureDate;
        dynamic_fields.return_date = manualTravelReturnDate;
        dynamic_fields.travel_reason = manualTravelReason;
        dynamic_fields.travel_region = manualTravelRegion;
        dynamic_fields.travel_country = manualTravelCountry;
      }
    } else if (manualCategory === "business") {
      dynamic_fields.sector = formData.get("sector") as string;
    }

    try {
      const res = await fetch("/api/v1/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phone,
          full_name,
          insurance_category: manualCategory,
          insurance_type: manualType,
          lead_source,
          dynamic_fields,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setIsCreateLeadOpen(false);
        showToast("Yeni talep başarıyla manuel olarak oluşturuldu!");
        // Refresh page or update local state smoothly
        setTimeout(() => window.location.reload(), 1500);
      } else {
        showToast("Talep oluşturulamadı: " + data.error, "error");
      }
    } catch (err) {
      console.error(err);
      showToast("Bir hata oluştu.", "error");
    } finally {
      setIsCreatingLead(false);
    }
  };
 
  const handleEditLead = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editingLead) return;
    setIsSavingLead(true);

    const formData = new FormData(e.currentTarget);
    const full_name = formData.get("full_name") as string;
    const phone = formData.get("phone") as string;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const dynamic_fields: Record<string, any> = { ...editingLead.dynamic_fields };
    
    const category = editingLead.insurance_category;
    const type = editingLead.insurance_type;

    if (category === "vehicle") {
      dynamic_fields.plate = (formData.get("plate") as string)?.toUpperCase();
      dynamic_fields.tc_no = formData.get("tc_no") as string;
      dynamic_fields.document_no = (formData.get("document_no") as string)?.toUpperCase();
    } else if (category === "home") {
      dynamic_fields.city = formData.get("city") as string;
      if (["DASK", "HOME_CONTENT"].includes(type)) {
        dynamic_fields.tc_no = formData.get("tc_no") as string;
        dynamic_fields.has_previous_policy = editHasPreviousPolicy;
        if (editHasPreviousPolicy === "yes") {
          dynamic_fields.previous_policy_number = formData.get("previous_policy_number") as string;
        } else {
          delete dynamic_fields.previous_policy_number;
        }
      }
    } else if (category === "health") {
      if (type === "HEALTH") {
        dynamic_fields.ageGroup = formData.get("ageGroup") as string;
        dynamic_fields.tc_no = formData.get("tc_no") as string;
        dynamic_fields.health_insured_for = editHealthInsuredFor;
        dynamic_fields.health_plan_type = editHealthPlanType;
        dynamic_fields.health_policy_status = editHealthPolicyStatus;
      } else if (type === "TRAVEL") {
        dynamic_fields.travel_citizenship = editTravelCitizenship;
        if (editTravelCitizenship === "tc") {
          dynamic_fields.tc_no = formData.get("tc_no") as string;
          delete dynamic_fields.passport_no;
          delete dynamic_fields.nationality;
          delete dynamic_fields.birth_date;
          delete dynamic_fields.birth_place;
          delete dynamic_fields.gender;
          delete dynamic_fields.address;
        } else {
          dynamic_fields.passport_no = formData.get("passport_no") as string;
          dynamic_fields.nationality = formData.get("nationality") as string;
          dynamic_fields.birth_date = formData.get("birth_date") as string;
          dynamic_fields.birth_place = formData.get("birth_place") as string;
          dynamic_fields.gender = formData.get("gender") as string;
          dynamic_fields.address = formData.get("address") as string;
          delete dynamic_fields.tc_no;
        }
        dynamic_fields.departure_date = formData.get("departure_date") as string;
        dynamic_fields.return_date = formData.get("return_date") as string;
        dynamic_fields.travel_reason = formData.get("travel_reason") as string;
        dynamic_fields.travel_region = formData.get("travel_region") as string;
        dynamic_fields.travel_country = formData.get("travel_country") as string;
      } else {
        dynamic_fields.ageGroup = formData.get("ageGroup") as string;
      }
    } else if (category === "business") {
      dynamic_fields.sector = formData.get("sector") as string;
    }

    try {
      const res = await fetch(`/api/v1/leads/${editingLead.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          full_name,
          phone,
          dynamic_fields,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setIsEditLeadOpen(false);
        showToast("Talep bilgileri başarıyla güncellendi!");
        
        // Update local state without reload
        setLeads(prev => prev.map(l => l.id === editingLead.id ? {
          ...l,
          customer: {
            ...l.customer,
            full_name,
            phone,
          },
          dynamic_fields,
        } : l));
        
        setEditingLead(null);
      } else {
        showToast("Güncelleme başarısız: " + data.error, "error");
      }
    } catch (err) {
      console.error(err);
      showToast("Bir hata oluştu.", "error");
    } finally {
      setIsSavingLead(false);
    }
  };

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

  const thisMonthLeads = leads.filter(l => !l.is_archived && new Date(l.created_at).getMonth() === new Date().getMonth()).length;
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
        showToast("Dosya yüklenemedi. Lütfen Supabase Storage Bucket yapılandırmasını kontrol edin.", "error");
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
     
    showToast("Poliçe başarıyla kesildi ve sisteme işlendi!");
    setTimeout(() => window.location.reload(), 1500);
  };
 
  const openQuoteModal = async (leadId: string) => {
    setQuoteModalLeadId(leadId);
    setLeadQuotes([]);
    setEditingQuote(null);
    setQuotePremium("");
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
      const url = editingQuote 
        ? `/api/v1/quotes/${editingQuote.id}` 
        : `/api/v1/leads/${quoteModalLeadId}/quotes`;
      const method = editingQuote ? "PATCH" : "POST";
 
      const res = await fetch(url, {
        method,
        body: formData,
      });
      const data = await res.json();
      if(data.success) {
        if (editingQuote) {
          setLeadQuotes(leadQuotes.map(q => q.id === editingQuote.id ? data.data : q));
          setEditingQuote(null);
          showToast("Teklif başarıyla güncellendi!");
        } else {
          setLeadQuotes([data.data, ...leadQuotes]);
          showToast("Teklif başarıyla kaydedildi!");
           
          // Automatically update lead status in local state to QUOTE_SENT
          setLeads(prev => prev.map(l => l.id === quoteModalLeadId ? {
            ...l,
            status: 'QUOTE_SENT'
          } : l));
        }
        setQuotePremium("");
        (e.target as HTMLFormElement).reset();
         
        const customerName = formData.get("customer_full_name") as string;
        if (customerName) {
          setLeads(prev => prev.map(l => l.id === quoteModalLeadId ? {
            ...l,
            customer: { ...l.customer, full_name: customerName }
          } : l));
        }
      } else {
        showToast("Teklif kaydedilemedi: " + data.error, "error");
      }
    } catch(err) {
      console.error(err);
      showToast("Bir hata oluştu.", "error");
    } finally {
      setIsUploadingQuote(false);
    }
  };

  const handleDeleteQuote = async (quoteId: string) => {
    showConfirm(
      "Teklifi Sil",
      "Bu teklif alternatifini kalıcı olarak silmek istediğinize emin misiniz?",
      async () => {
        try {
          const res = await fetch(`/api/v1/quotes/${quoteId}`, { method: 'DELETE' });
          const data = await res.json();
          if (data.success) {
            setLeadQuotes(prev => prev.filter(q => q.id !== quoteId));
            showToast("Teklif başarıyla silindi.");
          } else {
            showToast("Teklif silinemedi.", "error");
          }
        } catch (err) {
          console.error(err);
          showToast("Bir hata oluştu.", "error");
        }
      },
      "danger"
    );
  };

  const handleShareQuotesWhatsApp = () => {
    if (!quoteModalLeadId || leadQuotes.length === 0) return;
    const currentLead = leads.find(l => l.id === quoteModalLeadId);
    if (!currentLead) return;

    const customerName = currentLead.customer?.full_name || "Değerli Müşterimiz";
    const customerPhone = currentLead.customer?.phone;
    const trackingId = currentLead.tracking_id;
    const typeLabel = insuranceTypes.find(t => t.id === currentLead.insurance_type)?.label || "Sigorta Teklifi";

    let message = `Merhaba *${customerName}*,\n\n`;
    message += `*Sigomax* üzerinden iletmiş olduğunuz *${typeLabel}* talebiniz (*#${trackingId}*) için hazırladığımız en uygun teklif alternatifleri aşağıda yer almaktadır:\n\n`;

    const sortedQuotes = [...leadQuotes].sort((a, b) => a.premium - b.premium);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    sortedQuotes.forEach((q: any, index: number) => {
      message += `*${index + 1}. Teklif Alternatifi*\n`;
      message += `🏢 *Şirket:* ${q.company_name}\n`;
      message += `💵 *Prim Tutarı:* ${new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(q.premium)}\n`;
      if (q.installments) {
        message += `💳 *Ödeme:* ${q.installments}\n`;
      }
      if (q.notes) {
        message += `📝 *Not/Uyarı:* ${q.notes}\n`;
      }
      message += `----------------------------------\n\n`;
    });

    message += `Sizin için en uygun teklifi onaylamak veya detayları görüşmek için bu mesaj üzerinden bizimle iletişime geçebilirsiniz.\n\n`;
    message += `*Sigomax* ailesi olarak iyi günler dileriz! 😊`;

    const encodedText = encodeURIComponent(message);
    const waUrl = `https://wa.me/${formatWaPhone(customerPhone)}?text=${encodedText}`;
    window.open(waUrl, '_blank');

    // Automatically update lead status to QUOTE_SENT on backend and frontend if not already SOLD
    if (currentLead.status !== 'SOLD' && currentLead.status !== 'QUOTE_SENT') {
      fetch(`/api/v1/leads/${quoteModalLeadId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "QUOTE_SENT" }),
      })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setLeads(prev => prev.map(l => l.id === quoteModalLeadId ? {
            ...l,
            status: 'QUOTE_SENT'
          } : l));
        }
      })
      .catch(err => console.error("Error updating status on share:", err));
    }
  };


  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const filteredLeads = leads.filter((l: any) => {
    const matchTab = activeTab === 'archived' ? l.is_archived : !l.is_archived;
    if (!matchTab) return false;

    const searchLower = search.toLowerCase();
    const plate = l.dynamic_fields?.plate?.toLowerCase() || "";
    const tcNo = l.dynamic_fields?.tc_no || "";

    return (
      l.customer?.phone?.includes(search) || 
      l.tracking_id.toLowerCase().includes(searchLower) ||
      l.customer?.full_name?.toLowerCase().includes(searchLower) ||
      plate.includes(searchLower) ||
      tcNo.includes(search)
    );
  });

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

  const totalPages = activeTab === 'renewals' ? totalRenewalsPages : totalLeadsPages;

  const statusCounts = {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    NEW: leads.filter((l: any) => !l.is_archived && l.status === 'NEW').length,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    CONTACTED: leads.filter((l: any) => !l.is_archived && l.status === 'CONTACTED').length,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    QUOTE_SENT: leads.filter((l: any) => !l.is_archived && l.status === 'QUOTE_SENT').length,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    SOLD: leads.filter((l: any) => !l.is_archived && l.status === 'SOLD').length,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    LOST: leads.filter((l: any) => !l.is_archived && l.status === 'LOST').length,
  };

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
            <button 
              onClick={() => setActiveTab('archived')}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${activeTab === 'archived' ? 'bg-white shadow-sm text-blue-700' : 'text-slate-500 hover:text-slate-700'}`}
            >
              Arşivlenenler
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

        {/* Lead Status Adetleri Widgets */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-center relative overflow-hidden group hover:shadow-md hover:-translate-y-0.5 transition-all">
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-orange-500"></div>
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Yeni Başvuru</span>
            <span className="text-3xl font-black text-orange-600 mt-2">{statusCounts.NEW}</span>
          </div>
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-center relative overflow-hidden group hover:shadow-md hover:-translate-y-0.5 transition-all">
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-purple-500"></div>
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">İletişimde (Arandı)</span>
            <span className="text-3xl font-black text-purple-600 mt-2">{statusCounts.CONTACTED}</span>
          </div>
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-center relative overflow-hidden group hover:shadow-md hover:-translate-y-0.5 transition-all">
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-amber-500"></div>
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Teklif İletildi</span>
            <span className="text-3xl font-black text-amber-600 mt-2">{statusCounts.QUOTE_SENT}</span>
          </div>
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-center relative overflow-hidden group hover:shadow-md hover:-translate-y-0.5 transition-all">
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-emerald-500"></div>
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Poliçe Kesildi</span>
            <span className="text-3xl font-black text-emerald-600 mt-2">{statusCounts.SOLD}</span>
          </div>
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-center relative overflow-hidden group hover:shadow-md hover:-translate-y-0.5 transition-all">
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-rose-500"></div>
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Kaybedildi</span>
            <span className="text-3xl font-black text-rose-600 mt-2">{statusCounts.LOST}</span>
          </div>
        </div>

        {/* Content Area */}
        <div className="bg-white border border-slate-200 shadow-sm rounded-2xl overflow-hidden">
          
          <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
            <h2 className="text-lg font-bold text-slate-800">
              {activeTab === 'leads' ? 'Aktif Talepler' : activeTab === 'archived' ? 'Arşivlenmiş Talepler' : 'Yenileme Radarı'}
            </h2>
            {(activeTab === 'leads' || activeTab === 'archived') && (
              <div className="flex items-center gap-3">
                <input 
                  type="text"
                  placeholder="Telefon, Plaka veya TRK ID ara..." 
                  className="px-4 py-2 bg-white border border-slate-300 rounded-lg text-sm w-72 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                />
                {activeTab === 'leads' && (
                  <button
                    onClick={() => setIsCreateLeadOpen(true)}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-lg shadow-sm transition-colors"
                  >
                    Yeni Talep Ekle
                  </button>
                )}
              </div>
            )}
          </div>

          <div className="mt-4">
            {/* LEADS KARTLARI */}
            {(activeTab === 'leads' || activeTab === 'archived') && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 p-6">
                {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                {paginatedLeads.map((lead: any) => {
                  const allCustomerLeads = leads.filter((other) => 
                    other.id !== lead.id && 
                    other.customer?.phone === lead.customer?.phone
                  );
                  
                  // Same branch active duplicates (e.g. TRAFFIC & TRAFFIC that are not sold/lost)
                  const duplicateSameBranch = allCustomerLeads.filter((other) => 
                    other.insurance_type === lead.insurance_type &&
                    other.status !== 'SOLD' && other.status !== 'LOST'
                  );

                  // Different branch requests (cross-sell potential)
                  const otherBranchLeads = allCustomerLeads.filter((other) => 
                    other.insurance_type !== lead.insurance_type
                  );

                  return (
                    <div key={lead.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 hover:shadow-md transition-all hover:scale-[1.01] flex flex-col h-full relative group">
                    
                    {/* Header: Phone & Status */}
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="font-bold text-lg text-slate-900">{lead.customer?.full_name || "İsimsiz Müşteri"}</h3>
                        <p className="text-xs text-slate-500 mt-0.5 font-medium">{formatWaPhone(lead.customer?.phone).replace(/^90/, '0')} • {lead.lead_source || 'Organik Web'}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`inline-flex px-2 py-1 rounded-md text-[10px] uppercase font-bold tracking-wider ${
                          lead.status === 'NEW' ? 'bg-orange-100 text-orange-700' :
                          lead.status === 'CONTACTED' ? 'bg-purple-100 text-purple-700' :
                          lead.status === 'QUOTE_SENT' ? 'bg-yellow-100 text-yellow-700' :
                          lead.status === 'SOLD' ? 'bg-green-100 text-green-700' :
                          'bg-slate-100 text-slate-700'
                        }`}>
                          {lead.status}
                        </span>
                        
                        <button
                          onClick={() => {
                            setEditingLead(lead);
                            setEditTravelCitizenship(lead.dynamic_fields?.travel_citizenship || "tc");
                            setEditHasPreviousPolicy(lead.dynamic_fields?.has_previous_policy || "no");
                            setEditHealthInsuredFor(lead.dynamic_fields?.health_insured_for || "myself");
                            setEditHealthPlanType(lead.dynamic_fields?.health_plan_type || "inpatient_only");
                            setEditHealthPolicyStatus(lead.dynamic_fields?.health_policy_status || "new_policy");
                            setIsEditLeadOpen(true);
                          }}
                          className="p-1 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                          title="Talebi Düzenle"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-3.5 h-3.5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
                          </svg>
                        </button>

                        <button
                          onClick={() => {
                            showConfirm(
                              "Talebi Kalıcı Sil",
                              `Bu talebi (#${lead.tracking_id}) ve ilişkili tüm teklifleri KALICI olarak silmek istediğinize emin misiniz? Bu işlem geri alınamaz.`,
                              async () => {
                                try {
                                  const res = await fetch(`/api/v1/leads/${lead.id}`, {
                                    method: 'DELETE',
                                  });
                                  const data = await res.json();
                                  if (data.success) {
                                    setLeads(prev => prev.filter(item => item.id !== lead.id));
                                    showToast("Talep başarıyla kalıcı olarak silindi.");
                                  } else {
                                    showToast("Talep silinirken bir hata oluştu.", "error");
                                  }
                                } catch (err) {
                                  console.error(err);
                                  showToast("Bir hata oluştu.", "error");
                                }
                              },
                              "danger"
                            );
                          }}
                          className="p-1 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                          title="Talebi Kalıcı Sil"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-3.5 h-3.5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                          </svg>
                        </button>
                      </div>
                    </div>

                    {/* Akıllı Branş/Mükerrer Rozetleri */}
                    {(duplicateSameBranch.length > 0 || otherBranchLeads.length > 0) && (
                      <div className="mb-4 space-y-1.5">
                        {duplicateSameBranch.length > 0 && (
                          <div 
                            onClick={() => setHistoryModalLead(lead)}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 border border-amber-200 text-amber-800 text-[10px] font-bold rounded-lg cursor-pointer hover:bg-amber-100 transition-colors shadow-sm animate-pulse"
                          >
                            <span>⚠️</span>
                            <span>Mükerrer Başvuru ({duplicateSameBranch.length} - Aynı Branş)</span>
                          </div>
                        )}
                        {otherBranchLeads.length > 0 && (
                          <div 
                            onClick={() => setHistoryModalLead(lead)}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 border border-indigo-200 text-indigo-800 text-[10px] font-bold rounded-lg cursor-pointer hover:bg-indigo-100 transition-colors shadow-sm animate-pulse"
                          >
                            <span>🔄</span>
                            <span>Çapraz Fırsat ({otherBranchLeads.length} - Farklı Branş)</span>
                          </div>
                        )}
                      </div>
                    )}

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
                          {lead.dynamic_fields.document_no && <div className="text-xs text-slate-600"><span className="text-slate-400 font-medium">Belge No:</span><br/><span className="uppercase">{lead.dynamic_fields.document_no}</span></div>}
                          {lead.dynamic_fields.plate && <div className="text-xs text-slate-600"><span className="text-slate-400 font-medium">Plaka:</span><br/><span className="uppercase">{lead.dynamic_fields.plate}</span></div>}
                          {lead.dynamic_fields.city && <div className="text-xs text-slate-600"><span className="text-slate-400 font-medium">Şehir:</span><br/>{lead.dynamic_fields.city}</div>}
                          {lead.dynamic_fields.ageGroup && <div className="text-xs text-slate-600"><span className="text-slate-400 font-medium">Yaş:</span><br/>{lead.dynamic_fields.ageGroup}</div>}
                          {lead.dynamic_fields.sector && <div className="text-xs text-slate-600"><span className="text-slate-400 font-medium">Sektör:</span><br/>{lead.dynamic_fields.sector}</div>}
                          {lead.dynamic_fields.has_previous_policy && <div className="text-xs text-slate-600"><span className="text-slate-400 font-medium">Eski Poliçe:</span><br/>{lead.dynamic_fields.has_previous_policy === "yes" ? "Evet var" : "Hayır yok"}</div>}
                          {lead.dynamic_fields.previous_policy_number && <div className="text-xs text-slate-600"><span className="text-slate-400 font-medium">Eski Poliçe No:</span><br/>{lead.dynamic_fields.previous_policy_number}</div>}
                          {lead.dynamic_fields.health_insured_for && <div className="text-xs text-slate-600"><span className="text-slate-400 font-medium">Kimin İçin:</span><br/>{lead.dynamic_fields.health_insured_for === "myself" ? "Kendim İçin" : "Ailem İçin"}</div>}
                          {lead.dynamic_fields.health_plan_type && <div className="text-xs text-slate-600"><span className="text-slate-400 font-medium">Plan:</span><br/>{lead.dynamic_fields.health_plan_type === "inpatient_only" ? "Sadece Yatarak" : "Yatarak + Ayakta"}</div>}
                          {lead.dynamic_fields.health_policy_status && <div className="text-xs text-slate-600"><span className="text-slate-400 font-medium">Poliçe Durumu:</span><br/>{lead.dynamic_fields.health_policy_status === "new_policy" ? "Yeni İş" : "Transfer / Geçiş"}</div>}
                          {lead.dynamic_fields.travel_citizenship && <div className="text-xs text-slate-600"><span className="text-slate-400 font-medium">Vatandaşlık:</span><br/>{lead.dynamic_fields.travel_citizenship === "tc" ? "TC Vatandaşı" : "Pasaport / Yabancı"}</div>}
                          {lead.dynamic_fields.passport_no && <div className="text-xs text-slate-600"><span className="text-slate-400 font-medium">Pasaport No:</span><br/><span className="uppercase">{lead.dynamic_fields.passport_no}</span></div>}
                          {lead.dynamic_fields.nationality && <div className="text-xs text-slate-600"><span className="text-slate-400 font-medium">Uyruk:</span><br/>{lead.dynamic_fields.nationality}</div>}
                          {lead.dynamic_fields.birth_date && <div className="text-xs text-slate-600"><span className="text-slate-400 font-medium">Doğum Tarihi:</span><br/>{lead.dynamic_fields.birth_date}</div>}
                          {lead.dynamic_fields.birth_place && <div className="text-xs text-slate-600"><span className="text-slate-400 font-medium">Doğum Yeri:</span><br/>{lead.dynamic_fields.birth_place}</div>}
                          {lead.dynamic_fields.gender && <div className="text-xs text-slate-600"><span className="text-slate-400 font-medium">Cinsiyet:</span><br/>{lead.dynamic_fields.gender === "male" ? "Erkek" : "Kadın"}</div>}
                          {lead.dynamic_fields.address && <div className="text-xs text-slate-600 col-span-2"><span className="text-slate-400 font-medium">Adres:</span><br/>{lead.dynamic_fields.address}</div>}
                          {lead.dynamic_fields.departure_date && <div className="text-xs text-slate-600"><span className="text-slate-400 font-medium">Gidiş Tarihi:</span><br/>{lead.dynamic_fields.departure_date}</div>}
                          {lead.dynamic_fields.return_date && <div className="text-xs text-slate-600"><span className="text-slate-400 font-medium">Dönüş Tarihi:</span><br/>{lead.dynamic_fields.return_date}</div>}
                          {lead.dynamic_fields.travel_reason && <div className="text-xs text-slate-600"><span className="text-slate-400 font-medium">Sebep:</span><br/>{lead.dynamic_fields.travel_reason}</div>}
                          {lead.dynamic_fields.travel_region && <div className="text-xs text-slate-600"><span className="text-slate-400 font-medium">Bölge:</span><br/>{lead.dynamic_fields.travel_region}</div>}
                          {lead.dynamic_fields.travel_country && <div className="text-xs text-slate-600"><span className="text-slate-400 font-medium">Ülke:</span><br/>{lead.dynamic_fields.travel_country}</div>}
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
                      
                      {lead.is_archived ? (
                        <button 
                          onClick={() => {
                            showConfirm(
                              "Arşivden Geri Yükle",
                              "Bu talebi aktif listeye geri yüklemek istiyor musunuz?",
                              async () => {
                                try {
                                  const res = await fetch(`/api/v1/leads/${lead.id}`, {
                                    method: 'PATCH',
                                    headers: { 'Content-Type': 'application/json' },
                                    body: JSON.stringify({ is_archived: false })
                                  });
                                  const data = await res.json();
                                  if (data.success) {
                                    setLeads(prev => prev.map(item => item.id === lead.id ? { ...item, is_archived: false } : item));
                                    showToast("Talep başarıyla aktif listeye geri yüklendi!");
                                  }
                                } catch (err) {
                                  console.error(err);
                                  showToast("Bir hata oluştu.", "error");
                                }
                              }
                            );
                          }}
                          className="col-span-2 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-xs rounded-lg border border-indigo-200 transition-colors flex items-center justify-center gap-1 cursor-pointer"
                        >
                          🔄 Arşivden Geri Yükle
                        </button>
                      ) : (
                        <>
                          {lead.status === 'NEW' && (
                            <button 
                              onClick={() => handleUpdateStatus(lead.id, 'CONTACTED')}
                              className="py-2 bg-slate-100 text-slate-700 hover:bg-slate-200 font-medium text-xs rounded-lg transition-colors"
                            >
                              Arandı Yap
                            </button>
                          )}

                          {lead.status !== 'SOLD' && (
                            <button 
                              onClick={() => setSelectedLeadId(lead.id)}
                              className={`${lead.status !== 'NEW' ? 'col-span-2' : ''} py-2 bg-blue-600 text-white hover:bg-blue-700 font-bold text-xs rounded-lg shadow-sm transition-colors`}
                            >
                              Satıldı (Poliçe)
                            </button>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                );
              })}
              </div>
            )}

            {(activeTab === 'leads' || activeTab === 'archived') && filteredLeads.length === 0 && !loading && (
              <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-500">
                {activeTab === 'archived' ? 'Arşivlenmiş herhangi bir talep bulunmuyor.' : 'Hiç talep bulunmuyor veya arama sonucu boş.'}
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
      <Dialog open={!!quoteModalLeadId} onOpenChange={(open) => { if (!open) { setQuoteModalLeadId(null); setEditingQuote(null); setQuotePremium(""); } }}>
        <DialogContent className="bg-white sm:max-w-md p-6 rounded-2xl border border-slate-200 shadow-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-slate-900">Teklifler</DialogTitle>
          </DialogHeader>
          
          <div className="mt-2 space-y-6">
            {/* Yeni Teklif Yükleme Formu */}
            <form 
              key={editingQuote ? `edit-${editingQuote.id}` : 'new'}
              onSubmit={handleUploadQuote} 
              className="space-y-4 bg-slate-50 p-4 rounded-xl border border-slate-200 border-dashed"
            >
              <h4 className="text-sm font-bold text-slate-800">
                {editingQuote ? 'Teklifi Düzenle (Düzenleme Modu)' : 'Yeni Teklif Ekle'}
              </h4>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700">Müşteri Ad Soyad</label>
                <input name="customer_full_name" defaultValue={leads.find(l => l.id === quoteModalLeadId)?.customer?.full_name || ""} placeholder="Örn: Ahmet Yılmaz" className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-sm text-slate-900 bg-white focus:ring-2 focus:ring-blue-500 outline-none" />
              </div>
              
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700">Sigorta Şirketi</label>
                <input name="company_name" required defaultValue={editingQuote ? editingQuote.company_name : ""} placeholder="Örn: Allianz" className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-sm text-slate-900 bg-white focus:ring-2 focus:ring-blue-500 outline-none" />
              </div>
              
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700">Prim Tutarı (TL)</label>
                <input name="premium_display" type="text" inputMode="decimal" required placeholder="Örn: 5.000,00" value={quotePremium} onChange={e => setQuotePremium(formatPremium(e.target.value))} className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-sm text-slate-900 bg-white focus:ring-2 focus:ring-blue-500 outline-none" />
              </div>
              
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700">Taksit Seçeneği</label>
                <input name="installments" defaultValue={editingQuote ? editingQuote.installments || "" : ""} placeholder="Örn: Tek Çekim, 3 Taksit, 9 Taksit" className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-sm text-slate-900 bg-white focus:ring-2 focus:ring-blue-500 outline-none" />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700">Teklif Notu / Uyarı (Opsiyonel)</label>
                <textarea name="notes" defaultValue={editingQuote ? editingQuote.notes || "" : ""} placeholder="Örn: Bu fiyata %10 hasarsızlık indirimi dahildir." rows={2} className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-sm text-slate-900 bg-white focus:ring-2 focus:ring-blue-500 outline-none resize-none" />
              </div>
              
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700">
                  Teklif Dosyası (PDF - {editingQuote ? 'Yeni dosya yüklemek eskisini ezer' : 'Opsiyonel'})
                </label>
                <input type="file" name="file" accept=".pdf" className="w-full text-xs text-slate-500 file:mr-3 file:py-1 file:px-3 file:rounded file:border-0 file:text-xs file:font-bold file:bg-blue-100 file:text-blue-700 hover:file:bg-blue-200 cursor-pointer" />
              </div>

              <div className="flex gap-2">
                {editingQuote && (
                  <button 
                    type="button"
                    onClick={() => { setEditingQuote(null); setQuotePremium(""); }}
                    className="w-1/3 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold text-sm rounded-lg shadow-sm transition-colors"
                  >
                    Vazgeç
                  </button>
                )}
                <button 
                  type="submit" 
                  disabled={isUploadingQuote} 
                  className={`${editingQuote ? 'w-2/3' : 'w-full'} py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-bold text-sm rounded-lg shadow-sm transition-colors`}
                >
                  {isUploadingQuote ? 'Yükleniyor...' : (editingQuote ? 'Teklifi Güncelle' : 'Teklifi Kaydet')}
                </button>
              </div>
            </form>

            {/* Mevcut Teklifler */}
            <div>
              <div className="flex items-center justify-between mb-3 border-b border-slate-100 pb-2">
                <h4 className="text-sm font-bold text-slate-800">Müşteriye İletilen Teklifler</h4>
                {leadQuotes.length > 0 && (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleShareQuotesWhatsApp}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white text-xs font-bold rounded-lg shadow-sm transition-all hover:scale-[1.03] cursor-pointer"
                    >
                      <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.746.953 3.71 1.458 5.704 1.46h.006c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                      </svg>
                      Teklifleri Paylaş
                    </button>
                    
                    <button
                      onClick={() => {
                        showPrompt(
                          "Teklif İletilemedi",
                          "Müşterinin WhatsApp'ı yok.",
                          async (reason) => {
                            if (!reason.trim()) return;
                            try {
                              const currentLead = leads.find(l => l.id === quoteModalLeadId);
                              const existingNotes = currentLead?.notes ? currentLead.notes + "\n" : "";
                              const newNotes = existingNotes + `[Sistem Notu] Teklif iletilemedi. Sebep: ${reason}`;

                              const res = await fetch(`/api/v1/leads/${quoteModalLeadId}`, {
                                method: "PATCH",
                                headers: { "Content-Type": "application/json" },
                                body: JSON.stringify({ 
                                  status: "LOST",
                                  notes: newNotes
                                }),
                              });
                              const data = await res.json();
                              if (data.success) {
                                setLeads(prev => prev.map(l => l.id === quoteModalLeadId ? {
                                  ...l,
                                  status: 'LOST',
                                  notes: newNotes
                                } : l));
                                showToast("Talep 'KAYBEDİLDİ' (Teklif İletilemedi) olarak işaretlendi.");
                                setQuoteModalLeadId(null);
                              }
                            } catch (err) {
                              console.error(err);
                              showToast("Bir hata oluştu.", "error");
                            }
                          }
                        );
                      }}
                      className="flex items-center gap-1 px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-bold rounded-lg transition-all hover:scale-[1.03] cursor-pointer"
                    >
                      🚫 İletilemedi
                    </button>
                  </div>
                )}
              </div>
              {leadQuotes.length === 0 ? (
                <p className="text-xs text-slate-500 text-center py-4">Henüz bir teklif kaydedilmemiş.</p>
              ) : (
                <div className="space-y-2">
                  {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                  {[...leadQuotes].sort((a, b) => a.premium - b.premium).map((q: any) => (
                    <div key={q.id} className="flex flex-col gap-2 p-3 bg-white border border-slate-200 rounded-lg shadow-sm hover:border-blue-300 transition-colors">
                      <div className="flex items-center justify-between w-full">
                        <div className="flex flex-col items-start">
                          <span className="font-bold text-sm text-slate-900">{q.company_name}</span>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-xs font-semibold text-slate-700">{new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(q.premium)}</span>
                            {q.installments && (
                              <span className="px-1.5 py-0.5 bg-blue-50 text-blue-700 border border-blue-100 rounded text-[10px] font-bold">
                                {q.installments}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => {
                              setEditingQuote(q);
                              setQuotePremium(formatPremium(q.premium.toString()));
                            }}
                            className="px-2 py-1.5 bg-blue-50 text-blue-600 hover:bg-blue-100 text-xs font-bold rounded-md transition-colors"
                          >
                            Düzenle
                          </button>
                          <button
                            onClick={() => handleDeleteQuote(q.id)}
                            className="px-2 py-1.5 bg-red-50 text-red-600 hover:bg-red-100 text-xs font-bold rounded-md transition-colors"
                          >
                            Sil
                          </button>
                          {q.file_name ? (
                            <a 
                              href={`/api/v1/quotes/${q.id}/download`} 
                              download={q.file_name}
                              className="px-3 py-1.5 bg-slate-100 text-slate-700 hover:bg-slate-200 text-xs font-bold rounded-md transition-colors"
                            >
                              İndir (PDF)
                            </a>
                          ) : (
                            <span className="px-3 py-1.5 bg-slate-50 text-slate-400 text-xs font-bold rounded-md select-none">
                              PDF Yok
                            </span>
                          )}
                        </div>
                      </div>

                      {q.notes && (
                        <div className="w-full p-2 bg-amber-50 border border-amber-100 rounded-lg text-[11px] text-amber-800 flex items-start gap-1.5">
                          <svg className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                          </svg>
                          <span><span className="font-bold">Not/Uyarı:</span> {q.notes}</span>
                        </div>
                      )}

                      <div className="text-[10px] text-slate-400 text-right w-full border-t border-slate-50 pt-1.5">
                        {new Date(q.created_at).toLocaleString('tr-TR')}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Lead Düzenleme Modalı */}
      <Dialog open={isEditLeadOpen} onOpenChange={setIsEditLeadOpen}>
        <DialogContent className="bg-white sm:max-w-md p-6 rounded-2xl border border-slate-200 shadow-2xl max-h-[90vh] overflow-y-auto text-slate-900">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-slate-900">Talep Bilgilerini Düzenle</DialogTitle>
          </DialogHeader>
          {editingLead && (
            <form onSubmit={handleEditLead} className="space-y-4 mt-4 text-slate-900">
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-slate-700">Müşteri Adı Soyadı</label>
                <input 
                  name="full_name" 
                  defaultValue={editingLead.customer?.full_name || ""} 
                  placeholder="Örn: Ahmet Yılmaz" 
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg text-slate-900 bg-white focus:ring-2 focus:ring-blue-500 outline-none" 
                />
              </div>
              
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-slate-700">Telefon Numarası</label>
                <input 
                  name="phone" 
                  required 
                  type="tel" 
                  defaultValue={editingLead.customer?.phone || ""} 
                  placeholder="Örn: 0555 444 33 22" 
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg text-slate-900 bg-white focus:ring-2 focus:ring-blue-500 outline-none" 
                />
              </div>

              {/* Dinamik Alanlar */}
              {editingLead.insurance_category === "vehicle" && (
                <div className="space-y-4 pt-2 border-t border-slate-100">
                  <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-slate-700">Plaka</label>
                    <input 
                      name="plate" 
                      required 
                      defaultValue={editingLead.dynamic_fields?.plate || ""} 
                      placeholder="Örn: 34ABC123" 
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg text-slate-900 bg-white focus:ring-2 focus:ring-blue-500 uppercase outline-none" 
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-slate-700">TC Kimlik Numarası</label>
                    <input 
                      name="tc_no" 
                      required 
                      maxLength={11} 
                      defaultValue={editingLead.dynamic_fields?.tc_no || ""} 
                      placeholder="11 Haneli TC No" 
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg text-slate-900 bg-white focus:ring-2 focus:ring-blue-500 outline-none" 
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-slate-700">Tescil Belge Seri / Sıra No</label>
                    <input 
                      name="document_no" 
                      required 
                      maxLength={8} 
                      defaultValue={editingLead.dynamic_fields?.document_no || ""} 
                      placeholder="Örn: AA123456" 
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg text-slate-900 bg-white focus:ring-2 focus:ring-blue-500 uppercase outline-none" 
                    />
                  </div>
                </div>
              )}

              {editingLead.insurance_category === "home" && (
                <div className="space-y-4 pt-2 border-t border-slate-100">
                  <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-slate-700">Şehir</label>
                    <input 
                      name="city" 
                      required 
                      defaultValue={editingLead.dynamic_fields?.city || ""} 
                      placeholder="Örn: İstanbul" 
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg text-slate-900 bg-white focus:ring-2 focus:ring-blue-500 outline-none" 
                    />
                  </div>
                  {["DASK", "HOME_CONTENT"].includes(editingLead.insurance_type) && (
                    <>
                      <div className="space-y-1.5">
                        <label className="text-sm font-semibold text-slate-700">TC Kimlik Numarası</label>
                        <input 
                          name="tc_no" 
                          required 
                          maxLength={11} 
                          defaultValue={editingLead.dynamic_fields?.tc_no || ""} 
                          placeholder="11 Haneli TC No" 
                          className="w-full px-4 py-2 border border-slate-300 rounded-lg text-slate-900 bg-white focus:ring-2 focus:ring-blue-500 outline-none" 
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-sm font-semibold block text-slate-700">Daha önce poliçeniz var mı?</label>
                        <div className="flex gap-6 mt-1 py-1">
                          <label className="flex items-center gap-2 cursor-pointer text-sm font-medium text-slate-800">
                            <input 
                              type="radio" 
                              name="has_previous_policy" 
                              value="yes"
                              checked={editHasPreviousPolicy === "yes"}
                              onChange={() => setEditHasPreviousPolicy("yes")}
                              className="w-4 h-4 text-blue-600 focus:ring-blue-500" 
                            />
                            Evet, var
                          </label>
                          <label className="flex items-center gap-2 cursor-pointer text-sm font-medium text-slate-800">
                            <input 
                              type="radio" 
                              name="has_previous_policy" 
                              value="no" 
                              checked={editHasPreviousPolicy === "no"}
                              onChange={() => setEditHasPreviousPolicy("no")}
                              className="w-4 h-4 text-blue-600 focus:ring-blue-500" 
                            />
                            Hayır, ilk kez yaptırıyorum
                          </label>
                        </div>
                      </div>
                      {editHasPreviousPolicy === "yes" && (
                        <div className="space-y-1.5">
                          <label className="text-sm font-semibold text-slate-700">Mevcut Poliçe Numarası</label>
                          <input 
                            name="previous_policy_number" 
                            required 
                            defaultValue={editingLead.dynamic_fields?.previous_policy_number || ""} 
                            placeholder="Poliçe Numaranız" 
                            className="w-full px-4 py-2 border border-slate-300 rounded-lg text-slate-900 bg-white focus:ring-2 focus:ring-blue-500 outline-none" 
                          />
                        </div>
                      )}
                    </>
                  )}
                </div>
              )}

              {editingLead.insurance_category === "health" && (
                <div className="space-y-4 pt-2 border-t border-slate-100">
                  {editingLead.insurance_type !== "TRAVEL" && (
                    <div className="space-y-1.5">
                      <label className="text-sm font-semibold text-slate-700">Yaş Aralığı</label>
                      <input 
                        name="ageGroup" 
                        required 
                        defaultValue={editingLead.dynamic_fields?.ageGroup || ""} 
                        placeholder="Örn: 25-35" 
                        className="w-full px-4 py-2 border border-slate-300 rounded-lg text-slate-900 bg-white focus:ring-2 focus:ring-blue-500 outline-none" 
                      />
                    </div>
                  )}
                  {editingLead.insurance_type === "HEALTH" && (
                    <>
                      <div className="space-y-1.5">
                        <label className="text-sm font-semibold text-slate-700">TC Kimlik Numarası</label>
                        <input 
                          name="tc_no" 
                          required 
                          maxLength={11} 
                          defaultValue={editingLead.dynamic_fields?.tc_no || ""} 
                          placeholder="11 Haneli TC No" 
                          className="w-full px-4 py-2 border border-slate-300 rounded-lg text-slate-900 bg-white focus:ring-2 focus:ring-blue-500 outline-none" 
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-sm font-semibold block text-slate-700">Sigorta Kimin İçin Yapılacak?</label>
                        <div className="flex gap-6 mt-1 py-1">
                          <label className="flex items-center gap-2 cursor-pointer text-sm font-medium text-slate-800">
                            <input 
                              type="radio" 
                              name="health_insured_for" 
                              value="myself"
                              checked={editHealthInsuredFor === "myself"}
                              onChange={() => setEditHealthInsuredFor("myself")}
                              className="w-4 h-4 text-blue-600 focus:ring-blue-500" 
                            />
                            Kendim İçin
                          </label>
                          <label className="flex items-center gap-2 cursor-pointer text-sm font-medium text-slate-800">
                            <input 
                              type="radio" 
                              name="health_insured_for" 
                              value="family" 
                              checked={editHealthInsuredFor === "family"}
                              onChange={() => setEditHealthInsuredFor("family")}
                              className="w-4 h-4 text-blue-600 focus:ring-blue-500" 
                            />
                            Ailem İçin
                          </label>
                        </div>
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-sm font-semibold block text-slate-700">Plan Seçimi</label>
                        <div className="flex gap-6 mt-1 py-1">
                          <label className="flex items-center gap-2 cursor-pointer text-sm font-medium text-slate-800">
                            <input 
                              type="radio" 
                              name="health_plan_type" 
                              value="inpatient_only"
                              checked={editHealthPlanType === "inpatient_only"}
                              onChange={() => setEditHealthPlanType("inpatient_only")}
                              className="w-4 h-4 text-blue-600 focus:ring-blue-500" 
                            />
                            Sadece Yatarak
                          </label>
                          <label className="flex items-center gap-2 cursor-pointer text-sm font-medium text-slate-800">
                            <input 
                              type="radio" 
                              name="health_plan_type" 
                              value="inpatient_outpatient" 
                              checked={editHealthPlanType === "inpatient_outpatient"}
                              onChange={() => setEditHealthPlanType("inpatient_outpatient")}
                              className="w-4 h-4 text-blue-600 focus:ring-blue-500" 
                            />
                            Yatarak + Ayakta
                          </label>
                        </div>
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-sm font-semibold block text-slate-700">Poliçe Durumu</label>
                        <div className="flex gap-6 mt-1 py-1">
                          <label className="flex items-center gap-2 cursor-pointer text-sm font-medium text-slate-800">
                            <input 
                              type="radio" 
                              name="health_policy_status" 
                              value="new_policy"
                              checked={editHealthPolicyStatus === "new_policy"}
                              onChange={() => setEditHealthPolicyStatus("new_policy")}
                              className="w-4 h-4 text-blue-600 focus:ring-blue-500" 
                            />
                            Yeni İş
                          </label>
                          <label className="flex items-center gap-2 cursor-pointer text-sm font-medium text-slate-800">
                            <input 
                              type="radio" 
                              name="health_policy_status" 
                              value="transfer" 
                              checked={editHealthPolicyStatus === "transfer"}
                              onChange={() => setEditHealthPolicyStatus("transfer")}
                              className="w-4 h-4 text-blue-600 focus:ring-blue-500" 
                            />
                            Geçiş / Transfer
                          </label>
                        </div>
                      </div>
                    </>
                  )}
                  {editingLead.insurance_type === "TRAVEL" && (
                    <div className="space-y-4">
                      {/* Vatandaşlık Durumu */}
                      <div className="space-y-1.5">
                        <label className="text-sm font-semibold block text-slate-700">Vatandaşlık Durumu</label>
                        <div className="flex gap-6 mt-1 py-1">
                          <label className="flex items-center gap-2 cursor-pointer text-sm font-medium text-slate-800">
                            <input 
                              type="radio" 
                              name="travel_citizenship" 
                              value="tc" 
                              checked={editTravelCitizenship === "tc"}
                              onChange={() => setEditTravelCitizenship("tc")}
                              className="w-4 h-4 text-blue-600 focus:ring-blue-500" 
                            />
                            TC Vatandaşı
                          </label>
                          <label className="flex items-center gap-2 cursor-pointer text-sm font-medium text-slate-800">
                            <input 
                              type="radio" 
                              name="travel_citizenship" 
                              value="passport" 
                              checked={editTravelCitizenship === "passport"}
                              onChange={() => setEditTravelCitizenship("passport")}
                              className="w-4 h-4 text-blue-600 focus:ring-blue-500" 
                            />
                            Pasaport / Yabancı
                          </label>
                        </div>
                      </div>

                      {/* TC Vatandaşı ise sadece TC No */}
                      {editTravelCitizenship === "tc" && (
                        <div className="space-y-1.5">
                          <label className="text-sm font-semibold text-slate-700">TC Kimlik Numarası</label>
                          <input 
                            name="tc_no" 
                            required 
                            maxLength={11} 
                            defaultValue={editingLead.dynamic_fields?.tc_no || ""} 
                            placeholder="11 Haneli TC Kimlik Numarası" 
                            className="w-full px-4 py-2 border border-slate-300 rounded-lg text-slate-900 bg-white focus:ring-2 focus:ring-blue-500 outline-none" 
                          />
                        </div>
                      )}

                      {/* Pasaport ise pasaport detayları */}
                      {editTravelCitizenship === "passport" && (
                        <div className="space-y-4">
                          <div className="space-y-1.5">
                            <label className="text-sm font-semibold text-slate-700">Pasaport Numarası</label>
                            <input 
                              name="passport_no" 
                              required 
                              defaultValue={editingLead.dynamic_fields?.passport_no || ""} 
                              placeholder="Pasaport No" 
                              className="w-full px-4 py-2 border border-slate-300 rounded-lg text-slate-900 bg-white focus:ring-2 focus:ring-blue-500 outline-none" 
                            />
                          </div>
                          <div className="space-y-1.5">
                            <label className="text-sm font-semibold text-slate-700">Uyruk</label>
                            <input 
                              name="nationality" 
                              required 
                              defaultValue={editingLead.dynamic_fields?.nationality || ""} 
                              placeholder="Örn: İngiltere" 
                              className="w-full px-4 py-2 border border-slate-300 rounded-lg text-slate-900 bg-white focus:ring-2 focus:ring-blue-500 outline-none" 
                            />
                          </div>
                          <div className="space-y-1.5">
                            <label className="text-sm font-semibold text-slate-700">Doğum Tarihi</label>
                            <input 
                              name="birth_date" 
                              required 
                              type="date" 
                              defaultValue={editingLead.dynamic_fields?.birth_date || ""} 
                              className="w-full px-4 py-2 border border-slate-300 rounded-lg text-slate-900 bg-white focus:ring-2 focus:ring-blue-500 outline-none" 
                            />
                          </div>
                          <div className="space-y-1.5">
                            <label className="text-sm font-semibold text-slate-700">Doğum Yeri</label>
                            <input 
                              name="birth_place" 
                              required 
                              defaultValue={editingLead.dynamic_fields?.birth_place || ""} 
                              placeholder="Doğum Yeri" 
                              className="w-full px-4 py-2 border border-slate-300 rounded-lg text-slate-900 bg-white focus:ring-2 focus:ring-blue-500 outline-none" 
                            />
                          </div>
                          <div className="space-y-1.5">
                            <label className="text-sm font-semibold text-slate-700">Cinsiyet</label>
                            <select 
                              name="gender" 
                              defaultValue={editingLead.dynamic_fields?.gender || "male"} 
                              className="w-full px-4 py-2 border border-slate-300 rounded-lg text-slate-900 bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                            >
                              <option value="male">Erkek</option>
                              <option value="female">Kadın</option>
                            </select>
                          </div>
                          <div className="space-y-1.5">
                            <label className="text-sm font-semibold text-slate-700">Adres</label>
                            <textarea 
                              name="address" 
                              required 
                              rows={2} 
                              defaultValue={editingLead.dynamic_fields?.address || ""} 
                              placeholder="Detaylı adres giriniz..." 
                              className="w-full px-4 py-2 border border-slate-300 rounded-lg text-slate-900 bg-white focus:ring-2 focus:ring-blue-500 outline-none resize-none" 
                            />
                          </div>
                        </div>
                      )}

                      <div className="space-y-1.5">
                        <label className="text-sm font-semibold text-slate-700">Gidiş Tarihi</label>
                        <input 
                          name="departure_date" 
                          required 
                          type="date" 
                          defaultValue={editingLead.dynamic_fields?.departure_date || ""} 
                          className="w-full px-4 py-2 border border-slate-300 rounded-lg text-slate-900 bg-white focus:ring-2 focus:ring-blue-500 outline-none" 
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-sm font-semibold text-slate-700">Dönüş Tarihi</label>
                        <input 
                          name="return_date" 
                          required 
                          type="date" 
                          defaultValue={editingLead.dynamic_fields?.return_date || ""} 
                          className="w-full px-4 py-2 border border-slate-300 rounded-lg text-slate-900 bg-white focus:ring-2 focus:ring-blue-500 outline-none" 
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-sm font-semibold text-slate-700">Seyahat Sebebi</label>
                        <select 
                          name="travel_reason" 
                          defaultValue={editingLead.dynamic_fields?.travel_reason || "Turistik Gezi"} 
                          className="w-full px-4 py-2 border border-slate-300 rounded-lg text-slate-900 bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                        >
                          <option value="Turistik Gezi">Turistik</option>
                          <option value="Eğitim">Eğitim</option>
                          <option value="İş Seyahati">İş</option>
                        </select>
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-sm font-semibold text-slate-700">Seyahat Bölgesi</label>
                        <select 
                          name="travel_region" 
                          defaultValue={editingLead.dynamic_fields?.travel_region || "Avrupa Schengen"} 
                          className="w-full px-4 py-2 border border-slate-300 rounded-lg text-slate-900 bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                        >
                          <option value="Avrupa Schengen">Avrupa Schengen</option>
                          <option value="Tüm Dünya">Tüm Dünya</option>
                          <option value="Yurt İçi">Yurt İçi</option>
                          <option value="Tüm Türkiye Incoming">Incoming TR</option>
                        </select>
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-sm font-semibold text-slate-700">Seyahat Edilecek Ülke</label>
                        <input 
                          name="travel_country" 
                          required 
                          defaultValue={editingLead.dynamic_fields?.travel_country || ""} 
                          placeholder="Örn: Almanya" 
                          className="w-full px-4 py-2 border border-slate-300 rounded-lg text-slate-900 bg-white focus:ring-2 focus:ring-blue-500 outline-none" 
                        />
                      </div>
                    </div>
                  )}
                </div>
              )}

              {editingLead.insurance_category === "business" && (
                <div className="space-y-4 pt-2 border-t border-slate-100">
                  <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-slate-700">Sektör</label>
                    <input 
                      name="sector" 
                      required 
                      defaultValue={editingLead.dynamic_fields?.sector || ""} 
                      placeholder="Örn: Tekstil" 
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg text-slate-900 bg-white focus:ring-2 focus:ring-blue-500 outline-none" 
                    />
                  </div>
                </div>
              )}

              <div className="flex gap-3 pt-4 border-t border-slate-100">
                <button 
                  type="button" 
                  onClick={() => setIsEditLeadOpen(false)} 
                  className="w-1/3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-sm rounded-lg transition-colors cursor-pointer"
                >
                  Vazgeç
                </button>
                <button 
                  type="submit" 
                  disabled={isSavingLead} 
                  className="w-2/3 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-bold text-sm rounded-lg shadow-sm transition-colors cursor-pointer"
                >
                  {isSavingLead ? 'Kaydediliyor...' : 'Bilgileri Güncelle'}
                </button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* Manuel Talep Ekleme Modalı */}
      <Dialog open={isCreateLeadOpen} onOpenChange={setIsCreateLeadOpen}>
        <DialogContent className="bg-white sm:max-w-md p-6 rounded-2xl border border-slate-200 shadow-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-slate-900">Yeni Manuel Talep Ekle</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreateLead} className="space-y-4 mt-4">
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-slate-700">Müşteri Adı Soyadı</label>
              <input name="full_name" placeholder="Örn: Ahmet Yılmaz" className="w-full px-4 py-2 border border-slate-300 rounded-lg text-slate-900 bg-white focus:ring-2 focus:ring-blue-500 outline-none" />
            </div>
            
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-slate-700">Telefon Numarası</label>
              <input name="phone" required type="tel" placeholder="Örn: 0555 444 33 22" className="w-full px-4 py-2 border border-slate-300 rounded-lg text-slate-900 bg-white focus:ring-2 focus:ring-blue-500 outline-none" />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-slate-700">Başvuru Kaynağı</label>
              <select name="lead_source" className="w-full px-4 py-2 border border-slate-300 rounded-lg text-slate-900 bg-white focus:ring-2 focus:ring-blue-500 outline-none">
                <option value="Manuel (WhatsApp)">WhatsApp</option>
                <option value="Manuel (Telefon)">Telefon</option>
                <option value="Manuel (Diğer)">Diğer / Doğrudan</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-slate-700">Sigorta Kategorisi</label>
              <select 
                value={manualCategory} 
                onChange={(e) => handleCategoryChange(e.target.value)}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg text-slate-900 bg-white focus:ring-2 focus:ring-blue-500 outline-none"
              >
                {insuranceCategories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.label}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-slate-700">Sigorta Türü</label>
              <select 
                value={manualType} 
                onChange={(e) => setManualType(e.target.value)}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg text-slate-900 bg-white focus:ring-2 focus:ring-blue-500 outline-none"
              >
                {insuranceTypes.filter(t => t.category === manualCategory).map(t => (
                  <option key={t.id} value={t.id}>{t.label}</option>
                ))}
              </select>
            </div>

            {/* Dinamik Alanlar */}
            {manualCategory === "vehicle" && (
              <div className="space-y-4 pt-2 border-t border-slate-100">
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-slate-700">Plaka</label>
                  <input name="plate" required placeholder="Örn: 34ABC123" className="w-full px-4 py-2 border border-slate-300 rounded-lg text-slate-900 bg-white focus:ring-2 focus:ring-blue-500 uppercase outline-none" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-slate-700">TC Kimlik Numarası</label>
                  <input name="tc_no" required maxLength={11} placeholder="11 Haneli TC No" className="w-full px-4 py-2 border border-slate-300 rounded-lg text-slate-900 bg-white focus:ring-2 focus:ring-blue-500 outline-none" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-slate-700">Tescil Belge Seri / Sıra No</label>
                  <input name="document_no" required maxLength={8} placeholder="Örn: AA123456" className="w-full px-4 py-2 border border-slate-300 rounded-lg text-slate-900 bg-white focus:ring-2 focus:ring-blue-500 uppercase outline-none" />
                </div>
              </div>
            )}

            {manualCategory === "home" && (
              <div className="space-y-4 pt-2 border-t border-slate-100">
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-slate-700">Şehir</label>
                  <input name="city" required placeholder="Örn: İstanbul" className="w-full px-4 py-2 border border-slate-300 rounded-lg text-slate-900 bg-white focus:ring-2 focus:ring-blue-500 outline-none" />
                </div>
                {["DASK", "HOME_CONTENT"].includes(manualType) && (
                  <>
                    <div className="space-y-1.5">
                      <label className="text-sm font-semibold text-slate-700">TC Kimlik Numarası</label>
                      <input name="tc_no" required maxLength={11} placeholder="11 Haneli TC No" className="w-full px-4 py-2 border border-slate-300 rounded-lg text-slate-900 bg-white focus:ring-2 focus:ring-blue-500 outline-none" />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-sm font-semibold block text-slate-700">Daha önce poliçeniz var mı?</label>
                      <div className="flex gap-6 mt-1 py-1">
                        <label className="flex items-center gap-2 cursor-pointer text-sm font-medium text-slate-800">
                          <input 
                            type="radio" 
                            name="has_previous_policy" 
                            value="yes"
                            checked={manualHasPreviousPolicy === "yes"}
                            onChange={() => setManualHasPreviousPolicy("yes")}
                            className="w-4 h-4 text-blue-600 focus:ring-blue-500" 
                          />
                          Evet, var
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer text-sm font-medium text-slate-800">
                          <input 
                            type="radio" 
                            name="has_previous_policy" 
                            value="no" 
                            checked={manualHasPreviousPolicy === "no"}
                            onChange={() => setManualHasPreviousPolicy("no")}
                            className="w-4 h-4 text-blue-600 focus:ring-blue-500" 
                          />
                          Hayır, ilk kez yaptırıyorum
                        </label>
                      </div>
                    </div>
                    {manualHasPreviousPolicy === "yes" && (
                      <div className="space-y-1.5">
                        <label className="text-sm font-semibold text-slate-700">Mevcut Poliçe Numarası</label>
                        <input name="previous_policy_number" required placeholder="Poliçe Numaranız" className="w-full px-4 py-2 border border-slate-300 rounded-lg text-slate-900 bg-white focus:ring-2 focus:ring-blue-500 outline-none" />
                      </div>
                    )}
                  </>
                )}
              </div>
            )}

            {manualCategory === "health" && (
              <div className="space-y-4 pt-2 border-t border-slate-100">
                {manualType !== "TRAVEL" && (
                  <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-slate-700">Yaş Aralığı</label>
                    <input name="ageGroup" required placeholder="Örn: 25-35" className="w-full px-4 py-2 border border-slate-300 rounded-lg text-slate-900 bg-white focus:ring-2 focus:ring-blue-500 outline-none" />
                  </div>
                )}
                {manualType === "HEALTH" && (
                  <>
                    <div className="space-y-1.5">
                      <label className="text-sm font-semibold text-slate-700">TC Kimlik Numarası</label>
                      <input name="tc_no" required maxLength={11} placeholder="11 Haneli TC No" className="w-full px-4 py-2 border border-slate-300 rounded-lg text-slate-900 bg-white focus:ring-2 focus:ring-blue-500 outline-none" />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-sm font-semibold block text-slate-700">Sigorta Kimin İçin Yapılacak?</label>
                      <div className="flex gap-6 mt-1 py-1">
                        <label className="flex items-center gap-2 cursor-pointer text-sm font-medium text-slate-800">
                          <input 
                            type="radio" 
                            name="health_insured_for" 
                            value="myself"
                            checked={manualHealthInsuredFor === "myself"}
                            onChange={() => setManualHealthInsuredFor("myself")}
                            className="w-4 h-4 text-blue-600 focus:ring-blue-500" 
                          />
                          Kendim İçin
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer text-sm font-medium text-slate-800">
                          <input 
                            type="radio" 
                            name="health_insured_for" 
                            value="family" 
                            checked={manualHealthInsuredFor === "family"}
                            onChange={() => setManualHealthInsuredFor("family")}
                            className="w-4 h-4 text-blue-600 focus:ring-blue-500" 
                          />
                          Ailem İçin
                        </label>
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-sm font-semibold block text-slate-700">Plan Seçimi</label>
                      <div className="flex gap-6 mt-1 py-1">
                        <label className="flex items-center gap-2 cursor-pointer text-sm font-medium text-slate-800">
                          <input 
                            type="radio" 
                            name="health_plan_type" 
                            value="inpatient_only"
                            checked={manualHealthPlanType === "inpatient_only"}
                            onChange={() => setManualHealthPlanType("inpatient_only")}
                            className="w-4 h-4 text-blue-600 focus:ring-blue-500" 
                          />
                          Sadece Yatarak
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer text-sm font-medium text-slate-800">
                          <input 
                            type="radio" 
                            name="health_plan_type" 
                            value="inpatient_outpatient" 
                            checked={manualHealthPlanType === "inpatient_outpatient"}
                            onChange={() => setManualHealthPlanType("inpatient_outpatient")}
                            className="w-4 h-4 text-blue-600 focus:ring-blue-500" 
                          />
                          Yatarak + Ayakta
                        </label>
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-sm font-semibold block text-slate-700">Poliçe Durumu</label>
                      <div className="flex gap-6 mt-1 py-1">
                        <label className="flex items-center gap-2 cursor-pointer text-sm font-medium text-slate-800">
                          <input 
                            type="radio" 
                            name="health_policy_status" 
                            value="new_policy"
                            checked={manualHealthPolicyStatus === "new_policy"}
                            onChange={() => setManualHealthPolicyStatus("new_policy")}
                            className="w-4 h-4 text-blue-600 focus:ring-blue-500" 
                          />
                          Yeni İş
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer text-sm font-medium text-slate-800">
                          <input 
                            type="radio" 
                            name="health_policy_status" 
                            value="transfer" 
                            checked={manualHealthPolicyStatus === "transfer"}
                            onChange={() => setManualHealthPolicyStatus("transfer")}
                            className="w-4 h-4 text-blue-600 focus:ring-blue-500" 
                          />
                          Geçiş / Transfer
                        </label>
                      </div>
                    </div>
                  </>
                )}
                {manualType === "TRAVEL" && (
                  <div className="space-y-4">
                    {/* Vatandaşlık Durumu */}
                    <div className="space-y-1.5">
                      <label className="text-sm font-semibold block text-slate-700">Vatandaşlık Durumu</label>
                      <div className="flex gap-6 mt-1 py-1">
                        <label className="flex items-center gap-2 cursor-pointer text-sm font-medium text-slate-800">
                          <input 
                            type="radio" 
                            name="travel_citizenship" 
                            value="tc" 
                            checked={manualTravelCitizenship === "tc"}
                            onChange={() => setManualTravelCitizenship("tc")}
                            className="w-4 h-4 text-blue-600 focus:ring-blue-500" 
                          />
                          TC Vatandaşı
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer text-sm font-medium text-slate-800">
                          <input 
                            type="radio" 
                            name="travel_citizenship" 
                            value="passport" 
                            checked={manualTravelCitizenship === "passport"}
                            onChange={() => setManualTravelCitizenship("passport")}
                            className="w-4 h-4 text-blue-600 focus:ring-blue-500" 
                          />
                          Pasaport / Yabancı
                        </label>
                      </div>
                    </div>

                    {/* TC Vatandaşı ise sadece TC No */}
                    {manualTravelCitizenship === "tc" && (
                      <div className="space-y-1.5">
                        <label className="text-sm font-semibold text-slate-700">TC Kimlik Numarası</label>
                        <input 
                          name="tc_no" 
                          required 
                          maxLength={11} 
                          placeholder="11 Haneli TC Kimlik Numarası" 
                          className="w-full px-4 py-2 border border-slate-300 rounded-lg text-slate-900 bg-white focus:ring-2 focus:ring-blue-500 outline-none" 
                        />
                      </div>
                    )}

                    {/* Pasaport ise pasaport detayları */}
                    {manualTravelCitizenship === "passport" && (
                      <div className="space-y-4">
                        <div className="space-y-1.5">
                          <label className="text-sm font-semibold text-slate-700">Pasaport Numarası</label>
                          <input 
                            name="passport_no" 
                            required 
                            placeholder="Örn: U12345678" 
                            value={manualTravelPassportNo}
                            onChange={(e) => setManualTravelPassportNo(e.target.value)}
                            className="w-full px-4 py-2 border border-slate-300 rounded-lg text-slate-900 bg-white focus:ring-2 focus:ring-blue-500 outline-none uppercase" 
                          />
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-sm font-semibold text-slate-700">Uyruk</label>
                          <select 
                            name="nationality" 
                            required 
                            value={manualTravelNationality}
                            onChange={(e) => setManualTravelNationality(e.target.value)}
                            className="w-full px-4 py-2 border border-slate-300 rounded-lg text-slate-900 bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                          >
                            <option value="">Lütfen Seçin</option>
                            <option value="Almanya">Almanya</option>
                            <option value="Fransa">Fransa</option>
                            <option value="İtalya">İtalya</option>
                            <option value="İspanya">İspanya</option>
                            <option value="Yunanistan">Yunanistan</option>
                            <option value="Amerika Birleşik Devletleri">Amerika Birleşik Devletleri</option>
                            <option value="Rusya">Rusya</option>
                            <option value="Azerbaycan">Azerbaycan</option>
                            <option value="İngiltere">İngiltere</option>
                          </select>
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-sm font-semibold text-slate-700">Doğum Tarihi</label>
                          <input 
                            name="birth_date" 
                            type="date" 
                            required 
                            value={manualTravelBirthDate}
                            onChange={(e) => setManualTravelBirthDate(e.target.value)}
                            className="w-full px-4 py-2 border border-slate-300 rounded-lg text-slate-900 bg-white focus:ring-2 focus:ring-blue-500 outline-none" 
                          />
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-sm font-semibold text-slate-700">Doğum Yeri</label>
                          <input 
                            name="birth_place" 
                            required 
                            placeholder="Örn: Paris" 
                            value={manualTravelBirthPlace}
                            onChange={(e) => setManualTravelBirthPlace(e.target.value)}
                            className="w-full px-4 py-2 border border-slate-300 rounded-lg text-slate-900 bg-white focus:ring-2 focus:ring-blue-500 outline-none" 
                          />
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-sm font-semibold block text-slate-700">Cinsiyet</label>
                          <div className="flex gap-6 mt-1 py-1">
                            <label className="flex items-center gap-2 cursor-pointer text-sm font-medium text-slate-800">
                              <input 
                                type="radio" 
                                name="travel_gender" 
                                value="male" 
                                checked={manualTravelGender === "male"}
                                onChange={() => setManualTravelGender("male")}
                                className="w-4 h-4 text-blue-600 focus:ring-blue-500" 
                              />
                              Erkek
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer text-sm font-medium text-slate-800">
                              <input 
                                type="radio" 
                                name="travel_gender" 
                                value="female" 
                                checked={manualTravelGender === "female"}
                                onChange={() => setManualTravelGender("female")}
                                className="w-4 h-4 text-blue-600 focus:ring-blue-500" 
                              />
                              Kadın
                            </label>
                          </div>
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-sm font-semibold text-slate-700">Detaylı Adres</label>
                          <textarea 
                            name="address" 
                            required 
                            placeholder="Adres Bilgisi..." 
                            value={manualTravelAddress}
                            onChange={(e) => setManualTravelAddress(e.target.value)}
                            className="w-full px-4 py-2 border border-slate-300 rounded-lg text-slate-900 bg-white focus:ring-2 focus:ring-blue-500 outline-none h-20 resize-none" 
                          />
                        </div>
                      </div>
                    )}

                    {/* Seyahat Detayları */}
                    <div className="space-y-1.5 pt-2 border-t border-slate-100">
                      <label className="text-sm font-semibold text-slate-700">Gidiş Tarihi</label>
                      <input 
                        name="departure_date" 
                        type="date" 
                        required 
                        value={manualTravelDepartureDate}
                        onChange={(e) => setManualTravelDepartureDate(e.target.value)}
                        className="w-full px-4 py-2 border border-slate-300 rounded-lg text-slate-900 bg-white focus:ring-2 focus:ring-blue-500 outline-none" 
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-sm font-semibold text-slate-700">Dönüş Tarihi</label>
                      <input 
                        name="return_date" 
                        type="date" 
                        required 
                        value={manualTravelReturnDate}
                        onChange={(e) => setManualTravelReturnDate(e.target.value)}
                        className="w-full px-4 py-2 border border-slate-300 rounded-lg text-slate-900 bg-white focus:ring-2 focus:ring-blue-500 outline-none" 
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-sm font-semibold block text-slate-700">Seyahat Sebebi</label>
                      <select 
                        name="travel_reason" 
                        value={manualTravelReason}
                        onChange={(e) => setManualTravelReason(e.target.value)}
                        className="w-full px-4 py-2 border border-slate-300 rounded-lg text-slate-900 bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                      >
                        <option value="Turistik Gezi">Turistik Gezi</option>
                        <option value="Eğitim">Eğitim</option>
                        <option value="İş Seyahati">İş Seyahati</option>
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-sm font-semibold block text-slate-700">Seyahat Bölgesi</label>
                      <select 
                        name="travel_region" 
                        value={manualTravelRegion}
                        onChange={(e) => setManualTravelRegion(e.target.value)}
                        className="w-full px-4 py-2 border border-slate-300 rounded-lg text-slate-900 bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                      >
                        <option value="Avrupa Schengen">Avrupa Schengen</option>
                        <option value="Tüm Dünya">Tüm Dünya</option>
                        <option value="Yurt İçi">Yurt İçi</option>
                        <option value="Tüm Türkiye Incoming">Tüm Türkiye Incoming</option>
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-sm font-semibold text-slate-700">Seyahat Edilecek Ülke</label>
                      <input 
                        name="travel_country" 
                        required 
                        placeholder="Örn: Almanya" 
                        value={manualTravelCountry}
                        onChange={(e) => setManualTravelCountry(e.target.value)}
                        className="w-full px-4 py-2 border border-slate-300 rounded-lg text-slate-900 bg-white focus:ring-2 focus:ring-blue-500 outline-none" 
                      />
                    </div>
                  </div>
                )}
              </div>
            )}

            {manualCategory === "business" && (
              <div className="space-y-1.5 pt-2 border-t border-slate-100">
                <label className="text-sm font-semibold text-slate-700">Sektör</label>
                <input name="sector" required placeholder="Örn: Tekstil" className="w-full px-4 py-2 border border-slate-300 rounded-lg text-slate-900 bg-white focus:ring-2 focus:ring-blue-500 outline-none" />
              </div>
            )}

            <button 
              type="submit" 
              disabled={isCreatingLead} 
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-bold rounded-xl shadow-md transition-colors mt-2"
            >
              {isCreatingLead ? "Oluşturuluyor..." : "Talebi Kaydet"}
            </button>
          </form>
        </DialogContent>
      </Dialog>

      {/* Müşteri Talepleri & Teklif Geçmişi Modalı */}
      <Dialog open={!!historyModalLead} onOpenChange={(open) => !open && setHistoryModalLead(null)}>
        <DialogContent className="bg-white sm:max-w-xl p-6 rounded-2xl border border-slate-200 shadow-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-lg font-black text-slate-800 flex items-center gap-2">
              <span>📂</span> Müşteri Talep & Teklif Geçmişi
            </DialogTitle>
          </DialogHeader>

          {historyModalLead && (() => {
            const customerPhone = historyModalLead.customer?.phone;
            const customerName = historyModalLead.customer?.full_name || "İsimsiz Müşteri";
            
            // Find all leads of this customer
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const customerLeads = leads.filter((l: any) => l.customer?.phone === customerPhone);
            
            return (
              <div className="space-y-6 mt-4">
                {/* Müşteri Bilgi Kartı */}
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
                  <h4 className="font-bold text-slate-800 text-sm">{customerName}</h4>
                  <p className="text-xs text-slate-500 font-medium mt-1">📞 {formatWaPhone(customerPhone).replace(/^90/, '0')}</p>
                  <p className="text-[10px] text-slate-400 mt-2 font-semibold uppercase">TOPLAM BAŞVURU: {customerLeads.length}</p>
                </div>

                {/* Talepler Listesi */}
                <div className="space-y-4">
                  <h5 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Tüm Talepler & Teklifler</h5>
                  
                  {customerLeads.length === 0 ? (
                    <p className="text-xs text-slate-500">Kayıt bulunamadı.</p>
                  ) : (
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    customerLeads.map((l: any) => {
                      const isCurrentLead = l.id === historyModalLead.id;
                      const hasQuotes = l.quotes && l.quotes.length > 0;
                      
                      return (
                        <div 
                          key={l.id} 
                          className={`border rounded-xl p-4 transition-all relative ${
                            isCurrentLead 
                              ? 'bg-blue-50/30 border-blue-200 shadow-sm ring-1 ring-blue-100' 
                              : 'bg-white border-slate-200 hover:border-slate-300'
                          }`}
                        >
                          {/* Current Lead Indicator Badge */}
                          {isCurrentLead && (
                            <span className="absolute -top-2.5 right-4 px-2 py-0.5 bg-blue-600 text-white text-[9px] font-bold uppercase rounded-md shadow-sm">
                              Şu Anki İnceleme
                            </span>
                          )}

                          {/* Lead Header */}
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <span className="inline-flex px-2 py-0.5 bg-slate-100 border border-slate-200 rounded text-xs font-bold text-slate-700">
                                {insuranceTypes.find(t => t.id === l.insurance_type)?.label || l.insurance_type}
                              </span>
                              <p className="text-[10px] text-slate-400 font-mono mt-1">ID: #{l.tracking_id} • {new Date(l.created_at).toLocaleDateString('tr-TR')}</p>
                            </div>
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                              l.status === 'NEW' ? 'bg-orange-100 text-orange-700' :
                              l.status === 'CONTACTED' ? 'bg-purple-100 text-purple-700' :
                              l.status === 'QUOTE_SENT' ? 'bg-yellow-100 text-yellow-700' :
                              l.status === 'SOLD' ? 'bg-green-100 text-green-700' :
                              'bg-slate-100 text-slate-700'
                            }`}>
                              {l.status}
                            </span>
                          </div>

                          {/* Quotes in this Lead */}
                          {hasQuotes ? (
                            <div className="mt-3 pt-3 border-t border-slate-100 space-y-2">
                              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">İletilen Teklif Alternatifleri</p>
                              {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                              {l.quotes.map((q: any) => (
                                <div key={q.id} className="flex justify-between items-center bg-slate-50 p-2 rounded-lg border border-slate-100">
                                  <div className="text-xs">
                                    <span className="font-bold text-slate-800">{q.company_name}</span>
                                    {q.installments && <span className="text-slate-400 text-[10px] ml-1.5">({q.installments})</span>}
                                  </div>
                                  <div className="flex items-center gap-3">
                                    <span className="font-black text-slate-900 text-xs">
                                      {new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(q.premium)}
                                    </span>
                                    {q.file_name && (
                                      <a 
                                        href={`/api/v1/quotes/${q.id}/download`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-blue-600 hover:text-blue-800 text-[10px] font-bold hover:underline"
                                      >
                                        İndir 📥
                                      </a>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p className="text-[10px] text-slate-400 italic mt-2">Bu talep için teklif çalışması yapılmamış.</p>
                          )}

                          {/* Quick merge / archive option for duplicates */}
                          {!isCurrentLead && l.status !== 'SOLD' && l.status !== 'LOST' && (
                            <div className="mt-3 flex justify-end">
                              <button
                                onClick={() => {
                                  showConfirm(
                                    "Talebi Arşivle",
                                    "Bu talebi mükerrer olarak arşivlemek istediğinize emin misiniz?",
                                    async () => {
                                      try {
                                        const res = await fetch(`/api/v1/leads/${l.id}`, {
                                          method: 'PATCH',
                                          headers: { 'Content-Type': 'application/json' },
                                          body: JSON.stringify({ is_archived: true })
                                        });
                                        const data = await res.json();
                                        if (data.success) {
                                          setLeads(prev => prev.map(item => item.id === l.id ? { ...item, is_archived: true } : item));
                                          showToast("Diğer talep mükerrer olduğu için başarıyla arşive kaldırıldı.");
                                        }
                                      } catch (err) {
                                        console.error(err);
                                        showToast("Bir hata oluştu.", "error");
                                      }
                                    }
                                  );
                                }}
                                className="text-[10px] px-2 py-1 bg-red-50 hover:bg-red-100 text-red-700 font-bold rounded-md border border-red-200 transition-colors cursor-pointer"
                              >
                                Diğer Talebi Arşivle (Temizle)
                              </button>
                            </div>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            );
          })()}
        </DialogContent>
      </Dialog>

      {/* Toast Stack */}
      <div className="fixed top-5 right-5 z-[9999] flex flex-col gap-2.5 max-w-sm pointer-events-none">
        {toasts.map(toast => (
          <div 
            key={toast.id}
            className={`pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg border text-sm font-semibold transition-all duration-300 transform translate-y-0 animate-fade-in-up ${
              toast.type === 'success' ? 'bg-emerald-50 text-emerald-800 border-emerald-200 shadow-emerald-100' :
              toast.type === 'error' ? 'bg-rose-50 text-rose-800 border-rose-200 shadow-rose-100' :
              'bg-slate-50 text-slate-800 border-slate-200 shadow-slate-100'
            }`}
          >
            {toast.type === 'success' && <span className="text-emerald-500 text-base">🟢</span>}
            {toast.type === 'error' && <span className="text-rose-500 text-base">🔴</span>}
            {toast.type === 'info' && <span className="text-blue-500 text-base">ℹ️</span>}
            <span>{toast.message}</span>
          </div>
        ))}
      </div>

      {/* Custom Confirmation Modal */}
      {confirmModal.isOpen && (
        <Dialog open={confirmModal.isOpen} onOpenChange={(open) => { if (!open) setConfirmModal(prev => ({ ...prev, isOpen: false })); }}>
          <DialogContent className="sm:max-w-[440px] p-6 rounded-2xl bg-white border border-slate-100 shadow-2xl animate-scale-up">
            
            {/* Top decorative header based on variant */}
            <div className="flex items-center gap-4 mb-4">
              <div className={`p-3 rounded-full ${
                confirmModal.variant === 'danger' ? 'bg-rose-50 text-rose-600 border border-rose-100' :
                confirmModal.variant === 'warning' ? 'bg-amber-50 text-amber-600 border border-amber-100' :
                'bg-blue-50 text-blue-600 border border-blue-100'
              }`}>
                {confirmModal.variant === 'danger' && (
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-6 h-6">
                    <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                  </svg>
                )}
                {confirmModal.variant === 'warning' && (
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-6 h-6">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
                  </svg>
                )}
                {confirmModal.variant === 'info' && (
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-6 h-6">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 111.085 1.086L12.5 13.5l.042-.02a.75.75 0 111.085 1.086L13.25 15M9 21h6M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707-.707M6.343 17.657l-.707-.707m12.728 0l-.707.707M6.343 6.343l-.707.707M12 8a4 4 0 100 8 4 4 0 000-8z" />
                  </svg>
                )}
              </div>
              <div>
                <DialogTitle className="text-base font-black text-slate-900 leading-none">
                  {confirmModal.title}
                </DialogTitle>
                <p className="text-[11px] text-slate-400 font-semibold mt-1 uppercase tracking-wider">Güvenlik Doğrulaması</p>
              </div>
            </div>

            <DialogDescription className="text-xs text-slate-500 font-semibold leading-relaxed mt-2 p-3 bg-slate-50 rounded-xl border border-slate-100/80">
              {confirmModal.message}
            </DialogDescription>

            <DialogFooter className="flex justify-end gap-2.5 mt-6 border-t border-slate-100 pt-4">
              <button
                onClick={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
                className="px-4 py-2 border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs rounded-xl transition-all cursor-pointer hover:scale-[1.02]"
              >
                İptal Et
              </button>
              <button
                onClick={() => confirmModal.onConfirm()}
                className={`px-4 py-2 text-white font-bold text-xs rounded-xl shadow-md transition-all cursor-pointer hover:scale-[1.02] ${
                  confirmModal.variant === 'danger' ? 'bg-rose-600 hover:bg-rose-700 shadow-rose-100' :
                  confirmModal.variant === 'warning' ? 'bg-amber-600 hover:bg-amber-700 shadow-amber-100' :
                  'bg-slate-900 hover:bg-slate-800 shadow-slate-100'
                }`}
              >
                Onayla
              </button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Custom Prompt Modal */}
      {promptModal.isOpen && (
        <PromptModalInner 
          title={promptModal.title}
          defaultValue={promptModal.defaultValue}
          onCancel={() => setPromptModal(prev => ({ ...prev, isOpen: false }))}
          onConfirm={promptModal.onConfirm}
        />
      )}

    </div>
  );
}

function PromptModalInner({ title, defaultValue, onCancel, onConfirm }: {
  title: string;
  defaultValue: string;
  onCancel: () => void;
  onConfirm: (val: string) => void | Promise<void>;
}) {
  const [val, setVal] = useState(defaultValue);
  return (
    <Dialog open={true} onOpenChange={(open) => { if (!open) onCancel(); }}>
      <DialogContent className="sm:max-w-[440px] p-6 rounded-2xl bg-white border border-slate-100 shadow-xl">
        <DialogHeader className="mb-4">
          <DialogTitle className="text-lg font-black text-slate-900 flex items-center gap-2">
            🚫 {title}
          </DialogTitle>
          <DialogDescription className="text-xs text-slate-400 font-semibold mt-1">
            İşlemin neden gerçekleştirilemediğini belirtmek için bir açıklama giriniz.
          </DialogDescription>
        </DialogHeader>
        <div className="my-4">
          <textarea
            value={val}
            onChange={(e) => setVal(e.target.value)}
            className="w-full min-h-[90px] p-3 text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 transition-colors placeholder:text-slate-400 text-slate-800"
            placeholder="Açıklama yazın..."
          />
        </div>
        <DialogFooter className="flex justify-end gap-2.5 mt-2 border-t border-slate-100 pt-4">
          <button
            onClick={onCancel}
            className="px-4 py-2 border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs rounded-xl transition-all cursor-pointer"
          >
            İptal Et
          </button>
          <button
            onClick={() => onConfirm(val)}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-sm transition-all cursor-pointer"
          >
            Notu Ekle ve Kaydet
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
