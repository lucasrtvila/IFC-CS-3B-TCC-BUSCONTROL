import React, { createContext, useState } from "react";

export const ViagemContext = createContext();

export function ViagemProvider({ children }) {
  const [viagemTemplate, setViagemTemplate] = useState(null);
  const [viagemDeVoltaPendente, setViagemDeVoltaPendente] = useState(false);

  const salvarViagemComoTemplate = (dadosViagem) => {
    console.log("Salvando template da viagem de ida:", dadosViagem);
    setViagemTemplate(dadosViagem);
    if (dadosViagem.tipoViagem === 'ida_e_volta') {
      setViagemDeVoltaPendente(true);
    }
  };
  
  const limparTemplate = () => {
    setViagemTemplate(null);
    setViagemDeVoltaPendente(false);
  };

  return (
    <ViagemContext.Provider 
      value={{ 
        viagemTemplate, 
        salvarViagemComoTemplate, 
        limparTemplate,
        viagemDeVoltaPendente 
      }}
    >
      {children}
    </ViagemContext.Provider>
  );
}