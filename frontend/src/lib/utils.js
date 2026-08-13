export function cn(...values) {
  return values.flat().filter(Boolean).join(' ');
}

export function getAdminPath() {
  return 'admin';
}

export function formatMoney(value, currency = '৳') {
  return `${currency}${Number(value || 0).toFixed(2)}`;
}
