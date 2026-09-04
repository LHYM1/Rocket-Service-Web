import { useState, useEffect } from 'react';
import axios from '../../axiosConfig';
import Card from '../../components/card/Card';
import TechnicianCard from '../../components/card/technicianCard/technicianCard';
import { useToast } from '../../context/ToastContext';
import './Dashboard.css';

const Dashboard = () => {
    const { mostrarToast } = useToast();


    // ESTADOS DEL COMPONENTE
  

    const [ordenes, setOrdenes] = useState([]);
    const [tecnicos, setTecnicos] = useState([]);

    const [stats, setStats] = useState({
        totales: 0,
        pendientes: 0,
        finalizadas: 0
    });

    // Card seleccionada por defecto
    const [filtro, setFiltro] = useState('pendientes');

    const [cargando, setCargando] = useState(true);


  
    // CARGAR DATOS DEL DASHBOARD
    

    const cargarDatos = async () => {
        try {
            setCargando(true);

            const [
                resOrdenes,
                resStats,
                resTecnicos
            ] = await Promise.all([

                // Listado de órdenes con detalle
                axios.get(
                    'http://localhost:4000/api/ordenes_de_servicio/detalle'
                ),

                // Estadísticas para las cards
                axios.get(
                    'http://localhost:4000/api/ordenes_de_servicio/estadisticas'
                ),

                // Disponibilidad de técnicos
                axios.get(
                    'http://localhost:4000/api/usuarios/tecnicos-disponibilidad'
                )

            ]);


            // Guardar órdenes
            setOrdenes(resOrdenes.data);


            // Guardar estadísticas
            setStats(resStats.data);


            // Guardar técnicos
            setTecnicos(resTecnicos.data);

        } catch (error) {

            console.error(
                'Error al cargar los datos del dashboard:',
                error
            );

            mostrarToast(
                'Error al cargar los datos del dashboard',
                'error'
            );

        } finally {

            setCargando(false);

        }
    };


    // CARGAR INFORMACIÓN AL ENTRAR AL DASHBOARD
    

    useEffect(() => {
        cargarDatos();
    }, []);


    
    // FILTRAR ÓRDENES SEGÚN LA CARD SELECCIONADA

    const ordenesFiltradas = ordenes.filter((orden) => {

        // Mostrar todas las órdenes
        if (filtro === 'totales') {
            return true;
        }


        // Mostrar únicamente las finalizadas
        if (filtro === 'finalizadas') {
            return orden.estado === 'FINALIZADA';
        }


        // Mostrar órdenes pendientes
        if (filtro === 'pendientes') {
            return (
                orden.estado !== 'FINALIZADA' &&
                orden.estado !== 'CANCELADA'
            );
        }


        return true;

    });



    // COLOR DEL BADGE SEGÚN EL ESTADO
    

    const badgeColor = (estado) => {

        switch (estado) {

            case 'FINALIZADA':
                return '#22c55e';

            case 'CANCELADA':
                return '#ef4444';

            case 'ASIGNADA':
                return '#f59e0b';

            case 'EN PROCESO':
                return '#3b82f6';

            case 'EN REVISIÓN':
                return '#8b5cf6';

            case 'EN ESPERA':
                return '#f97316';

            case 'ESPERANDO REPUESTOS':
                return '#ec4899';

            case 'TÉCNICO EN RECESO':
                return '#6b7280';

            default:
                return '#9ca3af';

        }

    };

    const obtenerTitulo = () => {

        switch (filtro) {

            case 'totales':
                return 'Todas las órdenes';

            case 'pendientes':
                return 'Órdenes pendientes';

            case 'finalizadas':
                return 'Órdenes finalizadas';

            default:
                return 'Listado de órdenes';

        }

    };



    // FORMATEAR FECHA
    
    const formatearFecha = (fecha) => {

        if (!fecha) {
            return 'Sin fecha';
        }

        return new Date(fecha).toLocaleDateString(
            'es-CO'
        );

    };



    // RENDER DEL COMPONENTE
    return (

        <div className="dashboard-page">


            {/* 
                CARDS DE ESTADÍSTICAS
            */}

            <div className="dash-container">


                {/* ÓRDENES TOTALES */}

                <Card
                    title="Ordenes totales"

                    icon={
                        <img
                            alt="ordenTotal"
                            src="https://res.cloudinary.com/dtmmoziql/image/upload/v1768944919/clipboard-svgrepo-com_1_pwafgx.svg"
                        />
                    }

                    onClick={() => setFiltro('totales')}

                    active={filtro === 'totales'}
                >

                    <span>
                        {stats.totales || 0}
                    </span>

                </Card>



                {/* ÓRDENES PENDIENTES */}

                <Card
                    title="Ordenes pendientes"

                    icon={
                        <img
                            alt="ordenPend"
                            src="https://res.cloudinary.com/dtmmoziql/image/upload/v1768957469/clipboard-list-svgrepo-com_vgnp90.svg"
                        />
                    }

                    onClick={() => setFiltro('pendientes')}

                    active={filtro === 'pendientes'}
                >

                    <span>
                        {stats.pendientes || 0}
                    </span>

                </Card>



                {/* ÓRDENES FINALIZADAS */}

                <Card
                    title="Ordenes finalizadas"

                    icon={
                        <img
                            alt="ordenFin"
                            src="https://res.cloudinary.com/dtmmoziql/image/upload/v1768957848/clipboard-list-svgrepo-com_1_ywdaov.svg"
                        />
                    }

                    onClick={() => setFiltro('finalizadas')}

                    active={filtro === 'finalizadas'}
                >

                    <span>
                        {stats.finalizadas || 0}
                    </span>

                </Card>


            </div>



            {/* =====================================
                SECCIÓN PRINCIPAL
            ===================================== */}

            <div className="main-section">


                {/* 
                    LISTADO DE ÓRDENES
                */}

                <div className="ordenes-container">


                    {/* TÍTULO */}

                    <h3 className="ordenes-title">

                        {obtenerTitulo()}

                    </h3>



                    {/* LISTADO */}

                    <div className="ordenes-list">


                        {/* CARGANDO */}

                        {cargando && (
                            <p>
                                Cargando órdenes...
                            </p>
                        )}



                        {/* NO HAY ÓRDENES */}

                        {!cargando &&
                            ordenesFiltradas.length === 0 && (

                                <p
                                    style={{
                                        color: '#9ca3af'
                                    }}
                                >
                                    No hay órdenes en esta categoría.
                                </p>

                            )
                        }



                        {/* LISTADO DE ÓRDENES */}

                        {!cargando &&

                            ordenesFiltradas.map((orden) => (

                                <div
                                    key={orden.id_orden}

                                    style={{
                                        border: '1px solid #e5e7eb',
                                        borderRadius: '10px',
                                        padding: '14px 16px',
                                        backgroundColor: '#fff'
                                    }}
                                >


                                    {/* CÓDIGO Y ESTADO */}

                                    <div
                                        style={{
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'center'
                                        }}
                                    >

                                        <strong>
                                            {orden.codigo}
                                        </strong>


                                        <span
                                            style={{
                                                backgroundColor: badgeColor(
                                                    orden.estado
                                                ),
                                                color: '#fff',
                                                fontSize: '12px',
                                                padding: '3px 10px',
                                                borderRadius: '999px'
                                            }}
                                        >
                                            {orden.estado}

                                        </span>

                                    </div>


                                    {/* CLIENTE */}

                                    <p
                                        style={{
                                            margin: '6px 0 2px'
                                        }}
                                    >

                                        <strong>
                                            Cliente:
                                        </strong>

                                        {' '}

                                        {orden.cliente}

                                    </p>



                                    {/* SERVICIO */}

                                    <p
                                        style={{
                                            margin: '2px 0'
                                        }}
                                    >

                                        <strong>
                                            Servicio:
                                        </strong>

                                        {' '}

                                        {orden.servicio}

                                    </p>



                                    {/* FECHA */}

                                    <small
                                        style={{
                                            color: '#9ca3af'
                                        }}
                                    >

                                        Fecha inicio:

                                        {' '}

                                        {formatearFecha(
                                            orden.fechaInicio
                                        )}

                                    </small>


                                </div>

                            ))

                        }


                    </div>


                </div>



                {/* =================================
                    DISPONIBILIDAD DE TÉCNICOS
                ================================= */}

                <div className="tecnicos-container">


                    <h3 className="tecnicos-title">

                        <img
                            className="img-tec"
                            alt="imgCardTecnicos"
                            src="https://res.cloudinary.com/dtmmoziql/image/upload/v1769342546/users-svgrepo-com_twccwo.svg"
                        />

                        Disponibilidad técnicos

                    </h3>



                    <div className="tecnicos-list">


                        {tecnicos.map((tecnico) => (

                            <TechnicianCard
                                key={tecnico.id}
                                tecnico={tecnico}
                                asignar={() => {}}
                            />

                        ))}


                    </div>


                </div>


            </div>


        </div>

    );

};

export default Dashboard;