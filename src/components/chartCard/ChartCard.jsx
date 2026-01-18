import Card from '../card/Card';

function ChartCard({ title, children })  {
    return (
        <Card title={title} className="chart-card">
            { children }
        </Card>
    );
}

export default ChartCard;