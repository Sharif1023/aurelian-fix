import { ChevronLeft, CheckCircle2, Loader2, ChevronDown, ChevronUp, ShoppingBag, FileText } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useCart } from '../../context/CartContext';
import { useProducts } from '../../context/ProductContext';
import { cn } from '@/src/lib/utils';
import Invoice from '../../components/Invoice';
const BANGLADESH_CITIES = [
  'Chittagong',
  'Bagerhat',
  'Bandarban',
  'Barguna',
  'Barishal',
  'Bhola',
  'Bogura',
  'Brahmanbaria',
  'Chandpur',
  'Chapainawabganj',
  'Chattogram',
  'Chuadanga',
  'Cox’s Bazar',
  'Cumilla',
  'Dhaka',
  'Dinajpur',
  'Faridpur',
  'Feni',
  'Gaibandha',
  'Gazipur',
  'Gopalganj',
  'Habiganj',
  'Jamalpur',
  'Jashore',
  'Jhalokati',
  'Jhenaidah',
  'Joypurhat',
  'Khagrachhari',
  'Khulna',
  'Kishoreganj',
  'Kurigram',
  'Kushtia',
  'Lakshmipur',
  'Lalmonirhat',
  'Madaripur',
  'Magura',
  'Manikganj',
  'Meherpur',
  'Moulvibazar',
  'Munshiganj',
  'Mymensingh',
  'Naogaon',
  'Narail',
  'Narayanganj',
  'Narsingdi',
  'Natore',
  'Netrokona',
  'Nilphamari',
  'Noakhali',
  'Pabna',
  'Panchagarh',
  'Patuakhali',
  'Pirojpur',
  'Rajbari',
  'Rajshahi',
  'Rangamati',
  'Rangpur',
  'Satkhira',
  'Shariatpur',
  'Sherpur',
  'Sirajganj',
  'Sunamganj',
  'Sylhet',
  'Tangail',
  'Thakurgaon',
];

const PAYMENT_METHODS = [
  {
    id: 'COD',
    logo: 'https://cdn.iconscout.com/icon/free/png-256/free-cash-on-delivery-icon-svg-download-png-1569374.png',
    label: 'Cash on Delivery',
  },
  {
    id: 'bKash',
    logo: 'https://wp.logos-download.com/wp-content/uploads/2022/01/BKash_Logo_icon-700x662.png',
    label: 'bKash',
  },
  {
    id: 'Nagad',
    logo: 'https://download.logo.wine/logo/Nagad/Nagad-Logo.wine.png',
    label: 'Nagad',
  },
];

export default function Checkout() {
    const navigate = useNavigate();
    const { cartItems, subtotal, clearCart } = useCart();
    const { createOrder, storeSettings, validateCoupon } = useProducts();
    const [isProcessing, setIsProcessing] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [isSummaryOpen, setIsSummaryOpen] = useState(false);
    const [paymentMethod, setPaymentMethod] = useState('COD');
    const [orderNumber, setOrderNumber] = useState('');
    const [completedOrder, setCompletedOrder] = useState(null);
    const [showInvoice, setShowInvoice] = useState(false);
    const [shippingArea, setShippingArea] = useState('Chittagong');
    useEffect(() => {
        if (isSuccess) {
            window.scrollTo(0, 0);
        }
    }, [isSuccess]);
    const [couponCode, setCouponCode] = useState('');
    const [appliedCoupon, setAppliedCoupon] = useState(null);
    const [couponError, setCouponError] = useState('');
    const shippingCost = cartItems.length > 0
        ? (shippingArea === 'Chittagong' ? storeSettings.shippingChittagong : storeSettings.shippingOutsideChittagong)
        : 0;
    const discountAmount = appliedCoupon ? Number(appliedCoupon.discountAmount ?? ((subtotal * appliedCoupon.discountPercent) / 100)) : 0;
    const total = subtotal + shippingCost - discountAmount;
    const handleApplyCoupon = async () => {
        if (!couponCode.trim()) return;
        try {
            const coupon = await validateCoupon(couponCode.trim(), subtotal);
            setAppliedCoupon(coupon);
            setCouponError('');
        }
        catch (err) {
            setCouponError(err instanceof Error ? err.message : 'Invalid or inactive coupon code.');
            setAppliedCoupon(null);
        }
    };
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        phone: '',
        address: '',
        city: '',
        transactionId: ''
    });

    const [isCityOpen, setIsCityOpen] = useState(false);

    const filteredCities = useMemo(() => {
  const query = String(formData.city || '')
    .trim()
    .toLowerCase();

  // কিছু লেখা না থাকলে সব city দেখাবে
  if (!query) {
    return BANGLADESH_CITIES;
  }

  // লিখলে matching city আগে দেখাবে
  return BANGLADESH_CITIES
    .filter((city) =>
      city.toLowerCase().includes(query)
    )
    .sort((a, b) => {
      const aLower = a.toLowerCase();
      const bLower = b.toLowerCase();

      const aStarts = aLower.startsWith(query);
      const bStarts = bLower.startsWith(query);

      if (aStarts && !bStarts) return -1;
      if (!aStarts && bStarts) return 1;

      return a.localeCompare(b);
    });
}, [formData.city]);

    const handleCompleteOrder = async () => {
        if (!formData.fullName || !formData.address || !formData.phone || !formData.city) {
            alert('Please fill in all required contact and shipping details.');
            return;
        }
        if (paymentMethod !== 'COD' && !formData.transactionId) {
            alert('Please enter the Transaction ID for your mobile payment.');
            return;
        }
        setIsProcessing(true);
        try {
            const newOrder = await createOrder({
                customerName: formData.fullName,
                email: formData.email.trim() || null,
                phone: formData.phone,
                address: formData.address,
                city: formData.city,
                zip: '',
                items: cartItems.map(item => ({
                    productId: item.id,
                    name: item.name,
                    price: item.price,
                    quantity: item.quantity,
                    size: item.selectedSize,
                    color: item.selectedColor,
                    image: item.image
                })),
                couponCode: appliedCoupon?.code || '',
                shippingArea: shippingArea,
                paymentMethod: paymentMethod,
                transactionId: formData.transactionId
            });
            setOrderNumber(newOrder.orderNumber);
            setCompletedOrder(newOrder);
            setIsProcessing(false);
            setIsSuccess(true);
            clearCart();
            // Removed automatic redirect to allow invoice download
        }
        catch (error) {
            setIsProcessing(false);
            console.error('Order submission failed:', error);
            const message = error instanceof Error
                ? error.message
                : 'Failed to place order. Please try again.';
            alert(message);
        }
    };
    if (isSuccess) {
        return (<main className="pt-24 pb-32 px-4 sm:px-6 max-w-7xl mx-auto min-h-screen flex flex-col items-center justify-center text-center">
        <motion.div initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="w-20 h-20 sm:w-24 sm:h-24 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-8">
          <CheckCircle2 className="w-10 h-10 sm:w-12 sm:h-12"/>
        </motion.div>

        <div className="space-y-2 mb-8">
          <h1 className="font-headline text-3xl sm:text-4xl font-extrabold tracking-tight">Order Confirmed</h1>
          <p className="text-on-surface-variant text-sm sm:text-base">Thank you for your purchase. Your order has been placed successfully.</p>
        </div>

        <div className="bg-surface-low p-8 sm:p-12 rounded-[40px] border border-outline-variant/10 mb-12 w-full max-w-lg">
          <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-on-surface-variant mb-4">Your Tracking ID</p>
          <h2 className="text-4xl sm:text-5xl font-headline font-black text-primary tracking-tighter mb-4">
            {orderNumber}
          </h2>
          <p className="text-xs text-on-surface-variant/60">Please save this ID to track your luxury shipment.</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 w-full max-w-lg">
          <button onClick={() => setShowInvoice(true)} className="flex-1 px-8 py-5 bg-white border border-outline-variant/20 text-primary rounded-full font-bold uppercase tracking-widest text-xs flex items-center justify-center gap-3 hover:bg-surface-low transition-colors">
            <FileText className="w-4 h-4"/>
            View Invoice
          </button>
          <Link to="/" className="flex-1 px-8 py-5 bg-primary text-white rounded-full font-bold uppercase tracking-widest text-xs shadow-lg hover:opacity-90 transition-opacity flex items-center justify-center">
            Return to Home
          </Link>
        </div>

        <AnimatePresence>
          {showInvoice && completedOrder && (<Invoice order={completedOrder} brandName={storeSettings.brandSettings.name} onClose={() => setShowInvoice(false)}/>)}
        </AnimatePresence>
      </main>);
    }
    return (<main className="pt-20 pb-32 px-4 sm:px-6 max-w-7xl mx-auto min-h-screen">
      {/* Mobile Order Summary Toggle */}
      <div className="lg:hidden mb-6">
        <button onClick={() => setIsSummaryOpen(!isSummaryOpen)} className="w-full bg-surface-low p-4 rounded-2xl flex items-center justify-between border border-outline-variant/10">
          <div className="flex items-center gap-3">
            <ShoppingBag className="w-5 h-5 text-primary"/>
            <span className="text-sm font-bold uppercase tracking-widest">
              {isSummaryOpen ? 'Hide Summary' : 'Show Summary'}
            </span>
            <span className="text-sm font-headline font-bold ml-2">৳{total.toFixed(2)}</span>
          </div>
          {isSummaryOpen ? <ChevronUp className="w-5 h-5"/> : <ChevronDown className="w-5 h-5"/>}
        </button>

        <AnimatePresence>
          {isSummaryOpen && (<motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
              <div className="bg-surface-low/50 p-6 rounded-b-2xl border-x border-b border-outline-variant/10 space-y-4">
                {cartItems.map((item) => (<div key={`${item.id}-${item.selectedSize}`} className="flex gap-4">
                    <div className="w-12 h-16 bg-white rounded-lg overflow-hidden flex-shrink-0">
                      <img className="w-full h-full object-cover" src={item.image} alt={item.name} referrerPolicy="no-referrer"/>
                    </div>
                    <div className="flex-grow">
                      <p className="text-[10px] font-bold uppercase tracking-wider">{item.name}</p>
                      <p className="text-[9px] text-on-surface-variant uppercase">
                        Qty: {item.quantity}
                        {item.selectedSize ? ` / Size: ${item.selectedSize}` : ''}
                        {item.selectedColor ? ` / Color: ${item.selectedColor}` : ''}
                      </p>
                      <p className="font-headline font-bold text-sm">৳{(item.price * item.quantity).toFixed(2)}</p>
                    </div>
                  </div>))}
                <div className="pt-4 border-t border-outline-variant/10 space-y-2">
                  <div className="flex justify-between text-xs text-on-surface-variant">
                    <span>Subtotal</span>
                    <span>৳{subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-xs text-on-surface-variant">
                    <span>Shipping</span>
                    <span>{shippingCost > 0 ? `৳${shippingCost.toFixed(2)}` : 'Free'}</span>
                  </div>
                  {appliedCoupon && (<div className="flex justify-between text-xs text-green-600 font-bold">
                      <span>Discount ({appliedCoupon.discountPercent}%)</span>
                      <span>-৳{discountAmount.toFixed(2)}</span>
                    </div>)}
                </div>
              </div>
            </motion.div>)}
        </AnimatePresence>
      </div>

      <div className="flex items-center gap-4 mb-8 sm:mb-12">
        <Link to="/cart" className="p-2 hover:bg-surface-low rounded-full transition-colors">
          <ChevronLeft className="w-6 h-6"/>
        </Link>
        <h1 className="font-headline text-3xl sm:text-4xl font-extrabold tracking-tight">Checkout</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16">
        {/* Checkout Steps */}
        <div className="lg:col-span-8 space-y-8 lg:space-y-12">
          {/* Step 1: Shipping */}
          <section className="bg-surface-lowest p-6 sm:p-8 rounded-3xl shadow-sm border border-outline-variant/10">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-primary text-white rounded-full flex items-center justify-center font-bold text-sm sm:text-base">1</div>
              <h2 className="text-lg sm:text-xl font-bold uppercase tracking-widest">Contact & Shipping</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
              <div className="md:col-span-2 space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Full Name *</label>
                <input className="w-full bg-surface-low border-none rounded-xl px-4 sm:px-6 py-3 sm:py-4 outline-none focus:ring-1 focus:ring-primary text-sm" placeholder="Enter your full name" value={formData.fullName} onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}/>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">
                  Email Address <span className="font-medium normal-case opacity-50">(Optional)</span>
                </label>
                <input className="w-full bg-surface-low border-none rounded-xl px-4 sm:px-6 py-3 sm:py-4 outline-none focus:ring-1 focus:ring-primary text-sm" placeholder="Enter your email (optional)" type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })}/>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Phone Number *</label>
                <input className="w-full bg-surface-low border-none rounded-xl px-4 sm:px-6 py-3 sm:py-4 outline-none focus:ring-1 focus:ring-primary text-sm" placeholder="017XXXXXXXX" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })}/>
              </div>
              <div className="md:col-span-2 space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Full Address *</label>
                <input className="w-full bg-surface-low border-none rounded-xl px-4 sm:px-6 py-3 sm:py-4 outline-none focus:ring-1 focus:ring-primary text-sm" placeholder="House #, Road #, Area" value={formData.address} onChange={(e) => setFormData({ ...formData, address: e.target.value })}/>
              </div>
              <div className="space-y-2 relative">
                <label className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">
                  City *
                </label>

                <div className="relative">
                  <input
                    type="text"
                    autoComplete="off"
                    className="w-full bg-surface-low border-none rounded-xl px-4 sm:px-6 py-3 sm:py-4 pr-10 outline-none focus:ring-1 focus:ring-primary text-sm"
                    placeholder="Type or select your city"
                    value={formData.city}
                    onFocus={() => setIsCityOpen(true)}
                    onChange={(e) => {
                      setFormData({
                        ...formData,
                        city: e.target.value,
                      });
                      setIsCityOpen(true);
                    }}
                    onBlur={() => {
                      setTimeout(() => {
                        setIsCityOpen(false);
                      }, 150);
                    }}
                    required
                  />

                  <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-variant/50 pointer-events-none" />

                  {isCityOpen && (
                    <div className="absolute left-0 right-0 top-full mt-2 max-h-60 overflow-y-auto rounded-xl border border-outline-variant/20 bg-white shadow-xl z-[80]">
                      {filteredCities.length > 0 ? (
                        filteredCities.map((city) => (
                          <button
                            key={city}
                            type="button"
                            onMouseDown={(e) => e.preventDefault()}
                            onClick={() => {
                              setFormData((previous) => ({
                                ...previous,
                                city,
                              }));
                              setIsCityOpen(false);
                            }}
                            className="block w-full px-4 py-3 text-left text-sm hover:bg-surface-low transition-colors border-b border-outline-variant/10 last:border-b-0"
                          >
                            {city}
                          </button>
                        ))
                      ) : (
                        <div className="px-4 py-3 text-xs text-on-surface-variant">
                          No matching city found. You can still use the city name you typed.
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <p className="text-[9px] text-on-surface-variant/50">
                  Type a city name or choose from the suggestions.
                </p>
              </div>
            </div>
          </section>

          {/* Step 2: Payment */}
          <section className="bg-surface-lowest p-6 sm:p-8 rounded-3xl shadow-sm border border-outline-variant/10">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-surface-low text-primary rounded-full flex items-center justify-center font-bold text-sm sm:text-base">2</div>
              <h2 className="text-lg sm:text-xl font-bold uppercase tracking-widest">Payment Method</h2>
            </div>

            <div className="grid grid-cols-3 gap-3 sm:gap-4 mb-8">
              {PAYMENT_METHODS.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => {
                    setPaymentMethod(p.id);
                    setFormData((previous) => ({
                      ...previous,
                      transactionId: '',
                    }));
                  }}
                  className={cn(
                    'flex flex-col items-center justify-center p-3 sm:p-4 rounded-2xl border transition-all group active:scale-95 h-24 sm:h-28',
                    paymentMethod === p.id
                      ? 'border-primary bg-primary/5'
                      : 'border-outline-variant/30 hover:border-primary',
                  )}
                >
                  <div className="h-11 sm:h-12 w-full flex items-center justify-center mb-2">
                    <img
                      src={p.logo}
                      alt={p.label}
                      className={cn(
                        'max-w-full object-contain',
                        p.id === 'Nagad'
                          ? 'w-16 sm:w-20 h-10 sm:h-11'
                          : 'w-10 h-10',
                      )}
                      referrerPolicy="no-referrer"
                    />
                  </div>

                  <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-widest text-center">
                    {p.label}
                  </span>
                </button>
              ))}
            </div>

            <AnimatePresence mode="wait">
              {['bKash', 'Nagad'].includes(paymentMethod) && (<motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-4 bg-surface-low p-6 rounded-2xl">
                  <p className="text-sm font-medium mb-2">Please send the total amount to: <span className="font-bold text-primary">{paymentMethod === 'bKash' ? storeSettings.paymentSettings.bkashNumber : storeSettings.paymentSettings.nagadNumber}</span></p>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Transaction ID / Last 4 Digit / Reference *</label>
                    <input className="w-full bg-white border-none rounded-xl px-4 py-4 outline-none focus:ring-1 focus:ring-primary text-sm" placeholder="Enter Transaction ID / Last 4 Digit / Reference" value={formData.transactionId} onChange={(e) => setFormData({ ...formData, transactionId: e.target.value })}/>
                  </div>
                </motion.div>)}

              {paymentMethod === 'COD' && (<motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="p-6 bg-surface-low rounded-2xl">
                  <p className="text-sm text-on-surface-variant">Pay with cash upon delivery of your order.</p>
                </motion.div>)}
            </AnimatePresence>
          </section>
        </div>

        {/* Order Summary Sidebar */}
        <div className="lg:col-span-4">
          <div className="bg-surface-low p-6 sm:p-8 rounded-3xl sticky top-24">
            <h2 className="text-xl font-bold mb-8 tracking-tight hidden lg:block">Order Summary</h2>
            <div className="space-y-6 mb-8 hidden lg:block max-h-[300px] overflow-y-auto no-scrollbar">
              {cartItems.map((item) => (<div key={`${item.id}-${item.selectedSize}`} className="flex gap-4">
                  <div className="w-16 h-20 bg-surface-lowest rounded-lg overflow-hidden flex-shrink-0">
                    <img className="w-full h-full object-cover" src={item.image} alt={item.name} referrerPolicy="no-referrer"/>
                  </div>
                  <div className="flex-grow">
                    <p className="text-xs font-bold uppercase tracking-wider">{item.name}</p>
                    <p className="text-[10px] text-on-surface-variant uppercase">
                      Qty: {item.quantity}
                      {item.selectedSize ? ` / Size: ${item.selectedSize}` : ''}
                      {item.selectedColor ? ` / Color: ${item.selectedColor}` : ''}
                    </p>
                    <p className="font-headline font-bold mt-1">৳{(item.price * item.quantity).toFixed(2)}</p>
                  </div>
                </div>))}
            </div>
            <div className="space-y-4 pt-6 lg:border-t border-outline-variant/20 mb-8">
              <div className="flex justify-between text-on-surface-variant text-sm">
                <span>Subtotal</span>
                <span>৳{subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-on-surface-variant text-sm">
                <span>Shipping</span>
                <span>{shippingCost > 0 ? `৳${shippingCost.toFixed(2)}` : 'Free'}</span>
              </div>
              {appliedCoupon && (<div className="flex justify-between text-green-600 text-sm font-bold">
                  <span>Discount ({appliedCoupon.discountPercent}%)</span>
                  <span>-৳{discountAmount.toFixed(2)}</span>
                </div>)}

              <div className="pt-4 space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant block">Shipping Area *</label>
                <div className="grid grid-cols-2 gap-2">
                  <button onClick={() => setShippingArea('Chittagong')} className={cn("py-3 px-2 rounded-xl border text-[9px] font-bold uppercase tracking-widest transition-all", shippingArea === 'Chittagong' ? "border-primary bg-primary/5 text-primary" : "border-outline-variant/30 hover:border-primary")}>
                    Inside CTG (৳{storeSettings.shippingChittagong})
                  </button>
                  <button onClick={() => setShippingArea('Outside')} className={cn("py-3 px-2 rounded-xl border text-[9px] font-bold uppercase tracking-widest transition-all", shippingArea === 'Outside' ? "border-primary bg-primary/5 text-primary" : "border-outline-variant/30 hover:border-primary")}>
                    Outside CTG (৳{storeSettings.shippingOutsideChittagong})
                  </button>
                </div>
              </div>

              <div className="pt-4 space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Coupon Code</label>
                <div className="flex gap-2">
                  <input className="flex-grow bg-white border border-outline-variant/20 rounded-xl px-4 py-2 outline-none focus:ring-1 focus:ring-primary text-xs" placeholder="ENTER CODE" value={couponCode} onChange={(e) => setCouponCode(e.target.value)}/>
                  <button onClick={handleApplyCoupon} className="bg-primary text-white px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest">
                    Apply
                  </button>
                </div>
                {couponError && <p className="text-[10px] text-red-500 font-bold">{couponError}</p>}
                {appliedCoupon && <p className="text-[10px] text-green-600 font-bold">Coupon "{appliedCoupon.code}" applied!</p>}
              </div>

              <div className="flex justify-between items-center pt-4 border-t border-outline-variant/10">
                <span className="text-lg font-bold">Total</span>
                <span className="font-headline text-2xl font-black">৳{total.toFixed(2)}</span>
              </div>
            </div>

            <button onClick={handleCompleteOrder} disabled={isProcessing} className="flex w-full bg-primary text-white py-5 rounded-full font-bold uppercase tracking-[0.2em] shadow-lg hover:shadow-xl transition-all active:scale-95 items-center justify-center gap-3">
              {isProcessing ? "Processing..." : "Complete Order"}
              {isProcessing && <Loader2 className="w-5 h-5 animate-spin"/>}
            </button>
          </div>
        </div>
      </div>
    </main>);
}