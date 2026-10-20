import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { createHash } from 'node:crypto';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization') || '';
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : '';
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!url || !anonKey || !serviceKey) return NextResponse.json({ error: 'Konfigurasi server belum lengkap.' }, { status: 503 });
    if (!token) return NextResponse.json({ error: 'Sesi admin tidak ditemukan.' }, { status: 401 });

    const authClient = createClient(url, anonKey, { auth: { persistSession: false } });
    const { data: authData, error: authError } = await authClient.auth.getUser(token);
    if (authError || !authData.user) return NextResponse.json({ error: 'Sesi admin tidak valid.' }, { status: 401 });

    const db = createClient(url, serviceKey, { auth: { persistSession: false } });
    const { data: admin } = await db.from('admins').select('user_id').eq('user_id', authData.user.id).maybeSingle();
    if (!admin) return NextResponse.json({ error: 'Akun ini tidak memiliki hak admin.' }, { status: 403 });

    const body = await req.json();
    const code = typeof body.code === 'string' ? body.code.trim() : '';
    if (code.length < 8 || code.length > 200) return NextResponse.json({ error: 'Kode akses harus 8–200 karakter.' }, { status: 400 });
    const code_hash = createHash('sha256').update(code).digest('hex');
    const { error } = await db.from('committee_access_settings').upsert({ id: true, code_hash, updated_at: new Date().toISOString() }, { onConflict: 'id' });
    if (error) return NextResponse.json({ error: 'Gagal menyimpan kode akses. Jalankan migrasi SQL terlebih dahulu.' }, { status: 500 });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: 'Permintaan tidak dapat diproses.' }, { status: 400 });
  }
}
