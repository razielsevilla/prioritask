// File: c:\Users\razie\Desktop\Prioritask_Project\frontend\src\pages\Preferences.jsx
import Sidebar from "../components/Sidebar";

export default function Preferences() {
  return (
    <div className="d-flex vh-100">
      <Sidebar />

      <main className="flex-grow-1 bg-body p-4 overflow-auto text-light">
        <div className="container">
          <h3 className="fw-semibold mb-4">Preferences</h3>

          {/* Theme Section */}
          <div className="card bg-secondary text-light mb-4 shadow-sm">
            <div className="card-body">
              <h5 className="card-title mb-3">Theme</h5>
              <div className="form-check">
                <input
                  className="form-check-input"
                  type="radio"
                  name="theme"
                  id="lightTheme"
                  value="light"
                />
                <label className="form-check-label" htmlFor="lightTheme">
                  Light Mode
                </label>
              </div>
              <div className="form-check">
                <input
                  className="form-check-input"
                  type="radio"
                  name="theme"
                  id="darkTheme"
                  value="dark"
                  defaultChecked
                />
                <label className="form-check-label" htmlFor="darkTheme">
                  Dark Mode
                </label>
              </div>
            </div>
          </div>

          {/* Notification Section */}
          <div className="card bg-secondary text-light mb-4 shadow-sm">
            <div className="card-body">
              <h5 className="card-title mb-3">Notifications</h5>
              <div className="form-check form-switch">
                <input
                  className="form-check-input"
                  type="checkbox"
                  id="emailNotifications"
                  defaultChecked
                />
                <label
                  className="form-check-label"
                  htmlFor="emailNotifications"
                >
                  Email Notifications
                </label>
              </div>
              <div className="form-check form-switch">
                <input
                  className="form-check-input"
                  type="checkbox"
                  id="deadlineReminders"
                />
                <label
                  className="form-check-label"
                  htmlFor="deadlineReminders"
                >
                  Deadline Reminders
                </label>
              </div>
            </div>
          </div>

          {/* Account Settings Section */}
          <div className="card bg-secondary text-light shadow-sm">
            <div className="card-body">
              <h5 className="card-title mb-3">Account Settings</h5>
              <div className="mb-3">
                <label htmlFor="username" className="form-label">
                  Username
                </label>
                <input
                  type="text"
                  id="username"
                  className="form-control bg-dark text-light border-0"
                  placeholder="Enter new username"
                />
              </div>
              <div className="mb-3">
                <label htmlFor="password" className="form-label">
                  New Password
                </label>
                <input
                  type="password"
                  id="password"
                  className="form-control bg-dark text-light border-0"
                  placeholder="Enter new password"
                />
              </div>
              <button className="btn btn-primary">Save Changes</button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
