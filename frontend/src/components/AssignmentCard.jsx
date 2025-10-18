// File: src/components/AssignmentCard.jsx
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

          <div className="card-body d-flex flex-column">
            <h5 className="card-title fw-semibold text-white mb-2">
              {assignment.title}
            </h5>

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

            <div className="d-flex justify-content-between align-items-center mb-3">
              <span className="badge bg-primary">{assignment.status}</span>
              <small className="text-muted">
                Due: {assignment.due_date || "No deadline"}
              </small>
            </div>

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

      {/* 🔹 Expanded View with Styled Details */}
      <AnimatePresence>
        {isExpanded && (
          <>
            {/* Backdrop */}
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
                onClick={() => setIsExpanded(false)}
              >
                <i className="bi bi-x-lg"></i>
              </button>

              {/* Content */}
              <div className="card-body">
                <h3 className="fw-bold text-white mb-3">
                  {assignment.title || "Untitled Assignment"}
                </h3>
                <p
                  className="text-secondary mb-4"
                  style={{ lineHeight: "1.6", fontSize: "0.95rem" }}
                >
                  {assignment.description || "No description provided."}
                </p>

                {/* Divider */}
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

                <button
                  className={`btn w-100 py-2 ${
                    unmarkMode ? "btn-warning" : "btn-success"
                  }`}
                  onClick={handleMark}
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
          </>
        )}
      </AnimatePresence>
    </>
  );
}

/* 🧩 Small Reusable Info Row Component */
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
