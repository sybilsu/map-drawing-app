// 優化繪圖視覺回饋：
// - 移除 line-dasharray（虛線渲染慢，造成線條延遲出現）
// - 放大頂點圓圈，避免點消失
// - inactive 保留淡藍色（無自訂樣式時仍可見）
// - 自訂 styled-features 圖層會疊在上方，覆蓋 inactive 顏色

export const DRAW_STYLES = [
  // ── Polygon fill inactive（淡，styled-features 會蓋住）
  {
    id: 'gl-draw-polygon-fill-inactive',
    type: 'fill',
    filter: ['all', ['==', 'active', 'false'], ['==', '$type', 'Polygon'], ['!=', 'mode', 'static']],
    paint: { 'fill-color': '#3bb2d0', 'fill-opacity': 0.05 },
  },
  // ── Polygon fill active（繪製中）
  {
    id: 'gl-draw-polygon-fill-active',
    type: 'fill',
    filter: ['all', ['==', 'active', 'true'], ['==', '$type', 'Polygon']],
    paint: { 'fill-color': '#fbb03b', 'fill-opacity': 0.15 },
  },
  // ── Polygon 中點
  {
    id: 'gl-draw-polygon-midpoint',
    type: 'circle',
    filter: ['all', ['==', '$type', 'Point'], ['==', 'meta', 'midpoint']],
    paint: { 'circle-radius': 4, 'circle-color': '#fbb03b' },
  },
  // ── Polygon stroke inactive
  {
    id: 'gl-draw-polygon-stroke-inactive',
    type: 'line',
    filter: ['all', ['==', 'active', 'false'], ['==', '$type', 'Polygon'], ['!=', 'mode', 'static']],
    layout: { 'line-cap': 'round', 'line-join': 'round' },
    paint: { 'line-color': '#3bb2d0', 'line-width': 1.5, 'line-opacity': 0.3 },
  },
  // ── Polygon stroke active（繪製中，實線不虛線）
  {
    id: 'gl-draw-polygon-stroke-active',
    type: 'line',
    filter: ['all', ['==', 'active', 'true'], ['==', '$type', 'Polygon']],
    layout: { 'line-cap': 'round', 'line-join': 'round' },
    paint: { 'line-color': '#fbb03b', 'line-width': 2.5 },
  },
  // ── Line inactive
  {
    id: 'gl-draw-line-inactive',
    type: 'line',
    filter: ['all', ['==', 'active', 'false'], ['==', '$type', 'LineString'], ['!=', 'mode', 'static']],
    layout: { 'line-cap': 'round', 'line-join': 'round' },
    paint: { 'line-color': '#3bb2d0', 'line-width': 1.5, 'line-opacity': 0.3 },
  },
  // ── Line active（繪製中，實線讓線段即時可見）
  {
    id: 'gl-draw-line-active',
    type: 'line',
    filter: ['all', ['==', 'active', 'true'], ['==', '$type', 'LineString']],
    layout: { 'line-cap': 'round', 'line-join': 'round' },
    paint: { 'line-color': '#3bb2d0', 'line-width': 2.5 },
  },
  // ── 頂點外圈（白色 halo，讓點明顯）
  {
    id: 'gl-draw-polygon-and-line-vertex-stroke-inactive',
    type: 'circle',
    filter: ['all', ['==', 'meta', 'vertex'], ['==', '$type', 'Point'], ['!=', 'mode', 'static']],
    paint: { 'circle-radius': 8, 'circle-color': '#fff' },
  },
  // ── 頂點（藍色，放大避免消失）
  {
    id: 'gl-draw-polygon-and-line-vertex-inactive',
    type: 'circle',
    filter: ['all', ['==', 'meta', 'vertex'], ['==', '$type', 'Point'], ['!=', 'mode', 'static']],
    paint: { 'circle-radius': 5, 'circle-color': '#3bb2d0' },
  },
  // ── Point inactive
  {
    id: 'gl-draw-point-point-inactive',
    type: 'circle',
    filter: ['all', ['==', 'active', 'false'], ['==', '$type', 'Point'], ['==', 'meta', 'feature'], ['!=', 'mode', 'static']],
    paint: { 'circle-radius': 6, 'circle-color': '#3bb2d0', 'circle-stroke-width': 2, 'circle-stroke-color': '#fff' },
  },
  // ── Point active halo
  {
    id: 'gl-draw-point-stroke-active',
    type: 'circle',
    filter: ['all', ['==', '$type', 'Point'], ['==', 'active', 'true'], ['!=', 'meta', 'midpoint']],
    paint: { 'circle-radius': 9, 'circle-color': '#fff' },
  },
  // ── Point active
  {
    id: 'gl-draw-point-active',
    type: 'circle',
    filter: ['all', ['==', '$type', 'Point'], ['!=', 'meta', 'midpoint'], ['==', 'active', 'true']],
    paint: { 'circle-radius': 7, 'circle-color': '#fbb03b' },
  },
]
