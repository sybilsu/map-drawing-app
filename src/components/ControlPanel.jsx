import { MARKER_COLORS, OUTLINE_COLORS, FILL_TYPES, lightenColor } from '../styles'

const GEOM_LABEL = {
  Point:      '點（標示）',
  LineString: '線條（道路）',
  Polygon:    '多邊形（基地）',
}

function Section({ title, children }) {
  return (
    <div className="space-y-2">
      <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">{title}</p>
      {children}
    </div>
  )
}

function ColorDot({ hex, label, selected, onClick }) {
  return (
    <button
      title={label}
      onClick={onClick}
      style={{ backgroundColor: hex }}
      className={`w-8 h-8 rounded-full shadow transition-all
        ${selected
          ? 'ring-2 ring-offset-2 ring-gray-700 scale-110'
          : 'hover:scale-110 ring-1 ring-black/10'
        }`}
    />
  )
}

export default function ControlPanel({ selectedFeature, featureStyles, onApply, onExport, basemap, onBasemap, drawMode, onFinishDraw, onCancelDraw }) {
  const geomType = selectedFeature?.geometry?.type
  const fid = selectedFeature?.id
  const cur = fid != null ? (featureStyles[fid] || {}) : {}
  const outlineHex = OUTLINE_COLORS[cur.outlineColor]?.hex

  return (
    <div className="
      absolute bottom-6 left-1/2 -translate-x-1/2
      md:left-auto md:right-6 md:bottom-6 md:translate-x-0
      w-[calc(100vw-2rem)] max-w-xs
      bg-white/92 backdrop-blur-md
      rounded-2xl shadow-xl border border-gray-200
      z-10 flex flex-col
      max-h-[70vh]
    ">
      {/* ── Header（固定不捲動）──────────────────────── */}
      <div className="flex items-center justify-between gap-2 px-4 pt-4 pb-3 shrink-0">
        <h2 className="text-sm font-bold text-gray-700">圖面控制</h2>
        <div className="flex items-center gap-1.5">
          <span className="text-xs text-gray-400 font-medium">匯出 ↑</span>
          <ExportButton label="PNG" onClick={() => onExport('png')} />
          <ExportButton label="SVG" onClick={() => onExport('svg')} />
        </div>
      </div>

      {/* ── 可捲動內容區 ─────────────────────────────── */}
      <div className="overflow-y-auto px-4 pb-4 space-y-3">

        {/* ── 繪製中：完成 / 取消 ──────────────────── */}
        {(drawMode === 'draw_line_string' || drawMode === 'draw_polygon') && (
          <div className="flex gap-2">
            <button onPointerDown={(e) => { e.stopPropagation(); onFinishDraw() }}
              className="flex-1 py-2.5 rounded-xl bg-gray-800 text-white text-sm font-bold active:scale-95 transition-all"
              style={{ touchAction: 'manipulation' }}>
              完成繪製
            </button>
            <button onPointerDown={(e) => { e.stopPropagation(); onCancelDraw() }}
              className="py-2.5 px-4 rounded-xl border border-gray-200 text-gray-500 text-sm font-semibold active:scale-95 transition-all"
              style={{ touchAction: 'manipulation' }}>
              取消
            </button>
          </div>
        )}

        {/* ── 底圖切換 ─────────────────────────────── */}
        <Section title="底圖">
          <div className="flex gap-2">
            {[{ key: 'light', label: '街道圖' }, { key: 'satellite', label: '衛星圖' }].map(({ key, label }) => (
              <button key={key} onClick={() => onBasemap(key)}
                className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition-all
                  ${basemap === key
                    ? 'bg-gray-800 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
              >{label}</button>
            ))}
          </div>
        </Section>

        <hr className="border-gray-100" />

        {selectedFeature ? (
          <div className="space-y-3">
            <p className="text-xs text-gray-400">
              已選取：<span className="font-semibold text-gray-600">
                {GEOM_LABEL[geomType] ?? geomType}
              </span>
            </p>

            {/* ── 點：標示顏色 ─────────────────────── */}
            {geomType === 'Point' && (
              <Section title="標示">
                <div className="flex gap-2.5">
                  {Object.entries(MARKER_COLORS).map(([k, c]) => (
                    <ColorDot key={k} hex={c.hex} label={c.label}
                      selected={cur.markerColor === k}
                      onClick={() => onApply('marker', k)} />
                  ))}
                </div>
              </Section>
            )}

            {/* ── 線 / 多邊形：框線顏色 ────────────── */}
            {(geomType === 'LineString' || geomType === 'Polygon') && (
              <Section title="框線">
                <div className="flex gap-2.5">
                  {Object.entries(OUTLINE_COLORS).map(([k, c]) => (
                    <ColorDot key={k} hex={c.hex} label={c.label}
                      selected={cur.outlineColor === k}
                      onClick={() => onApply('outline', k)} />
                  ))}
                </div>
              </Section>
            )}

            {/* ── 多邊形：填滿 ─────────────────────── */}
            {geomType === 'Polygon' && (
              <Section title="填滿">
                <div className="grid grid-cols-3 gap-1.5">
                  {Object.entries(FILL_TYPES).map(([k, ft]) => {
                    const previewHex = ft.dynamic
                      ? lightenColor(outlineHex || '#6b7280', 0.65)
                      : ft.fillColor
                    return (
                      <button key={k} onClick={() => onApply('fill', k)}
                        className={`flex flex-col items-center gap-1.5 p-2 rounded-xl border text-[11px] transition-all
                          ${cur.fillType === k
                            ? 'border-blue-400 bg-blue-50 text-blue-700 font-semibold'
                            : 'border-gray-200 hover:border-gray-300 text-gray-600'
                          }`}
                      >
                        <span className="w-7 h-7 rounded-md border border-gray-200 block"
                          style={{ backgroundColor: previewHex, opacity: ft.fillOpacity + 0.25 }} />
                        <span className="leading-tight text-center">{ft.label}</span>
                      </button>
                    )
                  })}
                </div>
              </Section>
            )}
          </div>
        ) : (
          <div className="text-center py-3 space-y-1">
            <p className="text-xs text-gray-400">在地圖上繪製或選取圖形</p>
            <p className="text-xs text-gray-300">多邊形 · 線條 · 點</p>
          </div>
        )}

        <div className="pt-1 border-t border-gray-100">
          <p className="text-[10px] text-gray-300 text-center">左上角工具列：繪製 / 刪除圖形</p>
        </div>
      </div>
    </div>
  )
}

function ExportButton({ label, onClick }) {
  return (
    <button onClick={onClick}
      className="text-xs font-semibold bg-gray-800 text-white px-2.5 py-1.5 rounded-lg hover:bg-gray-700 active:scale-95 transition-all">
      {label}
    </button>
  )
}
