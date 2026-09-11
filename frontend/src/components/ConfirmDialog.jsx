import { useEffect, useRef } from 'react';

const ConfirmDialog = ({ open, title, message, confirmLabel = 'Confirm', onConfirm, onCancel, busy = false }) => {
  const cancelRef = useRef(null);

  useEffect(() => {
    if (!open) return undefined;

    cancelRef.current?.focus();
    const handleKeyDown = (event) => {
      if (event.key === 'Escape' && !busy) onCancel();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [busy, onCancel, open]);

  if (!open) return null;

  return (
    <div className="app-dialog-backdrop" role="presentation">
      <div
        className="app-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="app-dialog-title"
        aria-describedby="app-dialog-description"
      >
        <span className="eyebrow">Please confirm</span>
        <h2 id="app-dialog-title">{title}</h2>
        <p id="app-dialog-description">{message}</p>
        <div className="app-dialog-actions">
          <button ref={cancelRef} type="button" className="btn btn-ghost" onClick={onCancel} disabled={busy}>
            Keep it
          </button>
          <button type="button" className="btn btn-danger" onClick={onConfirm} disabled={busy}>
            {busy ? 'Working…' : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDialog;
