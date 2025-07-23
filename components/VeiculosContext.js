import { createContext, useState } from "react";
import { Alert } from "react-native";
export const VeiculosContext = createContext();

export function VeiculosProvider({ children }) {
  const [veiculos, setVeiculos] = useState([]);

  const adicionarVeiculo = (nome, status) => {
    // a função adicionar veiculo vai trabalhar com os parametros nome e status recebidos na sua chamada
    if (!nome.trim()) return; // se não tiver o nome, nao funciona
    setVeiculos([...veiculos, { nome: nome.trim(), status }]); //atualiza o usestate com a array que recebe ...veiculos(o que ja tava la) e o novo nome e status.
  };

  const editarVeiculo = (index, novoNome, novoStatus) => {
    // a funcao vai pedir o index pra achar o veiculo a ser editado, e pedir pra passar o novo nome e status
    const atualizados = [...veiculos]; // cria uma nova array atualizados com o que tiver na array veiculos
    atualizados[index] = { nome: novoNome.trim(), status: novoStatus }; //altera só no index passado ali em cima o nome e o status
    setVeiculos(atualizados); //o usestate vai receber a array atualizados com os veiculos antigos + o atualizado
  };

  const removerVeiculo = (index) => {
    Alert.alert("Confirmar remoção", "Deseja realmente remover este veiculo?", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Remover",
        style: "destructive",
        onPress: () => {
          setVeiculos((prev) => prev.filter((_, i) => i !== index));
        },
      },
    ]);
  };

  return (
    <VeiculosContext.Provider
      value={{ veiculos, adicionarVeiculo, editarVeiculo, removerVeiculo }}
    >
      {children}
    </VeiculosContext.Provider> //tudo que estiver dentro do provider vai poder usar a variavel veiculos e as funcoes pra adicionar e editar eles
  );
}
