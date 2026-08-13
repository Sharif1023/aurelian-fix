import crypto from 'node:crypto';

import { pool } from '../config/db.js';
import { getSetting } from './settings.service.js';
import { HttpError } from '../utils/http.js';
import { orderDto } from './serializers.js';

/* =========================================================
   BASIC HELPERS
========================================================= */

const normalizePhone = (value = '') =>
  String(value ?? '').replace(/\D/g, '');

const normalizeEmail = (value = '') =>
  String(value ?? '')
    .trim()
    .toLowerCase();

const normalizeKey = (value = '') =>
  String(value ?? '')
    .trim()
    .toLowerCase();

const orderNumber = () =>
  `SHR-${new Date().getFullYear()}-${crypto
    .randomBytes(3)
    .toString('hex')
    .toUpperCase()}`;

const parseJsonArray = (value) => {
  if (Array.isArray(value)) {
    return JSON.parse(JSON.stringify(value));
  }

  if (value == null || value === '') {
    return [];
  }

  if (typeof value === 'string') {
    try {
      const parsed = JSON.parse(value);

      return Array.isArray(parsed)
        ? parsed
        : [];
    } catch {
      return [];
    }
  }

  return [];
};

const colorNameOf = (colorItem) => {
  if (typeof colorItem === 'string') {
    return colorItem;
  }

  return (
    colorItem?.name ||
    colorItem?.label ||
    colorItem?.color ||
    ''
  );
};

const sizeNameOf = (sizeItem) => {
  if (typeof sizeItem === 'string') {
    return sizeItem;
  }

  return sizeItem?.size || '';
};

const quantityOf = (item) =>
  Math.max(
    0,
    Number(item?.quantity || 0),
  );

/* =========================================================
   INVENTORY HELPERS
========================================================= */

const createInventoryState = (productRow) => ({
  id: Number(productRow.id),

  name: productRow.name,

  stock: Math.max(
    0,
    Number(productRow.stock || 0),
  ),

  sizes: parseJsonArray(
    productRow.sizes,
  ),

  colors: parseJsonArray(
    productRow.colors,
  ),

  showSizeSection:
    productRow.show_size_section !== 0 &&
    productRow.show_size_section !== false,

  changed: false,
});

const hasColorWiseInventory = (state) =>
  state.colors.some(
    (colorItem) =>
      colorItem &&
      typeof colorItem === 'object' &&
      Array.isArray(colorItem.sizes) &&
      colorItem.sizes.length > 0,
  );

const hasTrackedMasterSizeInventory = (state) =>
  state.sizes.some(
    (sizeItem) =>
      quantityOf(sizeItem) > 0,
  );

const findColorIndex = (
  colors,
  selectedColor,
) => {
  const wanted =
    normalizeKey(selectedColor);

  return colors.findIndex(
    (colorItem) =>
      normalizeKey(
        colorNameOf(colorItem),
      ) === wanted,
  );
};

const findSizeIndex = (
  sizes,
  selectedSize,
) => {
  const wanted =
    normalizeKey(selectedSize);

  return sizes.findIndex(
    (sizeItem) =>
      normalizeKey(
        sizeNameOf(sizeItem),
      ) === wanted,
  );
};

const updateMasterSizeQuantity = (
  state,
  selectedSize,
  quantityDelta,
) => {
  if (
    !selectedSize ||
    !Array.isArray(state.sizes)
  ) {
    return;
  }

  const sizeIndex =
    findSizeIndex(
      state.sizes,
      selectedSize,
    );

  if (sizeIndex < 0) {
    return;
  }

  const oldSize =
    state.sizes[sizeIndex];

  if (
    !oldSize ||
    typeof oldSize !== 'object'
  ) {
    return;
  }

  const nextQuantity =
    Math.max(
      0,
      quantityOf(oldSize) +
        quantityDelta,
    );

  state.sizes[sizeIndex] = {
    ...oldSize,

    quantity:
      nextQuantity,

    isAvailable:
      nextQuantity > 0,
  };
};

/*
  direction:
  -1 = order placed
  +1 = cancelled order stock return
*/

const applyInventoryChange = (
  state,
  {
    size,
    color,
    quantity,
  },
  direction,
) => {
  const qty =
    Math.max(
      0,
      Number(quantity || 0),
    );

  if (!qty) {
    return;
  }

  const delta =
    direction * qty;

  /* =========================================
     PRODUCT WITHOUT SIZE
  ========================================= */

  if (!state.showSizeSection) {
    if (
      direction < 0 &&
      state.stock < qty
    ) {
      throw new HttpError(
        409,
        `${state.name} does not have enough stock.`,
      );
    }

    state.stock =
      Math.max(
        0,
        state.stock + delta,
      );

    state.changed = true;

    return;
  }

  const colorWise =
    hasColorWiseInventory(
      state,
    );

  /* =========================================
     COLOR-WISE SIZE INVENTORY
  ========================================= */

  if (colorWise) {
    const selectedColor =
      String(
        color || '',
      ).trim();

    const selectedSize =
      String(
        size || '',
      ).trim();

    if (
      !selectedColor ||
      selectedColor === 'Default'
    ) {
      throw new HttpError(
        400,
        `Please select a color for ${state.name}.`,
      );
    }

    if (!selectedSize) {
      throw new HttpError(
        400,
        `Please select a size for ${state.name}.`,
      );
    }

    const colorIndex =
      findColorIndex(
        state.colors,
        selectedColor,
      );

    if (colorIndex < 0) {
      throw new HttpError(
        409,
        `${selectedColor} is not available for ${state.name}.`,
      );
    }

    const colorItem =
      state.colors[
        colorIndex
      ];

    const colorSizes =
      Array.isArray(
        colorItem?.sizes,
      )
        ? [
            ...colorItem.sizes,
          ]
        : [];

    const sizeIndex =
      findSizeIndex(
        colorSizes,
        selectedSize,
      );

    if (sizeIndex < 0) {
      throw new HttpError(
        409,
        `Size ${selectedSize} is not available in ${selectedColor} for ${state.name}.`,
      );
    }

    const sizeItem =
      colorSizes[
        sizeIndex
      ];

    const currentQuantity =
      quantityOf(
        sizeItem,
      );

    if (
      direction < 0 &&
      (
        sizeItem?.isAvailable !== true ||
        currentQuantity < qty
      )
    ) {
      throw new HttpError(
        409,
        `${state.name} (${selectedColor}, ${selectedSize}) only has ${currentQuantity} left.`,
      );
    }

    const nextQuantity =
      Math.max(
        0,
        currentQuantity +
          delta,
      );

    colorSizes[
      sizeIndex
    ] = {
      ...sizeItem,

      size:
        sizeNameOf(
          sizeItem,
        ) ||
        selectedSize,

      quantity:
        nextQuantity,

      isAvailable:
        nextQuantity > 0,
    };

    state.colors[
      colorIndex
    ] = {
      ...colorItem,

      sizes:
        colorSizes,
    };

    /*
      Master size quantity-ও
      selected size অনুযায়ী
      update হবে.
    */

    updateMasterSizeQuantity(
      state,
      selectedSize,
      delta,
    );

    if (
      direction < 0 &&
      state.stock < qty
    ) {
      throw new HttpError(
        409,
        `${state.name} does not have enough total stock.`,
      );
    }

    state.stock =
      Math.max(
        0,
        state.stock + delta,
      );

    state.changed = true;

    return;
  }

  /* =========================================
     NORMAL SIZE INVENTORY
  ========================================= */

  if (
    size &&
    hasTrackedMasterSizeInventory(
      state,
    )
  ) {
    const sizeIndex =
      findSizeIndex(
        state.sizes,
        size,
      );

    if (sizeIndex < 0) {
      throw new HttpError(
        409,
        `Size ${size} is not available for ${state.name}.`,
      );
    }

    const sizeItem =
      state.sizes[
        sizeIndex
      ];

    const currentQuantity =
      quantityOf(
        sizeItem,
      );

    if (
      direction < 0 &&
      (
        sizeItem?.isAvailable === false ||
        currentQuantity < qty
      )
    ) {
      throw new HttpError(
        409,
        `${state.name} (${size}) only has ${currentQuantity} left.`,
      );
    }

    const nextQuantity =
      Math.max(
        0,
        currentQuantity +
          delta,
      );

    state.sizes[
      sizeIndex
    ] = {
      ...sizeItem,

      quantity:
        nextQuantity,

      isAvailable:
        nextQuantity > 0,
    };
  }

  if (
    direction < 0 &&
    state.stock < qty
  ) {
    throw new HttpError(
      409,
      `${state.name} does not have enough stock.`,
    );
  }

  state.stock =
    Math.max(
      0,
      state.stock + delta,
    );

  state.changed = true;
};

/* =========================================
   SAVE INVENTORY
========================================= */

const persistInventoryStates = async (
  conn,
  states,
) => {
  for (const state of states) {
    if (!state.changed) {
      continue;
    }

    await conn.query(
      `
      UPDATE products

      SET
        stock = ?,
        sizes = ?,
        colors = ?

      WHERE id = ?
      `,
      [
        state.stock,

        JSON.stringify(
          state.sizes || [],
        ),

        JSON.stringify(
          state.colors || [],
        ),

        state.id,
      ],
    );
  }
};

/* =========================================================
   COUPON
========================================================= */

async function couponFor(
  code,
  subtotal,
  db,
) {
  if (!code) {
    return null;
  }

  const [rows] =
    await db.query(
      `
      SELECT *
      FROM coupons

      WHERE code = ?
        AND is_active = 1

        AND (
          starts_at IS NULL
          OR starts_at <= NOW()
        )

        AND (
          expires_at IS NULL
          OR expires_at >= NOW()
        )

      LIMIT 1
      `,
      [
        String(code)
          .trim()
          .toUpperCase(),
      ],
    );

  const coupon =
    rows[0];

  if (!coupon) {
    throw new HttpError(
      400,
      'Invalid or inactive coupon code.',
    );
  }

  if (
    Number(
      subtotal,
    ) <
    Number(
      coupon.min_subtotal ||
        0,
    )
  ) {
    throw new HttpError(
      400,
      `Minimum subtotal for this coupon is ৳${Number(
        coupon.min_subtotal,
      ).toFixed(2)}.`,
    );
  }

  const raw =
    (
      Number(
        subtotal,
      ) *
      Number(
        coupon.discount_percent,
      )
    ) /
    100;

  const amount =
    coupon.max_discount ==
    null
      ? raw
      : Math.min(
          raw,
          Number(
            coupon.max_discount,
          ),
        );

  return {
    row:
      coupon,

    amount:
      Number(
        amount.toFixed(
          2,
        ),
      ),
  };
}

/* =========================================
   VALIDATE COUPON
========================================= */

export async function validateCoupon(
  code,
  subtotal,
) {
  const coupon =
    await couponFor(
      code,
      Number(
        subtotal ||
          0,
      ),
      pool,
    );

  return {
    code:
      coupon.row.code,

    discountPercent:
      Number(
        coupon.row
          .discount_percent,
      ),

    discountAmount:
      coupon.amount,

    minSubtotal:
      Number(
        coupon.row
          .min_subtotal ||
          0,
      ),

    maxDiscount:
      coupon.row
        .max_discount ==
      null
        ? null
        : Number(
            coupon.row
              .max_discount,
          ),
  };
}

/* =========================================================
   CUSTOMER
========================================================= */

async function resolveCustomerId(
  conn,
  {
    customerName,
    email,
    phone,
    address,
    city,
  },
) {
  const emailNorm =
    normalizeEmail(
      email,
    );

  const phoneClean =
    String(
      phone ?? '',
    ).trim();

  const phoneNorm =
    normalizePhone(
      phoneClean,
    );

  /* =========================================
     EMAIL PROVIDED
  ========================================= */

  if (emailNorm) {
    await conn.query(
      `
      INSERT INTO customers (
        name,
        email,
        phone,
        address,
        city
      )

      VALUES (
        ?,
        ?,
        ?,
        ?,
        ?
      )

      ON DUPLICATE KEY UPDATE
        name = VALUES(name),
        phone = VALUES(phone),
        address = VALUES(address),
        city = VALUES(city),
        updated_at =
          CURRENT_TIMESTAMP
      `,
      [
        customerName.trim(),
        emailNorm,
        phoneClean,
        address.trim(),
        city.trim(),
      ],
    );

    const [
      customerRows,
    ] =
      await conn.query(
        `
        SELECT id
        FROM customers

        WHERE email = ?

        LIMIT 1
        `,
        [
          emailNorm,
        ],
      );

    return (
      customerRows[0]
        ?.id ||
      null
    );
  }

  /* =========================================
     EMAIL NOT PROVIDED
     FIND CUSTOMER BY PHONE
  ========================================= */

  const [phoneRows] =
    await conn.query(
      `
      SELECT id

      FROM customers

      WHERE
        REPLACE(
          REPLACE(
            REPLACE(
              REPLACE(
                phone,
                ' ',
                ''
              ),
              '-',
              ''
            ),
            '(',
            ''
          ),
          ')',
          ''
        ) = ?

      ORDER BY id DESC

      LIMIT 1
      `,
      [
        phoneNorm,
      ],
    );

  if (
    phoneRows[0]
      ?.id
  ) {
    await conn.query(
      `
      UPDATE customers

      SET
        name = ?,
        phone = ?,
        address = ?,
        city = ?,
        updated_at =
          CURRENT_TIMESTAMP

      WHERE id = ?
      `,
      [
        customerName.trim(),
        phoneClean,
        address.trim(),
        city.trim(),

        phoneRows[0]
          .id,
      ],
    );

    return (
      phoneRows[0]
        .id
    );
  }

  /* =========================================
     NEW CUSTOMER WITHOUT EMAIL
  ========================================= */

  const [result] =
    await conn.query(
      `
      INSERT INTO customers (
        name,
        email,
        phone,
        address,
        city
      )

      VALUES (
        ?,
        NULL,
        ?,
        ?,
        ?
      )
      `,
      [
        customerName.trim(),
        phoneClean,
        address.trim(),
        city.trim(),
      ],
    );

  return (
    result.insertId ||
    null
  );
}

/* =========================================================
   CREATE ORDER
========================================================= */

export async function createOrder(
  payload,
) {
  const {
    customerName,

    email,

    phone,

    address,

    city = '',

    zip = '',

    shippingArea =
      'Outside',

    paymentMethod =
      'COD',

    transactionId =
      '',

    couponCode =
      '',

    items = [],
  } = payload || {};

  /* =========================================
     VALIDATION
  ========================================= */

  if (
    !customerName?.trim() ||
    !phone?.trim() ||
    !address?.trim() ||
    !city?.trim()
  ) {
    throw new HttpError(
      400,
      'Name, phone, address and city are required.',
    );
  }

  if (
    !Array.isArray(
      items,
    ) ||
    items.length ===
      0
  ) {
    throw new HttpError(
      400,
      'Your cart is empty.',
    );
  }

  if (
    ![
      'Chittagong',
      'Outside',
    ].includes(
      shippingArea,
    )
  ) {
    throw new HttpError(
      400,
      'Invalid shipping area.',
    );
  }

  if (
    ![
      'COD',
      'bKash',
      'Nagad',
    ].includes(
      paymentMethod,
    )
  ) {
    throw new HttpError(
      400,
      'Invalid payment method.',
    );
  }

  if (
    [
      'bKash',
      'Nagad',
    ].includes(
      paymentMethod,
    ) &&
    !String(
      transactionId,
    ).trim()
  ) {
    throw new HttpError(
      400,
      'Transaction ID is required for mobile payment.',
    );
  }

  /* =========================================
     START TRANSACTION
  ========================================= */

  const conn =
    await pool.getConnection();

  try {
    await conn.beginTransaction();

    /*
      Same product multiple variants allowed.

      Example:

      Black / M
      White / L

      Same product ID হলেও
      order valid হবে.
    */

    const ids = [
      ...new Set(
        items
          .map(
            (
              item,
            ) =>
              Number(
                item.productId,
              ),
          )
          .filter(
            Boolean,
          ),
      ),
    ];

    if (!ids.length) {
      throw new HttpError(
        400,
        'Invalid product selection.',
      );
    }

    const placeholders =
      ids
        .map(
          () => '?',
        )
        .join(',');

    /* =========================================
       LOCK PRODUCTS
    ========================================= */

    const [
      products,
    ] =
      await conn.query(
        `
        SELECT *

        FROM products

        WHERE id IN (
          ${placeholders}
        )

        FOR UPDATE
        `,
        ids,
      );

    if (
      products.length !==
      ids.length
    ) {
      throw new HttpError(
        400,
        'One or more products are unavailable.',
      );
    }

    const productMap =
      new Map(
        products.map(
          (
            product,
          ) => [
            Number(
              product.id,
            ),

            product,
          ],
        ),
      );

    /*
      Working stock copy.

      Same product-এর multiple
      variants order হলে
      one-by-one stock update হবে.
    */

    const inventoryMap =
      new Map(
        products.map(
          (
            product,
          ) => [
            Number(
              product.id,
            ),

            createInventoryState(
              product,
            ),
          ],
        ),
      );

    let subtotal =
      0;

    const safeItems =
      [];

    /* =========================================
       VALIDATE ITEMS + REDUCE STOCK IN MEMORY
    ========================================= */

    for (
      const item
      of items
    ) {
      const productId =
        Number(
          item.productId,
        );

      const product =
        productMap.get(
          productId,
        );

      const inventory =
        inventoryMap.get(
          productId,
        );

      const quantity =
        Number(
          item.quantity,
        );

      if (
        !product ||
        !inventory ||
        product.status !==
          'Active'
      ) {
        throw new HttpError(
          400,
          'One or more products are unavailable.',
        );
      }

      if (
        !Number.isInteger(
          quantity,
        ) ||
        quantity < 1 ||
        quantity > 50
      ) {
        throw new HttpError(
          400,
          'Invalid product quantity.',
        );
      }

      const selectedSize =
        item.size
          ? String(
              item.size,
            ).trim()
          : null;

      const selectedColor =
        item.color
          ? String(
              item.color,
            ).trim()
          : null;

      /*
        THIS IS THE IMPORTANT FIX.

        Example:

        Black
        M = 16

        Order:
        Black
        M
        Qty 1

        এখানে Black/M:
        16 -> 15 হবে.
      */

      applyInventoryChange(
        inventory,
        {
          size:
            selectedSize,

          color:
            selectedColor,

          quantity,
        },
        -1,
      );

      subtotal +=
        Number(
          product.price,
        ) *
        quantity;

      safeItems.push({
        product,

        quantity,

        size:
          selectedSize,

        color:
          selectedColor,
      });
    }

    subtotal =
      Number(
        subtotal.toFixed(
          2,
        ),
      );

    /* =========================================
       SHIPPING
    ========================================= */

    const store =
      await getSetting(
        'store_settings',
        conn,
      );

    const shippingCost =
      Number(
        shippingArea ===
          'Chittagong'
          ? store
              .shippingChittagong ??
              60
          : store
              .shippingOutsideChittagong ??
              120,
      );

    /* =========================================
       COUPON
    ========================================= */

    const coupon =
      await couponFor(
        couponCode,
        subtotal,
        conn,
      );

    const discountAmount =
      coupon?.amount ||
      0;

    /* =========================================
       TOTAL
    ========================================= */

    const total =
      Number(
        (
          subtotal +
          shippingCost -
          discountAmount
        ).toFixed(
          2,
        ),
      );

    /* =========================================
       CUSTOMER
    ========================================= */

    const emailNorm =
      normalizeEmail(
        email,
      );

    const customerId =
      await resolveCustomerId(
        conn,
        {
          customerName,

          email:
            emailNorm,

          phone,

          address,

          city,
        },
      );

    /* =========================================
       ORDER
    ========================================= */

    const number =
      orderNumber();

    const paymentStatus =
      paymentMethod ===
      'COD'
        ? 'Unpaid'
        : 'Pending';

    const [
      result,
    ] =
      await conn.query(
        `
        INSERT INTO orders (
          order_number,
          customer_id,
          customer_name,
          email,
          phone,
          address,
          city,
          zip,
          subtotal,
          shipping_area,
          shipping_cost,
          coupon_code,
          discount_amount,
          total,
          payment_method,
          transaction_id,
          payment_status,
          status
        )

        VALUES (
          ?,
          ?,
          ?,
          ?,
          ?,
          ?,
          ?,
          ?,
          ?,
          ?,
          ?,
          ?,
          ?,
          ?,
          ?,
          ?,
          ?,
          'Pending'
        )
        `,
        [
          number,

          customerId,

          customerName.trim(),

          emailNorm ||
            null,

          phone.trim(),

          address.trim(),

          city.trim(),

          zip || '',

          subtotal,

          shippingArea,

          shippingCost,

          coupon?.row
            .code ||
            null,

          discountAmount,

          total,

          paymentMethod,

          transactionId ||
            null,

          paymentStatus,
        ],
      );

    /* =========================================
       ORDER ITEMS
    ========================================= */

    for (
      const {
        product,
        quantity,
        size,
        color,
      }
      of safeItems
    ) {
      await conn.query(
        `
        INSERT INTO order_items (
          order_id,
          product_id,
          product_name,
          price,
          quantity,
          size,
          color,
          image_url
        )

        VALUES (
          ?,
          ?,
          ?,
          ?,
          ?,
          ?,
          ?,
          ?
        )
        `,
        [
          result.insertId,

          product.id,

          product.name,

          product.price,

          quantity,

          size,

          color,

          product.image ||
            '',
        ],
      );
    }

    /* =========================================
       SAVE STOCK CHANGES

       Updates:

       products.stock
       products.sizes
       products.colors
    ========================================= */

    await persistInventoryStates(
      conn,
      inventoryMap.values(),
    );

    /* =========================================
       COMPLETE
    ========================================= */

    await conn.commit();

    return getOrder(
      result.insertId,
      pool,
    );
  } catch (error) {
    await conn.rollback();

    throw error;
  } finally {
    conn.release();
  }
}

/* =========================================================
   GET ORDER
========================================================= */

export async function getOrder(
  id,
  db = pool,
) {
  const [rows] =
    await db.query(
      `
      SELECT *

      FROM orders

      WHERE id = ?

      LIMIT 1
      `,
      [
        id,
      ],
    );

  if (!rows[0]) {
    return null;
  }

  const [items] =
    await db.query(
      `
      SELECT *

      FROM order_items

      WHERE order_id = ?

      ORDER BY id
      `,
      [
        id,
      ],
    );

  return orderDto(
    rows[0],
    items,
  );
}

/* =========================================================
   LIST ORDERS
========================================================= */

export async function listOrders() {
  const [rows] =
    await pool.query(
      `
      SELECT *

      FROM orders

      ORDER BY
        created_at DESC
      `,
    );

  const output =
    [];

  for (
    const order
    of rows
  ) {
    output.push(
      await getOrder(
        order.id,
      ),
    );
  }

  return output;
}

/* =========================================================
   TRACK ORDER
========================================================= */

export async function trackOrder(
  number,
  identifier,
) {
  const ident =
    String(
      identifier ||
        '',
    ).trim();

  if (
    !number ||
    !ident
  ) {
    throw new HttpError(
      400,
      'Order number and email/phone are required.',
    );
  }

  const [rows] =
    await pool.query(
      `
      SELECT *

      FROM orders

      WHERE order_number = ?

      LIMIT 1
      `,
      [
        String(
          number,
        )
          .trim()
          .toUpperCase(),
      ],
    );

  const order =
    rows[0];

  if (!order) {
    throw new HttpError(
      404,
      'Order not found.',
    );
  }

  const emailMatches =
    normalizeEmail(
      order.email,
    ) &&
    normalizeEmail(
      ident,
    ) ===
      normalizeEmail(
        order.email,
      );

  const phoneMatches =
    normalizePhone(
      ident,
    ) ===
    normalizePhone(
      order.phone,
    );

  if (
    !emailMatches &&
    !phoneMatches
  ) {
    throw new HttpError(
      404,
      'Order not found.',
    );
  }

  return getOrder(
    order.id,
  );
}

/* =========================================================
   LOAD PRODUCT INVENTORY FOR ORDER ITEMS
========================================================= */

async function inventoryForOrderItems(
  conn,
  items,
) {
  const productIds =
    [
      ...new Set(
        items
          .map(
            (
              item,
            ) =>
              Number(
                item.product_id,
              ),
          )
          .filter(
            Boolean,
          ),
      ),
    ];

  if (
    !productIds.length
  ) {
    return new Map();
  }

  const placeholders =
    productIds
      .map(
        () => '?',
      )
      .join(',');

  const [
    products,
  ] =
    await conn.query(
      `
      SELECT *

      FROM products

      WHERE id IN (
        ${placeholders}
      )

      FOR UPDATE
      `,
      productIds,
    );

  return new Map(
    products.map(
      (
        product,
      ) => [
        Number(
          product.id,
        ),

        createInventoryState(
          product,
        ),
      ],
    ),
  );
}

/* =========================================================
   UPDATE ORDER STATUS
========================================================= */

export async function updateStatus(
  id,
  status,
) {
  const allowedStatuses =
    [
      'Pending',
      'Processing',
      'Shipped',
      'Delivered',
      'Cancelled',
    ];

  if (
    !allowedStatuses.includes(
      status,
    )
  ) {
    throw new HttpError(
      400,
      'Invalid order status.',
    );
  }

  const conn =
    await pool.getConnection();

  try {
    await conn.beginTransaction();

    const [rows] =
      await conn.query(
        `
        SELECT *

        FROM orders

        WHERE id = ?

        FOR UPDATE
        `,
        [
          id,
        ],
      );

    const order =
      rows[0];

    if (!order) {
      throw new HttpError(
        404,
        'Order not found.',
      );
    }

    if (
      order.status !==
      status
    ) {
      /*
        Color + Size নিতে হবে কারণ
        cancel করলে exact variant
        stock return করতে হবে.
      */

      const [items] =
        await conn.query(
          `
          SELECT
            product_id,
            quantity,
            size,
            color

          FROM order_items

          WHERE order_id = ?

          ORDER BY id
          `,
          [
            id,
          ],
        );

      /* =========================================
         ORDER CANCELLED
         STOCK RETURN
      ========================================= */

      if (
        status ===
          'Cancelled' &&
        order.status !==
          'Cancelled'
      ) {
        const inventoryMap =
          await inventoryForOrderItems(
            conn,
            items,
          );

        for (
          const item
          of items
        ) {
          if (
            !item.product_id
          ) {
            continue;
          }

          const inventory =
            inventoryMap.get(
              Number(
                item.product_id,
              ),
            );

          if (!inventory) {
            continue;
          }

          /*
            +1 = return stock
          */

          applyInventoryChange(
            inventory,
            {
              size:
                item.size,

              color:
                item.color,

              quantity:
                item.quantity,
            },
            +1,
          );
        }

        await persistInventoryStates(
          conn,
          inventoryMap.values(),
        );
      }

      /* =========================================
         CANCELLED ORDER REOPEN
         STOCK REDUCE AGAIN
      ========================================= */

      if (
        order.status ===
          'Cancelled' &&
        status !==
          'Cancelled'
      ) {
        const inventoryMap =
          await inventoryForOrderItems(
            conn,
            items,
          );

        for (
          const item
          of items
        ) {
          if (
            !item.product_id
          ) {
            continue;
          }

          const inventory =
            inventoryMap.get(
              Number(
                item.product_id,
              ),
            );

          if (!inventory) {
            throw new HttpError(
              409,
              'A product from this order no longer exists.',
            );
          }

          /*
            -1 = decrease stock
          */

          applyInventoryChange(
            inventory,
            {
              size:
                item.size,

              color:
                item.color,

              quantity:
                item.quantity,
            },
            -1,
          );
        }

        await persistInventoryStates(
          conn,
          inventoryMap.values(),
        );
      }

      /* =========================================
         UPDATE ORDER STATUS
      ========================================= */

      await conn.query(
        `
        UPDATE orders

        SET status = ?

        WHERE id = ?
        `,
        [
          status,
          id,
        ],
      );
    }

    await conn.commit();

    return getOrder(
      id,
      pool,
    );
  } catch (error) {
    await conn.rollback();

    throw error;
  } finally {
    conn.release();
  }
}