import './App.css'

function App() {
  return (
    <div className="app-wrapper">
      
      <header className="header">
        <div className="marquee-container retro-inset">
          <div className="marquee-content">
            ✦✧✦ WELCOME TO PRIORITASK 2000 ✦ ELIMINATE CHOICE ANXIETY ✦ MASTER YOUR DEADLINES ✦ YOUR PERFECT ACTION PIPELINE IS READY ✦✧✦
          </div>
        </div>
        <div className="container header-content">
          <div className="logo">
            <div className="logo-icon">💿</div>
            <span>PrioriTask</span>
          </div>
          <nav>
            <a href="#features" className="btn btn-secondary">Learn More</a>
          </nav>
        </div>
      </header>

      <main>
        <section className="hero container">
          <div className="float-1" style={{ position: 'absolute', top: '5%', right: '15%', fontSize: '5rem', opacity: 0.8, pointerEvents: 'none' }}>✨</div>
          <div className="float-2" style={{ position: 'absolute', bottom: '15%', left: '10%', fontSize: '4rem', opacity: 0.8, pointerEvents: 'none' }}>🌸</div>
          <div className="float-3" style={{ position: 'absolute', top: '30%', left: '5%', fontSize: '3rem', opacity: 0.8, pointerEvents: 'none' }}>🦋</div>
          
          <h1>
            Defeat Decision Fatigue.<br />
            <span style={{ color: 'var(--text-primary)', textShadow: '3px 3px 0px var(--accent-secondary)' }}>Master Your Deadlines.</span>
          </h1>
          <p className="retro-inset">
            PrioriTask is the intelligent Chrome extension that automatically ranks your school assignments based on urgency, difficulty, and grade impact. Focus on what matters, exactly when it matters. ✨
          </p>
          <div className="hero-actions">
            <a href="https://github.com/razielsevilla/prioritask/releases/latest" target="_blank" rel="noopener noreferrer" className="btn btn-primary blink">
              ▶ Download Ext (.zip)
            </a>
            <a href="https://github.com/razielsevilla/prioritask" target="_blank" rel="noopener noreferrer" className="btn btn-secondary">
              View Source GitHub
            </a>
          </div>
          
          <div className="retro-window" style={{ marginTop: '4rem', textAlign: 'left', maxWidth: '600px', margin: '4rem auto 0', position: 'relative', zIndex: 10 }}>
            <div className="retro-titlebar">
              <span>install_guide.txt</span>
              <div className="title-btns">
                <button className="title-btn">_</button>
                <button className="title-btn">□</button>
                <button className="title-btn">X</button>
              </div>
            </div>
            <div style={{ padding: '1.5rem', background: 'var(--surface)' }}>
              <h3 style={{ marginTop: 0, marginBottom: '1.5rem', fontSize: '0.9rem', background: 'var(--accent-secondary)', display: 'inline-block', padding: '4px 8px' }}>How to Install (Dev Mode)</h3>
              <ol style={{ paddingLeft: '1.5rem', margin: 0, lineHeight: '2', fontFamily: 'var(--font-vt323)', fontSize: '1.3rem' }}>
                <li>Download the <strong>.zip</strong> file from the latest release.</li>
                <li>Extract the downloaded <code>.zip</code> file to a folder.</li>
                <li>Open Chrome and navigate to <code>chrome://extensions/</code>.</li>
                <li>Enable <strong>Developer mode</strong> (toggle in top right).</li>
                <li>Click <strong>Load unpacked</strong> and select the folder.</li>
              </ol>
            </div>
          </div>
        </section>

        <section id="features" className="features container">
          <div className="features-header">
            <h2>Why PrioriTask?</h2>
            <p className="retro-inset" style={{ display: 'inline-block', padding: '0.5rem 1rem', background: 'white' }}>Designed for students handling overlapping deadlines.</p>
          </div>
          
          <div className="features-grid">
            <div className="retro-window feature-card">
              <div className="retro-titlebar">
                <span>smart_sort.exe</span>
                <div className="title-btns"><button className="title-btn">X</button></div>
              </div>
              <div className="feature-content">
                <div className="feature-icon float-1">⏱️</div>
                <h3 className="retro-inset">Smart Prioritization</h3>
                <p className="retro-inset">Choose from multiple ranking algorithms including Deadline Urgency (DDS), Difficulty+Urgency (DoD), and Grade Impact Efficiency (EoC).</p>
              </div>
            </div>
            
            <div className="retro-window feature-card">
              <div className="retro-titlebar">
                <span>risk_alert.vbx</span>
                <div className="title-btns"><button className="title-btn">X</button></div>
              </div>
              <div className="feature-content">
                <div className="feature-icon float-2">⚠️</div>
                <h3 className="retro-inset">Risk Alerts</h3>
                <p className="retro-inset">The FSR (Feasibility Status Report) overlay flags potentially unrealistic schedules before you fall behind your goals.</p>
              </div>
            </div>
            
            <div className="retro-window feature-card">
              <div className="retro-titlebar">
                <span>logic_core.dll</span>
                <div className="title-btns"><button className="title-btn">X</button></div>
              </div>
              <div className="feature-content">
                <div className="feature-icon float-3">🧠</div>
                <h3 className="retro-inset">Explainable Logic</h3>
                <p className="retro-inset">Stop guessing what to do next. PrioriTask explains exactly why an assignment is ranked at the top of your list.</p>
              </div>
            </div>
          </div>
        </section>

        <section className="algo-section container">
          <div className="retro-window">
            <div className="retro-titlebar">
              <span>algo.exe</span>
              <div className="title-btns">
                <button className="title-btn">_</button>
                <button className="title-btn">□</button>
                <button className="title-btn">X</button>
              </div>
            </div>
            <div className="terminal-window">
              <div className="terminal-header">
                PrioriTask Engine v2.0<br/>
                Copyright (C) 2026 Candypop Inc.<br/>
                Initializing core algorithms... OK
              </div>
              <div><span className="terminal-prompt">C:\&gt;</span> cat dds_algo.sys</div>
              <div>Calculating Due Date Score (DDS):</div>
              <div>[+] Score = 100 / (Days Left + 1)</div>
              <br/>
              <div><span className="terminal-prompt">C:\&gt;</span> cat dod_algo.sys</div>
              <div>Calculating Difficulty over Days (DoD):</div>
              <div>[+] Score = (Difficulty * 10) / (Days Left + 0.5)</div>
              <br/>
              <div><span className="terminal-prompt">C:\&gt;</span> cat eoc_algo.sys</div>
              <div>Calculating Effort-Weighted Impact (EoC):</div>
              <div>[+] Score = (Weight * 100) / (Hours * (Days Left + 0.5))</div>
              <br/>
              <div className="blink"><span className="terminal-prompt">C:\&gt;</span> _</div>
            </div>
          </div>
        </section>

      </main>

      <footer className="footer">
        <div className="container">
          <p>★ &copy; {new Date().getFullYear()} PrioriTask. All rights reserved. ★</p>
          <div className="badges">
            <div className="retro-badge pink">BEST VIEWED IN<br/>CHROME</div>
            <div className="retro-badge cyan">100%<br/>FREEWARE</div>
            <div className="retro-badge yellow">HTML 4.0<br/>VALID</div>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default App
