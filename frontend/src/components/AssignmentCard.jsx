import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function AssignmentCard({
  assignment,
  onMarkDone,
  onEdit,
  hideEdit = false,
  unmarkMode = false,
}) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleMark = async () => {
    setIsProcessing(true);
    await onMarkDone(assignment.id);
    setIsProcessing(false);
    setIsExpanded(false);
  };

  // Format score nicely
  const formattedScore =
    assignment.priorityScore !== undefined
      ? assignment.priorityScore.toFixed(3)
      : "—";

  return (
    <>
      {/* 🔹 Compact Card */}
      <div className="col">
        <motion.div
          layout
          whileHover={{ scale: 1.02 }}
          transition={{ duration: 0.15 }}
          className="card h-100 border-0 text-light shadow-lg position-relative"
          style={{
            background: "linear-gradient(160deg, #1e1e1e, #2b2b2b)",
            boxShadow: "0 0 15px rgba(0, 0, 0, 0.6)",
            border: "1px solid rgba(255, 255, 255, 0.08)",
            borderRadius: "12px",
            cursor: "pointer",
          }}
          onClick={() => setIsExpanded(true)}
        >
          {/* ✏️ Edit button */}
          {!hideEdit && (
            <button
              className="btn btn-sm btn-outline-light position-absolute top-0 end-0 m-2"
              onClick={(e) => {
                e.stopPropagation();
                onEdit?.(assignment);
              }}
              title="Edit details"
              style={{
                border: "none",
                background: "rgba(255, 255, 255, 0.1)",
                borderRadius: "50%",
                width: "32px",
                height: "32px",
              }}
            >
              <i className="bi bi-pencil-square"></i>
            </button>
          )}

          <div className="card-body d-flex flex-column p-3">
            {/* 🟦 Priority Score */}
{assignment.status !== "Done" && (
  <div className="mb-2">
    <span
      className="badge bg-info text-dark px-3 py-2 fs-6"
      title="Priority score based on selected strategy"
    >
      Priority Score: {formattedScore}
    </span>
  </div>
)}


            {/* 🏷 Title */}
            <h5 className="card-title fw-semibold text-white mb-1">
              {assignment.title}
            </h5>

            {/* 📝 Description */}
            <p
              className="card-text text-secondary mb-3"
              style={{
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {assignment.description || "No description provided."}
            </p>

            {/* 📅 Meta Info */}
            <div className="d-flex justify-content-between align-items-center mb-3">
              <span className="badge bg-primary">{assignment.status}</span>
              <small className="text-muted">
                Due: {assignment.due_date || "No deadline"}
              </small>
            </div>

            {/* ✅ Action Button */}
            <button
              className={`btn w-100 mt-auto ${
                unmarkMode ? "btn-warning" : "btn-success"
              }`}
              onClick={(e) => {
                e.stopPropagation();
                handleMark();
              }}
              disabled={isProcessing}
            >
              {isProcessing
                ? unmarkMode
                  ? "Unmarking..."
                  : "Marking..."
                : unmarkMode
                ? "Unmark as Done"
                : "Mark as Done"}
            </button>
          </div>
        </motion.div>
      </div>

      {/* 🔹 Expanded View */}
      <AnimatePresence>
        {isExpanded && (
          <>
            {/* Dimmed Background */}
            <motion.div
              className="position-fixed top-0 start-0 w-100 h-100"
              style={{ background: "rgba(0,0,0,0.8)", zIndex: 1050 }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsExpanded(false)}
            />

            {/* Expanded Card */}
            <motion.div
              layoutId={`assignment-${assignment.id}`}
              className="position-fixed top-50 start-50 translate-middle text-light shadow-lg p-4"
              style={{
                background: "linear-gradient(160deg, #1e1e1e, #2b2b2b)",
                border: "1px solid rgba(255, 255, 255, 0.1)",
                borderRadius: "18px",
                width: "90%",
                maxWidth: "550px",
                zIndex: 1051,
                padding: "2rem",
              }}
              initial={{ scale: 0.85, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.85, opacity: 0 }}
              transition={{ type: "spring", stiffness: 120, damping: 15 }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* ❌ Close Button */}
              <button
                className="btn btn-sm btn-outline-light position-absolute top-0 end-0 m-3"
                style={{
                  border: "none",
                  background: "rgba(255, 255, 255, 0.1)",
                  borderRadius: "50%",
                  width: "36px",
                  height: "36px",
                }}
                onClick={() => setIsExpanded(false)}
              >
                <i className="bi bi-x-lg"></i>
              </button>

              <div className="card-body">
                {/* 🟦 Title + Score */}
<div className="d-flex justify-content-between align-items-center mb-3">
  <h3 className="fw-bold text-white mb-0">
    {assignment.title || "Untitled Assignment"}
  </h3>
  {assignment.completed !== true && (
    <span
      className="badge bg-info text-dark fs-6"
      title="Priority score based on selected strategy"
    >
      Priority Score: {formattedScore}
    </span>
  )}
</div>


                {/* Description */}
                <p
                  className="text-secondary mb-4"
                  style={{ lineHeight: "1.6", fontSize: "0.95rem" }}
                >
                  {assignment.description || "No description provided."}
                </p>

                <hr
                  style={{
                    borderColor: "rgba(255,255,255,0.1)",
                    margin: "1.2rem 0",
                  }}
                />

                {/* Info Grid */}
                <div
                  className="d-grid"
                  style={{
                    gridTemplateColumns: "1fr 1fr",
                    gap: "0.75rem 1.25rem",
                    marginBottom: "1.5rem",
                  }}
                >
                  <InfoRow
                    icon="calendar-date"
                    label="Due Date"
                    value={assignment.due_date || "No deadline"}
                  />
                  <InfoRow
                    icon="award"
                    label="Points"
                    value={assignment.points ?? 0}
                  />
                  <InfoRow
                    icon="bar-chart"
                    label="Weight"
                    value={assignment.weight ?? 0}
                  />
                  <InfoRow
                    icon="speedometer2"
                    label="Difficulty"
                    value={assignment.difficulty ?? 1}
                  />
                  <InfoRow
                    icon="hourglass-split"
                    label="Effort"
                    value={`${assignment.estimated_effort ?? 60} mins`}
                  />
                  <InfoRow
                    icon="clipboard-check"
                    label="Status"
                    value={assignment.status || "Pending"}
                  />
                </div>

                {/* ✅ Action Button */}
<motion.button
  whileTap={{ scale: 0.97 }}
  whileHover={{ scale: 1.02 }}
  className={`btn w-100 mt-auto fw-semibold d-flex align-items-center justify-content-center ${
    unmarkMode ? "btn-warning" : "btn-success"
  }`}
  style={{
    background: unmarkMode
      ? "linear-gradient(90deg, #ffc107, #ffb300)"
      : "linear-gradient(90deg, #28a745, #3fd57a)",
    color: "#fff",
    border: "none",
    borderRadius: "8px",
    boxShadow: unmarkMode
      ? "0 0 12px rgba(255, 193, 7, 0.4)"
      : "0 0 12px rgba(40, 167, 69, 0.4)",
    transition: "all 0.25s ease",
    height: "44px",
  }}
  onClick={(e) => {
    e.stopPropagation();
    handleMark();
  }}
  disabled={isProcessing}
>
  {isProcessing ? (
    <>
      <span
        className="spinner-border spinner-border-sm me-2"
        role="status"
        aria-hidden="true"
      ></span>
      {unmarkMode ? "Unmarking..." : "Marking..."}
    </>
  ) : (
    <>
      <i
        className={`bi ${
          unmarkMode ? "bi-arrow-counterclockwise" : "bi-check-circle"
        } me-2`}
      ></i>
      {unmarkMode ? "Unmark as Done" : "Mark as Done"}
    </>
  )}
</motion.button>

              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

/* 🧩 Reusable InfoRow Component */
function InfoRow({ icon, label, value }) {
  return (
    <div
      className="d-flex align-items-center"
      style={{
        background: "rgba(255,255,255,0.05)",
        borderRadius: "8px",
        padding: "8px 12px",
      }}
    >
      <i
        className={`bi bi-${icon} me-2`}
        style={{ color: "#0d6efd", fontSize: "1.1rem" }}
      ></i>
      <div>
        <div
          className="text-muted"
          style={{ fontSize: "0.8rem", letterSpacing: "0.3px" }}
        >
          {label}
        </div>
        <div className="text-white fw-semibold" style={{ fontSize: "0.9rem" }}>
          {value}
        </div>
      </div>
    </div>
  );
}
