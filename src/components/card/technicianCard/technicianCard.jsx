import '.technician.css';

const TechnicianCard = ({ tecnico, asignacion }) => {
    return (
        <Card title={tecnico.nombre}>

            <p className="p-text">
                <strong>Estado:</strong>{" "}
                <span
                    className={`estado ${
                    technician.status === "Disponible" /*Operador ternario (indicar estado)*/
                        ? "Realizando servicio"
                        : "Fuera de jornada"
                    }`}
                >
                    {tecnico.estado}

                </span>
            </p>
            
            <button
                className="btn-asignar"
                disabled={tecnico.estado !== "Disponible"}
                onClick={() => asignacion(tecnico.id)}  
            >
                Asignar orden
            </button>

        </Card>
    );
};

export default TechnicianCard;