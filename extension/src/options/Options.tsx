import { useState, useEffect } from 'react';
import { repository } from '../storage/repository';
import type { UserSettings } from '../types/models';

const DEFAULT_SETTINGS: UserSettings = {
  epsilon: 0.1,
  availableHoursPerDay: 4,
  defaultTShirtSize: 'M',
  reminderWindows: [48, 24, 6],
  checkIntervalMinutes: 30,
  notificationEnabled: true,
  geminiApiKey: '',
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
    <div style={{ padding: '24px', maxWidth: '600px', margin: '0 auto' }}>
      
      <div className="glass-panel" style={{ marginBottom: '24px' }}>
        <div className="retro-titlebar" style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span>⚙️ OPTIONS_PANEL.exe</span>
          <div className="title-btns">
            <div className="title-btn" style={{ visibility: 'hidden' }}></div>
            <div className="title-btn" style={{ visibility: 'hidden' }}></div>
            <div className="title-btn"></div>
          </div>
        </div>

        <div style={{ padding: '24px' }}>
          <h2 style={{ fontSize: '24px', color: 'var(--accent-primary)', marginBottom: '8px', textShadow: '0 0 10px var(--accent-glow)' }}>PRIORITASK CONTROL PANEL</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '16px', marginBottom: '24px' }}>Configure your scoring engine and default preferences here.</p>

          <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            
            {/* General Settings */}
            <div className="retro-inset">
              <div className="retro-titlebar" style={{ background: 'transparent', borderBottom: '1px solid var(--border-light)', marginBottom: '16px', padding: '0 0 8px 0', color: 'var(--accent-secondary)' }}>
                <span>[ General Preferences ]</span>
              </div>
              <label style={{ display: 'block', marginBottom: '16px', color: 'var(--text-primary)' }}>
                Default T-Shirt Size (Estimated Effort):<br/>
                <select name="defaultTShirtSize" value={settings.defaultTShirtSize} onChange={handleChange} style={{ width: '100%', marginTop: '8px' }}>
                  <option value="S">Small (~1 Hour)</option>
                  <option value="M">Medium (~3 Hours)</option>
                  <option value="L">Large (~8 Hours)</option>
                </select>
              </label>
              <label style={{ display: 'block' }}>
                Available Work Hours Per Day:<br/>
                <input type="number" name="availableHoursPerDay" value={settings.availableHoursPerDay} onChange={handleChange} min="1" max="24" style={{ width: '100%', marginTop: '8px' }} />
              </label>
            </div>

            {/* Notifications */}
            <div className="retro-inset">
              <div className="retro-titlebar" style={{ background: 'transparent', borderBottom: '1px solid var(--border-light)', marginBottom: '16px', padding: '0 0 8px 0', color: 'var(--success)' }}>
                <span>[ Background Alarms ]</span>
              </div>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px', fontWeight: 'bold' }}>
                <input type="checkbox" name="notificationEnabled" checked={settings.notificationEnabled} onChange={handleChange} style={{ width: '16px', height: '16px' }} />
                Enable Chrome Notifications
              </label>
              <label style={{ display: 'block', marginBottom: '16px' }}>
                Reminder Windows (Hours before deadline, comma-separated):<br/>
                <input type="text" value={settings.reminderWindows.join(', ')} onChange={handleRemindersChange} placeholder="e.g. 48, 24, 6" style={{ width: '100%', marginTop: '8px' }} />
              </label>
              <label style={{ display: 'block' }}>
                Periodic Check Interval (minutes):<br/>
                <input type="number" name="checkIntervalMinutes" value={settings.checkIntervalMinutes} onChange={handleChange} min="1" max="180" step="1" style={{ width: '100%', marginTop: '8px' }} />
              </label>
            </div>

            {/* AI Settings */}
            <div className="retro-inset">
              <div className="retro-titlebar" style={{ background: 'transparent', borderBottom: '1px solid var(--border-light)', marginBottom: '16px', padding: '0 0 8px 0', color: 'var(--accent-primary)' }}>
                <span>[ AI Breakdown Engine ]</span>
              </div>
              <label style={{ display: 'block', marginBottom: '8px' }}>
                Gemini API Key (Optional):<br/>
                <input type="password" name="geminiApiKey" value={settings.geminiApiKey || ''} onChange={handleChange} placeholder="Leave blank to use hardcoded trial key" style={{ width: '100%', marginTop: '8px' }} />
              </label>
              <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Used to automatically break down Large and Medium tasks into smaller sub-tasks.</p>
            </div>

            <button type="submit" className="retro-btn primary" disabled={isSaving} style={{ padding: '16px', width: '100%' }}>
              {isSaving ? 'SAVING...' : 'SAVE SETTINGS'}
            </button>
            
            {saveStatus && (
              <div className="retro-inset" style={{ border: '1px solid var(--success)', color: 'var(--success)', textAlign: 'center', padding: '12px', fontSize: '16px' }}>
                {saveStatus}
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}