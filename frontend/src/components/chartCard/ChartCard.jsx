import Card from '../card/Card'; // Heredación de estilos de card

function ChartCard({ title, children })  {
    return (
        <Card title={title} className="chart-card">
            { children }
        </Card>
    );
}

export default ChartCard;