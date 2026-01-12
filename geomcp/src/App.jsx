import { useState, useRef, useEffect } from 'react'
import { GoogleGenerativeAI } from '@google/generative-ai'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPaperPlane, faRobot, faUser, faSpinner } from '@fortawesome/free-solid-svg-icons'
import './App.css'

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
    <div className="chat-container">
      <header className="chat-header">
        <FontAwesomeIcon icon={faRobot} className="header-icon" />
        <div className="header-text">
          <h1>GeoMCP Assistent</h1>
          <p>Analyse av geo- og plansaksdata</p>
        </div>
      </header>

      <div className="messages-container">
        {messages.length === 0 && (
          <div className="welcome-message">
            <FontAwesomeIcon icon={faRobot} className="welcome-icon" />
            <h2>Velkommen til GeoMCP Assistent</h2>
            <p>
              Jeg er en spesialisert KI-agent for analyse av norske geo- og plansaksdata.
              Still meg spørsmål om byggesaker, arealbruk, reguleringsplaner eller kartdata.
            </p>
            <div className="disclaimer">
              <strong>Merk:</strong> Jeg er et analyse- og støtteverktøy. 
              Sluttvurdering og beslutning tas alltid av menneskelig saksbehandler.
            </div>
          </div>
        )}

        {messages.map((message, index) => (
          <div key={index} className={`message ${message.role}`}>
            <div className="message-icon">
              <FontAwesomeIcon icon={message.role === 'user' ? faUser : faRobot} />
            </div>
            <div className="message-content">
              {formatMessage(message.content)}
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="message assistant">
            <div className="message-icon">
              <FontAwesomeIcon icon={faRobot} />
            </div>
            <div className="message-content loading">
              <FontAwesomeIcon icon={faSpinner} spin /> Analyserer...
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSubmit} className="input-form">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Skriv din henvendelse her..."
          disabled={isLoading}
        />
        <button type="submit" disabled={isLoading || !input.trim()}>
          <FontAwesomeIcon icon={isLoading ? faSpinner : faPaperPlane} spin={isLoading} />
        </button>
      </form>
    </div>
  )
}

export default App
