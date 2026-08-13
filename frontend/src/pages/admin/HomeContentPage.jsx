import {
  useEffect,
  useMemo,
  useState,
} from 'react';

import toast from 'react-hot-toast';

import {
  Check,
  ImagePlus,
  Plus,
  Save,
  Trash2,
  Upload,
  Video,
} from 'lucide-react';

import {
  useProducts,
} from '../../context/ProductContext';

import {
  api,
} from '../../lib/api';

import {
  box,
  Field,
  input,
  PageHeader,
} from './AdminUI';


/* =========================================
   HOME CONTENT PAGE
========================================= */

export default function HomeContentPage() {
  const {
    homeSettings,
    updateHomeSettings,
    products,
  } = useProducts();


  /* =========================================
     STATE
  ========================================= */

  const [
    f,
    setF,
  ] = useState(
    homeSettings || {},
  );

  const [
    socialImageUrl,
    setSocialImageUrl,
  ] = useState('');

  const [
    uploadingKey,
    setUploadingKey,
  ] = useState('');

  const [
    saving,
    setSaving,
  ] = useState(false);


  /* =========================================
     LOAD SETTINGS
  ========================================= */

  useEffect(() => {
    setF(
      homeSettings || {},
    );
  }, [
    homeSettings,
  ]);


  /* =========================================
     SAFE VALUES
  ========================================= */

  const bestSellerIds =
    Array.isArray(
      f.bestSellerIds,
    )
      ? f.bestSellerIds.map(
          String,
        )
      : [];


  const featuredProductIds =
    Array.isArray(
      f.featuredCollection
        ?.productIds,
    )
      ? f.featuredCollection.productIds.map(
          String,
        )
      : [];


  const socialGallery =
    Array.isArray(
      f.socialGallery,
    )
      ? f.socialGallery
      : [];


  const curatedItems =
    Array.isArray(
      f.curatedEdits
        ?.items,
    )
      ? f.curatedEdits.items
      : [];


  /* =========================================
     NORMAL UPDATE
  ========================================= */

  const updateField = (
    key,
    value,
  ) => {
    setF(
      (
        previous,
      ) => ({
        ...previous,

        [key]:
          value,
      }),
    );
  };


  /* =========================================
     FEATURED UPDATE
  ========================================= */

  const updateFeatured = (
    key,
    value,
  ) => {
    setF(
      (
        previous,
      ) => ({
        ...previous,

        featuredCollection: {
          ...(
            previous.featuredCollection ||
            {}
          ),

          [key]:
            value,
        },
      }),
    );
  };


  /* =========================================
     CURATED TITLE
  ========================================= */

  const updateCuratedTitle = (
    value,
  ) => {
    setF(
      (
        previous,
      ) => ({
        ...previous,

        curatedEdits: {
          ...(
            previous.curatedEdits ||
            {}
          ),

          title:
            value,

          items:
            previous
              .curatedEdits
              ?.items ||
            [],
        },
      }),
    );
  };


  /* =========================================
     CURATED ITEM UPDATE
  ========================================= */

  const updateCuratedItem = (
    index,
    key,
    value,
  ) => {
    setF(
      (
        previous,
      ) => {
        const current =
          Array.isArray(
            previous
              .curatedEdits
              ?.items,
          )
            ? [
                ...previous
                  .curatedEdits
                  .items,
              ]
            : [];


        current[
          index
        ] = {
          ...(
            current[
              index
            ] ||
            {}
          ),

          [key]:
            value,
        };


        return {
          ...previous,

          curatedEdits: {
            ...(
              previous.curatedEdits ||
              {}
            ),

            title:
              previous
                .curatedEdits
                ?.title ||
              'Curated Edits',

            items:
              current,
          },
        };
      },
    );
  };


  /* =========================================
     ADD CURATED ITEM
  ========================================= */

  const addCuratedItem = () => {
    setF(
      (
        previous,
      ) => {
        const current =
          Array.isArray(
            previous
              .curatedEdits
              ?.items,
          )
            ? previous
                .curatedEdits
                .items
            : [];


        return {
          ...previous,

          curatedEdits: {
            ...(
              previous.curatedEdits ||
              {}
            ),

            title:
              previous
                .curatedEdits
                ?.title ||
              'Curated Edits',

            items: [
              ...current,

              {
                id: `curated-${Date.now()}-${Math.random()
                  .toString(
                    36,
                  )
                  .slice(
                    2,
                    7,
                  )}`,

                title: '',

                image: '',

                link:
                  '/collection',
              },
            ],
          },
        };
      },
    );
  };


  /* =========================================
     REMOVE CURATED ITEM
  ========================================= */

  const removeCuratedItem = (
    index,
  ) => {
    setF(
      (
        previous,
      ) => ({
        ...previous,

        curatedEdits: {
          ...(
            previous.curatedEdits ||
            {}
          ),

          title:
            previous
              .curatedEdits
              ?.title ||
            'Curated Edits',

          items: (
            previous
              .curatedEdits
              ?.items ||
            []
          ).filter(
            (
              _,
              itemIndex,
            ) =>
              itemIndex !==
              index,
          ),
        },
      }),
    );
  };


  /* =========================================
     GET UPLOADED IMAGE URL
  ========================================= */

  const getUploadedUrl = (
    response,
  ) => {
    return (
      response?.url ||
      response?.file
        ?.url ||
      response?.data
        ?.url ||
      response?.data
        ?.file
        ?.url ||
      ''
    );
  };


  /* =========================================
     SINGLE IMAGE UPLOAD
  ========================================= */

  const uploadImage = async (
    file,
    key,
    onSuccess,
  ) => {
    if (!file) {
      return;
    }


    setUploadingKey(
      key,
    );


    try {
      const formData =
        new FormData();


      formData.append(
        'image',
        file,
      );


      const response =
        await api.post(
          '/admin/media',
          formData,
        );


      const url =
        getUploadedUrl(
          response,
        );


      if (!url) {
        throw new Error(
          'Uploaded image URL was not returned.',
        );
      }


      onSuccess(
        url,
      );


      toast.success(
        'Image uploaded',
      );
    } catch (
      error
    ) {
      toast.error(
        error?.message ||
          'Image upload failed',
      );
    } finally {
      setUploadingKey(
        '',
      );
    }
  };


  /* =========================================
     MULTIPLE SOCIAL IMAGE UPLOAD
  ========================================= */

  const uploadSocialImages = async (
    files,
  ) => {
    if (
      !files
        ?.length ||
      uploadingKey ===
        'social'
    ) {
      return;
    }


    setUploadingKey(
      'social',
    );


    try {
      const uploadedUrls =
        [];


      for (
        const file
        of Array.from(
          files,
        )
      ) {
        const formData =
          new FormData();


        formData.append(
          'image',
          file,
        );


        const response =
          await api.post(
            '/admin/media',
            formData,
          );


        const url =
          getUploadedUrl(
            response,
          );


        if (url) {
          uploadedUrls.push(
            url,
          );
        }
      }


      if (
        uploadedUrls.length ===
        0
      ) {
        throw new Error(
          'No image was uploaded.',
        );
      }


      setF(
        (
          previous,
        ) => {
          const current =
            Array.isArray(
              previous.socialGallery,
            )
              ? previous.socialGallery
              : [];


          return {
            ...previous,

            socialGallery: [
              ...new Set([
                ...current,
                ...uploadedUrls,
              ]),
            ],
          };
        },
      );


      toast.success(
        `${uploadedUrls.length} image${
          uploadedUrls.length >
          1
            ? 's'
            : ''
        } uploaded`,
      );
    } catch (
      error
    ) {
      toast.error(
        error?.message ||
          'Image upload failed',
      );
    } finally {
      setUploadingKey(
        '',
      );
    }
  };


  /* =========================================
     BEST SELLER
  ========================================= */

  const toggleBestSeller = (
    productId,
  ) => {
    const id =
      String(
        productId,
      );


    setF(
      (
        previous,
      ) => {
        const current =
          Array.isArray(
            previous.bestSellerIds,
          )
            ? previous.bestSellerIds.map(
                String,
              )
            : [];


        const exists =
          current.includes(
            id,
          );


        return {
          ...previous,

          bestSellerIds:
            exists
              ? current.filter(
                  (
                    item,
                  ) =>
                    item !==
                    id,
                )
              : [
                  ...current,
                  id,
                ],
        };
      },
    );
  };


  /* =========================================
     FEATURED PRODUCTS
  ========================================= */

  const toggleFeaturedProduct = (
    productId,
  ) => {
    const id =
      String(
        productId,
      );


    setF(
      (
        previous,
      ) => {
        const current =
          Array.isArray(
            previous
              .featuredCollection
              ?.productIds,
          )
            ? previous.featuredCollection.productIds.map(
                String,
              )
            : [];


        const exists =
          current.includes(
            id,
          );


        return {
          ...previous,

          featuredCollection: {
            ...(
              previous.featuredCollection ||
              {}
            ),

            productIds:
              exists
                ? current.filter(
                    (
                      item,
                    ) =>
                      item !==
                      id,
                  )
                : [
                    ...current,
                    id,
                  ],
          },
        };
      },
    );
  };


  /* =========================================
     ADD SOCIAL IMAGE BY URL
  ========================================= */

  const addSocialImage = () => {
    const url =
      socialImageUrl.trim();


    if (!url) {
      toast.error(
        'Enter an image URL',
      );

      return;
    }


    try {
      new URL(
        url,
      );
    } catch {
      toast.error(
        'Enter a valid image URL',
      );

      return;
    }


    if (
      socialGallery.includes(
        url,
      )
    ) {
      toast.error(
        'This image already exists',
      );

      return;
    }


    setF(
      (
        previous,
      ) => ({
        ...previous,

        socialGallery: [
          ...(
            previous.socialGallery ||
            []
          ),

          url,
        ],
      }),
    );


    setSocialImageUrl(
      '',
    );
  };


  /* =========================================
     REMOVE SOCIAL IMAGE
  ========================================= */

  const removeSocialImage = (
    index,
  ) => {
    setF(
      (
        previous,
      ) => ({
        ...previous,

        socialGallery: (
          previous.socialGallery ||
          []
        ).filter(
          (
            _,
            itemIndex,
          ) =>
            itemIndex !==
            index,
        ),
      }),
    );
  };


  /* =========================================
     SAVE
  ========================================= */

  const save = async () => {
    try {
      setSaving(
        true,
      );


      const payload = {
        ...f,

        curatedEdits: {
          ...(
            f.curatedEdits ||
            {}
          ),

          title:
            f.curatedEdits
              ?.title ||
            'Curated Edits',

          items:
            curatedItems.map(
              (
                item,
                index,
              ) => ({
                ...item,

                id:
                  item?.id ||
                  `curated-${
                    index +
                    1
                  }`,

                title:
                  item?.title ||
                  '',

                image:
                  item?.image ||
                  '',

                link:
                  item?.link ||
                  '/collection',
              }),
            ),
        },
      };


      await updateHomeSettings(
        payload,
      );


      toast.success(
        'Home content updated',
      );
    } catch (
      error
    ) {
      toast.error(
        error?.message ||
          'Failed to update home content',
      );
    } finally {
      setSaving(
        false,
      );
    }
  };


  /* =========================================
     PAGE
  ========================================= */

  return (
    <>
      <PageHeader
        title="Home Content"
        subtitle="Easily control what appears on your website homepage."
      />


      <div className="space-y-6">

        {/* =====================================
            HERO SECTION
        ===================================== */}

        <Section
          title="Hero Section"
          description="Main banner shown at the top of your homepage."
        >
          <div className="grid lg:grid-cols-2 gap-6">

            {/* HERO FIELDS */}

            <div className="space-y-4">

              <Field title="Hero Badge">
                <input
                  className={
                    input
                  }
                  value={
                    f.heroBadge ||
                    ''
                  }
                  onChange={(
                    event,
                  ) =>
                    updateField(
                      'heroBadge',
                      event
                        .target
                        .value,
                    )
                  }
                  placeholder="NEW COLLECTION"
                />
              </Field>


              <Field title="Hero Title">
                <textarea
                  rows="2"
                  className={
                    input
                  }
                  value={
                    f.heroTitle ||
                    ''
                  }
                  onChange={(
                    event,
                  ) =>
                    updateField(
                      'heroTitle',
                      event
                        .target
                        .value,
                    )
                  }
                  placeholder="Your main homepage title"
                />
              </Field>


              <Field title="Hero Subtitle">
                <textarea
                  rows="3"
                  className={
                    input
                  }
                  value={
                    f.heroSubtitle ||
                    ''
                  }
                  onChange={(
                    event,
                  ) =>
                    updateField(
                      'heroSubtitle',
                      event
                        .target
                        .value,
                    )
                  }
                  placeholder="Write a short description..."
                />
              </Field>


              {/* HERO IMAGE URL + UPLOAD */}

              <Field title="Hero Image">
                <ImageUrlUploader
                  value={
                    f.heroImage ||
                    ''
                  }
                  onChange={(
                    value,
                  ) =>
                    updateField(
                      'heroImage',
                      value,
                    )
                  }
                  onUpload={(
                    file,
                  ) =>
                    uploadImage(
                      file,
                      'hero',
                      (
                        url,
                      ) =>
                        updateField(
                          'heroImage',
                          url,
                        ),
                    )
                  }
                  uploading={
                    uploadingKey ===
                    'hero'
                  }
                />
              </Field>


              <Field title="Hero Video URL">
                <input
                  className={
                    input
                  }
                  value={
                    f.heroVideoUrl ||
                    ''
                  }
                  onChange={(
                    event,
                  ) =>
                    updateField(
                      'heroVideoUrl',
                      event
                        .target
                        .value,
                    )
                  }
                  placeholder="Optional video URL"
                />
              </Field>
            </div>


            {/* HERO PREVIEW */}

            <div>
              <p className="text-[11px] uppercase tracking-widest font-bold text-black/40 mb-2">
                Hero Preview
              </p>


              <div className="aspect-video rounded-2xl overflow-hidden bg-neutral-100 relative">

                {f.heroImage ? (
                  <img
                    src={
                      f.heroImage
                    }
                    alt="Hero"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-black/25">
                    <ImagePlus
                      size={
                        40
                      }
                    />

                    <p className="text-xs mt-2">
                      No hero image
                    </p>
                  </div>
                )}


                {f.heroImage && (
                  <div className="absolute inset-0 bg-black/25 flex items-end">

                    <div className="p-6 text-white">

                      {f.heroBadge && (
                        <p className="text-[9px] font-bold tracking-widest uppercase">
                          {
                            f.heroBadge
                          }
                        </p>
                      )}


                      <h3 className="text-2xl font-black mt-1">
                        {
                          f.heroTitle ||
                          'Hero Title'
                        }
                      </h3>


                      {f.heroSubtitle && (
                        <p className="text-xs text-white/80 mt-2 line-clamp-2">
                          {
                            f.heroSubtitle
                          }
                        </p>
                      )}

                    </div>
                  </div>
                )}

              </div>


              {f.heroVideoUrl && (
                <div className="mt-3 flex items-center gap-2 text-xs text-black/45">
                  <Video
                    size={
                      15
                    }
                  />

                  Video URL added
                </div>
              )}

            </div>

          </div>
        </Section>


        {/* =====================================
            BEST SELLERS
        ===================================== */}

        <Section
          title="Best Sellers"
          description="Click products to show or remove them from the Best Seller section."
        >

          <div className="flex items-center justify-between mb-4">

            <p className="text-xs text-black/45">
              Selected:{' '}

              <b>
                {
                  bestSellerIds.length
                }
              </b>
            </p>


            {bestSellerIds.length >
              0 && (
              <button
                type="button"
                onClick={() =>
                  updateField(
                    'bestSellerIds',
                    [],
                  )
                }
                className="text-xs font-bold text-red-600"
              >
                Clear all
              </button>
            )}

          </div>


          <ProductPicker
            products={
              products
            }
            selectedIds={
              bestSellerIds
            }
            onToggle={
              toggleBestSeller
            }
          />

        </Section>


        {/* =====================================
            FEATURED COLLECTION
        ===================================== */}

        <Section
          title="Featured Collection"
          description="Create and control the featured collection shown on your homepage."
        >

          <div className="mb-6">

            <label className="inline-flex items-center gap-3 cursor-pointer">

              <input
                type="checkbox"
                className="w-4 h-4"
                checked={
                  f.featuredCollection
                    ?.show !==
                  false
                }
                onChange={(
                  event,
                ) =>
                  updateFeatured(
                    'show',
                    event
                      .target
                      .checked,
                  )
                }
              />


              <span className="font-bold text-sm">
                Show Featured Collection
              </span>

            </label>

          </div>


          <div className="grid md:grid-cols-2 gap-4 mb-6">

            <Field title="Collection Title">
              <input
                className={
                  input
                }
                value={
                  f.featuredCollection
                    ?.title ||
                  ''
                }
                onChange={(
                  event,
                ) =>
                  updateFeatured(
                    'title',
                    event
                      .target
                      .value,
                  )
                }
                placeholder="Featured Collection"
              />
            </Field>


            <Field title="Collection Subtitle">
              <input
                className={
                  input
                }
                value={
                  f.featuredCollection
                    ?.subtitle ||
                  ''
                }
                onChange={(
                  event,
                ) =>
                  updateFeatured(
                    'subtitle',
                    event
                      .target
                      .value,
                  )
                }
                placeholder="Discover our favourites"
              />
            </Field>

          </div>


          <div className="flex items-center justify-between mb-4">

            <p className="text-xs text-black/45">
              Selected products:{' '}

              <b>
                {
                  featuredProductIds.length
                }
              </b>
            </p>


            {featuredProductIds.length >
              0 && (
              <button
                type="button"
                onClick={() =>
                  updateFeatured(
                    'productIds',
                    [],
                  )
                }
                className="text-xs font-bold text-red-600"
              >
                Clear all
              </button>
            )}

          </div>


          <ProductPicker
            products={
              products
            }
            selectedIds={
              featuredProductIds
            }
            onToggle={
              toggleFeaturedProduct
            }
          />

        </Section>


        {/* =====================================
            SOCIAL GALLERY
        ===================================== */}

        <Section
          title="Social Gallery"
          description="Add images shown in your homepage social/gallery section."
        >

          <div className="grid lg:grid-cols-[1fr_auto_auto] gap-2 mb-5">

            {/* URL */}

            <input
              className={
                input
              }
              value={
                socialImageUrl
              }
              onChange={(
                event,
              ) =>
                setSocialImageUrl(
                  event
                    .target
                    .value,
                )
              }
              onKeyDown={(
                event,
              ) => {
                if (
                  event.key ===
                  'Enter'
                ) {
                  event.preventDefault();

                  addSocialImage();
                }
              }}
              placeholder="Paste image URL..."
            />


            {/* ADD URL */}

            <button
              type="button"
              onClick={
                addSocialImage
              }
              className="px-5 py-3 rounded-xl border border-black/10 bg-white text-sm font-bold flex items-center justify-center gap-2"
            >
              <Plus
                size={
                  16
                }
              />

              Add URL
            </button>


            {/* UPLOAD */}

            <label className="px-5 py-3 rounded-xl bg-black text-white text-sm font-bold flex items-center justify-center gap-2 cursor-pointer">

              <Upload
                size={
                  16
                }
              />


              {uploadingKey ===
              'social'
                ? 'Uploading...'
                : 'Upload Images'}


              <input
                hidden
                multiple
                type="file"
                accept="image/*"
                disabled={
                  uploadingKey ===
                  'social'
                }
                onChange={(
                  event,
                ) => {
                  uploadSocialImages(
                    event
                      .target
                      .files,
                  );

                  event.target.value =
                    '';
                }}
              />

            </label>

          </div>


          {/* GALLERY PREVIEW */}

          {socialGallery.length >
          0 ? (

            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">

              {socialGallery.map(
                (
                  url,
                  index,
                ) => (

                  <div
                    key={`${url}-${index}`}
                    className="relative group aspect-square rounded-xl overflow-hidden bg-neutral-100 border border-black/5"
                  >

                    <img
                      src={
                        url
                      }
                      alt=""
                      className="w-full h-full object-cover"
                    />


                    <button
                      type="button"
                      onClick={() =>
                        removeSocialImage(
                          index,
                        )
                      }
                      className="absolute top-2 right-2 w-8 h-8 rounded-full bg-white text-red-600 shadow flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2
                        size={
                          14
                        }
                      />
                    </button>

                  </div>

                ),
              )}

            </div>

          ) : (

            <EmptyState
              text="No social gallery images added."
            />

          )}

        </Section>


        {/* =====================================
            CURATED EDITS
        ===================================== */}

        <Section
          title="Curated Edits"
          description="Manage the circular curated category cards shown on your homepage."
        >

          {/* CURATED TOP */}

          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">

            <div className="flex-1 max-w-xl">

              <Field title="Section Title">

                <input
                  className={
                    input
                  }
                  value={
                    f.curatedEdits
                      ?.title ||
                    'Curated Edits'
                  }
                  onChange={(
                    event,
                  ) =>
                    updateCuratedTitle(
                      event
                        .target
                        .value,
                    )
                  }
                  placeholder="Curated Edits"
                />

              </Field>

            </div>


            <button
              type="button"
              onClick={
                addCuratedItem
              }
              className="h-12 px-5 rounded-xl bg-black text-white text-sm font-bold flex items-center justify-center gap-2"
            >
              <Plus
                size={
                  16
                }
              />

              Add Curated Box
            </button>

          </div>


          {/* CURATED BOXES */}

          {curatedItems.length >
          0 ? (

            <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-5">

              {curatedItems.map(
                (
                  item,
                  index,
                ) => (

                  <div
                    key={
                      item?.id ||
                      index
                    }
                    className="rounded-2xl border border-black/10 bg-white overflow-hidden shadow-sm"
                  >

                    {/* IMAGE PREVIEW */}

                    <div className="relative aspect-[4/3] bg-neutral-100">

                      {item?.image ? (

                        <img
                          src={
                            item.image
                          }
                          alt={
                            item?.title ||
                            ''
                          }
                          className="w-full h-full object-cover"
                        />

                      ) : (

                        <div className="w-full h-full flex flex-col items-center justify-center text-black/25">
                          <ImagePlus
                            size={
                              34
                            }
                          />

                          <p className="text-xs mt-2">
                            No image
                          </p>
                        </div>

                      )}


                      {/* BOX NUMBER */}

                      <span className="absolute top-3 left-3 bg-black/75 text-white backdrop-blur px-2.5 py-1 rounded-full text-[9px] font-bold uppercase tracking-wider">
                        Box {
                          index +
                          1
                        }
                      </span>


                      {/* DELETE BOX */}

                      <button
                        type="button"
                        onClick={() =>
                          removeCuratedItem(
                            index,
                          )
                        }
                        className="absolute top-3 right-3 w-9 h-9 rounded-full bg-white text-red-600 shadow flex items-center justify-center"
                        title="Remove curated box"
                      >
                        <Trash2
                          size={
                            15
                          }
                        />
                      </button>

                    </div>


                    {/* BOX FIELDS */}

                    <div className="p-4 space-y-4">

                      {/* TITLE */}

                      <Field title="Title">

                        <input
                          className={
                            input
                          }
                          value={
                            item?.title ||
                            ''
                          }
                          onChange={(
                            event,
                          ) =>
                            updateCuratedItem(
                              index,
                              'title',
                              event
                                .target
                                .value,
                            )
                          }
                          placeholder="e.g. Summer Edit"
                        />

                      </Field>


                      {/* LINK */}

                      <Field title="Link">

                        <input
                          className={
                            input
                          }
                          value={
                            item?.link ||
                            ''
                          }
                          onChange={(
                            event,
                          ) =>
                            updateCuratedItem(
                              index,
                              'link',
                              event
                                .target
                                .value,
                            )
                          }
                          placeholder="/collection"
                        />

                      </Field>


                      {/* IMAGE */}

                      <Field title="Image">

                        <ImageUrlUploader
                          value={
                            item?.image ||
                            ''
                          }
                          onChange={(
                            value,
                          ) =>
                            updateCuratedItem(
                              index,
                              'image',
                              value,
                            )
                          }
                          onUpload={(
                            file,
                          ) =>
                            uploadImage(
                              file,
                              `curated-${index}`,
                              (
                                url,
                              ) =>
                                updateCuratedItem(
                                  index,
                                  'image',
                                  url,
                                ),
                            )
                          }
                          uploading={
                            uploadingKey ===
                            `curated-${index}`
                          }
                          showPreview={
                            false
                          }
                        />

                      </Field>


                      {/* SMALL PREVIEW INFORMATION */}

                      <div className="pt-2 border-t border-black/5">

                        <p className="text-[10px] uppercase tracking-widest text-black/35 font-bold">
                          Homepage Preview
                        </p>

                        <div className="flex items-center gap-3 mt-3">

                          <div className="w-12 h-12 rounded-full overflow-hidden bg-neutral-100 border border-black/5 shrink-0">

                            {item?.image ? (
                              <img
                                src={
                                  item.image
                                }
                                alt=""
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <ImagePlus
                                  size={
                                    15
                                  }
                                  className="text-black/20"
                                />
                              </div>
                            )}

                          </div>


                          <div className="min-w-0">

                            <p className="text-xs font-black truncate">
                              {
                                item?.title ||
                                'Untitled'
                              }
                            </p>

                            <p className="text-[10px] text-black/40 truncate">
                              {
                                item?.link ||
                                '/collection'
                              }
                            </p>

                          </div>

                        </div>

                      </div>

                    </div>

                  </div>

                ),
              )}

            </div>

          ) : (

            <div>

              <EmptyState
                text="No curated boxes added."
              />


              <button
                type="button"
                onClick={
                  addCuratedItem
                }
                className="mx-auto mt-4 px-5 py-3 rounded-xl bg-black text-white text-sm font-bold flex items-center justify-center gap-2"
              >
                <Plus
                  size={
                    16
                  }
                />

                Add First Curated Box
              </button>

            </div>

          )}

        </Section>


        {/* =====================================
            SAVE BUTTON
        ===================================== */}

        <div className="sticky bottom-4 z-20">

          <button
            type="button"
            disabled={
              saving ||
              Boolean(
                uploadingKey,
              )
            }
            onClick={
              save
            }
            className="w-full bg-black text-white rounded-2xl py-4 font-bold flex items-center justify-center gap-2 shadow-xl disabled:opacity-50"
          >

            {saving ? (
              <>
                <span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />

                Saving...
              </>
            ) : (
              <>
                <Save
                  size={
                    18
                  }
                />

                Save Home Content
              </>
            )}

          </button>

        </div>

      </div>
    </>
  );
}


/* =========================================
   IMAGE URL + UPLOAD
========================================= */

function ImageUrlUploader({
  value,
  onChange,
  onUpload,
  uploading = false,
  showPreview = true,
}) {
  return (
    <div className="space-y-3">

      <div className="flex flex-col sm:flex-row gap-2">

        {/* IMAGE URL */}

        <input
          className={`${input} flex-1`}
          value={
            value ||
            ''
          }
          onChange={(
            event,
          ) =>
            onChange(
              event
                .target
                .value,
            )
          }
          placeholder="https://..."
        />


        {/* IMAGE UPLOAD */}

        <label className="sm:w-auto px-5 py-3 rounded-xl bg-black text-white text-sm font-bold flex items-center justify-center gap-2 cursor-pointer shrink-0">

          <Upload
            size={
              16
            }
          />


          {uploading
            ? 'Uploading...'
            : 'Upload Image'}


          <input
            hidden
            type="file"
            accept="image/*"
            disabled={
              uploading
            }
            onChange={(
              event,
            ) => {
              const file =
                event.target
                  .files?.[
                    0
                  ];


              if (file) {
                onUpload(
                  file,
                );
              }


              event.target.value =
                '';
            }}
          />

        </label>

      </div>


      {/* PREVIEW */}

      {showPreview &&
        value && (

        <div className="relative w-28 h-28 rounded-xl overflow-hidden bg-neutral-100 border border-black/5 group">

          <img
            src={
              value
            }
            alt=""
            className="w-full h-full object-cover"
          />


          <button
            type="button"
            onClick={() =>
              onChange(
                '',
              )
            }
            className="absolute top-2 right-2 w-7 h-7 rounded-full bg-white text-red-600 shadow flex items-center justify-center"
            title="Remove image"
          >
            <Trash2
              size={
                12
              }
            />
          </button>

        </div>

      )}

    </div>
  );
}


/* =========================================
   SECTION
========================================= */

function Section({
  title,
  description,
  children,
}) {
  return (
    <section
      className={`${box} p-5 md:p-7`}
    >

      <div className="mb-6">

        <h2 className="text-xl font-black">
          {
            title
          }
        </h2>


        {description && (
          <p className="text-sm text-black/45 mt-1">
            {
              description
            }
          </p>
        )}

      </div>


      {
        children
      }

    </section>
  );
}


/* =========================================
   PRODUCT PICKER
========================================= */

function ProductPicker({
  products,
  selectedIds,
  onToggle,
}) {
  const [
    search,
    setSearch,
  ] = useState('');


  const filteredProducts =
    useMemo(
      () => {
        const query =
          search
            .trim()
            .toLowerCase();


        if (!query) {
          return products;
        }


        return products.filter(
          (
            product,
          ) =>
            `${
              product.name
            } ${
              product.productCode ||
              ''
            } ${
              product.category ||
              ''
            }`
              .toLowerCase()
              .includes(
                query,
              ),
        );
      },
      [
        products,
        search,
      ],
    );


  return (
    <div>

      {/* SEARCH */}

      <input
        className={`${input} mb-4`}
        value={
          search
        }
        onChange={(
          event,
        ) =>
          setSearch(
            event
              .target
              .value,
          )
        }
        placeholder="Search products..."
      />


      {/* PRODUCTS */}

      {filteredProducts.length >
      0 ? (

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 max-h-[500px] overflow-y-auto pr-1">

          {filteredProducts.map(
            (
              product,
            ) => {
              const selected =
                selectedIds.includes(
                  String(
                    product.id,
                  ),
                );


              return (
                <button
                  key={
                    product.id
                  }
                  type="button"
                  onClick={() =>
                    onToggle(
                      product.id,
                    )
                  }
                  className={`relative text-left rounded-xl overflow-hidden border transition-all ${
                    selected
                      ? 'border-black ring-2 ring-black/10'
                      : 'border-black/5 hover:border-black/20'
                  }`}
                >

                  {/* PRODUCT IMAGE */}

                  <div className="aspect-[4/5] bg-neutral-100">

                    {product.image ? (

                      <img
                        src={
                          product.image
                        }
                        alt={
                          product.name
                        }
                        className="w-full h-full object-cover"
                      />

                    ) : (

                      <div className="w-full h-full flex items-center justify-center text-black/20">

                        <ImagePlus
                          size={
                            25
                          }
                        />

                      </div>

                    )}

                  </div>


                  {/* SELECTED CHECK */}

                  {selected && (

                    <span className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black text-white flex items-center justify-center shadow">

                      <Check
                        size={
                          15
                        }
                      />

                    </span>

                  )}


                  {/* PRODUCT INFO */}

                  <div className="p-3 bg-white">

                    <p className="font-bold text-xs line-clamp-1">
                      {
                        product.name
                      }
                    </p>


                    <div className="flex items-center justify-between mt-1 gap-2">

                      <span className="text-[10px] text-black/40 truncate">
                        {
                          product.productCode ||
                          product.category ||
                          ''
                        }
                      </span>


                      <span className="text-xs font-bold">
                        ৳
                        {
                          product.price
                        }
                      </span>

                    </div>

                  </div>

                </button>
              );
            },
          )}

        </div>

      ) : (

        <EmptyState
          text="No products found."
        />

      )}

    </div>
  );
}


/* =========================================
   EMPTY STATE
========================================= */

function EmptyState({
  text,
}) {
  return (
    <div className="py-10 border border-dashed border-black/10 rounded-xl text-center">

      <ImagePlus
        size={
          28
        }
        className="mx-auto text-black/20"
      />


      <p className="text-xs text-black/40 mt-2">
        {
          text
        }
      </p>

    </div>
  );
}