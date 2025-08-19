import { createContext, useState, useEffect,} from "react";

import {
  initDB,
  getVeiculos,
  addVeiculo,
  updateVeiculo,
  deleteVeiculo,
} from "../database/database";

import { Alert } from "react-native";

export const VeiculosContext = createContext();

export function VeiculosProvider({ children }) {
  const [veiculos, setVeiculos] = useState([]);
  const [dbPronto, setDbPronto] = useState(false);

useEffect(() => {
  (async () => {
    await initDB();
    setDbPronto(true);
    await carregarVeiculos();
  })();
}, []);

const carregarVeiculos = async () => {
  try {
    const data = await getVeiculos();
    setVeiculos(data);
  } catch (error) {
    console.log('Erro ao carregar veículos:', error);
  }
};

  const adicionarVeiculo = async (nome, status) => {
    if (!dbPronto) 
      return;
    if (!nome.trim()) return; // se não tiver o nome, nao funciona
    try { await addVeiculo(nome.trim(), status);
    await carregarVeiculos();} catch (e) {
    console.log("Erro ao adicionar veículo:", e);
  } //atualiza o usestate com a array que recebe ...veiculos(o que ja tava la) e o novo nome e status.
  };

  const editarVeiculo = async (index, novoNome, novoStatus) => {
    if (!dbPronto) return;
    const veiculo = veiculos[index];
    if (!veiculo) return;
    await updateVeiculo(
      veiculo.id,
      novoNome.trim(),
      novoStatus,
    );
    await carregarVeiculos(); // atualiza no banco o veiculo e altera a lista
  };

  const removerVeiculo = (index) => {
    if (!dbPronto) return;
    const veiculo = veiculos[index];
    if (!veiculo) return;
    Alert.alert("Confirmar remoção", "Deseja realmente remover este veiculo?", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Remover",
        style: "destructive",
        onPress: () => {
          (async () => {
            await deleteVeiculo(veiculo.id,);
            await carregarVeiculos(); // remove o veiculo do banco e atualiza a lista
          })();
        },
      },
    ]);
  };

  return (
    <VeiculosContext.Provider value={{ veiculos, adicionarVeiculo, editarVeiculo, removerVeiculo }}>
      {children}
    </VeiculosContext.Provider> //tudo que estiver dentro do provider vai poder usar a variavel veiculos e as funcoes pra adicionar e editar eles
  );
}
