import toast from 'react-hot-toast';

import {
  ImagePlus,
  Plus,
  Search,
  Trash2,
} from 'lucide-react';

import {
  Link,
} from 'react-router-dom';

import {
  useMemo,
  useRef,
  useState,
} from 'react';

import {
  motion,
  AnimatePresence,
} from 'motion/react';

import {
  useProducts,
} from '../../context/ProductContext';

import {
  box,
  PageHeader,
} from './AdminUI';


export default function ProductsPage() {
  const {
    products,
    deleteProduct,
  } = useProducts();


  /* =========================================
     STATES
  ========================================= */

  const [
    search,
    setSearch,
  ] = useState('');


  const [
    activeCategory,
    setActiveCategory,
  ] = useState('All');


  const [
    activeSubCategory,
    setActiveSubCategory,
  ] = useState('All');


  const [
    hoveredCategory,
    setHoveredCategory,
  ] = useState(null);


  const [
    dropdownLeft,
    setDropdownLeft,
  ] = useState(0);


  const navRef =
    useRef(null);


  const categoryRefs =
    useRef({});


  /* =========================================
     CATEGORIES
  ========================================= */

  const categories =
    useMemo(() => {
      const items =
        Array.from(
          new Set(
            products
              .map(
                (product) =>
                  product.category
                    ?.trim(),
              )
              .filter(
                Boolean,
              ),
          ),
        );


      return [
        'All',
        ...items,
      ];
    }, [
      products,
    ]);


  /* =========================================
     SUBCATEGORIES
  ========================================= */

  const getSubCategoriesByCategory = (
    category,
  ) => {
    if (
      !category ||
      category === 'All'
    ) {
      return [];
    }


    return Array.from(
      new Set(
        products
          .filter(
            (product) =>
              product.category ===
                category &&
              product.subCategory,
          )
          .map(
            (product) =>
              product.subCategory,
          ),
      ),
    );
  };


  const hoveredSubCategories =
    useMemo(() => {
      if (
        !hoveredCategory
      ) {
        return [];
      }


      return getSubCategoriesByCategory(
        hoveredCategory,
      );
    }, [
      hoveredCategory,
      products,
    ]);


  /* =========================================
     CATEGORY CHANGE
  ========================================= */

  const handleCategoryChange = (
    category,
  ) => {
    setActiveCategory(
      category,
    );

    setActiveSubCategory(
      'All',
    );

    setHoveredCategory(
      null,
    );
  };


  /* =========================================
     SUBCATEGORY CHANGE
  ========================================= */

  const handleSubCategorySelect = (
    category,
    subCategory,
  ) => {
    setActiveCategory(
      category,
    );

    setActiveSubCategory(
      subCategory,
    );

    setHoveredCategory(
      null,
    );
  };


  /* =========================================
     DROPDOWN POSITION
  ========================================= */

  const updateDropdownPosition = (
    category,
  ) => {
    const navElement =
      navRef.current;

    const categoryElement =
      categoryRefs.current[
        category
      ];


    if (
      !navElement ||
      !categoryElement
    ) {
      return;
    }


    const navRect =
      navElement.getBoundingClientRect();

    const categoryRect =
      categoryElement.getBoundingClientRect();


    setDropdownLeft(
      categoryRect.left -
        navRect.left,
    );
  };


  /* =========================================
     FILTER PRODUCTS
  ========================================= */

  const rows =
    useMemo(() => {
      const query =
        search
          .trim()
          .toLowerCase();


      return products.filter(
        (
          product,
        ) => {
          const matchesCategory =
            activeCategory ===
              'All' ||
            product.category ===
              activeCategory;


          const matchesSubCategory =
            activeSubCategory ===
              'All' ||
            product.subCategory ===
              activeSubCategory;


          const searchableText =
            `
              ${product.name || ''}
              ${product.productCode || ''}
              ${product.category || ''}
              ${product.subCategory || ''}
            `.toLowerCase();


          const matchesSearch =
            !query ||
            searchableText.includes(
              query,
            );


          return (
            matchesCategory &&
            matchesSubCategory &&
            matchesSearch
          );
        },
      );
    }, [
      products,
      search,
      activeCategory,
      activeSubCategory,
    ]);


  /* =========================================
     GROUP BY CATEGORY
  ========================================= */

  const groupedProducts =
    useMemo(() => {
      const groups = {};


      rows.forEach(
        (
          product,
        ) => {
          const category =
            product.category
              ?.trim() ||
            'Uncategorized';


          if (
            !groups[
              category
            ]
          ) {
            groups[
              category
            ] = [];
          }


          groups[
            category
          ].push(
            product,
          );
        },
      );


      return Object.entries(
        groups,
      )
        .sort(
          (
            [categoryA],
            [categoryB],
          ) =>
            categoryA.localeCompare(
              categoryB,
            ),
        )
        .map(
          ([
            category,
            categoryProducts,
          ]) => ({
            category,

            products:
              categoryProducts.sort(
                (
                  productA,
                  productB,
                ) =>
                  String(
                    productA.name ||
                      '',
                  ).localeCompare(
                    String(
                      productB.name ||
                        '',
                    ),
                  ),
              ),
          }),
        );
    }, [
      rows,
    ]);


  /* =========================================
     DELETE PRODUCT
  ========================================= */

  const handleDelete = async (
    product,
  ) => {
    if (
      !confirm(
        `Delete "${product.name}"?`,
      )
    ) {
      return;
    }


    try {
      await deleteProduct(
        product.id,
      );


      toast.success(
        'Product deleted',
      );
    } catch (
      error
    ) {
      toast.error(
        error?.message ||
          'Could not delete product',
      );
    }
  };


  return (
    <>

      {/* =====================================
          HEADER
      ===================================== */}

      <PageHeader
        title="Products"
        subtitle="Full product catalogue, stock, sizes, colors, gallery and public product content."
        action={
          <Link
            to="/admin/products/new"
            className="
              bg-black
              text-white

              rounded-xl

              px-5
              py-3

              font-bold

              flex
              gap-2
              items-center
            "
          >
            <Plus
              size={
                17
              }
            />

            Add Product
          </Link>
        }
      />


      {/* =========================================
          CATEGORY NAVIGATION
          SAME STYLE AS COLLECTION PAGE
      ========================================= */}

      <section
        className="mb-5"
        onMouseLeave={() =>
          setHoveredCategory(
            null,
          )
        }
      >

        <div
          ref={
            navRef
          }
          className="
            relative

            bg-white

            border
            border-black/5

            rounded-2xl

            px-3
            pt-3

            shadow-sm
          "
        >

          {/* CATEGORY NAV */}

          <nav
            className="
              flex

              gap-2

              overflow-x-auto
              no-scrollbar

              pb-3

              -mx-3
              px-3
            "
          >

            {categories.map(
              (
                category,
              ) => (

                <div
                  key={
                    category
                  }

                  ref={(
                    element,
                  ) => {
                    categoryRefs.current[
                      category
                    ] =
                      element;
                  }}

                  className="shrink-0"

                  onMouseEnter={() => {
                    setHoveredCategory(
                      category,
                    );

                    updateDropdownPosition(
                      category,
                    );
                  }}
                >

                  <button
                    type="button"

                    onClick={() =>
                      handleCategoryChange(
                        category,
                      )
                    }

                    className={`
                      whitespace-nowrap

                      px-4
                      sm:px-6

                      py-2.5

                      text-sm

                      font-semibold

                      rounded-xl

                      transition-all
                      duration-200

                      ${
                        activeCategory ===
                        category
                          ? `
                            bg-black
                            text-white
                          `
                          : `
                            text-black
                            hover:text-[#c89b6d]
                            hover:bg-neutral-50
                          `
                      }
                    `}
                  >
                    {
                      category
                    }


                    {/* PRODUCT COUNT */}

                    <span
                      className={`
                        ml-2

                        text-[10px]

                        ${
                          activeCategory ===
                          category
                            ? 'text-white/60'
                            : 'text-black/35'
                        }
                      `}
                    >
                      {category ===
                      'All'
                        ? products.length
                        : products.filter(
                            (
                              product,
                            ) =>
                              product.category ===
                              category,
                          ).length}
                    </span>

                  </button>

                </div>

              ),
            )}

          </nav>


          {/* =================================
              SUBCATEGORY DROPDOWN
          ================================= */}

          <AnimatePresence>

            {hoveredCategory &&
              hoveredCategory !==
                'All' &&
              hoveredSubCategories.length >
                0 && (

                <motion.div
                  key={
                    hoveredCategory
                  }

                  initial={{
                    opacity: 0,
                    y: 4,
                  }}

                  animate={{
                    opacity: 1,
                    y: 0,
                  }}

                  exit={{
                    opacity: 0,
                    y: 4,
                  }}

                  transition={{
                    duration:
                      0.18,
                  }}

                  style={{
                    left:
                      dropdownLeft,
                  }}

                  className="
                    absolute

                    top-[58px]

                    z-50

                    min-w-[190px]
                    max-w-[230px]

                    overflow-hidden

                    rounded-xl

                    border
                    border-gray-200

                    bg-white

                    shadow-xl
                  "
                >

                  {hoveredSubCategories.map(
                    (
                      subCategory,
                    ) => (

                      <button
                        key={
                          subCategory
                        }

                        type="button"

                        onClick={() =>
                          handleSubCategorySelect(
                            hoveredCategory,
                            subCategory,
                          )
                        }

                        className={`
                          block

                          w-full

                          border-b
                          border-gray-100

                          px-4
                          py-3

                          text-left
                          text-sm

                          transition-colors

                          ${
                            activeCategory ===
                              hoveredCategory &&
                            activeSubCategory ===
                              subCategory
                              ? `
                                bg-neutral-100
                                font-bold
                                text-black
                              `
                              : `
                                text-black
                                hover:bg-gray-50
                              `
                          }
                        `}
                      >
                        {
                          subCategory
                        }
                      </button>

                    ),
                  )}


                  {/* VIEW ALL */}

                  <button
                    type="button"

                    onClick={() =>
                      handleSubCategorySelect(
                        hoveredCategory,
                        'All',
                      )
                    }

                    className="
                      block

                      w-full

                      px-4
                      py-3

                      text-left
                      text-sm

                      font-bold

                      text-[#c89b6d]

                      hover:bg-gray-50

                      transition-colors
                    "
                  >
                    View All
                  </button>

                </motion.div>

              )}

          </AnimatePresence>

        </div>

      </section>


      {/* =====================================
          ACTIVE FILTER
      ===================================== */}

      {(activeCategory !==
        'All' ||
        activeSubCategory !==
          'All') && (

        <div className="flex flex-wrap items-center gap-2 mb-4">

          <span className="text-xs font-bold text-black/40 uppercase tracking-widest">
            Showing:
          </span>


          {activeCategory !==
            'All' && (

            <span
              className="
                bg-black
                text-white

                px-3
                py-1.5

                rounded-full

                text-xs
                font-bold
              "
            >
              {
                activeCategory
              }
            </span>

          )}


          {activeSubCategory !==
            'All' && (

            <span
              className="
                bg-neutral-100

                px-3
                py-1.5

                rounded-full

                text-xs
                font-bold
              "
            >
              {
                activeSubCategory
              }
            </span>

          )}


          <button
            type="button"

            onClick={() => {
              setActiveCategory(
                'All',
              );

              setActiveSubCategory(
                'All',
              );
            }}

            className="
              text-xs
              font-bold

              text-red-500

              hover:text-red-700
            "
          >
            Clear Filter
          </button>

        </div>

      )}


      {/* =====================================
          SEARCH
      ===================================== */}

      <div
        className={`
          ${box}

          p-4

          mb-6

          flex
          gap-3
          items-center
        `}
      >

        <Search
          size={
            18
          }
          className="text-black/40"
        />


        <input
          className="
            outline-none

            flex-1

            text-sm

            bg-transparent
          "

          value={
            search
          }

          onChange={(
            event,
          ) =>
            setSearch(
              event.target.value,
            )
          }

          placeholder="Search products, code, category or subcategory..."
        />


        {search && (

          <button
            type="button"

            onClick={() =>
              setSearch('')
            }

            className="
              text-xs
              font-bold

              text-black/40

              hover:text-black
            "
          >
            Clear
          </button>

        )}

      </div>


      {/* =====================================
          RESULTS
      ===================================== */}

      <div
        className="
          flex
          items-center
          justify-between

          mb-5

          px-1
        "
      >

        <p className="text-sm text-black/45">

          Showing{' '}

          <strong className="text-black">
            {
              rows.length
            }
          </strong>{' '}

          {rows.length ===
          1
            ? 'product'
            : 'products'}

        </p>


        <p className="text-xs text-black/35">

          {
            groupedProducts.length
          }{' '}

          {groupedProducts.length ===
          1
            ? 'category'
            : 'categories'}

        </p>

      </div>


      {/* =====================================
          CATEGORY GROUPS
      ===================================== */}

      {groupedProducts.length >
      0 ? (

        <div className="space-y-8">

          {groupedProducts.map(
            ({
              category,
              products:
                categoryProducts,
            }) => (

              <section
                key={
                  category
                }
                className="space-y-3"
              >

                {/* CATEGORY HEADER */}

                <div
                  className="
                    flex
                    items-center
                    justify-between

                    px-1
                  "
                >

                  <div className="flex items-center gap-3">

                    <h2
                      className="
                        text-lg
                        md:text-xl

                        font-black

                        uppercase

                        tracking-tight
                      "
                    >
                      {
                        category
                      }
                    </h2>


                    <span
                      className="
                        min-w-7
                        h-7

                        px-2

                        rounded-full

                        bg-black
                        text-white

                        text-[10px]

                        font-bold

                        flex
                        items-center
                        justify-center
                      "
                    >
                      {
                        categoryProducts.length
                      }
                    </span>

                  </div>

                </div>


                {/* =================================
                    TABLE
                ================================= */}

                <div
                  className={`
                    ${box}
                    overflow-x-auto
                  `}
                >

                  <table className="w-full text-sm">

                    <thead
                      className="
                        bg-neutral-50

                        text-left

                        text-xs

                        uppercase
                        tracking-wider
                      "
                    >

                      <tr>

                        <th className="p-4">
                          Product
                        </th>

                        <th className="p-4">
                          Subcategory
                        </th>

                        <th className="p-4">
                          Price
                        </th>

                        <th className="p-4">
                          Stock
                        </th>

                        <th className="p-4">
                          Status
                        </th>

                        <th className="p-4 text-right">
                          Actions
                        </th>

                      </tr>

                    </thead>


                    <tbody>

                      {categoryProducts.map(
                        (
                          product,
                        ) => (

                          <tr
                            key={
                              product.id
                            }

                            className="
                              border-t

                              hover:bg-neutral-50/70

                              transition-colors
                            "
                          >

                            {/* PRODUCT */}

                            <td className="p-4">

                              <div className="flex items-center gap-3">

                                {product.image ? (

                                  <img
                                    src={
                                      product.image
                                    }

                                    alt={
                                      product.name ||
                                      ''
                                    }

                                    className="
                                      w-12
                                      h-14

                                      rounded-lg

                                      object-cover

                                      bg-neutral-100

                                      flex-shrink-0
                                    "
                                  />

                                ) : (

                                  <div
                                    className="
                                      w-12
                                      h-14

                                      rounded-lg

                                      bg-neutral-100

                                      flex
                                      items-center
                                      justify-center

                                      flex-shrink-0
                                    "
                                  >

                                    <ImagePlus
                                      size={
                                        18
                                      }

                                      className="text-black/25"
                                    />

                                  </div>

                                )}


                                <div className="min-w-0">

                                  <p
                                    className="
                                      font-bold

                                      truncate

                                      max-w-[180px]
                                      md:max-w-[280px]
                                    "
                                  >
                                    {
                                      product.name
                                    }
                                  </p>


                                  <p
                                    className="
                                      text-xs

                                      text-black/40

                                      mt-1
                                    "
                                  >
                                    {
                                      product.productCode ||
                                      'No product code'
                                    }
                                  </p>

                                </div>

                              </div>

                            </td>


                            {/* SUBCATEGORY */}

                            <td className="p-4">

                              {product.subCategory ? (

                                <span
                                  className="
                                    inline-flex

                                    px-3
                                    py-1.5

                                    rounded-full

                                    bg-neutral-100

                                    text-xs

                                    font-semibold
                                  "
                                >
                                  {
                                    product.subCategory
                                  }
                                </span>

                              ) : (

                                <span className="text-black/30 text-xs">
                                  —
                                </span>

                              )}

                            </td>


                            {/* PRICE */}

                            <td className="p-4">

                              <span className="font-bold">
                                ৳
                                {
                                  Number(
                                    product.price ||
                                      0,
                                  ).toFixed(
                                    2,
                                  )
                                }
                              </span>

                            </td>


                            {/* STOCK */}

                            <td className="p-4">

                              <span
                                className={`
                                  font-bold

                                  ${
                                    Number(
                                      product.stock ||
                                        0,
                                    ) >
                                    0
                                      ? 'text-black'
                                      : 'text-red-600'
                                  }
                                `}
                              >
                                {
                                  Number(
                                    product.stock ||
                                      0,
                                  )
                                }
                              </span>

                            </td>


                            {/* STATUS */}

                            <td className="p-4">

                              <span
                                className={`
                                  inline-flex

                                  px-3
                                  py-1.5

                                  rounded-full

                                  text-[10px]

                                  font-bold

                                  uppercase
                                  tracking-wider

                                  ${
                                    String(
                                      product.status ||
                                        '',
                                    ).toLowerCase() ===
                                    'active'
                                      ? 'bg-green-50 text-green-700'
                                      : 'bg-neutral-100 text-black/50'
                                  }
                                `}
                              >
                                {
                                  product.status ||
                                  'Inactive'
                                }
                              </span>

                            </td>


                            {/* ACTIONS */}

                            <td className="p-4">

                              <div
                                className="
                                  flex
                                  items-center
                                  justify-end

                                  gap-3
                                "
                              >

                                <Link
                                  to={`/admin/products/${product.id}`}

                                  className="
                                    font-bold

                                    text-xs

                                    px-3
                                    py-2

                                    rounded-lg

                                    hover:bg-neutral-100

                                    transition-colors
                                  "
                                >
                                  Edit
                                </Link>


                                <button
                                  type="button"

                                  onClick={() =>
                                    handleDelete(
                                      product,
                                    )
                                  }

                                  className="
                                    w-9
                                    h-9

                                    flex
                                    items-center
                                    justify-center

                                    rounded-lg

                                    text-red-600

                                    hover:bg-red-50

                                    transition-colors
                                  "
                                >
                                  <Trash2
                                    size={
                                      17
                                    }
                                  />
                                </button>

                              </div>

                            </td>

                          </tr>

                        ),
                      )}

                    </tbody>

                  </table>

                </div>

              </section>

            ),
          )}

        </div>

      ) : (

        /* =====================================
            EMPTY
        ===================================== */

        <div
          className={`
            ${box}

            p-12

            text-center
          `}
        >

          <ImagePlus
            size={
              32
            }

            className="
              mx-auto
              text-black/20
            "
          />


          <p className="text-black/40 text-sm mt-3">
            No products found.
          </p>

        </div>

      )}

    </>
  );
}