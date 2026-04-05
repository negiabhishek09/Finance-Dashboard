import { useEffect } from "react";
import Icon from "./Icon";

/**
 * Modal — Accessible overlay dialog with backdrop blur.
 *
 * Props:
 *   open     {boolean}  - Controls visibility.
 *   onClose  {Function} - Called when backdrop clicked or Escape pressed.
 *   title    {string}   - Heading displayed at the top of the panel.
 *   children {ReactNode}
 *
 * Behaviour:
 *   - Locks body scroll while open.
 *   - Closes on Escape keydown.
 *   - Click on backdrop closes; click inside panel does not.
 */
export default function Modal({ open, onClose, children, title }) {
  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === "Escape") onClose();
    };
    if (open) {
      document.addEventListener("keydown", handleKey);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", handleKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.7)",
        zIndex: 1000,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "20px",
        backdropFilter: "blur(4px)",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "var(--card-bg)",
          border: "1px solid var(--border)",
          borderRadius: "16px",
          padding: "28px",
          width: "100%",
          maxWidth: "480px",
          animation: "modalIn 0.2s ease",
        }}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "24px",
          }}
        >
          <span
            style={{
              fontSize: "18px",
              fontWeight: "700",
              color: "var(--text)",
              fontFamily: "var(--font-display)",
            }}
          >
            {title}
          </span>
          <button
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              color: "var(--muted)",
              cursor: "pointer",
              padding: "4px",
            }}
          >
            <Icon name="x" size={20} />
          </button>
        </div>

        {children}
      </div>
    </div>
  );
}
