import React from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export const metadata = {
  title: 'Çerez Politikası | Sigomax',
};

export default function CerezPage() {
  return (
    <div className="min-h-screen bg-background text-foreground py-20 px-4">
      <div className="max-w-4xl mx-auto">
        <Link href="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8">
          <ArrowLeft className="w-4 h-4" />
          Ana Sayfaya Dön
        </Link>
        <div className="prose prose-invert">
          <h1 className="text-3xl font-bold mb-8">Çerez (Cookie) Politikası</h1>
        <p className="text-muted-foreground mb-4">
          Son Güncelleme: {new Date().toLocaleDateString('tr-TR')}
        </p>
        
        <h2>1. Çerez Nedir?</h2>
        <p>
          Çerezler, web sitemizi ziyaret ettiğinizde tarayıcınız aracılığıyla cihazınıza kaydedilen küçük metin dosyalarıdır.
        </p>

        <h2>2. Çerezleri Neden Kullanıyoruz?</h2>
        <ul>
          <li><strong>Zorunlu Çerezler:</strong> Sitemizin temel işlevlerinin çalışması için gereklidir.</li>
          <li><strong>Performans ve Analiz Çerezleri:</strong> Sitemizin nasıl kullanıldığını analiz ederek performansı artırmamıza yardımcı olur.</li>
          <li><strong>Reklam ve Hedefleme Çerezleri:</strong> (Örn: Meta Piksel) İlgi alanlarınıza uygun kampanyalar sunabilmemiz için kullanılır.</li>
        </ul>

        <h2>3. Çerez Yönetimi</h2>
        <p>
          Çerez tercihlerinizi tarayıcınızın ayarlar bölümünden değiştirebilir veya silebilirsiniz. Ancak zorunlu çerezlerin kapatılması, sitemizin bazı işlevlerinin çalışmamasına neden olabilir.
        </p>
        </div>
      </div>
    </div>
  );
}
