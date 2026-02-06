import { MapContainer, TileLayer } from 'react-leaflet'

function MiniMap() {
  return (
    <MapContainer
      center={[58.1467, 7.9956]}  // Kristiansand-ish som default
      zoom={12}
      scrollWheelZoom={false}
      style={{ height: '300px', width: '100%' }}
    >
      <TileLayer
        attribution='&copy; OpenStreetMap contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
    </MapContainer>
  )
}

export default MiniMap
