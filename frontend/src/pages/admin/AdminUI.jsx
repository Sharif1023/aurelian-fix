import { X } from 'lucide-react';

export const box =
  'bg-white rounded-2xl border border-black/5 shadow-sm';

export const input =
  'w-full bg-neutral-100 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-black/10';

export const label =
  'text-[11px] uppercase tracking-widest font-bold text-black/45';

export function PageHeader({ title, subtitle, action }) {
  return (
    <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-7">
      <div>
        <h1 className="text-3xl font-black">{title}</h1>
        {subtitle && (
          <p className="text-sm text-black/50 mt-1">{subtitle}</p>
        )}
      </div>
      {action}
    </div>
  );
}

export function Stat({ title, value, note }) {
  return (
    <div className={`${box} p-6`}>
      <p className={label}>{title}</p>
      <p className="text-3xl font-black mt-3">{value}</p>
      {note && <p className="text-xs text-black/40 mt-2">{note}</p>}
    </div>
  );
}

export function Field({ title, children }) {
  return (
    <label className="space-y-2 block">
      <span className={label}>{title}</span>
      {children}
    </label>
  );
}

export function Modal({
  open,
  title,
  onClose,
  children,
  wide = false,
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-[100] p-3 md:p-4 overflow-auto">
      <div
        className={`${
          wide ? 'max-w-7xl' : 'max-w-3xl'
        } mx-auto my-4 md:my-8 bg-white rounded-3xl p-4 md:p-8`}
      >
        <div className="flex justify-between items-center gap-4 mb-6">
          <h2 className="text-2xl font-black">{title}</h2>

          <button
            type="button"
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-neutral-100 flex items-center justify-center"
            aria-label="Close"
          >
            <X size={17} />
          </button>
        </div>

        {children}
      </div>
    </div>
  );
}
