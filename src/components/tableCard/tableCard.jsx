import Card from '../card/Card';

function TableCard({ title, children }) {
    return (
        <Card title={title} className="table-card">
            {children}
        </Card>
    );
}

export default TableCard;