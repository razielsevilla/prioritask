import { useEffect, useState, useContext, useMemo } from "react";
import api from "../api";
import Sidebar from "../components/Sidebar";
import AssignmentCard from "../components/AssignmentCard";
import AssignmentModal from "../components/AssignmentModal";
import { AuthContext } from "../context/AuthContext";
import toast, { Toaster } from "react-hot-toast";

export default function Dashboard() {
  const [assignments, setAssignments] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [editingAssignment, setEditingAssignment] = useState(null);
  const [strategy, setStrategy] = useState("DDS");
  const { user } = useContext(AuthContext);

  // 🧮 Helper: compute days left
  const daysLeft = (dueDate) => {
    const today = new Date();
    const due = new Date(dueDate);
    const diff = Math.ceil((due - today) / (1000 * 60 * 60 * 24));
    return Math.max(0, diff);
  };

  // 🧮 Helper: compute prioritization score
  const computeScore = (a) => {
    const dy = daysLeft(a.due_date) || 1;
    const df = Math.max(1, a.difficulty || 1);
    const b = Math.max(1, a.points || 1);
    const w = a.weight || 0;
    const g = user?.current_grade ?? null;

    switch (strategy) {
      case "DoD":
        return df / dy;
      case "B2D":
        return b / (df * dy);
      case "EoC":
        if (g !== null) return ((100 - g) * w * b) / dy;
        return (40 * w * b) / dy;
      case "DDS":
      default:
        return 1 / dy;
    }
  };

  const fetchAssignments = async () => {
    setLoading(true);
    try {
      const res = await api.get("/assignments?completed=false");
      const activeAssignments = res.data.filter((a) => !a.completed);
      setAssignments(activeAssignments);
    } catch (err) {
      console.error("Error fetching assignments:", err);
      toast.error("Failed to load assignments.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssignments();
  }, []);

  // 🧩 Automatically sort assignments whenever strategy changes
  const sortedAssignments = useMemo(() => {
    return [...assignments]
      .map((a) => ({ ...a, priorityScore: computeScore(a) }))
      .sort((a, b) => b.priorityScore - a.priorityScore);
  }, [assignments, strategy]);

  const handleSave = async (data) => {
    try {
      if (editingAssignment) {
        const res = await api.put(`/assignments/${editingAssignment.id}`, data);
        setAssignments((prev) =>
          prev.map((a) => (a.id === editingAssignment.id ? res.data : a))
        );
        toast.success("Assignment updated!");
      } else {
        const res = await api.post("/assignments", data);
        setAssignments((prev) => [res.data, ...prev]);
        toast.success("Assignment added!");
      }
    } catch (err) {
      console.error("Error saving assignment:", err);
      toast.error("Failed to save assignment.");
    } finally {
      setIsModalOpen(false);
      setEditingAssignment(null);
    }
  };

  const handleMarkDone = async (id) => {
    setAssignments((prev) => prev.filter((a) => a.id !== id));
    toast.success("Marked as done!");
    try {
      await api.put(`/assignments/${id}`, { completed: true });
    } catch (err) {
      console.error("Error marking as done:", err);
      toast.error("Failed to mark as done.");
      fetchAssignments();
    }
  };

  const handleEdit = (assignment) => {
    setEditingAssignment(assignment);
    setIsModalOpen(true);
  };

  return (
    <div className="d-flex vh-100">
      <Sidebar />
      <main className="flex-grow-1 bg-body p-4 overflow-auto">
        <Toaster position="bottom-right" toastOptions={{ duration: 2000 }} />

        {/* 🔹 Header Section */}
        <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-3">
          <div className="d-flex align-items-center gap-2">
            <h3 className="fw-semibold text-light mb-0">
              My Assignments{" "}
              {user && (
                <span className="text-secondary ms-2 fs-5">({user.name})</span>
              )}
            </h3>
          </div>

          <div className="d-flex align-items-center gap-3 flex-wrap">
            {/* 🔹 Prioritization Strategy Dropdown */}
            <select
              className="form-select bg-dark text-light border-secondary"
              style={{ width: "200px" }}
              value={strategy}
              onChange={(e) => setStrategy(e.target.value)}
            >
              <option value="DDS"> DDS</option>
              <option value="DoD"> DoD</option>
              <option value="B2D"> B2D</option>
              <option value="EoC"> EoC</option>
            </select>

            <button
              className="btn btn-primary d-flex align-items-center gap-2"
              onClick={() => {
                setIsModalOpen(true);
                setEditingAssignment(null);
              }}
            >
              <i className="bi bi-plus-circle"></i> Add Assignment
            </button>
          </div>
        </div>

        {/* 🔹 Assignment Modal */}
        <AssignmentModal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setEditingAssignment(null);
          }}
          onSave={handleSave}
          editingAssignment={editingAssignment}
        />

        {/* 🔹 Loading and Empty States */}
        {loading ? (
          <div
            className="d-flex justify-content-center align-items-center"
            style={{ height: "200px" }}
          >
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        ) : sortedAssignments.length === 0 ? (
          <p className="text-secondary">No assignments found.</p>
        ) : (
          <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4">
            {sortedAssignments.map((a) => (
              <AssignmentCard
                key={a.id}
                assignment={a}
                onMarkDone={handleMarkDone}
                onEdit={handleEdit}
                strategy={strategy}
                user={user}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
