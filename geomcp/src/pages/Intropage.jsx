import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import '../App.css'
import norkartLogo from '../assets/01 Logo with spacing-Cwl_Y2_p.png'
import uiaLogo from '../assets/uia-horizontal-with-name-positive.png'

function IntroPage() {
    const navigate = useNavigate()

    useEffect(() => {
        const accepted = localStorage.getItem('termsAccepted') === 'true'
        if (accepted) {
            navigate('/home', { replace: true })
        }
    }, [navigate])

    const acceptTerms = () => {
        localStorage.setItem('termsAccepted', 'true')
        navigate('/home', { replace: true })
    }

    return (
        <div className="intro-page">
            <div className="intro-card">
                <div className="intro-logos">
                    <img className="intro-logo" src={uiaLogo} alt="UiA" />
                    <img className="intro-logo" src={norkartLogo} alt="Norkart" />
                </div>

                <h1 className="intro-title">
                    Velkommen til GIS-eksperten fra Norkart!
                </h1>

                <p className="intro-lead">
                    Dette verktøyet er laget for å gi en forenklet, faglig fundert veiledning innen planlegging, konsekvensutredning og geografiske analyser. GIS-eksperten kombinerer innsendt dokumentasjon med tilgjengelig kunnskap for å gi strukturerte vurderinger og peke på relevante tema, risikoer og videre behov for utredning.
                </p>

                <div className="intro-terms">
                    <p>Ved å bruke dette verktøyet bekrefter du at du forstår og aksepterer følgende:</p>
                    <ul>
                        <li>Dette verktøyet gir ikke juridisk bindende vedtak eller fullstendige konsekvensutredninger. Vurderingene er veiledende og kan ikke erstatte formell saksbehandling eller faglige utredninger utført av ansvarlige myndigheter eller kvalifiserte konsulenter.</li>
                        <li>Resultatene er basert på informasjonen du selv laster opp og oppgir. Mangelfullt, feil eller utdatert datagrunnlag kan føre til ufullstendige eller unøyaktige vurderinger.</li>
                        <li>Verktøyet er ment for tidlig fase, dialog, innsikt og beslutningsstøtte. Endelige vurderinger av planforslag, miljøkonsekvenser og lovlighet må alltid gjøres av rette plan- og forvaltningsmyndighet.</li>
                        <li>Ved bruk av verktøyet samtykker du i at innsendte filer kan brukes til analyse innenfor denne tjenesten, og at du selv har ansvar for at innholdet kan deles og behandles på denne måten.</li>
                    </ul>
                </div>

                <p className="intro-end">
                    Hvis du aksepterer disse betingelsene, kan du fortsette til GIS-eksperten.
                </p>

                <button className="intro-accept" onClick={acceptTerms}>
                    TRYKK HER FOR Å AKSEPTERE
                </button>

                <div className="intro-footer">
                    <span>Prototype utviklet av Gruppe 8 (UiA) i samarbeid med Norkart.</span>
                    <br /><span>Verktøyet er en konseptuell demonstrator og ikke et offisielt saksbehandlingssystem.</span>
                </div>
            </div>
        </div>
    )
}

export default IntroPage
