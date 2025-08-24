import React, { createContext, useState, useEffect } from "react";
import { Alert } from "react-native";
import {
  getParadas,
  addParada,
  updateParada,
  deleteParada,
} from "../database/database";

export const ParadasContext = createContext();

export function ParadasProvider({ children }) {
  const [paradas, setParadas] = useState([]);

  useEffect(() => {
    carregarParadas();
  }, []);

  const carregarParadas = async () => {
    try {
      const data = await getParadas();
      setParadas(data);
    } catch (error) {
      console.log("Erro ao carregar paradas:", error);
    }
  };

  const adicionarParada = async (nome, horario) => {
    if (!nome.trim() || !horario.trim()) {
      Alert.alert("Erro", "Preencha o nome e o horário da parada.");
      return;
    }
    try {
      await addParada(nome.trim(), horario.trim());
      await carregarParadas();
    } catch (e) {
      console.log("Erro ao adicionar parada:", e);
    }
  };

  const editarParada = async (id, novoNome, novoHorario) => {
    try {
      await updateParada(id, novoNome.trim(), novoHorario.trim());
      await carregarParadas();
    } catch (e) {
      console.log("Erro ao editar parada:", e);
    }
  };

  const removerParada = (id) => {
    Alert.alert("Confirmar remoção", "Deseja realmente remover esta parada?", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Remover",
        style: "destructive",
        onPress: async () => {
          try {
            await deleteParada(id);
            await carregarParadas();
          } catch (e) {
            console.log("Erro ao remover parada:", e);
          }
        },
      },
    ]);
  };

  return (
    <ParadasContext.Provider
      value={{ paradas, adicionarParada, editarParada, removerParada }}
    >
      {children}
    </ParadasContext.Provider>
  );
}