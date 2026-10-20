'use client';
import { useState } from 'react';
import Editor from './ui';

export default function CommitteeGate({ id, slug, title, width, height }: { id: string; slug: string; title: string; width: number; height: number }) {
  const [code, setCode] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  async function unlock(e: React.FormEvent) {
    e.preventDefault(); setBusy(true); setError('');
    try {
      const response = await fetch('/api/committee/unlock', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ slug, code }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Kode akses tidak dapat diverifikasi.');
      setImageUrl(data.imageUrl);
    } catch (err) { setError(err instanceof Error ? err.message : 'Terjadi kesalahan.'); }
    finally { setBusy(false); }
  }
  if (imageUrl) return <><div className="notice success">Akses disetujui. Tautan bingkai sementara berlaku sekitar 10 menit.</div><Editor id={id} imageUrl={imageUrl} title={title} width={width} height={height} /></>;
  return <section className="panel" style={{maxWidth:520,margin:'0 auto'}}>
    <span className="tag">Khusus Panitia</span><h2>Masukkan kode akses</h2>
    <p className="muted">Bingkai ini hanya untuk panitia. Minta kode akses terbaru kepada admin kegiatan.</p>
    <form onSubmit={unlock} className="formgrid">
      <div className="formfield full"><label>Kode akses panitia</label><input className="field" type="password" autoComplete="off" value={code} onChange={e=>setCode(e.target.value)} required maxLength={200} /></div>
      {error && <div className="notice full">{error}</div>}
      <div className="formfield full"><button disabled={busy || !code.trim()}>{busy ? 'Memeriksa...' : 'Buka Editor'}</button></div>
    </form>
  </section>;
}
