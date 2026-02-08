import { useEffect } from 'react'
import { useMap } from 'react-leaflet'

function MapDrawTools({ onGeoJsonChange }) {
    const map = useMap()

    useEffect(() => {
        map.pm.addControls({
            position: 'topleft',
            drawMarker: false,
            drawCircle: false,
            drawCircleMarker: false,
            drawPolyline: false,
            drawRectangle: false,
            drawPolygon: true, // ✅ kun polygon nå
            editMode: true,
            dragMode: false,
            removalMode: true,
            cutPolygon: false,
            rotateMode: false,
        })

        const emitAll = () => {
            const geojson = map.pm.getGeomanLayers(true).toGeoJSON()
            if (onGeoJsonChange) onGeoJsonChange(geojson)
        }

        map.on('pm:create', emitAll)
        map.on('pm:edit', emitAll)
        map.on('pm:remove', emitAll)

        return () => {
            map.off('pm:create', emitAll)
            map.off('pm:edit', emitAll)
            map.off('pm:remove', emitAll)
        }
    }, [map, onGeoJsonChange])

    return null
}

export default MapDrawTools
