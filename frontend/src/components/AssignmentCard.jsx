// src/components/AssignmentCard.jsx
export default function AssignmentCard({ assignment }) {
  return (
    <div className="col">
      <div className="card bg-dark text-light h-100 shadow-sm border-0">
        <div className="card-body d-flex flex-column">
          <h5 className="card-title fw-semibold">{assignment.title}</h5>
          <p className="card-text flex-grow-1 text-secondary">
            {assignment.description}
          </p>
          <div className="d-flex justify-content-between align-items-center mt-3">
            <span className="badge bg-primary">{assignment.status}</span>
            <small className="text-muted">
              Due: {assignment.due_date || "No deadline"}
            </small>
          </div>
        </div>
      </div>
    </div>
  );
}
