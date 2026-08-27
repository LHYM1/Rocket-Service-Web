import React, { useRef } from "react";

const TOKEN_LENGTH = 6; // Tamaño del token

function TokenInput({ value, onChange, error }) {
  const inputRefs = useRef([]);

  // Divide el string actual en un array de caracteres
  const tokenArray = Array.from({ length: TOKEN_LENGTH }, (_, i) => value[i] || "");

  const handleInputChange = (e, index) => {
    const val = e.target.value.toUpperCase(); // Forzar mayúsculas
    if (!val) return;

    const char = val.charAt(val.length - 1); // Tomar solo el último caracter digitado
    const newArray = [...tokenArray];
    newArray[index] = char;
    
    const newToken = newArray.join("");
    onChange(newToken);

    // Mover foco automáticamente a la siguiente casilla
    if (index < TOKEN_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (e, index) => {
    // Retroceso (Backspace): Borrar y mover foco hacia atrás
    if (e.key === "Backspace") {
      if (!tokenArray[index] && index > 0) {
        inputRefs.current[index - 1]?.focus();
      }
      const newArray = [...tokenArray];
      newArray[index] = "";
      onChange(newArray.join(""));
    }
    // Flecha izquierda
    else if (e.key === "ArrowLeft" && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
    // Flecha derecha
    else if (e.key === "ArrowRight" && index < TOKEN_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").trim().toUpperCase().replace(/[^A-Z0-9]/g, "");
    if (!pastedData) return;

    const sliced = pastedData.slice(0, TOKEN_LENGTH);
    onChange(sliced);

    // Mover el foco al último elemento pegado
    const nextIndex = Math.min(sliced.length, TOKEN_LENGTH - 1);
    inputRefs.current[nextIndex]?.focus();
  };

  return (
    <div className="token-otp-wrapper">
      <div className="token-otp-container">
        {tokenArray.map((char, index) => (
          <input
            key={index}
            ref={(el) => (inputRefs.current[index] = el)}
            type="text"
            inputMode="text"
            autoCapitalize="characters"
            maxLength={1}
            value={char}
            onChange={(e) => handleInputChange(e, index)}
            onKeyDown={(e) => handleKeyDown(e, index)}
            onPaste={handlePaste}
            className={`token-otp-box ${error ? "token-otp-error" : ""} ${char ? "token-otp-filled" : ""}`}
          />
        ))}
      </div>
    </div>
  );
}

export default TokenInput;