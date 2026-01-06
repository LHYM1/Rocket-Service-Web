import { GoogleLogin } from "@react-oauth/google";

const GoogleButton = () => {
  return (
    <GoogleLogin
      onSuccess={(credentialResponse) => {
        console.log(credentialResponse);
      }}
      onError={() => {
        console.log("Error al iniciar sesión");
      }}
    />
  );
};

export default GoogleButton;