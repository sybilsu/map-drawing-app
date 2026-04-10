// 字串屬性用 coalesce（null 直接 fallback）
// 數字屬性用 case+has（避免 to-number(null)=0 蓋掉 fallback）
const c = (prop, fallback) => ['coalesce', ['get', prop], fallback]
const n = (prop, fallback) => ['case', ['has', prop], ['to-number', ['get', prop]], fallback]

export const DRAW_STYLES = [
  {
    id: 'gl-draw-polygon-fill-inactive',
    type: 'fill',
    filter: ['all', ['==', 'active', 'false'], ['==', '$type', 'Polygon'], ['!=', 'mode', 'static']],
    paint: {
      'fill-color':         c('user_fillColor', '#3bb2d0'),
      'fill-outline-color': c('user_color',     '#3bb2d0'),
      'fill-opacity':       n('user_fillOpacity', 0.1),
    },
  },
  {
    id: 'gl-draw-polygon-fill-active',
    type: 'fill',
    filter: ['all', ['==', 'active', 'true'], ['==', '$type', 'Polygon']],
    paint: {
      'fill-color':         c('user_fillColor', '#fbb03b'),
      'fill-outline-color': c('user_color',     '#fbb03b'),
      'fill-opacity':       n('user_fillOpacity', 0.1),
    },
  },
  {
    id: 'gl-draw-polygon-midpoint',
    type: 'circle',
    filter: ['all', ['==', '$type', 'Point'], ['==', 'meta', 'midpoint']],
    paint: { 'circle-radius': 3, 'circle-color': '#fbb03b' },
  },
  {
    id: 'gl-draw-polygon-stroke-inactive',
    type: 'line',
    filter: ['all', ['==', 'active', 'false'], ['==', '$type', 'Polygon'], ['!=', 'mode', 'static']],
    layout: { 'line-cap': 'round', 'line-join': 'round' },
    paint: {
      'line-color': c('user_color',   '#3bb2d0'),
      'line-width': n('user_lineWidth', 2),
    },
  },
  {
    id: 'gl-draw-polygon-stroke-active',
    type: 'line',
    filter: ['all', ['==', 'active', 'true'], ['==', '$type', 'Polygon']],
    layout: { 'line-cap': 'round', 'line-join': 'round' },
    paint: {
      'line-color':      c('user_color',   '#fbb03b'),
      'line-dasharray':  [0.2, 2],
      'line-width':      n('user_lineWidth', 2),
    },
  },
  {
    id: 'gl-draw-line-inactive',
    type: 'line',
    filter: ['all', ['==', 'active', 'false'], ['==', '$type', 'LineString'], ['!=', 'mode', 'static']],
    layout: { 'line-cap': 'round', 'line-join': 'round' },
    paint: {
      'line-color': c('user_color',   '#3bb2d0'),
      'line-width': n('user_lineWidth', 2),
    },
  },
  {
    id: 'gl-draw-line-active',
    type: 'line',
    filter: ['all', ['==', 'active', 'true'], ['==', '$type', 'LineString']],
    layout: { 'line-cap': 'round', 'line-join': 'round' },
    paint: {
      'line-color':     c('user_color',   '#fbb03b'),
      'line-dasharray': [0.2, 2],
      'line-width':     n('user_lineWidth', 2),
    },
  },
  {
    id: 'gl-draw-polygon-and-line-vertex-stroke-inactive',
    type: 'circle',
    filter: ['all', ['==', 'meta', 'vertex'], ['==', '$type', 'Point'], ['!=', 'mode', 'static']],
    paint: { 'circle-radius': 5, 'circle-color': '#fff' },
  },
  {
    id: 'gl-draw-polygon-and-line-vertex-inactive',
    type: 'circle',
    filter: ['all', ['==', 'meta', 'vertex'], ['==', '$type', 'Point'], ['!=', 'mode', 'static']],
    paint: { 'circle-radius': 3, 'circle-color': '#fbb03b' },
  },
  {
    id: 'gl-draw-point-point-inactive',
    type: 'circle',
    filter: ['all', ['==', 'active', 'false'], ['==', '$type', 'Point'], ['==', 'meta', 'feature'], ['!=', 'mode', 'static']],
    paint: {
      'circle-radius':       5,
      'circle-color':        c('user_color', '#3bb2d0'),
      'circle-stroke-width': 2,
      'circle-stroke-color': '#fff',
    },
  },
  {
    id: 'gl-draw-point-stroke-active',
    type: 'circle',
    filter: ['all', ['==', '$type', 'Point'], ['==', 'active', 'true'], ['!=', 'meta', 'midpoint']],
    paint: { 'circle-radius': 7, 'circle-color': '#fff' },
  },
  {
    id: 'gl-draw-point-active',
    type: 'circle',
    filter: ['all', ['==', '$type', 'Point'], ['!=', 'meta', 'midpoint'], ['==', 'active', 'true']],
    paint: {
      'circle-radius': 5,
      'circle-color':  c('user_color', '#fbb03b'),
    },
  },
]
