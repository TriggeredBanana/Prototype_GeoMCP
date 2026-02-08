import { MapContainer, TileLayer, GeoJSON, useMap } from 'react-leaflet'
import { useEffect } from 'react'
import L from 'leaflet'

function FitToGeoJson({ geoJson, fallbackCenter, fallbackZoom }) {
  const map = useMap()

  useEffect(() => {
    if (!geoJson?.features?.length) {
      map.setView(fallbackCenter, fallbackZoom)
      return
    }

    try {
      const layer = L.geoJSON(geoJson)
      const bounds = layer.getBounds()

      if (bounds.isValid()) {
        map.fitBounds(bounds, { padding: [10, 10] })
      }
    } catch (e) {
      console.error('Invalid GeoJSON:', e)
    }
  }, [geoJson, map, fallbackCenter, fallbackZoom])

  return null
}

function MiniMap({ geoJson }) {
  const fallbackCenter = [58.1467, 7.9956]
  const fallbackZoom = 12

  return (
    <MapContainer
      center={fallbackCenter}
      zoom={fallbackZoom}
      scrollWheelZoom={true}
      style={{ height: '300px', width: '100%' }}
    >
      <TileLayer
        attribution="&copy; OpenStreetMap contributors"
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      <FitToGeoJson geoJson={geoJson} fallbackCenter={fallbackCenter} fallbackZoom={fallbackZoom} />

      {geoJson?.features?.length > 0 && <GeoJSON data={geoJson} />}
    </MapContainer>
  )
}

export default MiniMap
