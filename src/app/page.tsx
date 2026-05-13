import dynamic from 'next/dynamic';
const HomePage = dynamic(()=>import('@/components/pages/index').then(m=>({default:m.HomePage})),{ssr:false});
export default function Page(){return<HomePage/>;}
