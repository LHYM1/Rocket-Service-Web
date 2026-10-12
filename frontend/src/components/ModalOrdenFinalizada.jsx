function ModalOrdenFinalizada({ orden, onAceptar }) {
    return (
        <div className="rs-modal-overlay">
            <div className="rs-modal" style={{ maxWidth: "400px" }}>
                <div className="rs-modal-body" style={{ alignItems: "center", textAlign: "center", paddingTop: "36px" }}>
                    <div style={{
                        width: 64, height: 64, borderRadius: "50%",
                        backgroundColor: "rgba(34,197,94,0.12)", color: "#22c55e",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: "28px", margin: "0 auto 12px"
                    }}>
                        <i className="fa-solid fa-check"></i>
                    </div>
                    <h5 className="rs-modal-title" style={{ fontSize: "18px" }}>¡Tu orden ha sido finalizada!</h5>
                    <p style={{ color: "#6b7280", fontSize: "14px", margin: "8px 0 0" }}>
                        Tu moto <strong>{orden.placa_moto}</strong> ({orden.codigo_orden}) ya está lista.
                        Ya puedes recogerla en el taller.
                    </p>
                </div>
                <div className="rs-modal-footer" style={{ justifyContent: "center" }}>
                    <button className="rs-btn rs-btn-primary" onClick={onAceptar}>
                        Aceptar
                    </button>
                </div>
            </div>
        </div>
    );
}

export default ModalOrdenFinalizada;