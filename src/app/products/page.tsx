import dynamic from 'next/dynamic';
const ProductsPage = dynamic(()=>import('@/components/pages/index').then(m=>({default:m.ProductsPage})),{ssr:false});
export default function Page({searchParams}:{searchParams?:Record<string,string>}){return<ProductsPage searchParams={searchParams}/>;}
