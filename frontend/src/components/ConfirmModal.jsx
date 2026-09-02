// Modal de confirmación reutilizable — reemplaza window.confirm() con el mismo
// lenguaje visual del resto del sistema (rs-modal-*), con ícono Font Awesome.
function ConfirmModal({
    title,
    message,
    confirmLabel = "Confirmar",
    cancelLabel = "Cancelar",
    icon = "fa-solid fa-ban",
    onConfirm,
    onCancel
}) {
    return (
        <div className="rs-modal-overlay">
            <div className="rs-modal" style={{ maxWidth: "380px" }}>
                <div
                    className="rs-modal-body"
                    style={{ alignItems: "center", textAlign: "center", paddingTop: "32px" }}
                >
                    <div
                        className="rs-modal-icon rs-modal-icon-danger"
                        style={{ width: "56px", height: "56px", fontSize: "22px", margin: "0 auto" }}
                    >
                        <i className={icon}></i>
                    </div>

                    <h5 className="rs-modal-title" style={{ fontSize: "17px" }}>{title}</h5>
                    <p style={{ color: "#6b7280", fontSize: "13px", margin: 0 }}>{message}</p>
                </div>

                <div className="rs-modal-footer" style={{ justifyContent: "center" }}>
                    <button className="rs-btn rs-btn-secondary" onClick={onCancel}>
                        {cancelLabel}
                    </button>
                    <button className="rs-btn rs-btn-delete" onClick={onConfirm}>
                        {confirmLabel}
                    </button>
                </div>
            </div>
        </div>
    );
}

export default ConfirmModal;