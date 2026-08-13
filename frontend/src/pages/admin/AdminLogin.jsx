import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';
import { adminLogin } from '../../lib/api';
import { useProducts } from '../../context/ProductContext';

export default function AdminLogin() {
  const [login, setLogin] = useState(''); const [password, setPassword] = useState(''); const [busy,setBusy]=useState(false);
  const navigate=useNavigate(); const { refreshAdminData }=useProducts();
  const submit=async(e)=>{e.preventDefault();setBusy(true);try{await adminLogin(login,password);await refreshAdminData();toast.success('Admin login successful');navigate('/admin',{replace:true});}catch(err){toast.error(err.message);}finally{setBusy(false);}};
  return <div className="min-h-screen bg-neutral-100 grid place-items-center p-4"><form onSubmit={submit} className="w-full max-w-md bg-white rounded-3xl p-8 md:p-10 shadow-xl border border-black/5"><div className="w-16 h-16 bg-black text-white rounded-2xl grid place-items-center mb-6"><Lock/></div><p className="text-xs uppercase tracking-[.3em] text-black/40 font-bold">Secure area</p><h1 className="text-3xl font-black mt-2 mb-8">Admin Login</h1><div className="space-y-4"><input value={login} onChange={e=>setLogin(e.target.value)} className="w-full bg-neutral-100 rounded-xl px-4 py-4 outline-none focus:ring-2 ring-black/10" placeholder="Username or email" autoComplete="username"/><input value={password} onChange={e=>setPassword(e.target.value)} type="password" className="w-full bg-neutral-100 rounded-xl px-4 py-4 outline-none focus:ring-2 ring-black/10" placeholder="Password" autoComplete="current-password"/><button disabled={busy} className="w-full bg-black text-white rounded-xl py-4 font-bold flex justify-center items-center gap-2 disabled:opacity-50">{busy?'Signing in...':'Sign in'}<ArrowRight size={18}/></button></div></form></div>;
}
