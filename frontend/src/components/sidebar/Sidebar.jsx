import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import './Sidebar.css';
import { useAuth } from '../../context/AuthContext';
import { useToast } from "../../context/ToastContext";
import { useNotif } from "../../context/NotifContext";

const Sidebar = () => {
    const navigate = useNavigate();
    const { esAdmin, esTecnico, esCliente } = useAuth();
    const [abierto, setAbierto] = useState(true);
    const { mostrarToast } = useToast();
    const { ordenesEsperando } = useNotif();

    const cerrarSesion = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("rol");
        localStorage.removeItem("userId");
        mostrarToast("Sesión cerrada correctamente", "info");
        setTimeout(() => navigate("/"), 1500);
    };

    // Badge rojo con número
    const Badge = ({ count }) => {
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
                {esAdmin && (
                    <Link to="/panel/dashboard" className="item" title="Dashboard">
                        <i className="fa-solid fa-house"></i>
                        {abierto && <span>Dashboard</span>}
                    </Link>
                )}
                {esAdmin && (
                    <Link to="/panel/users" className="item" title="Usuarios">
                        <i className="fa-solid fa-user"></i>
                        {abierto && <span>Usuarios</span>}
                    </Link>
                )}
                {esAdmin && (
                    <Link to="/panel/roles" className="item" title="Roles">
                        <i className="fa-solid fa-shield"></i>
                        {abierto && <span>Roles</span>}
                    </Link>
                )}

                {/* Órdenes / Seguimiento -- para todos los roles, cada uno ve su propia vista */}
                <Link to="/panel/orders" className="item" title={esAdmin ? "Ordenes de servicio" : esCliente ? "Seguimiento de mi Orden" : "Mis Órdenes"}>
                    <i className="fa-solid fa-briefcase"></i>
                    {abierto && <span>{esAdmin ? "Ordenes de servicio" : esCliente ? "Seguimiento" : "Mis Órdenes"}</span>}
                </Link>

                {esAdmin && (
                    <Link to="/panel/est-ord" className="item" title="Estado orden">
                        <i className="fa-solid fa-business-time"></i>
                        {abierto && <span>Estado orden</span>}
                    </Link>
                )}
                {esAdmin && (
                    <Link to="/panel/regist-act" className="item" title="Registro actividad">
                        <i className="fa-solid fa-calendar"></i>
                        {abierto && <span>Registro actividad</span>}
                    </Link>
                )}
                {esAdmin && (
                    <Link to="/panel/insumos" className="item" title="Insumos">
                        <i className="fa-solid fa-box"></i>
                        {abierto && <span>Insumos</span>}
                    </Link>
                )}
                {esAdmin && (
                    <Link to="/panel/categoria" className="item" title="Categoria insumos">
                        <i className="fa-solid fa-layer-group"></i>
                        {abierto && <span>Categoria insumos</span>}
                    </Link>
                )}
                {esAdmin && (
                    <Link to="/panel/unidad" className="item" title="Unidad medida">
                        <i className="fa-solid fa-tags"></i>
                        {abierto && <span>Unidad medida</span>}
                    </Link>
                )}

                {/* Imagenes -- solo Admin y Técnico (el Cliente no gestiona evidencias) */}
                {(esAdmin || esTecnico) && (
                    <Link to="/panel/imagenes-danos" className="item" title="Imagenes"
                        style={{ position: "relative" }}>
                        <i className="fa-solid fa-photo-film"></i>
                        {abierto && <span>Imagenes</span>}
                        {esTecnico && <Badge count={ordenesEsperando} />}
                    </Link>
                )}

                {/* Insumos usados -- solo Admin y Técnico */}
                {(esAdmin || esTecnico) && (
                    <Link to="/panel/insumos-usados" className="item" title="Insumos usados en servicio"
                        style={{ position: "relative" }}>
                        <i className="fa-solid fa-boxes-stacked"></i>
                        {abierto && <span>Insumos usados</span>}
                        {esTecnico && <Badge count={ordenesEsperando} />}
                    </Link>
                )}

                {/* Tipo servicio -- solo Admin y Técnico */}
                {(esAdmin || esTecnico) && (
                    <Link to="/panel/type-services" className="item" title="Tipo servicio">
                        <i className="fa-solid fa-screwdriver-wrench"></i>
                        {abierto && <span>Tipo servicio</span>}
                    </Link>
                )}

                {esAdmin && (
                    <Link to="/panel/moto" className="item" title="Motocicleta">
                        <i className="fa-solid fa-motorcycle"></i>
                        {abierto && <span>Motocicleta</span>}
                    </Link>
                )}
                {esAdmin && (
                    <Link to="/panel/modelo" className="item" title="Modelo">
                        <i className="fa-solid fa-motorcycle"></i>
                        {abierto && <span>Modelo</span>}
                    </Link>
                )}

                {/* Pre-revisiones -- solo Admin y Técnico (el Cliente no interviene en esta parte) */}
                {(esAdmin || esTecnico) && (
                    <Link to="/panel/pre-revision" className="item" title={esAdmin ? "Pre-revisiones" : "Mis Pre-revisiones"}>
                        <i className="fa-solid fa-magnifying-glass"></i>
                        {abierto && <span>{esAdmin ? "Pre-revisiones" : "Mis Pre-revisiones"}</span>}
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