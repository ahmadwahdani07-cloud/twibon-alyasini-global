import {Header,Footer} from '../../components';
import {supabase} from '../../../lib/supabase';
import Editor from './ui';
import CommitteeGate from './committee-gate';

export default async function EditPage({params}:{params:{slug:string}}){
 let item:any=null;
 if(supabase){const {data}=await supabase.from('twibbons').select('*').eq('slug',params.slug).eq('status','published').maybeSingle();item=data}
 return <><Header/><main className="wrap"><div className="page-title"><div className="eyebrow" style={{color:'var(--green)'}}>Editor twibbon</div><h1>{item?.title||'Pasang Foto'}</h1><p className="muted">Unggah foto, sesuaikan posisi, lalu unduh hasilnya.</p></div>{item?(item.access_type==='committee'?<CommitteeGate id={item.id} slug={item.slug} title={item.title} width={item.export_width||1080} height={item.export_height||1080}/>:<Editor id={item.id} imageUrl={item.image_url} title={item.title} width={item.export_width||1080} height={item.export_height||1080}/>):<div className="empty"><h2>Twibbon tidak ditemukan</h2><a className="button" href="/">Kembali ke galeri</a></div>}</main><Footer/></>
}
