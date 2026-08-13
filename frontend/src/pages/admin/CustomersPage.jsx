import { useProducts } from '../../context/ProductContext';
import { box, PageHeader } from './AdminUI';

export default function CustomersPage() {
  const { customers } = useProducts();

  return (
    <>
      <PageHeader
        title="Customers"
        subtitle="Automatically built from successful order submissions."
      />

      <div className={`${box} overflow-x-auto`}>
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-neutral-50 text-left">
              <th className="p-4">Customer</th>
              <th className="p-4">Phone</th>
              <th className="p-4">Orders</th>
              <th className="p-4">Spent</th>
              <th className="p-4">Last Order</th>
            </tr>
          </thead>

          <tbody>
            {customers.map((customer) => (
              <tr className="border-t" key={customer.id}>
                <td className="p-4">
                  <b>{customer.name}</b>
                  <p className="text-xs text-black/40">{customer.email}</p>
                </td>

                <td className="p-4">{customer.phone}</td>

                <td className="p-4">
                  {customer.orderCount ?? customer.order_count ?? 0}
                </td>

                <td className="p-4">
                  ৳
                  {Number(
                    customer.totalSpent ?? customer.total_spent ?? 0,
                  ).toLocaleString()}
                </td>

                <td className="p-4">
                  {customer.lastOrderAt || customer.last_order_at
                    ? new Date(
                        customer.lastOrderAt || customer.last_order_at,
                      ).toLocaleDateString()
                    : '—'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
