# Türkçe Kurdu

Eğlenceli ve etkileşimli bir Türkçe öğrenme uygulaması! Kelime haznesi geliştirme, cümle tamamlama ve telaffuz yeteneklerini destekler.

## Özellikler

- Kelime Yazma
- Eşleştirme Oyunları
- Boşluk Doldurma
- Diyalog Tamamlama
- Sesli Okuma İmkanı (Text-to-Speech)
- İlerleme Kaydetme ve Can / XP Sistemi
- Admin Paneli ile İçerik Ekleme (Google Apps Script entegrasyonu)

## Kurulum ve Çalıştırma

### 1. Projeyi Klonlayın

```bash
git clone https://github.com/KULLANICI_ADINIZ/turkce-kurdu.git
cd turkce-kurdu
```

### 2. Bağımlılıkları Yükleyin

Proje NPM kullanılarak geliştirilmiştir.

```bash
npm install
```

### 3. Çevre Değişkenleri (Environment Variables)

Projenin Admin Paneli ve Google Sheets entegrasyonu için çevresel değişkenlere (.env dosyasına) ihtiyacı vardır. 

Ana dizinde `.env.local` adlı bir dosya oluşturun ve içini aşağıdaki gibi doldurun:

```env
VITE_ADMIN_USER=senin_kullanici_adin
VITE_ADMIN_PASS=guclu_bir_sifre
VITE_GOOGLE_SCRIPT_URL=https://script.google.com/macros/s/...
```
*Not: Bu dosya `.gitignore` tarafından izlenmeyeceği için GitHub'da güvenle saklanacaktır.*

### 4. Geliştirme Sunucusunu Başlatın

```bash
npm run dev
```

Uygulamanız varsayılan olarak `http://localhost:3000` (veya Vite tarafından önerilen adreste) çalışmaya başlayacaktır.

## Katkıda Bulunma
Her türlü Issue ve Pull Request kabul edilir. Başlamadan önce lütfen yeni bir dal (branch) oluşturun.

## Lisans
MIT
