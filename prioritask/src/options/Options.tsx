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
        // Apply defaults if nothing is in chrome.storage
        setSettings(DEFAULT_SETTINGS);
      }
      setSaveStatus('');
    } catch {
      setSaveStatus('Unable to load settings. Please reload the extension and try again.');
    }
  };

  // [x] Settings save/update flow works.
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
      setSaveStatus('Settings saved successfully!');
      setTimeout(() => setSaveStatus(''), 3000);
    } catch {
      setSaveStatus('Unable to save settings. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  // Generic handler for standard inputs
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

  // Specific handler for comma-separated number arrays
  const handleRemindersChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const stringArray = e.target.value.split(',');
    const numberArray = stringArray.map(s => Number(s.trim())).filter(n => !isNaN(n));
    setSettings(prev => ({ ...prev, reminderWindows: numberArray }));
  };

  return (
    <div style={{ padding: '24px', maxWidth: '600px', margin: '0 auto', fontFamily: 'sans-serif' }}>
      <h2>PrioriTask Settings</h2>
      <p style={{ color: '#666', marginBottom: '24px' }}>Configure your scoring engine and algorithm constants.</p>

      <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        
        {/* General Settings */}
        <fieldset style={{ border: '1px solid #ccc', padding: '16px', borderRadius: '8px' }}>
          <legend><strong>General preferences</strong></legend>
          <label style={{ display: 'block', marginBottom: '8px' }}>
            Default Algorithm Mode:<br/>
            <select name="defaultMode" value={settings.defaultMode} onChange={handleChange} style={{ width: '100%', marginTop: '4px' }}>
              <option value="DDS">DDS (Due Date Score)</option>
              <option value="DoD">DoD (Difficulty over Days)</option>
              <option value="B2D">B2D (Benefit to Difficulty/Days)</option>
              <option value="EoC">EoC (Effort-Weighted Grade Impact)</option>
            </select>
          </label>
          <label style={{ display: 'block' }}>
            Available Work Hours Per Day:<br/>
            <input type="number" name="availableHoursPerDay" value={settings.availableHoursPerDay} onChange={handleChange} min="1" max="24" style={{ width: '100%', marginTop: '4px' }} />
          </label>
        </fieldset>

        {/* Algorithm Tuning */}
        <fieldset style={{ border: '1px solid #ccc', padding: '16px', borderRadius: '8px' }}>
          <legend><strong>Algorithm Tuning Constants</strong></legend>
          <div style={{ display: 'flex', gap: '12px' }}>
            <label style={{ flex: 1 }}>
              Alpha (Difficulty Weight):<br/>
              <input type="number" name="alpha" value={settings.alpha} onChange={handleChange} step="0.1" style={{ width: '100%' }} />
            </label>
            <label style={{ flex: 1 }}>
              Epsilon (Zero-division buffer):<br/>
              <input type="number" name="epsilon" value={settings.epsilon} onChange={handleChange} step="0.01" style={{ width: '100%' }} />
            </label>
            <label style={{ flex: 1 }}>
              Gamma:<br/>
              <input type="number" name="gamma" value={settings.gamma} onChange={handleChange} step="0.1" style={{ width: '100%' }} />
            </label>
          </div>
        </fieldset>

        {/* Notifications */}
        <fieldset style={{ border: '1px solid #ccc', padding: '16px', borderRadius: '8px' }}>
          <legend><strong>Notifications & Reminders</strong></legend>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
            <input type="checkbox" name="notificationEnabled" checked={settings.notificationEnabled} onChange={handleChange} />
            Enable Chrome Notifications
          </label>
          <label style={{ display: 'block' }}>
            Reminder Windows (Hours before deadline, comma-separated):<br/>
            <input 
              type="text" 
              value={settings.reminderWindows.join(', ')} 
              onChange={handleRemindersChange} 
              placeholder="e.g. 48, 24, 6"
              style={{ width: '100%', marginTop: '4px' }} 
            />
          </label>
        </fieldset>

        <button type="submit" disabled={isSaving} style={{ padding: '10px', fontSize: '16px', cursor: isSaving ? 'not-allowed' : 'pointer', backgroundColor: '#007BFF', color: 'white', border: 'none', borderRadius: '4px', opacity: isSaving ? 0.8 : 1 }}>
          {isSaving ? 'Saving...' : 'Save Settings'}
        </button>
        
        {saveStatus && <p style={{ color: 'green', textAlign: 'center', marginTop: '0' }}>{saveStatus}</p>}
      </form>
    </div>
  );
}