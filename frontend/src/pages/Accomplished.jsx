// File: src/pages/Accomplished.jsx
import { useEffect, useState, useContext } from "react";
import api from "../api";
import Sidebar from "../components/Sidebar";
import AssignmentCard from "../components/AssignmentCard";
import { AuthContext } from "../context/AuthContext";
import toast, { Toaster } from "react-hot-toast";

export default function Accomplished() {
  const [completedAssignments, setCompletedAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useContext(AuthContext);

  // ✅ Fetch accomplished tasks
  const fetchCompletedAssignments = async () => {
    setLoading(true);
    try {
      const res = await api.get("/assignments?completed=true");
      const completed = res.data.filter((a) => a.completed);
      setCompletedAssignments(completed);
    } catch (err) {
      console.error("Error fetching accomplished tasks:", err);
      toast.error("Failed to load accomplished tasks.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCompletedAssignments();
  }, []);

  // ✅ Unmark as done (moves back to active tasks)
  const handleUnmarkDone = async (id) => {
    try {
      await api.put(`/assignments/${id}`, { completed: false });
      setCompletedAssignments((prev) => prev.filter((a) => a.id !== id));
      toast.success("Task restored to active assignments.");
    } catch (err) {
      console.error("Error unmarking assignment:", err);
      toast.error("Failed to unmark task.");
    }
  };

  return (
    <div className="d-flex vh-100">
      <Sidebar />
      <main className="flex-grow-1 bg-body p-4 overflow-auto">
        <Toaster position="bottom-right" toastOptions={{ duration: 2000 }} />

        <div className="d-flex justify-content-between align-items-center mb-4">
          <h3 className="fw-semibold text-light">
            Accomplished Tasks{" "}
            {user && (
              <span className="text-secondary ms-2 fs-5">({user.name})</span>
            )}
          </h3>
        </div>

        {/* ✅ Loading spinner */}
        {loading ? (
          <div
            className="d-flex justify-content-center align-items-center"
            style={{ height: "200px" }}
          >
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        ) : completedAssignments.length === 0 ? (
          <p className="text-secondary">No accomplished tasks yet.</p>
        ) : (
          <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4">
            {completedAssignments.map((a) => (
              <AssignmentCard
                key={a.id}
                assignment={a}
                onMarkDone={handleUnmarkDone} // reuse button
                hideEdit={true} // ✅ hide edit button in accomplished view
                unmarkMode={true} // ✅ change label to "Unmark as Done"
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
