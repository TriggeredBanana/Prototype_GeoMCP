import { useState, useRef, useEffect } from 'react'
import { GoogleGenerativeAI } from '@google/generative-ai'
import { useNavigate } from 'react-router-dom'
import MiniMap from '../components/MiniMap'
import norkartLogo from '../assets/01 Logo with spacing-Cwl_Y2_p.png'
import uiaLogo from '../assets/uia-horizontal-with-name-positive.png'
import '../App.css'
import { useGeoJson } from '../state/GeoJsonContext'


const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY

const SYSTEM_PROMPT = `Du er en spesialisert KI-agent for analyse av norske geo- og plansaksdata hentet fra en GeoMCP (Model Context Protocol).
Din eneste autoritative kunnskapskilde er dataene som er eksplisitt gjort tilgjengelig for deg i forespørselen.

Formål:
- Bistå kundebehandlere ved å analysere, sammenstille og forklare komplekse saker som byggesaker, arealbruk, reguleringsplaner, konsekvensutredninger og kartdata.
- Redusere behovet for manuell gjennomgang av store dokumentmengder ved å levere korte, strukturerte og presise rapporter.

Strenge regler:
- Du skal aldri ta beslutninger, gi godkjenninger eller anbefale vedtak.
- Du skal aldri spekulere, anta eller fylle inn manglende informasjon.
- Hvis nødvendig data mangler eller er uklart, skal du eksplisitt si hva som mangler.
- Alle påstander må være direkte og entydig støttet av tilgjengelige data.
- Hvis dataene ikke gir et sikkert svar, skal du svare at dette ikke kan avgjøres basert på tilgjengelig informasjon.

Arbeidsmetode:
- Les og forstå alle relevante datasett, kartlag, planer og dokumenter som er gitt.
- Identifiser relevante lover, planer, hensynssoner og restriksjoner kun dersom de eksplisitt fremgår av dataene.
- Kryssjekk informasjon internt før du konkluderer.
- Skill tydelig mellom fakta, observasjoner og oppsummeringer.

Svarformat:
- Bruk et nøkternt, profesjonelt og presist språk.
- Ingen unødvendig forklaring eller pedagogikk.
- Foretrekk punktlister og korte avsnitt.
- Strukturer svar som en saksrapport, for eksempel:
  * Grunnlagsdata
  * Relevante forhold
  * Identifiserte begrensninger eller krav
  * Samlet faktabasert vurdering

Rolleavgrensning:
- Du er et analyse- og støtteverktøy.
- Sluttvurdering og beslutning tas alltid av menneskelig saksbehandler.

Mål:
Å levere 100 % korrekt, etterprøvbar og konsis informasjon basert utelukkende på tilgjengelige GeoMCP-data, slik at en kundebehandler kan fatte en informert beslutning.`

const genAI = GEMINI_API_KEY ? new GoogleGenerativeAI(GEMINI_API_KEY) : null


function HomePage() {
    const [messages, setMessages] = useState([])
    const [input, setInput] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const [apiStatus, setApiStatus] = useState('checking')
    const { selectedGeoJson } = useGeoJson()
    const messagesEndRef = useRef(null)
    const chatRef = useRef(null)
    const navigate = useNavigate()

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, [messages])

    useEffect(() => {
        if (!genAI) {
            setApiStatus('disconnected')
            return
        }

        const model = genAI.getGenerativeModel({
            model: 'gemini-2.5-flash',
            systemInstruction: SYSTEM_PROMPT,
        })
        chatRef.current = model.startChat({ history: [] })
    }, [])


    const handleSubmit = async (e) => {
        e.preventDefault()
        if (!input.trim() || isLoading) return

        if (!chatRef.current) {
            setApiStatus('disconnected')
            setMessages(prev => [...prev, { role: 'assistant', content: 'API er ikke initialisert.' }])
            return
        }

        const userMessage = input.trim()
        setInput('')
        setMessages((prev) => [...prev, { role: 'user', content: userMessage }])
        setIsLoading(true)
        setApiStatus('checking')

        try {
            const result = await chatRef.current.sendMessage(userMessage)
            const response = await result.response
            const text = response.text()

            setApiStatus('connected')
            setMessages((prev) => [...prev, { role: 'assistant', content: text }])
        } catch (error) {
            console.error('Error:', error)

            const message = String(error?.message || error)

            // Litt mer presis feilhåndtering
            if (message.includes('[429') || message.includes('429') || message.toLowerCase().includes('quota')) {
                setApiStatus('disconnected')
                setMessages((prev) => [
                    ...prev,
                    {
                        role: 'assistant',
                        content:
                            'Gemini-kvoten er brukt opp akkurat nå (429). Vent litt og prøv igjen, eller bruk en annen nøkkel/plan.',
                    },
                ])
            } else if (message.toLowerCase().includes('api key') || message.toLowerCase().includes('invalid')) {
                setApiStatus('disconnected')
                setMessages((prev) => [
                    ...prev,
                    {
                        role: 'assistant',
                        content: 'API-nøkkelen ser ut til å være ugyldig. Sjekk .env og restart dev-serveren.',
                    },
                ])
            } else {
                setApiStatus('disconnected')
                setMessages((prev) => [
                    ...prev,
                    { role: 'assistant', content: 'Beklager, det oppstod en feil. Vennligst prøv igjen.' },
                ])
            }
        } finally {
            setIsLoading(false)
        }
    }


    return (
        <div className="page">
            {/* LEFT SIDEBAR */}
            <aside className="sidebar left">
                <img
                    src={norkartLogo}
                    alt="Norkart Logo"
                    className="brand-logo clickable"
                    onClick={() => {
                        setMessages([])
                        setInput('')
                        navigate('/home')
                    }}
                    role="button"
                    aria-label="Go to home"
                />

                <section>
                    <p></p>
                    <p></p>
                    <p className="sidebar-footer-text">System status</p>
                    <p className={`status ${apiStatus}`}>
                        ● {apiStatus === 'connected' && 'API connected'}
                        {apiStatus === 'disconnected' && 'API error'}
                        {apiStatus === 'checking' && 'Checking API…'}
                    </p>

                </section>

                <section className='quick-actions'>
                    <p className="sidebar-footer-text">Quick actions</p>

                    <button
                        type="button"
                        className="btn-reset-chat"
                        onClick={() => setMessages([])}>
                        Reset chat
                    </button>

                    <button
                        type="button"
                        className="btn-reset-terms"
                        onClick={() => {
                            localStorage.removeItem('termsAccepted')
                            navigate('/', { replace: true })
                        }}
                    >
                        Reset terms
                    </button>
                </section>


            </aside>

            {/* CENTER CHAT */}
            <main className="chat-area">
                <div className="messages-container">
                    {messages.length === 0 && (
                        <div className="welcome-message">
                            <p>Velkommen til GIS-eksperten!
                                <span>Still meg et spørsmål for å komme i gang👋</span>
                            </p>
                        </div>
                    )}

                    {messages.map((msg, i) => (
                        <div key={i} className={`message ${msg.role}`}>
                            {msg.content}
                        </div>
                    ))}

                    {isLoading && <div className="message assistant">Tenker…</div>}
                    <div ref={messagesEndRef} />
                </div>

                <form onSubmit={handleSubmit} className="chat-input">
                    <label className="chat-icon-btn" title="Add files">
                        +
                        <input
                            type="file"
                            multiple
                            hidden
                            onChange={(e) => {
                                const files = Array.from(e.target.files)
                                console.log('Selected files:', files)
                            }}
                        />
                    </label>
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Hva lurer du på?"
                    />
                    <button
                        type="submit"
                        className="chat-icon-btn"
                        title="Send message"
                        disabled={isLoading || apiStatus === 'checking' || apiStatus === 'disconnected'}
                    >
                        ➤
                    </button>


                </form>
            </main>

            {/* RIGHT SIDEBAR */}
            <aside className="sidebar right">
                <section className="map-preview">
                    <div className="mini-map">
                        <MiniMap geoJson={selectedGeoJson} />
                    </div>

                    <div className="map-actions">
                        <button type="button" className="btn primary" onClick={() => navigate('/map')}>
                            View full map
                        </button>
                        <button type="button" className="btn secondary">
                            Clear layers
                        </button>
                        <button type="button" className="btn secondary">
                            Reset view
                        </button>
                    </div>
                </section>

                <div className="sidebar-footer">
                    <div className="sidebar-footer-logos">
                        <a href="https://www.uia.no" target="_blank" rel="noreferrer">
                            <img src={uiaLogo} alt="Universitetet i Agder" className="sidebar-footer-logo" />
                        </a>

                        <a href="https://www.norkart.no" target="_blank" rel="noreferrer">
                            <img src={norkartLogo} alt="Norkart" className="sidebar-footer-logo" />
                        </a>
                    </div>

                    <p className="sidebar-footer-text">
                        Prototype utviklet av Gruppe 8 (UiA)<br />
                        i samarbeid med Norkart.<br />
                        Konseptuell demonstrator.
                    </p>
                </div>

            </aside>
        </div>
    )
}

export default HomePage