import { useEffect, useState } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { getCurrentAdmin } from '../lib/api';
import { useProducts } from '../context/ProductContext';

export default function AdminGuard() {
  const [state, setState] = useState('checking');
  const { refreshAdminData } = useProducts();
  const location = useLocation();

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        await getCurrentAdmin();
        await refreshAdminData();
        if (active) setState('ok');
      } catch {
        if (active) setState('guest');
      }
    })();
    return () => { active = false; };
  }, [refreshAdminData]);

  if (state === 'checking') return <div className="min-h-screen grid place-items-center bg-neutral-50 text-sm font-semibold">Checking admin session...</div>;
  if (state === 'guest') return <Navigate to="/admin/login" replace state={{ from: location.pathname }} />;
  return <Outlet />;
}
