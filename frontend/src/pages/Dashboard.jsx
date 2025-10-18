// File: src/pages/Dashboard.jsx
import { useEffect, useState, useContext } from "react";
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
  const { user } = useContext(AuthContext);

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

  // ✅ Add or edit assignment
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

  // ✅ Mark assignment as done
  const handleMarkDone = async (id) => {
    setAssignments((prev) => prev.filter((a) => a.id !== id));
    toast.success("Marked as done!");
    try {
      await api.put(`/assignments/${id}`, { completed: true });
    } catch (err) {
      console.error("Error marking as done:", err);
      toast.error("Failed to mark as done.");
      fetchAssignments(); // rollback if failed
    }
  };

  // ✅ Edit existing assignment
  const handleEdit = (assignment) => {
    setEditingAssignment(assignment);
    setIsModalOpen(true);
  };

  return (
    <div className="d-flex vh-100">
      <Sidebar />
      <main className="flex-grow-1 bg-body p-4 overflow-auto">
        <Toaster position="bottom-right" toastOptions={{ duration: 2000 }} />

        <div className="d-flex justify-content-between align-items-center mb-4">
          <h3 className="fw-semibold text-light">
            My Assignments{" "}
            {user && (
              <span className="text-secondary ms-2 fs-5">({user.name})</span>
            )}
          </h3>

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

        <AssignmentModal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setEditingAssignment(null);
          }}
          onSave={handleSave}
          editingAssignment={editingAssignment}
        />

        {/* ✅ Loading and empty states */}
        {loading ? (
          <div
            className="d-flex justify-content-center align-items-center"
            style={{ height: "200px" }}
          >
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        ) : assignments.length === 0 ? (
          <p className="text-secondary">No assignments found.</p>
        ) : (
          <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4">
            {assignments.map((a) => (
              <AssignmentCard
                key={a.id}
                assignment={a}
                onMarkDone={handleMarkDone}
                onEdit={handleEdit}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
