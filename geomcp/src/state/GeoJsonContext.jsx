import { createContext, useContext, useState } from 'react'

const GeoJsonContext = createContext(null)

export function GeoJsonProvider({ children }) {
    const [selectedGeoJson, setSelectedGeoJson] = useState({
        type: 'FeatureCollection',
        features: [],
    })

    return (
        <GeoJsonContext.Provider value={{ selectedGeoJson, setSelectedGeoJson }}>
            {children}
        </GeoJsonContext.Provider>
    )
}

export function useGeoJson() {
    const ctx = useContext(GeoJsonContext)
    if (!ctx) throw new Error('useGeoJson must be used within GeoJsonProvider')
    return ctx
}
