// File: src/components/AssignmentModal.jsx
import { useState, useEffect } from "react";

export default function AssignmentModal({ isOpen, onClose, onSave, editingAssignment }) {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    due_date: "",
    points: 0,
    weight: 0,
    difficulty: 1,
    effort: 60,
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (editingAssignment) {
      setFormData({
        title: editingAssignment.title || "",
        description: editingAssignment.description || "",
        due_date: editingAssignment.due_date || "",
        points: editingAssignment.points || 0,
        weight: editingAssignment.weight || 0,
        difficulty: editingAssignment.difficulty || 1,
        effort: editingAssignment.estimated_effort || 60,
      });
    } else if (!isOpen) {
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
  }, [isOpen, editingAssignment]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "weight") {
      if (value === "" || (value >= 0 && value <= 1)) {
        setFormData((prev) => ({ ...prev, [name]: value }));
      }
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const data = {
      title: formData.title,
      description: formData.description,
      due_date: formData.due_date || null,
      points: parseInt(formData.points) || 0,
      weight: parseFloat(formData.weight) || 0,
      difficulty: parseInt(formData.difficulty),
      estimated_effort: parseInt(formData.effort),
    };
    try {
      await onSave(data);
      onClose();
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center"
      style={{ background: "rgba(0,0,0,0.8)", zIndex: 2000 }}
      onClick={onClose}
    >
      <div
        className="text-light shadow-lg p-4 position-relative"
        style={{
          background: "linear-gradient(160deg, #1e1e1e, #2b2b2b)",
          boxShadow: "0 0 15px rgba(0, 0, 0, 0.6)",
          border: "1px solid rgba(255,255,255,0.08)",
          borderRadius: "18px",
          width: "90%",
          maxWidth: "850px",
          display: "flex",
          flexDirection: "column",
          gap: "1.5rem",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          className="btn btn-sm btn-outline-light position-absolute top-0 end-0 m-3"
          style={{
            border: "none",
            background: "rgba(255, 255, 255, 0.1)",
            borderRadius: "50%",
            width: "36px",
            height: "36px",
          }}
          onClick={onClose}
          disabled={loading}
        >
          <i className="bi bi-x-lg"></i>
        </button>

        <h4 className="fw-bold text-white mb-0">
          {editingAssignment ? "Edit Assignment" : "Add New Assignment"}
        </h4>
        <p className="text-secondary small mb-3">
          Fill out the details below. Make it clear and concise!
        </p>

        <form onSubmit={handleSubmit} className="d-flex flex-column h-100">
          <div
            className="d-grid"
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "1.5rem",
              alignItems: "stretch",
            }}
          >
            {/* Left Column */}
            <div
              className="d-flex flex-column justify-content-between"
              style={{
                background: "linear-gradient(160deg, #222, #2b2b2b)",
                border: "1px solid rgba(255,255,255,0.05)",
                borderRadius: "10px",
                padding: "1rem",
              }}
            >
              <div className="d-flex flex-column gap-3 h-100">
                <FloatingInput
                  label="Title"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="Title"
                  required
                  disabled={loading}
                />
                <FloatingTextarea
                  label="Description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Description"
                  disabled={loading}
                />
                {/* Estimated Effort */}
                <div
                  className="floating-box d-flex flex-column"
                  style={{
                    background: "rgba(255,255,255,0.05)",
                    borderRadius: "8px",
                    padding: "10px 12px",
                  }}
                >
                  <label className="text-muted small mb-1">Estimated Effort</label>
                  <input
                    type="range"
                    name="effort"
                    min="60"
                    max="100"
                    className="form-range"
                    value={formData.effort}
                    onChange={handleChange}
                    disabled={loading}
                  />
                  <div className="text-secondary small">{formData.effort} / 100</div>
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div
              className="d-flex flex-column justify-content-between"
              style={{
                background: "linear-gradient(160deg, #222, #2b2b2b)",
                border: "1px solid rgba(255,255,255,0.05)",
                borderRadius: "10px",
                padding: "1rem",
              }}
            >
              <div className="d-flex flex-column gap-3 h-100">
                <FloatingInput
                  label="Due Date"
                  name="due_date"
                  type="date"
                  value={formData.due_date}
                  onChange={handleChange}
                  disabled={loading}
                />
                <FloatingInput
                  label="Points"
                  name="points"
                  type="number"
                  value={formData.points}
                  onChange={handleChange}
                  disabled={loading}
                />
                <FloatingInput
                  label="Weight"
                  name="weight"
                  type="number"
                  step="0.01"
                  min="0"
                  max="1"
                  value={formData.weight}
                  onChange={handleChange}
                  disabled={loading}
                />
                {/* Difficulty */}
                <div
                  className="floating-box d-flex flex-column"
                  style={{
                    background: "rgba(255,255,255,0.05)",
                    borderRadius: "8px",
                    padding: "10px 12px",
                  }}
                >
                  <label className="small mb-1" style={{ color: "#0d6efd" }}>
                    Difficulty (1–3)
                  </label>
                  <select
                    name="difficulty"
                    className="form-select text-light border-0"
                    style={{
                      background: "rgba(255,255,255,0.1)",
                      padding: "8px 12px",
                      borderRadius: "6px",
                      color: "white",
                    }}
                    value={formData.difficulty}
                    onChange={handleChange}
                    disabled={loading}
                  >
                    <option value="1" style={{ color: "black" }}>
                      1 - Easy
                    </option>
                    <option value="2" style={{ color: "black" }}>
                      2 - Average
                    </option>
                    <option value="3" style={{ color: "black" }}>
                      3 - Difficult
                    </option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          <hr style={{ borderColor: "rgba(255,255,255,0.1)", margin: "1.5rem 0" }} />

          {/* Bottom Buttons */}
          <div className="d-flex justify-content-center gap-3">
            <button
              type="button"
              className="btn btn-outline-secondary px-4"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary px-4 d-flex align-items-center justify-content-center"
              disabled={loading}
            >
              {loading ? (
                <>
                  <span
                    className="spinner-border spinner-border-sm me-2"
                    role="status"
                    aria-hidden="true"
                  ></span>
                  Saving...
                </>
              ) : editingAssignment ? (
                "Save Changes"
              ) : (
                "Save Assignment"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* Floating Input */
function FloatingInput({ label, name, type = "text", value, onChange, placeholder, required, step, min, max, disabled }) {
  return (
    <div className="floating-group">
      <input
        type={type}
        name={name}
        id={name}
        value={value}
        onChange={onChange}
        placeholder=" "
        required={required}
        step={step}
        min={min}
        max={max}
        disabled={disabled}
      />
      <label htmlFor={name}>{label}</label>
    </div>
  );
}

/* Floating Textarea */
function FloatingTextarea({ label, name, value, onChange, placeholder, disabled }) {
  return (
    <div className="floating-group">
      <textarea
        name={name}
        id={name}
        rows="4"
        value={value}
        onChange={onChange}
        placeholder=" "
        disabled={disabled}
        style={{ resize: "none" }}
      />
      <label htmlFor={name}>{label}</label>
    </div>
  );
}
