import { useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import {
  ChevronDown,
  ImagePlus,
  Plus,
  Save,
  Trash2,
  Upload,
} from 'lucide-react';

import { api } from '../../lib/api';
import { Field, input, label } from './AdminUI';
import {
  normalizeColor,
  normalizeProductForEdit,
  normalizeSize,
  uniqueImageUrls,
} from './productHelpers';

const normalizeColorWithSizes = (item) => {
  const base = normalizeColor(item);

  const sizes = Array.isArray(item?.sizes)
    ? item.sizes
        .map((sizeItem) => {
          const normalized = normalizeSize(sizeItem);

          return {
            ...normalized,
            isAvailable: sizeItem?.isAvailable === true,
            quantity: Math.max(0, Number(sizeItem?.quantity || 0)),
          };
        })
        .filter((sizeItem) => sizeItem.size.trim())
    : [];

  return {
    ...base,
    sizes,
  };
};

const normalizeFormValue = (product) => {
  const normalized = normalizeProductForEdit(product);

  return {
    ...normalized,
    colors: Array.isArray(product?.colors)
      ? product.colors.map(normalizeColorWithSizes)
      : [],
  };
};

export default function ProductForm({ value, onSave }) {
  const [f, setF] = useState(() => normalizeFormValue(value));
  const [imageUrl, setImageUrl] = useState('');
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setF(normalizeFormValue(value));
    setImageUrl('');
    setSaving(false);
  }, [value?.id]);

  const set = (key, value) => {
    setF((previous) => ({
      ...previous,
      [key]: value,
    }));
  };

  const calculatePriceFromDiscount = (originalPrice, discount) => {
    const original = Number(originalPrice || 0);
    const discountPercent = Number(discount || 0);

    if (
      original <= 0 ||
      discountPercent < 0 ||
      discountPercent > 100
    ) {
      return '';
    }

    return Number(
      (
        original -
        (original * discountPercent) / 100
      ).toFixed(2),
    );
  };

  const handleDiscountChange = (value) => {
    setF((previous) => {
      if (value === '') {
        return {
          ...previous,
          discount: '',
        };
      }

      let discount = Number(value);

      if (!Number.isFinite(discount)) {
        discount = 0;
      }

      discount = Math.min(100, Math.max(0, discount));

      const originalPrice = Number(previous.originalPrice || 0);

      const newPrice =
        originalPrice > 0
          ? calculatePriceFromDiscount(originalPrice, discount)
          : previous.price;

      return {
        ...previous,
        discount: value,
        price: newPrice,
      };
    });
  };

  const handleOriginalPriceChange = (value) => {
    setF((previous) => {
      const discount =
        previous.discount !== '' &&
        previous.discount != null
          ? Number(previous.discount)
          : null;

      let newPrice = previous.price;

      if (
        value !== '' &&
        discount !== null &&
        Number.isFinite(discount)
      ) {
        newPrice = calculatePriceFromDiscount(value, discount);
      }

      return {
        ...previous,
        originalPrice: value,
        price: newPrice,
      };
    });
  };

  const galleryImages = useMemo(
    () =>
      uniqueImageUrls([
        f.image,
        ...(Array.isArray(f.extraImages) ? f.extraImages : []),
      ]),
    [f.image, f.extraImages],
  );

  const hasColorWiseSizeConfig = useMemo(
    () =>
      (f.colors || []).some((color) =>
        (color.sizes || []).some(
          (sizeItem) =>
            sizeItem.isAvailable === true ||
            Number(sizeItem.quantity || 0) > 0,
        ),
      ),
    [f.colors],
  );

  const totalSizeStock = useMemo(() => {
    if (!f.showSizeSection) {
      return Number(f.stock || 0);
    }

    if (hasColorWiseSizeConfig) {
      return (f.colors || []).reduce(
        (colorTotal, color) =>
          colorTotal +
          (color.sizes || []).reduce(
            (sizeTotal, sizeItem) =>
              sizeTotal +
              (sizeItem.isAvailable === true
                ? Number(sizeItem.quantity || 0)
                : 0),
            0,
          ),
        0,
      );
    }

    return (f.sizes || []).reduce(
      (sum, item) =>
        sum +
        (item.isAvailable !== false ? Number(item.quantity || 0) : 0),
      0,
    );
  }, [
    f.showSizeSection,
    f.sizes,
    f.colors,
    f.stock,
    hasColorWiseSizeConfig,
  ]);

  const calculatedDiscount = useMemo(() => {
    if (f.discount !== '' && f.discount != null) {
      const manual = Number(f.discount);

      if (Number.isFinite(manual)) {
        return Math.min(100, Math.max(0, manual));
      }
    }

    const regular = Number(f.originalPrice || 0);
    const sale = Number(f.price || 0);

    if (regular > sale && sale >= 0 && regular > 0) {
      return Math.round(((regular - sale) / regular) * 100);
    }

    return 0;
  }, [f.originalPrice, f.price, f.discount]);

  const choosePrimary = (url) => {
    const oldPrimary = f.image;

    setF((previous) => ({
      ...previous,
      image: url,
      extraImages: uniqueImageUrls([
        ...(previous.extraImages || []).filter((item) => item !== url),
        oldPrimary && oldPrimary !== url ? oldPrimary : '',
      ]),
    }));
  };

  const removeImage = (url) => {
    setF((previous) => {
      const all = uniqueImageUrls([
        previous.image,
        ...(previous.extraImages || []),
      ]).filter((item) => item !== url);

      const nextPrimary =
        previous.image === url ? all[0] || '' : previous.image;

      return {
        ...previous,
        image: nextPrimary,
        extraImages: all.filter((item) => item !== nextPrimary),
      };
    });
  };

  const appendImage = (url) => {
    const clean = String(url || '').trim();

    if (!clean) return;

    setF((previous) => {
      if (!previous.image) {
        return {
          ...previous,
          image: clean,
        };
      }

      return {
        ...previous,
        extraImages: uniqueImageUrls([
          ...(previous.extraImages || []),
          clean,
        ]).filter((item) => item !== previous.image),
      };
    });
  };

  const addImageUrl = () => {
    const value = imageUrl.trim();

    if (!value) return;

    try {
      const parsed = new URL(value);

      if (!['http:', 'https:'].includes(parsed.protocol)) {
        throw new Error('Invalid URL');
      }

      appendImage(value);
      setImageUrl('');
    } catch {
      toast.error('Enter a valid image URL');
    }
  };

  const uploadImages = async (files) => {
    if (!files?.length || uploading) return;

    setUploading(true);

    try {
      for (const file of Array.from(files)) {
        const formData = new FormData();
        formData.append('image', file);

        const response = await api.post('/admin/media', formData);

        const url =
          response?.url ||
          response?.file?.url ||
          response?.data?.url ||
          response?.data?.file?.url;

        if (url) {
          appendImage(url);
        }
      }

      toast.success('Image uploaded');
    } catch (error) {
      toast.error(error.message || 'Image upload failed');
    } finally {
      setUploading(false);
    }
  };

  const updateSize = (index, key, value) => {
    setF((previous) => {
      const currentSizes = previous.sizes || [];
      const oldSizeName = currentSizes[index]?.size || '';

      const nextSizes = currentSizes.map((item, itemIndex) =>
        itemIndex === index
          ? {
              ...item,
              [key]:
                key === 'quantity'
                  ? Math.max(0, Number(value || 0))
                  : value,
            }
          : item,
      );

      if (key !== 'size') {
        return {
          ...previous,
          sizes: nextSizes,
        };
      }

      const nextSizeName = String(value || '');

      const nextColors = (previous.colors || []).map((color) => ({
        ...color,
        sizes: (color.sizes || []).map((sizeItem) =>
          sizeItem.size === oldSizeName
            ? {
                ...sizeItem,
                size: nextSizeName,
              }
            : sizeItem,
        ),
      }));

      return {
        ...previous,
        sizes: nextSizes,
        colors: nextColors,
      };
    });
  };

  const addSize = () => {
    setF((previous) => ({
      ...previous,
      sizes: [
        ...(previous.sizes || []),
        {
          size: '',
          isAvailable: true,
          quantity: 0,
        },
      ],
    }));
  };

  const removeSize = (index) => {
    setF((previous) => {
      const sizeName = previous.sizes?.[index]?.size || '';

      return {
        ...previous,
        sizes: (previous.sizes || []).filter(
          (_, itemIndex) => itemIndex !== index,
        ),
        colors: (previous.colors || []).map((color) => ({
          ...color,
          sizes: (color.sizes || []).filter(
            (sizeItem) => sizeItem.size !== sizeName,
          ),
        })),
      };
    });
  };

  const updateColor = (index, key, value) => {
    set(
      'colors',
      (f.colors || []).map((item, itemIndex) =>
        itemIndex === index
          ? {
              ...item,
              [key]: value,
            }
          : item,
      ),
    );
  };

  const addColor = () => {
    setF((previous) => ({
      ...previous,
      colors: [
        ...(previous.colors || []),
        {
          name: '',
          color: '#111111',
          sizes: (previous.sizes || [])
            .filter((sizeItem) => String(sizeItem.size || '').trim())
            .map((sizeItem) => ({
              size: sizeItem.size,
              isAvailable: false,
              quantity: 0,
            })),
        },
      ],
    }));
  };

  const removeColor = (index) => {
    set(
      'colors',
      (f.colors || []).filter((_, itemIndex) => itemIndex !== index),
    );
  };

  const getColorSize = (color, sizeName) =>
    (color?.sizes || []).find(
      (sizeItem) => String(sizeItem.size) === String(sizeName),
    );

  const updateColorSize = (
    colorIndex,
    sizeName,
    key,
    value,
  ) => {
    setF((previous) => ({
      ...previous,
      colors: (previous.colors || []).map((color, itemIndex) => {
        if (itemIndex !== colorIndex) {
          return color;
        }

        const currentSizes = Array.isArray(color.sizes)
          ? [...color.sizes]
          : [];

        const sizeIndex = currentSizes.findIndex(
          (sizeItem) => String(sizeItem.size) === String(sizeName),
        );

        const nextValue =
          key === 'quantity'
            ? Math.max(0, Number(value || 0))
            : value;

        if (sizeIndex >= 0) {
          currentSizes[sizeIndex] = {
            ...currentSizes[sizeIndex],
            size: sizeName,
            [key]: nextValue,
          };
        } else {
          currentSizes.push({
            size: sizeName,
            isAvailable: key === 'isAvailable' ? Boolean(value) : false,
            quantity: key === 'quantity' ? nextValue : 0,
          });
        }

        return {
          ...color,
          sizes: currentSizes,
        };
      }),
    }));
  };

  const createSizeChart = () => {
    set(
      'sizeChart',
      f.sizeChart || {
        title: 'Size Chart',
        columns: ['Size', 'Chest', 'Length'],
        rows: [],
      },
    );
  };

  const addSizeChartColumn = () => {
    const chart = f.sizeChart || {
      title: 'Size Chart',
      columns: [],
      rows: [],
    };

    let number = chart.columns.length + 1;
    let name = `Column ${number}`;

    while (chart.columns.includes(name)) {
      number += 1;
      name = `Column ${number}`;
    }

    set('sizeChart', {
      ...chart,
      columns: [...chart.columns, name],
      rows: chart.rows.map((row) => ({
        ...row,
        [name]: '',
      })),
    });
  };

  const renameSizeChartColumn = (oldName, newName) => {
    const chart = f.sizeChart;
    if (!chart) return;

    const next = (newName || oldName).trim() || oldName;

    if (next !== oldName && chart.columns.includes(next)) {
      toast.error('Column names must be unique');
      return;
    }

    set('sizeChart', {
      ...chart,
      columns: chart.columns.map((column) =>
        column === oldName ? next : column,
      ),
      rows: chart.rows.map((row) => {
        const copy = {
          ...row,
          [next]: row[oldName] ?? '',
        };

        if (next !== oldName) {
          delete copy[oldName];
        }

        return copy;
      }),
    });
  };

  const removeSizeChartColumn = (column) => {
    const chart = f.sizeChart;
    if (!chart) return;

    set('sizeChart', {
      ...chart,
      columns: chart.columns.filter((item) => item !== column),
      rows: chart.rows.map((row) => {
        const copy = { ...row };
        delete copy[column];
        return copy;
      }),
    });
  };

  const addSizeChartRow = () => {
    const chart = f.sizeChart || {
      title: 'Size Chart',
      columns: ['Size'],
      rows: [],
    };

    const row = {};

    chart.columns.forEach((column) => {
      row[column] = '';
    });

    set('sizeChart', {
      ...chart,
      rows: [...chart.rows, row],
    });
  };

  const updateSizeChartCell = (rowIndex, column, value) => {
    const chart = f.sizeChart;
    if (!chart) return;

    set('sizeChart', {
      ...chart,
      rows: chart.rows.map((row, index) =>
        index === rowIndex
          ? {
              ...row,
              [column]: value,
            }
          : row,
      ),
    });
  };

  const removeSizeChartRow = (index) => {
    const chart = f.sizeChart;
    if (!chart) return;

    set('sizeChart', {
      ...chart,
      rows: chart.rows.filter((_, rowIndex) => rowIndex !== index),
    });
  };

  const submit = async (event) => {
    event.preventDefault();

    const cleanSizes = (f.sizes || [])
      .map(normalizeSize)
      .filter((item) => item.size.trim());

    const validSizeNames = new Set(
      cleanSizes.map((item) => item.size.trim()),
    );

    const cleanColors = (f.colors || [])
      .map((color) => {
        const normalizedColor = normalizeColor(color);

        const colorSizes = Array.isArray(color?.sizes)
          ? color.sizes
              .map((sizeItem) => ({
                size: String(sizeItem?.size || '').trim(),
                isAvailable: sizeItem?.isAvailable === true,
                quantity: Math.max(
                  0,
                  Number(sizeItem?.quantity || 0),
                ),
              }))
              .filter(
                (sizeItem) =>
                  sizeItem.size &&
                  validSizeNames.has(sizeItem.size),
              )
          : [];

        return {
          ...normalizedColor,
          sizes: colorSizes,
        };
      })
      .filter((item) => item.name.trim());

    const hasColorConfig = cleanColors.some((color) =>
      color.sizes.some(
        (sizeItem) =>
          sizeItem.isAvailable === true ||
          Number(sizeItem.quantity || 0) > 0,
      ),
    );

    const aggregatedSizes = hasColorConfig
      ? cleanSizes.map((masterSize) => {
          const matching = cleanColors.flatMap((color) =>
            color.sizes.filter(
              (sizeItem) => sizeItem.size === masterSize.size,
            ),
          );

          const quantity = matching.reduce(
            (sum, sizeItem) =>
              sum +
              (sizeItem.isAvailable === true
                ? Number(sizeItem.quantity || 0)
                : 0),
            0,
          );

          return {
            ...masterSize,
            quantity,
            isAvailable: matching.some(
              (sizeItem) =>
                sizeItem.isAvailable === true &&
                Number(sizeItem.quantity || 0) > 0,
            ),
          };
        })
      : cleanSizes;

    const normalizedDiscount =
      f.discount !== '' && f.discount != null
        ? Math.min(100, Math.max(0, Number(f.discount || 0)))
        : calculatedDiscount;

    const stock = f.showSizeSection
      ? aggregatedSizes.reduce(
          (sum, item) =>
            sum +
            (item.isAvailable !== false
              ? Number(item.quantity || 0)
              : 0),
          0,
        )
      : Number(f.stock || 0);

    const payload = {
      ...f,
      price: Number(f.price || 0),
      originalPrice:
        f.originalPrice !== '' && f.originalPrice != null
          ? Number(f.originalPrice)
          : null,
      discount:
        Number.isFinite(normalizedDiscount) && normalizedDiscount > 0
          ? normalizedDiscount
          : null,
      stock,
      extraImages: uniqueImageUrls(f.extraImages || []).filter(
        (url) => url !== f.image,
      ),
      sizes: f.showSizeSection ? aggregatedSizes : [],
      colors: cleanColors,
      showSizeSection: f.showSizeSection !== false,
      sizeChart: f.showSizeSection ? f.sizeChart : null,
    };

    setSaving(true);

    try {
      await onSave(payload);
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={submit} className="space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14 items-start">
        <aside className="lg:col-span-4 lg:sticky lg:top-5">
          <div className="space-y-4">
            <div className="relative aspect-[4/5] overflow-hidden rounded-2xl bg-neutral-100 border border-black/5 shadow-sm">
              {f.image ? (
                <img
                  src={f.image}
                  alt={f.name || 'Product'}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-black/30">
                  <ImagePlus size={38} />
                  <span className="mt-3 text-[10px] uppercase tracking-[0.2em] font-bold">
                    Product Image
                  </span>
                </div>
              )}

              {f.image && (
                <span className="absolute top-3 left-3 bg-black text-white text-[9px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-full">
                  Primary
                </span>
              )}
            </div>

            {galleryImages.length > 0 && (
              <div className="flex gap-3 overflow-x-auto py-1">
                {galleryImages.map((url, index) => (
                  <div
                    key={`${url}-${index}`}
                    className="relative group flex-shrink-0"
                  >
                    <button
                      type="button"
                      onClick={() => choosePrimary(url)}
                      className={`w-14 h-[72px] rounded-lg overflow-hidden border-2 transition ${
                        f.image === url
                          ? 'border-black opacity-100'
                          : 'border-transparent opacity-60 hover:opacity-100'
                      }`}
                    >
                      <img
                        src={url}
                        alt=""
                        className="w-full h-full object-cover"
                      />
                    </button>

                    <button
                      type="button"
                      onClick={() => removeImage(url)}
                      className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-white border border-red-200 text-red-600 shadow flex items-center justify-center opacity-0 group-hover:opacity-100"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <label className="w-full py-3 rounded-xl border border-dashed border-black/20 bg-neutral-50 hover:bg-neutral-100 cursor-pointer flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-wider">
              <Upload size={16} />
              {uploading ? 'Uploading...' : 'Upload Images'}

              <input
                hidden
                multiple
                type="file"
                accept="image/*"
                disabled={uploading}
                onChange={(event) => {
                  uploadImages(event.target.files);
                  event.target.value = '';
                }}
              />
            </label>

            <div className="flex gap-2">
              <input
                className={input}
                type="url"
                value={imageUrl}
                onChange={(event) => setImageUrl(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter') {
                    event.preventDefault();
                    addImageUrl();
                  }
                }}
                placeholder="https://example.com/product.jpg"
              />

              <button
                type="button"
                onClick={addImageUrl}
                className="w-12 rounded-xl bg-black text-white flex items-center justify-center"
              >
                <Plus size={17} />
              </button>
            </div>
          </div>
        </aside>

        <div className="lg:col-span-8 space-y-8">
          <section>
            <input
              required
              value={f.name || ''}
              onChange={(event) => set('name', event.target.value)}
              placeholder="Product name"
              className="w-full bg-transparent text-3xl md:text-5xl font-black tracking-tight leading-none border-b border-transparent focus:border-black/10 outline-none pb-2 placeholder:text-black/20"
            />

            <div className="flex flex-wrap items-end gap-4 mt-5">
              <label>
                <span className={label}>Selling Price</span>

                <div className="mt-1 flex items-center">
                  <span className="text-2xl font-black mr-1">৳</span>
                  <input
                    required
                    type="number"
                    min="0"
                    step="0.01"
                    value={f.price}
                    onChange={(event) => set('price', event.target.value)}
                    className="w-28 text-2xl font-black outline-none border-b border-black/15"
                  />
                </div>
              </label>

              <label>
                <span className={label}>Original Price</span>

                <div className="mt-1 flex items-center">
                  <span className="text-sm text-black/45 mr-1">৳</span>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={f.originalPrice ?? ''}
                    onChange={(event) =>
                      handleOriginalPriceChange(event.target.value)
                    }
                    className="w-24 text-sm outline-none border-b border-black/15"
                  />
                </div>
              </label>

              {calculatedDiscount > 0 && (
                <span className="bg-red-500 text-white text-[10px] font-bold px-2.5 py-1.5 rounded uppercase tracking-wider">
                  {calculatedDiscount}% OFF
                </span>
              )}

              <label className="ml-auto min-w-[160px]">
                <span className={`${label} text-right block`}>
                  Product Code
                </span>
                <input
                  value={f.productCode || ''}
                  onChange={(event) =>
                    set('productCode', event.target.value)
                  }
                  className="w-full mt-1 text-right text-xs font-bold uppercase tracking-wider outline-none border-b border-black/10"
                  placeholder="PRD-001"
                />
              </label>
            </div>

            <div className="mt-7 max-w-2xl">
              <Field title="Short Description">
                <textarea
                  className={input}
                  rows="4"
                  value={f.description || ''}
                  onChange={(event) =>
                    set('description', event.target.value)
                  }
                  placeholder="Shown below the price on the public Product Details page."
                />
              </Field>
            </div>
          </section>

          <section className="space-y-4">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className={label}>Size</p>
                <p className="text-xs text-black/40 mt-1">
                  Controls the size selector and stock shown on the public
                  product page.
                </p>
              </div>

              <label className="flex items-center gap-2 text-[11px] uppercase tracking-wider font-bold">
                <input
                  type="checkbox"
                  checked={f.showSizeSection !== false}
                  onChange={(event) =>
                    set('showSizeSection', event.target.checked)
                  }
                />
                Show Size
              </label>
            </div>

            {f.showSizeSection !== false && (
              <>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {(f.sizes || []).map((size, index) => (
                    <div
                      key={index}
                      className={`relative rounded-xl border p-3 ${
                        size.isAvailable !== false
                          ? 'bg-white border-black/10'
                          : 'bg-neutral-100 border-black/5 opacity-60'
                      }`}
                    >
                      <input
                        value={size.size || ''}
                        onChange={(event) =>
                          updateSize(index, 'size', event.target.value)
                        }
                        placeholder="Size"
                        className="w-full h-10 rounded-lg border border-black/10 text-center text-sm font-bold uppercase outline-none focus:ring-2 focus:ring-black/10"
                      />

                      <div className="flex gap-2 mt-2">
                        <input
                          type="number"
                          min="0"
                          value={size.quantity ?? 0}
                          onChange={(event) =>
                            updateSize(index, 'quantity', event.target.value)
                          }
                          className="w-full h-9 rounded-lg bg-neutral-100 px-2 text-xs outline-none"
                          title="Quantity"
                        />

                        <label className="w-10 h-9 rounded-lg bg-neutral-100 flex items-center justify-center">
                          <input
                            type="checkbox"
                            checked={size.isAvailable !== false}
                            onChange={(event) =>
                              updateSize(
                                index,
                                'isAvailable',
                                event.target.checked,
                              )
                            }
                          />
                        </label>
                      </div>

                      <button
                        type="button"
                        onClick={() => removeSize(index)}
                        className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-white border border-red-200 text-red-600 shadow flex items-center justify-center"
                      >
                        <Trash2 size={11} />
                      </button>
                    </div>
                  ))}
                </div>

                <div className="flex justify-between items-center">
                  <button
                    type="button"
                    onClick={addSize}
                    className="text-xs font-bold flex items-center gap-1"
                  >
                    <Plus size={14} />
                    Add Size
                  </button>

                  <span className="text-xs font-bold text-black/45">
                    Total stock: {totalSizeStock}
                  </span>
                </div>
              </>
            )}

            {f.showSizeSection === false && (
              <Field title="Stock">
                <input
                  type="number"
                  min="0"
                  className={input}
                  value={f.stock ?? 0}
                  onChange={(event) => set('stock', event.target.value)}
                />
              </Field>
            )}
          </section>

          <section className="space-y-5">
            <div className="flex items-end justify-between gap-4">
              <div>
                <p className={label}>Colors & Color-wise Sizes</p>
                <p className="text-xs text-black/40 mt-1">
                  Add a color, then choose which sizes and quantities are
                  available for that color.
                </p>
              </div>

              <button
                type="button"
                onClick={addColor}
                className="text-xs font-bold flex items-center gap-1"
              >
                <Plus size={14} />
                Add Color
              </button>
            </div>

            {(f.colors || []).length > 0 ? (
              <div className="space-y-5">
                {(f.colors || []).map((color, colorIndex) => {
                  const colorStock = (color.sizes || []).reduce(
                    (sum, sizeItem) =>
                      sum +
                      (sizeItem.isAvailable === true
                        ? Number(sizeItem.quantity || 0)
                        : 0),
                    0,
                  );

                  return (
                    <div
                      key={colorIndex}
                      className="rounded-2xl border border-black/10 bg-white p-4 sm:p-5 shadow-sm"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                        <div className="flex items-center gap-3 flex-1">
                          <input
                            type="color"
                            value={color.color || '#111111'}
                            onChange={(event) =>
                              updateColor(
                                colorIndex,
                                'color',
                                event.target.value,
                              )
                            }
                            className="w-11 h-11 rounded-xl border border-black/10 p-1 bg-white cursor-pointer shrink-0"
                          />

                          <input
                            value={color.name || ''}
                            onChange={(event) =>
                              updateColor(
                                colorIndex,
                                'name',
                                event.target.value,
                              )
                            }
                            placeholder="Color name, e.g. Black"
                            className="w-full sm:max-w-xs h-11 rounded-xl border border-black/10 px-4 text-sm font-semibold outline-none focus:ring-2 focus:ring-black/10"
                          />
                        </div>

                        <div className="flex items-center justify-between sm:justify-end gap-4">
                          <span className="text-[10px] uppercase tracking-wider font-bold text-black/45">
                            Stock: {colorStock}
                          </span>

                          <button
                            type="button"
                            onClick={() => removeColor(colorIndex)}
                            className="w-9 h-9 rounded-full text-red-600 hover:bg-red-50 flex items-center justify-center"
                            title="Remove color"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </div>

                      {f.showSizeSection !== false && (
                        <div className="mt-5">
                          <div className="flex items-center justify-between mb-3">
                            <p className="text-[10px] uppercase tracking-widest font-bold text-black/45">
                              Sizes for {color.name || 'this color'}
                            </p>

                            <span className="text-[9px] text-black/35">
                              Check size + set quantity
                            </span>
                          </div>

                          {(f.sizes || []).filter((size) =>
                            String(size.size || '').trim(),
                          ).length > 0 ? (
                            <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3">
                              {(f.sizes || [])
                                .filter((size) =>
                                  String(size.size || '').trim(),
                                )
                                .map((masterSize, sizeIndex) => {
                                  const sizeName = String(
                                    masterSize.size || '',
                                  ).trim();

                                  const colorSize = getColorSize(
                                    color,
                                    sizeName,
                                  );

                                  const checked =
                                    colorSize?.isAvailable === true;

                                  return (
                                    <div
                                      key={`${sizeName}-${sizeIndex}`}
                                      className={`rounded-xl border p-3 transition ${
                                        checked
                                          ? 'border-black/20 bg-neutral-50'
                                          : 'border-black/10 bg-white'
                                      }`}
                                    >
                                      <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                          type="checkbox"
                                          checked={checked}
                                          onChange={(event) =>
                                            updateColorSize(
                                              colorIndex,
                                              sizeName,
                                              'isAvailable',
                                              event.target.checked,
                                            )
                                          }
                                        />

                                        <span className="text-sm font-black uppercase">
                                          {sizeName}
                                        </span>
                                      </label>

                                      <div className="mt-3">
                                        <span className="text-[9px] uppercase tracking-wider font-bold text-black/35">
                                          Quantity
                                        </span>

                                        <input
                                          type="number"
                                          min="0"
                                          disabled={!checked}
                                          value={colorSize?.quantity ?? 0}
                                          onChange={(event) =>
                                            updateColorSize(
                                              colorIndex,
                                              sizeName,
                                              'quantity',
                                              event.target.value,
                                            )
                                          }
                                          className="mt-1 w-full h-9 rounded-lg bg-white border border-black/10 px-3 text-xs font-bold outline-none disabled:opacity-40"
                                        />
                                      </div>
                                    </div>
                                  );
                                })}
                            </div>
                          ) : (
                            <p className="text-xs text-black/35">
                              Add size names above first.
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-xs text-black/35">
                No colors added. Public page will use “Default”.
              </p>
            )}

            {hasColorWiseSizeConfig && (
              <div className="rounded-xl bg-neutral-50 border border-black/5 px-4 py-3 text-xs text-black/55">
                Product stock will be calculated from the quantities inside
                each color/size combination. Total stock: <b>{totalSizeStock}</b>
              </div>
            )}
          </section>

          <div className="border-t border-black/10">
            <details open className="group border-b border-black/10">
              <summary className="py-5 flex items-center justify-between cursor-pointer list-none">
                <span className="text-xs font-black uppercase tracking-wider">
                  Product Details
                </span>
                <ChevronDown
                  size={16}
                  className="transition-transform group-open:rotate-180"
                />
              </summary>

              <div className="pb-6">
                <textarea
                  className={input}
                  rows="8"
                  value={f.productDetails || ''}
                  onChange={(event) =>
                    set('productDetails', event.target.value)
                  }
                  placeholder="Markdown supported"
                />
              </div>
            </details>

            <details className="group border-b border-black/10">
              <summary className="py-5 flex items-center justify-between cursor-pointer list-none">
                <span className="text-xs font-black uppercase tracking-wider">
                  Size Chart
                </span>
                <ChevronDown
                  size={16}
                  className="transition-transform group-open:rotate-180"
                />
              </summary>

              <div className="pb-6 space-y-4">
                {!f.sizeChart ? (
                  <button
                    type="button"
                    onClick={createSizeChart}
                    className="px-5 py-3 rounded-xl border border-black/10 font-bold text-sm"
                  >
                    Create Size Chart
                  </button>
                ) : (
                  <>
                    <div className="flex flex-wrap gap-3">
                      <input
                        className={`${input} flex-1 min-w-[220px]`}
                        value={f.sizeChart.title || ''}
                        onChange={(event) =>
                          set('sizeChart', {
                            ...f.sizeChart,
                            title: event.target.value,
                          })
                        }
                        placeholder="Size Chart"
                      />

                      <button
                        type="button"
                        onClick={addSizeChartColumn}
                        className="px-4 rounded-xl border border-black/10 font-bold text-xs"
                      >
                        + Column
                      </button>

                      <button
                        type="button"
                        onClick={() => set('sizeChart', null)}
                        className="px-4 rounded-xl border border-red-200 text-red-600 font-bold text-xs"
                      >
                        Remove Chart
                      </button>
                    </div>

                    <div className="overflow-x-auto border border-black/10 rounded-xl">
                      <table className="w-full min-w-[560px] text-sm">
                        <thead className="bg-neutral-50">
                          <tr>
                            {(f.sizeChart.columns || []).map(
                              (column, index) => (
                                <th
                                  key={`${column}-${index}`}
                                  className="p-2 border-r last:border-r-0 border-black/5"
                                >
                                  <div className="flex gap-1 items-center">
                                    <input
                                      value={column}
                                      onChange={(event) =>
                                        renameSizeChartColumn(
                                          column,
                                          event.target.value,
                                        )
                                      }
                                      className="w-full bg-transparent p-2 text-[10px] uppercase tracking-wider font-bold outline-none"
                                    />

                                    {(f.sizeChart.columns || []).length > 1 && (
                                      <button
                                        type="button"
                                        onClick={() =>
                                          removeSizeChartColumn(column)
                                        }
                                        className="text-red-600"
                                      >
                                        <Trash2 size={13} />
                                      </button>
                                    )}
                                  </div>
                                </th>
                              ),
                            )}

                            <th className="w-12" />
                          </tr>
                        </thead>

                        <tbody>
                          {(f.sizeChart.rows || []).map((row, rowIndex) => (
                            <tr key={rowIndex} className="border-t">
                              {(f.sizeChart.columns || []).map((column) => (
                                <td
                                  key={column}
                                  className="p-2 border-r last:border-r-0 border-black/5"
                                >
                                  <input
                                    value={row?.[column] ?? ''}
                                    onChange={(event) =>
                                      updateSizeChartCell(
                                        rowIndex,
                                        column,
                                        event.target.value,
                                      )
                                    }
                                    className="w-full rounded-lg px-2 py-2 outline-none focus:bg-neutral-50"
                                  />
                                </td>
                              ))}

                              <td className="p-2">
                                <button
                                  type="button"
                                  onClick={() => removeSizeChartRow(rowIndex)}
                                  className="text-red-600"
                                >
                                  <Trash2 size={14} />
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    <button
                      type="button"
                      onClick={addSizeChartRow}
                      className="text-xs font-bold flex items-center gap-1"
                    >
                      <Plus size={14} />
                      Add Row
                    </button>
                  </>
                )}
              </div>
            </details>

            <details className="group border-b border-black/10">
              <summary className="py-5 flex items-center justify-between cursor-pointer list-none">
                <span className="text-xs font-black uppercase tracking-wider">
                  Catalogue & Publishing
                </span>
                <ChevronDown
                  size={16}
                  className="transition-transform group-open:rotate-180"
                />
              </summary>

              <div className="pb-6 grid md:grid-cols-2 gap-4">
                <Field title="Category">
                  <input
                    required
                    className={input}
                    value={f.category || ''}
                    onChange={(event) => set('category', event.target.value)}
                  />
                </Field>

                <Field title="Sub-category">
                  <input
                    className={input}
                    value={f.subCategory || ''}
                    onChange={(event) =>
                      set('subCategory', event.target.value)
                    }
                  />
                </Field>

                <Field title="Status">
                  <select
                    className={input}
                    value={f.status || 'Active'}
                    onChange={(event) => set('status', event.target.value)}
                  >
                    <option>Active</option>
                    <option>Draft</option>
                    <option>Archived</option>
                  </select>
                </Field>

                <Field title="Manual Discount %">
                  <input
                    type="number"
                    min="0"
                    max="100"
                    className={input}
                    value={f.discount ?? ''}
                    onChange={(event) =>
                      handleDiscountChange(event.target.value)
                    }
                  />
                </Field>
              </div>
            </details>
          </div>
        </div>
      </div>

      <button
        type="submit"
        disabled={saving || uploading}
        className="w-full bg-black text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 disabled:opacity-50"
      >
        {saving ? (
          <>
            <span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
            Saving...
          </>
        ) : (
          <>
            <Save size={18} />
            Save Product
          </>
        )}
      </button>
    </form>
  );
}