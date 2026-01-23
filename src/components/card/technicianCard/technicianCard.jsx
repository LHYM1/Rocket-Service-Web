import './technicianCard.css';
import Card from '../Card';

const TechnicianCard = ({ tecnico, asignar }) => {
    return (
        <Card title={tecnico.nombre}>

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
            
            <button
                className="btn-asignar"
                disabled={tecnico.estado !== "Disponible"}
                onClick={() => asignar(tecnico.id)}  
            >
                Asignar orden
            </button>

        </Card>
    );
};

export default TechnicianCard;