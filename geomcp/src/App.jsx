import { useState, useRef, useEffect } from 'react'
import { GoogleGenerativeAI } from '@google/generative-ai'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPaperPlane, faRobot, faUser, faSpinner } from '@fortawesome/free-solid-svg-icons'
import './App.css'
import MiniMap from './components/MiniMap'


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

const genAI = new GoogleGenerativeAI(GEMINI_API_KEY)

function App() {
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef(null)
  const chatRef = useRef(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    const model = genAI.getGenerativeModel({
      model: 'gemini-2.5-flash',
      systemInstruction: SYSTEM_PROMPT
    })
    chatRef.current = model.startChat({
      history: [],
    })
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!input.trim() || isLoading) return

    const userMessage = input.trim()
    setInput('')
    setMessages(prev => [...prev, { role: 'user', content: userMessage }])
    setIsLoading(true)

    try {
      const result = await chatRef.current.sendMessage(userMessage)
      const response = await result.response
      const text = response.text()

      setMessages(prev => [...prev, { role: 'assistant', content: text }])
    } catch (error) {
      console.error('Error:', error)
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'Beklager, det oppstod en feil. Vennligst prøv igjen.'
      }])
    } finally {
      setIsLoading(false)
    }
  }

  const formatMessage = (content) => {
    return content.split('\n').map((line, i) => (
      <span key={i}>
        {line}
        {i < content.split('\n').length - 1 && <br />}
      </span>
    ))
  }

  return (
    <div className="page">
      {/* LEFT SIDEBAR */}
      <aside className="sidebar left">
        <div className="brand">
          <h2>Norkart</h2>
          <span>GIS-eksperten</span>
        </div>

        <section>
          <h4>MCP Server Config</h4>
          <p>Server URL:</p>
          <code>http://localhost:5173/geomcp</code>
        </section>

        <section>
          <h4>System status</h4>
          <p className="status ok">● MCP server connected</p>
          <p>Messages: 4</p>
          <p>Tokens left: 1933</p>
        </section>

        <section>
          <h4>Files</h4>
          <ul className="file-list">
            <li>Planbeskrivelse.pdf</li>
            <li>Arealfordeling.csv</li>
            <li>Naturtypekart.geojson</li>
          </ul>
        </section>

        <section>
          <h4>Quick actions</h4>
          <button>Reset chat</button>
        </section>
      </aside>

      {/* CENTER CHAT */}
      <main className="chat-area">
        <div className="messages-container">
          {messages.length === 0 && (
            <div className="welcome-message">
              <p>Velkommen til GIS-eksperten.</p>
            </div>
          )}

          {messages.map((msg, i) => (
            <div key={i} className={`message ${msg.role}`}>
              {msg.content}
            </div>
          ))}

          {isLoading && <div className="message assistant">Tenker…</div>}
        </div>

        <form onSubmit={handleSubmit} className="chat-input">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your question here…"
          />
          <button type="submit">➤</button>
        </form>
      </main>

      {/* RIGHT SIDEBAR */}
      <aside className="sidebar right">
        <section className="map-preview">
          <div className="mini-map">
            <MiniMap /></div>
          <div className="map-actions">
            <button className="btn primary">View full map</button>
            <button className="btn primary">Clear layers</button>
            <button className="btn primary">Reset view</button>
          </div>

        </section>

        <section>
          <h4>Sidebar</h4>
          <p>Context / info panel</p>
        </section>

        <section>
          <h4>Add / remove files</h4>
          <button>Add file</button>
        </section>
      </aside>
    </div>
  );
}


export default App
