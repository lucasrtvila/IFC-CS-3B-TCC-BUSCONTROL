// components/UsuariosContext.js
import React, { createContext, useState } from 'react';

export const UsuariosContext = createContext(null);

export function UsuariosProvider({ children }) {
  const [usuario, setUsuario] = useState(null);

  const registrarUsuario = ({nome, email, senha}) => { // a funcao de registrar vai receber o nome o email e a senha
    setUsuario({nome, email, senha});
  };

  return (
    <UsuariosContext.Provider value={{ usuario, registrarUsuario }}>
      {children}
    </UsuariosContext.Provider>
  );
}
