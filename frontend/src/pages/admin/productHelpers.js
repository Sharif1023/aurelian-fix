export const emptyProduct = {
  name: '',
  productCode: '',
  price: '',
  originalPrice: '',
  discount: '',
  category: '',
  subCategory: '',
  image: '',
  extraImages: [],
  description: '',
  productDetails: '',
  stock: 0,
  status: 'Active',
  sizes: [
    { size: 'S', isAvailable: true, quantity: 0 },
    { size: 'M', isAvailable: true, quantity: 0 },
    { size: 'L', isAvailable: true, quantity: 0 },
    { size: 'XL', isAvailable: true, quantity: 0 },
  ],
  colors: [],
  showSizeSection: true,
  sizeChart: null,
};

export const uniqueImageUrls = (items = []) =>
  Array.from(
    new Set(
      items
        .filter(Boolean)
        .map((item) => String(item).trim())
        .filter(Boolean),
    ),
  );

export const normalizeSize = (item) => {
  if (typeof item === 'string') {
    return {
      size: item,
      isAvailable: true,
      quantity: 0,
    };
  }

  return {
    size: item?.size || '',
    isAvailable: item?.isAvailable !== false,
    quantity: Math.max(0, Number(item?.quantity || 0)),
  };
};

export const normalizeColor = (item) => {
  if (typeof item === 'string') {
    return {
      name: item,
      color: '#111111',
    };
  }

  return {
    name: item?.name || item?.label || '',
    color: item?.hexColor || item?.color || '#111111',
  };
};

export const normalizeProductForEdit = (product) => ({
  ...emptyProduct,
  ...product,
  image: product?.image || '',
  extraImages: uniqueImageUrls([
    ...(Array.isArray(product?.extraImages) ? product.extraImages : []),
    ...(Array.isArray(product?.images) ? product.images : []),
  ]).filter((url) => url !== product?.image),
  sizes:
    Array.isArray(product?.sizes) && product.sizes.length
      ? product.sizes.map(normalizeSize)
      : emptyProduct.sizes.map((item) => ({ ...item })),
  colors: Array.isArray(product?.colors)
    ? product.colors.map(normalizeColor)
    : [],
  showSizeSection: product?.showSizeSection !== false,
  sizeChart: product?.sizeChart || null,
});
