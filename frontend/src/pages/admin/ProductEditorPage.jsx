import toast from 'react-hot-toast';
import { ArrowLeft } from 'lucide-react';
import {
  Link,
  useNavigate,
  useParams,
} from 'react-router-dom';

import { useProducts } from '../../context/ProductContext';
import ProductForm from './ProductForm';

import {
  emptyProduct,
  normalizeProductForEdit,
} from './productHelpers';

export default function ProductEditorPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const {
    products,
    addProduct,
    updateProduct,
  } = useProducts();

  const isNew = !id || id === 'new';

  const existingProduct = isNew
    ? null
    : products.find(
        (product) =>
          String(product.id) === String(id),
      );

  const value = isNew
    ? normalizeProductForEdit({
        ...emptyProduct,
      })
    : existingProduct
      ? {
          ...normalizeProductForEdit(existingProduct),

          /*
            normalizeProductForEdit-এর পুরোনো normalizeColor
            nested color sizes remove করতে পারে।
            তাই raw product colors আবার preserve করছি।
          */
          colors: Array.isArray(existingProduct.colors)
            ? existingProduct.colors.map((color) => {
                if (typeof color === 'string') {
                  return {
                    name: color,
                    color: '#111111',
                    sizes: [],
                  };
                }

                return {
                  ...color,
                  name:
                    color?.name ||
                    color?.label ||
                    '',
                  color:
                    color?.hexColor ||
                    color?.color ||
                    '#111111',
                  sizes: Array.isArray(color?.sizes)
                    ? color.sizes.map((size) => ({
                        size: String(size?.size || ''),
                        isAvailable:
                          size?.isAvailable === true,
                        quantity: Math.max(
                          0,
                          Number(size?.quantity || 0),
                        ),
                      }))
                    : [],
                };
              })
            : [],
        }
      : null;

  /* =========================================
     NORMALIZE PRODUCT BEFORE SAVE
  ========================================= */

  const prepareProductData = (data) => {
    const price =
      data.price === '' ||
      data.price == null
        ? 0
        : Number(data.price);

    const originalPrice =
      data.originalPrice === '' ||
      data.originalPrice == null
        ? null
        : Number(data.originalPrice);

    const discount =
      data.discount === '' ||
      data.discount == null
        ? null
        : Number(data.discount);

    const stock =
      data.stock === '' ||
      data.stock == null
        ? 0
        : Number(data.stock);

    const colors = Array.isArray(data.colors)
      ? data.colors.map((color) => ({
          ...color,

          name:
            color?.name ||
            color?.label ||
            '',

          color:
            color?.hexColor ||
            color?.color ||
            '#111111',

          sizes: Array.isArray(color?.sizes)
            ? color.sizes
                .map((size) => ({
                  size: String(
                    size?.size || '',
                  ).trim(),

                  quantity: Math.max(
                    0,
                    Number(
                      size?.quantity || 0,
                    ),
                  ),

                  isAvailable:
                    size?.isAvailable ===
                    true,
                }))
                .filter(
                  (size) =>
                    size.size,
                )
            : [],
        }))
      : [];

    return {
      ...data,

      price:
        Number.isFinite(price)
          ? price
          : 0,

      originalPrice:
        originalPrice !== null &&
        Number.isFinite(originalPrice)
          ? originalPrice
          : null,

      discount:
        discount !== null &&
        Number.isFinite(discount)
          ? Math.min(
              100,
              Math.max(0, discount),
            )
          : null,

      stock:
        Number.isFinite(stock)
          ? Math.max(0, stock)
          : 0,

      extraImages:
        Array.isArray(data.extraImages)
          ? data.extraImages
          : [],

      sizes:
        Array.isArray(data.sizes)
          ? data.sizes.map((size) => ({
              ...size,
              size: String(
                size?.size || '',
              ).trim(),
              quantity: Math.max(
                0,
                Number(
                  size?.quantity || 0,
                ),
              ),
              isAvailable:
                size?.isAvailable !==
                false,
            }))
          : [],

      /*
        Color-wise sizes are preserved here.
        Example:
        Black -> S: 5, M: 8
        White -> M: 3
      */
      colors,

      showSizeSection:
        data.showSizeSection !==
        false,

      sizeChart:
        data.sizeChart ||
        null,
    };
  };

  /* =========================================
     SAVE
  ========================================= */

  const save = async (formData) => {
    try {
      const data =
        prepareProductData(
          formData,
        );

      console.log(
        'Saving Product:',
        data,
      );

      console.log(
        'Color-wise sizes:',
        data.colors,
      );

      if (isNew) {
        await addProduct(data);

        toast.success(
          'Product added',
        );
      } else {
        await updateProduct(
          id,
          data,
        );

        toast.success(
          'Product updated',
        );
      }

      navigate(
        '/admin/products',
      );
    } catch (error) {
      console.error(
        'Product save error:',
        error,
      );

      toast.error(
        error?.message ||
          'Product save failed',
      );
    }
  };

  /* =========================================
     PRODUCT NOT FOUND
  ========================================= */

  if (
    !isNew &&
    !existingProduct
  ) {
    return (
      <div className="max-w-7xl mx-auto">
        <Link
          to="/admin/products"
          className="inline-flex items-center gap-2 text-sm font-bold mb-6"
        >
          <ArrowLeft size={16} />

          Back to Products
        </Link>

        <div className="bg-white rounded-2xl border border-black/5 shadow-sm p-10 text-center">
          <h1 className="text-2xl font-black">
            Product not found
          </h1>

          <p className="text-sm text-black/45 mt-2">
            The product may still
            be loading or it does
            not exist.
          </p>
        </div>
      </div>
    );
  }

  /* =========================================
     PAGE
  ========================================= */

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-7">
        <div>
          <Link
            to="/admin/products"
            className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-black/45 mb-3 hover:text-black"
          >
            <ArrowLeft size={15} />

            Products
          </Link>

          <h1 className="text-3xl font-black">
            {isNew
              ? 'Add Product'
              : 'Edit Product'}
          </h1>

          <p className="text-sm text-black/50 mt-1">
            Manage product details,
            colors, color-wise sizes,
            stock, gallery and public
            product content.
          </p>
        </div>
      </div>

      <ProductForm
        value={value}
        onSave={save}
      />
    </div>
  );
}