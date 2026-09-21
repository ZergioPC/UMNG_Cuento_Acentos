function ActionButton({ onClick }) {
  return (
    <button
      type="button"
      className="btn btn-sm btn-outline-light rounded-circle d-flex align-items-center justify-content-center"
      style={{ width: 28, height: 28, padding: 0 }}
      aria-label="Acción de la frase"
      onClick={onClick}
    >
      <span aria-hidden="true">🔊</span>
    </button>
  );
}

export { ActionButton };