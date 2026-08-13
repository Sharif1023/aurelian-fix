import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Search, ShoppingCart, Star, Check, Heart } from 'lucide-react';
import { Link, useSearchParams } from 'react-router-dom';
import { useProducts } from '../../context/ProductContext';
import { useCart } from '../../context/CartContext';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '@/src/lib/utils';
export default function Collection() {
    const { products, wishlist, toggleWishlist } = useProducts();
    const { addToCart } = useCart();
    const [searchParams, setSearchParams] = useSearchParams();
    const categoryParam = searchParams.get('category') || 'All';
    const [activeCategory, setActiveCategory] = useState(categoryParam);
    const [hoveredCategory, setHoveredCategory] = useState(null);
    const [activeSubCategory, setActiveSubCategory] = useState('All');
    const [searchQuery, setSearchQuery] = useState('');
    const [addedToCart, setAddedToCart] = useState(null);
    const [dropdownLeft, setDropdownLeft] = useState(0);
    const navRef = useRef(null);
    const categoryRefs = useRef({});
    useEffect(() => {
        setActiveCategory(categoryParam);
        setActiveSubCategory('All');
    }, [categoryParam]);
    const handleCategoryChange = (cat) => {
        setActiveCategory(cat);
        setActiveSubCategory('All');
        const nextParams = new URLSearchParams(searchParams);
        if (cat === 'All') {
            nextParams.delete('category');
        }
        else {
            nextParams.set('category', cat);
        }
        setSearchParams(nextParams);
    };
    const categories = useMemo(() => {
        const cats = Array.from(new Set(products.map((p) => p.category)));
        return ['All', ...cats];
    }, [products]);
    const getSubCategoriesByCategory = (category) => {
        if (!category || category === 'All')
            return [];
        return Array.from(new Set(products
            .filter((p) => p.category === category && p.subCategory)
            .map((p) => p.subCategory)));
    };
    const hoveredSubCategories = useMemo(() => {
        if (!hoveredCategory)
            return [];
        return getSubCategoriesByCategory(hoveredCategory);
    }, [hoveredCategory, products]);
    const filteredProducts = useMemo(() => {
        let result = products.filter((product) => {
            const matchesCategory = activeCategory === 'All' || product.category === activeCategory;
            const matchesSubCategory = activeSubCategory === 'All' || product.subCategory === activeSubCategory;
            const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                product.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
                (product.subCategory || '').toLowerCase().includes(searchQuery.toLowerCase());
            return matchesCategory && matchesSubCategory && matchesSearch;
        });
        return result;
    }, [activeCategory, activeSubCategory, searchQuery, products]);
    const handleQuickAdd = (e, product) => {
        e.preventDefault();
        e.stopPropagation();
        setAddedToCart(product.id);
        setTimeout(() => setAddedToCart(null), 2000);
        addToCart(product, 1);
    };
    const handleSubCategorySelect = (category, subCategory) => {
        setActiveCategory(category);
        setActiveSubCategory(subCategory);
        const nextParams = new URLSearchParams(searchParams);
        if (category === 'All') {
            nextParams.delete('category');
        }
        else {
            nextParams.set('category', category);
        }
        setSearchParams(nextParams);
        setHoveredCategory(null);
    };
    const updateDropdownPosition = (cat) => {
        const navEl = navRef.current;
        const catEl = categoryRefs.current[cat];
        if (!navEl || !catEl)
            return;
        const navRect = navEl.getBoundingClientRect();
        const catRect = catEl.getBoundingClientRect();
        setDropdownLeft(catRect.left - navRect.left);
    };
    return (<main className="pt-24 pb-32 max-w-7xl mx-auto px-4 sm:px-6">
      {/* Sticky Category Bar - direct child of main so it stays sticky for the whole product list */}
      <div
        className="sticky top-16 z-50 bg-white/95 backdrop-blur-md border-b border-outline-variant/10 -mx-4 px-4 sm:-mx-6 sm:px-6 mb-6"
        onMouseLeave={() => setHoveredCategory(null)}
      >
        <div ref={navRef} className="relative max-w-7xl mx-auto">
          <nav className="flex gap-2 overflow-x-auto no-scrollbar py-3">
            {categories.map((cat) => (
              <div
                key={cat}
                ref={(el) => {
                  categoryRefs.current[cat] = el;
                }}
                className="shrink-0"
                onMouseEnter={() => {
                  setHoveredCategory(cat);
                  updateDropdownPosition(cat);
                }}
              >
                <button
                  onClick={() => handleCategoryChange(cat)}
                  className={cn(
                    "whitespace-nowrap px-4 sm:px-6 py-2 text-sm font-medium transition-colors",
                    activeCategory === cat
                      ? "text-[#c89b6d]"
                      : "text-black hover:text-[#c89b6d]",
                  )}
                >
                  {cat}
                </button>
              </div>
            ))}
          </nav>

          {/* Subcategory dropdown */}
          <AnimatePresence>
            {hoveredCategory && hoveredSubCategories.length > 0 && (
              <motion.div
                key={hoveredCategory}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 4 }}
                transition={{ duration: 0.18 }}
                style={{ left: dropdownLeft }}
                className="absolute top-full z-[60] min-w-[170px] max-w-[210px] overflow-hidden rounded-md border border-gray-200 bg-white shadow-lg"
              >
                {hoveredSubCategories.map((sub) => (
                  <button
                    key={sub}
                    onClick={() =>
                      handleSubCategorySelect(hoveredCategory, sub)
                    }
                    className="block w-full border-b border-gray-200 px-4 py-2 text-left text-sm text-black hover:bg-gray-50 last:border-b-0"
                  >
                    {sub}
                  </button>
                ))}

                <button
                  onClick={() =>
                    handleSubCategorySelect(hoveredCategory, 'All')
                  }
                  className="block w-full px-4 py-2 text-left text-sm font-medium text-[#c89b6d] hover:bg-gray-50"
                >
                  View All
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Search Box */}
      <section className="mb-8">
        <div className="relative group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant/60 w-5 h-5"/>
          <input
            className="w-full bg-surface-low border-none rounded-xl py-4 pl-12 pr-4 focus:ring-1 focus:ring-outline-variant/20 transition-all placeholder:text-on-surface-variant/40 outline-none"
            placeholder="Search our archives..."
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </section>

      {/* Product Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-10">
        <AnimatePresence mode="popLayout">
          {filteredProducts.map((product, i) => (<motion.article key={product.id} layout initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} transition={{ duration: 0.3, delay: i * 0.02 }} className="group relative">
              <Link to={`/product/${product.id}`}>
                <div className="aspect-[4/5] overflow-hidden rounded-xl bg-surface-low mb-4 relative">
                  <img className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" src={product.image} alt={product.name} referrerPolicy="no-referrer"/>

                  <button onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                toggleWishlist(product.id);
            }} className={cn("absolute top-4 left-4 p-2 rounded-full transition-all shadow-lg active:scale-90 z-10", wishlist.includes(product.id)
                ? "bg-white text-red-500 opacity-100"
                : "bg-surface-lowest/80 backdrop-blur-md text-primary opacity-0 group-hover:opacity-100")}>
                    <Heart className={cn("w-5 h-5", wishlist.includes(product.id) && "fill-current")}/>
                  </button>

                  <button onClick={(e) => handleQuickAdd(e, product)} className={cn("absolute top-4 right-4 p-2 rounded-full transition-all shadow-lg active:scale-90 z-10", addedToCart === product.id
                ? "bg-green-500 text-white opacity-100"
                : "bg-surface-lowest/80 backdrop-blur-md text-primary opacity-0 group-hover:opacity-100")}>
                    {addedToCart === product.id ? (<Check className="w-5 h-5"/>) : (<ShoppingCart className="w-5 h-5"/>)}
                  </button>
                </div>

                <div className="space-y-1">
                  <p className="text-[10px] uppercase tracking-widest text-on-surface-variant/60 font-medium">
                    {product.category}
                    {product.subCategory ? ` • ${product.subCategory}` : ''}
                  </p>

                  <h3 className="text-base font-medium text-on-surface">
                    {product.name}
                  </h3>

                  <div className="flex items-center gap-2 mt-1">
                    <span className="font-headline text-lg font-bold text-primary">
                      ৳{product.price}
                    </span>
                    {product.originalPrice && (<span className="text-sm text-on-surface-variant/40 line-through">
                        ৳{product.originalPrice}
                      </span>)}
                  </div>

                  <div className="flex items-center gap-0.5 text-secondary">
                    {[...Array(5)].map((_, i) => (<Star key={i} className={cn("w-3 h-3", i < Math.floor(product.rating)
                    ? "fill-current"
                    : "text-on-surface-variant/20")}/>))}
                  </div>
                </div>
              </Link>
            </motion.article>))}
        </AnimatePresence>
      </div>

      {filteredProducts.length === 0 && (<div className="py-32 text-center">
          <p className="text-on-surface-variant font-light italic">
            No pieces found matching your criteria.
          </p>
          <button onClick={() => {
                setActiveCategory('All');
                setActiveSubCategory('All');
                setSearchQuery('');
                const nextParams = new URLSearchParams(searchParams);
                nextParams.delete('category');
                setSearchParams(nextParams);
            }} className="mt-4 text-primary font-bold uppercase tracking-widest text-xs underline underline-offset-4">
            Clear all filters
          </button>
        </div>)}
    </main>);
}