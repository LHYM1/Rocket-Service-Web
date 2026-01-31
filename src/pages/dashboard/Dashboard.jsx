
import Card from '../../components/card/Card';
import OrderList from '../../components/orders/OrdersList';
import TechnicianCard from '../../components/card/technicianCard/technicianCard';
import './Dashboard.css';

const Dashboard = () => {
    const ordenes = [ // Declaración array ordenes
        {
            id: 1,
            codigo: "ORD-001",
            cliente: "Andrés Valencia",
            servicio: "Reparación de aire acondicionado",
            estado: "Pendiente",
            fechaInicio: "01-01-2026"
        },

        {
            id: 2,
            codigo: "ORD-002",
            cliente: "Ivan Castro",
            servicio: "Mantenimiento de sistema eléctrico",
            estado: "En proceso",
            fechaInicio: "12-01-2026"
        },

        {
            id: 3,
            codigo: "ORD-003",
            cliente: "Natalia Rodríguez",
            servicio: "Instalación de sistema de seguridad",
            estado: "finalizada",
            fechaInicio: "15-01-2026"
        },

        {
            id: 4,
            codigo: "ORD-004",
            cliente: "Carlos Méndez",
            servicio: "Frenos y suspensión",
            estado: "Cancelada",
            fechaInicio: "10-01-2026"
        },

        {
            id: 5,
            codigo: "ORD-005",
            cliente: "Laura Gómez",
            servicio: "Cambio de aceite y filtros",
            estado: "Asignada",
            fechaInicio: "12-01-2026"
        }
    ];

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

            { /* SECCIÓN PRINCIPAL ORDENES Y TÉCNICOS */ }
            <div className="main-section">

                { /* ÓRDENES - IZQUIERDA */ }
                <div className="ordenes-container">
                    <h3 className="ordenes-title">
                        Listado ordenes
                    </h3>

                    <div className="ordenes-list">
                        <OrderList ordenes={ordenes} />
                    </div>
                    
                </div>
                
                { /* TÉCNICOS - DERECHA */ }
                <div className="tecnicos-container"> 
                    <h3 className="tecnicos-title">
                        <img className="img-tec"
                            alt="imgCardTecnicos"
                            src=  
                            "https://res.cloudinary.com/dtmmoziql/image/upload/v1769342546/users-svgrepo-com_twccwo.svg"
                        />
                            Disponibilidad técnicos
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
            
        
        </div>
    );
};

export default Dashboard;