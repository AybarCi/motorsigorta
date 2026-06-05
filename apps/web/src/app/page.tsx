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
    id: "PET", category: "health", label: "Evcil Hayvan Sigortası", image: "/pet_ins.png",
    desc: "Küçük dostunuzun sağlığını güvence altına alın. Veteriner muayenesi, tedavi ve acil durumlarda yanınızdayız."
  },
  {
    id: "TRAVEL", category: "health", label: "Seyahat Sağlık Sigortası", image: "/travel_ins.png",
    desc: "Yurt dışı ve yurt içi seyahatlerinizde ani rahatsızlık, kaza ve bagaj kaybı gibi durumlara karşı tam güvenceyle yola çıkın."
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

const countriesList = [
  { code: "AF", name: "Afganistan" },
  { code: "AX", name: "Aland Adaları" },
  { code: "DE", name: "Almanya" },
  { code: "US", name: "Amerika Birleşik Devletleri" },
  { code: "AS", name: "Amerikan Samoası" },
  { code: "AD", name: "Andorra" },
  { code: "AO", name: "Angola" },
  { code: "AI", name: "Anguilla" },
  { code: "AQ", name: "Antarktika" },
  { code: "AG", name: "Antigua ve Barbuda" },
  { code: "AR", name: "Arjantin" },
  { code: "AL", name: "Arnavutluk" },
  { code: "AW", name: "Aruba" },
  { code: "AU", name: "Avustralya" },
  { code: "AT", name: "Avusturya" },
  { code: "AZ", name: "Azerbaycan" },
  { code: "BS", name: "Bahamalar" },
  { code: "BH", name: "Bahreyn" },
  { code: "BD", name: "Bangladeş" },
  { code: "BB", name: "Barbados" },
  { code: "EH", name: "Batı Sahra" },
  { code: "BY", name: "Beyaz Rusya" },
  { code: "BE", name: "Belçika" },
  { code: "BZ", name: "Belize" },
  { code: "BJ", name: "Benin" },
  { code: "BM", name: "Bermuda" },
  { code: "BT", name: "Butan" },
  { code: "BO", name: "Bolivya" },
  { code: "BQ", name: "Bonaire, Saint Eustatius ve Saba" },
  { code: "BA", name: "Bosna Hersek" },
  { code: "BW", name: "Botsvana" },
  { code: "BV", name: "Bouvet Adası" },
  { code: "BR", name: "Brezilya" },
  { code: "BN", name: "Brunei" },
  { code: "BG", name: "Bulgaristan" },
  { code: "BF", name: "Burkina Faso" },
  { code: "BI", name: "Burundi" },
  { code: "GI", name: "Cebelitarık" },
  { code: "DZ", name: "Cezayir" },
  { code: "CX", name: "Noel Adası" },
  { code: "CC", name: "Cocos (Keeling) Adaları" },
  { code: "CK", name: "Cook Adaları" },
  { code: "CW", name: "Curacao" },
  { code: "TD", name: "Çad" },
  { code: "CZ", name: "Çek Cumhuriyeti" },
  { code: "CN", name: "Çin" },
  { code: "DK", name: "Danimarka" },
  { code: "CD", name: "Demokratik Kongo Cumhuriyeti" },
  { code: "DJ", name: "Cibuti" },
  { code: "DM", name: "Dominika" },
  { code: "DO", name: "Dominik Cumhuriyeti" },
  { code: "EC", name: "Ekvador" },
  { code: "EG", name: "Mısır" },
  { code: "SV", name: "El Salvador" },
  { code: "GQ", name: "Ekvator Ginesi" },
  { code: "ER", name: "Eritre" },
  { code: "EE", name: "Estonya" },
  { code: "ET", name: "Etiyopya" },
  { code: "FK", name: "Falkland Adaları" },
  { code: "FO", name: "Faroe Adaları" },
  { code: "FJ", name: "Fiji" },
  { code: "FI", name: "Finlandiya" },
  { code: "FR", name: "Fransa" },
  { code: "GF", name: "Fransız Guyanası" },
  { code: "PF", name: "Fransız Polinezyası" },
  { code: "TF", name: "Fransız Güney Toprakları" },
  { code: "GA", name: "Gabon" },
  { code: "GM", name: "Gambiya" },
  { code: "GE", name: "Gürcistan" },
  { code: "GH", name: "Gana" },
  { code: "GR", name: "Yunanistan" },
  { code: "GL", name: "Grönland" },
  { code: "GD", name: "Grenada" },
  { code: "GP", name: "Guadeloupe" },
  { code: "GU", name: "Guam" },
  { code: "GT", name: "Guatemala" },
  { code: "GG", name: "Guernsey" },
  { code: "GN", name: "Gine" },
  { code: "GW", name: "Gine-Bissau" },
  { code: "GY", name: "Guyana" },
  { code: "HT", name: "Haiti" },
  { code: "HM", name: "Heard Adası ve McDonald Adaları" },
  { code: "VA", name: "Vatikan" },
  { code: "HN", name: "Honduras" },
  { code: "HK", name: "Hong Kong" },
  { code: "HU", name: "Macaristan" },
  { code: "IS", name: "İzlanda" },
  { code: "IN", name: "Hindistan" },
  { code: "ID", name: "Endonezya" },
  { code: "IR", name: "İran" },
  { code: "IQ", name: "Irak" },
  { code: "IE", name: "İrlanda" },
  { code: "IM", name: "Isle of Man" },
  { code: "IL", name: "İsrail" },
  { code: "IT", name: "İtalya" },
  { code: "JM", name: "Jamaika" },
  { code: "JP", name: "Japonya" },
  { code: "JE", name: "Jersey" },
  { code: "JO", name: "Ürdün" },
  { code: "KZ", name: "Kazakistan" },
  { code: "KE", name: "Kenya" },
  { code: "KI", name: "Kiribati" },
  { code: "KP", name: "Kuzey Kore" },
  { code: "KR", name: "Güney Kore" },
  { code: "KW", name: "Kuveyt" },
  { code: "KG", name: "Kırgızistan" },
  { code: "LA", name: "Laos" },
  { code: "LV", name: "Letonya" },
  { code: "LB", name: "Lübnan" },
  { code: "LS", name: "Lesotho" },
  { code: "LR", name: "Liberya" },
  { code: "LY", name: "Libya" },
  { code: "LI", name: "Lihtenştayn" },
  { code: "LT", name: "Litvanya" },
  { code: "LU", name: "Lüksemburg" },
  { code: "MO", name: "Makao" },
  { code: "MK", name: "Makedonya" },
  { code: "MG", name: "Madagaskar" },
  { code: "MW", name: "Malavi" },
  { code: "MY", name: "Malezya" },
  { code: "MV", name: "Maldivler" },
  { code: "ML", name: "Mali" },
  { code: "MT", name: "Malta" },
  { code: "MH", name: "Marshall Adaları" },
  { code: "MQ", name: "Martinik" },
  { code: "MR", name: "Moritanya" },
  { code: "MU", name: "Mauritius" },
  { code: "YT", name: "Mayotte" },
  { code: "MX", name: "Meksika" },
  { code: "FM", name: "Mikronezya" },
  { code: "MD", name: "Moldova" },
  { code: "MC", name: "Monako" },
  { code: "MN", name: "Moğolistan" },
  { code: "ME", name: "Karadağ" },
  { code: "MS", name: "Montserrat" },
  { code: "MA", name: "Fas" },
  { code: "MZ", name: "Mozambik" },
  { code: "MM", name: "Myanmar" },
  { code: "NA", name: "Namibya" },
  { code: "NR", name: "Nauru" },
  { code: "NP", name: "Nepal" },
  { code: "NL", name: "Hollanda" },
  { code: "NC", name: "Yeni Kaledonya" },
  { code: "NZ", name: "Yeni Zelanda" },
  { code: "NI", name: "Nikaragua" },
  { code: "NE", name: "Nijer" },
  { code: "NG", name: "Nijerya" },
  { code: "NU", name: "Niue" },
  { code: "NF", name: "Norfolk Adası" },
  { code: "MP", name: "Kuzey Mariana Adaları" },
  { code: "NO", name: "Norveç" },
  { code: "OM", name: "Umman" },
  { code: "PK", name: "Pakistan" },
  { code: "PW", name: "Palau" },
  { code: "PS", name: "Filistin" },
  { code: "PA", name: "Panama" },
  { code: "PG", name: "Papua Yeni Gine" },
  { code: "PY", name: "Paraguay" },
  { code: "PE", name: "Peru" },
  { code: "PH", name: "Filipinler" },
  { code: "PN", name: "Pitcairn Adaları" },
  { code: "PL", name: "Polonya" },
  { code: "PT", name: "Portekiz" },
  { code: "PR", name: "Porto Riko" },
  { code: "QA", name: "Katar" },
  { code: "RE", name: "Reunion" },
  { code: "RO", name: "Romanya" },
  { code: "RU", name: "Rusya" },
  { code: "RW", name: "Ruanda" },
  { code: "BL", name: "Saint Barthelemy" },
  { code: "SH", name: "Saint Helena" },
  { code: "KN", name: "Saint Kitts ve Nevis" },
  { code: "LC", name: "Saint Lucia" },
  { code: "MF", name: "Saint Martin" },
  { code: "PM", name: "Saint Pierre ve Miquelon" },
  { code: "VC", name: "Saint Vincent ve Grenadinler" },
  { code: "WS", name: "Samoa" },
  { code: "SM", name: "San Marino" },
  { code: "ST", name: "Sao Tome ve Principe" },
  { code: "SA", name: "Suudi Arabistan" },
  { code: "SN", name: "Senegal" },
  { code: "RS", name: "Sırbistan" },
  { code: "SC", name: "Seyşel Adaları" },
  { code: "SL", name: "Sierra Leone" },
  { code: "SG", name: "Singapur" },
  { code: "SX", name: "Sint Maarten" },
  { code: "SK", name: "Slovakya" },
  { code: "SI", name: "Slovenya" },
  { code: "SB", name: "Solomon Adaları" },
  { code: "SO", name: "Somali" },
  { code: "ZA", name: "Güney Afrika" },
  { code: "GS", name: "Güney Georgia ve Güney Sandviç Adaları" },
  { code: "SS", name: "Güney Sudan" },
  { code: "ES", name: "İspanya" },
  { code: "LK", name: "Sri Lanka" },
  { code: "SD", name: "Sudan" },
  { code: "SR", name: "Surinam" },
  { code: "SJ", name: "Svalbard ve Jan Mayen" },
  { code: "SZ", name: "Svaziland" },
  { code: "SE", name: "İsveç" },
  { code: "CH", name: "İsviçre" },
  { code: "SY", name: "Suriye" },
  { code: "TW", name: "Tayvan" },
  { code: "TJ", name: "Tacikistan" },
  { code: "TZ", name: "Tanzanya" },
  { code: "TH", name: "Tayland" },
  { code: "TL", name: "Doğu Timor" },
  { code: "TG", name: "Togo" },
  { code: "TK", name: "Tokelau" },
  { code: "TO", name: "Tonga" },
  { code: "TT", name: "Trinidad ve Tobago" },
  { code: "TN", name: "Tunus" },
  { code: "TR", name: "Türkiye" },
  { code: "TM", name: "Türkmenistan" },
  { code: "TC", name: "Turks ve Caicos Adaları" },
  { code: "TV", name: "Tuvalu" },
  { code: "UG", name: "Uganda" },
  { code: "UA", name: "Ukrayna" },
  { code: "AE", name: "Birleşik Arap Emirlikleri" },
  { code: "GB", name: "Birleşik Krallık" },
  { code: "UY", name: "Uruguay" },
  { code: "UZ", name: "Özbekistan" },
  { code: "VU", name: "Vanuatu" },
  { code: "VE", name: "Venezuela" },
  { code: "VN", name: "Vietnam" },
  { code: "WF", name: "Wallis ve Futuna" },
  { code: "YE", name: "Yemen" },
  { code: "ZM", name: "Zambiya" },
  { code: "ZW", name: "Zimbabve" }
];

const phoneSchema = z.string().regex(/^05\d{2} \d{3} \d{2} \d{2}$/, "Geçerli bir telefon numarası girin (Örn: 05XX XXX XX XX)");

type FormValues = {
  phone: string;
  tc_no?: string;
  document_no?: string;
  plate?: string;
  city?: string;
  ageGroup?: string;
  sector?: string;
  has_previous_policy?: string;
  previous_policy_number?: string;
  health_insured_for?: string;
  health_plan_type?: string;
  health_policy_status?: string;
  travel_citizenship?: string;
  passport_no?: string;
  nationality?: string;
  full_name?: string;
  birth_date?: string;
  birth_place?: string;
  gender?: string;
  address?: string;
  departure_date?: string;
  return_date?: string;
  travel_reason?: string;
  travel_region?: string;
  travel_country?: string;
};

export default function LandingPage() {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [selectedModalType, setSelectedModalType] = useState<any | null>(null);
  const [travelSubStep, setTravelSubStep] = useState<1 | 2>(1);

  const formRef = useRef<HTMLElement>(null);

  const getSchema = () => {
    if (["TRAFFIC", "KASKO", "MOTORCYCLE"].includes(selectedType || "")) {
      return z.object({
        phone: phoneSchema,
        plate: z.string().min(5, "Geçerli plaka girin (Örn: 34ABC123)"),
        tc_no: z.string().regex(/^[0-9]{11}$/, "TC Kimlik numarası 11 haneli olmalıdır"),
        document_no: z.string().regex(/^[a-zA-Z]{2}[0-9]{6}$/, "Tescil Belge Numarası 2 harf ve 6 rakamdan oluşmalıdır (Örn: AA123456)"),
      });
    }
    if (["DASK", "HOME_CONTENT"].includes(selectedType || "")) {
      return z.object({
        phone: phoneSchema,
        city: z.string().min(3, "Şehir adı girin"),
        tc_no: z.string().regex(/^[0-9]{11}$/, "TC Kimlik numarası 11 haneli olmalıdır"),
        has_previous_policy: z.string().min(1, "Lütfen seçim yapın"),
        previous_policy_number: z.string().optional().or(z.literal('')),
      }).refine((data) => {
        if (data.has_previous_policy === "yes" && !data.previous_policy_number) {
          return false;
        }
        return true;
      }, {
        message: "Mevcut poliçe numarasını girmeniz gerekmektedir",
        path: ["previous_policy_number"],
      });
    }
    if (selectedType === "FIRE" && selectedCategory === "home") {
      return z.object({
        phone: phoneSchema,
        city: z.string().min(3, "Şehir adı girin"),
      });
    }
    if (selectedType === "HEALTH") {
      return z.object({
        phone: phoneSchema,
        tc_no: z.string().regex(/^[0-9]{11}$/, "TC Kimlik numarası 11 haneli olmalıdır"),
        ageGroup: z.string().min(1, "Yaş aralığı belirtin (Örn: 25-35)"),
        health_insured_for: z.string().min(1, "Lütfen seçim yapın"),
        health_plan_type: z.string().min(1, "Lütfen seçim yapın"),
        health_policy_status: z.string().min(1, "Lütfen seçim yapın"),
      });
    }
    if (selectedType === "TRAVEL") {
      return z.object({
        phone: phoneSchema,
        travel_citizenship: z.string().min(1, "Lütfen vatandaşlık seçin"),
        tc_no: z.string().optional().or(z.literal('')),
        passport_no: z.string().optional().or(z.literal('')),
        nationality: z.string().optional().or(z.literal('')),
        full_name: z.string().min(3, "Ad Soyad en az 3 karakter olmalıdır"),
        birth_date: z.string().optional().or(z.literal('')),
        birth_place: z.string().optional().or(z.literal('')),
        gender: z.string().optional().or(z.literal('')),
        address: z.string().optional().or(z.literal('')),
        departure_date: z.string().min(1, "Gidiş tarihi seçilmelidir"),
        return_date: z.string().min(1, "Dönüş tarihi seçilmelidir"),
        travel_reason: z.string().min(1, "Seyahat sebebi seçilmelidir"),
        travel_region: z.string().min(1, "Seyahat bölgesi seçilmelidir"),
        travel_country: z.string().min(1, "Seyahat edilecek ülke seçilmelidir"),
      }).refine((data) => {
        if (data.travel_citizenship === "tc") {
          return !!data.tc_no && /^[0-9]{11}$/.test(data.tc_no);
        }
        return true;
      }, {
        message: "TC Kimlik numarası 11 haneli olmalıdır",
        path: ["tc_no"],
      }).refine((data) => {
        if (data.travel_citizenship === "passport") {
          return !!data.passport_no && data.passport_no.trim().length >= 5;
        }
        return true;
      }, {
        message: "Pasaport numarası en az 5 karakter olmalıdır",
        path: ["passport_no"],
      }).refine((data) => {
        if (data.travel_citizenship === "passport") {
          return !!data.nationality;
        }
        return true;
      }, {
        message: "Uyruk seçilmelidir",
        path: ["nationality"],
      }).refine((data) => {
        if (data.travel_citizenship === "passport") {
          return !!data.birth_date;
        }
        return true;
      }, {
        message: "Doğum tarihi seçilmelidir",
        path: ["birth_date"],
      }).refine((data) => {
        if (data.travel_citizenship === "passport") {
          return !!data.birth_place && data.birth_place.trim().length >= 2;
        }
        return true;
      }, {
        message: "Doğum yeri belirtilmelidir",
        path: ["birth_place"],
      }).refine((data) => {
        if (data.travel_citizenship === "passport") {
          return !!data.gender;
        }
        return true;
      }, {
        message: "Cinsiyet seçilmelidir",
        path: ["gender"],
      }).refine((data) => {
        if (data.travel_citizenship === "passport") {
          return !!data.address && data.address.trim().length >= 10;
        }
        return true;
      }, {
        message: "Lütfen detaylı adres belirtin (en az 10 karakter)",
        path: ["address"],
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
    setValue,
    watch,
    trigger,
    formState: { errors },
  } = useForm<FormValues>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(getSchema() as any),
    shouldUnregister: true,
  });

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, "");
    if (value.startsWith("90")) {
      value = value.substring(2);
    }
    if (value.length > 0 && !value.startsWith("0")) {
      value = "0" + value;
    }
    if (value.length > 11) {
      value = value.substring(0, 11);
    }

    let formattedValue = value;
    if (value.length > 3 && value.length <= 6) {
      formattedValue = `${value.slice(0, 4)} ${value.slice(4)}`;
    } else if (value.length > 6 && value.length <= 8) {
      formattedValue = `${value.slice(0, 4)} ${value.slice(4, 7)} ${value.slice(7)}`;
    } else if (value.length > 8) {
      formattedValue = `${value.slice(0, 4)} ${value.slice(4, 7)} ${value.slice(7, 9)} ${value.slice(9)}`;
    }

    setValue("phone", formattedValue, { shouldValidate: true, shouldDirty: true });
  };

  const handleSelectCategory = (categoryId: string) => {
    setSelectedCategory(categoryId);
    setStep(2);
  };

  const handleSelectType = (id: string) => {
    setSelectedType(id);
    reset();
    setTravelSubStep(1);
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
        dynamic_fields: {
          ...data,
          document_no: data.document_no ? data.document_no.toUpperCase() : undefined,
        },
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
          value: 20000.00,
          currency: 'TRY',
        });
      }

      const typeLabel = insuranceTypes.find(t => t.id === selectedType && t.category === selectedCategory)?.label || selectedType;
      const dynamicDetail = data.plate || data.city || data.ageGroup || data.sector || "";

      let message = `Merhaba, ${typeLabel} için teklif almak istiyorum. (Kayıt No: ${trkId}`;
      if (selectedType === "TRAVEL") {
        const citizenLabel = data.travel_citizenship === "tc" ? "TC Vatandaşı" : "Pasaport / Yabancı";
        const docLabel = data.travel_citizenship === "tc" ? `TC: ${data.tc_no}` : `Pasaport No: ${data.passport_no} (${data.nationality})`;
        message += ` - Müşteri: ${data.full_name} (${citizenLabel}, ${docLabel}) - Seyahat: ${data.departure_date} / ${data.return_date} - Bölge: ${data.travel_region} - Ülke: ${data.travel_country})`;
      } else {
        message += dynamicDetail ? ` - ${dynamicDetail})` : ')';
      }

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
                        <>
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

                          <div className="space-y-2 mt-4">
                            <Label htmlFor="tc_no" className="text-sm font-semibold">TC Kimlik Numarası</Label>
                            <Input
                              id="tc_no"
                              maxLength={11}
                              placeholder="11 Haneli TC Kimlik Numaranız"
                              className="h-14 text-lg bg-background/50 border-border/50 focus-visible:ring-primary rounded-xl"
                              {...register("tc_no")}
                            />
                            <p className="text-xs text-muted-foreground mt-1">
                              Fiyat teklifi çalışabilmemiz için TC Kimlik numaranız gereklidir.
                            </p>
                            {errors.tc_no && <p className="text-destructive text-sm">{errors.tc_no?.message as string}</p>}
                          </div>

                          <div className="space-y-2 mt-4">
                            <Label htmlFor="document_no" className="text-sm font-semibold">Tescil Belge Seri / Sıra Numarası</Label>
                            <Input
                              id="document_no"
                              maxLength={8}
                              placeholder="Örn: AA123456"
                              className="h-14 text-lg uppercase bg-background/50 border-border/50 focus-visible:ring-primary rounded-xl"
                              {...register("document_no")}
                            />
                            <p className="text-xs text-muted-foreground mt-1">
                              Tescil Belge seri/sıra numarası (2 harf + 6 rakam) girilmesi zorunludur.
                            </p>
                            {errors.document_no && <p className="text-destructive text-sm">{errors.document_no?.message as string}</p>}
                          </div>
                        </>
                      )}

                      {["DASK", "HOME_CONTENT"].includes(selectedType || "") && (
                        <div className="space-y-4">
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

                          <div className="space-y-2">
                            <Label htmlFor="tc_no" className="text-sm font-semibold">TC Kimlik Numarası</Label>
                            <Input
                              id="tc_no"
                              maxLength={11}
                              placeholder="11 Haneli TC Kimlik Numaranız"
                              className="h-14 text-lg bg-background/50 border-border/50 focus-visible:ring-primary rounded-xl"
                              {...register("tc_no")}
                            />
                            {errors.tc_no && <p className="text-destructive text-sm">{errors.tc_no?.message as string}</p>}
                          </div>

                          <div className="space-y-2">
                            <Label className="text-sm font-semibold block mb-1">Daha önce poliçeniz var mı?</Label>
                            <div className="flex gap-6 py-2">
                              <label className="flex items-center gap-2 cursor-pointer text-sm font-medium">
                                <input
                                  type="radio"
                                  value="yes"
                                  className="w-4 h-4 text-primary focus:ring-primary"
                                  {...register("has_previous_policy")}
                                />
                                Evet, var
                              </label>
                              <label className="flex items-center gap-2 cursor-pointer text-sm font-medium">
                                <input
                                  type="radio"
                                  value="no"
                                  className="w-4 h-4 text-primary focus:ring-primary"
                                  {...register("has_previous_policy")}
                                />
                                Hayır, ilk kez yaptırıyorum
                              </label>
                            </div>
                            {errors.has_previous_policy && <p className="text-destructive text-sm">{errors.has_previous_policy?.message as string}</p>}
                          </div>

                          {watch("has_previous_policy") === "yes" && (
                            <div className="space-y-2">
                              <Label htmlFor="previous_policy_number" className="text-sm font-semibold">Mevcut Poliçe Numarası</Label>
                              <Input
                                id="previous_policy_number"
                                placeholder="Poliçe Numaranız"
                                className="h-14 text-lg bg-background/50 border-border/50 focus-visible:ring-primary rounded-xl"
                                {...register("previous_policy_number")}
                              />
                              {errors.previous_policy_number && <p className="text-destructive text-sm">{errors.previous_policy_number?.message as string}</p>}
                            </div>
                          )}
                        </div>
                      )}

                      {(selectedType === "FIRE" && selectedCategory === "home") && (
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
                      )}

                      {selectedType === "HEALTH" && (
                        <div className="space-y-4">
                          <div className="space-y-2">
                            <Label htmlFor="tc_no" className="text-sm font-semibold">TC Kimlik Numarası</Label>
                            <Input
                              id="tc_no"
                              maxLength={11}
                              placeholder="11 Haneli TC Kimlik Numaranız"
                              className="h-14 text-lg bg-background/50 border-border/50 focus-visible:ring-primary rounded-xl"
                              {...register("tc_no")}
                            />
                            {errors.tc_no && <p className="text-destructive text-sm">{errors.tc_no?.message as string}</p>}
                          </div>

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

                          <div className="space-y-2">
                            <Label className="text-sm font-semibold block mb-1">Sigorta Kimin İçin Yapılacak?</Label>
                            <div className="flex gap-6 py-2">
                              <label className="flex items-center gap-2 cursor-pointer text-sm font-medium">
                                <input
                                  type="radio"
                                  value="myself"
                                  className="w-4 h-4 text-primary focus:ring-primary"
                                  {...register("health_insured_for")}
                                />
                                Kendim İçin
                              </label>
                              <label className="flex items-center gap-2 cursor-pointer text-sm font-medium">
                                <input
                                  type="radio"
                                  value="family"
                                  className="w-4 h-4 text-primary focus:ring-primary"
                                  {...register("health_insured_for")}
                                />
                                Ailem İçin
                              </label>
                            </div>
                            {errors.health_insured_for && <p className="text-destructive text-sm">{errors.health_insured_for?.message as string}</p>}
                          </div>

                          <div className="space-y-2">
                            <Label className="text-sm font-semibold block mb-1">Plan Seçimi</Label>
                            <div className="flex gap-6 py-2">
                              <label className="flex items-center gap-2 cursor-pointer text-sm font-medium">
                                <input
                                  type="radio"
                                  value="inpatient_only"
                                  className="w-4 h-4 text-primary focus:ring-primary"
                                  {...register("health_plan_type")}
                                />
                                Sadece Yatarak
                              </label>
                              <label className="flex items-center gap-2 cursor-pointer text-sm font-medium">
                                <input
                                  type="radio"
                                  value="inpatient_outpatient"
                                  className="w-4 h-4 text-primary focus:ring-primary"
                                  {...register("health_plan_type")}
                                />
                                Yatarak + Ayakta
                              </label>
                            </div>
                            {errors.health_plan_type && <p className="text-destructive text-sm">{errors.health_plan_type?.message as string}</p>}
                          </div>

                          <div className="space-y-2">
                            <Label className="text-sm font-semibold block mb-1">Poliçe Durumu</Label>
                            <div className="flex gap-6 py-2">
                              <label className="flex items-center gap-2 cursor-pointer text-sm font-medium">
                                <input
                                  type="radio"
                                  value="new_policy"
                                  className="w-4 h-4 text-primary focus:ring-primary"
                                  {...register("health_policy_status")}
                                />
                                Yeni İş
                              </label>
                              <label className="flex items-center gap-2 cursor-pointer text-sm font-medium">
                                <input
                                  type="radio"
                                  value="transfer"
                                  className="w-4 h-4 text-primary focus:ring-primary"
                                  {...register("health_policy_status")}
                                />
                                Geçiş / Transfer
                              </label>
                            </div>
                            {errors.health_policy_status && <p className="text-destructive text-sm">{errors.health_policy_status?.message as string}</p>}
                          </div>
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

                      {selectedType === "TRAVEL" && (
                        <div className="space-y-6">
                          {/* Wizard Steps indicator */}
                          <div className="flex justify-between items-center mb-6">
                            <span className={`text-sm font-semibold ${travelSubStep === 1 ? 'text-primary' : 'text-muted-foreground'}`}>
                              1. Kişisel Bilgiler
                            </span>
                            <div className="h-1 flex-1 mx-4 bg-muted rounded-full overflow-hidden">
                              <div className={`h-full bg-primary transition-all duration-300 ${travelSubStep === 1 ? 'w-1/2' : 'w-full'}`} />
                            </div>
                            <span className={`text-sm font-semibold ${travelSubStep === 2 ? 'text-primary' : 'text-muted-foreground'}`}>
                              2. Seyahat Detayları
                            </span>
                          </div>

                          {travelSubStep === 1 && (
                            <div className="space-y-4">
                              <div className="space-y-2">
                                <Label htmlFor="full_name" className="text-sm font-semibold">Adı Soyadı</Label>
                                <Input
                                  id="full_name"
                                  placeholder="Örn: Ahmet Yılmaz"
                                  className="h-14 text-lg bg-background/50 border-border/50 focus-visible:ring-primary rounded-xl"
                                  {...register("full_name")}
                                />
                                {errors.full_name && <p className="text-destructive text-sm">{errors.full_name?.message as string}</p>}
                              </div>

                              <div className="space-y-2">
                                <Label className="text-sm font-semibold block mb-1">Vatandaşlık Durumu</Label>
                                <div className="flex gap-6 py-2">
                                  <label className="flex items-center gap-2 cursor-pointer text-sm font-medium">
                                    <input
                                      type="radio"
                                      value="tc"
                                      className="w-4 h-4 text-primary focus:ring-primary"
                                      {...register("travel_citizenship")}
                                    />
                                    TC Vatandaşı
                                  </label>
                                  <label className="flex items-center gap-2 cursor-pointer text-sm font-medium">
                                    <input
                                      type="radio"
                                      value="passport"
                                      className="w-4 h-4 text-primary focus:ring-primary"
                                      {...register("travel_citizenship")}
                                    />
                                    Pasaport / Yabancı
                                  </label>
                                </div>
                                {errors.travel_citizenship && <p className="text-destructive text-sm">{errors.travel_citizenship?.message as string}</p>}
                              </div>

                              {watch("travel_citizenship") === "tc" && (
                                <div className="space-y-2">
                                  <Label htmlFor="tc_no" className="text-sm font-semibold">TC Kimlik Numarası</Label>
                                  <Input
                                    id="tc_no"
                                    maxLength={11}
                                    placeholder="11 Haneli TC Kimlik Numaranız"
                                    className="h-14 text-lg bg-background/50 border-border/50 focus-visible:ring-primary rounded-xl"
                                    {...register("tc_no")}
                                  />
                                  {errors.tc_no && <p className="text-destructive text-sm">{errors.tc_no?.message as string}</p>}
                                </div>
                              )}

                              {watch("travel_citizenship") === "passport" && (
                                <div className="space-y-4">
                                  <div className="space-y-2">
                                    <Label htmlFor="passport_no" className="text-sm font-semibold">Pasaport Numarası</Label>
                                    <Input
                                      id="passport_no"
                                      placeholder="Örn: U12345678"
                                      className="h-14 text-lg bg-background/50 border-border/50 focus-visible:ring-primary rounded-xl uppercase"
                                      {...register("passport_no")}
                                    />
                                    {errors.passport_no && <p className="text-destructive text-sm">{errors.passport_no?.message as string}</p>}
                                  </div>

                                  <div className="space-y-2">
                                    <Label htmlFor="nationality" className="text-sm font-semibold">Uyruk</Label>
                                    <select
                                      id="nationality"
                                      className="w-full h-14 px-4 bg-background/50 border border-border/50 rounded-xl text-lg outline-none focus:ring-2 focus:ring-primary text-foreground"
                                      {...register("nationality")}
                                    >
                                      <option value="">Lütfen Seçin</option>
                                      {countriesList.map((c) => (
                                        <option key={c.code} value={c.name}>{c.name}</option>
                                      ))}
                                    </select>
                                    {errors.nationality && <p className="text-destructive text-sm">{errors.nationality?.message as string}</p>}
                                  </div>

                                  <div className="space-y-2">
                                    <Label htmlFor="birth_date" className="text-sm font-semibold">Doğum Tarihi</Label>
                                    <Input
                                      id="birth_date"
                                      type="date"
                                      className="h-14 text-lg bg-background/50 border-border/50 focus-visible:ring-primary rounded-xl"
                                      {...register("birth_date")}
                                    />
                                    {errors.birth_date && <p className="text-destructive text-sm">{errors.birth_date?.message as string}</p>}
                                  </div>

                                  <div className="space-y-2">
                                    <Label htmlFor="birth_place" className="text-sm font-semibold">Doğum Yeri</Label>
                                    <Input
                                      id="birth_place"
                                      placeholder="Örn: Berlin"
                                      className="h-14 text-lg bg-background/50 border-border/50 focus-visible:ring-primary rounded-xl"
                                      {...register("birth_place")}
                                    />
                                    {errors.birth_place && <p className="text-destructive text-sm">{errors.birth_place?.message as string}</p>}
                                  </div>

                                  <div className="space-y-2">
                                    <Label className="text-sm font-semibold block mb-1">Cinsiyet</Label>
                                    <div className="flex gap-6 py-2">
                                      <label className="flex items-center gap-2 cursor-pointer text-sm font-medium">
                                        <input
                                          type="radio"
                                          value="male"
                                          className="w-4 h-4 text-primary focus:ring-primary"
                                          {...register("gender")}
                                        />
                                        Erkek
                                      </label>
                                      <label className="flex items-center gap-2 cursor-pointer text-sm font-medium">
                                        <input
                                          type="radio"
                                          value="female"
                                          className="w-4 h-4 text-primary focus:ring-primary"
                                          {...register("gender")}
                                        />
                                        Kadın
                                      </label>
                                    </div>
                                    {errors.gender && <p className="text-destructive text-sm">{errors.gender?.message as string}</p>}
                                  </div>

                                  <div className="space-y-2">
                                    <Label htmlFor="address" className="text-sm font-semibold">Adres</Label>
                                    <Input
                                      id="address"
                                      placeholder="Örn: 123. Sokak No:4 Daire:2..."
                                      className="h-14 text-lg bg-background/50 border-border/50 focus-visible:ring-primary rounded-xl"
                                      {...register("address")}
                                    />
                                    {errors.address && <p className="text-destructive text-sm">{errors.address?.message as string}</p>}
                                  </div>
                                </div>
                              )}

                              <div className="space-y-2">
                                <Label htmlFor="phone" className="text-sm font-semibold">Cep Telefonu</Label>
                                <Input
                                  id="phone"
                                  type="tel"
                                  placeholder="05XX XXX XX XX"
                                  className="h-14 text-lg bg-background/50 border-border/50 focus-visible:ring-primary rounded-xl"
                                  {...register("phone", { onChange: handlePhoneChange })}
                                />
                                {errors.phone && <p className="text-destructive text-sm">{errors.phone?.message as string}</p>}
                              </div>

                              <Button
                                type="button"
                                onClick={async () => {
                                  const fieldsToValidate: (keyof FormValues)[] = ["full_name", "travel_citizenship", "phone"];
                                  const citizenship = watch("travel_citizenship");
                                  if (citizenship === "tc") {
                                    fieldsToValidate.push("tc_no");
                                  } else if (citizenship === "passport") {
                                    fieldsToValidate.push("passport_no", "nationality", "birth_date", "birth_place", "gender", "address");
                                  }
                                  const isValid = await trigger(fieldsToValidate);
                                  if (isValid) {
                                    setTravelSubStep(2);
                                  }
                                }}
                                className="w-full h-14 text-lg bg-primary hover:bg-primary/90 rounded-xl mt-4"
                              >
                                Seyahat Detayları (Sonraki Adım) <ArrowRight className="ml-2 w-5 h-5" />
                              </Button>
                            </div>
                          )}

                          {travelSubStep === 2 && (
                            <div className="space-y-4">
                              <div className="space-y-2">
                                <Label htmlFor="departure_date" className="text-sm font-semibold">Gidiş Tarihi</Label>
                                <Input
                                  id="departure_date"
                                  type="date"
                                  className="h-14 text-lg bg-background/50 border-border/50 focus-visible:ring-primary rounded-xl"
                                  {...register("departure_date")}
                                />
                                {errors.departure_date && <p className="text-destructive text-sm">{errors.departure_date?.message as string}</p>}
                              </div>

                              <div className="space-y-2">
                                <Label htmlFor="return_date" className="text-sm font-semibold">Dönüş Tarihi</Label>
                                <Input
                                  id="return_date"
                                  type="date"
                                  className="h-14 text-lg bg-background/50 border-border/50 focus-visible:ring-primary rounded-xl"
                                  {...register("return_date")}
                                />
                                {errors.return_date && <p className="text-destructive text-sm">{errors.return_date?.message as string}</p>}
                              </div>

                              <div className="space-y-2">
                                <Label className="text-sm font-semibold block mb-1">Seyahat Sebebi</Label>
                                <div className="grid grid-cols-3 gap-3 py-2">
                                  <label className="flex items-center gap-1.5 cursor-pointer text-xs font-medium">
                                    <input
                                      type="radio"
                                      value="Turistik Gezi"
                                      className="w-4 h-4 text-primary focus:ring-primary"
                                      {...register("travel_reason")}
                                    />
                                    Turistik
                                  </label>
                                  <label className="flex items-center gap-1.5 cursor-pointer text-xs font-medium">
                                    <input
                                      type="radio"
                                      value="Eğitim"
                                      className="w-4 h-4 text-primary focus:ring-primary"
                                      {...register("travel_reason")}
                                    />
                                    Eğitim
                                  </label>
                                  <label className="flex items-center gap-1.5 cursor-pointer text-xs font-medium">
                                    <input
                                      type="radio"
                                      value="İş Seyahati"
                                      className="w-4 h-4 text-primary focus:ring-primary"
                                      {...register("travel_reason")}
                                    />
                                    İş
                                  </label>
                                </div>
                                {errors.travel_reason && <p className="text-destructive text-sm">{errors.travel_reason?.message as string}</p>}
                              </div>

                              <div className="space-y-2">
                                <Label className="text-sm font-semibold block mb-1">Seyahat Bölgesi</Label>
                                <div className="grid grid-cols-2 gap-3 py-2">
                                  <label className="flex items-center gap-1.5 cursor-pointer text-xs font-medium">
                                    <input
                                      type="radio"
                                      value="Avrupa Schengen"
                                      className="w-4 h-4 text-primary focus:ring-primary"
                                      {...register("travel_region")}
                                    />
                                    Avrupa Schengen
                                  </label>
                                  <label className="flex items-center gap-1.5 cursor-pointer text-xs font-medium">
                                    <input
                                      type="radio"
                                      value="Tüm Dünya"
                                      className="w-4 h-4 text-primary focus:ring-primary"
                                      {...register("travel_region")}
                                    />
                                    Tüm Dünya
                                  </label>
                                  <label className="flex items-center gap-1.5 cursor-pointer text-xs font-medium">
                                    <input
                                      type="radio"
                                      value="Yurt İçi"
                                      className="w-4 h-4 text-primary focus:ring-primary"
                                      {...register("travel_region")}
                                    />
                                    Yurt İçi
                                  </label>
                                  <label className="flex items-center gap-1.5 cursor-pointer text-xs font-medium">
                                    <input
                                      type="radio"
                                      value="Tüm Türkiye Incoming"
                                      className="w-4 h-4 text-primary focus:ring-primary"
                                      {...register("travel_region")}
                                    />
                                    Incoming TR
                                  </label>
                                </div>
                                {errors.travel_region && <p className="text-destructive text-sm">{errors.travel_region?.message as string}</p>}
                              </div>

                              <div className="space-y-2">
                                <Label htmlFor="travel_country" className="text-sm font-semibold">Seyahat Edilecek Ülke</Label>
                                <select
                                  id="travel_country"
                                  className="w-full h-14 px-4 bg-background/50 border border-border/50 rounded-xl text-lg outline-none focus:ring-2 focus:ring-primary text-foreground"
                                  {...register("travel_country")}
                                >
                                  <option value="">Lütfen Seçin</option>
                                  {countriesList.map((c) => (
                                    <option key={c.code} value={c.name}>{c.name}</option>
                                  ))}
                                </select>
                                {errors.travel_country && <p className="text-destructive text-sm">{errors.travel_country?.message as string}</p>}
                              </div>

                              <div className="flex gap-4 mt-6">
                                <Button
                                  type="button"
                                  variant="outline"
                                  onClick={() => setTravelSubStep(1)}
                                  className="flex-1 h-14 text-lg rounded-xl"
                                >
                                  <ArrowLeft className="mr-2 w-5 h-5" /> Geri
                                </Button>
                                <Button
                                  type="submit"
                                  disabled={isSubmitting}
                                  className="flex-1 h-14 text-lg font-black rounded-xl bg-primary hover:bg-primary/90"
                                >
                                  {isSubmitting ? "Gönderiliyor..." : "Teklif Al"}
                                </Button>
                              </div>
                            </div>
                          )}
                        </div>
                      )}

                      {selectedType !== "TRAVEL" && (
                        <>
                          <div className="space-y-2">
                            <Label htmlFor="phone" className="text-sm font-semibold">Telefon Numarası</Label>
                            <Input
                              id="phone"
                              type="tel"
                              placeholder="05XX XXX XX XX"
                              className="h-14 text-lg bg-background/50 border-border/50 focus-visible:ring-primary rounded-xl"
                              {...register("phone", { onChange: handlePhoneChange })}
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
                        </>
                      )}
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

      <footer className="py-12 border-t border-border/20 bg-background relative z-10 text-center text-muted-foreground text-sm px-4 pb-28 md:pb-12">
        <div className="flex flex-wrap items-center justify-center gap-4 md:gap-8 mb-6 text-xs font-semibold uppercase tracking-wider">
          <a href="/legal/kvkk" className="hover:text-primary transition-colors">KVKK Aydınlatma Metni</a>
          <a href="/legal/gizlilik" className="hover:text-primary transition-colors">Gizlilik Politikası</a>
          <a href="/legal/cerez" className="hover:text-primary transition-colors">Çerez Politikası</a>
        </div>
        <p>© {new Date().getFullYear()} Sigomax Teklif ve Yönlendirme Platformu. Tüm hakları saklıdır.</p>
        <p className="mt-4 opacity-70 text-xs max-w-2xl mx-auto leading-relaxed">
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
