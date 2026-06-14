import { useState, useEffect } from 'react';
import { repository } from '../storage/repository';
import type { UserSettings } from '../types/models';

// [x] Defaults are applied when settings are missing.
const DEFAULT_SETTINGS: UserSettings = {
  defaultMode: 'DDS',
  alpha: 0.5,
  epsilon: 0.1,
  gamma: 0.5,
  defaultNeed: 5,
  uncertaintyDefault: 5,
  availableHoursPerDay: 4,
  reminderWindows: [48, 24, 6],
  checkIntervalMinutes: 30,
  notificationEnabled: true,
  updatedAt: new Date().toISOString(),
};

export default function Options() {
  const [settings, setSettings] = useState<UserSettings>(DEFAULT_SETTINGS);
  const [saveStatus, setSaveStatus] = useState<string>('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    void loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const storedSettings = await repository.getSettings();
      if (storedSettings) {
        setSettings({ ...DEFAULT_SETTINGS, ...storedSettings });
      } else {
        setSettings(DEFAULT_SETTINGS);
      }
      setSaveStatus('');
    } catch {
      setSaveStatus('Unable to load settings.');
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const updatedSettings = {
      ...settings,
      updatedAt: new Date().toISOString(),
    };

    try {
      setIsSaving(true);
      await repository.saveSettings(updatedSettings);
      setSettings(updatedSettings);
      setSaveStatus('Settings saved! Preferences take effect immediately. ✨');
      setTimeout(() => setSaveStatus(''), 3000);
    } catch {
      setSaveStatus('Unable to save settings. Please try again. 😵');
    } finally {
      setIsSaving(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    let parsedValue: string | number | boolean = value;
    if (type === 'number') {
      parsedValue = Number(value);
    } else if (type === 'checkbox') {
      parsedValue = (e.target as HTMLInputElement).checked;
    }
    setSettings(prev => ({ ...prev, [name]: parsedValue }));
  };

  const handleRemindersChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const stringArray = e.target.value.split(',');
    const numberArray = stringArray.map(s => Number(s.trim())).filter(n => !isNaN(n));
    setSettings(prev => ({ ...prev, reminderWindows: numberArray }));
  };

  return (
    <div style={{ padding: '24px', maxWidth: '600px', margin: '0 auto', fontFamily: 'var(--font-bubbly)', backgroundColor: 'var(--bg-color)' }}>
      
      <div className="retro-window" style={{ marginBottom: '24px' }}>
        <div className="retro-titlebar" style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span>⚙️ options.exe</span>
          <div className="title-btns">
            <div className="title-btn" style={{ visibility: 'hidden' }}></div>
            <div className="title-btn" style={{ visibility: 'hidden' }}></div>
            <div className="title-btn">X</div>
          </div>
        </div>

        <div style={{ padding: '16px' }}>
          <h2 style={{ fontFamily: 'var(--font-pixel)', fontSize: '18px', color: 'var(--accent-primary)', marginBottom: '8px', textShadow: '1px 1px 0px white' }}>PrioriTask Control Panel</h2>
          <p style={{ fontFamily: 'var(--font-vt323)', fontSize: '18px', marginBottom: '16px' }}>Configure your scoring engine and algorithm constants here.</p>

          <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            
            {/* General Settings */}
            <div className="retro-inset" style={{ padding: '12px' }}>
              <div className="retro-titlebar" style={{ background: 'var(--accent-secondary)', color: 'black', borderBottom: 'none', marginBottom: '8px', padding: '4px' }}>
                <span style={{ fontFamily: 'var(--font-pixel)', fontSize: '10px' }}>[ General Preferences ]</span>
              </div>
              <label style={{ display: 'block', marginBottom: '12px', fontFamily: 'var(--font-vt323)', fontSize: '16px' }}>
                Default Algorithm Mode:<br/>
                <select className="retro-inset" name="defaultMode" value={settings.defaultMode} onChange={handleChange} style={{ width: '100%', marginTop: '4px', background: 'white', padding: '4px' }}>
                  <option value="DDS">DDS (Due Date Score)</option>
                  <option value="DoD">DoD (Difficulty over Days)</option>
                  <option value="B2D">B2D (Benefit to Difficulty/Days)</option>
                  <option value="EoC">EoC (Effort-Weighted Grade Impact)</option>
                </select>
              </label>
              <label style={{ display: 'block', fontFamily: 'var(--font-vt323)', fontSize: '16px' }}>
                Available Work Hours Per Day:<br/>
                <input className="retro-inset" type="number" name="availableHoursPerDay" value={settings.availableHoursPerDay} onChange={handleChange} min="1" max="24" style={{ width: '100%', marginTop: '4px', background: 'white', padding: '4px' }} />
              </label>
            </div>

            {/* Algorithm Tuning */}
            <div className="retro-inset" style={{ padding: '12px' }}>
              <div className="retro-titlebar" style={{ background: '#FFB6C1', color: 'black', borderBottom: 'none', marginBottom: '8px', padding: '4px' }}>
                <span style={{ fontFamily: 'var(--font-pixel)', fontSize: '10px' }}>[ Engine Constants ]</span>
              </div>
              <div style={{ display: 'flex', gap: '12px', fontFamily: 'var(--font-vt323)', fontSize: '16px' }}>
                <label style={{ flex: 1 }}>
                  Alpha (Difficulty):<br/>
                  <input className="retro-inset" type="number" name="alpha" value={settings.alpha} onChange={handleChange} step="0.1" style={{ width: '100%', marginTop: '4px', background: 'white', padding: '4px' }} />
                </label>
                <label style={{ flex: 1 }}>
                  Epsilon (Safety buffer):<br/>
                  <input className="retro-inset" type="number" name="epsilon" value={settings.epsilon} onChange={handleChange} step="0.01" style={{ width: '100%', marginTop: '4px', background: 'white', padding: '4px' }} />
                </label>
                <label style={{ flex: 1 }}>
                  Gamma:<br/>
                  <input className="retro-inset" type="number" name="gamma" value={settings.gamma} onChange={handleChange} step="0.1" style={{ width: '100%', marginTop: '4px', background: 'white', padding: '4px' }} />
                </label>
              </div>
            </div>

            {/* Notifications */}
            <div className="retro-inset" style={{ padding: '12px' }}>
              <div className="retro-titlebar" style={{ background: '#98FB98', color: 'black', borderBottom: 'none', marginBottom: '8px', padding: '4px' }}>
                <span style={{ fontFamily: 'var(--font-pixel)', fontSize: '10px' }}>[ Background Alarms ]</span>
              </div>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px', fontFamily: 'var(--font-vt323)', fontSize: '18px', fontWeight: 'bold' }}>
                <input type="checkbox" name="notificationEnabled" checked={settings.notificationEnabled} onChange={handleChange} style={{ width: '16px', height: '16px' }} />
                Enable Chrome Notifications
              </label>
              <label style={{ display: 'block', marginBottom: '12px', fontFamily: 'var(--font-vt323)', fontSize: '16px' }}>
                Reminder Windows (Hours before deadline, comma-separated):<br/>
                <input className="retro-inset" type="text" value={settings.reminderWindows.join(', ')} onChange={handleRemindersChange} placeholder="e.g. 48, 24, 6" style={{ width: '100%', marginTop: '4px', background: 'white', padding: '4px' }} />
              </label>
              <label style={{ display: 'block', fontFamily: 'var(--font-vt323)', fontSize: '16px' }}>
                Periodic Check Interval (minutes):<br/>
                <input className="retro-inset" type="number" name="checkIntervalMinutes" value={settings.checkIntervalMinutes} onChange={handleChange} min="1" max="180" step="1" style={{ width: '100%', marginTop: '4px', background: 'white', padding: '4px' }} />
              </label>
            </div>

            <button type="submit" className="retro-btn primary" disabled={isSaving} style={{ padding: '12px', fontSize: '18px', width: '100%' }}>
              {isSaving ? 'Saving...' : 'SAVE SETTINGS.EXE'}
            </button>
            
            {saveStatus && (
              <div className="retro-inset" style={{ background: 'var(--accent-secondary)', textAlign: 'center', padding: '8px', fontFamily: 'var(--font-vt323)', fontSize: '18px', color: 'black' }}>
                {saveStatus}
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}