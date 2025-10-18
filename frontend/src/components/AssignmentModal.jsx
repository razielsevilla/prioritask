import { useState, useEffect } from "react";
import api from "../api";

export default function AssignmentModal({ isOpen, onClose, onSave }) {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    due_date: "",
    points: 0,
    weight: 0,
    difficulty: 1,
    effort: 60,
  });

  useEffect(() => {
    if (!isOpen) {
      setFormData({
        title: "",
        description: "",
        due_date: "",
        points: 0,
        weight: 0,
        difficulty: 1,
        effort: 60,
      });
    }
  }, [isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = {
        title: formData.title,
        description: formData.description,
        due_date: formData.due_date || null,
        points: parseInt(formData.points) || 0,
        weight: parseFloat(formData.weight) || 0,
        difficulty: parseInt(formData.difficulty),
        estimated_effort: parseInt(formData.effort),
      };
      await onSave(data);
    } catch (err) {
      console.error("Error saving assignment:", err);
    }
  };

  if (!isOpen) return null; // Don’t render modal if not open

  return (
    <div
      className="modal fade show"
      tabIndex="-1"
      style={{
        display: "block",
        backgroundColor: "rgba(0, 0, 0, 0.6)",
      }}
      onClick={onClose}
    >
      <div
        className="modal-dialog modal-dialog-centered"
        onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside
      >
        <div className="modal-content bg-dark text-light">
          <div className="modal-header border-secondary">
            <h5 className="modal-title">Add New Assignment</h5>
            <button type="button" className="btn-close btn-close-white" onClick={onClose}></button>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="modal-body">
              {/* Title */}
              <div className="mb-3">
                <label className="form-label">Title</label>
                <input
                  type="text"
                  name="title"
                  className="form-control bg-dark text-light border-secondary"
                  value={formData.title}
                  onChange={handleChange}
                  required
                />
              </div>

              {/* Description */}
              <div className="mb-3">
                <label className="form-label">Description</label>
                <textarea
                  name="description"
                  className="form-control bg-dark text-light border-secondary"
                  rows="3"
                  value={formData.description}
                  onChange={handleChange}
                ></textarea>
              </div>

              {/* Due Date */}
              <div className="mb-3">
                <label className="form-label">Due Date</label>
                <input
                  type="date"
                  name="due_date"
                  className="form-control bg-dark text-light border-secondary"
                  value={formData.due_date}
                  onChange={handleChange}
                />
              </div>

              <div className="row">
                {/* Points */}
                <div className="col-md-4 mb-3">
                  <label className="form-label">Points</label>
                  <input
                    type="number"
                    name="points"
                    min="0"
                    className="form-control bg-dark text-light border-secondary"
                    value={formData.points}
                    onChange={handleChange}
                  />
                </div>

                {/* Weight */}
                <div className="col-md-4 mb-3">
                  <label className="form-label">Weight</label>
                  <input
                    type="number"
                    name="weight"
                    min="0"
                    step="0.01"
                    className="form-control bg-dark text-light border-secondary"
                    value={formData.weight}
                    onChange={handleChange}
                  />
                </div>

                {/* Difficulty */}
                <div className="col-md-4 mb-3">
                  <label className="form-label">Difficulty (1–3)</label>
                  <select
                    name="difficulty"
                    className="form-select bg-dark text-light border-secondary"
                    value={formData.difficulty}
                    onChange={handleChange}
                  >
                    <option value="1">1 - Easy</option>
                    <option value="2">2 - Medium</option>
                    <option value="3">3 - Hard</option>
                  </select>
                </div>
              </div>

              {/* Effort */}
              <div className="mb-3">
                <label className="form-label">
                  Estimated Effort (60–100)
                </label>
                <input
                  type="range"
                  name="effort"
                  min="60"
                  max="100"
                  className="form-range"
                  value={formData.effort}
                  onChange={handleChange}
                />
                <div className="text-secondary small">
                  {formData.effort} / 100
                </div>
              </div>
            </div>

            <div className="modal-footer border-secondary">
              <button
                type="button"
                className="btn btn-outline-secondary"
                onClick={onClose}
              >
                Cancel
              </button>
              <button type="submit" className="btn btn-primary">
                Save Assignment
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
