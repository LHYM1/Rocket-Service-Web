

import TableCard from '../../components/tableCard/tableCard';
import Card from '../../components/card/Card';
import './Dashboard.css';

const Dashboard = () => {

    const orders = [
        { id: 1, client: 'Juan', status: 'Pendiente', total: 120000 },
        { id: 2, client: 'Ana', status: 'Finalizado', total: 85000 },   
    ];

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

            <TableCard 
                title="Ordenes recientes"
                data={orders}
            />
        
        </div>
    );
};

export default Dashboard;