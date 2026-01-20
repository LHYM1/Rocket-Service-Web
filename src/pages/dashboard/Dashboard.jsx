
import ChartCard from '../../components/chartCard/ChartCard';
import TableCard from '../../components/tableCard/tableCard';
import Card from '../../components/card/Card';
import './Dashboard.css';

const Dashboard = () => {
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

                <Card title="Ordenes pendientes"> 
                    <span>0</span>
                </Card>

                <Card title="Ordenes finalizadas"> 
                    <span>0</span>
                </Card>

            </div>
        
        </div>
    );
};

export default Dashboard;