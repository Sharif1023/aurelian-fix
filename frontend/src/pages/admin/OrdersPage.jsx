import { useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import {
  Trash2,
  ChevronDown,
  ChevronUp,
  Package,
  MapPin,
  Phone,
  Mail,
  CreditCard,
  TicketPercent,
} from 'lucide-react';

import { useProducts } from '../../context/ProductContext';
import { box, PageHeader } from './AdminUI';

/* ============================================
   Helpers
============================================ */

function getOrderItems(order) {
  const rawItems =
    order.items ??
    order.orderItems ??
    order.order_items ??
    [];

  if (Array.isArray(rawItems)) {
    return rawItems;
  }

  if (typeof rawItems === 'string') {
    try {
      const parsed = JSON.parse(rawItems);
      return Array.isArray(parsed)
        ? parsed
        : [];
    } catch {
      return [];
    }
  }

  return [];
}

function money(value) {
  return `৳${Number(value || 0).toLocaleString(
    'en-BD',
    {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    },
  )}`;
}

function getItemSubtotal(items) {
  return items.reduce(
    (sum, item) =>
      sum +
      Number(item.price || 0) *
        Number(item.quantity || 1),
    0,
  );
}

function OrderStatus({
  order,
  updateOrderStatus,
}) {
  return (
    <select
      value={
        order.status ||
        'Pending'
      }
      className="bg-neutral-100 rounded-lg px-3 py-2 text-xs font-bold outline-none focus:ring-2 focus:ring-black/10"
      onChange={async (
        event,
      ) => {
        try {
          await updateOrderStatus(
            order.id,
            event.target.value,
          );

          toast.success(
            'Status updated',
          );
        } catch (error) {
          toast.error(
            error.message ||
              'Failed to update status',
          );
        }
      }}
    >
      <option>
        Pending
      </option>

      <option>
        Processing
      </option>

      <option>
        Shipped
      </option>

      <option>
        Delivered
      </option>

      <option>
        Cancelled
      </option>
    </select>
  );
}

/* ============================================
   Orders Page
============================================ */

export default function OrdersPage() {
  const {
    orders,
    products,
    updateOrderStatus,
    deleteOrder,
  } = useProducts();

  const [
    expandedOrder,
    setExpandedOrder,
  ] = useState(null);

  const [
    activeCategory,
    setActiveCategory,
  ] = useState('All');

  /* ============================================
     Category Filter
  ============================================ */

  const categories = useMemo(() => {
    const categoryNames = Array.from(
      new Set(
        (products || [])
          .map((product) =>
            String(product?.category || '').trim(),
          )
          .filter(Boolean),
      ),
    );

    return ['All', ...categoryNames];
  }, [products]);

  const productMap = useMemo(() => {
    return new Map(
      (products || []).map((product) => [
        String(product.id),
        product,
      ]),
    );
  }, [products]);

  const getItemCategory = (item) => {
    const directCategory =
      item?.category ??
      item?.productCategory ??
      item?.product_category;

    if (
      directCategory &&
      String(directCategory).trim()
    ) {
      return String(directCategory).trim();
    }

    const productId =
      item?.productId ??
      item?.product_id ??
      item?.id;

    if (
      productId === undefined ||
      productId === null
    ) {
      return '';
    }

    return String(
      productMap.get(String(productId))
        ?.category || '',
    ).trim();
  };

  const filteredOrders = useMemo(() => {
    if (activeCategory === 'All') {
      return orders || [];
    }

    return (orders || []).filter((order) =>
      getOrderItems(order).some(
        (item) =>
          getItemCategory(item) ===
          activeCategory,
      ),
    );
  }, [
    orders,
    activeCategory,
    productMap,
  ]);

  const toggleOrder = (
    orderId,
  ) => {
    setExpandedOrder(
      (
        previous,
      ) =>
        previous === orderId
          ? null
          : orderId,
    );
  };

  return (
    <>
      <PageHeader
        title="Orders"
        subtitle="Manage orders, customers, products, shipping and payment information."
      />

      {/* ===========================
          Category Navigation
      ============================ */}

      <section className="mb-6">
        <nav className="flex gap-2 overflow-x-auto no-scrollbar pb-3 -mx-4 px-4 sm:mx-0 sm:px-0">
          {categories.map(
            (category) => (
              <button
                key={category}
                type="button"
                onClick={() =>
                  setActiveCategory(
                    category,
                  )
                }
                className={`whitespace-nowrap px-4 sm:px-6 py-2 text-sm font-medium transition-colors ${
                  activeCategory ===
                  category
                    ? 'text-[#c89b6d]'
                    : 'text-black hover:text-[#c89b6d]'
                }`}
              >
                {category}
              </button>
            ),
          )}
        </nav>
      </section>

      {/* ===========================
          Desktop / Main Table
      ============================ */}

      <div
        className={`${box} overflow-hidden`}
      >
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[900px]">
            <thead className="bg-neutral-50 text-left">
              <tr>
                <th className="p-4">
                  Order
                </th>

                <th className="p-4">
                  Customer
                </th>

                <th className="p-4">
                  Items
                </th>

                <th className="p-4">
                  Total
                </th>

                <th className="p-4">
                  Payment
                </th>

                <th className="p-4">
                  Status
                </th>

                <th className="p-4">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody>
              {filteredOrders.map(
                (order) => {
                  const items =
                    getOrderItems(
                      order,
                    );

                  const isExpanded =
                    expandedOrder ===
                    order.id;

                  return (
                    <>
                      {/* Main order row */}

                      <tr
                        key={
                          order.id
                        }
                        className="border-t hover:bg-neutral-50/50 transition-colors"
                      >
                        {/* Order */}

                        <td className="p-4 align-top">
                          <b className="text-sm">
                            {order.orderNumber ||
                              order.order_number ||
                              order.id}
                          </b>

                          <p className="text-xs text-black/40 mt-1">
                            {order.createdAt ||
                            order.created_at
                              ? new Date(
                                  order.createdAt ||
                                    order.created_at,
                                ).toLocaleString()
                              : '—'}
                          </p>

                          <p className="text-[10px] uppercase tracking-wider text-black/35 mt-2">
                            {items.length}{' '}
                            {items.length ===
                            1
                              ? 'item'
                              : 'items'}
                          </p>
                        </td>

                        {/* Customer */}

                        <td className="p-4 align-top">
                          <b>
                            {order.customerName ||
                              order.customer_name ||
                              '—'}
                          </b>

                          <p className="text-xs text-black/45 mt-1">
                            {order.phone ||
                              '—'}
                          </p>

                          <p className="text-xs text-black/45">
                            {order.email ||
                              '—'}
                          </p>
                        </td>

                        {/* Products */}

                        <td className="p-4 align-top">
                          <div className="space-y-2">
                            {items
                              .slice(
                                0,
                                2,
                              )
                              .map(
                                (
                                  item,
                                  index,
                                ) => (
                                  <div
                                    key={`${order.id}-${item.productId || item.id}-${index}`}
                                    className="flex items-center gap-2"
                                  >
                                    {item.image ? (
                                      <img
                                        src={
                                          item.image
                                        }
                                        alt={
                                          item.name ||
                                          ''
                                        }
                                        className="w-9 h-11 rounded-md object-cover bg-neutral-100"
                                      />
                                    ) : (
                                      <div className="w-9 h-11 rounded-md bg-neutral-100 flex items-center justify-center">
                                        <Package
                                          size={
                                            14
                                          }
                                          className="text-black/25"
                                        />
                                      </div>
                                    )}

                                    <div className="min-w-0">
                                      <p className="text-xs font-bold truncate max-w-[160px]">
                                        {item.name ||
                                          'Product'}
                                      </p>

                                      <p className="text-[10px] text-black/40">
                                        Qty:{' '}
                                        {item.quantity ||
                                          1}
                                      </p>
                                    </div>
                                  </div>
                                ),
                              )}

                            {items.length >
                              2 && (
                              <p className="text-[10px] font-bold text-black/40">
                                +
                                {items.length -
                                  2}{' '}
                                more
                              </p>
                            )}
                          </div>
                        </td>

                        {/* Total */}

                        <td className="p-4 align-top">
                          <b>
                            {money(
                              order.total,
                            )}
                          </b>
                        </td>

                        {/* Payment */}

                        <td className="p-4 align-top">
                          <span className="font-bold text-xs">
                            {order.paymentMethod ||
                              order.payment_method ||
                              '—'}
                          </span>

                          {(order.transactionId ||
                            order.transaction_id) && (
                            <p className="text-[10px] text-black/40 mt-1 break-all">
                              TXN:{' '}
                              {order.transactionId ||
                                order.transaction_id}
                            </p>
                          )}
                        </td>

                        {/* Status */}

                        <td className="p-4 align-top">
                          <OrderStatus
                            order={
                              order
                            }
                            updateOrderStatus={
                              updateOrderStatus
                            }
                          />
                        </td>

                        {/* Actions */}

                        <td className="p-4 align-top">
                          <div className="flex items-center gap-2">
                            <button
  type="button"
  onClick={() =>
    toggleOrder(order.id)
  }
  className="
    h-9
    px-3

    bg-neutral-100

    rounded-lg

    flex
    items-center
    justify-center
    gap-1.5

    text-xs
    font-bold

    hover:bg-neutral-200

    transition-all
  "
  title={
    isExpanded
      ? 'Hide order details'
      : 'Show order details'
  }
>
  <span>
    {isExpanded
      ? 'Hide'
      : 'Show'}
  </span>

  {isExpanded ? (
    <ChevronUp size={16} />
  ) : (
    <ChevronDown size={16} />
  )}
</button>

                            <button
                              type="button"
                              className="w-9 h-9 bg-red-50 text-red-600 rounded-lg flex items-center justify-center hover:bg-red-100 transition-colors"
                              onClick={async () => {
                                if (
                                  confirm(
                                    'Delete this order permanently?',
                                  )
                                ) {
                                  try {
                                    await deleteOrder(
                                      order.id,
                                    );

                                    toast.success(
                                      'Order deleted',
                                    );

                                    if (
                                      expandedOrder ===
                                      order.id
                                    ) {
                                      setExpandedOrder(
                                        null,
                                      );
                                    }
                                  } catch (
                                    error
                                  ) {
                                    toast.error(
                                      error.message ||
                                        'Failed to delete order',
                                    );
                                  }
                                }
                              }}
                              title="Delete order"
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

                      {/* =============================
                          Expanded Order Details
                      ============================== */}

                      {isExpanded && (
                        <tr
                          key={`${order.id}-details`}
                          className="border-t bg-neutral-50/60"
                        >
                          <td
                            colSpan="7"
                            className="p-4 md:p-6"
                          >
                            <OrderDetails
                              order={
                                order
                              }
                              items={
                                items
                              }
                            />
                          </td>
                        </tr>
                      )}
                    </>
                  );
                },
              )}

              {filteredOrders.length ===
                0 && (
                <tr>
                  <td
                    colSpan="7"
                    className="p-12 text-center"
                  >
                    <Package
                      size={34}
                      className="mx-auto text-black/20 mb-3"
                    />

                    <p className="font-bold">
                      No orders yet
                    </p>

                    <p className="text-xs text-black/40 mt-1">
                      New customer orders
                      will appear here.
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}

/* ============================================
   Full Order Details
============================================ */

function OrderDetails({
  order,
  items,
}) {
  const itemSubtotal =
    getItemSubtotal(items);

  const shippingCost =
    order.shippingCost ??
    order.shipping_cost ??
    null;

  const discountAmount =
    order.discountAmount ??
    order.discount_amount ??
    null;

  const couponCode =
    order.couponCode ??
    order.coupon_code ??
    '';

  const shippingArea =
    order.shippingArea ??
    order.shipping_area ??
    '';

  const paymentMethod =
    order.paymentMethod ??
    order.payment_method ??
    '';

  const transactionId =
    order.transactionId ??
    order.transaction_id ??
    '';

  return (
    <div className="space-y-6">
      {/* Top information */}

      <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-4">
        {/* Customer */}

        <InfoCard
          icon={
            <Phone
              size={17}
            />
          }
          title="Customer"
        >
          <p className="font-bold">
            {order.customerName ||
              order.customer_name ||
              '—'}
          </p>

          <p className="text-xs text-black/50 mt-1">
            {order.phone ||
              '—'}
          </p>

          <div className="flex items-center gap-1.5 text-xs text-black/50 mt-1">
            <Mail
              size={12}
            />

            <span className="break-all">
              {order.email ||
                '—'}
            </span>
          </div>
        </InfoCard>

        {/* Shipping Address */}

        <InfoCard
          icon={
            <MapPin
              size={17}
            />
          }
          title="Shipping Address"
        >
          <p className="text-sm font-medium">
            {order.address ||
              '—'}
          </p>

          <p className="text-xs text-black/50 mt-1">
            {order.city ||
              '—'}

            {(order.zip ||
              order.postalCode ||
              order.postal_code) &&
              `, ${
                order.zip ||
                order.postalCode ||
                order.postal_code
              }`}
          </p>

          {shippingArea && (
            <span className="inline-flex mt-2 px-2.5 py-1 rounded-full bg-neutral-100 text-[10px] font-bold uppercase tracking-wider">
              {shippingArea}
            </span>
          )}
        </InfoCard>

        {/* Payment */}

        <InfoCard
          icon={
            <CreditCard
              size={17}
            />
          }
          title="Payment"
        >
          <p className="font-bold">
            {paymentMethod ||
              '—'}
          </p>

          {transactionId ? (
            <>
              <p className="text-[10px] uppercase tracking-wider text-black/40 mt-2">
                Transaction ID
              </p>

              <p className="text-xs font-bold break-all mt-1">
                {transactionId}
              </p>
            </>
          ) : (
            <p className="text-xs text-black/40 mt-1">
              No transaction ID
            </p>
          )}
        </InfoCard>

        {/* Coupon */}

        <InfoCard
          icon={
            <TicketPercent
              size={17}
            />
          }
          title="Coupon"
        >
          {couponCode ? (
            <span className="inline-flex px-3 py-1.5 rounded-lg bg-green-50 text-green-700 text-xs font-black uppercase tracking-wider">
              {couponCode}
            </span>
          ) : (
            <p className="text-xs text-black/40">
              No coupon used
            </p>
          )}

          {discountAmount !=
            null && (
            <p className="text-xs text-green-600 font-bold mt-2">
              Discount:{' '}
              {money(
                discountAmount,
              )}
            </p>
          )}
        </InfoCard>
      </div>

      {/* =============================
          Ordered Products
      ============================== */}

      <div className="bg-white rounded-2xl border border-black/5 overflow-hidden">
        <div className="px-5 py-4 border-b border-black/5">
          <h3 className="font-black">
            Ordered Products
          </h3>

          <p className="text-xs text-black/40 mt-1">
            Product, quantity,
            size and selected
            color.
          </p>
        </div>

        <div className="divide-y divide-black/5">
          {items.map(
            (
              item,
              index,
            ) => {
              const size =
                item.size ??
                item.selectedSize ??
                '';

              const color =
                item.color ??
                item.selectedColor ??
                '';

              return (
                <div
                  key={`${item.productId || item.id}-${index}`}
                  className="p-4 md:p-5 flex flex-col sm:flex-row sm:items-center gap-4"
                >
                  {/* Image */}

                  {item.image ? (
                    <img
                      src={
                        item.image
                      }
                      alt={
                        item.name ||
                        ''
                      }
                      className="w-20 h-24 rounded-xl object-cover bg-neutral-100 flex-shrink-0"
                    />
                  ) : (
                    <div className="w-20 h-24 rounded-xl bg-neutral-100 flex items-center justify-center flex-shrink-0">
                      <Package
                        size={22}
                        className="text-black/20"
                      />
                    </div>
                  )}

                  {/* Product details */}

                  <div className="flex-1 min-w-0">
                    <p className="font-black">
                      {item.name ||
                        'Product'}
                    </p>

                    {item.productCode && (
                      <p className="text-[10px] text-black/40 uppercase tracking-wider mt-1">
                        {
                          item.productCode
                        }
                      </p>
                    )}

                    <div className="flex flex-wrap gap-2 mt-3">
                      <span className="px-2.5 py-1 bg-neutral-100 rounded-lg text-[10px] font-bold uppercase">
                        Qty:{' '}
                        {item.quantity ||
                          1}
                      </span>

                      {size && (
                        <span className="px-2.5 py-1 bg-neutral-100 rounded-lg text-[10px] font-bold uppercase">
                          Size:{' '}
                          {size}
                        </span>
                      )}

                      {color &&
                        color !==
                          'Default' && (
                          <span className="px-2.5 py-1 bg-neutral-100 rounded-lg text-[10px] font-bold uppercase flex items-center gap-1.5">
                            <span className="w-2.5 h-2.5 rounded-full bg-black/30" />

                            Color:{' '}
                            {color}
                          </span>
                        )}

                      {color ===
                        'Default' && (
                        <span className="px-2.5 py-1 bg-neutral-100 rounded-lg text-[10px] font-bold uppercase">
                          Color:
                          Default
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Price */}

                  <div className="sm:text-right">
                    <p className="text-xs text-black/40">
                      {money(
                        item.price,
                      )}{' '}
                      ×{' '}
                      {item.quantity ||
                        1}
                    </p>

                    <p className="font-black text-base mt-1">
                      {money(
                        Number(
                          item.price ||
                            0,
                        ) *
                          Number(
                            item.quantity ||
                              1,
                          ),
                      )}
                    </p>
                  </div>
                </div>
              );
            },
          )}

          {items.length ===
            0 && (
            <div className="p-6 text-sm text-black/40">
              No product item
              information available.
            </div>
          )}
        </div>
      </div>

      {/* =============================
          Price Summary
      ============================== */}

      <div className="flex justify-end">
        <div className="w-full md:w-[360px] bg-white rounded-2xl border border-black/5 p-5 space-y-3">
          <SummaryRow
            title="Items Subtotal"
            value={money(
              itemSubtotal,
            )}
          />

          {shippingCost !=
            null && (
            <SummaryRow
              title="Shipping"
              value={
                Number(
                  shippingCost,
                ) > 0
                  ? money(
                      shippingCost,
                    )
                  : 'Free'
              }
            />
          )}

          {discountAmount !=
            null &&
            Number(
              discountAmount,
            ) > 0 && (
              <SummaryRow
                title="Discount"
                value={`-${money(
                  discountAmount,
                )}`}
                success
              />
            )}

          {couponCode && (
            <SummaryRow
              title="Coupon"
              value={
                couponCode
              }
            />
          )}

          {shippingArea && (
            <SummaryRow
              title="Shipping Area"
              value={
                shippingArea
              }
            />
          )}

          <div className="border-t border-black/10 pt-4 flex items-center justify-between">
            <span className="font-black">
              Order Total
            </span>

            <span className="text-xl font-black">
              {money(
                order.total,
              )}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ============================================
   Small Components
============================================ */

function InfoCard({
  icon,
  title,
  children,
}) {
  return (
    <div className="bg-white rounded-2xl border border-black/5 p-5">
      <div className="flex items-center gap-2 mb-4 text-black/40">
        {icon}

        <span className="text-[10px] font-black uppercase tracking-[0.15em]">
          {title}
        </span>
      </div>

      {children}
    </div>
  );
}

function SummaryRow({
  title,
  value,
  success = false,
}) {
  return (
    <div className="flex justify-between gap-4 text-sm">
      <span className="text-black/50">
        {title}
      </span>

      <span
        className={
          success
            ? 'font-bold text-green-600'
            : 'font-bold'
        }
      >
        {value}
      </span>
    </div>
  );
}