import React from 'react';

export const metadata = {
  title: 'Gizlilik Politikası | Sigomax',
};

export default function GizlilikPage() {
  return (
    <div className="min-h-screen bg-background text-foreground py-20 px-4">
      <div className="max-w-4xl mx-auto prose prose-invert">
        <h1 className="text-3xl font-bold mb-8">Gizlilik Politikası</h1>
        <p className="text-muted-foreground mb-4">
          Son Güncelleme: {new Date().toLocaleDateString('tr-TR')}
        </p>
        
        <h2>1. Bilgi Toplama ve Kullanım</h2>
        <p>
          Sigomax olarak, sizlere daha iyi bir hizmet sunabilmek amacıyla kişisel bilgilerinizi toplamaktayız. Sitemizi ziyaret ettiğinizde cihaz bilgileriniz, IP adresiniz ve site içi hareketleriniz anonim olarak kaydedilebilir.
        </p>

        <h2>2. Çerezler (Cookies)</h2>
        <p>
          Sitemizin performansını artırmak ve reklam optimizasyonları (örn. Meta Piksel) yapmak amacıyla çerezler kullanılmaktadır. Daha fazla bilgi için Çerez Politikamızı inceleyebilirsiniz.
        </p>

        <h2>3. Bilgi Güvenliği</h2>
        <p>
          Topladığımız kişisel bilgilerin güvenliğini sağlamak amacıyla endüstri standartlarında güvenlik önlemleri alınmaktadır. 
        </p>

        <h2>4. Üçüncü Taraf Bağlantıları</h2>
        <p>
          Platformumuz, teklif sunan üçüncü taraf acentelere ait bağlantılar içerebilir. Bu sitelerin gizlilik politikalarından platformumuz sorumlu tutulamaz.
        </p>
      </div>
    </div>
  );
}
