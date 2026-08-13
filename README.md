# SHARUU Full-Stack Store + Admin Panel

This project keeps the supplied public storefront design and turns it into a database-driven ecommerce application with a secure admin panel.

## Stack

- Frontend: React.js (Vite) + Tailwind CSS + React Router + Motion
- Backend: Node.js + Express.js
- Database: MySQL 8+
- Admin auth: JWT stored in an `httpOnly` cookie
- Passwords: bcrypt hash
- Image storage: local `/uploads` folder + Media Manager

## What the admin panel controls

## Admin page structure

The admin panel is split into separate React page files instead of one large `AdminPages.jsx` file.

Main admin routes:

```text
/admin                    Dashboard
/admin/products           Product list
/admin/products/new       Add Product page
/admin/products/:id       Edit Product page
/admin/orders             Orders
/admin/customers          Customers
/admin/coupons            Coupons
/admin/home               Home Content
/admin/pages              CMS Pages
/admin/messages           Contact Messages
/admin/media              Media Manager
/admin/settings           Store Settings
```

Product Add/Edit is a full separate page. It controls the public Product Details data including main/extra images, price, old price, discount, product code, description, sizes, size-wise stock, availability, colors, product details, size chart, category and status.

- Dashboard summary
- Products: name, code, price, old price, discount, category, sub-category, stock, status, images, sizes, colors, description, product details
- Orders: view and change Pending / Processing / Shipped / Delivered / Cancelled
- Customers: automatic customer list from orders
- Coupons: percentage, minimum subtotal, maximum discount, active dates, active/inactive
- Home page: hero, badge, title, subtitle, image/video, best sellers, featured collection, social gallery, curated edits
- CMS Pages: Privacy Policy, Terms, Shipping & Returns, and any new page
- Contact Messages: public form submissions
- Customer email/password Sign In and Sign Up
- Media Manager: image upload and URL copy
- Store Settings: brand, shipping prices, bKash/Nagad numbers, contact info, social links, category subtitles, store description

The storefront products, home content, category navigation, footer category links, CMS links, shipping prices, payment numbers and contact details are loaded from the backend/database.

## Important security behavior

1. Admin JWT is stored in an `httpOnly` cookie, not Local Storage.
2. Admin routes require authentication.
3. Login and public write endpoints are rate-limited.
4. Product price, coupon discount, shipping cost and final order total are recalculated by the server.
5. Stock is checked inside a MySQL transaction before an order is created.
6. Stock is decreased by the server, not by the browser.
7. Order tracking requires both the order number and the email/phone used on that order.
8. Raw card number/CVC is intentionally not stored. Card checkout stays blocked until a PCI-compliant payment gateway is integrated.
9. Admin and customer passwords are bcrypt-hashed.
10. Uploaded images have MIME type and 5 MB size restrictions.

---

# 1. Requirements

Install:

- Node.js 20+ (Node.js 22 LTS is a good choice)
- npm
- MySQL 8+

Recommended development tools:

- VS Code
- MySQL Workbench or phpMyAdmin

---

# 2. Create the MySQL database

Open MySQL Workbench / phpMyAdmin / MySQL CLI.

Run these files in this exact order:

```text
database/schema.sql
database/seed.sql
```

`schema.sql` creates the database and all required tables.

`seed.sql` adds initial store settings, CMS pages, a coupon and sample products so the supplied public design has content immediately.

Database name:

```text
sharuu_store
```

---

# 3. Backend setup

Open a terminal:

```bash
cd backend
npm install
```

Create `.env` from `.env.example`.

Windows PowerShell:

```powershell
Copy-Item .env.example .env
```

macOS/Linux:

```bash
cp .env.example .env
```

Edit `.env`:

```env
NODE_ENV=development
PORT=5000
FRONTEND_URL=http://localhost:5173

DB_HOST=127.0.0.1
DB_PORT=3306
DB_USER=root
DB_PASSWORD=YOUR_MYSQL_PASSWORD
DB_NAME=sharuu_store

JWT_SECRET=put-a-long-random-secret-here-at-least-32-characters
COOKIE_SECURE=false
UPLOAD_DIR=src/uploads
```

For a strong JWT secret you can generate one with Node:

```bash
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
```

## Create the first admin

From the `backend` folder:

```bash
npm run create-admin -- admin admin@example.com YourStrongPassword123!
```

Change all three values to your own username, email and strong password.

## Start backend

```bash
npm run dev
```

Expected API URL:

```text
http://localhost:5000
```

Health check:

```text
http://localhost:5000/api/health
```

---

# 4. Frontend setup

Open a second terminal:

```bash
cd frontend
npm install
```

Create `.env`:

Windows PowerShell:

```powershell
Copy-Item .env.example .env
```

macOS/Linux:

```bash
cp .env.example .env
```

Default frontend `.env`:

```env
VITE_API_URL=/api
```

Start frontend:

```bash
npm run dev
```

Open:

```text
http://localhost:5173
```

Admin login:

```text
http://localhost:5173/admin/login
```

---

# 5. Normal daily development run

Terminal 1:

```bash
cd backend
npm run dev
```

Terminal 2:

```bash
cd frontend
npm run dev
```

---

# 6. Admin workflow

After logging in:

1. Go to **Products** to add/edit stock and product content.
2. Go to **Home Content** to choose hero content and product IDs for home sections.
3. Go to **Store Settings** to update brand, delivery charge, payment number, contact and social information.
4. Go to **Pages** to edit Privacy Policy, Terms and Shipping & Returns.
5. Go to **Coupons** to create discount codes.
6. Go to **Orders** when orders arrive and update fulfilment status.
7. Go to **Messages** for public Contact page messages.
8. Go to **Media** to upload images, copy the generated URL, and use that URL in products/home content.

---

# 7. Order calculation

The browser does not decide the authoritative order price.

When checkout is submitted, the backend:

1. Locks selected product rows.
2. Reads product prices from MySQL.
3. Checks stock.
4. Calculates subtotal.
5. Reads shipping charge from store settings.
6. Validates the coupon on the server.
7. Calculates the final total.
8. Creates/updates the customer.
9. Creates the order and order items.
10. Decreases product stock.
11. Commits the MySQL transaction.

If any critical step fails, the transaction is rolled back.

---

# 8. Payment notes

Working order-recording methods in this starter:

- Cash on Delivery
- bKash manual payment + transaction/reference ID
- Nagad manual payment + transaction/reference ID

The supplied design also showed Card payment. It is intentionally prevented from collecting raw card data. To accept cards, integrate a real hosted/payment-token gateway such as SSLCOMMERZ or another PCI-compliant provider. Never store CVC in this database.

---

# 9. Production build

Frontend:

```bash
cd frontend
npm run build
```

This creates:

```text
frontend/dist
```

Backend:

```bash
cd backend
npm start
```

For production:

- use HTTPS
- set `NODE_ENV=production`
- set `COOKIE_SECURE=true`
- use a long random `JWT_SECRET`
- use a dedicated MySQL user instead of root
- restrict MySQL to the application server
- use a reverse proxy such as Nginx
- back up the database
- move uploaded media to object storage/CDN if traffic grows
- add a real payment gateway before enabling card payments

---

# 10. Production `.env` example

```env
NODE_ENV=production
PORT=5000
FRONTEND_URL=https://yourdomain.com
DB_HOST=127.0.0.1
DB_PORT=3306
DB_USER=sharuu_app
DB_PASSWORD=VERY_STRONG_DATABASE_PASSWORD
DB_NAME=sharuu_store
JWT_SECRET=VERY_LONG_RANDOM_SECRET
COOKIE_SECURE=true
UPLOAD_DIR=src/uploads
```

---

# 11. Suggested Nginx routing

Typical setup:

- `/` -> React build
- `/api/` -> Node backend port 5000
- `/uploads/` -> Node backend or static storage

Make sure React Router routes fall back to `index.html`.

---

# 12. Folder structure

```text
sharuu-fullstack/
├─ database/
│  ├─ schema.sql
│  └─ seed.sql
├─ backend/
│  ├─ src/
│  │  ├─ config/
│  │  ├─ controllers/
│  │  ├─ middleware/
│  │  ├─ routes/
│  │  ├─ services/
│  │  ├─ scripts/
│  │  ├─ uploads/
│  │  ├─ app.js
│  │  └─ server.js
│  ├─ .env.example
│  └─ package.json
├─ frontend/
│  ├─ src/
│  │  ├─ components/
│  │  ├─ context/
│  │  ├─ lib/
│  │  ├─ pages/admin/
│  │  │  ├─ DashboardPage.jsx
│  │  │  ├─ ProductsPage.jsx
│  │  │  ├─ ProductEditorPage.jsx
│  │  │  ├─ ProductForm.jsx
│  │  │  ├─ productHelpers.js
│  │  │  ├─ OrdersPage.jsx
│  │  │  ├─ CustomersPage.jsx
│  │  │  ├─ CouponsPage.jsx
│  │  │  ├─ HomeContentPage.jsx
│  │  │  ├─ PagesPage.jsx
│  │  │  ├─ MessagesPage.jsx
│  │  │  ├─ MediaPage.jsx
│  │  │  ├─ SettingsPage.jsx
│  │  │  ├─ AdminUI.jsx
│  │  │  └─ index.js
│  │  ├─ pages/public/
│  │  ├─ App.jsx
│  │  └─ main.jsx
│  ├─ .env.example
│  └─ package.json
└─ README.md
```

---

# 13. Main database tables

- `admins`
- `products`
- `settings`
- `coupons`
- `customers`
- `orders`
- `order_items`
- `pages`
- `contact_messages`
- `media_files`

---

# 14. Before going live checklist

- Change all sample content and products.
- Create your real admin account.
- Use a secure production JWT secret.
- Use HTTPS and `COOKIE_SECURE=true`.
- Test order creation and stock reduction.
- Test cancellation/reopening stock behavior.
- Test coupon expiration and minimum subtotal.
- Test bKash/Nagad instructions and numbers.
- Add Privacy Policy, Terms and Shipping/Returns content.
- Set real email, phone, address and social URLs.
- Configure database backups.
- Configure a payment gateway before card activation.
- Configure SMTP/SMS if you want automatic order notifications.

