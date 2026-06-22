'use client';

export default function Error({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div style={{textAlign:'center',padding:'60px 20px',maxWidth:'500px',margin:'0 auto'}}>
      <p style={{fontSize:'48px',marginBottom:'16px'}}>⚠️</p>
      <p style={{color:'#64748b',marginBottom:'16px',fontSize:'14px'}}>დროებითი ხარვეზი ნაწილების ჩატვირთვისას. სცადეთ თავიდან.</p>
      <button onClick={() => reset()} style={{background:'#0066CC',color:'#fff',padding:'10px 24px',borderRadius:'8px',border:'none',cursor:'pointer',fontWeight:700,fontSize:'14px'}}>
        თავიდან ცდა
      </button>
    </div>
  );
}
