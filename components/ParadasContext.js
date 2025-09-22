import React, { createContext, useState, useEffect } from "react";
import { Alert } from "react-native";
import {
  getParadas,
  addParada,
  updateParada,
  deleteParada,
  getAlunos,
  updateAluno
} from "../database/database";

export const ParadasContext = createContext();

export function ParadasProvider({ children }) {
  const [paradas, setParadas] = useState([]);
  const [alunos, setAlunos] = useState([]);

  useEffect(() => {
    carregarDados();
  }, []);

  const carregarDados = async () => {
    try {
      const paradasData = await getParadas();
      const alunosData = await getAlunos();
      setParadas(paradasData);
      setAlunos(alunosData);
    } catch (error) {
      console.log("Erro ao carregar dados:", error);
    }
  };

  const adicionarParada = async (nome, horario) => {
    if (!nome.trim() || !horario.trim()) {
      Alert.alert("Erro", "Preencha o nome e o horário da parada.");
      return;
    }
    try {
      await addParada(nome.trim(), horario.trim());
      await carregarDados();
    } catch (e) {
      console.log("Erro ao adicionar parada:", e);
    }
  };

  const editarParada = async (id, novoNome, novoHorario) => {
    if (!novoNome.trim() || !novoHorario.trim()) {
      Alert.alert("Erro", "Preencha o nome e o horário da parada.");
      return;
    }
    try {
      await updateParada(id, novoNome.trim(), novoHorario.trim());
      await carregarDados();
      setModalEditarParadaVisivel(false);
      setParadaEditando(null);
      setNovoNome("");
      setNovoHorario("");
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
            await carregarDados();
          } catch (e) {
            console.log("Erro ao remover parada:", e);
          }
        },
      },
    ]);
  };

  const adicionarParadaAAluno = async (alunoId, paradaId, horario) => {
    try {
      // Encontre o aluno e a parada para obter as informações necessárias
      const aluno = alunos.find(a => a.id === alunoId);
      const parada = paradas.find(p => p.id === paradaId);
      
      if (aluno && parada) {
        await updateAluno(
          aluno.id,
          aluno.nome,
          aluno.cpf,
          aluno.ultimoPagamento,
          aluno.status,
          aluno.telefone,
          paradaId,
          horario
        );
        await carregarDados();
      }
    } catch (e) {
      console.log("Erro ao adicionar parada ao aluno:", e);
    }
  };

  return (
    <ParadasContext.Provider
      value={{ paradas, alunos, adicionarParada, editarParada, removerParada, adicionarParadaAAluno, carregarDados }}
    >
      {children}
    </ParadasContext.Provider>
  );
}