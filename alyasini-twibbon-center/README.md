# Al-Yasini Twibbon Center — paket siap deploy

Website Next.js + Supabase untuk pusat twibbon resmi Pondok Pesantren Terpadu Al-Yasini.

## Cara paling mudah: upload lewat browser, tanpa VS Code

### 1. Buat project Supabase
1. Buka https://supabase.com/dashboard lalu buat project baru.
2. Setelah project siap, buka **SQL Editor** → **New query**.
3. Buka file `supabase/setup.sql` dari ZIP ini, salin seluruh isinya, tempel ke SQL Editor, lalu tekan **Run**.
4. Buka **Project Settings → API** (atau **Connect**) dan salin **Project URL** serta **anon/public key** atau **publishable key**. Jangan pernah gunakan `service_role`/secret key di website.
5. Buka **Authentication → Users → Add user**, buat email dan password admin. Setelah dibuat, salin UUID/ID user tersebut.
6. Kembali ke **SQL Editor**, jalankan perintah berikut dengan UUID admin kamu: `insert into public.admins (user_id) values ('UUID-USER-ADMIN');` (ganti teks UUID dengan ID asli dari Authentication → Users). Hanya akun yang masuk daftar ini yang boleh mengelola konten.
7. Di **Authentication → Settings / Sign In**, nonaktifkan pendaftaran publik (Disable signups) jika opsi itu tersedia. Jangan berikan akun admin ke pengunjung umum.

### 2. Upload proyek ke GitHub tanpa mengedit kode
1. Ekstrak ZIP ini di komputer.
2. Buka https://github.com/new dan buat repository baru, misalnya `alyasini-twibbon-center`.
3. Pada repository, pilih **Add file → Upload files**.
4. Buka folder hasil ekstrak, pilih semua isi folder proyek (termasuk `app`, `lib`, `public`, `supabase`, `package.json`, dan file lainnya), lalu seret ke halaman upload GitHub. Unggah isi foldernya, bukan folder induk yang membungkus semuanya.
5. Tekan **Commit changes**.

### 3. Deploy ke Vercel
1. Buka https://vercel.com/new lalu login dengan GitHub.
2. Pilih repository yang baru dibuat dan tekan **Deploy**.
3. Jika build gagal karena variabel Supabase belum ada, buka **Project → Settings → Environment Variables** lalu tambahkan:
   - `NEXT_PUBLIC_SUPABASE_URL` = Project URL dari Supabase
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` = anon/public atau publishable key dari Supabase
4. Simpan, lalu buka **Deployments** dan pilih **Redeploy** untuk deployment terbaru.
5. Buka domain `*.vercel.app` yang diberikan Vercel.

> Environment Variables tidak perlu dimasukkan ke file kode. Setelah mengubah variabel, lakukan Redeploy.

### 4. Mulai mengisi twibbon
1. Buka `https://domain-vercel-kamu.vercel.app/login`.
2. Login menggunakan email dan password admin yang dibuat di Supabase Auth.
3. Tambahkan judul, slug, kategori, deskripsi, status, dan file PNG transparan.
4. Pilih **Published** agar tampil di website publik. **Draft** dan **Archived** tidak ditampilkan di galeri publik.
5. Bagikan domain utama untuk galeri, atau link khusus `/twibbon/slug-kegiatan` untuk halaman detail.

## Fitur yang tersedia
- Beranda, galeri, pencarian, filter kategori, urutan terbaru/terpopuler.
- Detail twibbon dan editor foto berbasis Canvas.
- Unggah JPG/PNG/WebP, geser, zoom, reset, ganti foto, dan ekspor PNG.
- Login admin Supabase Auth, CRUD twibbon, kategori, dan status publikasi.
- Foto pengunjung diproses di browser; tidak diunggah ke database.

## Catatan penting sebelum digunakan publik
- Supabase SQL setup menyiapkan RLS dan Storage dengan allowlist tabel `admins`. Setelah membuat user, wajib masukkan UUID-nya ke `public.admins`; akun login lain tidak boleh mengelola konten.
- Penghitungan unduhan ditampilkan di dashboard tetapi versi awal ini belum menaikkan counter otomatis. Statistik unduhan perlu ditambahkan melalui RPC/Edge Function yang aman sebelum dijadikan metrik resmi.
- PNG twibbon harus punya area transparan dan dapat diakses publik. Editor menyusun foto di bawah bingkai PNG.
- Jika ekspor gagal dengan pesan canvas/CORS, pastikan aset PNG berasal dari bucket `twibbons` yang dibuat oleh setup SQL dan berstatus publik.
- Paket ini menggunakan logo AL-YASINI MEDIA yang disertakan pada aset pengguna. Ganti file `public/logo-alyasini-media.png` hanya jika ingin menggunakan file logo resmi lain.
- Pengaturan domain khusus dapat dilakukan setelah deployment melalui Vercel → Project → Settings → Domains.

## Teknologi
Next.js 14, React, TypeScript, Supabase PostgreSQL/Storage/Auth, HTML Canvas API, dan Vercel.
