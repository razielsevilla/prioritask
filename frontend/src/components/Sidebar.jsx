// File: c:\Users\razie\Desktop\Prioritask_Project\frontend\src\components\Sidebar.jsx
import { NavLink, useNavigate } from "react-router-dom";
import { useContext, useState } from "react";
import { AuthContext } from "../context/AuthContext";

export default function Sidebar() {
  const { logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleLogout = async () => {
    setLoading(true);
    try {
      await logout();
      navigate("/"); // Redirect to login page
    } catch (error) {
      console.error("Logout failed:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <aside className="col-2 bg-dark p-3 border-end border-secondary d-flex flex-column justify-content-between">
      <div>
        <h4 className="text-primary fw-bold mb-4 text-center">PrioriTask</h4>
        <ul className="nav flex-column">
          <li className="nav-item mb-2">
            <NavLink
              to="/dashboard"
              className={({ isActive }) =>
                `nav-link d-flex align-items-center text-light fw-semibold ${
                  isActive ? "bg-primary bg-opacity-25 rounded px-2" : ""
                }`
              }
            >
              <i className="bi bi-house me-2"></i> Dashboard
            </NavLink>
          </li>
          <li className="nav-item mb-2">
            <NavLink
              to="/accomplished"
              className={({ isActive }) =>
                `nav-link d-flex align-items-center text-light fw-semibold ${
                  isActive ? "bg-primary bg-opacity-25 rounded px-2" : ""
                }`
              }
            >
              <i className="bi bi-check-circle me-2"></i> Accomplished
            </NavLink>
          </li>
          <li className="nav-item mb-2">
            <NavLink
              to="/preferences"
              className={({ isActive }) =>
                `nav-link d-flex align-items-center text-light fw-semibold ${
                  isActive ? "bg-primary bg-opacity-25 rounded px-2" : ""
                }`
              }
            >
              <i className="bi bi-gear me-2"></i> Preferences
            </NavLink>
          </li>
        </ul>
      </div>

      {/* Logout button section */}
      <div className="mt-auto text-center">
        <button
          onClick={handleLogout}
          className="btn btn-outline-danger w-100 fw-semibold d-flex align-items-center justify-content-center"
          disabled={loading}
        >
          {loading ? (
            <>
              <span
                className="spinner-border spinner-border-sm me-2"
                role="status"
                aria-hidden="true"
              ></span>
              Logging out...
            </>
          ) : (
            <>
              <i className="bi bi-box-arrow-right me-2"></i> Logout
            </>
          )}
        </button>
      </div>
    </aside>
  );
}
