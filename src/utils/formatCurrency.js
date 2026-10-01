export const formatCurrency = (amount, currency = 'KES') => {
  if (typeof amount !== 'number') return 'KES 0';
  return new Intl.NumberFormat('en-KE', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 0,
  }).format(amount);
};