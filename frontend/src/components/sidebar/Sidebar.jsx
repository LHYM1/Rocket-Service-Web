import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import './Sidebar.css';
import { useAuth } from '../../context/AuthContext';
import { useToast } from "../../context/ToastContext";
import { useNotif } from "../../context/NotifContext";

// Badge rojo con número -- FUERA del componente Sidebar a propósito: si estuviera
// definido adentro, cada re-render de Sidebar (el polling lo hace cada 10s) crearía
// una función nueva y React lo remontaría de cero, repitiendo la animación sin parar.
const Badge = ({ count, abierto }) => {
    if (!count || count === 0) return null;
    return (
        <span style={{
            position: "absolute",
            top: abierto ? "50%" : "6px",
            right: abierto ? "12px" : "6px",
            transform: abierto ? "translateY(-50%)" : "none",
            backgroundColor: "#dc3545",
            color: "white",
            borderRadius: "50%",
            width: "18px",
            height: "18px",
            fontSize: "0.65rem",
            fontWeight: "700",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            lineHeight: 1,
            boxShadow: "0 2px 6px rgba(220,53,69,0.5)",
            animation: "popBadge 0.3s cubic-bezier(0.34,1.56,0.64,1) both"
        }}>
            {count}
        </span>
    );
};

// Badge PUNTO -- solo una bolita, sin número ni texto, para avisos tipo
// "hay algo listo" sin necesidad de contar cuántos
const BadgePunto = ({ activo, abierto }) => {
    if (!activo) return null;
    return (
        <span style={{
            position: "absolute",
            top: abierto ? "50%" : "6px",
            right: abierto ? "12px" : "6px",
            transform: abierto ? "translateY(-50%)" : "none",
            backgroundColor: "#28a745",
            borderRadius: "50%",
            width: "10px",
            height: "10px",
            boxShadow: "0 2px 6px rgba(40,167,69,0.5)",
            animation: "popBadge 0.3s cubic-bezier(0.34,1.56,0.64,1) both"
        }}></span>
    );
};

// Badge de TEXTO (no número) -- para avisos como "Reajuste", que no se cuentan
// sino que solo indican "hay algo pendiente de este tipo"
const BadgeTexto = ({ texto, activo, abierto }) => {
    if (!activo) return null;
    return (
        <span style={{
            position: "absolute",
            top: abierto ? "50%" : "6px",
            right: abierto ? "8px" : "2px",
            transform: abierto ? "translateY(-50%)" : "none",
            backgroundColor: "#ffc107",
            color: "#4a3200",
            borderRadius: "10px",
            padding: abierto ? "2px 8px" : "1px 4px",
            fontSize: "0.6rem",
            fontWeight: "700",
            whiteSpace: "nowrap",
            boxShadow: "0 2px 6px rgba(255,193,7,0.5)",
            animation: "popBadge 0.3s cubic-bezier(0.34,1.56,0.64,1) both"
        }}>
            {abierto ? texto : "!"}
        </span>
    );
};

const Sidebar = () => {
    const navigate = useNavigate();
    const { esAdmin, esTecnico, esCliente } = useAuth();
    // Se "congela" el rol UNA SOLA VEZ al montar el componente, en vez de leerlo en
    // vivo en cada render. Así, aunque el localStorage cambie de fondo (como al cerrar
    // sesión), el Sidebar sigue mostrando exactamente lo mismo hasta que de verdad
    // desaparece de la pantalla -- nunca "cambia de módulo" de la nada.
    const [rolCongelado] = useState({ esAdmin, esTecnico, esCliente });

    const [abierto, setAbierto] = useState(true);
    const { mostrarToast } = useToast();
    const { ordenesEsperando, preRevisionesNuevas, pendientesOrdenNuevas, ordenesNuevasParaTecnico, hayReajustePendiente, hayAprobacionPendiente } = useNotif();

    const cerrarSesion = () => {
        mostrarToast("Sesión cerrada correctamente", "info");
        setTimeout(() => {
            localStorage.removeItem("token");
            localStorage.removeItem("rol");
            localStorage.removeItem("userId");
            navigate("/");
        }, 1500);
    };

    return (
        <div className={`menu ${abierto ? "menu-abierto" : "menu-cerrado"}`}>
            <style>{`
                @keyframes popBadge {
                    from { transform: ${abierto ? "translateY(-50%) scale(0)" : "scale(0)"}; }
                    to   { transform: ${abierto ? "translateY(-50%) scale(1)" : "scale(1)"}; }
                }
            `}</style>

            {/* Botón toggle */}
            <button className="menu-toggle" onClick={() => setAbierto(!abierto)}>
                <i className={`fa-solid ${abierto ? "fa-chevron-left" : "fa-chevron-right"}`}></i>
            </button>

            {/* Logo/nombre */}
            <div className="name-company">
                <i className="fa-solid fa-rocket" style={{ color: "#ff8c00", fontSize: "1.5rem" }}></i>
                {abierto && <h2>Rocket Service</h2>}
            </div>

            <div className="menu-list">
                {rolCongelado.esAdmin && (
                    <Link to="/panel/dashboard" className="item" title="Dashboard">
                        <i className="fa-solid fa-house"></i>
                        {abierto && <span>Dashboard</span>}
                    </Link>
                )}
                {rolCongelado.esAdmin && (
                    <Link to="/panel/users" className="item" title="Usuarios">
                        <i className="fa-solid fa-user"></i>
                        {abierto && <span>Usuarios</span>}
                    </Link>
                )}
                {rolCongelado.esAdmin && (
                    <Link to="/panel/roles" className="item" title="Roles">
                        <i className="fa-solid fa-shield"></i>
                        {abierto && <span>Roles</span>}
                    </Link>
                )}

                {/* Órdenes / Seguimiento -- para todos los roles, cada uno ve su propia vista */}
                <Link to="/panel/orders" className="item" title={rolCongelado.esAdmin ? "Ordenes de servicio" : rolCongelado.esCliente ? "Seguimiento de mi Orden" : "Mis Órdenes"}
                    style={{ position: "relative" }}>
                    <i className="fa-solid fa-briefcase"></i>
                    {abierto && <span>{rolCongelado.esAdmin ? "Ordenes de servicio" : rolCongelado.esCliente ? "Seguimiento" : "Mis Órdenes"}</span>}
                    {rolCongelado.esTecnico && hayReajustePendiente && (
                        <BadgeTexto texto="Reajuste" activo={true} abierto={abierto} />
                    )}
                    {rolCongelado.esTecnico && !hayReajustePendiente && hayAprobacionPendiente && (
                        <BadgePunto activo={true} abierto={abierto} />
                    )}
                    {rolCongelado.esTecnico && !hayReajustePendiente && !hayAprobacionPendiente && (
                        <Badge count={ordenesNuevasParaTecnico} abierto={abierto} />
                    )}
                </Link>

                {rolCongelado.esAdmin && (
                    <Link to="/panel/est-ord" className="item" title="Estado orden">
                        <i className="fa-solid fa-business-time"></i>
                        {abierto && <span>Estado orden</span>}
                    </Link>
                )}
                {rolCongelado.esAdmin && (
                    <Link to="/panel/regist-act" className="item" title="Registro actividad">
                        <i className="fa-solid fa-calendar"></i>
                        {abierto && <span>Registro actividad</span>}
                    </Link>
                )}
                {rolCongelado.esAdmin && (
                    <Link to="/panel/insumos" className="item" title="Insumos">
                        <i className="fa-solid fa-box"></i>
                        {abierto && <span>Insumos</span>}
                    </Link>
                )}
                {rolCongelado.esAdmin && (
                    <Link to="/panel/categoria" className="item" title="Categoria insumos">
                        <i className="fa-solid fa-layer-group"></i>
                        {abierto && <span>Categoria insumos</span>}
                    </Link>
                )}
                {rolCongelado.esAdmin && (
                    <Link to="/panel/unidad" className="item" title="Unidad medida">
                        <i className="fa-solid fa-tags"></i>
                        {abierto && <span>Unidad medida</span>}
                    </Link>
                )}

                {/* Imagenes -- solo Admin y Técnico (el Cliente no gestiona evidencias) */}
                {(rolCongelado.esAdmin || rolCongelado.esTecnico) && (
                    <Link to="/panel/imagenes-danos" className="item" title="Imagenes"
                        style={{ position: "relative" }}>
                        <i className="fa-solid fa-photo-film"></i>
                        {abierto && <span>Imagenes</span>}
                        {rolCongelado.esTecnico && <Badge count={ordenesEsperando} abierto={abierto} />}
                    </Link>
                )}

                {/* Insumos usados -- solo Admin y Técnico */}
                {(rolCongelado.esAdmin || rolCongelado.esTecnico) && (
                    <Link to="/panel/insumos-usados" className="item" title="Insumos usados en servicio"
                        style={{ position: "relative" }}>
                        <i className="fa-solid fa-boxes-stacked"></i>
                        {abierto && <span>Insumos usados</span>}
                        {rolCongelado.esTecnico && <Badge count={ordenesEsperando} abierto={abierto} />}
                    </Link>
                )}

                {/* Tipo servicio -- solo Admin y Técnico */}
                {(rolCongelado.esAdmin || rolCongelado.esTecnico) && (
                    <Link to="/panel/type-services" className="item" title="Tipo servicio">
                        <i className="fa-solid fa-screwdriver-wrench"></i>
                        {abierto && <span>Tipo servicio</span>}
                    </Link>
                )}

                {rolCongelado.esAdmin && (
                    <Link to="/panel/moto" className="item" title="Motocicleta">
                        <i className="fa-solid fa-motorcycle"></i>
                        {abierto && <span>Motocicleta</span>}
                    </Link>
                )}
                {rolCongelado.esAdmin && (
                    <Link to="/panel/modelo" className="item" title="Modelo">
                        <i className="fa-solid fa-motorcycle"></i>
                        {abierto && <span>Modelo</span>}
                    </Link>
                )}

                {/* Pre-revisiones -- solo Admin y Técnico (el Cliente no interviene en esta parte) */}
                {(rolCongelado.esAdmin || rolCongelado.esTecnico) && (
                    <Link to="/panel/pre-revision" className="item" title={rolCongelado.esAdmin ? "Pre-revisiones" : "Mis Pre-revisiones"}
                        style={{ position: "relative" }}>
                        <i className="fa-solid fa-magnifying-glass"></i>
                        {abierto && <span>{rolCongelado.esAdmin ? "Pre-revisiones" : "Mis Pre-revisiones"}</span>}
                        {rolCongelado.esTecnico && <Badge count={preRevisionesNuevas} abierto={abierto} />}
                        {rolCongelado.esAdmin && <Badge count={pendientesOrdenNuevas} abierto={abierto} />}
                    </Link>
                )}

                <button className="item btn-cerrar-sesion" onClick={cerrarSesion} title="Cerrar sesión">
                    <i className="fa-solid fa-right-from-bracket"></i>
                    {abierto && <span>Cerrar sesión</span>}
                </button>
            </div>
        </div>
    );
};

export default Sidebar;