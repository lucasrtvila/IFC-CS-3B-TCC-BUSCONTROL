import { createContext, useState } from 'react';

export const VeiculosContext = createContext();

export function VeiculosProvider({ children }) {
  const [veiculos, setVeiculos] = useState([]);

  const adicionarVeiculo = (nome, status) => {
    if (!nome.trim()) return;
    setVeiculos([...veiculos, { nome: nome.trim(), status }]);
  };

  const editarVeiculo = (index, novoNome, novoStatus) => {
    const atualizados = [...veiculos];
    atualizados[index] = { nome: novoNome.trim(), status: novoStatus };
    setVeiculos(atualizados);
  };

  return (
    <VeiculosContext.Provider value={{ veiculos, adicionarVeiculo, editarVeiculo }}>
      {children}
    </VeiculosContext.Provider>
  );
}