// components/AlunosContext.js
import React, { createContext, useState } from 'react';

export const AlunosContext = createContext();

export function AlunosProvider({ children }) {
  const [alunos, setAlunos] = useState([
    { nome: 'Lucas Ramos', ponto: 'Vila São João', status: 'Pago' },
    { nome: 'William F.', ponto: 'São Jorge', status: 'Não Pago' },
    { nome: 'Lucas M.', ponto: 'Posto Sim', status: 'Pago' },
    { nome: 'Fulano', ponto: 'Parada X', status: 'Pago' },
    { nome: 'Beltrano', ponto: 'Parada Y', status: 'Não Pago' },
    { nome: 'Sicrano', ponto: 'Parada Z', status: 'Pago' },
  ]);

  const adicionarAluno = (novoAluno) => {
    setAlunos((prev) => [...prev, novoAluno]);
  };

  return (
    <AlunosContext.Provider value={{ alunos, adicionarAluno }}>
      {children}
    </AlunosContext.Provider>
  );
}
