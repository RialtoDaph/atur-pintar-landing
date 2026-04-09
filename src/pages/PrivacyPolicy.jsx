import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

const Section = ({ num, title, children }) => (
  <section>
    <h2 className="text-white font-bold text-base mb-3">{num}. {title}</h2>
    <div className="space-y-2 text-white/60">{children}</div>
  </section>
);

export default function PrivacyPolicy() {
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
        <h1 className="text-3xl sm:text-4xl font-black text-white mb-1">Kebijakan Privasi</h1>
        <p className="text-white/30 text-xs mb-1">Berlaku sejak: April 2024 · Terakhir diperbarui: April 2026</p>
        <p className="text-white/40 text-xs mb-10">Sesuai dengan UU No. 27 Tahun 2022 tentang Perlindungan Data Pribadi dan PP No. 71 Tahun 2019 tentang Penyelenggaraan Sistem dan Transaksi Elektronik.</p>

        <div className="space-y-8 text-sm leading-relaxed">

          <Section num="1" title="Identitas Pengelola Layanan">
            <p>Aplikasi <strong className="text-white">Atur Pintar</strong> ("kami", "layanan") dikelola oleh tim pengembang Atur Pintar yang berdomisili di Indonesia. Untuk pertanyaan terkait data pribadi, silakan hubungi kami di <a href="mailto:support@aturpintar.id" className="text-[#FF6A00] hover:underline">support@aturpintar.id</a>.</p>
            <p>Kebijakan Privasi ini menjelaskan bagaimana kami mengumpulkan, menggunakan, menyimpan, dan melindungi data pribadi pengguna layanan Atur Pintar.</p>
          </Section>

          <Section num="2" title="Data yang Kami Kumpulkan">
            <p>Kami mengumpulkan data berikut saat Anda menggunakan layanan:</p>
            <ul className="list-disc list-inside space-y-1.5 mt-2">
              <li><strong className="text-white/80">Data Identitas:</strong> Nama lengkap, alamat email, kata sandi terenkripsi</li>
              <li><strong className="text-white/80">Data Keuangan:</strong> Catatan transaksi (pemasukan, pengeluaran, tabungan) yang Anda masukkan secara manual — data ini tidak terhubung ke rekening bank Anda</li>
              <li><strong className="text-white/80">Data Preferensi:</strong> Anggaran, tujuan tabungan, pengingat, kategori kustom</li>
              <li><strong className="text-white/80">Data Percakapan AI:</strong> Riwayat percakapan dengan Nana AI untuk memberikan saran yang lebih personal</li>
              <li><strong className="text-white/80">Data Perangkat:</strong> Jenis browser, sistem operasi, dan alamat IP untuk keperluan keamanan</li>
              <li><strong className="text-white/80">Data Pembayaran:</strong> Informasi transaksi langganan (diproses oleh Midtrans; kami tidak menyimpan data kartu Anda)</li>
            </ul>
          </Section>

          <Section num="3" title="Tujuan Pengumpulan Data">
            <p>Data Anda digunakan untuk:</p>
            <ul className="list-disc list-inside space-y-1.5 mt-2">
              <li>Menjalankan layanan aplikasi dan menampilkan dashboard keuangan personal Anda</li>
              <li>Memberikan saran dan insight dari Nana AI berdasarkan pola keuangan Anda</li>
              <li>Memproses pembayaran langganan Premium</li>
              <li>Mengirim notifikasi pengingat tagihan dan pengumuman layanan</li>
              <li>Mendeteksi dan mencegah penipuan serta akses tidak sah</li>
              <li>Meningkatkan kualitas dan fitur aplikasi secara anonim dan agregat</li>
            </ul>
          </Section>

          <Section num="4" title="Penyimpanan dan Keamanan Data">
            <p>Data Anda disimpan pada infrastruktur cloud yang berlokasi dengan standar keamanan tinggi. Kami menerapkan langkah-langkah perlindungan teknis berikut:</p>
            <ul className="list-disc list-inside space-y-1.5 mt-2">
              <li>Enkripsi data saat transit (TLS/HTTPS) dan saat penyimpanan</li>
              <li>Autentikasi berlapis dan kontrol akses berbasis peran</li>
              <li>Pemantauan keamanan secara berkala</li>
              <li>Data keuangan Anda hanya dapat diakses oleh Anda sendiri</li>
            </ul>
            <p className="mt-2">Data Anda disimpan selama akun Anda aktif. Setelah penghapusan akun, data akan dihapus dalam 30 hari kerja.</p>
          </Section>

          <Section num="5" title="Layanan Pihak Ketiga">
            <p>Atur Pintar menggunakan layanan pihak ketiga berikut untuk menjalankan operasional:</p>
            <ul className="list-disc list-inside space-y-1.5 mt-2">
              <li><strong className="text-white/80">Midtrans (Gojek Group):</strong> Pemrosesan pembayaran langganan Premium. Data pembayaran tunduk pada kebijakan privasi Midtrans.</li>
              <li><strong className="text-white/80">Penyedia AI (Anthropic/OpenAI/Google):</strong> Pemrosesan percakapan Nana AI. Percakapan dikirim secara terenkripsi dan tidak digunakan untuk melatih model pihak ketiga.</li>
              <li><strong className="text-white/80">Base44:</strong> Platform infrastruktur teknis (database, autentikasi, hosting). Data disimpan di server Base44 dengan standar keamanan enterprise.</li>
              <li><strong className="text-white/80">Google (OAuth):</strong> Opsi masuk menggunakan akun Google. Kami hanya menerima nama dan email dari Google.</li>
            </ul>
            <p className="mt-2">Kami tidak menjual, menyewakan, atau menukar data pribadi Anda kepada pihak ketiga untuk tujuan komersial.</p>
          </Section>

          <Section num="6" title="Hak-Hak Pengguna">
            <p>Sesuai dengan UU Perlindungan Data Pribadi Indonesia, Anda memiliki hak untuk:</p>
            <ul className="list-disc list-inside space-y-1.5 mt-2">
              <li><strong className="text-white/80">Hak Akses:</strong> Meminta salinan data pribadi yang kami simpan tentang Anda</li>
              <li><strong className="text-white/80">Hak Koreksi:</strong> Memperbarui atau memperbaiki data pribadi Anda melalui halaman Profil</li>
              <li><strong className="text-white/80">Hak Penghapusan:</strong> Meminta penghapusan akun dan seluruh data Anda</li>
              <li><strong className="text-white/80">Hak Portabilitas:</strong> Meminta ekspor data Anda dalam format yang dapat dibaca mesin</li>
              <li><strong className="text-white/80">Hak Keberatan:</strong> Menolak pemrosesan data untuk tujuan tertentu (misalnya pemasaran)</li>
            </ul>
            <p className="mt-2">Untuk menggunakan hak-hak di atas, hubungi kami di <a href="mailto:support@aturpintar.id" className="text-[#FF6A00] hover:underline">support@aturpintar.id</a>. Kami akan merespons dalam 14 hari kerja.</p>
          </Section>

          <Section num="7" title="Cookie dan Teknologi Pelacakan">
            <p>Atur Pintar menggunakan:</p>
            <ul className="list-disc list-inside space-y-1.5 mt-2">
              <li><strong className="text-white/80">Cookie Sesi:</strong> Untuk menjaga status login Anda (wajib, tidak dapat dinonaktifkan)</li>
              <li><strong className="text-white/80">localStorage:</strong> Untuk menyimpan preferensi tampilan dan pengaturan lokal</li>
            </ul>
            <p className="mt-2">Kami <strong className="text-white/80">tidak</strong> menggunakan cookie pelacakan iklan pihak ketiga, pixel tracking, atau teknologi fingerprinting.</p>
          </Section>

          <Section num="8" title="Transfer Data Lintas Batas">
            <p>Data Anda mungkin diproses di server yang berlokasi di luar Indonesia (termasuk Amerika Serikat dan Singapura) melalui layanan pihak ketiga yang kami gunakan. Kami memastikan setiap transfer data dilindungi oleh perjanjian pemrosesan data yang memadai.</p>
          </Section>

          <Section num="9" title="Data Anak di Bawah Umur">
            <p>Layanan Atur Pintar tidak ditujukan untuk pengguna di bawah usia 17 tahun. Kami tidak secara sengaja mengumpulkan data dari anak-anak. Jika Anda yakin data anak Anda telah dikumpulkan tanpa persetujuan, hubungi kami segera.</p>
          </Section>

          <Section num="10" title="Perubahan Kebijakan Privasi">
            <p>Kami dapat memperbarui Kebijakan Privasi ini dari waktu ke waktu. Perubahan material akan diberitahukan melalui:</p>
            <ul className="list-disc list-inside space-y-1.5 mt-2">
              <li>Notifikasi dalam aplikasi paling lambat 30 hari sebelum berlaku</li>
              <li>Email ke alamat yang terdaftar di akun Anda</li>
            </ul>
            <p className="mt-2">Penggunaan layanan yang berlanjut setelah perubahan berlaku dianggap sebagai persetujuan Anda.</p>
          </Section>

          <Section num="11" title="Hubungi Kami">
            <p>Untuk pertanyaan, keluhan, atau permintaan terkait data pribadi Anda:</p>
            <ul className="list-none space-y-1.5 mt-2">
              <li>📧 Email: <a href="mailto:support@aturpintar.id" className="text-[#FF6A00] hover:underline">support@aturpintar.id</a></li>
              <li>🕐 Waktu respons: 1–5 hari kerja</li>
            </ul>
          </Section>

        </div>
      </div>

      <footer className="border-t border-white/5 py-6 px-5 text-center">
        <div className="flex items-center justify-center gap-4 mb-3">
          <Link to="/TermsOfService" className="text-white/30 hover:text-white/60 text-xs transition-colors">Syarat & Ketentuan</Link>
          <span className="text-white/15">·</span>
          <Link to="/LandingPage" className="text-white/30 hover:text-white/60 text-xs transition-colors">Beranda</Link>
        </div>
        <p className="text-white/20 text-xs">© 2026 Atur Pintar. Kelola uangmu lebih cerdas.</p>
      </footer>
    </div>
  );
}