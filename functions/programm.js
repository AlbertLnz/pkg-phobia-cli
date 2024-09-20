export const bytesToMB = (bytes, decimalPlaces = 2) =>
  (bytes / (1024 * 1024)).toFixed(decimalPlaces)
