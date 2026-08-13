import { useProducts } from '../../context/ProductContext';
import { box, PageHeader, Stat } from './AdminUI';

export default function DashboardPage() {
  const { products, orders, customers, coupons, messages } = useProducts();

  const revenue = orders
    .filter((order) => order.status !== 'Cancelled')
    .reduce((sum, order) => sum + Number(order.total || 0), 0);

  const pending = orders.filter(
    (order) => order.status === 'Pending',
  ).length;

  return (
    <>
      <PageHeader
        title="Dashboard"
        subtitle="Store overview and operational snapshot."
      />

      <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-4">
        <Stat title="Products" value={products.length} />
        <Stat title="Orders" value={orders.length} note={`${pending} pending`} />
        <Stat title="Customers" value={customers.length} />
        <Stat
          title="Revenue"
          value={`৳${revenue.toLocaleString()}`}
          note="Excludes cancelled orders"
        />
      </div>

      <div className="grid xl:grid-cols-2 gap-4 mt-6">
        <div className={`${box} p-6`}>
          <h2 className="font-black text-lg mb-4">Recent Orders</h2>

          <div className="space-y-3">
            {orders.slice(0, 6).map((order) => (
              <div
                key={order.id}
                className="flex justify-between gap-4 border-b last:border-0 pb-3"
              >
                <div>
                  <b className="text-sm">{order.orderNumber}</b>
                  <p className="text-xs text-black/45">{order.customerName}</p>
                </div>

                <div className="text-right">
                  <b className="text-sm">৳{order.total}</b>
                  <p className="text-xs text-black/45">{order.status}</p>
                </div>
              </div>
            ))}

            {orders.length === 0 && (
              <p className="text-sm text-black/40">No orders yet.</p>
            )}
          </div>
        </div>

        <div className={`${box} p-6`}>
          <h2 className="font-black text-lg mb-4">Needs Attention</h2>

          <p className="text-sm text-black/60">
            Pending orders: <b>{pending}</b>
          </p>
          <p className="text-sm text-black/60 mt-2">
            Unread messages:{' '}
            <b>{messages.filter((m) => m.status === 'New').length}</b>
          </p>
          <p className="text-sm text-black/60 mt-2">
            Active coupons:{' '}
            <b>{coupons.filter((c) => c.isActive ?? c.is_active).length}</b>
          </p>
          <p className="text-sm text-black/60 mt-2">
            Low stock products:{' '}
            <b>{products.filter((p) => Number(p.stock) <= 5).length}</b>
          </p>
        </div>
      </div>
    </>
  );
}
