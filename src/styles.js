export const MARKER_COLORS = {
  yellow:   { label: '黃色',   hex: '#eab308' },
  orange:   { label: '橘色',   hex: '#f97316' },
  brickRed: { label: '褚紅色', hex: '#B5451B' },
  blue:     { label: '藍色',   hex: '#3b82f6' },
}

export const OUTLINE_COLORS = {
  yellow:   { label: '黃色',   hex: '#eab308' },
  orange:   { label: '橘色',   hex: '#f97316' },
  brickRed: { label: '褚紅色', hex: '#B5451B' },
  blue:     { label: '藍色',   hex: '#3b82f6' },
  gray:     { label: '中灰色', hex: '#6b7280' },
}

export const FILL_TYPES = {
  lightYellow:  { label: '淺黃',     fillColor: '#fef9c3', fillOpacity: 0.75 },
  matchOutline: { label: '跟隨框線', dynamic: true,        fillOpacity: 0.45 },
  grayMask:     { label: '淺灰遮罩', fillColor: '#d1d5db', fillOpacity: 0.50 },
}

/** 將 hex 色彩與白色混合，amount=0~1（越大越淺） */
export function lightenColor(hex, amount = 0.65) {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  const mix = (c) => Math.round(c + (255 - c) * amount)
  return `#${[mix(r), mix(g), mix(b)].map(v => v.toString(16).padStart(2, '0')).join('')}`
}

/** 依填滿類型與外框色計算實際 fillColor / fillOpacity */
export function computeFillStyle(fillTypeKey, outlineHex) {
  const ft = FILL_TYPES[fillTypeKey]
  if (!ft) return { fillColor: '#ffffff', fillOpacity: 0 }
  if (ft.dynamic) {
    return {
      fillColor: lightenColor(outlineHex || '#6b7280', 0.65),
      fillOpacity: ft.fillOpacity,
    }
  }
  return { fillColor: ft.fillColor, fillOpacity: ft.fillOpacity }
}
