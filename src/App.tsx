import './App.css'

const apiUrl = import.meta.env.VITE_API_URL

function App() {
  return (
    <main className="app-shell">
      <section className="hero-card">
        <p className="eyebrow">Laburo y Hambre</p>
        <h1>El juego comienza acá</h1>
        <p className="intro">Frontend listo para conectarse con la API del backend.</p>
        <div className="status" role="status">
          <span className="status-dot" />
          API configurada en <code>{apiUrl}</code>
        </div>
      </section>
    </main>
  )
}

export default App
