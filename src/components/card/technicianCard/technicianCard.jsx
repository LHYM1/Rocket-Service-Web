import './technicianCard.css';

const TechnicianCard = ({ tecnico, asignar }) => {
    return (
        <div className="technician-card">
        
            {/* Avatar */}
            <div className="avatar">
                {tecnico.nombre
                    .split(" ")
                    .map(p => p[0])
                    .join("")}
            </div>  

            {/* info técnico */}
            <div className="technician-info">
                <h4>{tecnico.nombre}</h4>

                <span
                    className={`estado ${
                        tecnico.estado === "Disponible" /*Operador ternario (indicar estado)*/
                            ? "disponible"
                            : "ocupado"
                    }`}
                >
                    {tecnico.estado}

                </span>
            </div>

            {/* Acción */}
            <button
                className="btn-asignar"
                disabled={tecnico.estado !== "Disponible"}
                onClick={() => asignar(tecnico.id)}  
            >
                Asignar orden
            </button>

        </div>
    );
};

export default TechnicianCard;