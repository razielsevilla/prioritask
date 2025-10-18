// File: c:\Users\razie\Desktop\Prioritask_Project\frontend\src\components\Sidebar.jsx
import { NavLink, useNavigate } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";

export default function Sidebar() {
  const { logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/"); // Redirect to login page
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
              <i className="bi bi-house me-2"></i> Accomplished
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
          className="btn btn-outline-danger w-100 fw-semibold"
        >
          <i className="bi bi-box-arrow-right me-2"></i> Logout
        </button>
      </div>
    </aside>
  );
}
