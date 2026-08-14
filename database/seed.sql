USE sharuu_store;

INSERT INTO settings (setting_key, setting_value) VALUES
('store_settings', JSON_OBJECT(
  'shippingChittagong', 60,
  'shippingOutsideChittagong', 120,
  'paymentSettings', JSON_OBJECT('bkashNumber','01700000000','nagadNumber','01800000000'),
  'socialLinks', JSON_ARRAY(JSON_OBJECT('platform','Facebook','url','https://facebook.com'), JSON_OBJECT('platform','Instagram','url','https://instagram.com')),
  'categorySubtitles', JSON_OBJECT('Combo','Exclusive 2-in-1 & 3-in-1 deals','Shirt','Premium cotton & linen','T-Shirt','Essential everyday basics','Pant','Tailored chinos & trousers','Shoes','Handcrafted footwear','Accessories','The finishing touches'),
  'brandSettings', JSON_OBJECT('name','SHARUU','fontFamily','font-display','color','#000000'),
  'contactSettings', JSON_OBJECT('email','contact@sharuu.com','address','Chittagong, Bangladesh','contactPhone','+880 1700-000000','shippingReturns','Fast delivery and simple returns.','specifications','See each product page for specifications and care instructions.'),
  'generalSettings', JSON_OBJECT('storeName','SHARUU','storeEmail','contact@sharuu.com','storeDescription','A curated destination for modern men''s fashion.','currency','BDT (৳)','weightUnit','Kilograms (kg)')
)),
('home_settings', JSON_OBJECT(
  'heroImage','https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=2070&auto=format&fit=crop',
  'heroBadge','New Collection',
  'heroTitle','The Art of Modern Elegance',
  'heroSubtitle','Discover our curated collection designed for the contemporary individual.',
  'heroVideoUrl','',
  'bestSellerIds',JSON_ARRAY(),
  'socialGallery',JSON_ARRAY('https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=1200&auto=format&fit=crop','https://images.unsplash.com/photo-1483985988355-763728e1935b?q=80&w=1200&auto=format&fit=crop'),
  'featuredCollection',JSON_OBJECT('title','Featured Collection','subtitle','Selected pieces for you.','productIds',JSON_ARRAY(),'show',true),
  'curatedEdits',JSON_OBJECT('title','Curated Edits','items',JSON_ARRAY())
))
ON DUPLICATE KEY UPDATE setting_value = VALUES(setting_value);

INSERT INTO pages (slug,title,excerpt,body,seo_title,seo_description,is_published) VALUES
('shipping-returns','Shipping & Returns','Delivery and return information.','# Shipping & Returns\n\nUpdate this page from **Admin → Pages**.','Shipping & Returns - SHARUU','Shipping and returns information.',1),
('privacy-policy','Privacy Policy','How customer information is handled.','# Privacy Policy\n\nUpdate this page from **Admin → Pages**.','Privacy Policy - SHARUU','SHARUU privacy policy.',1),
('terms-of-service','Terms of Service','Terms for using this store.','# Terms of Service\n\nUpdate this page from **Admin → Pages**.','Terms of Service - SHARUU','SHARUU terms of service.',1)
ON DUPLICATE KEY UPDATE title=VALUES(title), excerpt=VALUES(excerpt), body=VALUES(body), seo_title=VALUES(seo_title), seo_description=VALUES(seo_description), is_published=VALUES(is_published);

INSERT INTO coupons (code, discount_percent, is_active, min_subtotal, max_discount)
VALUES ('WELCOME10',10,1,0,NULL)
ON DUPLICATE KEY UPDATE discount_percent=VALUES(discount_percent), is_active=VALUES(is_active);

USE sharuu_store;

INSERT INTO products
(
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
colors
)
VALUES

(1,'SHR-TS-001','Premium Oversized Cotton T-Shirt',1290,1590,19,'T-Shirt','Oversized',
'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab',
JSON_ARRAY(),
'Premium heavyweight cotton oversized t-shirt.',
'Premium cotton fabric. Relaxed fit. Everyday comfort.',
4.9,25,50,'Active',1,
JSON_ARRAY('M','L','XL'),
JSON_ARRAY(
JSON_OBJECT('name','Black','color','#111111'),
JSON_OBJECT('name','White','color','#ffffff')
)),

(2,'SHR-TS-002','Classic Polo T-Shirt',1490,1790,17,'T-Shirt','Polo',
'https://images.unsplash.com/photo-1627225924765-552d49cf47ad',
JSON_ARRAY(),
'Classic premium polo t-shirt.',
'Cotton pique fabric. Smart casual style.',
4.8,18,35,'Active',1,
JSON_ARRAY('M','L','XL'),
JSON_ARRAY(
JSON_OBJECT('name','Navy','color','#172554'),
JSON_OBJECT('name','White','color','#ffffff')
)),

(3,'SHR-SH-001','Premium Linen Shirt',2190,2590,15,'Shirt','Linen',
'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf',
JSON_ARRAY(),
'Elegant linen shirt.',
'Breathable linen fabric. Premium finishing.',
4.9,30,40,'Active',1,
JSON_ARRAY('S','M','L','XL'),
JSON_ARRAY(
JSON_OBJECT('name','White','color','#ffffff'),
JSON_OBJECT('name','Sky Blue','color','#93c5fd')
)),

(4,'SHR-SH-002','Oxford Casual Shirt',1890,2290,18,'Shirt','Oxford',
'https://images.unsplash.com/photo-1598033129183-c4f50c736f10',
JSON_ARRAY(),
'Classic oxford shirt.',
'Cotton weave with comfortable fit.',
4.7,20,30,'Active',1,
JSON_ARRAY('M','L','XL'),
JSON_ARRAY(
JSON_OBJECT('name','Blue','color','#2563eb'),
JSON_OBJECT('name','White','color','#ffffff')
)),

(5,'SHR-PT-001','Slim Fit Chino Pant',2390,2890,17,'Pant','Chino',
'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80',
JSON_ARRAY(),
'Modern slim fit chino pant.',
'Stretch cotton fabric.',
4.8,22,25,'Active',1,
JSON_ARRAY('30','32','34','36'),
JSON_ARRAY(
JSON_OBJECT('name','Khaki','color','#a16207'),
JSON_OBJECT('name','Black','color','#111111')
)),

(6,'SHR-PT-002','Formal Tailored Trouser',2590,2990,13,'Pant','Formal',
'https://images.unsplash.com/photo-1506629082955-511b1aa562c8',
JSON_ARRAY(),
'Premium formal trouser.',
'Comfort waistband and tailored cut.',
4.7,15,20,'Active',1,
JSON_ARRAY('30','32','34'),
JSON_ARRAY(
JSON_OBJECT('name','Charcoal','color','#3f3f46')
)),

(7,'SHR-SH-003','Minimal Leather Sneaker',3490,3990,12,'Shoes','Sneaker',
'https://images.unsplash.com/photo-1549298916-b41d501d3772',
JSON_ARRAY(),
'Minimal leather sneaker.',
'Premium leather upper and comfort sole.',
4.9,45,20,'Active',1,
JSON_ARRAY('40','41','42','43'),
JSON_ARRAY(
JSON_OBJECT('name','White','color','#ffffff'),
JSON_OBJECT('name','Black','color','#111111')
)),

(8,'SHR-SH-004','Denim Casual Shirt',1990,2390,16,'Shirt','Denim',
'https://images.unsplash.com/photo-1603252110481-7ba873bf42ab',
JSON_ARRAY(),
'Stylish denim shirt.',
'Heavy denim fabric.',
4.6,12,18,'Active',1,
JSON_ARRAY('M','L','XL'),
JSON_ARRAY(
JSON_OBJECT('name','Blue','color','#1d4ed8')
)),

(9,'SHR-ACC-001','Premium Leather Wallet',890,1190,25,'Accessories','Wallet',
'https://images.unsplash.com/photo-1627123424574-724758594e93',
JSON_ARRAY(),
'Premium leather wallet.',
'Genuine leather finish.',
4.8,35,60,'Active',0,
JSON_ARRAY(),
JSON_ARRAY(
JSON_OBJECT('name','Brown','color','#78350f'),
JSON_OBJECT('name','Black','color','#111111')
)),

(10,'SHR-ACC-002','Classic Leather Belt',990,1290,23,'Accessories','Belt',
'https://images.unsplash.com/photo-1624222247344-550fb60583dc',
JSON_ARRAY(),
'Classic leather belt.',
'Premium buckle design.',
4.7,19,40,'Active',0,
JSON_ARRAY(),
JSON_ARRAY(
JSON_OBJECT('name','Black','color','#111111')
)),

(11,'SHR-CB-001','Weekend Fashion Combo',3290,3890,15,'Combo','Set',
'https://images.unsplash.com/photo-1617137968427-85924c800a22',
JSON_ARRAY(),
'Complete weekend outfit combo.',
'Shirt and trouser combination.',
4.9,20,15,'Active',1,
JSON_ARRAY('M','L','XL'),
JSON_ARRAY(
JSON_OBJECT('name','Black','color','#111111')
)),

(12,'SHR-TS-003','Graphic Street T-Shirt',1190,1490,20,'T-Shirt','Graphic',
'https://images.unsplash.com/photo-1503341504253-dff4815485f1',
JSON_ARRAY(),
'Street style graphic t-shirt.',
'Soft cotton print design.',
4.6,14,45,'Active',1,
JSON_ARRAY('M','L','XL'),
JSON_ARRAY(
JSON_OBJECT('name','Black','color','#111111')
)),

(13,'SHR-SH-005','Premium Casual Shirt',1790,2190,18,'Shirt','Casual',
'https://images.unsplash.com/photo-1596755389378-c31d21fd1273',
JSON_ARRAY(),
'Everyday casual shirt.',
'Comfortable cotton material.',
4.7,16,25,'Active',1,
JSON_ARRAY('M','L','XL'),
JSON_ARRAY(
JSON_OBJECT('name','Green','color','#166534')
)),

(14,'SHR-PT-003','Cargo Pant',2290,2690,15,'Pant','Cargo',
'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f',
JSON_ARRAY(),
'Modern cargo pant.',
'Multiple pocket design.',
4.6,18,30,'Active',1,
JSON_ARRAY('30','32','34'),
JSON_ARRAY(
JSON_OBJECT('name','Olive','color','#365314')
)),

(15,'SHR-SH-006','Running Sneaker',2990,3490,14,'Shoes','Sports',
'https://images.unsplash.com/photo-1542291026-7eec264c27ff',
JSON_ARRAY(),
'Sports running sneaker.',
'Lightweight comfortable shoe.',
4.8,28,22,'Active',1,
JSON_ARRAY('40','41','42','43'),
JSON_ARRAY(
JSON_OBJECT('name','White','color','#ffffff')
)),

(16,'SHR-ACC-003','Premium Sunglasses',1290,1590,19,'Accessories','Sunglasses',
'https://images.unsplash.com/photo-1511499767150-a48a237f0083',
JSON_ARRAY(),
'Fashion sunglasses.',
'UV protection lens.',
4.7,21,35,'Active',0,
JSON_ARRAY(),
JSON_ARRAY(
JSON_OBJECT('name','Black','color','#111111')
)),

(17,'SHR-TS-004','Basic Essential Tee',990,1290,23,'T-Shirt','Basic',
'https://images.unsplash.com/photo-1523381210434-271e8be1f52b',
JSON_ARRAY(),
'Basic everyday t-shirt.',
'Soft cotton material.',
4.5,10,60,'Active',1,
JSON_ARRAY('M','L','XL'),
JSON_ARRAY(
JSON_OBJECT('name','Grey','color','#6b7280')
)),

(18,'SHR-SH-007','Formal White Shirt',1990,2390,16,'Shirt','Formal',
'https://images.unsplash.com/photo-1598033129183-c4f50c736f10',
JSON_ARRAY(),
'Formal office shirt.',
'Premium formal cotton.',
4.8,25,20,'Active',1,
JSON_ARRAY('M','L','XL'),
JSON_ARRAY(
JSON_OBJECT('name','White','color','#ffffff')
)),

(19,'SHR-ACC-004','Classic Cap',690,890,22,'Accessories','Cap',
'https://images.unsplash.com/photo-1588850561407-ed78c282e89b',
JSON_ARRAY(),
'Classic fashion cap.',
'Adjustable fitting.',
4.6,12,50,'Active',0,
JSON_ARRAY(),
JSON_ARRAY(
JSON_OBJECT('name','Black','color','#111111')
)),

(20,'SHR-CB-002','Luxury Complete Outfit',4990,5990,17,'Combo','Premium Set',
'https://images.unsplash.com/photo-1496747611176-843222e1e57c',
JSON_ARRAY(),
'Complete luxury outfit.',
'Premium shirt, pant and accessories combo.',
4.9,40,10,'Active',1,
JSON_ARRAY('M','L','XL'),
JSON_ARRAY(
JSON_OBJECT('name','Black','color','#111111')
))

ON DUPLICATE KEY UPDATE
name=VALUES(name),
price=VALUES(price),
original_price=VALUES(original_price),
discount=VALUES(discount),
category=VALUES(category),
sub_category=VALUES(sub_category),
image=VALUES(image),
description=VALUES(description),
product_details=VALUES(product_details),
stock=VALUES(stock),
status=VALUES(status),
sizes=VALUES(sizes),
colors=VALUES(colors);

UPDATE settings SET setting_value = JSON_SET(
  setting_value,
  '$.bestSellerIds', JSON_ARRAY('1','2','3','4'),
  '$.featuredCollection.productIds', JSON_ARRAY('1','6','3'),
  '$.curatedEdits', JSON_OBJECT('title','Curated Edits','items',JSON_ARRAY(
    JSON_OBJECT('id','1','title','The Minimalist','subtitle','Clean lines & neutral tones','image','https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=1200&auto=format&fit=crop','link','/collection?category=Shirt'),
    JSON_OBJECT('id','2','title','Urban Explorer','subtitle','Durable fabrics for the city','image','https://images.unsplash.com/photo-1483985988355-763728e1935b?q=80&w=1200&auto=format&fit=crop','link','/collection?category=Pant'),
    JSON_OBJECT('id','3','title','Weekend Edit','subtitle','Easy coordinated looks','image','https://images.unsplash.com/photo-1496747611176-843222e1e57c?q=80&w=1200&auto=format&fit=crop','link','/collection?category=Combo')
  ))
) WHERE setting_key='home_settings';
