// src/components/AssignmentModal.jsx
import { useState } from "react";
import api from "../api";

export default function AssignmentModal({ onAdded }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post("/assignments", { title, description });
      onAdded(res.data);
      setTitle("");
      setDescription("");
      document.getElementById("closeModalBtn").click();
    } catch (err) {
      console.error("Error adding assignment:", err);
    }
  };

  return (
    <>
      <button
        className="btn btn-primary d-flex align-items-center gap-2"
        data-bs-toggle="modal"
        data-bs-target="#assignmentModal"
      >
        <i className="bi bi-plus-circle"></i> Add Assignment
      </button>

      <div
        className="modal fade"
        id="assignmentModal"
        tabIndex="-1"
        aria-labelledby="assignmentModalLabel"
        aria-hidden="true"
      >
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content bg-dark text-light">
            <div className="modal-header border-0">
              <h5 className="modal-title" id="assignmentModalLabel">
                New Assignment
              </h5>
              <button
                type="button"
                id="closeModalBtn"
                className="btn-close btn-close-white"
                data-bs-dismiss="modal"
                aria-label="Close"
              ></button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="mb-3">
                  <label className="form-label">Title</label>
                  <input
                    type="text"
                    className="form-control bg-secondary text-light border-0"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">Description</label>
                  <textarea
                    className="form-control bg-secondary text-light border-0"
                    rows="3"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  ></textarea>
                </div>
              </div>
              <div className="modal-footer border-0">
                <button type="submit" className="btn btn-primary">
                  Save Assignment
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}
