import React, { createContext, useState } from "react";

export const ViagemContext = createContext();

export function ViagemProvider({ children }) {
  const [viagemTemplate, setViagemTemplate] = useState(null);

  const salvarViagemComoTemplate = (dadosViagem) => {
    console.log("Salvando template da viagem de ida:", dadosViagem);
    setViagemTemplate(dadosViagem);
  };
  
  const limparTemplate = () => {
    setViagemTemplate(null);
  }

  return (
    <ViagemContext.Provider value={{ viagemTemplate, salvarViagemComoTemplate, limparTemplate }}>
      {children}
    </ViagemContext.Provider>
  );
}