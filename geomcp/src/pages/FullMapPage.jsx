import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { MapContainer, TileLayer } from 'react-leaflet'
import MapDrawTools from '../components/MapDrawTools'
import '../App.css'
import norkartLogo from '../assets/01 Logo with spacing-Cwl_Y2_p.png'
import { useGeoJson } from '../state/GeoJsonContext'



function FullMapPage() {
    const navigate = useNavigate()
    const { selectedGeoJson, setSelectedGeoJson } = useGeoJson()
    const [copyStatus, setCopyStatus] = useState('')

    const featureCount = useMemo(() => {
        if (!selectedGeoJson?.features) return 0
        return selectedGeoJson.features.length
    }, [selectedGeoJson])

    const handleCopy = async () => {
        try {
            const text = JSON.stringify(selectedGeoJson ?? { type: 'FeatureCollection', features: [] }, null, 2)
            await navigator.clipboard.writeText(text)
            setCopyStatus('Copied!')
            window.setTimeout(() => setCopyStatus(''), 1200)
        } catch (error) {
            console.error(error)
            setCopyStatus('Copy failed')
            window.setTimeout(() => setCopyStatus(''), 1500)
        }
    }

    return (
        <div className="fullmap-page">
            <div className="fullmap-topbar">
                <img
                    src={norkartLogo}
                    alt="Norkart"
                    className="brand-logo clickable"
                    onClick={() => navigate('/')}
                    role="button"
                    aria-label="Go to home"
                />

                <div className="fullmap-title"> </div>

                <div className="fullmap-spacer" />

                <div className="fullmap-meta">
                    Selected: {featureCount} feature{featureCount === 1 ? '' : 's'}
                </div>

                <button type="button" className="btn primary" onClick={handleCopy}>
                    Copy GeoJSON
                </button>

                {copyStatus && <div className="copy-status">{copyStatus}</div>}
            </div>

            <div className="fullmap-map">
                <MapContainer
                    center={[58.1467, 7.9956]}
                    zoom={12}
                    scrollWheelZoom
                    style={{ height: '100%', width: '100%' }}
                >
                    <TileLayer
                        attribution="&copy; OpenStreetMap contributors"
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    <MapDrawTools onGeoJsonChange={setSelectedGeoJson} />
                </MapContainer>
            </div>
        </div>
    )
}

export default FullMapPage
