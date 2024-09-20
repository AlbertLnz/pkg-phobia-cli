import * as p from '@clack/prompts'

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

export const iterateTable = async (
  arr,
  registryApi,
  rows,
  startIndex = 1,
  originalArrayLength,
  numBy2Sides,
  settings
) => {
  for (const [index, version] of arr.entries()) {
    const adjustedIndex =
      startIndex === 1
        ? index + 1
        : originalArrayLength - numBy2Sides + index + 1

    const timestamp = await formatDate(settings, registryApi.time[version])
    const unpacked_size = `${
      registryApi.versions[version].dist.unpackedSize +
      ' B - ' +
      bytesToMB(registryApi.versions[version].dist.unpackedSize)
    } MB`
    rows.push([adjustedIndex, version, unpacked_size, timestamp])
  }
  return rows
}

export const fakeSpinner = async (message, time) => {
  const s = p.spinner()
  s.start(message)
  await new Promise((resolve) => setTimeout(resolve, time))
  s.stop()
}

const hexToRgb = (hex) => {
  const cleanHex = hex.replace(/^#/, '')
  const bigint = parseInt(cleanHex, 16)
  return [(bigint >> 16) & 255, (bigint >> 8) & 255, bigint & 255]
}
