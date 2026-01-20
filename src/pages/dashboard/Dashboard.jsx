
import ChartCard from '../../components/chartCard/ChartCard';
import TableCard from '../../components/tableCard/tableCard';
import Card from '../../components/card/Card';
import './Dashboard.css';

const Dashboard = () => {
    return (
        <div className="dashboard-page">
            <div className="dash-container">

                <Card title="Órdenes totales">
                    <img 
                        src="https://res.cloudinary.com/dtmmoziql/image/upload/v1768920327/image_8_ixpefe.png"
                    />
                    <h2>0</h2>
                </Card>

                <Card title="Ordenes pendientes"> 
                    <h2>0</h2>
                </Card>

                <Card title="Ordenes finalizadas"> 
                    <h2>0</h2>
                </Card>

            </div>
        
        </div>
    );
};

export default Dashboard;