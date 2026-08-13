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

INSERT INTO products (id,product_code,name,price,original_price,discount,category,sub_category,image,extra_images,description,product_details,rating,reviews,stock,status,show_size_section,sizes,colors,size_chart_json) VALUES
(1,'SHR-SH-001','Architectural Linen Shirt',1890,2290,17,'Shirt','Linen','https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?q=80&w=1200&auto=format&fit=crop',JSON_ARRAY(),'Premium linen shirt with a clean modern silhouette.','## Details\n\nBreathable fabric, refined construction and an easy tailored fit.',4.9,18,25,'Active',1,JSON_ARRAY(JSON_OBJECT('size','S','isAvailable',true,'quantity',5),JSON_OBJECT('size','M','isAvailable',true,'quantity',8),JSON_OBJECT('size','L','isAvailable',true,'quantity',7),JSON_OBJECT('size','XL','isAvailable',true,'quantity',5)),JSON_ARRAY(JSON_OBJECT('name','Black','color','#111111'),JSON_OBJECT('name','White','color','#f5f5f5')),NULL),
(2,'SHR-TS-001','Essential Heavyweight Tee',990,1190,16,'T-Shirt','Essentials','https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?q=80&w=1200&auto=format&fit=crop',JSON_ARRAY(),'Heavyweight everyday t-shirt.','## Details\n\nSoft cotton jersey with a structured premium hand-feel.',4.8,31,40,'Active',1,JSON_ARRAY(JSON_OBJECT('size','M','isAvailable',true,'quantity',15),JSON_OBJECT('size','L','isAvailable',true,'quantity',15),JSON_OBJECT('size','XL','isAvailable',true,'quantity',10)),JSON_ARRAY(JSON_OBJECT('name','Black','color','#111111'),JSON_OBJECT('name','Navy','color','#172554')),NULL),
(3,'SHR-PT-001','Tailored Everyday Trouser',2190,2590,15,'Pant','Tailored','https://images.unsplash.com/photo-1506629082955-511b1aa562c8?q=80&w=1200&auto=format&fit=crop',JSON_ARRAY(),'Versatile tailored trouser for work and weekends.','## Details\n\nComfort stretch, clean front and tapered leg.',4.7,22,20,'Active',1,JSON_ARRAY(JSON_OBJECT('size','30','isAvailable',true,'quantity',4),JSON_OBJECT('size','32','isAvailable',true,'quantity',6),JSON_OBJECT('size','34','isAvailable',true,'quantity',6),JSON_OBJECT('size','36','isAvailable',true,'quantity',4)),JSON_ARRAY(JSON_OBJECT('name','Charcoal','color','#3f3f46'),JSON_OBJECT('name','Khaki','color','#a16207')),NULL),
(4,'SHR-SH-002','Relaxed Oxford Shirt',1690,1990,15,'Shirt','Oxford','https://images.unsplash.com/photo-1598033129183-c4f50c736f10?q=80&w=1200&auto=format&fit=crop',JSON_ARRAY(),'Relaxed oxford shirt with timeless styling.','## Details\n\nDurable cotton weave, button-down collar and relaxed fit.',4.9,12,18,'Active',1,JSON_ARRAY(JSON_OBJECT('size','S','isAvailable',true,'quantity',3),JSON_OBJECT('size','M','isAvailable',true,'quantity',5),JSON_OBJECT('size','L','isAvailable',true,'quantity',6),JSON_OBJECT('size','XL','isAvailable',true,'quantity',4)),JSON_ARRAY(JSON_OBJECT('name','Sky Blue','color','#93c5fd'),JSON_OBJECT('name','White','color','#f5f5f5')),NULL),
(5,'SHR-SH-003','Leather Minimal Sneaker',3490,3990,12,'Shoes','Sneakers','https://images.unsplash.com/photo-1549298916-b41d501d3772?q=80&w=1200&auto=format&fit=crop',JSON_ARRAY(),'Minimal low-top sneaker for clean everyday styling.','## Details\n\nCushioned footbed and durable outsole.',4.8,27,16,'Active',1,JSON_ARRAY(JSON_OBJECT('size','40','isAvailable',true,'quantity',4),JSON_OBJECT('size','41','isAvailable',true,'quantity',4),JSON_OBJECT('size','42','isAvailable',true,'quantity',4),JSON_OBJECT('size','43','isAvailable',true,'quantity',4)),JSON_ARRAY(JSON_OBJECT('name','White','color','#f5f5f5'),JSON_OBJECT('name','Black','color','#111111')),NULL),
(6,'SHR-CB-001','Weekend Two-Piece Combo',3290,3890,15,'Combo','Set','https://images.unsplash.com/photo-1617137968427-85924c800a22?q=80&w=1200&auto=format&fit=crop',JSON_ARRAY(),'Coordinated shirt and trouser set.','## Details\n\nA ready-to-wear combination designed for effortless styling.',4.9,20,15,'Active',1,JSON_ARRAY(JSON_OBJECT('size','M','isAvailable',true,'quantity',5),JSON_OBJECT('size','L','isAvailable',true,'quantity',5),JSON_OBJECT('size','XL','isAvailable',true,'quantity',5)),JSON_ARRAY(JSON_OBJECT('name','Stone','color','#a8a29e'),JSON_OBJECT('name','Black','color','#111111')),NULL)
ON DUPLICATE KEY UPDATE name=VALUES(name),price=VALUES(price),original_price=VALUES(original_price),discount=VALUES(discount),category=VALUES(category),sub_category=VALUES(sub_category),image=VALUES(image),description=VALUES(description),product_details=VALUES(product_details),stock=VALUES(stock),status=VALUES(status),show_size_section=VALUES(show_size_section),sizes=VALUES(sizes),colors=VALUES(colors);

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
