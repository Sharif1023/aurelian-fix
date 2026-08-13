import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { api } from '../lib/api';

const ProductContext = createContext(null);

const defaultStoreSettings = {
  shippingChittagong: 60,
  shippingOutsideChittagong: 120,
  coupons: [],
  paymentSettings: { bkashNumber: '01700000000', nagadNumber: '01800000000' },
  socialLinks: [
    { platform: 'Facebook', url: 'https://facebook.com' },
    { platform: 'Instagram', url: 'https://instagram.com' }
  ],
  categorySubtitles: {},
  brandSettings: { name: 'SHARUU', fontFamily: 'font-display', color: '#000000' },
  contactSettings: {
    email: 'contact@sharuu.com',
    address: 'Chittagong, Bangladesh',
    contactPhone: '+880 1700-000000',
    shippingReturns: 'Fast delivery and simple returns.',
    specifications: 'See product details for care and specifications.'
  },
  generalSettings: {
    storeName: 'SHARUU',
    storeEmail: 'contact@sharuu.com',
    storeDescription: "A curated destination for modern men's fashion.",
    currency: 'BDT (৳)',
    weightUnit: 'Kilograms (kg)'
  }
};

const defaultHomeSettings = {
  heroImage: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=2070&auto=format&fit=crop',
  heroBadge: 'New Collection',
  heroTitle: 'The Art of Modern Elegance',
  heroSubtitle: 'Discover our curated collection designed for the contemporary individual.',
  heroVideoUrl: '',
  bestSellerIds: [],
  socialGallery: [],
  featuredCollection: { title: 'Featured Collection', subtitle: 'Selected pieces for you.', productIds: [], show: true },
  curatedEdits: { title: 'Curated Edits', items: [] }
};

function normalizeProduct(row = {}) {
  return {
    ...row,
    id: String(row.id),
    productCode: row.productCode ?? row.product_code ?? '',
    product_code: row.product_code ?? row.productCode ?? '',
    price: Number(row.price || 0),
    originalPrice: row.originalPrice ?? row.original_price ?? null,
    original_price: row.original_price ?? row.originalPrice ?? null,
    discount: row.discount == null ? null : Number(row.discount),
    subCategory: row.subCategory ?? row.sub_category ?? '',
    sub_category: row.sub_category ?? row.subCategory ?? '',
    images: row.images || row.extraImages || row.extra_images || [],
    extraImages: row.extraImages || row.extra_images || row.images || [],
    productDetails: row.productDetails ?? row.product_details ?? '',
    product_details: row.product_details ?? row.productDetails ?? '',
    rating: Number(row.rating ?? 5),
    reviews: Number(row.reviews ?? 0),
    stock: Number(row.stock ?? 0),
    showSizeSection: row.showSizeSection ?? row.show_size_section ?? true,
    show_size_section: row.show_size_section ?? row.showSizeSection ?? true,
    sizes: row.sizes || [],
    colors: row.colors || [],
    sizeChart: row.sizeChart ?? row.size_chart_json ?? null,
    size_chart_json: row.size_chart_json ?? row.sizeChart ?? null,
    createdAt: row.createdAt ?? row.created_at ?? new Date().toISOString(),
    created_at: row.created_at ?? row.createdAt
  };
}

function normalizeOrder(row = {}) {
  return {
    ...row,
    id: String(row.id),
    orderNumber: row.orderNumber ?? row.order_number,
    customerName: row.customerName ?? row.customer_name,
    shippingArea: row.shippingArea ?? row.shipping_area,
    shippingCost: Number(row.shippingCost ?? row.shipping_cost ?? 0),
    paymentMethod: row.paymentMethod ?? row.payment_method,
    transactionId: row.transactionId ?? row.transaction_id,
    total: Number(row.total ?? 0),
    createdAt: row.createdAt ?? row.created_at,
    items: (row.items || []).map((item) => ({
      ...item,
      productId: String(item.productId ?? item.product_id ?? ''),
      name: item.name ?? item.product_name ?? '',
      image: item.image ?? item.image_url ?? '',
      price: Number(item.price || 0),
      quantity: Number(item.quantity || 0)
    }))
  };
}

function mergeStore(value = {}) {
  return {
    ...defaultStoreSettings,
    ...value,
    paymentSettings: { ...defaultStoreSettings.paymentSettings, ...(value.paymentSettings || {}) },
    brandSettings: { ...defaultStoreSettings.brandSettings, ...(value.brandSettings || {}) },
    contactSettings: { ...defaultStoreSettings.contactSettings, ...(value.contactSettings || {}) },
    generalSettings: { ...defaultStoreSettings.generalSettings, ...(value.generalSettings || {}) },
    categorySubtitles: { ...defaultStoreSettings.categorySubtitles, ...(value.categorySubtitles || {}) },
    socialLinks: value.socialLinks || defaultStoreSettings.socialLinks,
    coupons: value.coupons || []
  };
}

function mergeHome(value = {}) {
  return {
    ...defaultHomeSettings,
    ...value,
    featuredCollection: { ...defaultHomeSettings.featuredCollection, ...(value.featuredCollection || {}) },
    curatedEdits: { ...defaultHomeSettings.curatedEdits, ...(value.curatedEdits || {}) }
  };
}

export function ProductProvider({ children }) {
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [coupons, setCoupons] = useState([]);
  const [messages, setMessages] = useState([]);
  const [pages, setPages] = useState([]);
  const [storeSettings, setStoreSettings] = useState(defaultStoreSettings);
  const [homeSettings, setHomeSettings] = useState(defaultHomeSettings);
  const [wishlist, setWishlist] = useState(() => {
    try { return JSON.parse(localStorage.getItem('wishlist') || '[]'); } catch { return []; }
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const refreshPublicData = useCallback(async () => {
    setLoading(true);
    try {
      const [productRows, publicSettings, home, publicPages] = await Promise.all([
        api.get('/products'),
        api.get('/settings/store_settings'),
        api.get('/settings/home_settings'),
        api.get('/pages')
      ]);
      setProducts((productRows || []).map(normalizeProduct));
      setStoreSettings(mergeStore(publicSettings || {}));
      setHomeSettings(mergeHome(home || {}));
      setPages(publicPages || []);
      setError(null);
    } catch (err) {
      setError(err.message);
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  const refreshAdminData = useCallback(async () => {
    const [orderRows, customerRows, couponRows, messageRows, allPages] = await Promise.all([
      api.get('/admin/orders'),
      api.get('/admin/customers'),
      api.get('/admin/coupons'),
      api.get('/admin/messages'),
      api.get('/admin/pages')
    ]);
    setOrders((orderRows || []).map(normalizeOrder));
    setCustomers(customerRows || []);
    setCoupons(couponRows || []);
    setStoreSettings((current) => ({ ...current, coupons: couponRows || [] }));
    setMessages(messageRows || []);
    setPages(allPages || []);
  }, []);

  const refreshData = useCallback(async () => {
    await refreshPublicData();
  }, [refreshPublicData]);

  useEffect(() => { refreshPublicData(); }, [refreshPublicData]);
  useEffect(() => { localStorage.setItem('wishlist', JSON.stringify(wishlist)); }, [wishlist]);

  const categories = useMemo(() => [...new Set(products.map((p) => p.category).filter(Boolean))], [products]);

  const addProduct = async (payload) => {
    const saved = normalizeProduct(await api.post('/admin/products', payload));
    setProducts((items) => [saved, ...items]);
    return saved;
  };
  const updateProduct = async (id, payload) => {
    const saved = normalizeProduct(await api.put(`/admin/products/${id}`, payload));
    setProducts((items) => items.map((p) => p.id === String(id) ? saved : p));
    return saved;
  };
  const deleteProduct = async (id) => {
    await api.delete(`/admin/products/${id}`);
    setProducts((items) => items.filter((p) => p.id !== String(id)));
  };

  const updateHomeSettings = async (payload) => {
    const saved = mergeHome(await api.put('/admin/settings/home_settings', payload));
    setHomeSettings(saved);
    return saved;
  };
  const updateStoreSettings = async (payload) => {
    const saved = mergeStore(await api.put('/admin/settings/store_settings', payload));
    setStoreSettings((current) => ({ ...saved, coupons: current.coupons }));
    return saved;
  };

  const addCoupon = async (payload) => {
    const saved = await api.post('/admin/coupons', payload);
    setCoupons((items) => [saved, ...items]);
    setStoreSettings((s) => ({ ...s, coupons: [saved, ...s.coupons] }));
    return saved;
  };
  const updateCoupon = async (id, payload) => {
    const saved = await api.put(`/admin/coupons/${id}`, payload);
    setCoupons((items) => items.map((c) => String(c.id) === String(id) ? saved : c));
    setStoreSettings((s) => ({ ...s, coupons: s.coupons.map((c) => String(c.id) === String(id) ? saved : c) }));
    return saved;
  };
  const deleteCoupon = async (id) => {
    await api.delete(`/admin/coupons/${id}`);
    setCoupons((items) => items.filter((c) => String(c.id) !== String(id)));
    setStoreSettings((s) => ({ ...s, coupons: s.coupons.filter((c) => String(c.id) !== String(id)) }));
  };
  const validateCoupon = (code, subtotal) => api.post('/coupons/validate', { code, subtotal });

  const createOrder = async (payload) => normalizeOrder(await api.post('/orders', payload));
  const trackOrder = async (orderNumber, identifier) => normalizeOrder(await api.post('/orders/track', { orderNumber, identifier }));
  const updateOrderStatus = async (id, status) => {
    const saved = normalizeOrder(await api.patch(`/admin/orders/${id}/status`, { status }));
    setOrders((items) => items.map((o) => o.id === String(id) ? saved : o));
    return saved;
  };
  const deleteOrder = async (id) => {
    await api.delete(`/admin/orders/${id}`);
    setOrders((items) => items.filter((o) => o.id !== String(id)));
  };

  const sendContactMessage = (payload) => api.post('/contact', payload);
  const updateMessageStatus = async (id, status) => {
    const saved = await api.patch(`/admin/messages/${id}`, { status });
    setMessages((items) => items.map((m) => String(m.id) === String(id) ? saved : m));
    return saved;
  };

  const savePage = async (page) => {
    const saved = page.id ? await api.put(`/admin/pages/${page.id}`, page) : await api.post('/admin/pages', page);
    setPages((items) => {
      const exists = items.some((p) => String(p.id) === String(saved.id));
      return exists ? items.map((p) => String(p.id) === String(saved.id) ? saved : p) : [saved, ...items];
    });
    return saved;
  };
  const deletePage = async (id) => {
    await api.delete(`/admin/pages/${id}`);
    setPages((items) => items.filter((p) => String(p.id) !== String(id)));
  };

  const toggleWishlist = (productId) => setWishlist((items) => items.includes(productId) ? items.filter((id) => id !== productId) : [...items, productId]);

  return <ProductContext.Provider value={{
    products, categories, orders, customers, coupons, messages, pages,
    storeSettings, homeSettings, wishlist, loading, error,
    refreshData, refreshPublicData, refreshAdminData,
    addProduct, updateProduct, deleteProduct,
    updateHomeSettings, updateStoreSettings,
    addCoupon, updateCoupon, deleteCoupon, validateCoupon,
    createOrder, trackOrder, updateOrderStatus, deleteOrder,
    sendContactMessage, updateMessageStatus,
    savePage, deletePage,
    toggleWishlist
  }}>{children}</ProductContext.Provider>;
}

export function useProducts() {
  const value = useContext(ProductContext);
  if (!value) throw new Error('useProducts must be used within ProductProvider');
  return value;
}
