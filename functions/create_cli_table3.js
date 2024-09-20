import CliTable3 from 'cli-table3'

const BORDER_CHARS = {
  all_double: {
    top: '═',
    'top-mid': '╤',
    'top-left': '╔',
    'top-right': '╗',
    bottom: '═',
    'bottom-mid': '╧',
    'bottom-left': '╚',
    'bottom-right': '╝',
    left: '║',
    'left-mid': '╟',
    mid: '─',
    'mid-mid': '┼',
    right: '║',
    'right-mid': '╢',
    middle: '│',
  },
  '1x1_double': {
    top: '═',
    'top-left': '╔',
    'top-right': '╗',
    bottom: '═',
    'bottom-left': '╚',
    'bottom-right': '╝',
    left: '║',
    right: '║',
  },
}

export function createTable({
  head,
  colWidths,
  colAligns,
  styleBorderColor = 'blue',
  styleCompact = true,
  borderChar = 'all_double',
}) {
  const tableConfig = {
    wordWrap: true,
    head,
    style: {
      border: [styleBorderColor],
      compact: styleCompact,
    },
    chars: BORDER_CHARS[borderChar],
  }

  if (colWidths) {
    tableConfig.colWidths = colWidths
  }

  if (colAligns) {
    tableConfig.colAligns = colAligns
  }

  const table = new CliTable3(tableConfig)
  return table
}
