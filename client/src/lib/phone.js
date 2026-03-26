// Country code → flag emoji mapping (most common Latin American + US/Canada)
const COUNTRY_CODES = [
  { code: '52', flag: '🇲🇽', len: [10] },      // Mexico (10 digits after code)
  { code: '1', flag: '🇺🇸', len: [10] },        // US/Canada
  { code: '54', flag: '🇦🇷', len: [10, 11] },   // Argentina
  { code: '55', flag: '🇧🇷', len: [10, 11] },   // Brazil
  { code: '57', flag: '🇨🇴', len: [10] },       // Colombia
  { code: '56', flag: '🇨🇱', len: [9] },        // Chile
  { code: '51', flag: '🇵🇪', len: [9] },        // Peru
  { code: '593', flag: '🇪🇨', len: [9] },       // Ecuador
  { code: '58', flag: '🇻🇪', len: [10] },       // Venezuela
  { code: '502', flag: '🇬🇹', len: [8] },       // Guatemala
  { code: '503', flag: '🇸🇻', len: [8] },       // El Salvador
  { code: '504', flag: '🇭🇳', len: [8] },       // Honduras
  { code: '506', flag: '🇨🇷', len: [8] },       // Costa Rica
  { code: '507', flag: '🇵🇦', len: [8] },       // Panama
  { code: '591', flag: '🇧🇴', len: [8] },       // Bolivia
  { code: '595', flag: '🇵🇾', len: [9] },       // Paraguay
  { code: '598', flag: '🇺🇾', len: [8] },       // Uruguay
  { code: '34', flag: '🇪🇸', len: [9] },        // Spain
  { code: '44', flag: '🇬🇧', len: [10] },       // UK
  { code: '49', flag: '🇩🇪', len: [10, 11] },   // Germany
]

/**
 * Parse a phone number and return { flag, localNumber }
 * Input: "5216672646767" or "+5216672646767"
 * Output: { flag: '🇲🇽', localNumber: '667 264 6767', raw: '6672646767' }
 */
export function parsePhone(phone) {
  if (!phone) return { flag: '', localNumber: phone || '', raw: phone || '' }

  let num = phone.replace(/^\+/, '')

  // Try matching country codes (longest first to avoid ambiguity)
  const sorted = [...COUNTRY_CODES].sort((a, b) => b.code.length - a.code.length)

  for (const country of sorted) {
    if (num.startsWith(country.code)) {
      const local = num.slice(country.code.length)
      // For Mexico, strip the "1" after country code if present (521... → 52 + 1 + 10digits)
      let cleanLocal = local
      if (country.code === '52' && local.startsWith('1') && local.length === 11) {
        cleanLocal = local.slice(1)
      }
      return {
        flag: country.flag,
        localNumber: formatLocal(cleanLocal),
        raw: cleanLocal
      }
    }
  }

  // No country code matched - return as-is
  return { flag: '📱', localNumber: phone, raw: phone }
}

/**
 * Format a local number with spaces for readability
 * "6672646767" → "667 264 6767"
 */
function formatLocal(num) {
  if (num.length === 10) return `${num.slice(0,3)} ${num.slice(3,6)} ${num.slice(6)}`
  if (num.length === 9) return `${num.slice(0,3)} ${num.slice(3,6)} ${num.slice(6)}`
  if (num.length === 8) return `${num.slice(0,4)} ${num.slice(4)}`
  if (num.length === 11) return `${num.slice(0,2)} ${num.slice(2,7)} ${num.slice(7)}`
  return num
}

/**
 * Returns a display string like "🇲🇽 667 264 6767"
 */
export function formatPhone(phone) {
  const { flag, localNumber } = parsePhone(phone)
  return flag ? `${flag} ${localNumber}` : localNumber
}
