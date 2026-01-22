import Card from '../card/Card';

const TableCard = ({ title, data }) => {
    return (
        <Card title={title}>
            <div className="table-responsive">
                <table className="table table-hover align-middle">
                    <thead className="table-light">
                        <tr>
                           <th>ID</th>
                           <th>Cliente</th>
                           <th>Estado</th>
                           <th>Total</th>
                        </tr>
                    </thead>

                    <tbody>
                        {data.map(order => (
                            <tr key={order.id}>
                                <td>{order.id}</td>
                                <td>{order.client}</td>

                                <td>
                                    <span className={`badge ${
                                        order.status === 'Pendiente'
                                        ? 'bg-warning'
                                        : 'bg-success'
                                    }`}>
                                        {order.status}
                                    </span>
                                </td>
                                
                                <td>${order.total}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </Card>
    );
};

export default TableCard;