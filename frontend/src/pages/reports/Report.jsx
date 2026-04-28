import TableCard from '../../components/tableCard/TableCard';

const Reports = () => {
    const orders = [
        { id: 1, client: 'Juan', status: 'Pendiente', total: 120000 },
        { id: 2, client: 'Ana', status: 'Finalizado', total: 85000 },   
    ];
    
    return (
        <div>
            <TableCard 
                title="Reporte de ordenes"
                data={orders}
            /> 
            
        </div>
    );
};

export default Reports;