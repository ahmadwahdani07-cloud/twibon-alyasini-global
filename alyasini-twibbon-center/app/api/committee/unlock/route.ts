import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { createHash } from 'node:crypto';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const slug = typeof body.slug === 'string' ? body.slug.trim() : '';
    const code = typeof body.code === 'string' ? body.code : '';
    if (!slug || !code || code.length > 200) return NextResponse.json({ error: 'Masukkan kode akses yang valid.' }, { status: 400 });

    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!url || !serviceKey) return NextResponse.json({ error: 'Konfigurasi server belum lengkap. Hubungi admin.' }, { status: 503 });
    const db = createClient(url, serviceKey, { auth: { persistSession: false } });

    const { data: item, error: itemError } = await db.from('twibbons')
      .select('slug,status,access_type,image_url')
      .eq('slug', slug).eq('status', 'published').eq('access_type', 'committee').maybeSingle();
    if (itemError || !item) return NextResponse.json({ error: 'Twibbon panitia tidak ditemukan.' }, { status: 404 });

    const { data: setting, error: settingError } = await db.from('committee_access_settings')
      .select('code_hash').eq('id', true).maybeSingle();
    if (settingError || !setting) return NextResponse.json({ error: 'Kode akses panitia belum disetel oleh admin.' }, { status: 503 });

    const submittedHash = createHash('sha256').update(code).digest('hex');
    if (submittedHash !== setting.code_hash) return NextResponse.json({ error: 'Kode akses salah.' }, { status: 401 });

    // For private assets, image_url stores the object path, not a public URL.
    const objectPath = item.image_url.replace(/^.*\/storage\/v1\/object\/(?:public|sign)\/twibbons-panitia\//, '');
    if (!objectPath || objectPath === item.image_url || objectPath.includes('..')) {
      return NextResponse.json({ error: 'Lokasi file panitia tidak valid. Admin perlu mengunggah ulang bingkai.' }, { status: 500 });
    }
    const { data: signed, error: signError } = await db.storage.from('twibbons-panitia').createSignedUrl(objectPath, 600);
    if (signError || !signed?.signedUrl) return NextResponse.json({ error: 'Gagal membuka bingkai panitia.' }, { status: 500 });
    return NextResponse.json({ imageUrl: signed.signedUrl, expiresIn: 600 });
  } catch {
    return NextResponse.json({ error: 'Permintaan tidak dapat diproses.' }, { status: 400 });
  }
}
