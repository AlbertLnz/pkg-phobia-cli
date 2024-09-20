export const bytesToMB = (bytes, decimalPlaces = 2) =>
  (bytes / (1024 * 1024)).toFixed(decimalPlaces)

export const colorizeSize = (size, hexColor) => {
  const [r, g, b] = hexToRgb(hexColor)
  return `\x1b[38;2;${r};${g};${b}mInstall Size: \x1b[1m${size} MB\x1b[0m`
}

const hexToRgb = (hex) => {
  const cleanHex = hex.replace(/^#/, '')
  const bigint = parseInt(cleanHex, 16)
  return [(bigint >> 16) & 255, (bigint >> 8) & 255, bigint & 255]
}
