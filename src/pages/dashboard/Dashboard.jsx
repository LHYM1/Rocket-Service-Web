import 'react-router-dom';
import ChardCard from '../../components/chartCard/ChartCard';
import TableCard from '../../components/tableCard/tableCard';
import Card from '../../components/card/Card';
import './Dashboard.css';

const Dashboard = () => {
    return (
        <div className="dashboard-page">

            <Card title="Órdenes totales">
                <h2>0</h2>
            </Card>

            <Card title="Ordenes pendientes"> 
                <h2>0</h2>
            </Card>

            <Card title="Ordenes finalizadas"> 
                <h2>0</h2>
            </Card>
        </div>
    );
};

export default Dashboard;