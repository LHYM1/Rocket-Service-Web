import OrderCard from './OrderCard';

const OrdersList = ({ ordenes, ordenSeleccionada, onSelectOrden }) => {
    return (
        <>
            {ordenes.map((orden) => (
                <OrderCard
                    key={orden.id}
                    order={orden}
                    activa={ordenSeleccionada?.id === orden.id}
                    onSelect={() => onSelectOrden(orden)}
                />
            ))}
        </>
    );
};

export default OrdersList;