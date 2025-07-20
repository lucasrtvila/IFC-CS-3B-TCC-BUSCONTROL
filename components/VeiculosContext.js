import { createContext, useState } from 'react';

export const VeiculosContext = createContext();

export function VeiculosProvider({ children }) {
  const [veiculos, setVeiculos] = useState([]);

  const adicionarVeiculo = (nome, status) => { // a função adicionar veiculo vai trabalhar com os parametros nome e status recebidos na sua chamada
    if (!nome.trim()) return;
    setVeiculos([...veiculos, { nome: nome.trim(), status }]);
  };

  const editarVeiculo = (index, novoNome, novoStatus) => { // a funcao vai pedir o index pra achar o veiculo a ser editado, e pedir pra passar o novo nome e status
    const atualizados = [...veiculos]; // cria uma nova array atualizados com o que tiver na array veiculos
    atualizados[index] = { nome: novoNome.trim(), status: novoStatus }; //altera só no
    setVeiculos(atualizados);
  };

  return (
    <VeiculosContext.Provider value={{ veiculos, adicionarVeiculo, editarVeiculo }}> 
      {children}
    </VeiculosContext.Provider> //tudo que estiver dentro do provider vai poder usar a variavel veiculos e as funcoes pra adicionar e editar eles
  );
}