/**
 * Parse input string dan convert ke number (hapus titik/koma)
 * e.g. "5.000.000" atau "5,000,000" => 5000000
 */
export function parseRupiah(input) {
  if (!input) return 0;
  const str = String(input).replace(/[.,]/g, "");
  return parseFloat(str) || 0;
}