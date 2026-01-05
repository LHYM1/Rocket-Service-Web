import { FcGoogle } from "react-icons/fc";

const GoogleButton = ({ onClick }) => {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center justify-center gap-2 border border-gray-300 rounded-lg py-2 hover:bg-gray-100 transition"
    >
      <FcGoogle size={22} />
      <span>Continuar con Google</span>
    </button>
  );
};

export default GoogleButton;