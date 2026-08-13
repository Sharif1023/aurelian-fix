import {
  BrowserRouter,
  Navigate,
  Outlet,
  Route,
  Routes,
} from 'react-router-dom';

import {
  Toaster,
} from 'react-hot-toast';

import {
  Navbar,
  Footer,
  MobileNav,
} from './components/Navigation';

import BackToTop from './components/BackToTop';
import ScrollToTop from './components/ScrollToTop';

import AdminGuard from './components/AdminGuard';
import AdminLayout from './components/AdminLayout';

import Home from './pages/public/Home';
import Collection from './pages/public/Collection';
import ProductDetail from './pages/public/ProductDetail';
import Cart from './pages/public/Cart';
import Checkout from './pages/public/Checkout';
import Wishlist from './pages/public/Wishlist';
import Contact from './pages/public/Contact';
import TrackOrder from './pages/public/TrackOrder';
import SignIn from './pages/public/SignIn';
import CmsPage from './pages/public/CmsPage';

import AdminLogin from './pages/admin/AdminLogin';

import {
  DashboardPage,
  ProductsPage,
  ProductEditorPage,
  OrdersPage,
  CustomersPage,
  CouponsPage,
  HomeContentPage,
  PagesPage,
  MessagesPage,
  MediaPage,
  SettingsPage,
} from './pages/admin';


/* =========================================
   PUBLIC LAYOUT
========================================= */

function PublicLayout() {
  return (
    <>
      <Navbar />

      <Outlet />

      <Footer />

      <MobileNav />

      <BackToTop />
    </>
  );
}


/* =========================================
   APP
========================================= */

export default function App() {
  return (
    <BrowserRouter>

      <ScrollToTop />

      <Toaster
        position="top-right"
      />

      <Routes>

        {/* =====================================
            PUBLIC ROUTES
        ===================================== */}

        <Route
          element={
            <PublicLayout />
          }
        >

          <Route
            path="/"
            element={
              <Home />
            }
          />

          <Route
            path="/collection"
            element={
              <Collection />
            }
          />

          <Route
            path="/product/:id"
            element={
              <ProductDetail />
            }
          />

          <Route
            path="/cart"
            element={
              <Cart />
            }
          />

          <Route
            path="/checkout"
            element={
              <Checkout />
            }
          />

          <Route
            path="/wishlist"
            element={
              <Wishlist />
            }
          />

          <Route
            path="/contact"
            element={
              <Contact />
            }
          />

          <Route
            path="/track-order"
            element={
              <TrackOrder />
            }
          />

          <Route
            path="/sign-in"
            element={
              <SignIn />
            }
          />

          <Route
            path="/pages/:slug"
            element={
              <CmsPage />
            }
          />

        </Route>


        {/* =====================================
            ADMIN LOGIN
        ===================================== */}

        <Route
  path="/:loginSlug"
  element={
    <AdminLogin />
  }
/>


        {/* =====================================
            PROTECTED ADMIN ROUTES
        ===================================== */}

        <Route
          element={
            <AdminGuard />
          }
        >

          <Route
            path="/admin"
            element={
              <AdminLayout />
            }
          >

            <Route
              index
              element={
                <DashboardPage />
              }
            />

            <Route
              path="products"
              element={
                <ProductsPage />
              }
            />

            <Route
              path="products/new"
              element={
                <ProductEditorPage />
              }
            />

            <Route
              path="products/:id"
              element={
                <ProductEditorPage />
              }
            />

            <Route
              path="orders"
              element={
                <OrdersPage />
              }
            />

            <Route
              path="customers"
              element={
                <CustomersPage />
              }
            />

            <Route
              path="coupons"
              element={
                <CouponsPage />
              }
            />

            <Route
              path="home"
              element={
                <HomeContentPage />
              }
            />

            <Route
              path="pages"
              element={
                <PagesPage />
              }
            />

            <Route
              path="messages"
              element={
                <MessagesPage />
              }
            />

            <Route
              path="media"
              element={
                <MediaPage />
              }
            />

            <Route
              path="settings"
              element={
                <SettingsPage />
              }
            />

          </Route>

        </Route>


        {/* =====================================
            NOT FOUND
        ===================================== */}

        <Route
          path="*"
          element={
            <Navigate
              to="/"
              replace
            />
          }
        />

      </Routes>

    </BrowserRouter>
  );
}