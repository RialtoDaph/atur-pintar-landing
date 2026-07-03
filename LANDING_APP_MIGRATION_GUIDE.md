# 📦 Panduan Pisahin Landing Page ke App Base44 Baru

Dokumen ini panduan step-by-step untuk memindahkan landing page ke app Base44 terpisah.

---

## 🎯 Tujuan

- **App Landing** (baru): domain utama, misal `aturpintar.com` — cuma landing + halaman legal
- **App Utama** (yang sekarang): subdomain, misal `app.aturpintar.com` — dashboard, transaksi, dll

---

## ✅ STEP 1: Buat App Base44 Baru

1. Buka dashboard Base44 → **Create New App**
2. Kasih nama: `Atur Pintar Landing`
3. Pilih template: **Blank** (React + Tailwind)
4. Setelah app ready, buka editor-nya

---

## ✅ STEP 2: Copy File-File Landing

Copy semua file di bawah ini dari app ini ke app landing yang baru, **dengan path yang persis sama**.

### 📄 Halaman (`src/pages/`)
- `src/pages/LandingPage.jsx` — halaman utama landing
- `src/pages/PrivacyPolicy.jsx` — kebijakan privasi
- `src/pages/TermsOfService.jsx` — syarat & ketentuan
- `src/pages/RefundPolicy.jsx` — kebijakan refund
- `src/pages/CancellationPolicy.jsx` — kebijakan pembatalan
- `src/pages/About.jsx` — halaman tentang

### 🧩 Komponen Landing (`src/components/landing/`)
Copy **seluruh folder** `src/components/landing/`:
- `BrushBackground.jsx`
- `FaqSection.jsx`
- `FeaturesSection.jsx`
- `FinalCtaSection.jsx`
- `GamificationSection.jsx`
- `HeroSection.jsx`
- `HowItWorksSection.jsx`
- `LandingFooter.jsx`
- `LandingNav.jsx`
- `LazyYouTube.jsx`
- `NanaChatDemo.jsx`
- `NanaDemoChat.jsx`
- `NewsletterSection.jsx`
- `PainPointSection.jsx`
- `PricingSection.jsx`
- `Reveal.jsx`
- `ScrollProgress.jsx`
- `SocialIcons.jsx`
- `TestimonialSection.jsx`
- `TrustStrip.jsx`
- `useLandingAnalytics.jsx`
- `VideoSection.jsx`

### 🎨 File Utility & Setup
- `src/index.css` — styling global
- `tailwind.config.js` — konfigurasi tailwind
- `src/lib/utils.js` — util `cn()` untuk shadcn
- `src/utils/index.ts` — util `createPageUrl()`
- `index.html` — SEO tags, favicon, meta

### 🧱 Komponen UI (`src/components/ui/`)
Copy komponen shadcn yang dipakai landing (biar aman, copy aja semua folder `src/components/ui/`).

### 🗂️ Entities (`base44/entities/`)
Hanya 2 entity yang perlu di app landing:
- `base44/entities/WaitingList.jsonc` — untuk form newsletter/waiting list
- `base44/entities/LandingAnalytics.jsonc` — untuk track CTA clicks

### ⚙️ Backend Functions (`base44/functions/`)
Copy folder function ini:
- `base44/functions/submitWaitingList/` — handle submit form waiting list
- `base44/functions/notifyAdminNewWaitingList/` — notif admin ada pendaftar baru
- `base44/functions/sendWaitingListEmail/` — kirim email konfirmasi

### 🔑 Secrets yang perlu di-set ulang di app landing
- `Resend_api_` — untuk kirim email waiting list

---

## ✅ STEP 3: Update `src/App.jsx` di App Landing

Ganti isi `src/App.jsx` di app baru dengan router simpel — cuma landing + halaman legal, **tanpa auth**:

```jsx
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import LandingPage from '@/pages/LandingPage';
import PrivacyPolicy from '@/pages/PrivacyPolicy';
import TermsOfService from '@/pages/TermsOfService';
import RefundPolicy from '@/pages/RefundPolicy';
import CancellationPolicy from '@/pages/CancellationPolicy';
import About from '@/pages/About';
import { Toaster } from '@/components/ui/toaster';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/PrivacyPolicy" element={<PrivacyPolicy />} />
        <Route path="/TermsOfService" element={<TermsOfService />} />
        <Route path="/RefundPolicy" element={<RefundPolicy />} />
        <Route path="/CancellationPolicy" element={<CancellationPolicy />} />
        <Route path="/About" element={<About />} />
      </Routes>
      <Toaster />
    </BrowserRouter>
  );
}

export default App;
```

---

## ✅ STEP 4: Update Semua Tombol "Login / Register / Get Started" di Landing

Di app landing yang baru, semua CTA (Hero, Nav, Final CTA, Pricing, dll) harus arahin ke **URL app utama** — bukan pakai `<Link>` React Router lagi.

Contoh: cari semua `to="/login"` atau `to="/register"` di komponen landing, ganti jadi:

```jsx
<a href="https://app.aturpintar.com/register">Mulai Gratis</a>
<a href="https://app.aturpintar.com/login">Masuk</a>
```

Simpan URL app utama di konstanta biar gampang di-update:

```jsx
// src/config.js
export const APP_URL = "https://app.aturpintar.com";
```

---

## ✅ STEP 5: Set Custom Domain

### Di App Landing (baru):
- Settings → Custom Domain → set ke `aturpintar.com` (atau domain utama kamu)

### Di App Utama (yang sekarang):
- Settings → Custom Domain → set ke `app.aturpintar.com`

---

## ✅ STEP 6: Testing di App Landing

1. Buka landing di domain baru → semua section jalan
2. Submit form waiting list → cek record masuk ke entity `WaitingList`
3. Klik tombol "Get Started" → redirect ke `app.aturpintar.com/register`
4. Cek halaman legal (`/PrivacyPolicy`, dll) accessible

---

## ✅ STEP 7: Bersihin App Utama (opsional, setelah landing baru jalan)

Kalau landing baru udah stabil, bisa suruh saya:
> "Hapus landing page & halaman legal dari app utama"

Nanti saya:
- Hapus `src/pages/LandingPage.jsx` + semua `src/components/landing/`
- Hapus halaman legal (`PrivacyPolicy.jsx`, `TermsOfService.jsx`, dll)
- Hapus entity `WaitingList` & `LandingAnalytics` (kalau gak dipake app utama)
- Ubah route `/` di `App.jsx` — kalau user belum login, redirect ke `https://aturpintar.com` (landing app)
- Hapus backend functions yang cuma dipake landing

---

## 📌 Catatan Penting

- **Data user & transaksi TETAP di app utama** — landing app cuma untuk marketing, gak nyimpen data user
- **SEO**: landing app punya `index.html` sendiri dengan meta tags — bisa lebih di-optimize khusus SEO
- **Analytics**: `LandingAnalytics` entity ada di app landing, jadi track CTA cuma di landing (bagus, gak nyampur)
- **Auth**: landing app **TIDAK butuh auth** — user cuma browsing, klik CTA baru pindah ke app utama untuk login/register

---

Selamat! Setelah 7 step di atas, landing page kamu jadi app terpisah yang lebih cepat & rapi. 🎉