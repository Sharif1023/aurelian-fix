# API Summary

## Public

- `GET /api/health`
- `GET /api/products`
- `GET /api/products/:id`
- `GET /api/settings/store_settings`
- `GET /api/settings/home_settings`
- `POST /api/coupons/validate`
- `POST /api/orders`
- `POST /api/orders/track`
- `GET /api/pages`
- `GET /api/pages/:slug`
- `POST /api/contact`

## Authentication

- `POST /api/auth/login`
- `GET /api/auth/me`
- `POST /api/auth/logout`

## Admin (httpOnly admin cookie required)

- Products: `GET/POST /api/admin/products`, `PUT/DELETE /api/admin/products/:id`
- Orders: `GET /api/admin/orders`, `GET /api/admin/orders/:id`, `PATCH /api/admin/orders/:id/status`, `DELETE /api/admin/orders/:id`
- Customers: `GET /api/admin/customers`
- Coupons: `GET/POST /api/admin/coupons`, `PUT/DELETE /api/admin/coupons/:id`
- Settings: `PUT /api/admin/settings/store_settings`, `PUT /api/admin/settings/home_settings`
- Pages: `GET/POST /api/admin/pages`, `PUT/DELETE /api/admin/pages/:id`
- Messages: `GET /api/admin/messages`, `PATCH /api/admin/messages/:id`
- Media: `GET/POST /api/admin/media`, `DELETE /api/admin/media/:id`

## Customer account

- `POST /api/customer-auth/register`
- `POST /api/customer-auth/login`
- `GET /api/customer-auth/me`
- `POST /api/customer-auth/logout`
