import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { createHash } from 'node:crypto';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const slug = typeof body.slug === 'string' ? body.slug.trim() : '';
    const code = typeof body.code === 'string' ? body.code : '';
    if (!slug || !code || code.length > 200) {
      return NextResponse.json({ error: 'Masukkan kode akses yang valid.' }, { status: 400 });
    }

    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    const missing = [!url ? 'NEXT_PUBLIC_SUPABASE_URL' : '', !serviceKey ? 'SUPABASE_SERVICE_ROLE_KEY' : ''].filter(Boolean);
    if (missing.length) {
      return NextResponse.json({ error: `Konfigurasi server belum lengkap: ${missing.join(' dan ')} belum diatur di Vercel Environment Variables.` }, { status: 503 });
    }

    const db = createClient(url!, serviceKey!, { auth: { persistSession: false } });
    // Query by slug first so a DB/schema error is not mislabeled as a missing twibbon.
    const { data: item, error: itemError } = await db.from('twibbons')
      .select('slug,status,access_type,image_url')
      .eq('slug', slug)
      .maybeSingle();

    if (itemError) {
      console.error('[committee/unlock] Twibbon lookup failed:', itemError.code, itemError.message);
      return NextResponse.json({ error: 'Gagal memeriksa data twibbon di database. Periksa Logs Vercel untuk detail.' }, { status: 500 });
    }
    if (!item || item.status !== 'published' || item.access_type !== 'committee') {
      console.warn('[committee/unlock] Twibbon unavailable:', {
        slug,
        found: Boolean(item),
        status: item?.status ?? null,
        access_type: item?.access_type ?? null,
      });
      return NextResponse.json({ error: 'Twibbon tidak tersedia untuk akses panitia. Periksa slug, status published, dan access_type committee.' }, { status: 404 });
    }
    if (!item.image_url) {
      return NextResponse.json({ error: 'Bingkai panitia belum memiliki file. Admin perlu mengunggah ulang bingkai.' }, { status: 500 });
    }

    const { data: setting, error: settingError } = await db.from('committee_access_settings')
      .select('code_hash').eq('id', true).maybeSingle();
    if (settingError) {
      console.error('[committee/unlock] Settings lookup failed:', settingError.code, settingError.message);
      return NextResponse.json({ error: 'Gagal membaca pengaturan kode akses. Periksa Logs Vercel.' }, { status: 500 });
    }
    if (!setting) return NextResponse.json({ error: 'Kode akses panitia belum disetel oleh admin.' }, { status: 503 });

    const submittedHash = createHash('sha256').update(code).digest('hex');
    if (submittedHash !== setting.code_hash) return NextResponse.json({ error: 'Kode akses salah.' }, { status: 401 });

    const objectPath = item.image_url.startsWith('http')
      ? item.image_url.replace(/^.*\/storage\/v1\/object\/(?:public|sign)\/twibbons-panitia\//, '')
      : item.image_url;
    if (!objectPath || objectPath.includes('..') || objectPath.startsWith('/')) {
      return NextResponse.json({ error: 'Lokasi file panitia tidak valid. Admin perlu mengunggah ulang bingkai.' }, { status: 500 });
    }

    const { data: signed, error: signError } = await db.storage.from('twibbons-panitia').createSignedUrl(objectPath, 600);
    if (signError || !signed?.signedUrl) {
      console.error('[committee/unlock] Signed URL failed:', signError?.message ?? 'No signed URL returned');
      return NextResponse.json({ error: 'Gagal membuka bingkai panitia. Periksa bucket dan lokasi file.' }, { status: 500 });
    }
    return NextResponse.json({ imageUrl: signed.signedUrl, expiresIn: 600 });
  } catch (error) {
    console.error('[committee/unlock] Unexpected error:', error);
    return NextResponse.json({ error: 'Permintaan tidak dapat diproses.' }, { status: 400 });
  }
}
