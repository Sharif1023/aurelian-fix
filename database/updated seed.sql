/* =========================================================
   SHARUU STORE - FULL SEED
   Admin + Settings + Pages + Coupon + 20 Products
========================================================= */

USE sharuu_store;


/* =========================================================
   ADMIN SEED

   Username : superadmin
   Email    : admin@sharuu.com
   Password : Admin@123
   Slug     : admin-login
========================================================= */

INSERT INTO admins (
    username,
    email,
    login_slug,
    password_hash,
    role,
    is_active
)
VALUES (
    'superadmin',
    'admin@sharuu.com',
    'admin-login',
    '$2b$10$niLYJ/N2tGhOV08hWnO76ONFJGV2LbqH35u42yhRez/JtfRfk362e',
    'super_admin',
    1
)
ON DUPLICATE KEY UPDATE
    username = VALUES(username),
    email = VALUES(email),
    login_slug = VALUES(login_slug),
    password_hash = VALUES(password_hash),
    role = VALUES(role),
    is_active = VALUES(is_active);


/* =========================================================
   STORE SETTINGS
========================================================= */

INSERT INTO settings (
    setting_key,
    setting_value
)
VALUES
(
    'store_settings',
    JSON_OBJECT(
        'shippingChittagong', 60,
        'shippingOutsideChittagong', 120,

        'paymentSettings',
        JSON_OBJECT(
            'bkashNumber', '01700000000',
            'nagadNumber', '01800000000'
        ),

        'socialLinks',
        JSON_ARRAY(
            JSON_OBJECT(
                'platform', 'Facebook',
                'url', 'https://facebook.com'
            ),
            JSON_OBJECT(
                'platform', 'Instagram',
                'url', 'https://instagram.com'
            )
        ),

        'categorySubtitles',
        JSON_OBJECT(
            'Combo', 'Exclusive 2-in-1 & 3-in-1 deals',
            'Shirt', 'Premium cotton & linen',
            'T-Shirt', 'Essential everyday basics',
            'Pant', 'Tailored chinos & trousers',
            'Shoes', 'Handcrafted footwear',
            'Accessories', 'The finishing touches'
        ),

        'brandSettings',
        JSON_OBJECT(
            'name', 'SHARUU',
            'fontFamily', 'font-display',
            'color', '#000000'
        ),

        'contactSettings',
        JSON_OBJECT(
            'email', 'contact@sharuu.com',
            'address', 'Chittagong, Bangladesh',
            'contactPhone', '+880 1700-000000',
            'shippingReturns', 'Fast delivery and simple returns.',
            'specifications', 'See each product page for specifications and care instructions.'
        ),

        'generalSettings',
        JSON_OBJECT(
            'storeName', 'SHARUU',
            'storeEmail', 'contact@sharuu.com',
            'storeDescription', 'A curated destination for modern men''s fashion.',
            'currency', 'BDT (৳)',
            'weightUnit', 'Kilograms (kg)'
        )
    )
),

(
    'home_settings',
    JSON_OBJECT(
        'heroImage',
        'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=2070&auto=format&fit=crop',

        'heroBadge',
        'New Collection',

        'heroTitle',
        'The Art of Modern Elegance',

        'heroSubtitle',
        'Discover our curated collection designed for the contemporary individual.',

        'heroVideoUrl',
        '',

        'bestSellerIds',
        JSON_ARRAY(),

        'socialGallery',
        JSON_ARRAY(
            'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=1200&auto=format&fit=crop',
            'https://images.unsplash.com/photo-1483985988355-763728e1935b?q=80&w=1200&auto=format&fit=crop'
        ),

        'featuredCollection',
        JSON_OBJECT(
            'title', 'Featured Collection',
            'subtitle', 'Selected pieces for you.',
            'productIds', JSON_ARRAY(),
            'show', true
        ),

        'curatedEdits',
        JSON_OBJECT(
            'title', 'Curated Edits',
            'items', JSON_ARRAY()
        )
    )
)

ON DUPLICATE KEY UPDATE
    setting_value = VALUES(setting_value);


/* =========================================================
   CMS PAGES
========================================================= */

INSERT INTO pages (
    slug,
    title,
    excerpt,
    body,
    seo_title,
    seo_description,
    is_published
)
VALUES

(
    'shipping-returns',
    'Shipping & Returns',
    'Delivery and return information.',
    '# Shipping & Returns\n\nUpdate this page from **Admin → Pages**.',
    'Shipping & Returns - SHARUU',
    'Shipping and returns information.',
    1
),

(
    'privacy-policy',
    'Privacy Policy',
    'How customer information is handled.',
    '# Privacy Policy\n\nUpdate this page from **Admin → Pages**.',
    'Privacy Policy - SHARUU',
    'SHARUU privacy policy.',
    1
),

(
    'terms-of-service',
    'Terms of Service',
    'Terms for using this store.',
    '# Terms of Service\n\nUpdate this page from **Admin → Pages**.',
    'Terms of Service - SHARUU',
    'SHARUU terms of service.',
    1
)

ON DUPLICATE KEY UPDATE
    title = VALUES(title),
    excerpt = VALUES(excerpt),
    body = VALUES(body),
    seo_title = VALUES(seo_title),
    seo_description = VALUES(seo_description),
    is_published = VALUES(is_published);


/* =========================================================
   COUPON
========================================================= */

INSERT INTO coupons (
    code,
    discount_percent,
    is_active,
    min_subtotal,
    max_discount
)
VALUES (
    'WELCOME10',
    10,
    1,
    0,
    NULL
)

ON DUPLICATE KEY UPDATE
    discount_percent = VALUES(discount_percent),
    is_active = VALUES(is_active),
    min_subtotal = VALUES(min_subtotal),
    max_discount = VALUES(max_discount);


/* =========================================================
   20 PRODUCTS
========================================================= */

INSERT INTO products (
    id,
    product_code,
    name,
    price,
    original_price,
    discount,
    category,
    sub_category,
    image,
    extra_images,
    description,
    product_details,
    rating,
    reviews,
    stock,
    status,
    show_size_section,
    sizes,
    colors,
    size_chart_json
)
VALUES

/* ===================== PRODUCT 1 ===================== */

(
    1,
    'SHR-TS-001',
    'Premium Oversized Cotton T-Shirt',
    1290,
    1590,
    19,
    'T-Shirt',
    'Oversized',
    'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?q=80&w=1200&auto=format&fit=crop',
    JSON_ARRAY(),
    'Premium heavyweight cotton oversized t-shirt for everyday comfort.',
    '## Details\n\nPremium cotton fabric.\nRelaxed oversized fit.\nSoft and breathable material.',
    4.9,
    25,
    50,
    'Active',
    1,

    JSON_ARRAY(
        JSON_OBJECT(
            'size','M',
            'isAvailable',true,
            'quantity',15
        ),
        JSON_OBJECT(
            'size','L',
            'isAvailable',true,
            'quantity',20
        ),
        JSON_OBJECT(
            'size','XL',
            'isAvailable',true,
            'quantity',15
        )
    ),

    JSON_ARRAY(
        JSON_OBJECT(
            'name','Black',
            'color','#111111'
        ),
        JSON_OBJECT(
            'name','White',
            'color','#ffffff'
        )
    ),

    NULL
),


/* ===================== PRODUCT 2 ===================== */

(
    2,
    'SHR-TS-002',
    'Classic Polo T-Shirt',
    1490,
    1790,
    17,
    'T-Shirt',
    'Polo',
    'https://images.unsplash.com/photo-1627225924765-552d49cf47ad?q=80&w=1200&auto=format&fit=crop',
    JSON_ARRAY(),
    'Classic premium polo t-shirt with a clean smart-casual look.',
    '## Details\n\nPremium cotton pique fabric.\nComfortable regular fit.\nSmart casual styling.',
    4.8,
    18,
    35,
    'Active',
    1,

    JSON_ARRAY(
        JSON_OBJECT('size','M','isAvailable',true,'quantity',10),
        JSON_OBJECT('size','L','isAvailable',true,'quantity',15),
        JSON_OBJECT('size','XL','isAvailable',true,'quantity',10)
    ),

    JSON_ARRAY(
        JSON_OBJECT('name','Navy','color','#172554'),
        JSON_OBJECT('name','White','color','#ffffff')
    ),

    NULL
),


/* ===================== PRODUCT 3 ===================== */

(
    3,
    'SHR-SH-001',
    'Premium Linen Shirt',
    2190,
    2590,
    15,
    'Shirt',
    'Linen',
    'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?q=80&w=1200&auto=format&fit=crop',
    JSON_ARRAY(),
    'Elegant linen shirt designed for formal and casual occasions.',
    '## Details\n\nBreathable linen fabric.\nPremium finishing.\nComfortable tailored silhouette.',
    4.9,
    30,
    40,
    'Active',
    1,

    JSON_ARRAY(
        JSON_OBJECT('size','S','isAvailable',true,'quantity',8),
        JSON_OBJECT('size','M','isAvailable',true,'quantity',12),
        JSON_OBJECT('size','L','isAvailable',true,'quantity',12),
        JSON_OBJECT('size','XL','isAvailable',true,'quantity',8)
    ),

    JSON_ARRAY(
        JSON_OBJECT('name','White','color','#ffffff'),
        JSON_OBJECT('name','Sky Blue','color','#93c5fd')
    ),

    NULL
),


/* ===================== PRODUCT 4 ===================== */

(
    4,
    'SHR-SH-002',
    'Oxford Casual Shirt',
    1890,
    2290,
    18,
    'Shirt',
    'Oxford',
    'https://images.unsplash.com/photo-1598033129183-c4f50c736f10?q=80&w=1200&auto=format&fit=crop',
    JSON_ARRAY(),
    'Classic oxford shirt made for everyday premium styling.',
    '## Details\n\nDurable cotton weave.\nButton-down collar.\nComfortable relaxed fit.',
    4.7,
    20,
    30,
    'Active',
    1,

    JSON_ARRAY(
        JSON_OBJECT('size','S','isAvailable',true,'quantity',5),
        JSON_OBJECT('size','M','isAvailable',true,'quantity',8),
        JSON_OBJECT('size','L','isAvailable',true,'quantity',10),
        JSON_OBJECT('size','XL','isAvailable',true,'quantity',7)
    ),

    JSON_ARRAY(
        JSON_OBJECT('name','Blue','color','#2563eb'),
        JSON_OBJECT('name','White','color','#ffffff')
    ),

    NULL
),


/* ===================== PRODUCT 5 ===================== */

(
    5,
    'SHR-PT-001',
    'Slim Fit Chino Pant',
    2390,
    2890,
    17,
    'Pant',
    'Chino',
    'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?q=80&w=1200&auto=format&fit=crop',
    JSON_ARRAY(),
    'Modern slim-fit chino pant with premium everyday comfort.',
    '## Details\n\nStretch cotton fabric.\nModern tapered leg.\nComfortable everyday fit.',
    4.8,
    22,
    25,
    'Active',
    1,

    JSON_ARRAY(
        JSON_OBJECT('size','30','isAvailable',true,'quantity',5),
        JSON_OBJECT('size','32','isAvailable',true,'quantity',8),
        JSON_OBJECT('size','34','isAvailable',true,'quantity',7),
        JSON_OBJECT('size','36','isAvailable',true,'quantity',5)
    ),

    JSON_ARRAY(
        JSON_OBJECT('name','Khaki','color','#a16207'),
        JSON_OBJECT('name','Black','color','#111111')
    ),

    NULL
),


/* ===================== PRODUCT 6 ===================== */

(
    6,
    'SHR-PT-002',
    'Formal Tailored Trouser',
    2590,
    2990,
    13,
    'Pant',
    'Formal',
    'https://images.unsplash.com/photo-1506629082955-511b1aa562c8?q=80&w=1200&auto=format&fit=crop',
    JSON_ARRAY(),
    'Premium tailored trouser designed for formal and office wear.',
    '## Details\n\nClean tailored silhouette.\nComfort waistband.\nPremium formal fabric.',
    4.7,
    15,
    20,
    'Active',
    1,

    JSON_ARRAY(
        JSON_OBJECT('size','30','isAvailable',true,'quantity',4),
        JSON_OBJECT('size','32','isAvailable',true,'quantity',6),
        JSON_OBJECT('size','34','isAvailable',true,'quantity',6),
        JSON_OBJECT('size','36','isAvailable',true,'quantity',4)
    ),

    JSON_ARRAY(
        JSON_OBJECT('name','Charcoal','color','#3f3f46'),
        JSON_OBJECT('name','Black','color','#111111')
    ),

    NULL
),


/* ===================== PRODUCT 7 ===================== */

(
    7,
    'SHR-SH-003',
    'Minimal Leather Sneaker',
    3490,
    3990,
    12,
    'Shoes',
    'Sneakers',
    'https://images.unsplash.com/photo-1549298916-b41d501d3772?q=80&w=1200&auto=format&fit=crop',
    JSON_ARRAY(),
    'Minimal premium sneaker designed for clean everyday styling.',
    '## Details\n\nPremium upper.\nCushioned footbed.\nDurable everyday outsole.',
    4.9,
    45,
    20,
    'Active',
    1,

    JSON_ARRAY(
        JSON_OBJECT('size','40','isAvailable',true,'quantity',5),
        JSON_OBJECT('size','41','isAvailable',true,'quantity',5),
        JSON_OBJECT('size','42','isAvailable',true,'quantity',5),
        JSON_OBJECT('size','43','isAvailable',true,'quantity',5)
    ),

    JSON_ARRAY(
        JSON_OBJECT('name','White','color','#ffffff'),
        JSON_OBJECT('name','Black','color','#111111')
    ),

    NULL
),


/* ===================== PRODUCT 8 ===================== */

(
    8,
    'SHR-SH-004',
    'Denim Casual Shirt',
    1990,
    2390,
    16,
    'Shirt',
    'Denim',
    'https://images.unsplash.com/photo-1603252110481-7ba873bf42ab?q=80&w=1200&auto=format&fit=crop',
    JSON_ARRAY(),
    'Stylish denim shirt designed for modern casual outfits.',
    '## Details\n\nPremium denim fabric.\nComfortable casual fit.\nDurable construction.',
    4.6,
    12,
    18,
    'Active',
    1,

    JSON_ARRAY(
        JSON_OBJECT('size','M','isAvailable',true,'quantity',6),
        JSON_OBJECT('size','L','isAvailable',true,'quantity',7),
        JSON_OBJECT('size','XL','isAvailable',true,'quantity',5)
    ),

    JSON_ARRAY(
        JSON_OBJECT('name','Blue','color','#1d4ed8'),
        JSON_OBJECT('name','Dark Blue','color','#1e3a8a')
    ),

    NULL
),


/* ===================== PRODUCT 9 ===================== */

(
    9,
    'SHR-ACC-001',
    'Premium Leather Wallet',
    890,
    1190,
    25,
    'Accessories',
    'Wallet',
    'https://images.unsplash.com/photo-1627123424574-724758594e93?q=80&w=1200&auto=format&fit=crop',
    JSON_ARRAY(),
    'Compact premium wallet designed for everyday use.',
    '## Details\n\nPremium leather finish.\nMultiple card slots.\nCompact everyday design.',
    4.8,
    35,
    60,
    'Active',
    0,
    JSON_ARRAY(),

    JSON_ARRAY(
        JSON_OBJECT('name','Brown','color','#78350f'),
        JSON_OBJECT('name','Black','color','#111111')
    ),

    NULL
),


/* ===================== PRODUCT 10 ===================== */

(
    10,
    'SHR-ACC-002',
    'Classic Leather Belt',
    990,
    1290,
    23,
    'Accessories',
    'Belt',
    'https://images.unsplash.com/photo-1624222247344-550fb60583dc?q=80&w=1200&auto=format&fit=crop',
    JSON_ARRAY(),
    'Classic premium belt suitable for formal and casual outfits.',
    '## Details\n\nPremium leather finish.\nDurable metal buckle.\nTimeless design.',
    4.7,
    19,
    40,
    'Active',
    0,
    JSON_ARRAY(),

    JSON_ARRAY(
        JSON_OBJECT('name','Black','color','#111111'),
        JSON_OBJECT('name','Brown','color','#78350f')
    ),

    NULL
),


/* ===================== PRODUCT 11 ===================== */

(
    11,
    'SHR-CB-001',
    'Weekend Fashion Combo',
    3290,
    3890,
    15,
    'Combo',
    'Set',
    'https://images.unsplash.com/photo-1617137968427-85924c800a22?q=80&w=1200&auto=format&fit=crop',
    JSON_ARRAY(),
    'A coordinated weekend outfit designed for effortless styling.',
    '## Details\n\nCoordinated shirt and trouser set.\nComfortable modern fit.\nReady-to-wear combination.',
    4.9,
    20,
    15,
    'Active',
    1,

    JSON_ARRAY(
        JSON_OBJECT('size','M','isAvailable',true,'quantity',5),
        JSON_OBJECT('size','L','isAvailable',true,'quantity',5),
        JSON_OBJECT('size','XL','isAvailable',true,'quantity',5)
    ),

    JSON_ARRAY(
        JSON_OBJECT('name','Black','color','#111111'),
        JSON_OBJECT('name','Stone','color','#a8a29e')
    ),

    NULL
),


/* ===================== PRODUCT 12 ===================== */

(
    12,
    'SHR-TS-003',
    'Graphic Street T-Shirt',
    1190,
    1490,
    20,
    'T-Shirt',
    'Graphic',
    'https://images.unsplash.com/photo-1503341504253-dff4815485f1?q=80&w=1200&auto=format&fit=crop',
    JSON_ARRAY(),
    'Modern graphic t-shirt inspired by contemporary streetwear.',
    '## Details\n\nSoft cotton fabric.\nPremium graphic print.\nRelaxed casual fit.',
    4.6,
    14,
    45,
    'Active',
    1,

    JSON_ARRAY(
        JSON_OBJECT('size','M','isAvailable',true,'quantity',15),
        JSON_OBJECT('size','L','isAvailable',true,'quantity',15),
        JSON_OBJECT('size','XL','isAvailable',true,'quantity',15)
    ),

    JSON_ARRAY(
        JSON_OBJECT('name','Black','color','#111111'),
        JSON_OBJECT('name','White','color','#ffffff')
    ),

    NULL
),


/* ===================== PRODUCT 13 ===================== */

(
    13,
    'SHR-SH-005',
    'Premium Casual Shirt',
    1790,
    2190,
    18,
    'Shirt',
    'Casual',
    'https://images.unsplash.com/photo-1596755389378-c31d21fd1273?q=80&w=1200&auto=format&fit=crop',
    JSON_ARRAY(),
    'Comfortable casual shirt for everyday modern styling.',
    '## Details\n\nPremium cotton material.\nRelaxed construction.\nBreathable everyday comfort.',
    4.7,
    16,
    25,
    'Active',
    1,

    JSON_ARRAY(
        JSON_OBJECT('size','M','isAvailable',true,'quantity',8),
        JSON_OBJECT('size','L','isAvailable',true,'quantity',9),
        JSON_OBJECT('size','XL','isAvailable',true,'quantity',8)
    ),

    JSON_ARRAY(
        JSON_OBJECT('name','Green','color','#166534'),
        JSON_OBJECT('name','Black','color','#111111')
    ),

    NULL
),


/* ===================== PRODUCT 14 ===================== */

(
    14,
    'SHR-PT-003',
    'Modern Cargo Pant',
    2290,
    2690,
    15,
    'Pant',
    'Cargo',
    'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=1200&auto=format&fit=crop',
    JSON_ARRAY(),
    'Modern cargo pant with functional pockets and relaxed styling.',
    '## Details\n\nMultiple pocket design.\nDurable fabric.\nComfortable streetwear fit.',
    4.6,
    18,
    30,
    'Active',
    1,

    JSON_ARRAY(
        JSON_OBJECT('size','30','isAvailable',true,'quantity',7),
        JSON_OBJECT('size','32','isAvailable',true,'quantity',8),
        JSON_OBJECT('size','34','isAvailable',true,'quantity',8),
        JSON_OBJECT('size','36','isAvailable',true,'quantity',7)
    ),

    JSON_ARRAY(
        JSON_OBJECT('name','Olive','color','#365314'),
        JSON_OBJECT('name','Black','color','#111111')
    ),

    NULL
),


/* ===================== PRODUCT 15 ===================== */

(
    15,
    'SHR-SH-006',
    'Performance Running Sneaker',
    2990,
    3490,
    14,
    'Shoes',
    'Sports',
    'https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=1200&auto=format&fit=crop',
    JSON_ARRAY(),
    'Lightweight sports sneaker designed for comfort and movement.',
    '## Details\n\nLightweight upper.\nCushioned sole.\nComfortable everyday performance.',
    4.8,
    28,
    22,
    'Active',
    1,

    JSON_ARRAY(
        JSON_OBJECT('size','40','isAvailable',true,'quantity',5),
        JSON_OBJECT('size','41','isAvailable',true,'quantity',6),
        JSON_OBJECT('size','42','isAvailable',true,'quantity',6),
        JSON_OBJECT('size','43','isAvailable',true,'quantity',5)
    ),

    JSON_ARRAY(
        JSON_OBJECT('name','White','color','#ffffff'),
        JSON_OBJECT('name','Red','color','#dc2626')
    ),

    NULL
),


/* ===================== PRODUCT 16 ===================== */

(
    16,
    'SHR-ACC-003',
    'Premium Sunglasses',
    1290,
    1590,
    19,
    'Accessories',
    'Sunglasses',
    'https://images.unsplash.com/photo-1511499767150-a48a237f0083?q=80&w=1200&auto=format&fit=crop',
    JSON_ARRAY(),
    'Minimal sunglasses designed to complete modern outfits.',
    '## Details\n\nUV protection lens.\nLightweight frame.\nModern minimalist design.',
    4.7,
    21,
    35,
    'Active',
    0,
    JSON_ARRAY(),

    JSON_ARRAY(
        JSON_OBJECT('name','Black','color','#111111'),
        JSON_OBJECT('name','Brown','color','#78350f')
    ),

    NULL
),


/* ===================== PRODUCT 17 ===================== */

(
    17,
    'SHR-TS-004',
    'Basic Essential Tee',
    990,
    1290,
    23,
    'T-Shirt',
    'Essentials',
    'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?q=80&w=1200&auto=format&fit=crop',
    JSON_ARRAY(),
    'Clean basic t-shirt designed as an everyday wardrobe essential.',
    '## Details\n\nSoft cotton material.\nClassic fit.\nSimple minimalist styling.',
    4.5,
    10,
    60,
    'Active',
    1,

    JSON_ARRAY(
        JSON_OBJECT('size','S','isAvailable',true,'quantity',10),
        JSON_OBJECT('size','M','isAvailable',true,'quantity',20),
        JSON_OBJECT('size','L','isAvailable',true,'quantity',20),
        JSON_OBJECT('size','XL','isAvailable',true,'quantity',10)
    ),

    JSON_ARRAY(
        JSON_OBJECT('name','Grey','color','#6b7280'),
        JSON_OBJECT('name','Black','color','#111111'),
        JSON_OBJECT('name','White','color','#ffffff')
    ),

    NULL
),


/* ===================== PRODUCT 18 ===================== */

(
    18,
    'SHR-SH-007',
    'Formal White Shirt',
    1990,
    2390,
    16,
    'Shirt',
    'Formal',
    'https://images.unsplash.com/photo-1598033129183-c4f50c736f10?q=80&w=1200&auto=format&fit=crop',
    JSON_ARRAY(),
    'Classic formal white shirt suitable for office and special occasions.',
    '## Details\n\nPremium formal cotton.\nClean structured collar.\nComfortable tailored fit.',
    4.8,
    25,
    20,
    'Active',
    1,

    JSON_ARRAY(
        JSON_OBJECT('size','S','isAvailable',true,'quantity',4),
        JSON_OBJECT('size','M','isAvailable',true,'quantity',6),
        JSON_OBJECT('size','L','isAvailable',true,'quantity',6),
        JSON_OBJECT('size','XL','isAvailable',true,'quantity',4)
    ),

    JSON_ARRAY(
        JSON_OBJECT('name','White','color','#ffffff')
    ),

    NULL
),


/* ===================== PRODUCT 19 ===================== */

(
    19,
    'SHR-ACC-004',
    'Classic Everyday Cap',
    690,
    890,
    22,
    'Accessories',
    'Cap',
    'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?q=80&w=1200&auto=format&fit=crop',
    JSON_ARRAY(),
    'Classic adjustable cap for relaxed everyday styling.',
    '## Details\n\nAdjustable fitting.\nComfortable construction.\nMinimal everyday design.',
    4.6,
    12,
    50,
    'Active',
    0,
    JSON_ARRAY(),

    JSON_ARRAY(
        JSON_OBJECT('name','Black','color','#111111'),
        JSON_OBJECT('name','Navy','color','#172554')
    ),

    NULL
),


/* ===================== PRODUCT 20 ===================== */

(
    20,
    'SHR-CB-002',
    'Luxury Complete Outfit',
    4990,
    5990,
    17,
    'Combo',
    'Premium Set',
    'https://images.unsplash.com/photo-1496747611176-843222e1e57c?q=80&w=1200&auto=format&fit=crop',
    JSON_ARRAY(),
    'Complete premium outfit curated for sophisticated modern styling.',
    '## Details\n\nPremium coordinated outfit.\nModern tailored styling.\nComplete ready-to-wear combination.',
    4.9,
    40,
    10,
    'Active',
    1,

    JSON_ARRAY(
        JSON_OBJECT('size','M','isAvailable',true,'quantity',4),
        JSON_OBJECT('size','L','isAvailable',true,'quantity',3),
        JSON_OBJECT('size','XL','isAvailable',true,'quantity',3)
    ),

    JSON_ARRAY(
        JSON_OBJECT('name','Black','color','#111111'),
        JSON_OBJECT('name','Stone','color','#a8a29e')
    ),

    NULL
)


/* =========================================================
   UPDATE EXISTING PRODUCTS IF SEED IS RUN AGAIN
========================================================= */

ON DUPLICATE KEY UPDATE

    product_code = VALUES(product_code),

    name = VALUES(name),

    price = VALUES(price),

    original_price = VALUES(original_price),

    discount = VALUES(discount),

    category = VALUES(category),

    sub_category = VALUES(sub_category),

    image = VALUES(image),

    extra_images = VALUES(extra_images),

    description = VALUES(description),

    product_details = VALUES(product_details),

    rating = VALUES(rating),

    reviews = VALUES(reviews),

    stock = VALUES(stock),

    status = VALUES(status),

    show_size_section = VALUES(show_size_section),

    sizes = VALUES(sizes),

    colors = VALUES(colors),

    size_chart_json = VALUES(size_chart_json);


/* =========================================================
   HOME PAGE PRODUCT SETTINGS
========================================================= */

UPDATE settings

SET setting_value = JSON_SET(

    setting_value,

    '$.bestSellerIds',
    JSON_ARRAY(
        '1',
        '3',
        '7',
        '11'
    ),

    '$.featuredCollection.productIds',
    JSON_ARRAY(
        '3',
        '11',
        '15'
    ),

    '$.curatedEdits',

    JSON_OBJECT(

        'title',
        'Curated Edits',

        'items',

        JSON_ARRAY(

            JSON_OBJECT(
                'id','1',
                'title','The Minimalist',
                'subtitle','Clean lines & neutral tones',
                'image','https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=1200&auto=format&fit=crop',
                'link','/shop?category=Shirt'
            ),

            JSON_OBJECT(
                'id','2',
                'title','Urban Explorer',
                'subtitle','Durable fabrics for the city',
                'image','https://images.unsplash.com/photo-1483985988355-763728e1935b?q=80&w=1200&auto=format&fit=crop',
                'link','/shop?category=Pant'
            ),

            JSON_OBJECT(
                'id','3',
                'title','Weekend Edit',
                'subtitle','Easy coordinated looks',
                'image','https://images.unsplash.com/photo-1496747611176-843222e1e57c?q=80&w=1200&auto=format&fit=crop',
                'link','/shop?category=Combo'
            )

        )
    )

)

WHERE setting_key = 'home_settings';


/* =========================================================
   OPTIONAL CHECKS
========================================================= */

SELECT
    id,
    username,
    email,
    login_slug,
    role,
    is_active
FROM admins;


SELECT
    id,
    product_code,
    name,
    category,
    sub_category,
    price,
    stock,
    status
FROM products
ORDER BY id;


SELECT
    setting_key
FROM settings;


SELECT
    slug,
    title,
    is_published
FROM pages;


SELECT
    code,
    discount_percent,
    is_active
FROM coupons;