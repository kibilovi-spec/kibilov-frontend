'use client';
import { useRouter } from 'next/navigation';

export default function BackButton() {
  const router = useRouter();
  return (
    <button onClick={() => router.back()} style={{background:'none',border:'none',cursor:'pointer',color:'#0066CC',fontSize:'14px',fontWeight:600}}>
      ← უკან
    </button>
  );
}
