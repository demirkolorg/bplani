import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Duyurular için seed başlatılıyor...')

  // İlk ADMIN kullanıcısını bul (duyuruları ona bağlayacağız)
  const adminUser = await prisma.personel.findFirst({
    where: {
      rol: 'ADMIN',
    },
  })

  if (!adminUser) {
    console.log('❌ ADMIN kullanıcısı bulunamadı. Önce bir ADMIN kullanıcı oluşturun.')
    return
  }

  console.log(`✅ ADMIN kullanıcı bulundu: ${adminUser.ad} ${adminUser.soyad}`)

  // Örnek duyurular
  const duyurular = [
    {
      baslik: 'Sistem Bakım Bildirimi',
      icerik: 'Sayın kullanıcılar,\n\n15 Şubat 2024 Cumartesi günü saat 02:00 - 06:00 arası sistemde planlı bakım çalışması yapılacaktır. Bu süre zarfında sisteme erişim sağlanamayacaktır.\n\nAnlayışınız için teşekkür ederiz.',
      oncelik: 'KRITIK',
      publishedAt: new Date(),
      expiresAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 gün sonra
      isActive: true,
      createdUserId: adminUser.id,
      updatedUserId: adminUser.id,
    },
    {
      baslik: 'Yeni Özellik: Excel Export',
      icerik: 'Merhaba,\n\nSistemimize yeni bir özellik eklendi! Artık tüm tablolardan Excel formatında dışa aktarım yapabilirsiniz. Tablonun sağ üst köşesindeki "Excel\'e Aktar" butonunu kullanabilirsiniz.\n\nİyi çalışmalar!',
      oncelik: 'ONEMLI',
      publishedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 gün önce
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 gün sonra
      isActive: true,
      createdUserId: adminUser.id,
      updatedUserId: adminUser.id,
    },
    {
      baslik: 'Haftalık Toplantı Hatırlatması',
      icerik: 'Her Pazartesi saat 10:00\'da yapılan haftalık değerlendirme toplantısına tüm ekip üyelerinin katılımı beklenmektedir.\n\nToplantı linki: [Meeting Room]\n\nGündem maddeleri:\n- Haftalık performans raporu\n- Yeni takipler\n- Öncelikli operasyonlar',
      oncelik: 'NORMAL',
      publishedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 gün önce
      expiresAt: null, // Süresiz
      isActive: true,
      createdUserId: adminUser.id,
      updatedUserId: adminUser.id,
    },
    {
      baslik: 'Güvenlik Güncellemesi Yapıldı',
      icerik: 'Sistemde önemli güvenlik güncellemeleri yapılmıştır. Tüm kullanıcıların parolalarını güncellemeleri önerilir.\n\nGüçlü parola için:\n- En az 8 karakter\n- Büyük ve küçük harf\n- Rakam ve özel karakter içermeli\n\nProfil > Parola Değiştir menüsünden parolanızı güncelleyebilirsiniz.',
      oncelik: 'ONEMLI',
      publishedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 gün önce
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 gün sonra
      isActive: true,
      createdUserId: adminUser.id,
      updatedUserId: adminUser.id,
    },
    {
      baslik: 'Yılbaşı Tatil Duyurusu',
      icerik: 'Değerli çalışanlar,\n\n1 Ocak 2024 Resmi Tatil nedeniyle ofisimiz kapalı olacaktır. Acil durumlar için 7/24 destek hattımız aktif olacaktır.\n\nMutlu yıllar dileriz! 🎉',
      oncelik: 'NORMAL',
      publishedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 gün önce
      expiresAt: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000), // 25 gün önce (süresi dolmuş)
      isActive: true,
      createdUserId: adminUser.id,
      updatedUserId: adminUser.id,
    },
    {
      baslik: 'Test Duyurusu - Pasif',
      icerik: 'Bu duyuru test amaçlıdır ve pasif durumdadır. Kullanıcılar tarafından görünmeyecektir.',
      oncelik: 'NORMAL',
      publishedAt: new Date(),
      expiresAt: null,
      isActive: false, // Pasif
      createdUserId: adminUser.id,
      updatedUserId: adminUser.id,
    },
  ]

  // Duyuruları oluştur
  for (const duyuru of duyurular) {
    const created = await prisma.duyuru.create({
      data: duyuru,
    })

    const statusEmoji = created.isActive ? '✅' : '⏸️'
    const priorityEmoji = created.oncelik === 'KRITIK' ? '🔴' : created.oncelik === 'ONEMLI' ? '🟠' : '🔵'

    console.log(`${statusEmoji} ${priorityEmoji} Duyuru oluşturuldu: ${created.baslik}`)
  }

  console.log('\n✨ Seed tamamlandı! Toplam', duyurular.length, 'duyuru oluşturuldu.')
  console.log('\n📊 Özet:')
  console.log('- 1 KRİTİK duyuru (kırmızı)')
  console.log('- 2 ÖNEMLİ duyuru (turuncu)')
  console.log('- 3 NORMAL duyuru (mavi)')
  console.log('- 1 süresi dolmuş duyuru (anasayfada görünmez)')
  console.log('- 1 pasif duyuru (görünmez)')
}

main()
  .catch((e) => {
    console.error('❌ Hata:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
