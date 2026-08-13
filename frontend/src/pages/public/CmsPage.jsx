import { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import Markdown from 'react-markdown';
import { useProducts } from '../../context/ProductContext';

export default function CmsPage(){
  const { slug }=useParams(); const { pages }=useProducts(); const page=pages.find(p=>p.slug===slug);
  useEffect(()=>{if(page){document.title=page.seoTitle||page.title;}},[page]);
  if(!page)return <main className="pt-32 pb-28 px-6 max-w-4xl mx-auto min-h-[70vh]"><h1 className="text-4xl font-black">Page not found</h1></main>;
  return <main className="pt-32 pb-28 px-6 max-w-4xl mx-auto"><p className="text-[10px] font-bold uppercase tracking-[.35em] text-black/40 mb-4">Information</p><h1 className="font-headline text-4xl md:text-6xl font-black uppercase tracking-tight mb-8">{page.title}</h1>{page.excerpt&&<p className="text-lg text-black/55 mb-10">{page.excerpt}</p>}<article className="prose prose-neutral max-w-none leading-8"><Markdown>{page.body||''}</Markdown></article></main>;
}
