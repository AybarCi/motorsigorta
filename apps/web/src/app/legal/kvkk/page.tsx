import React from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export const metadata = {
  title: 'KVKK Aydınlatma Metni | Sigomax',
};

export default function KVKKPage() {
  return (
    <div className="min-h-screen bg-background text-foreground py-20 px-4">
      <div className="max-w-4xl mx-auto">
        <Link href="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8">
          <ArrowLeft className="w-4 h-4" />
          Ana Sayfaya Dön
        </Link>
        <div className="prose prose-invert">
          <h1 className="text-3xl font-bold mb-8">Kişisel Verilerin Korunması (KVKK) Aydınlatma Metni</h1>
        <p className="text-muted-foreground mb-4">
          Son Güncelleme: {new Date().toLocaleDateString('tr-TR')}
        </p>
        
        <h2>1. Veri Sorumlusu</h2>
        <p>
          Sigomax platformu olarak kişisel verilerinizin güvenliğine önem veriyoruz. Kişisel verileriniz, 6698 sayılı Kişisel Verilerin Korunması Kanunu (&quot;KVKK&quot;) uyarınca veri sorumlusu sıfatıyla tarafımızca işlenmektedir.
        </p>

        <h2>2. Kişisel Verilerin Hangi Amaçla İşleneceği</h2>
        <p>
          Toplanan kişisel verileriniz (Ad, soyad, telefon numarası, sigorta bilgileri vb.), size en uygun sigorta teklifini sunmak, lisanslı acentelerle iletişiminizi sağlamak ve müşteri memnuniyetini artırmak amaçlarıyla işlenmektedir.
        </p>

        <h2>3. İşlenen Kişisel Verilerin Kimlere ve Hangi Amaçla Aktarılabileceği</h2>
        <p>
          Kişisel verileriniz, talep ettiğiniz sigorta teklifinin oluşturulabilmesi amacıyla yalnızca iş ortaklarımız olan yetkili sigorta acentelerine ve kanunen yetkili kamu kurumlarına aktarılabilmektedir.
        </p>

        <h2>4. İletişim</h2>
        <p>
          Haklarınızla ilgili taleplerinizi veya sorularınızı destek hattımız (WhatsApp) üzerinden bize iletebilirsiniz.
        </p>
        </div>
      </div>
    </div>
  );
}
