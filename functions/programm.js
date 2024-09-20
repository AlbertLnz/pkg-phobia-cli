export const bytesToMB = (bytes, decimalPlaces = 2) =>
  (bytes / (1024 * 1024)).toFixed(decimalPlaces)

export const colorizeSize = (size, hexColor) => {
  const [r, g, b] = hexToRgb(hexColor)
  return `\x1b[38;2;${r};${g};${b}mInstall Size: \x1b[1m${size} MB\x1b[0m`
}

export const parseRepositoryUrl = (str) =>
  (str.match(/https?:\/\/[^\s]+/) || [])[0] || null

export async function formatDate(settings, isoString) {
  const date = new Date(isoString)
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')

  if (settings.dateFormat === 'DD/MM/YYYY') return `${day}/${month}/${year}`
  if (settings.dateFormat === 'MM/DD/YYYY') return `${month}/${day}/${year}`
  if (settings.dateFormat === 'YYYY/MM/DD') {
    return `${year}/${month}/${day}`
  }
}

const hexToRgb = (hex) => {
  const cleanHex = hex.replace(/^#/, '')
  const bigint = parseInt(cleanHex, 16)
  return [(bigint >> 16) & 255, (bigint >> 8) & 255, bigint & 255]
}
