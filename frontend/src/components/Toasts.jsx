// src/components/Toasts.jsx
import { useEffect } from "react";
import { Toast } from "bootstrap";

export default function Toasts({ message, type }) {
  useEffect(() => {
    const toastEl = document.getElementById("appToast");
    const toast = new Toast(toastEl);
    toast.show();
  }, [message]);

  return (
    <div
      className="toast align-items-center text-bg-dark border-0 position-fixed bottom-0 end-0 m-3"
      id="appToast"
      role="alert"
    >
      <div className="d-flex">
        <div className="toast-body text-light">
          {type === "success" ? "✅ " : "⚠️ "}
          {message}
        </div>
        <button
          type="button"
          className="btn-close btn-close-white me-2 m-auto"
          data-bs-dismiss="toast"
        ></button>
      </div>
    </div>
  );
}
