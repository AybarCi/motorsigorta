"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { MessageCircle, ShieldCheck, Zap, ArrowLeft, ArrowRight, Car, Home, HeartPulse, Briefcase } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import Image from "next/image";

const insuranceCategories = [
  { id: "vehicle", label: "Araç Sigortaları", icon: Car, desc: "Trafik, Kasko ve Motosiklet güvenceleri." },
  { id: "home", label: "Ev & Konut", icon: Home, desc: "DASK ve Konut sigortası ile evinizi koruyun." },
  { id: "health", label: "Sağlık", icon: HeartPulse, desc: "Özel ve Tamamlayıcı Sağlık Sigortaları." },
  { id: "business", label: "Kurumsal", icon: Briefcase, desc: "İşyeri, Fabrika ve Yangın güvenceleri." },
];

const insuranceTypes = [
  {
    id: "TRAFFIC", category: "vehicle", label: "Trafik Sigortası", image: "/car_ins.png",
    desc: "Zorunlu Trafik Sigortası ile yola güvenle çıkın. Aracınızın üçüncü şahıslara verebileceği zararları güvence altına alır."
  },
  {
    id: "KASKO", category: "vehicle", label: "Genişletilmiş Kasko", image: "/kasko_ins.png",
    desc: "Aracınızı kaza, çalınma, yangın ve doğal afetlere karşı tam kapsamlı koruyun. Aracınızın değerini asla riske atmayın."
  },
  {
    id: "MOTORCYCLE", category: "vehicle", label: "Motosiklet Sigortası", image: "/moto_ins.png",
    desc: "Tutkunuzu riske atmayın. Motosikletiniz için kaza, çalınma ve hasar durumlarına karşı özel tasarlanmış güvenceler."
  },
  {
    id: "DASK", category: "home", label: "Zorunlu Deprem (DASK)", image: "/dask_ins.png",
    desc: "Depremin ve deprem sonucu meydana gelen yangın, infilak, dev dalga veya yer kaymasının vereceği maddi zararları karşılar."
  },
  {
    id: "HOME_CONTENT", category: "home", label: "Ev & Eşya Sigortası", image: "/home_ins.png",
    desc: "Evinizi ve içindeki eşyaları hırsızlık, su baskını, yangın gibi beklenmedik durumlara karşı tam kapsamlı güvence altına alın."
  },
  {
    id: "HEALTH", category: "health", label: "Özel & Tamamlayıcı Sağlık", image: "/health_ins.png",
    desc: "Sağlığınız en değerli hazineniz. Anlaşmalı özel hastanelerde fark ücreti ödemeden geniş kapsamlı tedavi imkanına kavuşun."
  },
  {
    id: "BUSINESS", category: "business", label: "İş Yeri & Fabrika", image: "/factory_ins.png",
    desc: "Emeğinizi ve yatırımınızı koruyun. Kobi'lerden fabrikalara kadar tüm ticari varlıklarınızı risklere karşı esnek çözümlerle koruyun."
  },
  {
    id: "FIRE", category: "business", label: "İş Yeri Yangın Sigortası", image: "/fire_ins.png",
    desc: "Ticari yatırımlarınızı yangın, yıldırım, infilak ve dumanın vereceği dolaylı zararlara karşı yüksek teminatla koruyun."
  },
  {
    id: "FIRE", category: "home", label: "Ev Yangın Sigortası", image: "/fire_ins.png",
    desc: "Evinizi yangın, yıldırım, infilak ve dumanın vereceği doğrudan zararlara karşı güvence altına alın."
  },
];

const phoneSchema = z.string().min(10, "Geçerli bir telefon numarası girin (Örn: 05XX1234567)");

type FormValues = {
  phone: string;
  plate?: string;
  city?: string;
  ageGroup?: string;
  sector?: string;
};

export default function LandingPage() {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [selectedModalType, setSelectedModalType] = useState<any | null>(null);

  const formRef = useRef<HTMLElement>(null);

  const getSchema = () => {
    if (["TRAFFIC", "KASKO", "MOTORCYCLE"].includes(selectedType || "")) {
      return z.object({
        phone: phoneSchema,
        plate: z.string().min(5, "Geçerli plaka girin (Örn: 34ABC123)"),
      });
    }
    if (["DASK", "HOME_CONTENT"].includes(selectedType || "") || (selectedType === "FIRE" && selectedCategory === "home")) {
      return z.object({
        phone: phoneSchema,
        city: z.string().min(3, "Şehir adı girin"),
      });
    }
    if (selectedType === "HEALTH") {
      return z.object({
        phone: phoneSchema,
        ageGroup: z.string().min(1, "Yaş aralığı belirtin (Örn: 25-35)"),
      });
    }
    if (selectedType === "BUSINESS" || (selectedType === "FIRE" && selectedCategory === "business")) {
      return z.object({
        phone: phoneSchema,
        sector: z.string().min(2, "Sektör belirtin (Örn: Tekstil)"),
      });
    }
    return z.object({ phone: phoneSchema });
  };

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } = useForm<FormValues>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(getSchema() as any),
    shouldUnregister: true,
  });

  const handleSelectCategory = (categoryId: string) => {
    setSelectedCategory(categoryId);
    setStep(2);
  };

  const handleSelectType = (id: string) => {
    setSelectedType(id);
    reset();
    setStep(3);

    setTimeout(() => {
      formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 100);
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleSelectFromModal = (typeObj: any) => {
    setSelectedModalType(null); // close modal
    setSelectedCategory(typeObj.category);
    handleSelectType(typeObj.id);
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const onSubmit = async (data: any) => {
    setIsSubmitting(true);
    try {
      const randomNum = Math.floor(1000 + Math.random() * 9000);
      const trkId = `TRK-${new Date().getFullYear()}-${randomNum}`;

      const payload = {
        tracking_id: trkId,
        insurance_category: selectedCategory,
        insurance_type: selectedType,
        dynamic_fields: data,
        phone: data.phone,
        utm_source: new URLSearchParams(window.location.search).get("utm_source") || "direct",
        utm_campaign: new URLSearchParams(window.location.search).get("utm_campaign") || "organic",
      };

      // Background request (no await)
      fetch("/api/v1/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      }).catch(console.error);

      // Meta Pixel: Lead event tracking
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      if (typeof window !== 'undefined' && (window as any).fbq) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (window as any).fbq('track', 'Lead', {
          content_category: selectedCategory,
          content_name: selectedType,
        });
      }

      const typeLabel = insuranceTypes.find(t => t.id === selectedType && t.category === selectedCategory)?.label || selectedType;
      const dynamicDetail = data.plate || data.city || data.ageGroup || data.sector || "";

      const message = `Merhaba, ${typeLabel} için teklif almak istiyorum. (Kayıt No: ${trkId}${dynamicDetail ? ` - ${dynamicDetail}` : ''})`;
      const whatsappUrl = `https://wa.me/905421778953?text=${encodeURIComponent(message)}`;

      window.location.href = whatsappUrl;
    } catch (error) {
      console.error(error);
      setIsSubmitting(false); // Only reset if there's a sync error, otherwise let it navigate
    }
  };

  const currentCategoryTypes = insuranceTypes.filter(t => t.category === selectedCategory);

  return (
    <div className="min-h-screen bg-background text-foreground font-sans overflow-x-hidden relative">

      <div className="absolute inset-0 z-0 h-[80vh] w-full">
        <Image src="/hero_bg.png" alt="Hero Background" fill className="object-cover opacity-30" priority />
        <div className="absolute inset-0 bg-gradient-to-b from-background/40 via-background/80 to-background" />
      </div>

      <header className="absolute top-0 left-0 w-full z-50 -mt-2 md:-mt-4 px-4 md:px-8">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="relative w-72 h-28 md:w-96 md:h-36 cursor-pointer -ml-4">
            <Image src="/logo-dark.png" alt="Sigomax Logo" fill className="object-contain object-left" priority />
          </div>
          <div className="hidden md:flex items-center gap-6">
            <a 
              href="https://wa.me/905421778953" 
              target="_blank" 
              rel="noreferrer" 
              className="text-sm font-semibold px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-white transition-all backdrop-blur-md"
              onClick={() => {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                if (typeof window !== 'undefined' && (window as any).fbq) {
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  (window as any).fbq('track', 'Contact');
                }
              }}
            >
              Destek
            </a>
            {/* <a href="/admin" className="text-sm font-semibold px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-white transition-all backdrop-blur-md">
              Acente Girişi
            </a> */}
          </div>
        </div>
      </header>

      <a
        href="https://wa.me/905421778953?text=Merhaba,%20sigorta%20teklifleri%20hakkında%20bilgi%20almak%20istiyorum"
        target="_blank"
        rel="noopener noreferrer"
        className="hidden md:flex fixed bottom-6 right-6 z-50 bg-[#25D366] text-white p-4 rounded-full shadow-[0_0_30px_rgba(37,211,102,0.6)] hover:scale-110 transition-transform duration-300 items-center justify-center"
        onClick={() => {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          if (typeof window !== 'undefined' && (window as any).fbq) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (window as any).fbq('track', 'Contact');
          }
        }}
      >
        <MessageCircle size={32} />
      </a>

      <section ref={formRef} className="relative z-10 pt-32 pb-24 px-4 md:px-8 max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="space-y-8"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/20 border border-primary/30 text-primary text-sm font-medium shadow-[0_0_15px_rgba(var(--primary),0.3)]">
            <Zap size={16} />
            <span>Türkiye&apos;nin En Hızlı Teklif Ağı</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-black leading-tight drop-shadow-2xl">
            Sigorta Tekliflerini <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-emerald-400">
              Anında
            </span> <br />
            Karşılaştır.
          </h1>
          <p className="text-xl text-muted-foreground max-w-lg leading-relaxed">
            İhtiyacına en uygun sigorta tekliflerini lisanslı acentelerden hızlıca al, kolayca karşılaştır. <br /><br />
            <span className="font-semibold text-foreground">Sigorta türünü seç → Teklifleri görüntüle → WhatsApp&apos;tan uzmanla görüş</span>
          </p>
          <div className="flex flex-wrap items-center gap-6 pt-4">
            <div className="flex items-center gap-2 text-sm font-semibold text-slate-300">
              <ShieldCheck size={18} className="text-primary" />
              Lisanslı Partnerler
            </div>
            <div className="flex items-center gap-2 text-sm font-semibold text-slate-300">
              <Zap size={18} className="text-emerald-400" />
              Hızlı Teklif Süreci
            </div>
            <div className="flex items-center gap-2 text-sm font-semibold text-slate-300">
              <MessageCircle size={18} className="text-[#25D366]" />
              WhatsApp Destekli
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="relative min-h-[450px]"
        >
          <AnimatePresence mode="wait">

            {/* STEP 1: CATEGORY SELECTION */}
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, x: -50 }}
                transition={{ duration: 0.3 }}
              >
                <Card className="border-primary/30 shadow-[0_0_60px_rgba(var(--primary),0.15)] bg-card/60 backdrop-blur-2xl rounded-3xl overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary to-transparent opacity-50" />
                  <CardContent className="p-8 space-y-6">
                    <div className="space-y-2 mb-8">
                      <h3 className="text-3xl font-bold">Neye İhtiyacın Var?</h3>
                      <p className="text-muted-foreground">Kategori seçerek teklif sürecini başlat.</p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {insuranceCategories.map((cat) => {
                        const Icon = cat.icon;
                        return (
                          <button
                            key={cat.id}
                            onClick={() => handleSelectCategory(cat.id)}
                            className="flex flex-col items-start gap-3 p-5 rounded-2xl border border-border/50 bg-background/50 hover:bg-primary/10 hover:border-primary/50 transition-all group text-left"
                          >
                            <div className="p-3 bg-card rounded-xl group-hover:bg-primary/20 text-primary transition-colors">
                              <Icon size={24} />
                            </div>
                            <div>
                              <h4 className="font-bold text-lg">{cat.label}</h4>
                              <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{cat.desc}</p>
                            </div>
                          </button>
                        )
                      })}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* STEP 2: TYPE SELECTION */}
            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                transition={{ duration: 0.3 }}
              >
                <Card className="border-primary/30 shadow-[0_0_60px_rgba(var(--primary),0.15)] bg-card/60 backdrop-blur-2xl rounded-3xl overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary to-transparent opacity-50" />
                  <CardContent className="p-8 space-y-6">
                    <div className="flex items-center gap-4 mb-8">
                      <button onClick={() => setStep(1)} className="p-3 bg-background rounded-full border border-border hover:bg-muted transition-colors">
                        <ArrowLeft size={20} />
                      </button>
                      <div>
                        <h3 className="text-2xl font-bold">{insuranceCategories.find(c => c.id === selectedCategory)?.label}</h3>
                        <p className="text-muted-foreground text-sm">Hangi sigorta türü ile ilgileniyorsun?</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 gap-4">
                      {currentCategoryTypes.map((type) => (
                        <button
                          key={`${type.category}-${type.id}`}
                          onClick={() => handleSelectType(type.id)}
                          className="flex items-center justify-between p-4 rounded-2xl border border-border/50 bg-background/50 hover:bg-primary/20 hover:border-primary/50 transition-all group"
                        >
                          <div className="text-left">
                            <span className="font-bold block group-hover:text-primary transition-colors">{type.label}</span>
                          </div>
                          <ArrowRight size={18} className="text-muted-foreground opacity-0 group-hover:opacity-100 group-hover:text-primary transition-all transform group-hover:translate-x-1" />
                        </button>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* STEP 3: FORM */}
            {step === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.3 }}
              >
                <Card className="border-primary/30 shadow-[0_0_60px_rgba(var(--primary),0.15)] bg-card/60 backdrop-blur-2xl rounded-3xl overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary to-transparent opacity-50" />
                  <CardContent className="p-8 space-y-6">
                    <div className="flex items-center gap-4 mb-8">
                      <button onClick={() => setStep(2)} className="p-3 bg-background rounded-full border border-border hover:bg-muted transition-colors">
                        <ArrowLeft size={20} />
                      </button>
                      <div>
                        <h3 className="text-2xl font-bold">{insuranceTypes.find(t => t.id === selectedType && t.category === selectedCategory)?.label}</h3>
                        <p className="text-muted-foreground text-sm">Detayları girerek teklif sürecine ilerle.</p>
                      </div>
                    </div>

                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                      {["TRAFFIC", "KASKO", "MOTORCYCLE"].includes(selectedType || "") && (
                        <div className="space-y-2">
                          <Label htmlFor="plate" className="text-sm font-semibold">Plaka</Label>
                          <Input
                            id="plate"
                            placeholder="34 ABC 123"
                            className="h-14 text-lg uppercase bg-background/50 border-border/50 focus-visible:ring-primary rounded-xl"
                            {...register("plate")}
                          />
                          {errors.plate && <p className="text-destructive text-sm">{errors.plate?.message as string}</p>}
                        </div>
                      )}

                      {["DASK", "HOME_CONTENT"].includes(selectedType || "") || (selectedType === "FIRE" && selectedCategory === "home") ? (
                        <div className="space-y-2">
                          <Label htmlFor="city" className="text-sm font-semibold">Şehir</Label>
                          <Input
                            id="city"
                            placeholder="Örn: İstanbul"
                            className="h-14 text-lg bg-background/50 border-border/50 focus-visible:ring-primary rounded-xl"
                            {...register("city")}
                          />
                          {errors.city && <p className="text-destructive text-sm">{errors.city?.message as string}</p>}
                        </div>
                      ) : null}

                      {selectedType === "HEALTH" && (
                        <div className="space-y-2">
                          <Label htmlFor="ageGroup" className="text-sm font-semibold">Yaş Aralığı</Label>
                          <Input
                            id="ageGroup"
                            placeholder="Örn: 25-35"
                            className="h-14 text-lg bg-background/50 border-border/50 focus-visible:ring-primary rounded-xl"
                            {...register("ageGroup")}
                          />
                          {errors.ageGroup && <p className="text-destructive text-sm">{errors.ageGroup?.message as string}</p>}
                        </div>
                      )}

                      {(selectedType === "BUSINESS" || (selectedType === "FIRE" && selectedCategory === "business")) && (
                        <div className="space-y-2">
                          <Label htmlFor="sector" className="text-sm font-semibold">Sektör</Label>
                          <Input
                            id="sector"
                            placeholder="Örn: Tekstil, Gıda"
                            className="h-14 text-lg bg-background/50 border-border/50 focus-visible:ring-primary rounded-xl"
                            {...register("sector")}
                          />
                          {errors.sector && <p className="text-destructive text-sm">{errors.sector?.message as string}</p>}
                        </div>
                      )}

                      <div className="space-y-2">
                        <Label htmlFor="phone" className="text-sm font-semibold">Telefon Numarası</Label>
                        <Input
                          id="phone"
                          type="tel"
                          placeholder="05XX XXX XX XX"
                          className="h-14 text-lg bg-background/50 border-border/50 focus-visible:ring-primary rounded-xl"
                          {...register("phone")}
                        />
                        {errors.phone && <p className="text-destructive text-sm">{errors.phone?.message as string}</p>}
                      </div>

                      <Button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full h-16 text-xl font-black rounded-xl shadow-[0_0_20px_rgba(var(--primary),0.3)] hover:shadow-[0_0_40px_rgba(var(--primary),0.6)] transition-all mt-4"
                      >
                        {isSubmitting ? "Sisteme İletiliyor..." : "Teklif Al"}
                      </Button>
                      <p className="text-xs text-center text-muted-foreground pt-2">
                        Teklif Al&apos;a tıklayarak yasal metinleri onaylamış olursunuz.
                      </p>
                    </form>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </section>

      <section className="relative z-10 py-32 bg-background border-t border-border/20">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="text-center mb-20 space-y-6">
            <h2 className="text-4xl md:text-5xl font-black drop-shadow-lg">Hangi Sigorta Sana Uygun?</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">Hayatın her alanında güvende kalman için sunduğumuz premium sigorta çözümlerini incele.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {insuranceTypes.map((type) => (
              <Card
                key={`${type.category}-${type.id}`}
                className="group cursor-pointer border-border/20 bg-card/40 hover:bg-card/80 overflow-hidden transition-all duration-500 hover:shadow-[0_0_30px_rgba(var(--primary),0.2)]"
                onClick={() => setSelectedModalType(type)}
              >
                <div className="relative h-48 w-full overflow-hidden">
                  <Image
                    src={type.image}
                    alt={type.label}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent opacity-80" />
                  <div className="absolute bottom-4 left-4 right-4">
                    <span className="text-xs font-bold text-primary mb-1 block uppercase">{insuranceCategories.find(c => c.id === type.category)?.label}</span>
                    <h3 className="text-xl font-bold text-white drop-shadow-md leading-tight">
                      {type.label}
                    </h3>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <Dialog open={!!selectedModalType} onOpenChange={(open) => !open && setSelectedModalType(null)}>
        <DialogContent className="max-w-3xl p-0 bg-card border-border/30 overflow-hidden rounded-3xl">
          {selectedModalType && (
            <div className="relative">
              <div className="relative h-72 w-full">
                <Image src={selectedModalType.image} alt={selectedModalType.label} fill className="object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent" />
              </div>
              <div className="p-8 space-y-6 relative z-10 -mt-16">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/20 border border-primary/30 text-primary text-xs font-bold uppercase tracking-wider">
                  {insuranceCategories.find(c => c.id === selectedModalType.category)?.label}
                </div>
                <h2 className="text-4xl font-black drop-shadow-lg">{selectedModalType.label}</h2>
                <p className="text-lg text-muted-foreground leading-relaxed">
                  {selectedModalType.desc}
                </p>
                <div className="pt-6">
                  <Button
                    size="lg"
                    className="w-full h-16 text-xl font-bold rounded-xl shadow-[0_0_20px_rgba(var(--primary),0.3)] hover:shadow-[0_0_40px_rgba(var(--primary),0.6)] transition-all"
                    onClick={() => handleSelectFromModal(selectedModalType)}
                  >
                    Bunun İçin Teklif Al
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <section className="py-24 bg-card/20 border-t border-border/20 relative z-10">
        <div className="max-w-6xl mx-auto px-4 md:px-8">
          <div className="text-center mb-16 space-y-4">
            <h2 className="text-3xl md:text-4xl font-bold">Neden Biz?</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">Seni lisanslı ve yetkili sigorta acentelerinden teklif alabileceğin tek bir noktada buluşturan bağımsız bir platformuz.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="bg-background/40 border-border/30 hover:border-primary/50 transition-colors rounded-2xl">
              <CardContent className="p-8 text-center space-y-4 flex flex-col items-center">
                <div className="w-14 h-14 bg-primary/10 rounded-full flex items-center justify-center text-primary shadow-[0_0_15px_rgba(var(--primary),0.2)]">
                  <Zap size={28} />
                </div>
                <h4 className="text-xl font-bold">Hızlı Teklif Karşılaştırma</h4>
                <p className="text-muted-foreground text-sm">Bilgilerini girerek farklı acentelerden gelen teklifleri kolayca görüntüleyebilirsin.</p>
              </CardContent>
            </Card>
            <Card className="bg-background/40 border-border/30 hover:border-primary/50 transition-colors rounded-2xl">
              <CardContent className="p-8 text-center space-y-4 flex flex-col items-center">
                <div className="w-14 h-14 bg-primary/10 rounded-full flex items-center justify-center text-primary shadow-[0_0_15px_rgba(var(--primary),0.2)]">
                  <MessageCircle size={28} />
                </div>
                <h4 className="text-xl font-bold">WhatsApp Destekli Süreç</h4>
                <p className="text-muted-foreground text-sm">Tüm teklif sürecini WhatsApp üzerinden takip edebilir, uzmanlardan bilgi alabilirsin.</p>
              </CardContent>
            </Card>
            <Card className="bg-background/40 border-border/30 hover:border-primary/50 transition-colors rounded-2xl">
              <CardContent className="p-8 text-center space-y-4 flex flex-col items-center">
                <div className="w-14 h-14 bg-primary/10 rounded-full flex items-center justify-center text-primary shadow-[0_0_15px_rgba(var(--primary),0.2)]">
                  <ShieldCheck size={28} />
                </div>
                <h4 className="text-xl font-bold">Bağımsız Platform</h4>
                <p className="text-muted-foreground text-sm">Sigorta satışı yapmayız. Kullanıcıları yalnızca lisanslı sigorta acenteleriyle buluşturan bağımsız bir yönlendirme platformuyuz.</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <footer className="py-12 border-t border-border/20 bg-background relative z-10 text-center text-muted-foreground text-sm px-4">
        <p>© 2026 Sigorta Teklif ve Yönlendirme Platformu. Tüm hakları saklıdır.</p>
        <p className="mt-2 opacity-70 text-xs max-w-2xl mx-auto">
          Yasal Bilgilendirme: Bu platform bir sigorta şirketi veya acentesi değildir. Sigorta poliçesi düzenleme veya doğrudan satış yapılmaz.
          Amaç, kullanıcıları lisanslı acentelerle buluşturarak teklif alma sürecini kolaylaştırmaktır.
        </p>
      </footer>

      {/* Sticky Mobile CTA */}
      <div className="md:hidden fixed bottom-0 left-0 w-full z-50 bg-background/90 backdrop-blur-xl border-t border-border/50 p-4 flex gap-3 shadow-[0_-10px_40px_rgba(0,0,0,0.2)]">
        <button 
          onClick={() => {
            formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
            setStep(1);
          }}
          className="flex-1 bg-primary text-primary-foreground font-bold rounded-xl py-3 shadow-lg"
        >
          Teklif Al
        </button>
        <a 
          href="https://wa.me/905421778953?text=Merhaba,%20sigorta%20teklifleri%20hakkında%20bilgi%20almak%20istiyorum"
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 bg-[#25D366] text-white font-bold rounded-xl py-3 flex items-center justify-center gap-2 shadow-lg"
          onClick={() => {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            if (typeof window !== 'undefined' && (window as any).fbq) {
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              (window as any).fbq('track', 'Contact');
            }
          }}
        >
          <MessageCircle size={18} /> WhatsApp
        </a>
      </div>
    </div>
  );
}
