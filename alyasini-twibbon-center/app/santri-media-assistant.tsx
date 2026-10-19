'use client';
import { useState } from 'react';
import Link from 'next/link';

const guides: Record<string,{title:string;body:string;action?:string;href?:string}> = {
  usage:{title:'Cara menggunakan twibbon',body:'Pilih twibbon yang kamu inginkan, tekan “Pasang Foto”, lalu unggah foto JPG, PNG, atau WebP. Geser dan atur ukuran foto sampai pas di bingkai, kemudian unduh hasilnya.',action:'Lihat koleksi twibbon',href:'/#galeri'},
  search:{title:'Mencari twibbon',body:'Buka bagian galeri, ketik nama kegiatan pada kolom pencarian, lalu gunakan filter kategori untuk mempersempit pilihan.',action:'Cari twibbon',href:'/#galeri'},
  download:{title:'Panduan download',body:'Setelah pratinjau terlihat sesuai, tekan tombol unduh pada editor. Jika unduhan tidak dimulai, izinkan download di browser dan coba lagi.'},
  committee:{title:'Twibbon khusus panitia',body:'Twibbon panitia memerlukan kode akses yang dibagikan oleh panitia kegiatan. Masukkan kode yang benar pada halaman twibbon. Jangan bagikan kode kepada orang yang tidak berkepentingan.'},
  trouble:{title:'Bantuan teknis',body:'Coba unggah foto berformat JPG, PNG, atau WebP. Jika pratinjau belum muncul, tunggu proses selesai lalu coba pilih foto kembali. Pastikan koneksi internet stabil.'}
};
export function SantriMediaAssistant(){
 const [open,setOpen]=useState(false);
 const [selected,setSelected]=useState('');
 const guide=selected?guides[selected]:null;
 return <div className="santri-assistant">
   {open&&<section className="santri-panel" aria-label="Panduan Santri Media">
    <header className="santri-head">
      <div className="santri-avatar" aria-hidden="true"><img src="/santri-media.png" alt="" /></div>
      <div className="santri-head-copy"><strong>Santri Media</strong><small>Asisten panduan Al-Yasini</small></div>
      <button className="santri-close" onClick={()=>{setOpen(false);setSelected('')}} aria-label="Tutup bantuan">×</button>
    </header>
    <div className="santri-content">
      <div className="santri-bubble"><strong>Assalamu’alaikum! 👋</strong><br/>Saya Santri Media. Saya siap membantu kamu menggunakan Al-Yasini Twibbon Center.</div>
      {guide?<div className="santri-guide"><strong>{guide.title}</strong><p>{guide.body}</p>{guide.href&&<Link className="santri-action-link" href={guide.href} onClick={()=>setOpen(false)}>{guide.action} ↗</Link>}<button className="santri-back" onClick={()=>setSelected('')}>‹ Kembali ke panduan</button></div>:<>
       <p className="santri-prompt">Pilih panduan yang kamu butuhkan:</p>
       <div className="santri-options">
        <button onClick={()=>setSelected('usage')}><span>▤</span>Cara menggunakan twibbon <b>›</b></button>
        <button onClick={()=>setSelected('search')}><span>⌕</span>Cari twibbon tertentu <b>›</b></button>
        <button onClick={()=>setSelected('download')}><span>↓</span>Panduan download <b>›</b></button>
        <button onClick={()=>setSelected('committee')}><span>♙</span>Twibbon khusus panitia <b>›</b></button>
        <button onClick={()=>setSelected('trouble')}><span>ⓘ</span>Bantuan teknis <b>›</b></button>
       </div>
      </>}
      <div className="santri-note">Panduan otomatis · Tidak perlu login</div>
    </div>
   </section>}
   <button className={'santri-launcher '+(open?'is-open':'')} onClick={()=>setOpen(v=>!v)} aria-label={open?'Tutup Santri Media':'Buka bantuan Santri Media'} aria-expanded={open}>
     {open?<span className="santri-launcher-x">×</span>:<><img className="santri-launcher-mascot" src="/santri-media.png" alt="" /><span className="santri-online-dot"/></>}
   </button>
   {!open&&<span className="santri-hint">Butuh bantuan?</span>}
 </div>
}
