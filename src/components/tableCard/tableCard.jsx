import TableCard from '../card/Card';

function TableCard({ title, children }) {
    return (
        <card title={title} className="table-card">
            {children}
        </card>
    );
}

export default TableCard;