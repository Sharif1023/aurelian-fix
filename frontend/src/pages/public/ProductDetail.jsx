import {
  useParams,
  Link,
  useNavigate,
} from 'react-router-dom';

import {
  useProducts,
} from '../../context/ProductContext';

import {
  useCart,
} from '../../context/CartContext';

import {
  ShoppingBag,
  Heart,
  ChevronDown,
  Plus,
  Check,
} from 'lucide-react';

import {
  useEffect,
  useMemo,
  useState,
} from 'react';

import {
  cn,
} from '@/src/lib/utils';

import Markdown from 'react-markdown';


export default function ProductDetail() {
  const {
    id,
  } = useParams();

  const navigate =
    useNavigate();

  const {
    products,
    wishlist,
    toggleWishlist,
    storeSettings,
  } = useProducts();

  const {
    addToCart,
  } = useCart();


  /* =========================================
     PRODUCT
  ========================================= */

  const product =
    products.find(
      (item) =>
        String(item.id) ===
        String(id),
    );

  const fallbackProduct =
    !product &&
    products.length > 0
      ? products[0]
      : null;

  const activeProduct =
    product ||
    fallbackProduct;

  const productAny =
    activeProduct;


  /* =========================================
     STATE
  ========================================= */

  const [
    selectedSize,
    setSelectedSize,
  ] = useState('');

  const [
    selectedColor,
    setSelectedColor,
  ] = useState(
    'Default',
  );

  const [
    mainImage,
    setMainImage,
  ] = useState('');

  const [
    zoomStyle,
    setZoomStyle,
  ] = useState({
    display:
      'none',

    transformOrigin:
      '0% 0%',
  });

  const [
    isAdding,
    setIsAdding,
  ] = useState(false);

  const [
    isBuying,
    setIsBuying,
  ] = useState(false);


  /* =========================================
     DISCOUNT
  ========================================= */

  const hasDiscount =
    Number(
      activeProduct
        ?.discount ||
        0,
    ) > 0 &&
    Number(
      activeProduct
        ?.originalPrice ||
        0,
    ) >
      Number(
        activeProduct
          ?.price ||
          0,
      );


  /* =========================================
     SIZE SECTION
  ========================================= */

  const showSizeSection =
    productAny
      ?.showSizeSection ??
    true;


  /* =========================================
     GALLERY
  ========================================= */

  const galleryImages =
    useMemo(
      () => {
        if (
          !activeProduct
        ) {
          return [];
        }

        const allImages =
          [
            activeProduct.image,

            ...(
              productAny
                ?.extraImages ||
              []
            ),

            ...(
              productAny
                ?.images ||
              []
            ),
          ];

        return Array.from(
          new Set(
            allImages
              .filter(
                Boolean,
              )
              .map(
                (
                  image,
                ) =>
                  String(
                    image,
                  ).trim(),
              )
              .filter(
                Boolean,
              ),
          ),
        );
      },
      [
        activeProduct?.id,
        activeProduct?.image,
        productAny?.extraImages,
        productAny?.images,
      ],
    );


  /* =========================================
     COLORS
  ========================================= */

  const productColors =
    Array.isArray(
      productAny?.colors,
    )
      ? productAny.colors
      : [];


  const getColorName = (
    colorItem,
    index = 0,
  ) => {
    if (
      typeof colorItem ===
      'string'
    ) {
      return colorItem;
    }

    return (
      colorItem?.name ||
      colorItem?.label ||
      colorItem?.color ||
      `Color ${
        index + 1
      }`
    );
  };


  const getColorValue = (
    colorItem,
  ) => {
    if (
      typeof colorItem ===
      'string'
    ) {
      return colorItem;
    }

    return (
      colorItem
        ?.hexColor ||
      colorItem?.color ||
      '#111827'
    );
  };


  /* =========================================
     COLOR WISE SIZE DATA
  ========================================= */

  const hasColorWiseSizeData =
    productColors.some(
      (
        colorItem,
      ) =>
        typeof colorItem ===
          'object' &&
        Array.isArray(
          colorItem
            ?.sizes,
        ) &&
        colorItem.sizes
          .length > 0,
    );


  const selectedColorData =
    productColors.find(
      (
        colorItem,
        index,
      ) =>
        getColorName(
          colorItem,
          index,
        ) ===
        selectedColor,
    );


  /* =========================================
     AVAILABLE SIZES

     IMPORTANT:

     Black:
     S = 5
     M = 10

     White:
     S = 3
     L = 8

     Black select করলে শুধু:
     S = 5
     M = 10

     White stock Black-এর সাথে
     যোগ হবে না.
  ========================================= */

  const availableSizes =
    useMemo(
      () => {
        if (
          !activeProduct
        ) {
          return [];
        }


        /* =====================================
           COLOR-WISE STOCK
        ===================================== */

        if (
          hasColorWiseSizeData
        ) {
          if (
            !selectedColorData ||
            typeof selectedColorData !==
              'object' ||
            !Array.isArray(
              selectedColorData.sizes,
            )
          ) {
            return [];
          }


          return selectedColorData.sizes
            .map(
              (
                sizeItem,
              ) => ({
                size:
                  String(
                    sizeItem
                      ?.size ||
                      '',
                  ).trim(),

                isAvailable:
                  sizeItem
                    ?.isAvailable ===
                    true &&
                  Number(
                    sizeItem
                      ?.quantity ||
                      0,
                  ) > 0,

                quantity:
                  Math.max(
                    0,
                    Number(
                      sizeItem
                        ?.quantity ||
                        0,
                    ),
                  ),
              }),
            )
            .filter(
              (
                sizeItem,
              ) =>
                sizeItem.size,
            );
        }


        /* =====================================
           NORMAL SIZE STOCK
        ===================================== */

        if (
          Array.isArray(
            activeProduct.sizes,
          ) &&
          activeProduct.sizes
            .length > 0
        ) {
          return activeProduct.sizes.map(
            (
              sizeItem,
            ) => ({
              ...sizeItem,

              size:
                String(
                  sizeItem
                    ?.size ||
                    '',
                ).trim(),

              quantity:
                Math.max(
                  0,
                  Number(
                    sizeItem
                      ?.quantity ||
                      0,
                  ),
                ),

              isAvailable:
                sizeItem
                  ?.isAvailable !==
                  false &&
                Number(
                  sizeItem
                    ?.quantity ||
                    0,
                ) > 0,
            }),
          );
        }


        /* =====================================
           FALLBACK
        ===================================== */

        return [
          {
            size: 'S',
            isAvailable:
              true,
            quantity: 0,
          },

          {
            size: 'M',
            isAvailable:
              true,
            quantity: 0,
          },

          {
            size: 'L',
            isAvailable:
              true,
            quantity: 0,
          },

          {
            size: 'XL',
            isAvailable:
              true,
            quantity: 0,
          },
        ];
      },
      [
        activeProduct,
        hasColorWiseSizeData,
        selectedColorData,
      ],
    );


  /* =========================================
     SELECTED SIZE DATA
  ========================================= */

  const selectedSizeData =
    availableSizes.find(
      (
        sizeItem,
      ) =>
        sizeItem.size ===
        selectedSize,
    );


  /* =========================================
     WISHLIST
  ========================================= */

  const isLiked =
    activeProduct
      ? wishlist.includes(
          activeProduct.id,
        )
      : false;


  /* =========================================
     INITIAL PRODUCT LOAD
  ========================================= */

  useEffect(
    () => {
      if (
        !activeProduct
      ) {
        return;
      }


      const firstColorItem =
        productColors[0];


      const firstColor =
        firstColorItem
          ? getColorName(
              firstColorItem,
              0,
            )
          : 'Default';


      setSelectedColor(
        firstColor,
      );


      setMainImage(
        activeProduct.image ||
          galleryImages[0] ||
          '',
      );


      setZoomStyle({
        display:
          'none',

        transformOrigin:
          '0% 0%',
      });


      setIsAdding(
        false,
      );

      setIsBuying(
        false,
      );
    },
    [
      activeProduct?.id,
    ],
  );


  /* =========================================
     COLOR CHANGE -> SIZE CHANGE
  ========================================= */

  useEffect(
    () => {
      if (
        !showSizeSection
      ) {
        setSelectedSize(
          '',
        );

        return;
      }


      const firstAvailableSize =
        availableSizes.find(
          (
            sizeItem,
          ) =>
            sizeItem
              .isAvailable,
        );


      setSelectedSize(
        firstAvailableSize
          ?.size ||
          '',
      );
    },
    [
      selectedColor,
      activeProduct?.id,
      showSizeSection,
      hasColorWiseSizeData,
    ],
  );


  /* =========================================
     IMAGE FALLBACK
  ========================================= */

  useEffect(
    () => {
      if (
        !mainImage &&
        galleryImages.length >
          0
      ) {
        setMainImage(
          galleryImages[0],
        );
      }
    },
    [
      galleryImages,
      mainImage,
    ],
  );


  /* =========================================
     PRODUCT NOT FOUND
  ========================================= */

  if (
    !activeProduct
  ) {
    return (
      <main className="pt-24 pb-32 max-w-7xl mx-auto px-4 md:px-6">

        <div className="min-h-[50vh] flex flex-col items-center justify-center text-center">

          <h1 className="text-2xl md:text-4xl font-headline font-extrabold tracking-tight text-primary mb-4">
            Product not found
          </h1>


          <p className="text-sm text-on-surface-variant mb-8">
            The product may still be loading or it does not exist.
          </p>


          <Link
            to="/collection"
            className="px-8 py-4 bg-primary text-white rounded-full text-xs font-bold uppercase tracking-widest"
          >
            Back to Collection
          </Link>

        </div>

      </main>
    );
  }


  /* =========================================
     IMAGE ZOOM
  ========================================= */

  const handleMouseMove = (
    event,
  ) => {
    const {
      left,
      top,
      width,
      height,
    } =
      event.currentTarget.getBoundingClientRect();


    const x =
      (
        (
          event.pageX -
          left -
          window.scrollX
        ) /
        width
      ) *
      100;


    const y =
      (
        (
          event.pageY -
          top -
          window.scrollY
        ) /
        height
      ) *
      100;


    setZoomStyle({
      display:
        'block',

      transformOrigin:
        `${x}% ${y}%`,
    });
  };


  const handleMouseLeave =
    () => {
      setZoomStyle({
        display:
          'none',

        transformOrigin:
          '0% 0%',
      });
    };


  /* =========================================
     PURCHASE VALIDATION
  ========================================= */

  const canPurchaseSelectedVariant =
    !showSizeSection ||
    (
      selectedSizeData
        ?.isAvailable ===
        true &&
      Number(
        selectedSizeData
          ?.quantity ||
          0,
      ) > 0
    );


  /* =========================================
     ADD TO CART
  ========================================= */

  const handleAddToCart =
    () => {
      if (
        !activeProduct ||
        isAdding
      ) {
        return;
      }


      if (
        !canPurchaseSelectedVariant
      ) {
        return;
      }


      setIsAdding(
        true,
      );


      addToCart(
        activeProduct,
        1,
        showSizeSection
          ? selectedSize
          : '',
        selectedColor ||
          'Default',
      );


      setTimeout(
        () => {
          setIsAdding(
            false,
          );
        },
        2000,
      );
    };


  /* =========================================
     BUY NOW
  ========================================= */

  const handleBuyNow =
    () => {
      if (
        !activeProduct ||
        isBuying
      ) {
        return;
      }


      if (
        !canPurchaseSelectedVariant
      ) {
        return;
      }


      setIsBuying(
        true,
      );


      addToCart(
        activeProduct,
        1,
        showSizeSection
          ? selectedSize
          : '',
        selectedColor ||
          'Default',
      );


      navigate(
        '/checkout',
      );
    };


  /* =========================================
     PAGE
  ========================================= */

  return (
    <main className="pt-24 pb-32 max-w-7xl mx-auto px-4 md:px-6">

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-20 items-start">

        {/* =====================================
            GALLERY
        ===================================== */}

        <div
          className="
            lg:col-span-4
            space-y-4
            w-full

            max-w-[280px]
            sm:max-w-[340px]
            lg:max-w-sm

            mx-auto
          "
        >

          {/* MAIN IMAGE */}

          <div
            className="
              relative
              aspect-[4/5]
              overflow-hidden
              rounded-xl
              bg-surface-low
              cursor-zoom-in
              shadow-sm
            "
            onMouseMove={
              handleMouseMove
            }
            onMouseLeave={
              handleMouseLeave
            }
          >

            {mainImage ? (

              <img
                className="w-full h-full object-cover transition-transform duration-200"
                style={{
                  transform:
                    zoomStyle.display ===
                    'block'
                      ? 'scale(2)'
                      : 'scale(1)',

                  transformOrigin:
                    zoomStyle.transformOrigin,
                }}
                src={
                  mainImage
                }
                alt={
                  activeProduct.name
                }
                referrerPolicy="no-referrer"
              />

            ) : (

              <div className="w-full h-full flex items-center justify-center text-[10px] uppercase tracking-widest text-on-surface-variant/50">
                No Image
              </div>

            )}

          </div>


          {/* THUMBNAILS */}

          {galleryImages.length >
            1 && (

            <div className="flex justify-center lg:justify-start gap-3 overflow-x-auto no-scrollbar py-2">

              {galleryImages.map(
                (
                  image,
                  index,
                ) => (

                  <button
                    key={`${image}-${index}`}
                    type="button"
                    onClick={() =>
                      setMainImage(
                        image,
                      )
                    }
                    className={cn(
                      `
                        w-11 h-14
                        sm:w-12 sm:h-16
                        md:w-14 md:h-[72px]

                        flex-shrink-0
                        rounded-lg
                        overflow-hidden
                        border-2
                        transition-all
                      `,

                      mainImage ===
                        image
                        ? 'border-primary opacity-100'
                        : 'border-transparent opacity-60 hover:opacity-100',
                    )}
                  >

                    <img
                      src={
                        image
                      }
                      className="w-full h-full object-cover"
                      alt={`${activeProduct.name} thumbnail ${
                        index +
                        1
                      }`}
                      referrerPolicy="no-referrer"
                    />

                  </button>

                ),
              )}

            </div>

          )}

        </div>


        {/* =====================================
            PRODUCT INFO
        ===================================== */}

        <div className="lg:col-span-8 flex flex-col gap-8">

          {/* PRODUCT HEADER */}

          <section>

            <h1 className="text-3xl md:text-5xl font-headline font-extrabold tracking-tight leading-none text-primary mb-4">
              {
                activeProduct.name
              }
            </h1>


            {/* PRICE */}

            <div className="flex flex-wrap items-center gap-4">

              {/* SELLING PRICE */}

              <span className="text-2xl font-headline font-semibold text-primary">
                ৳
                {
                  Number(
                    activeProduct.price ||
                      0,
                  ).toFixed(
                    2,
                  )
                }
              </span>


              {/* ORIGINAL PRICE */}

              {hasDiscount && (

                <span className="text-sm text-on-surface-variant/60 line-through">
                  ৳
                  {
                    Number(
                      activeProduct.originalPrice ||
                        0,
                    ).toFixed(
                      2,
                    )
                  }
                </span>

              )}


              {/* DISCOUNT */}

              {hasDiscount && (

                <span className="bg-red-500 text-white text-[10px] font-bold px-2 py-1 rounded uppercase tracking-widest">
                  {
                    Number(
                      activeProduct.discount ||
                        0,
                    )
                  }
                  % OFF
                </span>

              )}


              {/* CODE */}

              <span className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant/40 ml-auto">
                Code:{' '}
                {
                  activeProduct.productCode
                }
              </span>

            </div>


            {/* DESCRIPTION */}

            <div className="mt-6 text-on-surface-variant leading-relaxed max-w-md markdown-body whitespace-pre-wrap">

              <Markdown>
                {
                  activeProduct.description
                }
              </Markdown>

            </div>

          </section>


          {/* =====================================
              SELECTORS
          ===================================== */}

          <div className="space-y-8">

            {/* =================================
                COLOR FIRST
            ================================= */}

            {productColors.length >
              0 && (

              <div>

                <div className="flex justify-between items-end mb-4">

                  <div>

                    <label className="text-[10px] font-bold tracking-widest uppercase text-on-surface-variant block">
                      Color
                    </label>


                    <p className="text-[9px] text-on-surface-variant/50 mt-1">
                      Select your preferred color
                    </p>

                  </div>


                  <span className="text-[10px] font-bold uppercase tracking-widest text-primary">
                    {
                      selectedColor ||
                      'Default'
                    }
                  </span>

                </div>


                {/* COLOR BOXES */}

                <div className="grid grid-cols-4 gap-2">

                  {productColors.map(
                    (
                      colorItem,
                      index,
                    ) => {
                      const colorName =
                        getColorName(
                          colorItem,
                          index,
                        );


                      const colorValue =
                        getColorValue(
                          colorItem,
                        );


                      const colorSizes =
                        typeof colorItem ===
                          'object' &&
                        Array.isArray(
                          colorItem
                            ?.sizes,
                        )
                          ? colorItem.sizes
                          : [];


                      const colorStock =
                        colorSizes.reduce(
                          (
                            total,
                            sizeItem,
                          ) =>
                            total +
                            (
                              sizeItem
                                ?.isAvailable ===
                              true
                                ? Math.max(
                                    0,
                                    Number(
                                      sizeItem
                                        ?.quantity ||
                                        0,
                                    ),
                                  )
                                : 0
                            ),
                          0,
                        );


                      const hasTrackedColorStock =
                        hasColorWiseSizeData &&
                        colorSizes.length >
                          0;


                      const isColorAvailable =
                        !hasTrackedColorStock ||
                        colorStock >
                          0;


                      const isSelected =
                        selectedColor ===
                        colorName;


                      return (

                        <button
                          key={`${colorName}-${index}`}
                          type="button"
                          disabled={
                            !isColorAvailable
                          }
                          onClick={() => {
                            setSelectedColor(
                              colorName,
                            );

                            setSelectedSize(
                              '',
                            );
                          }}
                          className={cn(
                            `
                              min-h-12
                              rounded-lg
                              text-sm
                              font-medium
                              transition-all
                              border
                              relative
                              overflow-hidden
                              px-2
                              py-2

                              flex
                              flex-col
                              items-center
                              justify-center
                              gap-1
                            `,

                            isSelected &&
                              isColorAvailable
                              ? 'border-primary bg-primary text-white font-bold'
                              : isColorAvailable
                                ? 'border-outline-variant hover:border-primary bg-white'
                                : 'border-outline-variant/10 bg-surface-low text-on-surface-variant/30 cursor-not-allowed',
                          )}
                          aria-label={`Select ${colorName}`}
                          title={
                            colorName
                          }
                        >

                          {/* COLOR DOT */}

                          <span
                            className={cn(
                              `
                                w-5
                                h-5
                                rounded-full
                                border
                                flex-shrink-0
                              `,

                              isSelected
                                ? 'border-white/70 ring-1 ring-white/50'
                                : 'border-black/10',
                            )}
                            style={{
                              backgroundColor:
                                colorValue,
                            }}
                          />


                          {/* COLOR NAME */}

                          <span className="block text-[9px] sm:text-[10px] leading-none max-w-full truncate">
                            {
                              colorName
                            }
                          </span>


                          {/* COLOR STOCK */}

                          {hasTrackedColorStock &&
                            isColorAvailable && (

                            <span
                              className={cn(
                                'block text-[8px] leading-none',

                                isSelected
                                  ? 'text-white/70'
                                  : 'text-on-surface-variant/45',
                              )}
                            >
                              {
                                colorStock
                              }{' '}
                              left
                            </span>

                          )}


                          {/* SOLD OUT LINE */}

                          {!isColorAvailable && (

                            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">

                              <div className="w-full h-[1px] bg-on-surface-variant/20 rotate-45" />

                            </div>

                          )}


                          {/* SELECTED CHECK */}

                          {isSelected &&
                            isColorAvailable && (

                            <Check className="absolute top-1 right-1 w-2.5 h-2.5 text-white/80" />

                          )}

                        </button>

                      );
                    },
                  )}

                </div>

              </div>

            )}


            {/* =================================
                SIZE AFTER COLOR
            ================================= */}

            {showSizeSection && (

              <div>

                <div className="flex justify-between items-end mb-4">

                  <div>

                    <label className="text-[10px] font-bold tracking-widest uppercase text-on-surface-variant block">
                      Size
                    </label>


                    {hasColorWiseSizeData && (

                      <p className="text-[9px] text-on-surface-variant/50 mt-1">
                        Sizes for{' '}
                        {
                          selectedColor ||
                          'selected color'
                        }
                      </p>

                    )}

                  </div>


                  {selectedSizeData && (

                    <span className="text-[10px] font-bold uppercase tracking-widest text-primary">
                      {
                        Number(
                          selectedSizeData.quantity ||
                            0,
                        )
                      }{' '}
                      available
                    </span>

                  )}

                </div>


                {/* SIZE BOXES */}

                {availableSizes.length >
                0 ? (

                  <div className="grid grid-cols-4 gap-2">

                    {availableSizes.map(
                      (
                        sizeItem,
                      ) => (

                        <button
                          key={
                            sizeItem.size
                          }
                          type="button"
                          disabled={
                            !sizeItem.isAvailable
                          }
                          onClick={() =>
                            setSelectedSize(
                              sizeItem.size,
                            )
                          }
                          className={cn(
                            `
                              min-h-12
                              rounded-lg
                              text-sm
                              font-medium
                              transition-all
                              border
                              relative
                              overflow-hidden
                              px-2
                              py-2
                            `,

                            selectedSize ===
                              sizeItem.size &&
                              sizeItem.isAvailable
                              ? 'border-primary bg-primary text-white font-bold'
                              : sizeItem.isAvailable
                                ? 'border-outline-variant hover:border-primary'
                                : 'border-outline-variant/10 bg-surface-low text-on-surface-variant/30 cursor-not-allowed',
                          )}
                        >

                          <span className="block">
                            {
                              sizeItem.size
                            }
                          </span>


                          {sizeItem.isAvailable && (

                            <span
                              className={cn(
                                'block text-[8px] mt-0.5',

                                selectedSize ===
                                  sizeItem.size
                                  ? 'text-white/70'
                                  : 'text-on-surface-variant/45',
                              )}
                            >
                              {
                                Number(
                                  sizeItem.quantity ||
                                    0,
                                )
                              }{' '}
                              left
                            </span>

                          )}


                          {!sizeItem.isAvailable && (

                            <div className="absolute inset-0 flex items-center justify-center">

                              <div className="w-full h-[1px] bg-on-surface-variant/20 rotate-45" />

                            </div>

                          )}

                        </button>

                      ),
                    )}

                  </div>

                ) : (

                  <div className="rounded-xl border border-outline-variant/20 bg-surface-low px-4 py-4 text-xs text-on-surface-variant">
                    No size is currently available for{' '}
                    {
                      selectedColor ||
                      'this color'
                    }
                    .
                  </div>

                )}

              </div>

            )}

          </div>


          {/* =====================================
              CTA
          ===================================== */}

          <div className="space-y-4">

            {/* ADD TO CART */}

            <button
              type="button"
              onClick={
                handleAddToCart
              }
              disabled={
                isAdding ||
                !canPurchaseSelectedVariant
              }
              className={cn(
                `
                  w-full
                  h-16
                  rounded-full
                  font-headline
                  font-bold
                  text-sm
                  uppercase
                  tracking-[0.2em]
                  shadow-lg
                  transition-all
                  flex
                  items-center
                  justify-center
                  gap-3
                `,

                isAdding
                  ? 'bg-green-600 text-white'
                  : !canPurchaseSelectedVariant
                    ? 'bg-primary/40 text-white cursor-not-allowed'
                    : 'bg-primary text-white hover:opacity-90',
              )}
            >

              {
                isAdding
                  ? 'Added to Cart'
                  : !canPurchaseSelectedVariant
                    ? 'Out of Stock'
                    : 'Add to Cart'
              }


              {isAdding ? (

                <Check className="w-5 h-5" />

              ) : (

                <ShoppingBag className="w-5 h-5" />

              )}

            </button>


            <div className="flex gap-3">

              {/* BUY NOW */}

              <button
                type="button"
                onClick={
                  handleBuyNow
                }
                disabled={
                  isBuying ||
                  !canPurchaseSelectedVariant
                }
                className={cn(
                  `
                    flex-1
                    h-16
                    rounded-full
                    font-headline
                    font-bold
                    text-sm
                    uppercase
                    tracking-[0.2em]
                    shadow-md
                    transition-all
                  `,

                  isBuying
                    ? 'bg-green-600 text-white'
                    : !canPurchaseSelectedVariant
                      ? 'bg-secondary/40 text-white cursor-not-allowed'
                      : 'bg-secondary text-white hover:opacity-90',
                )}
              >
                {
                  isBuying
                    ? 'Processing...'
                    : 'Buy Now'
                }
              </button>


              {/* WISHLIST */}

              <button
                type="button"
                onClick={() =>
                  toggleWishlist(
                    activeProduct.id,
                  )
                }
                className={cn(
                  `
                    w-16
                    h-16
                    border
                    rounded-full
                    flex
                    items-center
                    justify-center
                    transition-colors
                  `,

                  isLiked
                    ? 'bg-red-50 border-red-200 text-red-500'
                    : 'border-outline-variant text-on-surface hover:bg-surface-low',
                )}
              >

                <Heart
                  className={cn(
                    'w-6 h-6',

                    isLiked &&
                      'fill-current',
                  )}
                />

              </button>

            </div>

          </div>


          {/* =====================================
              ACCORDION
          ===================================== */}

          <div className="mt-8 border-t border-outline-variant/20">

            {[
              {
                title:
                  'Product Details',

                content:
                  activeProduct.productDetails ||
                  'Premium quality materials. Designed for comfort and durability. Ethical manufacturing process.',
              },

              ...(
                activeProduct.sizeChart
                  ? [
                      {
                        title:
                          activeProduct.sizeChart.title ||
                          'Size Chart',

                        content:
                          '',

                        isSizeChart:
                          true,
                      },
                    ]
                  : []
              ),

              {
                title:
                  'Shipping & Returns',

                content:
                  storeSettings
                    ?.contactSettings
                    ?.shippingReturns ||
                  'Free shipping on orders over ৳100. Easy 30-day returns.',
              },

              {
                title:
                  'Specifications',

                content:
                  storeSettings
                    ?.contactSettings
                    ?.specifications ||
                  'Material: 100% Cotton/Leather. Care: Machine wash cold / Professional leather clean.',
              },
            ].map(
              (
                item,
              ) => (

                <details
                  key={
                    item.title
                  }
                  className="group border-b border-outline-variant/20"
                >

                  <summary className="flex justify-between items-center py-5 cursor-pointer list-none">

                    <span className="text-xs font-bold uppercase tracking-widest">
                      {
                        item.title
                      }
                    </span>


                    <ChevronDown className="w-4 h-4 transition-transform group-open:rotate-180" />

                  </summary>


                  <div className="pb-6 text-sm text-on-surface-variant leading-relaxed markdown-body whitespace-pre-wrap">

                    {item.isSizeChart &&
                    activeProduct.sizeChart ? (

                      <div className="overflow-x-auto border border-outline-variant/10 rounded-xl mt-2">

                        <table className="w-full text-left border-collapse min-w-[400px]">

                          <thead>

                            <tr className="bg-surface-low">

                              {(
                                activeProduct.sizeChart
                                  ?.columns ||
                                []
                              ).map(
                                (
                                  column,
                                  index,
                                ) => (

                                  <th
                                    key={
                                      index
                                    }
                                    className="px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-on-surface-variant border-b border-outline-variant/10"
                                  >
                                    {
                                      column
                                    }
                                  </th>

                                ),
                              )}

                            </tr>

                          </thead>


                          <tbody className="divide-y divide-outline-variant/5">

                            {(
                              activeProduct.sizeChart
                                ?.rows ||
                              []
                            ).map(
                              (
                                row,
                                rowIndex,
                              ) => (

                                <tr
                                  key={
                                    rowIndex
                                  }
                                  className="hover:bg-surface-low/30 transition-colors"
                                >

                                  {(
                                    activeProduct.sizeChart
                                      ?.columns ||
                                    []
                                  ).map(
                                    (
                                      column,
                                      columnIndex,
                                    ) => (

                                      <td
                                        key={
                                          columnIndex
                                        }
                                        className="px-4 py-3 text-xs font-medium text-on-surface border-r border-outline-variant/5 last:border-r-0"
                                      >
                                        {
                                          row[
                                            column
                                          ]
                                        }
                                      </td>

                                    ),
                                  )}

                                </tr>

                              ),
                            )}

                          </tbody>

                        </table>

                      </div>

                    ) : (

                      <Markdown>
                        {
                          item.content
                        }
                      </Markdown>

                    )}

                  </div>

                </details>

              ),
            )}

          </div>

        </div>

      </div>


      {/* =====================================
          RECOMMENDATIONS
      ===================================== */}

      <section className="mt-20 md:mt-32">

        <h3 className="text-[10px] font-bold uppercase tracking-[0.3em] mb-12 text-center text-on-surface-variant">
          You May Also Like
        </h3>


        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">

          {products
            .filter(
              (
                item,
              ) =>
                item.id !==
                activeProduct.id,
            )
            .slice(
              0,
              4,
            )
            .map(
              (
                item,
              ) => (

                <Link
                  key={
                    item.id
                  }
                  to={`/product/${item.id}`}
                  className="group"
                >

                  <div className="aspect-[4/5] bg-surface-low rounded-xl overflow-hidden mb-4 relative">

                    <img
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      src={
                        item.image
                      }
                      alt={
                        item.name
                      }
                      referrerPolicy="no-referrer"
                    />


                    <button
                      type="button"
                      className="absolute bottom-4 right-4 w-8 h-8 md:w-10 md:h-10 bg-white/90 backdrop-blur rounded-full flex items-center justify-center shadow-sm opacity-0 group-hover:opacity-100 transition-opacity"
                    >

                      <Plus className="w-4 h-4" />

                    </button>

                  </div>


                  <p className="text-[10px] md:text-xs font-bold uppercase tracking-widest mb-1 line-clamp-1">
                    {
                      item.name
                    }
                  </p>


                  <p className="text-xs md:text-sm text-on-surface-variant">
                    ৳
                    {
                      Number(
                        item.price ||
                          0,
                      ).toFixed(
                        2,
                      )
                    }
                  </p>

                </Link>

              ),
            )}

        </div>

      </section>

    </main>
  );
}