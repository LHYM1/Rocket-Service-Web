import 'react-router-dom';
import './Dashboard.css';

const Dashboard = () => {
    return (
        <div className="dashboard-page"> 
            <div className="dashb-ordTot">
                <h2>Ordenes totales</h2>
                <span className="counter">0</span>
            </div>

            <div className="dashb-ordPend"> 
                <h2>Ordenes Pendientes</h2>
                <span className="counter">0</span>
            </div>

            <div className="dashb-ordFinl"> 
                <h2>Ordenes Finalizadas</h2>
                <span className="counter">0</span>
            </div>
        </div>
    );
};

export default Dashboard;