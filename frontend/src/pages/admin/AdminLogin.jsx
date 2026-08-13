import {
  useEffect,
  useState,
} from 'react';

import {
  useNavigate,
  useParams,
} from 'react-router-dom';

import {
  Lock,
  ArrowRight,
} from 'lucide-react';

import toast from 'react-hot-toast';

import {
  adminLogin,
  validateAdminLoginSlug,
} from '../../lib/api';

import {
  useProducts,
} from '../../context/ProductContext';


export default function AdminLogin() {
  const [
    login,
    setLogin,
  ] =
    useState('');


  const [
    password,
    setPassword,
  ] =
    useState('');


  const [
    busy,
    setBusy,
  ] =
    useState(false);


  const [
    checkingUrl,
    setCheckingUrl,
  ] =
    useState(true);


  const [
    validUrl,
    setValidUrl,
  ] =
    useState(false);


  const navigate =
    useNavigate();


  const {
    loginSlug = '',
  } =
    useParams();


  const {
    refreshAdminData,
  } =
    useProducts();


  /* =========================================
     VERIFY LOGIN URL
  ========================================= */

  useEffect(() => {
    let active =
      true;


    const checkUrl =
      async () => {
        try {
          setCheckingUrl(
            true,
          );


          await validateAdminLoginSlug(
            loginSlug,
          );


          if (!active) {
            return;
          }


          setValidUrl(
            true,
          );
        } catch {
          if (!active) {
            return;
          }


          setValidUrl(
            false,
          );


          navigate(
            '/',
            {
              replace: true,
            },
          );
        } finally {
          if (active) {
            setCheckingUrl(
              false,
            );
          }
        }
      };


    if (!loginSlug) {
      navigate(
        '/',
        {
          replace: true,
        },
      );

      return;
    }


    checkUrl();


    return () => {
      active =
        false;
    };
  }, [
    loginSlug,
    navigate,
  ]);


  /* =========================================
     LOGIN
  ========================================= */

  const submit =
    async (
      event,
    ) => {
      event.preventDefault();


      if (
        !validUrl
      ) {
        return;
      }


      if (
        !login.trim()
      ) {
        toast.error(
          'Enter your email.',
        );

        return;
      }


      if (!password) {
        toast.error(
          'Enter your password.',
        );

        return;
      }


      try {
        setBusy(
          true,
        );


        const admin =
          await adminLogin(
            login,
            password,
            loginSlug,
          );


        localStorage.setItem(
          'admin_login_slug',
          admin?.loginSlug ||
            loginSlug,
        );


        await refreshAdminData();


        toast.success(
          'Admin login successful',
        );


        navigate(
          '/admin',
          {
            replace: true,
          },
        );
      } catch (
        error
      ) {
        toast.error(
          error?.message ||
            'Admin login failed.',
        );
      } finally {
        setBusy(
          false,
        );
      }
    };


  /* =========================================
     URL CHECKING
  ========================================= */

  if (
    checkingUrl
  ) {
    return (
      <div className="min-h-screen bg-neutral-100 grid place-items-center">

        <div className="text-sm font-bold text-black/40">
          Checking...
        </div>

      </div>
    );
  }


  if (
    !validUrl
  ) {
    return null;
  }


  /* =========================================
     LOGIN PAGE
  ========================================= */

  return (
    <div className="min-h-screen bg-neutral-100 grid place-items-center p-4">

      <form
        onSubmit={
          submit
        }

        className="w-full max-w-md bg-white rounded-3xl p-8 md:p-10 shadow-xl border border-black/5"
      >

        <div className="w-16 h-16 bg-black text-white rounded-2xl grid place-items-center mb-6">

          <Lock />

        </div>


        <p className="text-xs uppercase tracking-[.3em] text-black/40 font-bold">
          Secure Area
        </p>


        <h1 className="text-3xl font-black mt-2 mb-8">
          Admin Login
        </h1>


        <div className="space-y-4">

          <input
            value={
              login
            }

            onChange={(
              event,
            ) =>
              setLogin(
                event.target
                  .value,
              )
            }

            className="w-full bg-neutral-100 rounded-xl px-4 py-4 outline-none focus:ring-2 ring-black/10"

            placeholder="Email"

            autoComplete="username"
          />


          <input
            value={
              password
            }

            onChange={(
              event,
            ) =>
              setPassword(
                event.target
                  .value,
              )
            }

            type="password"

            className="w-full bg-neutral-100 rounded-xl px-4 py-4 outline-none focus:ring-2 ring-black/10"

            placeholder="Password"

            autoComplete="current-password"
          />


          <button
            type="submit"

            disabled={
              busy
            }

            className="w-full bg-black text-white rounded-xl py-4 font-bold flex justify-center items-center gap-2 disabled:opacity-50"
          >

            {busy
              ? 'Signing in...'
              : 'Sign in'}


            {!busy && (
              <ArrowRight
                size={
                  18
                }
              />
            )}

          </button>

        </div>

      </form>

    </div>
  );
}