import { useState } from 'react';
import toast from 'react-hot-toast';
import { Trash2 } from 'lucide-react';

import { useProducts } from '../../context/ProductContext';
import { box, Field, input, PageHeader } from './AdminUI';

const blankCoupon = {
  code: '',
  discountPercent: 10,
  isActive: true,
  minSubtotal: 0,
  maxDiscount: null,
  startsAt: '',
  expiresAt: '',
};

export default function CouponsPage() {
  const {
    coupons,
    addCoupon,
    updateCoupon,
    deleteCoupon,
  } = useProducts();

  const [form, setForm] = useState(blankCoupon);

  const submit = async (event) => {
    event.preventDefault();

    try {
      await addCoupon(form);
      setForm(blankCoupon);
      toast.success('Coupon added');
    } catch (error) {
      toast.error(error.message);
    }
  };

  return (
    <>
      <PageHeader
        title="Coupons"
        subtitle="Server-validated discounts with date and amount rules."
      />

      <div className="grid xl:grid-cols-[360px_1fr] gap-5">
        <form
          onSubmit={submit}
          className={`${box} p-6 space-y-4 h-fit`}
        >
          <Field title="Code">
            <input
              required
              className={input}
              value={form.code}
              onChange={(event) =>
                setForm({
                  ...form,
                  code: event.target.value.toUpperCase(),
                })
              }
            />
          </Field>

          <Field title="Discount %">
            <input
              type="number"
              min="1"
              max="100"
              className={input}
              value={form.discountPercent}
              onChange={(event) =>
                setForm({
                  ...form,
                  discountPercent: Number(event.target.value),
                })
              }
            />
          </Field>

          <Field title="Minimum subtotal">
            <input
              type="number"
              min="0"
              className={input}
              value={form.minSubtotal}
              onChange={(event) =>
                setForm({
                  ...form,
                  minSubtotal: Number(event.target.value),
                })
              }
            />
          </Field>

          <Field title="Maximum discount (optional)">
            <input
              type="number"
              min="0"
              className={input}
              value={form.maxDiscount ?? ''}
              onChange={(event) =>
                setForm({
                  ...form,
                  maxDiscount: event.target.value
                    ? Number(event.target.value)
                    : null,
                })
              }
            />
          </Field>

          <Field title="Starts at">
            <input
              type="datetime-local"
              className={input}
              value={form.startsAt}
              onChange={(event) =>
                setForm({
                  ...form,
                  startsAt: event.target.value,
                })
              }
            />
          </Field>

          <Field title="Expires at">
            <input
              type="datetime-local"
              className={input}
              value={form.expiresAt}
              onChange={(event) =>
                setForm({
                  ...form,
                  expiresAt: event.target.value,
                })
              }
            />
          </Field>

          <button className="w-full bg-black text-white rounded-xl py-3 font-bold">
            Add Coupon
          </button>
        </form>

        <div className={`${box} overflow-x-auto`}>
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-neutral-50 text-left">
                <th className="p-4">Code</th>
                <th className="p-4">Discount</th>
                <th className="p-4">Min.</th>
                <th className="p-4">Active</th>
                <th className="p-4" />
              </tr>
            </thead>

            <tbody>
              {coupons.map((coupon) => (
                <tr key={coupon.id} className="border-t">
                  <td className="p-4 font-black">{coupon.code}</td>
                  <td className="p-4">
                    {coupon.discountPercent ?? coupon.discount_percent}%
                  </td>
                  <td className="p-4">
                    ৳{coupon.minSubtotal ?? coupon.min_subtotal ?? 0}
                  </td>

                  <td className="p-4">
                    <input
                      type="checkbox"
                      checked={Boolean(
                        coupon.isActive ?? coupon.is_active,
                      )}
                      onChange={async (event) => {
                        try {
                          await updateCoupon(coupon.id, {
                            isActive: event.target.checked,
                          });
                        } catch (error) {
                          toast.error(error.message);
                        }
                      }}
                    />
                  </td>

                  <td className="p-4">
                    <button
                      type="button"
                      className="text-red-600"
                      onClick={async () => {
                        if (confirm('Delete coupon?')) {
                          try {
                            await deleteCoupon(coupon.id);
                          } catch (error) {
                            toast.error(error.message);
                          }
                        }
                      }}
                    >
                      <Trash2 size={17} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
