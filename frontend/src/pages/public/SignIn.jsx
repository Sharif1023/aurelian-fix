import { useState } from 'react';
import { Mail, Lock, ArrowRight, Github, Chrome } from 'lucide-react';
import { cn } from '@/src/lib/utils';
import toast from 'react-hot-toast';
import { customerLogin, customerRegister } from '../../lib/api';
import { useProducts } from '../../context/ProductContext';

export default function SignIn() {
  const [isLogin, setIsLogin] = useState(true);
  const [form,setForm]=useState({name:'',email:'',password:''});
  const [busy,setBusy]=useState(false);
  const { storeSettings }=useProducts();
  const brand=storeSettings?.brandSettings?.name||'SHARUU';
  const submit=async(e)=>{e.preventDefault();setBusy(true);try{if(isLogin)await customerLogin(form.email,form.password);else await customerRegister(form.name,form.email,form.password);toast.success(isLogin?'Signed in successfully':'Account created successfully');}catch(err){toast.error(err.message)}finally{setBusy(false)}};
  return (<main className="min-h-screen flex flex-col md:flex-row">
      <section className="hidden md:flex flex-1 bg-primary text-white p-20 flex-col justify-between relative overflow-hidden">
        <div className="relative z-10">
          <h1 className="font-headline text-4xl font-black tracking-[0.3em] uppercase mb-12">{brand}</h1>
          <div className="space-y-12 max-w-md">
            <div><h2 className="text-3xl font-headline font-bold mb-4">The Digital Atelier</h2><p className="text-white/60 leading-relaxed font-light">Join our curated community of modern minimalists. Experience a new standard of digital luxury and bespoke service.</p></div>
            <div className="space-y-6">{['Early access to seasonal drops','Faster future checkout','Order identity linked to your email','Exclusive store updates'].map(perk=><div key={perk} className="flex items-center gap-4"><div className="w-1.5 h-1.5 bg-secondary rounded-full"/><span className="text-xs uppercase tracking-[0.2em] font-medium">{perk}</span></div>)}</div>
          </div>
        </div>
        <div className="relative z-10"><p className="text-[10px] uppercase tracking-[0.3em] text-white/40">© {new Date().getFullYear()} {brand}</p></div>
        <div className="absolute -bottom-20 -right-20 w-96 h-96 bg-secondary/10 rounded-full blur-[100px]"/>
      </section>
      <section className="flex-1 bg-surface flex flex-col items-center justify-center p-8 md:p-20">
        <div className="w-full max-w-md">
          <div className="text-center mb-12"><h2 className="font-headline text-4xl font-extrabold tracking-tight mb-4">{isLogin?'Welcome Back':'Create Account'}</h2><p className="text-on-surface-variant">{isLogin?'Sign in to your customer account.':`Join ${brand} today.`}</p></div>
          <div className="flex bg-surface-low p-1.5 rounded-2xl mb-10"><button type="button" onClick={()=>setIsLogin(true)} className={cn('flex-1 py-3 rounded-xl text-xs font-bold uppercase tracking-widest transition-all',isLogin?'bg-white shadow-sm text-primary':'text-on-surface-variant/60 hover:text-primary')}>Log In</button><button type="button" onClick={()=>setIsLogin(false)} className={cn('flex-1 py-3 rounded-xl text-xs font-bold uppercase tracking-widest transition-all',!isLogin?'bg-white shadow-sm text-primary':'text-on-surface-variant/60 hover:text-primary')}>Sign Up</button></div>
          <form className="space-y-6" onSubmit={submit}>
            {!isLogin&&<div className="space-y-2"><label className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Full Name</label><input required className="w-full bg-surface-low border-none rounded-2xl px-6 py-4 outline-none focus:ring-1 focus:ring-primary transition-all" placeholder="Your full name" value={form.name} onChange={e=>setForm({...form,name:e.target.value})}/></div>}
            <div className="space-y-2"><label className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Email Address</label><div className="relative"><Mail className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-on-surface-variant/40"/><input required className="w-full bg-surface-low border-none rounded-2xl px-14 py-4 outline-none focus:ring-1 focus:ring-primary transition-all" placeholder="name@example.com" type="email" value={form.email} onChange={e=>setForm({...form,email:e.target.value})}/></div></div>
            <div className="space-y-2"><label className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Password</label><div className="relative"><Lock className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-on-surface-variant/40"/><input required minLength={8} className="w-full bg-surface-low border-none rounded-2xl px-14 py-4 outline-none focus:ring-1 focus:ring-primary transition-all" placeholder="••••••••" type="password" value={form.password} onChange={e=>setForm({...form,password:e.target.value})}/></div></div>
            <button disabled={busy} className="w-full bg-primary text-white py-5 rounded-full font-bold uppercase tracking-[0.2em] shadow-lg hover:shadow-xl transition-all active:scale-95 flex items-center justify-center gap-3 disabled:opacity-60">{busy?'Please wait...':isLogin?'Sign In':'Create Account'}<ArrowRight className="w-5 h-5"/></button>
          </form>
          <div className="relative my-12"><div className="absolute inset-0 flex items-center"><div className="w-full border-t border-outline-variant/30"/></div><div className="relative flex justify-center text-xs uppercase tracking-widest"><span className="bg-surface px-4 text-on-surface-variant/60">Optional social login</span></div></div>
          <div className="grid grid-cols-2 gap-4"><button type="button" onClick={()=>toast('Google OAuth is not configured yet.')} className="flex items-center justify-center gap-3 py-4 rounded-2xl border border-outline-variant/30 hover:bg-surface-low transition-colors"><Chrome className="w-5 h-5"/><span className="text-[10px] font-bold uppercase tracking-widest">Google</span></button><button type="button" onClick={()=>toast('GitHub OAuth is not configured yet.')} className="flex items-center justify-center gap-3 py-4 rounded-2xl border border-outline-variant/30 hover:bg-surface-low transition-colors"><Github className="w-5 h-5"/><span className="text-[10px] font-bold uppercase tracking-widest">GitHub</span></button></div>
        </div>
      </section>
    </main>);
}
