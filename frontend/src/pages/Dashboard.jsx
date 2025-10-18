import { useEffect, useState, useContext } from "react";
import api from "../api";
import Sidebar from "../components/Sidebar";
import AssignmentCard from "../components/AssignmentCard";
import AssignmentModal from "../components/AssignmentModal";
import { AuthContext } from "../context/AuthContext";

export default function Dashboard() {
  const [assignments, setAssignments] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false); // 🔹 control modal visibility
  const { user } = useContext(AuthContext);

  // Fetch assignments from backend
  const fetchAssignments = async () => {
    try {
      const res = await api.get("/assignments");
      setAssignments(res.data);
    } catch (err) {
      console.error("Error fetching assignments:", err);
    }
  };

  useEffect(() => {
    fetchAssignments();
  }, []);

  // Called when a new assignment is added
  const handleAdded = async (data) => {
    try {
      const res = await api.post("/assignments", data);
      setAssignments((prev) => [res.data, ...prev]);
      setIsModalOpen(false);
    } catch (err) {
      console.error("Error adding assignment:", err.response?.data || err);
    }
  };

  return (
    <div className="d-flex vh-100">
      <Sidebar />
      <main className="flex-grow-1 bg-body p-4 overflow-auto">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h3 className="fw-semibold text-light">
            My Assignments{" "}
            {user && (
              <span className="text-secondary ms-2 fs-5">({user.name})</span>
            )}
          </h3>

          {/* 🔹 Add Assignment button here */}
          <button
            className="btn btn-primary d-flex align-items-center gap-2"
            onClick={() => setIsModalOpen(true)}
          >
            <i className="bi bi-plus-circle"></i> Add Assignment
          </button>
        </div>

        {/* 🔹 The modal (opens when button clicked) */}
        <AssignmentModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSave={handleAdded}
        />

        {/* 🔹 Assignment cards */}
        <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4">
          {assignments.map((a) => (
            <AssignmentCard key={a.id} assignment={a} />
          ))}
        </div>
      </main>
    </div>
  );
}
