import React, { createContext, useState } from 'react';

export const LembretesContext = createContext();

export const LembretesProvider = ({ children }) => {
  const [lembretes, setLembretes] = useState([
    { id: '1', titulo: 'Troca de óleo', data: '10/06/2025' },
    { id: '2', titulo: 'Revisão anual', data: '20/07/2025' },
    { id: '3', titulo: 'Renovação seguro', data: '01/08/2025' },
  ]);

  return (
    <LembretesContext.Provider value={{ lembretes, setLembretes }}>
      {children}
    </LembretesContext.Provider>
  );
};
