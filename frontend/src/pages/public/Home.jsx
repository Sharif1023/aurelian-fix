import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import { useProducts } from '../../context/ProductContext';
import { useCart } from '../../context/CartContext';
import { ShoppingCart, Star, ArrowRight, Play, Heart, Check, } from 'lucide-react';
import { cn } from '@/src/lib/utils';
export default function Home() {
    const { products, homeSettings, wishlist, toggleWishlist } = useProducts();
    const { addToCart } = useCart();
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isTransitioning, setIsTransitioning] = useState(true);
    const [addingProductId, setAddingProductId] = useState(null);
    const featuredProducts = products.filter((p) =>
        homeSettings.featuredCollection.productIds.includes(p.id)
    );
    const bestSellers = products.filter((p) => homeSettings.bestSellerIds.includes(p.id));
    const handleAddToCart = (product) => {
        const availableSize = product?.sizes?.find((size) => typeof size === 'object' ? size.isAvailable !== false : true);
        const defaultSize = typeof availableSize === 'string'
            ? availableSize
            : availableSize?.size || product?.sizes?.[0]?.size || product?.sizes?.[0] || '';
        const defaultColor = product?.colors?.[0]?.name ||
            product?.colors?.[0]?.color ||
            product?.colors?.[0] ||
            'Default';
        setAddingProductId(product.id);
        addToCart(product, 1, defaultSize, defaultColor);
        setTimeout(() => {
            setAddingProductId((prev) => (prev === product.id ? null : prev));
        }, 1500);
    };
    useEffect(() => {
        if (!homeSettings.featuredCollection.show || featuredProducts.length === 0) {
            return;
        }

        const interval = setInterval(() => {
            setIsTransitioning(true);
            setCurrentIndex((prev) => prev + 1);
        }, 3000);

        return () => clearInterval(interval);
    }, [featuredProducts.length, homeSettings.featuredCollection.show]);

    useEffect(() => {
        if (
            currentIndex >= featuredProducts.length &&
            featuredProducts.length > 0
        ) {
            const timer = setTimeout(() => {
                setIsTransitioning(false);
                setCurrentIndex(0);
            }, 800);

            return () => clearTimeout(timer);
        }
    }, [currentIndex, featuredProducts.length]);

    const itemsToShow =
        typeof window !== 'undefined' && window.innerWidth < 768 ? 2 : 3;

    const displayProducts = [
        ...featuredProducts,
        ...featuredProducts.slice(0, itemsToShow),
    ];

    return (<div className="bg-[#fdfdfb]">
      {/* Hero Section - Editorial Style */}
      <section className="relative h-screen w-full overflow-hidden flex items-center pt-16">
        <motion.div initial={{ scale: 1.1, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 1.5, ease: 'easeOut' }} className="absolute inset-0">
          <img className="w-full h-full object-cover" src={homeSettings.heroImage} alt="Hero" referrerPolicy="no-referrer"/>
          <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/20 to-transparent"/>
        </motion.div>

        <div className="relative z-10 max-w-7xl mx-auto px-6 w-full">
          <div className="max-w-2xl">
            <motion.span initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5 }} className="inline-block text-white/70 text-[10px] font-bold uppercase tracking-[0.4em] mb-6">
              {homeSettings.heroBadge}
            </motion.span>

            <motion.h1 initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7, duration: 0.8 }} className="font-headline text-6xl md:text-8xl font-black text-white tracking-tight leading-[0.9] mb-8">
              {homeSettings.heroTitle.split('\n').map((line, i) => (<React.Fragment key={i}>
                  {line}
                  {i === 0 && <br />}
                </React.Fragment>))}
            </motion.h1>

            <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.9 }} className="text-white/80 text-lg md:text-xl max-w-lg mb-12 font-light leading-relaxed">
              {homeSettings.heroSubtitle}
            </motion.p>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.1 }} className="flex flex-wrap gap-6">
              <Link to="/collection" className="group bg-white text-black px-10 py-5 rounded-full font-headline font-bold text-xs tracking-[0.2em] hover:bg-primary hover:text-white transition-all duration-500 flex items-center gap-3 shadow-2xl shadow-black/20">
                EXPLORE COLLECTION
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform"/>
              </Link>

              <a href={homeSettings.heroVideoUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-4 text-white group">
                <div className="w-12 h-12 rounded-full border border-white/30 flex items-center justify-center group-hover:bg-white group-hover:text-black transition-all">
                  <Play className="w-4 h-4 fill-current"/>
                </div>
                <span className="text-[10px] font-bold uppercase tracking-widest">
                  Watch Film
                </span>
              </a>
            </motion.div>
          </div>
        </div>
      </section>

      {/* =========================================
    FEATURED CATEGORIES - CURATED EDITS
========================================= */}

<section className="py-12 md:py-16 bg-surface-low/30">

  {/* Heading */}
  <div className="max-w-7xl mx-auto px-4 md:px-6 text-center mb-8 md:mb-12">

    <h2 className="font-headline text-3xl md:text-4xl font-black mb-3 md:mb-4">
      {homeSettings.curatedEdits?.title}
    </h2>

    <p className="text-sm md:text-base text-on-surface-variant font-light">
      Explore our seasonal highlights and essential silhouettes.
    </p>

  </div>


  {/* Categories */}
  <div
    className="
      max-w-7xl
      mx-auto
      px-4
      md:px-6

      flex
      flex-wrap
      justify-center
      items-start

      gap-x-3
      gap-y-6

      lg:gap-x-6
      lg:gap-y-8
    "
  >

    {homeSettings.curatedEdits?.items?.map((cat, i) => (

      <motion.div
        key={cat.id || i}

        initial={{
          opacity: 0,
          y: 20,
        }}

        whileInView={{
          opacity: 1,
          y: 0,
        }}

        transition={{
          duration: 0.5,
          delay: i * 0.08,
        }}

        viewport={{
          once: true,
          amount: 0.2,
        }}

        className="
          w-[calc(25%_-_9px)]
          lg:w-[calc(16.666667%_-_20px)]
          min-w-0
        "
      >

        <Link
          to={cat.link || '/collection'}
          className="flex flex-col items-center group"
        >

          {/* Circular Image */}
          <div
            className="
              relative
              w-full
              aspect-square
              rounded-full
              overflow-hidden

              mb-3
              md:mb-4

              ring-1
              ring-outline-variant/10

              group-hover:ring-primary

              transition-all
              duration-700
            "
          >

            {cat.image ? (

              <img
                src={cat.image}
                alt={cat.title || ''}
                referrerPolicy="no-referrer"

                className="
                  w-full
                  h-full
                  object-cover

                  group-hover:scale-110

                  transition-transform
                  duration-1000
                "
              />

            ) : (

              <div
                className="
                  w-full
                  h-full
                  bg-surface-low
                  flex
                  items-center
                  justify-center

                  text-[8px]
                  text-on-surface-variant/40
                  uppercase
                  tracking-widest
                "
              >
                No Image
              </div>

            )}


            {/* Hover Overlay */}
            <div
              className="
                absolute
                inset-0

                bg-black/0
                group-hover:bg-black/20

                transition-colors
                duration-500

                pointer-events-none
              "
            />

          </div>


          {/* Category Name */}
          <span
            className="
              w-full

              font-headline
              font-bold
              uppercase
              text-center

              text-[7px]
              sm:text-[8px]
              md:text-[9px]
              lg:text-[10px]

              tracking-[0.06em]
              md:tracking-[0.14em]
              lg:tracking-[0.18em]

              leading-tight

              text-on-surface

              group-hover:text-primary

              transition-colors
              duration-300

              line-clamp-2
            "
          >
            {cat.title}
          </span>

        </Link>

      </motion.div>

    ))}

  </div>

</section>

      {/* Featured Collection */}
      {homeSettings.featuredCollection.show && featuredProducts.length > 0 && (
        <section className="py-12 md:py-16 bg-white overflow-hidden">
          <div className="max-w-7xl mx-auto px-6 mb-8 md:mb-12">
            {homeSettings.featuredCollection.subtitle && (
              <span className="text-primary text-[10px] font-bold uppercase tracking-[0.4em] mb-4 block">
                {homeSettings.featuredCollection.subtitle}
              </span>
            )}

            <div className="flex items-end justify-between gap-4">
              <h2 className="font-headline text-4xl md:text-5xl font-black tracking-tight uppercase">
                {homeSettings.featuredCollection.title || 'Featured Collection'}
              </h2>

              <Link
                to="/collection"
                className="group hidden sm:flex items-center gap-2 text-[10px] md:text-xs font-bold tracking-[0.18em] uppercase hover:text-primary transition-colors"
              >
                View All
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>

          <div className="relative max-w-7xl mx-auto px-4 md:px-6">
            <div className="overflow-hidden">
              <motion.div
                className="flex gap-4 md:gap-8"
                animate={{
                  x: `-${currentIndex * (100 / itemsToShow)}%`,
                }}
                transition={
                  isTransitioning
                    ? { duration: 0.8, ease: 'easeInOut' }
                    : { duration: 0 }
                }
              >
                {displayProducts.map((product, i) => (
                  <div
                    key={`${product.id}-${i}`}
                    className="min-w-[calc(50%-8px)] md:min-w-[calc(33.333%-21.333px)] group"
                  >
                    <Link to={`/product/${product.id}`} className="block">
                      <div className="relative aspect-[4/5] rounded-2xl overflow-hidden bg-surface-low mb-4 shadow-sm">
                        <img
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                          src={product.image}
                          alt={product.name}
                          referrerPolicy="no-referrer"
                        />

                        <div className="absolute top-3 left-3">
                          <span className="bg-white/90 backdrop-blur-md px-3 py-1 text-[8px] font-bold tracking-widest uppercase rounded-full shadow-sm">
                            New
                          </span>
                        </div>
                      </div>

                      <div className="space-y-1">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant/60">
                          {product.category}
                        </p>

                        <h3 className="text-sm font-bold uppercase tracking-tight line-clamp-1">
                          {product.name}
                        </h3>

                        <div className="flex items-center gap-2">
                          <p className="font-headline font-bold text-primary">
                            ৳{Number(product.price || 0).toFixed(2)}
                          </p>

                          {Number(product.originalPrice || 0) >
                            Number(product.price || 0) && (
                            <span className="text-xs text-on-surface-variant/40 line-through">
                              ৳{Number(product.originalPrice).toFixed(2)}
                            </span>
                          )}
                        </div>
                      </div>
                    </Link>
                  </div>
                ))}
              </motion.div>
            </div>
          </div>
        </section>
      )}

      {/* Best Sellers - Smart Product Grid */}
      <section className="py-12 md:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-end justify-between gap-4 mb-8 md:mb-12">
            <div>
              <span className="text-primary text-[9px] md:text-[10px] font-bold uppercase tracking-[0.35em] mb-3 block">
                Most Loved
              </span>

              <h2 className="font-headline text-3xl sm:text-4xl md:text-5xl font-black tracking-tight uppercase">
                BEST SELLERS
              </h2>

              <p className="mt-3 text-xs sm:text-sm text-on-surface-variant/70 max-w-md">
                The pieces our customers keep coming back for.
              </p>
            </div>

            <Link
              to="/collection"
              className="group shrink-0 flex items-center gap-2 text-[10px] md:text-xs font-bold tracking-[0.18em] uppercase hover:text-primary transition-colors"
            >
              View All
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-3 gap-y-8 sm:gap-x-5 md:gap-x-6 md:gap-y-12">
            {bestSellers.map((product, i) => {
              const hasDiscount =
                Number(product.originalPrice || 0) > Number(product.price || 0);

              const discountPercent =
                hasDiscount && Number(product.originalPrice) > 0
                  ? Math.round(
                      ((Number(product.originalPrice) - Number(product.price)) /
                        Number(product.originalPrice)) *
                        100,
                    )
                  : Number(product.discount || 0);

              return (
                <motion.article
                  key={product.id}
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{
                    duration: 0.5,
                    delay: i * 0.06,
                  }}
                  viewport={{ once: true, margin: '-40px' }}
                  className="group"
                >
                  <Link to={`/product/${product.id}`} className="block">
                    <div className="relative aspect-[4/5] rounded-xl md:rounded-2xl overflow-hidden bg-surface-low">
                      <img
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                        src={product.image}
                        alt={product.name}
                        referrerPolicy="no-referrer"
                      />

                      <div className="absolute top-2 left-2 md:top-3 md:left-3 flex flex-col gap-2">
                        <span className="bg-black/80 text-white backdrop-blur px-2.5 py-1 rounded-full text-[7px] md:text-[8px] font-bold uppercase tracking-[0.16em]">
                          Best Seller
                        </span>

                        {discountPercent > 0 && (
                          <span className="w-fit bg-red-500 text-white px-2.5 py-1 rounded-full text-[7px] md:text-[8px] font-bold uppercase tracking-wider">
                            {discountPercent}% Off
                          </span>
                        )}
                      </div>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          toggleWishlist(product.id);
                        }}
                        className={cn(
                          'absolute top-2 right-2 md:top-3 md:right-3 w-9 h-9 md:w-10 md:h-10 rounded-full flex items-center justify-center shadow-md backdrop-blur-md transition-all z-20',
                          wishlist.includes(product.id)
                            ? 'bg-white text-red-500'
                            : 'bg-white/90 text-primary hover:scale-105',
                        )}
                        aria-label="Toggle wishlist"
                      >
                        <Heart
                          className={cn(
                            'w-4 h-4 md:w-5 md:h-5',
                            wishlist.includes(product.id) && 'fill-current',
                          )}
                        />
                      </button>

                      <button
                        type="button"
                        disabled={addingProductId === product.id}
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handleAddToCart(product);
                        }}
                        className={cn(
                          'absolute bottom-2 right-2 md:bottom-3 md:right-3 w-10 h-10 md:w-11 md:h-11 rounded-full flex items-center justify-center shadow-lg transition-all z-20',
                          addingProductId === product.id
                            ? 'bg-green-600 text-white'
                            : 'bg-white text-primary hover:bg-primary hover:text-white',
                        )}
                        aria-label="Add to cart"
                      >
                        {addingProductId === product.id ? (
                          <Check className="w-4 h-4 md:w-5 md:h-5" />
                        ) : (
                          <ShoppingCart className="w-4 h-4 md:w-5 md:h-5" />
                        )}
                      </button>
                    </div>

                    <div className="pt-3 md:pt-4">
                      <p className="text-[8px] md:text-[9px] uppercase tracking-[0.18em] text-on-surface-variant/50 font-bold mb-1">
                        {product.category}
                        {product.subCategory ? ` • ${product.subCategory}` : ''}
                      </p>

                      <h3 className="text-xs md:text-sm font-bold uppercase tracking-tight line-clamp-1 group-hover:text-primary transition-colors">
                        {product.name}
                      </h3>

                      <div className="mt-2 flex flex-wrap items-center gap-2">
                        <span className="font-headline text-sm md:text-base font-black text-primary">
                          ৳{Number(product.price || 0).toFixed(2)}
                        </span>

                        {hasDiscount && (
                          <span className="text-[10px] md:text-xs text-on-surface-variant/40 line-through">
                            ৳{Number(product.originalPrice || 0).toFixed(2)}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-1 mt-2">
                        <div className="flex text-secondary">
                          {[...Array(5)].map((_, starIndex) => (
                            <Star
                              key={starIndex}
                              className={cn(
                                'w-2.5 h-2.5 md:w-3 md:h-3',
                                starIndex < Math.floor(Number(product.rating || 5))
                                  ? 'fill-current'
                                  : 'opacity-20',
                              )}
                            />
                          ))}
                        </div>

                        {product.reviews != null && (
                          <span className="text-[8px] md:text-[9px] text-on-surface-variant/50">
                            ({product.reviews})
                          </span>
                        )}
                      </div>
                    </div>
                  </Link>
                </motion.article>
              );
            })}
          </div>
        </div>
      </section>

     {/* Actor / Model Showcase */}
<section className="py-16 md:py-24 bg-[#fdfdfb] overflow-hidden">

  <div className="max-w-7xl mx-auto px-6 mb-10 md:mb-16">

    <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">

      <div>

        <span className="text-primary text-[10px] font-bold uppercase tracking-[0.4em] mb-4 block">
          Worn By Them
        </span>

        <h2 className="font-headline text-4xl md:text-6xl font-black tracking-tight uppercase leading-none">
          Styled In <br className="hidden md:block"/>
          Sharuu.
        </h2>

      </div>


      <p className="text-on-surface-variant font-light max-w-md text-sm md:text-base leading-relaxed">
        Our pieces, brought to life by familiar faces.
        Discover how actors and models wear and style their favourite
        <span className="font-bold text-primary"> Sharuu </span>
        looks.
      </p>

    </div>

  </div>


  <div className="max-w-[1600px] mx-auto px-4 md:px-6">

    <div className="grid grid-cols-2 gap-3 sm:gap-4 md:gap-6">

      {homeSettings.socialGallery.map((src, i) => (

        <motion.div
          key={i}

          initial={{
            opacity: 0,
            y: 24,
            scale: 0.98,
          }}

          whileInView={{
            opacity: 1,
            y: 0,
            scale: 1,
          }}

          transition={{
            delay: i * 0.06,
            duration: 0.55,
          }}

          viewport={{
            once: true,
            margin: '-60px',
          }}

          className="group relative aspect-[4/5] overflow-hidden rounded-2xl md:rounded-[2rem] bg-surface-low shadow-lg shadow-black/5"
        >

          <img
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            src={src}
            alt={`Sharuu celebrity style ${i + 1}`}
            referrerPolicy="no-referrer"
          />


          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-40 group-hover:opacity-65 transition-opacity" />


          <div className="absolute left-3 right-3 bottom-3 md:left-5 md:right-5 md:bottom-5">

            <div className="bg-white/90 backdrop-blur-md rounded-xl md:rounded-2xl px-3 py-2.5 md:px-4 md:py-3 translate-y-3 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">

              <p className="text-[7px] md:text-[9px] font-bold uppercase tracking-[0.2em] text-primary">
                Seen In Sharuu
              </p>

              <p className="text-[10px] md:text-sm font-black uppercase tracking-tight text-black mt-1">
                Featured Look
              </p>

            </div>

          </div>

        </motion.div>

      ))}

    </div>

  </div>

</section>
    </div>);
}