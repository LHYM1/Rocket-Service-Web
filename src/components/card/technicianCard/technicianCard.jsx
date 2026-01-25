import './technicianCard.css';
import Card from '../Card';

const TechnicianCard = ({ tecnico, asignar }) => {
    return (
        <Card>
            <div className="technician-content">

                <div className="technician-info">
                    <h4>{tecnico.nombre}</h4>

                    <p className="p-text">
                        <strong>Estado:</strong>{" "}
                        <span
                            className={`estado ${
                            tecnico.estado === "Disponible" /*Operador ternario (indicar estado)*/
                                ? "disponible"
                                : "ocupado"
                            }`}
                        >
                            {tecnico.estado}

                        </span>
                    </p>
                </div>
                
                <div className="technician-action">
                    <button
                        className="btn-asignar"
                        disabled={tecnico.estado !== "Disponible"}
                        onClick={() => asignar(tecnico.id)}  
                    >
                        Asignar orden
                    </button>
                </div>
        
            </div>

        </Card>
    );
};

export default TechnicianCard;