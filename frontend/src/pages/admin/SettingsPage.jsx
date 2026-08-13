import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import {
  ExternalLink,
  Mail,
  MapPin,
  Palette,
  Plus,
  Save,
  Settings,
  Smartphone,
  Store,
  Trash2,
  Truck,
} from 'lucide-react';

import { useProducts } from '../../context/ProductContext';
import {
  box,
  Field,
  input,
  PageHeader,
} from './AdminUI';

export default function SettingsPage() {
  const {
    storeSettings,
    updateStoreSettings,
  } = useProducts();

  const [f, setF] = useState(
    storeSettings || {},
  );

  const [saving, setSaving] =
    useState(false);

  useEffect(() => {
    setF(storeSettings || {});
  }, [storeSettings]);

  /* =========================================
     HELPERS
  ========================================= */

  const nested = (
    group,
    key,
    value,
  ) => {
    setF((previous) => ({
      ...previous,

      [group]: {
        ...(previous[group] || {}),
        [key]: value,
      },
    }));
  };

  /* =========================================
     SOCIAL LINKS
  ========================================= */

  const socialLinks =
    Array.isArray(f.socialLinks)
      ? f.socialLinks
      : [];

  const addSocialLink = () => {
    setF((previous) => ({
      ...previous,

      socialLinks: [
        ...(Array.isArray(
          previous.socialLinks,
        )
          ? previous.socialLinks
          : []),

        {
          platform: '',
          url: '',
        },
      ],
    }));
  };

  const updateSocialLink = (
    index,
    key,
    value,
  ) => {
    setF((previous) => ({
      ...previous,

      socialLinks: (
        previous.socialLinks || []
      ).map((item, itemIndex) =>
        itemIndex === index
          ? {
              ...item,
              [key]: value,
            }
          : item,
      ),
    }));
  };

  const removeSocialLink = (
    index,
  ) => {
    setF((previous) => ({
      ...previous,

      socialLinks: (
        previous.socialLinks || []
      ).filter(
        (_, itemIndex) =>
          itemIndex !== index,
      ),
    }));
  };

  /* =========================================
     CATEGORY SUBTITLES
  ========================================= */

  const categoryRows =
    Object.entries(
      f.categorySubtitles || {},
    ).map(
      ([category, subtitle]) => ({
        category,
        subtitle,
      }),
    );

  const setCategoryRows = (
    rows,
  ) => {
    const next = {};

    rows.forEach(
      ({
        category,
        subtitle,
      }) => {
        const cleanCategory =
          String(category || '').trim();

        if (!cleanCategory) {
          return;
        }

        next[cleanCategory] =
          subtitle || '';
      },
    );

    setF((previous) => ({
      ...previous,

      categorySubtitles:
        next,
    }));
  };

  const addCategoryRow = () => {
    setCategoryRows([
      ...categoryRows,

      {
        category: '',
        subtitle: '',
      },
    ]);
  };

  const updateCategoryRow = (
    index,
    key,
    value,
  ) => {
    const rows =
      categoryRows.map(
        (item, itemIndex) =>
          itemIndex === index
            ? {
                ...item,
                [key]: value,
              }
            : item,
      );

    /*
      Category name edit করার সময় empty
      হলে immediately object থেকে হারিয়ে যেতে পারে,
      তাই নিচের temp structure ব্যবহার করছি.
    */

    if (
      key === 'category' &&
      !value.trim()
    ) {
      const temporary =
        [...categoryRows];

      temporary[index] = {
        ...temporary[index],
        category: value,
      };

      /*
        Blank category object-এ রাখা যায় না,
        তাই direct state update।
      */

      setF((previous) => ({
        ...previous,

        categorySubtitles: Object.fromEntries(
          temporary
            .filter(
              (row) =>
                row.category.trim(),
            )
            .map((row) => [
              row.category,
              row.subtitle,
            ]),
        ),
      }));

      return;
    }

    setCategoryRows(rows);
  };

  const removeCategoryRow = (
    index,
  ) => {
    setCategoryRows(
      categoryRows.filter(
        (_, itemIndex) =>
          itemIndex !== index,
      ),
    );
  };

  /* =========================================
     SAVE
  ========================================= */

  const save = async () => {
    try {
      setSaving(true);

      await updateStoreSettings(
        f,
      );

      toast.success(
        'Settings saved',
      );
    } catch (error) {
      toast.error(
        error?.message ||
          'Failed to save settings',
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <PageHeader
        title="Store Settings"
        subtitle="Manage your store, shipping, payments, contact information and social links."
      />

      <div className="space-y-6">
        {/* =====================================
            SHIPPING
        ===================================== */}

        <SettingsSection
          icon={
            <Truck
              size={20}
            />
          }
          title="Shipping"
          description="Set the delivery charge for each shipping area."
        >
          <div className="grid md:grid-cols-2 gap-4">
            <Field title="Inside Chittagong">
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-black/40">
                  ৳
                </span>

                <input
                  type="number"
                  min="0"
                  step="0.01"
                  className={`${input} pl-9`}
                  value={
                    f.shippingChittagong ??
                    0
                  }
                  onChange={(
                    event,
                  ) =>
                    setF(
                      (
                        previous,
                      ) => ({
                        ...previous,

                        shippingChittagong:
                          Number(
                            event
                              .target
                              .value,
                          ),
                      }),
                    )
                  }
                />
              </div>
            </Field>

            <Field title="Outside Chittagong">
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-black/40">
                  ৳
                </span>

                <input
                  type="number"
                  min="0"
                  step="0.01"
                  className={`${input} pl-9`}
                  value={
                    f.shippingOutsideChittagong ??
                    0
                  }
                  onChange={(
                    event,
                  ) =>
                    setF(
                      (
                        previous,
                      ) => ({
                        ...previous,

                        shippingOutsideChittagong:
                          Number(
                            event
                              .target
                              .value,
                          ),
                      }),
                    )
                  }
                />
              </div>
            </Field>
          </div>
        </SettingsSection>

        {/* =====================================
            PAYMENT
        ===================================== */}

        <SettingsSection
          icon={
            <Smartphone
              size={20}
            />
          }
          title="Payment Methods"
          description="Numbers shown to customers during mobile payment checkout."
        >
          <div className="grid md:grid-cols-2 gap-4">
            <Field title="bKash Number">
              <input
                className={
                  input
                }
                value={
                  f.paymentSettings
                    ?.bkashNumber ||
                  ''
                }
                onChange={(
                  event,
                ) =>
                  nested(
                    'paymentSettings',
                    'bkashNumber',
                    event.target
                      .value,
                  )
                }
                placeholder="01XXXXXXXXX"
              />
            </Field>

            <Field title="Nagad Number">
              <input
                className={
                  input
                }
                value={
                  f.paymentSettings
                    ?.nagadNumber ||
                  ''
                }
                onChange={(
                  event,
                ) =>
                  nested(
                    'paymentSettings',
                    'nagadNumber',
                    event.target
                      .value,
                  )
                }
                placeholder="01XXXXXXXXX"
              />
            </Field>
          </div>
        </SettingsSection>

        {/* =====================================
            BRAND
        ===================================== */}

        <SettingsSection
          icon={
            <Palette
              size={20}
            />
          }
          title="Brand"
          description="Control your public brand name and main brand color."
        >
          <div className="grid md:grid-cols-2 gap-4">
            <Field title="Brand Name">
              <input
                className={
                  input
                }
                value={
                  f.brandSettings
                    ?.name ||
                  ''
                }
                onChange={(
                  event,
                ) =>
                  nested(
                    'brandSettings',
                    'name',
                    event.target
                      .value,
                  )
                }
                placeholder="Sharuu"
              />
            </Field>

            <Field title="Brand Color">
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  className="w-14 h-12 rounded-xl border border-black/10 p-1 cursor-pointer bg-white"
                  value={
                    f.brandSettings
                      ?.color ||
                    '#000000'
                  }
                  onChange={(
                    event,
                  ) =>
                    nested(
                      'brandSettings',
                      'color',
                      event.target
                        .value,
                    )
                  }
                />

                <input
                  className={`${input} uppercase`}
                  value={
                    f.brandSettings
                      ?.color ||
                    '#000000'
                  }
                  onChange={(
                    event,
                  ) =>
                    nested(
                      'brandSettings',
                      'color',
                      event.target
                        .value,
                    )
                  }
                  placeholder="#000000"
                />
              </div>
            </Field>
          </div>

          <div className="mt-5">
            <p className="text-[10px] font-bold uppercase tracking-widest text-black/40 mb-2">
              Preview
            </p>

            <div
              className="rounded-2xl min-h-24 flex items-center justify-center p-6"
              style={{
                backgroundColor:
                  f.brandSettings
                    ?.color ||
                  '#000000',
              }}
            >
              <span className="text-white font-black text-2xl">
                {f.brandSettings
                  ?.name ||
                  'Your Brand'}
              </span>
            </div>
          </div>
        </SettingsSection>

        {/* =====================================
            GENERAL STORE
        ===================================== */}

        <SettingsSection
          icon={
            <Store
              size={20}
            />
          }
          title="Store Information"
          description="General information about your online store."
        >
          <div className="grid md:grid-cols-2 gap-4">
            <Field title="Store Name">
              <input
                className={
                  input
                }
                value={
                  f.generalSettings
                    ?.storeName ||
                  ''
                }
                onChange={(
                  event,
                ) =>
                  nested(
                    'generalSettings',
                    'storeName',
                    event.target
                      .value,
                  )
                }
                placeholder="Sharuu Store"
              />
            </Field>

            <Field title="Store Email">
              <input
                type="email"
                className={
                  input
                }
                value={
                  f.generalSettings
                    ?.storeEmail ||
                  ''
                }
                onChange={(
                  event,
                ) =>
                  nested(
                    'generalSettings',
                    'storeEmail',
                    event.target
                      .value,
                  )
                }
                placeholder="store@example.com"
              />
            </Field>

            <div className="md:col-span-2">
              <Field title="Store Description">
                <textarea
                  rows="4"
                  className={
                    input
                  }
                  value={
                    f.generalSettings
                      ?.storeDescription ||
                    ''
                  }
                  onChange={(
                    event,
                  ) =>
                    nested(
                      'generalSettings',
                      'storeDescription',
                      event.target
                        .value,
                    )
                  }
                  placeholder="Write a short description about your store..."
                />
              </Field>
            </div>
          </div>
        </SettingsSection>

        {/* =====================================
            CONTACT
        ===================================== */}

        <SettingsSection
          icon={
            <Mail
              size={20}
            />
          }
          title="Contact Information"
          description="Public contact information shown to customers."
        >
          <div className="grid md:grid-cols-2 gap-4">
            <Field title="Contact Email">
              <input
                type="email"
                className={
                  input
                }
                value={
                  f.contactSettings
                    ?.email ||
                  ''
                }
                onChange={(
                  event,
                ) =>
                  nested(
                    'contactSettings',
                    'email',
                    event.target
                      .value,
                  )
                }
                placeholder="support@example.com"
              />
            </Field>

            <Field title="Phone Number">
              <input
                className={
                  input
                }
                value={
                  f.contactSettings
                    ?.contactPhone ||
                  ''
                }
                onChange={(
                  event,
                ) =>
                  nested(
                    'contactSettings',
                    'contactPhone',
                    event.target
                      .value,
                  )
                }
                placeholder="01XXXXXXXXX"
              />
            </Field>

            <div className="md:col-span-2">
              <Field title="Address">
                <div className="relative">
                  <MapPin
                    size={16}
                    className="absolute left-4 top-4 text-black/30"
                  />

                  <textarea
                    rows="3"
                    className={`${input} pl-11`}
                    value={
                      f.contactSettings
                        ?.address ||
                      ''
                    }
                    onChange={(
                      event,
                    ) =>
                      nested(
                        'contactSettings',
                        'address',
                        event.target
                          .value,
                      )
                    }
                    placeholder="Full store address"
                  />
                </div>
              </Field>
            </div>
          </div>
        </SettingsSection>

        {/* =====================================
            SOCIAL LINKS
        ===================================== */}

        <SettingsSection
          icon={
            <ExternalLink
              size={20}
            />
          }
          title="Social Links"
          description="Add Facebook, Instagram, WhatsApp or any other social profile. No JSON required."
        >
          <div className="space-y-3">
            {socialLinks.map(
              (
                social,
                index,
              ) => (
                <div
                  key={index}
                  className="grid grid-cols-1 md:grid-cols-[180px_1fr_44px] gap-3 items-center p-3 rounded-2xl border border-black/5 bg-neutral-50/60"
                >
                  <select
                    className={
                      input
                    }
                    value={
                      social.platform ||
                      ''
                    }
                    onChange={(
                      event,
                    ) =>
                      updateSocialLink(
                        index,
                        'platform',
                        event.target
                          .value,
                      )
                    }
                  >
                    <option value="">
                      Select Platform
                    </option>

                    <option value="Facebook">
                      Facebook
                    </option>

                    <option value="Instagram">
                      Instagram
                    </option>

                    <option value="WhatsApp">
                      WhatsApp
                    </option>

                    <option value="YouTube">
                      YouTube
                    </option>

                    <option value="TikTok">
                      TikTok
                    </option>

                    <option value="LinkedIn">
                      LinkedIn
                    </option>

                    <option value="X">
                      X / Twitter
                    </option>

                    <option value="Pinterest">
                      Pinterest
                    </option>
                  </select>

                  <input
                    className={
                      input
                    }
                    value={
                      social.url ||
                      ''
                    }
                    onChange={(
                      event,
                    ) =>
                      updateSocialLink(
                        index,
                        'url',
                        event.target
                          .value,
                      )
                    }
                    placeholder={
                      social.platform ===
                      'WhatsApp'
                        ? 'https://wa.me/8801XXXXXXXXX'
                        : 'https://...'
                    }
                  />

                  <button
                    type="button"
                    onClick={() =>
                      removeSocialLink(
                        index,
                      )
                    }
                    className="w-11 h-11 rounded-xl text-red-600 hover:bg-red-50 border border-red-100 flex items-center justify-center"
                    title="Remove"
                  >
                    <Trash2
                      size={16}
                    />
                  </button>
                </div>
              ),
            )}

            {socialLinks.length ===
              0 && (
              <div className="py-8 border border-dashed border-black/10 rounded-2xl text-center">
                <ExternalLink
                  size={27}
                  className="mx-auto text-black/20"
                />

                <p className="text-xs text-black/40 mt-2">
                  No social links
                  added yet.
                </p>
              </div>
            )}

            <button
              type="button"
              onClick={
                addSocialLink
              }
              className="inline-flex items-center gap-2 text-sm font-bold px-4 py-3 rounded-xl border border-black/10 hover:bg-neutral-50"
            >
              <Plus
                size={16}
              />

              Add Social Link
            </button>
          </div>
        </SettingsSection>

        {/* =====================================
            CATEGORY SUBTITLES
        ===================================== */}

        <SettingsSection
          icon={
            <Settings
              size={20}
            />
          }
          title="Category Subtitles"
          description="Set a short subtitle for each category without editing JSON."
        >
          <CategorySubtitleEditor
            value={
              f.categorySubtitles ||
              {}
            }
            onChange={(
              next,
            ) =>
              setF(
                (
                  previous,
                ) => ({
                  ...previous,

                  categorySubtitles:
                    next,
                }),
              )
            }
          />
        </SettingsSection>

        {/* =====================================
            SAVE
        ===================================== */}

        <div className="sticky bottom-4 z-20">
          <button
            type="button"
            disabled={saving}
            onClick={save}
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
                  size={18}
                />

                Save Store Settings
              </>
            )}
          </button>
        </div>
      </div>
    </>
  );
}

/* =========================================
   SETTINGS SECTION
========================================= */

function SettingsSection({
  icon,
  title,
  description,
  children,
}) {
  return (
    <section
      className={`${box} p-5 md:p-7`}
    >
      <div className="flex items-start gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-neutral-100 flex items-center justify-center flex-shrink-0">
          {icon}
        </div>

        <div>
          <h2 className="text-lg font-black">
            {title}
          </h2>

          {description && (
            <p className="text-xs md:text-sm text-black/45 mt-1">
              {description}
            </p>
          )}
        </div>
      </div>

      {children}
    </section>
  );
}

/* =========================================
   CATEGORY SUBTITLE EDITOR
========================================= */

function CategorySubtitleEditor({
  value,
  onChange,
}) {
  const [
    rows,
    setRows,
  ] = useState(() =>
    Object.entries(
      value || {},
    ).map(
      ([
        category,
        subtitle,
      ]) => ({
        category,
        subtitle,
      }),
    ),
  );

  useEffect(() => {
    setRows(
      Object.entries(
        value || {},
      ).map(
        ([
          category,
          subtitle,
        ]) => ({
          category,
          subtitle,
        }),
      ),
    );
  }, [value]);

  const commit = (
    nextRows,
  ) => {
    setRows(nextRows);

    const result =
      {};

    nextRows.forEach(
      (row) => {
        const category =
          String(
            row.category ||
              '',
          ).trim();

        if (!category) {
          return;
        }

        result[category] =
          row.subtitle ||
          '';
      },
    );

    onChange(result);
  };

  const add = () => {
    setRows(
      (
        previous,
      ) => [
        ...previous,

        {
          category: '',
          subtitle: '',
        },
      ],
    );
  };

  const update = (
    index,
    key,
    value,
  ) => {
    const next =
      rows.map(
        (
          row,
          rowIndex,
        ) =>
          rowIndex ===
          index
            ? {
                ...row,
                [key]: value,
              }
            : row,
      );

    /*
      Local state first so user can type
      a new empty category name normally.
    */

    setRows(next);

    const result =
      {};

    next.forEach(
      (row) => {
        const category =
          String(
            row.category ||
              '',
          ).trim();

        if (
          category
        ) {
          result[category] =
            row.subtitle ||
            '';
        }
      },
    );

    onChange(result);
  };

  const remove = (
    index,
  ) => {
    commit(
      rows.filter(
        (_, rowIndex) =>
          rowIndex !==
          index,
      ),
    );
  };

  return (
    <div className="space-y-3">
      {rows.map(
        (
          row,
          index,
        ) => (
          <div
            key={index}
            className="grid grid-cols-1 md:grid-cols-[220px_1fr_44px] gap-3 items-center p-3 rounded-2xl border border-black/5 bg-neutral-50/60"
          >
            <input
              className={
                input
              }
              value={
                row.category
              }
              onChange={(
                event,
              ) =>
                update(
                  index,
                  'category',
                  event.target
                    .value,
                )
              }
              placeholder="Category name"
            />

            <input
              className={
                input
              }
              value={
                row.subtitle
              }
              onChange={(
                event,
              ) =>
                update(
                  index,
                  'subtitle',
                  event.target
                    .value,
                )
              }
              placeholder="Short subtitle..."
            />

            <button
              type="button"
              onClick={() =>
                remove(
                  index,
                )
              }
              className="w-11 h-11 rounded-xl text-red-600 border border-red-100 hover:bg-red-50 flex items-center justify-center"
            >
              <Trash2
                size={16}
              />
            </button>
          </div>
        ),
      )}

      {rows.length ===
        0 && (
        <div className="py-8 border border-dashed border-black/10 rounded-2xl text-center">
          <p className="text-xs text-black/40">
            No category
            subtitles added.
          </p>
        </div>
      )}

      <button
        type="button"
        onClick={add}
        className="inline-flex items-center gap-2 text-sm font-bold px-4 py-3 rounded-xl border border-black/10 hover:bg-neutral-50"
      >
        <Plus
          size={16}
        />

        Add Category
      </button>
    </div>
  );
}