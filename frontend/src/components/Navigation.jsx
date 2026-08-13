import { Link, useLocation } from 'react-router-dom';
import {
  Menu,
  ShoppingBag,
  Search,
  Heart,
  Store,
  X,
  ArrowRight,
  Instagram,
  Twitter,
  Facebook,
  Globe,
  Youtube,
  Linkedin,
  MessageCircle,
  Music2,
  Pin,
} from 'lucide-react';
import { cn, getAdminPath } from '@/src/lib/utils';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useCart } from '../context/CartContext';
import { useProducts } from '../context/ProductContext';
const BRAND_NAME = 'SHARUU';

function getSocialIcon(platform) {
  const name = String(platform || '')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '');

  if (name === 'facebook' || name === 'fb') return Facebook;
  if (name === 'instagram' || name === 'ig') return Instagram;

  if (
    name === 'whatsapp' ||
    name === 'wp' ||
    name === 'wa'
  ) {
    return MessageCircle;
  }

  if (name === 'youtube' || name === 'yt') return Youtube;

  if (
    name === 'tiktok' ||
    name === 'tik-tok'
  ) {
    return Music2;
  }

  if (
    name === 'linkedin' ||
    name === 'linked-in'
  ) {
    return Linkedin;
  }

  if (
    name === 'x' ||
    name === 'twitter' ||
    name === 'x/twitter'
  ) {
    return Twitter;
  }

  if (
    name === 'pinterest' ||
    name === 'pin'
  ) {
    return Pin;
  }

  return Globe;
}

function SocialLinks({ links = [], footer = false }) {
  if (!Array.isArray(links) || links.length === 0) {
    return null;
  }

  return (
    <div className={footer ? 'flex flex-wrap gap-3' : 'flex flex-wrap gap-4'}>
      {links.map((social, index) => {
        const Icon = getSocialIcon(social?.platform);
        const platform = social?.platform || 'Social link';
        const url = social?.url || '#';

        return (
          <a
            key={`${platform}-${index}`}
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={platform}
            title={platform}
            className={cn(
              'group flex items-center justify-center rounded-full border transition-all',
              footer
                ? 'w-10 h-10 border-outline-variant/20 text-on-surface-variant hover:text-primary hover:border-primary hover:-translate-y-0.5'
                : 'w-9 h-9 border-outline-variant/20 bg-white text-on-surface-variant hover:text-primary hover:border-primary hover:scale-105',
            )}
          >
            <Icon className={footer ? 'w-4 h-4' : 'w-5 h-5'} />
          </a>
        );
      })}
    </div>
  );
}
export function Navbar() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const { cartCount } = useCart();
    const { storeSettings, categories } = useProducts();
    const location = useLocation();
    const safeCategories = categories || [];
    const socialLinks = storeSettings?.socialLinks || [];
    const categorySubtitles = storeSettings?.categorySubtitles || {};
    const brandSettings = storeSettings?.brandSettings ?? {
        name: 'SHARUU',
        fontFamily: 'font-display',
        color: '#000000'
    };
    // Close menu on route change
    useEffect(() => {
        setIsMenuOpen(false);
    }, [location]);
    // Open menu from mobile bottom Category button
    useEffect(() => {
        const openMainMenu = () => {
            setIsMenuOpen(true);
        };
        window.addEventListener('open-main-menu', openMainMenu);
        return () => {
            window.removeEventListener('open-main-menu', openMainMenu);
        };
    }, []);
    // Prevent scroll when menu is open
    useEffect(() => {
        if (isMenuOpen) {
            document.body.style.overflow = 'hidden';
        }
        else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isMenuOpen]);
    const menuItems = safeCategories.map(category => ({
        label: category,
        path: `/collection?category=${encodeURIComponent(category)}`,
        subtitle: categorySubtitles?.[category] || ''
    }));
    menuItems.push({
        label: 'Track Order',
        path: '/track-order',
        subtitle: 'Check your shipment status'
    });
    return (<>
      <header className="fixed top-0 w-full z-50 glass border-b border-outline-variant/10">
        <div className="flex justify-between items-center px-6 h-16 w-full max-w-7xl mx-auto">
          <div className="flex items-center gap-4">
            <button onClick={() => setIsMenuOpen(true)} className="hover:opacity-70 transition-opacity active:scale-95 p-2 -ml-2" aria-label="Open menu">
              <Menu className="w-6 h-6"/>
            </button>
          </div>

          <Link to="/" className={cn('uppercase tracking-[0.4em] text-2xl font-black hover:opacity-80 transition-all duration-500', brandSettings?.fontFamily || 'font-display')} style={{
            color: brandSettings?.color || 'var(--color-primary)'
        }}>
            {brandSettings?.name || BRAND_NAME}
          </Link>

          <div className="flex items-center gap-2">
            <Link to="/wishlist" className="hidden md:block p-2 hover:opacity-70 transition-opacity active:scale-95 relative" aria-label="Wishlist">
              <Heart className="w-6 h-6"/>
            </Link>

            <Link to="/cart" className="p-2 hover:opacity-70 transition-opacity active:scale-95 relative" aria-label="Cart">
              <ShoppingBag className="w-6 h-6"/>

              {cartCount > 0 && (<span className="absolute top-0 right-0 w-5 h-5 bg-primary text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-white">
                  {cartCount}
                </span>)}
            </Link>
          </div>
        </div>
      </header>

      {/* Side Menu Drawer */}
      <AnimatePresence>
        {isMenuOpen && (<>
            {/* Backdrop */}
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsMenuOpen(false)} className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60]"/>

            {/* Menu Content */}
            <motion.div initial={{ x: '-100%' }} animate={{ x: 0 }} exit={{ x: '-100%' }} transition={{ type: 'spring', damping: 25, stiffness: 200 }} className="fixed top-0 left-0 h-full w-full max-w-md bg-white z-[70] shadow-2xl flex flex-col">
              <div className="flex justify-between items-center p-6 border-b border-outline-variant/10">
                <Link to="/" onClick={() => setIsMenuOpen(false)} className={cn('font-black uppercase tracking-[0.3em] text-lg hover:opacity-70 transition-opacity', brandSettings?.fontFamily || 'font-display')} style={{
                color: brandSettings?.color || 'inherit'
            }}>
                  {brandSettings?.name || BRAND_NAME}
                </Link>

                <button onClick={() => setIsMenuOpen(false)} className="p-2 hover:bg-surface-low rounded-full transition-colors" aria-label="Close menu">
                  <X className="w-6 h-6"/>
                </button>
              </div>

              <nav className="flex-grow overflow-y-auto py-8 px-6">
                <div className="space-y-8">
                  {menuItems.map((item, i) => (<motion.div key={item.label} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }}>
                      <Link to={item.path} className="group block">
                        <div className="flex items-center justify-between">
                          <span className="text-2xl font-headline font-bold uppercase tracking-tight group-hover:text-primary transition-colors">
                            {item.label}
                          </span>

                          <ArrowRight className="w-5 h-5 opacity-0 group-hover:opacity-100 -translate-x-4 group-hover:translate-x-0 transition-all text-primary"/>
                        </div>

                        <p className="text-xs text-on-surface-variant/60 uppercase tracking-widest mt-1 font-medium">
                          {item.subtitle}
                        </p>
                      </Link>
                    </motion.div>))}
                </div>
              </nav>

              <div className="p-8 bg-surface-low flex justify-between items-center">
                <SocialLinks links={socialLinks} />

                <span className="font-display font-black uppercase tracking-[0.2em] text-[10px] text-on-surface-variant/40">
                  {brandSettings?.name || BRAND_NAME} © 2026
                </span>
              </div>
            </motion.div>
          </>)}
      </AnimatePresence>
    </>);
}
export function Footer() {
    const { storeSettings, categories, pages } = useProducts();
    const socialLinks = storeSettings?.socialLinks || [];
    const brandSettings = storeSettings?.brandSettings ?? { name: 'SHARUU', fontFamily: 'font-display', color: '#000000' };
    const description = storeSettings?.generalSettings?.storeDescription || "A curated destination for modern men's fashion.";
    const servicePages = (pages || []).filter(page => page.isPublished !== false).slice(0, 5);
    return (<footer className="w-full pt-24 pb-32 bg-white text-primary flex flex-col items-center px-8 text-center relative border-t border-outline-variant/10">
      <div className="relative z-10 w-full max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-x-8 gap-y-16 text-left mb-20">
        <div className="col-span-2 md:col-span-2 space-y-10">
          <div className={cn('font-black text-4xl md:text-5xl uppercase tracking-[0.35em] md:tracking-[0.5em] leading-none mb-4', brandSettings.fontFamily || 'font-display')} style={{ color: brandSettings.color || 'inherit' }}>
            {brandSettings?.name || BRAND_NAME}
          </div>
          <p className="text-on-surface-variant/70 text-sm max-w-sm font-medium leading-relaxed tracking-tight">{description}</p>
          <SocialLinks links={socialLinks} footer />
        </div>
        <div className="space-y-8">
          <h4 className="text-[10px] font-bold uppercase tracking-[0.3em] md:tracking-[0.4em] text-primary/40">The Collection</h4>
          <nav className="flex flex-col gap-5">
            <Link to="/track-order" className="text-[10px] sm:text-xs text-primary hover:text-primary/60 transition-colors font-bold uppercase tracking-widest underline decoration-primary/20 underline-offset-4">Track Order</Link>
            {(categories || []).slice(0, 6).map((category) => <Link key={category} to={`/collection?category=${encodeURIComponent(category)}`} className="text-[10px] sm:text-xs text-on-surface-variant hover:text-primary transition-colors font-bold uppercase tracking-widest">{category}</Link>)}
          </nav>
        </div>
        <div className="space-y-8">
          <h4 className="text-[10px] font-bold uppercase tracking-[0.3em] md:tracking-[0.4em] text-primary/40">Client Services</h4>
          <nav className="flex flex-col gap-5">
            {servicePages.map(page => <Link key={page.id} to={`/pages/${page.slug}`} className="text-[10px] sm:text-xs text-on-surface-variant hover:text-primary transition-colors font-bold uppercase tracking-widest">{page.title}</Link>)}
            <Link to="/contact" className="text-[10px] sm:text-xs text-on-surface-variant hover:text-primary transition-colors font-bold uppercase tracking-widest">Contact Us</Link>
          </nav>
        </div>
      </div>
      <div className="relative z-10 w-full max-w-7xl mx-auto pt-16 border-t border-outline-variant/10 flex flex-col md:flex-row justify-between items-center gap-8">
        <p className={cn('text-[9px] tracking-[0.4em] uppercase font-black', brandSettings.fontFamily || 'font-display')}>© {new Date().getFullYear()} {brandSettings?.name || BRAND_NAME}. CURATED ELEGANCE.</p>
      </div>
    </footer>);
}
export function MobileNav() {
    const location = useLocation();
    const { cartCount } = useCart();
    const adminPath = getAdminPath(location.pathname);
    const isAdmin = location.pathname.startsWith(`/${adminPath}`);
    if (isAdmin)
        return null;
    const navItems = [
        { icon: Store, label: 'Shop', path: '/' },
        { icon: Menu, label: 'Category', path: '#', isMenu: true },
        { icon: Search, label: 'Search', path: '/collection' },
        { icon: ShoppingBag, label: 'Cart', path: '/cart' }
    ];
    return (<nav className="md:hidden fixed bottom-0 left-0 w-full h-20 bg-surface-lowest/85 backdrop-blur-2xl flex justify-around items-center px-4 pb-safe z-50 border-t border-outline-variant/10 shadow-[0_-4px_24px_rgba(0,0,0,0.04)] rounded-t-2xl">
      {navItems.map(item => {
            const Icon = item.icon;
            const isActive = !('isMenu' in item) && location.pathname === item.path;
            if ('isMenu' in item && item.isMenu) {
                return (<button key={item.label} type="button" onClick={() => window.dispatchEvent(new CustomEvent('open-main-menu'))} className="flex flex-col items-center justify-center transition-all active:translate-y-[-2px] relative text-on-surface-variant/60" aria-label="Open category menu">
              <Icon className="w-6 h-6"/>

              <span className="text-[10px] uppercase tracking-widest font-medium mt-1">
                {item.label}
              </span>
            </button>);
            }
            return (<Link key={item.label} to={item.path} className={cn('flex flex-col items-center justify-center transition-all active:translate-y-[-2px] relative', isActive ? 'text-primary' : 'text-on-surface-variant/60')}>
            <Icon className={cn('w-6 h-6', isActive && 'fill-current')}/>

            {item.label === 'Cart' && cartCount > 0 && (<span className="absolute top-[-4px] right-[10px] w-5 h-5 bg-primary text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-white">
                {cartCount}
              </span>)}

            <span className="text-[10px] uppercase tracking-widest font-medium mt-1">
              {item.label}
            </span>
          </Link>);
        })}
    </nav>);
}