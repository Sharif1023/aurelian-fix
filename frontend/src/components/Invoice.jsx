import { Download, FileText, Loader2, Printer, X } from 'lucide-react';
import { motion } from 'motion/react';
import { useCallback, useEffect, useRef, useState } from 'react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { toast } from 'react-hot-toast';

const money = (value) => `৳${Number(value || 0).toFixed(2)}`;

const getValue = (object, ...keys) => {
  for (const key of keys) {
    if (object?.[key] !== undefined && object?.[key] !== null && object?.[key] !== '') {
      return object[key];
    }
  }
  return '';
};

export default function Invoice({
  order,
  brandName,
  storeSettings,
  onClose,
  autoDownload = false,
}) {
  const [isGenerating, setIsGenerating] = useState(false);
  const invoiceRef = useRef(null);

  const items = Array.isArray(order?.items) ? order.items : [];

  const orderNumber = getValue(order, 'orderNumber', 'order_number') || 'N/A';
  const customerName = getValue(order, 'customerName', 'customer_name') || 'N/A';
  const email = getValue(order, 'email');
  const phone = getValue(order, 'phone') || 'N/A';
  const address = getValue(order, 'address') || 'N/A';
  const city = getValue(order, 'city');
  const zip = getValue(order, 'zip');
  const shippingArea = getValue(order, 'shippingArea', 'shipping_area');
  const paymentMethod = getValue(order, 'paymentMethod', 'payment_method') || 'N/A';
  const transactionId = getValue(order, 'transactionId', 'transaction_id');
  const paymentStatus = getValue(order, 'paymentStatus', 'payment_status');
  const orderStatus = getValue(order, 'status');
  const couponCode = getValue(order, 'couponCode', 'coupon_code');

  const itemSubtotal = items.reduce(
    (sum, item) => sum + Number(item?.price || 0) * Number(item?.quantity || 0),
    0,
  );

  const subtotal = Number(getValue(order, 'subtotal')) || itemSubtotal;
  const shippingCost = Number(getValue(order, 'shippingCost', 'shipping_cost')) || 0;
  const total = Number(getValue(order, 'total')) || subtotal + shippingCost;

  const explicitDiscount = Number(
    getValue(order, 'discountAmount', 'discount_amount'),
  );

  const discountAmount = explicitDiscount > 0
    ? explicitDiscount
    : Math.max(0, subtotal + shippingCost - total);

  const createdAt = getValue(order, 'createdAt', 'created_at');
  const invoiceDate = createdAt && !Number.isNaN(new Date(createdAt).getTime())
    ? new Date(createdAt).toLocaleString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    : new Date().toLocaleString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });

  const resolvedBrandName = brandName || storeSettings?.brandSettings?.name || 'SHARUU';
  const storeEmail =
    storeSettings?.contactSettings?.email ||
    storeSettings?.generalSettings?.storeEmail ||
    '';
  const storePhone = storeSettings?.contactSettings?.contactPhone || '';
  const storeAddress = storeSettings?.contactSettings?.address || '';

  const paymentNumber = paymentMethod === 'bKash'
    ? storeSettings?.paymentSettings?.bkashNumber
    : paymentMethod === 'Nagad'
      ? storeSettings?.paymentSettings?.nagadNumber
      : '';

  const handlePrint = () => {
    window.print();
  };

  const waitForImages = async (element) => {
    const images = Array.from(element.getElementsByTagName('img'));

    await Promise.all(
      images.map((img) =>
        img.complete && img.naturalHeight !== 0
          ? Promise.resolve()
          : new Promise((resolve) => {
              const timeout = setTimeout(resolve, 3000);

              img.onload = () => {
                clearTimeout(timeout);
                resolve();
              };

              img.onerror = () => {
                clearTimeout(timeout);
                resolve();
              };
            }),
      ),
    );
  };

  const handleDownloadPDF = useCallback(async () => {
    const element = invoiceRef.current;

    if (!element) {
      toast.error('Invoice content is not ready. Please try again.');
      return;
    }

    try {
      setIsGenerating(true);

      const loadingToast = !autoDownload
        ? toast.loading('Preparing PDF...')
        : null;

      if (document.fonts) {
        await document.fonts.ready;
      }

      await waitForImages(element);
      await new Promise((resolve) => setTimeout(resolve, 250));

      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        allowTaint: false,
        logging: false,
        backgroundColor: '#ffffff',
        width: element.scrollWidth,
        height: element.scrollHeight,
        windowWidth: element.scrollWidth,
        windowHeight: element.scrollHeight,
        scrollX: 0,
        scrollY: 0,
      });

      if (!canvas || canvas.width === 0 || canvas.height === 0) {
        throw new Error('Failed to capture invoice content');
      }

      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
        compress: true,
      });

      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 8;
      const usablePageWidth = pageWidth - margin * 2;
      const usablePageHeight = pageHeight - margin * 2;

      const canvasWidth = canvas.width;
      const canvasHeight = canvas.height;
      const imageWidth = usablePageWidth;
      const imageHeight = (canvasHeight * imageWidth) / canvasWidth;
      const imgData = canvas.toDataURL('image/png');

      let heightLeft = imageHeight;
      let position = margin;

      pdf.addImage(
        imgData,
        'PNG',
        margin,
        position,
        imageWidth,
        imageHeight,
        undefined,
        'FAST',
      );

      heightLeft -= usablePageHeight;

      while (heightLeft > 0) {
        pdf.addPage();
        position = margin - (imageHeight - heightLeft);
        pdf.addImage(
          imgData,
          'PNG',
          margin,
          position,
          imageWidth,
          imageHeight,
          undefined,
          'FAST',
        );
        heightLeft -= usablePageHeight;
      }

      const fileName = `Invoice-${orderNumber}.pdf`;

      try {
        pdf.save(fileName);
      } catch {
        const blob = pdf.output('blob');
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      }

      if (loadingToast) {
        toast.success('Invoice downloaded!', { id: loadingToast });
      }

      if (autoDownload) {
        setTimeout(onClose, 1000);
      }
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast.error('Failed to generate PDF. Try printing instead.');
    } finally {
      setIsGenerating(false);
    }
  }, [autoDownload, onClose, orderNumber]);

  useEffect(() => {
    if (!autoDownload) return undefined;

    const timer = setTimeout(() => {
      handleDownloadPDF();
    }, 700);

    return () => clearTimeout(timer);
  }, [autoDownload, handleDownloadPDF]);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-3 backdrop-blur-sm print:static print:block print:bg-white print:p-0">
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex max-h-[94vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl print:max-h-none print:max-w-none print:overflow-visible print:rounded-none print:shadow-none"
      >
        {/* Toolbar */}
        <div className="flex items-center justify-between border-b bg-surface-low px-4 py-3 print:hidden">
          <div className="flex items-center gap-2">
            <FileText className="h-4 w-4 text-primary" />
            <span className="text-[10px] font-bold uppercase tracking-[0.2em]">
              Invoice Preview
            </span>
          </div>

          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={handlePrint}
              disabled={isGenerating}
              className="rounded-full p-2 text-on-surface-variant transition-colors hover:bg-white hover:text-primary disabled:opacity-50"
              title="Print"
            >
              <Printer className="h-4 w-4" />
            </button>

            <button
              type="button"
              onClick={handleDownloadPDF}
              disabled={isGenerating}
              className="rounded-full p-2 text-on-surface-variant transition-colors hover:bg-white hover:text-primary disabled:opacity-50"
              title="Download PDF"
            >
              {isGenerating ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Download className="h-4 w-4" />
              )}
            </button>

            <div className="mx-1 h-5 w-px bg-outline-variant/20" />

            <button
              type="button"
              onClick={onClose}
              disabled={isGenerating}
              className="rounded-full p-2 text-on-surface-variant transition-colors hover:bg-white hover:text-red-500 disabled:opacity-50"
              title="Close"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Scroll area */}
        <div className="flex-grow overflow-y-auto bg-[#f7f7f7] p-3 sm:p-5 print:overflow-visible print:bg-white print:p-0">
          <div
            ref={invoiceRef}
            className="mx-auto w-full max-w-[720px] bg-white p-4 text-black sm:p-5 print:max-w-none print:p-4"
          >
            {/* Header */}
            <div className="mb-3 flex items-start justify-between gap-4 rounded-xl border border-[#e5e7eb] p-4">
              <div className="min-w-0">
                <h1 className="truncate text-xl font-black uppercase tracking-tight sm:text-2xl">
                  {resolvedBrandName}
                </h1>
                <p className="mt-1 text-[8px] font-semibold uppercase tracking-[0.22em] text-[#6b7280]">
                  Order Invoice
                </p>

                {(storeEmail || storePhone || storeAddress) && (
                  <div className="mt-2 space-y-0.5 text-[9px] leading-4 text-[#4b5563]">
                    {storeAddress && <p>{storeAddress}</p>}
                    {storePhone && <p>{storePhone}</p>}
                    {storeEmail && <p>{storeEmail}</p>}
                  </div>
                )}
              </div>

              <div className="shrink-0 text-right">
                <p className="text-[8px] font-bold uppercase tracking-[0.2em] text-[#6b7280]">
                  Invoice No.
                </p>
                <p className="mt-0.5 font-mono text-xs font-black">#{orderNumber}</p>
                <p className="mt-2 text-[8px] font-bold uppercase tracking-[0.16em] text-[#6b7280]">
                  Date
                </p>
                <p className="mt-0.5 text-[9px] font-semibold">{invoiceDate}</p>
              </div>
            </div>

            {/* Customer + Shipping */}
            <div className="mb-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
              <section className="rounded-xl border border-[#e5e7eb] p-3">
                <h2 className="mb-2 text-[8px] font-black uppercase tracking-[0.22em] text-[#6b7280]">
                  Customer Information
                </h2>

                <div className="space-y-1 text-[10px]">
                  <div className="flex gap-2">
                    <span className="w-16 shrink-0 text-[#6b7280]">Name</span>
                    <span className="font-bold">{customerName}</span>
                  </div>
                  <div className="flex gap-2">
                    <span className="w-16 shrink-0 text-[#6b7280]">Phone</span>
                    <span className="font-medium">{phone}</span>
                  </div>
                  {email && (
                    <div className="flex gap-2">
                      <span className="w-16 shrink-0 text-[#6b7280]">Email</span>
                      <span className="break-all font-medium">{email}</span>
                    </div>
                  )}
                  <div className="flex gap-2">
                    <span className="w-16 shrink-0 text-[#6b7280]">Order No.</span>
                    <span className="font-mono font-bold">{orderNumber}</span>
                  </div>
                </div>
              </section>

              <section className="rounded-xl border border-[#e5e7eb] p-3">
                <h2 className="mb-2 text-[8px] font-black uppercase tracking-[0.22em] text-[#6b7280]">
                  Shipping Information
                </h2>

                <div className="space-y-1 text-[10px]">
                  <div className="flex gap-2">
                    <span className="w-16 shrink-0 text-[#6b7280]">Address</span>
                    <span className="font-medium">{address}</span>
                  </div>
                  {(city || zip) && (
                    <div className="flex gap-2">
                      <span className="w-16 shrink-0 text-[#6b7280]">City</span>
                      <span className="font-medium">
                        {[city, zip].filter(Boolean).join(', ')}
                      </span>
                    </div>
                  )}
                  {shippingArea && (
                    <div className="flex gap-2">
                      <span className="w-16 shrink-0 text-[#6b7280]">Area</span>
                      <span className="font-bold">{shippingArea}</span>
                    </div>
                  )}
                  <div className="flex gap-2">
                    <span className="w-16 shrink-0 text-[#6b7280]">Charge</span>
                    <span className="font-bold">{money(shippingCost)}</span>
                  </div>
                </div>
              </section>
            </div>

            {/* Payment + Order */}
            <div className="mb-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
              <section className="rounded-xl border border-[#e5e7eb] p-3">
                <h2 className="mb-2 text-[8px] font-black uppercase tracking-[0.22em] text-[#6b7280]">
                  Payment Information
                </h2>

                <div className="space-y-1 text-[10px]">
                  <div className="flex gap-2">
                    <span className="w-20 shrink-0 text-[#6b7280]">Method</span>
                    <span className="font-bold">{paymentMethod}</span>
                  </div>

                  {paymentNumber && (
                    <div className="flex gap-2">
                      <span className="w-20 shrink-0 text-[#6b7280]">Paid To</span>
                      <span className="font-semibold">{paymentNumber}</span>
                    </div>
                  )}

                  {transactionId && (
                    <div className="flex gap-2">
                      <span className="w-20 shrink-0 text-[#6b7280]">Transaction</span>
                      <span className="break-all font-mono font-bold">{transactionId}</span>
                    </div>
                  )}

                  {paymentStatus && (
                    <div className="flex gap-2">
                      <span className="w-20 shrink-0 text-[#6b7280]">Pay Status</span>
                      <span className="font-bold">{paymentStatus}</span>
                    </div>
                  )}
                </div>
              </section>

              <section className="rounded-xl border border-[#e5e7eb] p-3">
                <h2 className="mb-2 text-[8px] font-black uppercase tracking-[0.22em] text-[#6b7280]">
                  Order Information
                </h2>

                <div className="space-y-1 text-[10px]">
                  {orderStatus && (
                    <div className="flex gap-2">
                      <span className="w-20 shrink-0 text-[#6b7280]">Status</span>
                      <span className="font-bold">{orderStatus}</span>
                    </div>
                  )}

                  <div className="flex gap-2">
                    <span className="w-20 shrink-0 text-[#6b7280]">Items</span>
                    <span className="font-bold">
                      {items.reduce((sum, item) => sum + Number(item?.quantity || 0), 0)}
                    </span>
                  </div>

                  {couponCode && (
                    <div className="flex gap-2">
                      <span className="w-20 shrink-0 text-[#6b7280]">Coupon</span>
                      <span className="font-mono font-bold">{couponCode}</span>
                    </div>
                  )}

                  <div className="flex gap-2">
                    <span className="w-20 shrink-0 text-[#6b7280]">Created</span>
                    <span className="font-medium">{invoiceDate}</span>
                  </div>
                </div>
              </section>
            </div>

            {/* Items */}
            <section className="mb-3 overflow-hidden rounded-xl border border-[#e5e7eb]">
              <div className="border-b border-[#e5e7eb] bg-[#f9fafb] px-3 py-2">
                <h2 className="text-[8px] font-black uppercase tracking-[0.22em] text-[#6b7280]">
                  Ordered Items
                </h2>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full min-w-[540px] border-collapse">
                  <thead>
                    <tr className="bg-white text-[#6b7280]">
                      <th className="px-3 py-2 text-left text-[8px] font-black uppercase tracking-wider">
                        Product
                      </th>
                      <th className="px-2 py-2 text-left text-[8px] font-black uppercase tracking-wider">
                        Variation
                      </th>
                      <th className="px-2 py-2 text-center text-[8px] font-black uppercase tracking-wider">
                        Qty
                      </th>
                      <th className="px-2 py-2 text-right text-[8px] font-black uppercase tracking-wider">
                        Unit Price
                      </th>
                      <th className="px-3 py-2 text-right text-[8px] font-black uppercase tracking-wider">
                        Amount
                      </th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-[#eeeeee]">
                    {items.length > 0 ? (
                      items.map((item, index) => {
                        const itemName = getValue(item, 'name', 'productName', 'product_name') || 'Product';
                        const itemSize = getValue(item, 'size', 'selectedSize');
                        const itemColor = getValue(item, 'color', 'selectedColor');
                        const quantity = Number(item?.quantity || 0);
                        const price = Number(item?.price || 0);

                        return (
                          <tr key={`${item?.id || item?.productId || index}-${index}`}>
                            <td className="px-3 py-2 align-top text-[9px] font-bold">
                              {itemName}
                            </td>

                            <td className="px-2 py-2 align-top text-[8px] text-[#4b5563]">
                              {itemSize || itemColor ? (
                                <>
                                  {itemSize && <span>Size: {itemSize}</span>}
                                  {itemSize && itemColor && <span> · </span>}
                                  {itemColor && <span>Color: {itemColor}</span>}
                                </>
                              ) : (
                                '—'
                              )}
                            </td>

                            <td className="px-2 py-2 text-center align-top text-[9px] font-semibold">
                              {quantity}
                            </td>

                            <td className="px-2 py-2 text-right align-top text-[9px]">
                              {money(price)}
                            </td>

                            <td className="px-3 py-2 text-right align-top text-[9px] font-black">
                              {money(price * quantity)}
                            </td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td colSpan="5" className="px-3 py-4 text-center text-[9px] text-[#6b7280]">
                          No item details available.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </section>

            {/* Summary */}
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-[1fr_260px]">
              <section className="rounded-xl border border-[#e5e7eb] p-3">
                <h2 className="mb-2 text-[8px] font-black uppercase tracking-[0.22em] text-[#6b7280]">
                  Notes
                </h2>
                <p className="text-[9px] leading-4 text-[#6b7280]">
                  Please keep this invoice and your order number for order tracking, delivery support and payment verification.
                </p>
              </section>

              <section className="rounded-xl border border-[#111827] p-3">
                <div className="space-y-1.5 text-[10px]">
                  <div className="flex items-center justify-between">
                    <span className="text-[#6b7280]">Subtotal</span>
                    <span className="font-semibold">{money(subtotal)}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-[#6b7280]">Shipping</span>
                    <span className="font-semibold">{money(shippingCost)}</span>
                  </div>

                  {discountAmount > 0 && (
                    <div className="flex items-center justify-between">
                      <span className="text-[#6b7280]">
                        Discount{couponCode ? ` (${couponCode})` : ''}
                      </span>
                      <span className="font-semibold">-{money(discountAmount)}</span>
                    </div>
                  )}

                  <div className="mt-2 flex items-center justify-between border-t border-[#d1d5db] pt-2">
                    <span className="text-[9px] font-black uppercase tracking-[0.16em]">
                      Grand Total
                    </span>
                    <span className="text-lg font-black">{money(total)}</span>
                  </div>
                </div>
              </section>
            </div>

            {/* Footer */}
            <div className="mt-3 rounded-xl border border-[#e5e7eb] px-3 py-2 text-center">
              <p className="text-[8px] font-black uppercase tracking-[0.22em] text-[#4b5563]">
                Thank you for choosing {resolvedBrandName}
              </p>
              <p className="mt-1 text-[7px] text-[#9ca3af]">
                This is a computer-generated invoice. No signature is required.
              </p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}