import {
  useEffect,
  useState,
} from 'react';

import {
  Navigate,
  Outlet,
} from 'react-router-dom';

import {
  getCurrentAdmin,
} from '../lib/api';

import {
  useProducts,
} from '../context/ProductContext';


export default function AdminGuard() {
  const [
    state,
    setState,
  ] = useState(
    'checking',
  );


  const {
    refreshAdminData,
  } = useProducts();


  useEffect(() => {
    let active = true;


    const checkAdmin =
      async () => {
        try {
          const admin =
            await getCurrentAdmin();


          if (
            admin?.loginSlug
          ) {
            localStorage.setItem(
              'admin_login_slug',
              admin.loginSlug,
            );
          }


          await refreshAdminData();


          if (active) {
            setState(
              'ok',
            );
          }
        } catch {
          if (active) {
            setState(
              'guest',
            );
          }
        }
      };


    checkAdmin();


    return () => {
      active = false;
    };
  }, [
    refreshAdminData,
  ]);


  /* =========================================
     CHECKING SESSION
  ========================================= */

  if (
    state ===
    'checking'
  ) {
    return (
      <div
        className="
          min-h-screen
          grid
          place-items-center
          bg-neutral-50
          text-sm
          font-semibold
        "
      >
        Checking admin session...
      </div>
    );
  }


  /* =========================================
     NOT LOGGED IN
     
     IMPORTANT:
     /admin থেকে secret login URL-এ
     আর redirect করবে না।
  ========================================= */

  if (
    state ===
    'guest'
  ) {
    return (
      <Navigate
        to="/"
        replace
      />
    );
  }


  /* =========================================
     LOGGED IN
  ========================================= */

  return (
    <Outlet />
  );
}