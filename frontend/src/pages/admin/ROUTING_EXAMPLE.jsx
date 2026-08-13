/*
Example imports in App.jsx / your admin router.

If this folder is:
src/pages/admin/

then you can import from './pages/admin'.
*/

import {
  DashboardPage,
  ProductsPage,
  ProductEditorPage,
  OrdersPage,
  CustomersPage,
  CouponsPage,
  HomeContentPage,
  SettingsPage,
  PagesPage,
  MessagesPage,
  MediaPage,
} from './pages/admin';

/* Example React Router routes */

<Route path="/admin" element={<DashboardPage />} />

<Route
  path="/admin/products"
  element={<ProductsPage />}
/>

<Route
  path="/admin/products/new"
  element={<ProductEditorPage />}
/>

<Route
  path="/admin/products/:id"
  element={<ProductEditorPage />}
/>

<Route
  path="/admin/orders"
  element={<OrdersPage />}
/>

<Route
  path="/admin/customers"
  element={<CustomersPage />}
/>

<Route
  path="/admin/coupons"
  element={<CouponsPage />}
/>

<Route
  path="/admin/home-content"
  element={<HomeContentPage />}
/>

<Route
  path="/admin/settings"
  element={<SettingsPage />}
/>

<Route
  path="/admin/pages"
  element={<PagesPage />}
/>

<Route
  path="/admin/messages"
  element={<MessagesPage />}
/>

<Route
  path="/admin/media"
  element={<MediaPage />}
/>
