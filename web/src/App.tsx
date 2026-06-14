import './App.css'

function App() {
  return (
    <div className="app-wrapper">
      
      <header className="header">
        <div className="marquee-container retro-inset">
          <div className="marquee-content">
            ✦✧✦ WELCOME TO PRIORITASK_OS ✦ ELIMINATE CHOICE ANXIETY ✦ MASTER YOUR DEADLINES ✦ YOUR PERFECT ACTION PIPELINE IS READY ✦✧✦
          </div>
        </div>
        <div className="container header-content">
          <div className="logo">
            <div className="logo-icon">💿</div>
            <span>PrioriTask</span>
          </div>
          <nav>
            <a href="#features" className="btn btn-secondary" style={{ marginRight: '8px' }}>Learn More</a>
            <a href="https://github.com/razielsevilla/prioritask" target="_blank" rel="noopener noreferrer" className="btn btn-primary" style={{ background: 'var(--accent-primary)', color: 'white' }}>Launch Dashboard (via Ext)</a>
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
            <span style={{ color: 'var(--accent-primary)', textShadow: '0 0 15px var(--accent-glow)' }}>Just Do It [NOW].</span>
          </h1>
          <p className="retro-inset">
            PrioriTask is the intelligent Chrome extension that automatically organizes your assignments into actionable <strong>Now, Next, and Later</strong> buckets based on their time pressure. Focus on what matters, exactly when it matters. ✨
          </p>
          <div className="hero-actions">
            <button onClick={() => alert('Please install the Chrome Extension and click "🚀 Full Dashboard" in the popup to open the Immersive Dashboard.')} className="btn btn-primary blink">
              ▶ Launch Web Dashboard
            </button>
            <a href="https://github.com/razielsevilla/prioritask/releases/latest" target="_blank" rel="noopener noreferrer" className="btn btn-secondary">
              Download Ext (.zip)
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
            <div style={{ padding: '1.5rem', background: 'rgba(0,0,0,0.4)' }}>
              <h3 style={{ marginTop: 0, marginBottom: '1.5rem', fontSize: '0.9rem', color: 'var(--accent-secondary)', display: 'inline-block', borderBottom: '1px solid var(--accent-secondary)', paddingBottom: '4px' }}>How to Install (Dev Mode)</h3>
              <ol style={{ paddingLeft: '1.5rem', margin: 0, lineHeight: '2', fontFamily: 'var(--font-vt323)', fontSize: '1.3rem', color: 'var(--text-primary)' }}>
                <li>Download the <strong>.zip</strong> file from the latest release.</li>
                <li>Extract the downloaded <code>.zip</code> file to a folder.</li>
                <li>Open Chrome and navigate to <code style={{ color: 'var(--accent-secondary)' }}>chrome://extensions/</code>.</li>
                <li>Enable <strong>Developer mode</strong> (toggle in top right).</li>
                <li>Click <strong>Load unpacked</strong> and select the folder.</li>
              </ol>
            </div>
          </div>
        </section>

        <section id="features" className="features container">
          <div className="features-header">
            <h2>Why PrioriTask?</h2>
            <p className="retro-inset" style={{ display: 'inline-block', padding: '0.5rem 1rem', background: 'white' }}>Designed to eliminate the paradox of choice.</p>
          </div>
          
          <div className="features-grid">
            <div className="retro-window feature-card">
              <div className="retro-titlebar">
                <span>time_buckets.exe</span>
                <div className="title-btns"><button className="title-btn">X</button></div>
              </div>
              <div className="feature-content">
                <div className="feature-icon float-1">⏱️</div>
                <h3 className="retro-inset">Now, Next, Later</h3>
                <p className="retro-inset">Stop looking at a wall of assignments. Tasks are automatically sorted into intuitive time-buckets so you only focus on what is due [NOW].</p>
              </div>
            </div>
            
            <div className="retro-window feature-card">
              <div className="retro-titlebar">
                <span>tshirt_sizing.vbx</span>
                <div className="title-btns"><button className="title-btn">X</button></div>
              </div>
              <div className="feature-content">
                <div className="feature-icon float-2">👕</div>
                <h3 className="retro-inset">T-Shirt Sizing</h3>
                <p className="retro-inset">Ditch complex math inputs. Just estimate effort as Small, Medium, or Large, and the app calculates the Time Pressure score for you.</p>
              </div>
            </div>
            
            <div className="retro-window feature-card">
              <div className="retro-titlebar">
                <span>risk_alert.dll</span>
                <div className="title-btns"><button className="title-btn">X</button></div>
              </div>
              <div className="feature-content">
                <div className="feature-icon float-3">⚠️</div>
                <h3 className="retro-inset">Workload Safety Net</h3>
                <p className="retro-inset">The FSR (Feasibility Status Report) engine works in the background to silently flag critical workloads and boost them to your [NOW] bucket before you run out of time.</p>
              </div>
            </div>
          </div>
        </section>

        <section className="algo-section container">
          <div className="retro-window">
            <div className="retro-titlebar">
              <span>pipeline.exe</span>
              <div className="title-btns">
                <button className="title-btn">_</button>
                <button className="title-btn">□</button>
                <button className="title-btn">X</button>
              </div>
            </div>
            <div className="terminal-window">
              <div className="terminal-header">
                PRIORITASK_OS v2.0<br/>
                Copyright (C) 2026 Cyberdyne<br/>
                Initializing core algorithms... OK
              </div>
              <div><span className="terminal-prompt">C:\&gt;</span> cat now_bucket.sys</div>
              <div>Calculating TOP PRIORITY tasks:</div>
              <div>[+] Condition: Due within 48 hours OR High Risk (FSR &gt; 75%)</div>
              <div>[+] Action: Drops everything else. DO THIS FIRST.</div>
              <br/>
              <div><span className="terminal-prompt">C:\&gt;</span> cat next_bucket.sys</div>
              <div>Calculating UP NEXT tasks:</div>
              <div>[+] Condition: Due within 7 days.</div>
              <div>[+] Action: Keep on your radar. Sorted by Pressure Score.</div>
              <br/>
              <div><span className="terminal-prompt">C:\&gt;</span> cat later_bucket.sys</div>
              <div>Calculating BACKLOG tasks:</div>
              <div>[+] Condition: Due &gt; 7 days &amp; Healthy FSR.</div>
              <div>[+] Action: Relax. You have plenty of time.</div>
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
