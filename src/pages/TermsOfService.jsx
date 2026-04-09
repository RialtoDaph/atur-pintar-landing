import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

const Section = ({ num, title, children }) => (
  <section>
    <h2 className="text-white font-bold text-base mb-3">{num}. {title}</h2>
    <div className="space-y-2 text-white/60">{children}</div>
  </section>
);

export default function TermsOfService() {
  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white font-sans">
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap'); * { font-family: 'Inter', sans-serif; }`}</style>

      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center px-5 sm:px-12 py-3 bg-[#0A0A0A]/90 backdrop-blur-xl border-b border-white/5">
        <div className="flex items-center gap-2">
          <img src="https://media.base44.com/images/public/69a82e8090f60786b869983c/d2e52bdf2_3.png" alt="Logo" className="w-6 h-6" />
          <span className="font-black text-white text-sm">Atur Pintar</span>
        </div>
        <button onClick={() => window.history.back()} className="ml-auto flex items-center gap-1.5 text-xs text-white/50 hover:text-white transition-colors">
          <ArrowLeft className="w-3.5 h-3.5" /> Kembali
        </button>
      </nav>

      <div className="max-w-2xl mx-auto px-5 pt-24 pb-20">
        <p className="text-[#FF6A00] text-xs font-bold uppercase tracking-widest mb-2">Legal</p>
        <h1 className="text-3xl sm:text-4xl font-black text-white mb-1">Syarat & Ketentuan Layanan</h1>
        <p className="text-white/30 text-xs mb-1">Berlaku sejak: April 2024 · Terakhir diperbarui: April 2026</p>
        <p className="text-white/40 text-xs mb-10">Dengan menggunakan layanan Atur Pintar, Anda dianggap telah membaca, memahami, dan menyetujui Syarat & Ketentuan ini.</p>

        <div className="space-y-8 text-sm leading-relaxed">

          <Section num="1" title="Definisi Layanan">
            <p><strong className="text-white/80">Atur Pintar</strong> adalah aplikasi manajemen keuangan pribadi berbasis kecerdasan buatan yang membantu pengguna mencatat transaksi, membuat anggaran, melacak tujuan keuangan, mengelola utang dan investasi, serta mendapatkan saran keuangan melalui asisten AI bernama <strong className="text-white/80">Nana AI</strong>.</p>
            <p>Layanan tersedia dalam dua versi:</p>
            <ul className="list-disc list-inside space-y-1.5 mt-1">
              <li><strong className="text-white/80">Free:</strong> Gratis selamanya dengan fitur dasar</li>
              <li><strong className="text-white/80">Premium:</strong> Berlangganan bulanan atau tahunan dengan akses fitur lengkap</li>
            </ul>
          </Section>

          <Section num="2" title="Ketentuan Penggunaan Akun">
            <ul className="list-disc list-inside space-y-1.5">
              <li>Pendaftaran akun memerlukan email yang valid dan aktif</li>
              <li>Satu orang hanya diizinkan memiliki satu akun aktif</li>
              <li>Anda bertanggung jawab penuh atas kerahasiaan kata sandi dan aktivitas yang terjadi di akun Anda</li>
              <li>Akun tidak boleh dipindahkan, dijual, atau dibagikan kepada pihak lain</li>
              <li>Pengguna berusia di bawah 17 tahun wajib mendapat persetujuan orang tua atau wali</li>
              <li>Atur Pintar berhak menangguhkan atau menghentikan akun yang melanggar ketentuan ini tanpa pemberitahuan terlebih dahulu</li>
            </ul>
          </Section>

          <Section num="3" title="Ketentuan Berlangganan Premium">
            <p><strong className="text-white/80">Harga:</strong> Harga langganan Premium ditentukan oleh kami dan ditampilkan pada halaman berlangganan. Harga dapat berubah dengan pemberitahuan minimal 30 hari sebelumnya.</p>
            <p><strong className="text-white/80">Pembayaran:</strong> Seluruh pembayaran diproses melalui Midtrans (PT Midtrans). Kami menerima berbagai metode pembayaran termasuk transfer bank, e-wallet, kartu kredit/debit, dan minimarket.</p>
            <p><strong className="text-white/80">Aktivasi:</strong> Langganan diaktifkan segera setelah pembayaran dikonfirmasi oleh sistem. Untuk pembayaran manual (transfer bank), aktivasi dapat memakan waktu hingga 1×24 jam.</p>
            <p><strong className="text-white/80">Perpanjangan:</strong> Langganan tidak diperpanjang otomatis. Pengguna perlu melakukan pembayaran baru untuk memperpanjang langganan.</p>
            <p><strong className="text-white/80">Berakhirnya Langganan:</strong> Setelah masa langganan habis, akun akan otomatis beralih ke paket Free. Data Anda tidak akan dihapus.</p>
          </Section>

          <Section num="4" title="Kebijakan Pengembalian Dana (Refund Policy)">
            <p className="bg-[#FF6A00]/10 border border-[#FF6A00]/20 rounded-lg px-4 py-3 text-white/70">
              <strong className="text-[#FF6A00]">Penting:</strong> Atur Pintar menerapkan kebijakan <strong className="text-white/80">tidak ada pengembalian dana (no refund)</strong> untuk semua pembelian langganan yang telah dikonfirmasi dan diaktifkan.
            </p>
            <p>Hal ini karena Anda mendapatkan akses penuh ke semua fitur Premium segera setelah pembayaran dikonfirmasi.</p>
            <p><strong className="text-white/80">Pengecualian</strong> yang memungkinkan pengembalian dana:</p>
            <ul className="list-disc list-inside space-y-1.5 mt-1">
              <li>Terjadi double charge (tagihan ganda) akibat kesalahan sistem</li>
              <li>Pembayaran berhasil tetapi langganan tidak aktif dalam 48 jam</li>
              <li>Gangguan layanan total selama lebih dari 72 jam berturut-turut</li>
            </ul>
            <p>Untuk klaim pengecualian, hubungi <a href="mailto:support@aturpintar.id" className="text-[#FF6A00] hover:underline">support@aturpintar.id</a> disertai bukti pembayaran dalam 7 hari kerja.</p>
          </Section>

          <Section num="5" title="Larangan Penggunaan">
            <p>Pengguna dilarang untuk:</p>
            <ul className="list-disc list-inside space-y-1.5 mt-1">
              <li>Menggunakan layanan untuk aktivitas ilegal atau yang melanggar hukum Indonesia</li>
              <li>Berbagi akun Premium dengan pengguna lain</li>
              <li>Melakukan reverse engineering, decompile, atau memodifikasi kode aplikasi</li>
              <li>Menggunakan bot, scraper, atau skrip otomatis tanpa izin tertulis</li>
              <li>Mencoba mengakses data pengguna lain</li>
              <li>Menyebarkan konten yang melanggar hak cipta atau hak kekayaan intelektual</li>
              <li>Melakukan tindakan yang membebani atau mengganggu infrastruktur layanan</li>
              <li>Menyalahgunakan fitur Nana AI untuk menghasilkan konten berbahaya atau menyesatkan</li>
            </ul>
          </Section>

          <Section num="6" title="Disclaimer Keuangan">
            <p className="bg-amber-500/10 border border-amber-500/20 rounded-lg px-4 py-3 text-white/70">
              <strong className="text-amber-400">Penting:</strong> Atur Pintar, termasuk fitur Nana AI, <strong className="text-white/80">bukan merupakan penasihat keuangan berlisensi</strong> dan tidak terdaftar sebagai lembaga keuangan.
            </p>
            <p>Seluruh informasi, analitik, prediksi, dan saran yang disediakan oleh aplikasi ini bersifat <strong className="text-white/80">edukatif dan informatif semata</strong>. Pengguna bertanggung jawab penuh atas keputusan keuangan yang diambil berdasarkan informasi dari aplikasi ini.</p>
            <p>Atur Pintar tidak bertanggung jawab atas:</p>
            <ul className="list-disc list-inside space-y-1.5 mt-1">
              <li>Kerugian finansial akibat keputusan berdasarkan data atau saran AI dari aplikasi</li>
              <li>Ketidakakuratan data yang dimasukkan sendiri oleh pengguna</li>
              <li>Prediksi atau proyeksi keuangan yang tidak terealisasi</li>
            </ul>
            <p>Untuk keputusan keuangan signifikan (investasi besar, pinjaman, dll.), konsultasikan dengan perencana keuangan berlisensi.</p>
          </Section>

          <Section num="7" title="Kekayaan Intelektual">
            <p>Seluruh konten, desain, kode, merek dagang, dan materi dalam aplikasi Atur Pintar adalah milik kami dan dilindungi oleh hukum kekayaan intelektual Indonesia. Pengguna tidak diizinkan menyalin, mendistribusikan, atau menggunakan materi tersebut tanpa izin tertulis.</p>
            <p>Data keuangan yang Anda masukkan tetap menjadi milik Anda. Kami tidak mengklaim kepemilikan atas data pribadi pengguna.</p>
          </Section>

          <Section num="8" title="Ketersediaan dan Keandalan Layanan">
            <p>Kami berupaya menjaga ketersediaan layanan (uptime) setinggi mungkin, namun tidak dapat menjamin ketersediaan 100%. Hal yang dapat menyebabkan gangguan layanan:</p>
            <ul className="list-disc list-inside space-y-1.5 mt-1">
              <li>Pemeliharaan terjadwal (akan diberitahukan minimal 24 jam sebelumnya)</li>
              <li>Gangguan teknis di luar kendali kami (force majeure)</li>
              <li>Serangan siber atau keadaan darurat</li>
            </ul>
            <p>Atur Pintar tidak bertanggung jawab atas kerugian yang timbul akibat gangguan layanan yang tidak disengaja.</p>
          </Section>

          <Section num="9" title="Pembatasan Tanggung Jawab">
            <p>Sejauh diizinkan oleh hukum yang berlaku, tanggung jawab maksimum Atur Pintar kepada pengguna dalam kondisi apapun tidak melebihi jumlah yang telah Anda bayarkan untuk layanan dalam 3 (tiga) bulan terakhir.</p>
          </Section>

          <Section num="10" title="Perubahan Syarat & Ketentuan">
            <p>Kami berhak mengubah Syarat & Ketentuan ini sewaktu-waktu. Perubahan material akan diberitahukan melalui notifikasi dalam aplikasi atau email minimal 30 hari sebelum berlaku.</p>
            <p>Jika Anda tidak menyetujui perubahan, Anda dapat menutup akun sebelum tanggal berlaku perubahan.</p>
          </Section>

          <Section num="11" title="Penghentian Layanan">
            <p>Anda dapat menghentikan penggunaan layanan kapan saja dengan menghapus akun melalui halaman Pengaturan. Penghapusan akun bersifat permanen dan tidak dapat dipulihkan.</p>
            <p>Kami berhak menghentikan layanan dengan pemberitahuan minimal 30 hari kepada seluruh pengguna aktif.</p>
          </Section>

          <Section num="12" title="Penyelesaian Sengketa">
            <p>Syarat & Ketentuan ini tunduk pada hukum Negara Kesatuan Republik Indonesia.</p>
            <p>Sengketa yang timbul diselesaikan melalui tahapan:</p>
            <ol className="list-decimal list-inside space-y-1.5 mt-1">
              <li><strong className="text-white/80">Musyawarah mufakat</strong> dalam 30 hari sejak sengketa dinyatakan secara tertulis</li>
              <li><strong className="text-white/80">Mediasi</strong> melalui lembaga mediasi yang disepakati bersama</li>
              <li><strong className="text-white/80">Pengadilan negeri</strong> yang berwenang di wilayah hukum Indonesia</li>
            </ol>
          </Section>

          <Section num="13" title="Hubungi Kami">
            <p>Untuk pertanyaan, keluhan, atau pengaduan:</p>
            <ul className="list-none space-y-1.5 mt-2">
              <li>📧 Email: <a href="mailto:support@aturpintar.id" className="text-[#FF6A00] hover:underline">support@aturpintar.id</a></li>
              <li>🕐 Waktu respons: 1–5 hari kerja</li>
              <li>📋 Sertakan: nama akun, tanggal kejadian, dan deskripsi masalah</li>
            </ul>
          </Section>

        </div>
      </div>

      <footer className="border-t border-white/5 py-6 px-5 text-center">
        <div className="flex items-center justify-center gap-4 mb-3">
          <Link to="/PrivacyPolicy" className="text-white/30 hover:text-white/60 text-xs transition-colors">Kebijakan Privasi</Link>
          <span className="text-white/15">·</span>
          <Link to="/LandingPage" className="text-white/30 hover:text-white/60 text-xs transition-colors">Beranda</Link>
        </div>
        <p className="text-white/20 text-xs">© 2026 Atur Pintar. Kelola uangmu lebih cerdas.</p>
      </footer>
    </div>
  );
}