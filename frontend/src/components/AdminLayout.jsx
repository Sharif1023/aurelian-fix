import {
  NavLink,
  Outlet,
  useNavigate,
} from 'react-router-dom';

import {
  BarChart3,
  Box,
  ClipboardList,
  Users,
  TicketPercent,
  House,
  FileText,
  Settings,
  MessageSquare,
  Image,
  LogOut,
  Store,
} from 'lucide-react';

import {
  adminLogout,
} from '../lib/api';

import {
  cn,
} from '../lib/utils';


const links = [
  [
    'Dashboard',
    '/admin',
    BarChart3,
  ],

  [
    'Products',
    '/admin/products',
    Box,
  ],

  [
    'Orders',
    '/admin/orders',
    ClipboardList,
  ],

  [
    'Customers',
    '/admin/customers',
    Users,
  ],

  [
    'Coupons',
    '/admin/coupons',
    TicketPercent,
  ],

  [
    'Home Content',
    '/admin/home',
    House,
  ],

  [
    'Pages',
    '/admin/pages',
    FileText,
  ],

  [
    'Messages',
    '/admin/messages',
    MessageSquare,
  ],

  [
    'Media',
    '/admin/media',
    Image,
  ],

  [
    'Settings',
    '/admin/settings',
    Settings,
  ],
];


export default function AdminLayout() {
  const navigate =
    useNavigate();


  /* =========================================
     LOGOUT
  ========================================= */

  const logout =
    async () => {
      const loginSlug =
        localStorage.getItem(
          'admin_login_slug',
        ) ||
        'admin-login';


      try {
        await adminLogout();
      } finally {
        navigate(
  `/${loginSlug}`,
  {
    replace: true,
  },
);
      }
    };


  return (
    <div className="min-h-screen bg-neutral-100 text-neutral-900">

      {/* =====================================
          DESKTOP SIDEBAR
      ===================================== */}

      <aside className="fixed inset-y-0 left-0 hidden lg:flex w-72 bg-neutral-950 text-white p-6 flex-col z-50">

        <NavLink
          to="/"

          className="flex items-center gap-3 mb-8"
        >

          <span className="w-11 h-11 bg-white text-black rounded-xl grid place-items-center">

            <Store
              size={
                20
              }
            />

          </span>


          <div>

            <b className="tracking-[.2em]">
              SHARUU
            </b>


            <p className="text-[10px] text-white/40 uppercase tracking-widest">
              Admin Console
            </p>

          </div>

        </NavLink>


        <nav className="space-y-1 flex-1 overflow-auto">

          {links.map(
            ([
              label,
              to,
              Icon,
            ]) => (

              <NavLink
                key={
                  to
                }

                end={
                  to ===
                  '/admin'
                }

                to={
                  to
                }

                className={({
                  isActive,
                }) =>
                  cn(
                    'flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition',

                    isActive
                      ? 'bg-white text-black'
                      : 'text-white/60 hover:bg-white/10 hover:text-white',
                  )
                }
              >

                <Icon
                  size={
                    18
                  }
                />

                {
                  label
                }

              </NavLink>

            ),
          )}

        </nav>


        <button
          type="button"

          onClick={
            logout
          }

          className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-white/60 hover:bg-white/10 hover:text-white"
        >

          <LogOut
            size={
              18
            }
          />

          Logout

        </button>

      </aside>


      {/* =====================================
          CONTENT
      ===================================== */}

      <div className="lg:pl-72 min-h-screen">

        {/* MOBILE NAV */}

        <header className="lg:hidden sticky top-0 z-40 bg-neutral-950 text-white px-4 py-3 overflow-x-auto">

          <div className="flex gap-2 min-w-max">

            {links.map(
              ([
                label,
                to,
              ]) => (

                <NavLink
                  key={
                    to
                  }

                  end={
                    to ===
                    '/admin'
                  }

                  to={
                    to
                  }

                  className={({
                    isActive,
                  }) =>
                    cn(
                      'px-3 py-2 rounded-lg text-xs font-bold',

                      isActive
                        ? 'bg-white text-black'
                        : 'bg-white/10',
                    )
                  }
                >
                  {
                    label
                  }
                </NavLink>

              ),
            )}


            <button
              type="button"

              onClick={
                logout
              }

              className="px-3 py-2 rounded-lg bg-red-500/20 text-xs font-bold"
            >
              Logout
            </button>

          </div>

        </header>


        <main className="p-4 md:p-8">

          <Outlet />

        </main>

      </div>

    </div>
  );
}