import './App.css'

function App() {
  return (
    <div className="app-wrapper">
      <div className="bg-mesh"></div>
      
      <header className="header">
        <div className="container header-content">
          <div className="logo">
            <div className="logo-icon">P</div>
            <span>PrioriTask</span>
          </div>
          <nav>
            <a href="#features" className="btn btn-secondary" style={{ padding: '0.5rem 1rem', fontSize: '0.9rem' }}>Learn More</a>
          </nav>
        </div>
      </header>

      <main>
        <section className="hero container">
          <h1>
            Defeat Decision Fatigue.<br />
            <span className="text-accent-gradient">Master Your Deadlines.</span>
          </h1>
          <p>
            PrioriTask is the intelligent Chrome extension that automatically ranks your school assignments based on urgency, difficulty, and grade impact. Focus on what matters, exactly when it matters.
          </p>
          <div className="hero-actions">
            <a href="https://github.com/razielsevilla/prioritask/releases/latest" target="_blank" rel="noopener noreferrer" className="btn btn-primary">
              Download Extension (.zip)
            </a>
            <a href="https://github.com/razielsevilla/prioritask" target="_blank" rel="noopener noreferrer" className="btn btn-secondary">
              View Source on GitHub
            </a>
          </div>
          
          <div className="install-instructions glass-panel" style={{ marginTop: '3rem', textAlign: 'left', padding: '1.5rem', maxWidth: '600px', margin: '3rem auto 0' }}>
            <h3 style={{ marginTop: 0, marginBottom: '1rem', fontSize: '1.2rem' }}>How to Install (Developer Mode)</h3>
            <ol style={{ paddingLeft: '1.5rem', margin: 0, lineHeight: '1.6' }}>
              <li>Download the <strong>.zip</strong> file from the latest release.</li>
              <li>Extract the downloaded <code>.zip</code> file to a folder.</li>
              <li>Open Chrome and navigate to <code>chrome://extensions/</code>.</li>
              <li>Enable <strong>Developer mode</strong> (toggle in the top right corner).</li>
              <li>Click <strong>Load unpacked</strong> and select the extracted folder.</li>
            </ol>
          </div>
        </section>

        <section id="features" className="features container">
          <div className="features-header">
            <h2>Why PrioriTask?</h2>
            <p className="text-gradient">Designed for students handling overlapping deadlines.</p>
          </div>
          
          <div className="features-grid">
            <div className="feature-card glass-panel">
              <div className="feature-icon">⏱️</div>
              <h3>Smart Prioritization</h3>
              <p>Choose from multiple ranking algorithms including Deadline Urgency (DDS), Difficulty+Urgency (DoD), and Grade Impact Efficiency (EoC).</p>
            </div>
            
            <div className="feature-card glass-panel">
              <div className="feature-icon">⚠️</div>
              <h3>Risk Alerts</h3>
              <p>The FSR (Feasibility Status Report) overlay flags potentially unrealistic schedules before you fall behind.</p>
            </div>
            
            <div className="feature-card glass-panel">
              <div className="feature-icon">🧠</div>
              <h3>Explainable Logic</h3>
              <p>Stop guessing what to do next. PrioriTask explains exactly why an assignment is ranked at the top of your list.</p>
            </div>
          </div>
        </section>
      </main>

      <footer className="footer container">
        <p>&copy; {new Date().getFullYear()} PrioriTask. All rights reserved.</p>
      </footer>
    </div>
  )
}

export default App
