import Card from '../card/Card';

function Card({ title, children })  {
    return (
        <Card title={title} className="chart-card">
            { children }
        </Card>
    );
}

export default Card;