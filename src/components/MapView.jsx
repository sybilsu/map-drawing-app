import { useRef, useEffect, useState, useCallback } from 'react'
import mapboxgl from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'
import MapboxDraw from '@mapbox/mapbox-gl-draw'
import '@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css'
import MapboxGeocoder from '@mapbox/mapbox-gl-geocoder'
import '@mapbox/mapbox-gl-geocoder/dist/mapbox-gl-geocoder.css'
import ControlPanel from './ControlPanel'
import { MARKER_COLORS, OUTLINE_COLORS, computeFillStyle } from '../styles'
import { DRAW_STYLES } from '../drawStyles'

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN || 'YOUR_MAPBOX_TOKEN_HERE'
const DEFAULT_CENTER = [121.5654, 25.033]
const DEFAULT_ZOOM = 13
const MAP_STYLES = {
  light:     'mapbox://styles/mapbox/light-v11',
  satellite: 'mapbox://styles/mapbox/satellite-streets-v12',
}

// ── 自訂樣式圖層（獨立 GeoJSON source，不依賴 draw 內部渲染）────────
function addStyledLayers(m) {
  m.addSource('styled-features', {
    type: 'geojson',
    data: { type: 'FeatureCollection', features: [] },
  })

  // 多邊形填滿
  m.addLayer({
    id: 'styled-polygon-fill',
    type: 'fill',
    source: 'styled-features',
    filter: ['==', ['geometry-type'], 'Polygon'],
    paint: {
      'fill-color':   ['case', ['has', 'fillColor'],   ['get', 'fillColor'],   'rgba(0,0,0,0)'],
      'fill-opacity': ['case', ['has', 'fillOpacity'],
                        ['to-number', ['get', 'fillOpacity']], 0],
    },
  })

  // 多邊形外框
  m.addLayer({
    id: 'styled-polygon-stroke',
    type: 'line',
    source: 'styled-features',
    filter: ['==', ['geometry-type'], 'Polygon'],
    layout: { 'line-cap': 'round', 'line-join': 'round' },
    paint: {
      'line-color': ['case', ['has', 'color'], ['get', 'color'], '#3bb2d0'],
      'line-width': 2.5,
    },
  })

  // 線條
  m.addLayer({
    id: 'styled-line',
    type: 'line',
    source: 'styled-features',
    filter: ['==', ['geometry-type'], 'LineString'],
    layout: { 'line-cap': 'round', 'line-join': 'round' },
    paint: {
      'line-color': ['case', ['has', 'color'], ['get', 'color'], '#3bb2d0'],
      'line-width': 2.5,
    },
  })

  // 點
  m.addLayer({
    id: 'styled-point',
    type: 'circle',
    source: 'styled-features',
    filter: ['==', ['geometry-type'], 'Point'],
    paint: {
      'circle-radius':       8,
      'circle-color':        ['case', ['has', 'color'], ['get', 'color'], '#3bb2d0'],
      'circle-stroke-width': 2,
      'circle-stroke-color': '#ffffff',
    },
  })
}

export default function MapView() {
  const mapContainer = useRef(null)
  const map = useRef(null)
  const draw = useRef(null)
  const stylesRef = useRef({}) // { [featureId]: { markerColor?, outlineColor?, fillType? } }

  const [selectedFeature, setSelectedFeature] = useState(null)
  const [featureStyles, setFeatureStyles] = useState({})
  const [mapReady, setMapReady] = useState(false)
  const [basemap, setBasemap] = useState('light')
  const [drawMode, setDrawMode] = useState('simple_select')

  // ── styled-features source 同步 ───────────────────────────────
  const syncStyledSource = useCallback(() => {
    if (!map.current || !draw.current) return
    const source = map.current.getSource('styled-features')
    if (!source) return

    const features = draw.current.getAll().features.map(f => {
      const s = stylesRef.current[f.id] || {}
      const geom = f.geometry.type
      let color = null, fillColor = null, fillOpacity = 0

      if (geom === 'Point') {
        color = MARKER_COLORS[s.markerColor]?.hex ?? null
      } else if (geom === 'LineString') {
        color = OUTLINE_COLORS[s.outlineColor]?.hex ?? null
      } else if (geom === 'Polygon') {
        color = OUTLINE_COLORS[s.outlineColor]?.hex ?? null
        if (s.fillType) {
          const fill = computeFillStyle(s.fillType, color)
          fillColor   = fill.fillColor
          fillOpacity = fill.fillOpacity
        }
      }

      return {
        type: 'Feature',
        id: f.id,
        geometry: f.geometry,
        properties: { color, fillColor, fillOpacity },
      }
    })

    source.setData({ type: 'FeatureCollection', features })
  }, [])

  // ── 初始化 Mapbox ─────────────────────────────────────────────
  useEffect(() => {
    if (map.current) return
    mapboxgl.accessToken = MAPBOX_TOKEN

    const m = new mapboxgl.Map({
      container: mapContainer.current,
      style: MAP_STYLES.light,
      center: DEFAULT_CENTER,
      zoom: DEFAULT_ZOOM,
      preserveDrawingBuffer: true,
    })
    map.current = m

    m.on('load', () => {
      const d = new MapboxDraw({
        displayControlsDefault: false,
        controls: { polygon: true, line_string: true, point: true, trash: true },
        styles: DRAW_STYLES,
      })
      draw.current = d
      m.addControl(d, 'top-left')

      // 在 draw 圖層之上加入自訂樣式圖層
      addStyledLayers(m)

      m.addControl(
        new MapboxGeocoder({
          accessToken: MAPBOX_TOKEN, mapboxgl,
          placeholder: '輸入地址或地點...',
          language: 'zh-TW', countries: 'tw', marker: true,
        }),
        'top-right'
      )
      m.addControl(new mapboxgl.NavigationControl(), 'top-right')
      m.addControl(new mapboxgl.ScaleControl(), 'bottom-right')

      m.on('draw.selectionchange', (e) => {
        setSelectedFeature(e.features.length > 0 ? e.features[0] : null)
      })
      m.on('draw.modechange', (e) => {
        setDrawMode(e.mode)
        // 切回 simple_select 時主動抓取當前選取（修正手機上 selectionchange 未觸發）
        if (e.mode === 'simple_select') {
          const sel = draw.current?.getSelectedIds() ?? []
          if (sel.length > 0) {
            const f = draw.current.get(sel[0])
            if (f) setSelectedFeature(f)
          }
        }
      })
      m.on('draw.create', (e) => {
        syncStyledSource()
        // 畫完後自動選取，讓換色面板立即顯示
        if (e.features.length > 0) setSelectedFeature(e.features[0])
      })
      m.on('draw.update', syncStyledSource)
      m.on('draw.delete', (e) => {
        e.features.forEach(f => delete stylesRef.current[f.id])
        setFeatureStyles({ ...stylesRef.current })
        syncStyledSource()
      })

      setMapReady(true)
    })

    return () => { m.remove(); map.current = null; draw.current = null }
  }, [syncStyledSource])

  // ── 套用樣式 ─────────────────────────────────────────────────
  const applyProp = useCallback((type, key) => {
    if (!selectedFeature) return

    const id = selectedFeature.id
    const prev = stylesRef.current[id] || {}
    const propName = { marker: 'markerColor', outline: 'outlineColor', fill: 'fillType' }[type]
    const newStyle = { ...prev, [propName]: key }

    stylesRef.current = { ...stylesRef.current, [id]: newStyle }
    setFeatureStyles({ ...stylesRef.current })
    syncStyledSource()
  }, [selectedFeature, syncStyledSource])

  // ── 切換底圖 ──────────────────────────────────────────────────
  const switchBasemap = useCallback((key) => {
    if (!map.current || !draw.current || key === basemap) return

    // 切換前儲存繪圖內容與樣式
    const savedFeatures = draw.current.getAll()

    map.current.setStyle(MAP_STYLES[key])

    map.current.once('style.load', () => {
      // 重新掛載自訂樣式圖層
      addStyledLayers(map.current)
      // 還原繪圖內容
      if (savedFeatures.features.length > 0) {
        draw.current.add(savedFeatures)
      }
      syncStyledSource()
    })

    setBasemap(key)
  }, [basemap, syncStyledSource])

  // ── 匯出 PNG ──────────────────────────────────────────────────
  const exportPNG = useCallback(() => {
    if (!map.current) return
    const a = document.createElement('a')
    a.download = `map-${Date.now()}.png`
    a.href = map.current.getCanvas().toDataURL('image/png')
    a.click()
  }, [])

  // ── 匯出 SVG ──────────────────────────────────────────────────
  const exportSVG = useCallback(() => {
    if (!map.current || !draw.current) return

    const canvas = map.current.getCanvas()
    const W = canvas.width
    const H = canvas.height
    const bgData = canvas.toDataURL('image/png')
    const proj = (c) => { const p = map.current.project(c); return [+p.x.toFixed(2), +p.y.toFixed(2)] }

    const elements = draw.current.getAll().features.map(f => {
      const s = stylesRef.current[f.id] || {}
      const geom = f.geometry

      if (geom.type === 'Point') {
        const color = MARKER_COLORS[s.markerColor]?.hex || '#3bb2d0'
        const [cx, cy] = proj(geom.coordinates)
        return `<circle cx="${cx}" cy="${cy}" r="8" fill="${color}" stroke="white" stroke-width="2"/>`
      }
      if (geom.type === 'LineString') {
        const color = OUTLINE_COLORS[s.outlineColor]?.hex || '#3bb2d0'
        const pts = geom.coordinates.map(c => proj(c).join(',')).join(' ')
        return `<polyline points="${pts}" fill="none" stroke="${color}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>`
      }
      if (geom.type === 'Polygon') {
        const color = OUTLINE_COLORS[s.outlineColor]?.hex || '#3bb2d0'
        const { fillColor, fillOpacity } = s.fillType
          ? computeFillStyle(s.fillType, color)
          : { fillColor: 'none', fillOpacity: 0 }
        const d = geom.coordinates.map(ring =>
          `M ${ring.map(c => proj(c).join(',')).join(' L ')} Z`
        ).join(' ')
        return `<path d="${d}" fill="${fillColor}" fill-opacity="${fillOpacity}" stroke="${color}" stroke-width="2.5" stroke-linejoin="round"/>`
      }
      return ''
    }).filter(Boolean)

    const svg = [
      `<?xml version="1.0" encoding="UTF-8"?>`,
      `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">`,
      `  <image xlink:href="${bgData}" width="${W}" height="${H}"/>`,
      ...elements.map(el => `  ${el}`),
      `</svg>`,
    ].join('\n')

    const blob = new Blob([svg], { type: 'image/svg+xml' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.download = `map-${Date.now()}.svg`
    a.href = url
    a.click()
    URL.revokeObjectURL(url)
  }, [])

  const handleExport = useCallback((fmt) => {
    fmt === 'png' ? exportPNG() : exportSVG()
  }, [exportPNG, exportSVG])

  return (
    <div style={{ position: 'fixed', inset: 0, width: '100vw', height: '100vh' }}>
      <div ref={mapContainer} style={{ position: 'absolute', inset: 0 }} />

      {/* ── 底圖切換（縮放按鈕下方）────────────────────────────── */}
      {mapReady && (
        <div style={{
          position: 'absolute', top: 155, right: 10, zIndex: 10,
          display: 'flex', flexDirection: 'column',
          borderRadius: 4, overflow: 'hidden',
          boxShadow: '0 0 0 2px rgba(0,0,0,0.1)',
        }}>
          {[{ key: 'light', label: '街道' }, { key: 'satellite', label: '衛星' }].map(({ key, label }) => (
            <button key={key} onClick={() => switchBasemap(key)} style={{
              padding: '6px 8px', fontSize: 11, fontWeight: 600,
              border: 'none', borderBottom: '1px solid #e5e7eb',
              cursor: 'pointer', lineHeight: 1, touchAction: 'manipulation',
              background: basemap === key ? '#1a1a1a' : '#fff',
              color:      basemap === key ? '#fff'    : '#333',
            }}>{label}</button>
          ))}
        </div>
      )}

      {mapReady && (
        <ControlPanel
          selectedFeature={selectedFeature}
          featureStyles={featureStyles}
          onApply={applyProp}
          onExport={handleExport}
          drawMode={drawMode}
          onFinishDraw={() => {
            draw.current?.changeMode('simple_select')
            setTimeout(() => {
              // 先試 selection，再 fallback 到最後一個 feature
              const sel = draw.current?.getSelectedIds() ?? []
              if (sel.length > 0) {
                const f = draw.current.get(sel[0])
                if (f) { setSelectedFeature(f); return }
              }
              const all = draw.current?.getAll()?.features ?? []
              if (all.length > 0) setSelectedFeature(all[all.length - 1])
            }, 100)
          }}
          onCancelDraw={() => { draw.current?.trash(); draw.current?.changeMode('simple_select') }}
        />
      )}
    </div>
  )
}
