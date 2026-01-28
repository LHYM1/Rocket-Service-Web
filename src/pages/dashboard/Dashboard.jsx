
import Card from '../../components/card/Card';
import TechnicianCard from '../../components/card/technicianCard/technicianCard';
import './Dashboard.css';

const Dashboard = () => {
    const tecnicos = [ // Declaración array tecnicos
        {
            id: 1,
            nombre: "Juan Pérez",
            estado: "Disponible"
        },

        /*Agregando más objetos al array */
        { 
            id: 2,
            nombre: "Pablo Gómez",
            estado: "Ocupado"
        },

        {
            id: 3,
            nombre: "María Rodríguez",
            estado: "Disponible"
        },

        {
            id: 4,
            nombre: "Andrés Valencia",
            estado: "Disponible"
        }

    ];

    const asignar = (idTecnico) => {
        console.log("Asignar orden al técnico:", idTecnico);
    }

    return (
        <div className="dashboard-page">
            <div className="dash-container">

                <Card 
                    title="Ordenes totales"
                    icon={
                        <img   
                            alt="imagenCardOrdenTotal"
                            src="https://res.cloudinary.com/dtmmoziql/image/upload/v1768944919/clipboard-svgrepo-com_1_pwafgx.svg"
                        />
                    }
                >
                    <span>0</span>
                </Card>

                <Card 
                    title="Ordenes pendientes"
                    icon={
                        <img   
                            alt="imagenCardOrdenPend"
                            src="https://res.cloudinary.com/dtmmoziql/image/upload/v1768957469/clipboard-list-svgrepo-com_vgnp90.svg"
                        />
                    }
                > 

                    <span>0</span>
                </Card>

                <Card 
                    title="Ordenes finalizadas"
                    icon={
                        <img   
                            alt="imagenCardOrdenPend"
                            src="https://res.cloudinary.com/dtmmoziql/image/upload/v1768957848/clipboard-list-svgrepo-com_1_ywdaov.svg"
                        />
                    }
                > 
                    <span>0</span>
                </Card>

            </div>

            <div className="tecnicos-container"> 
                <h3 className="tecnicos-title">
                    <img className="img-tec"
                        alt="imgCardTecnicos"
                        src=  
                        "https://res.cloudinary.com/dtmmoziql/image/upload/v1769342546/users-svgrepo-com_twccwo.svg"
                    />
                    Técnicos disponibles
                </h3>

                <div className="tecnicos-list">
                    {tecnicos.map(tecnico => (
                        <TechnicianCard
                            key={tecnico.id}
                            tecnico={tecnico}
                            asignar={asignar}
                        />
                    ))}
                </div>
               
            </div>
        
        </div>
    );
};

export default Dashboard;