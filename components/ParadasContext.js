import React, { createContext, useState, useEffect, useContext } from "react";
import { Alert } from "react-native";
import {
  getParadas,
  addParada,
  updateParada,
  deleteParada,
  getAlunos, // Esta importação é usada pela função carregarDados local
  updateAluno // Esta importação é usada por adicionarParadaAAluno
} from "../database/database";
// Importa o Contexto "Pai"
import { AlunosContext } from "./AlunosContext";

export const ParadasContext = createContext();

export function ParadasProvider({ children }) {
  const [paradas, setParadas] = useState([]); // Lista de paradas para a tela Rota (com numAlunos)
  const [alunos, setAlunos] = useState([]); // Lista de alunos local (usada por adicionarParadaAAluno)

  // 1. PEGA AS FUNÇÕES DO CONTEXTO PAI (AlunosContext)
  // Limpamos a chamada duplicada que você tinha
  const { 
    // A lista de alunos VIVA do AlunosContext (para adicionarParadaAAluno)
    alunos: alunosDoAlunosContext, 
    // A função de recarregar paradas do PAI (para os dropdowns)
    carregarParadas: carregarParadasDoAlunosContext, 
    // A função que o PAI expôs para o Filho se "registrar"
    setParadasReloadFunc                     
  } = useContext(AlunosContext);

  // Esta é a função que recalcula o numAlunos para a tela Rota
  const carregarDados = async () => {
    try {
      console.log("🔄 ParadasContext: Recarregando contagem de alunos...");
      const paradasData = await getParadas(); // Recalcula numAlunos
      const alunosData = await getAlunos(); // Atualiza a lista de alunos local
      setParadas(paradasData);
      setAlunos(alunosData);
    } catch (error) {
      console.log("Erro ao carregar dados (ParadasContext):", error);
    }
  };

  // Carrega os dados (contagem) na primeira vez
  useEffect(() => {
    carregarDados();
  }, []);

  // 2. REGISTRA A FUNÇÃO DE RECARGA NO PAI
  // Este useEffect "entrega" a função carregarDados para o AlunosContext
  useEffect(() => {
    if (setParadasReloadFunc) {
      // Diz ao Pai: "Ei, quando você precisar que eu recarregue a contagem, chame esta função"
      setParadasReloadFunc(() => carregarDados); 
    }
    return () => {
      if (setParadasReloadFunc) {
        setParadasReloadFunc(null); // Limpa o registro
      }
    };
  }, [setParadasReloadFunc]); // O React garante que a função do Pai é estável

  
  // 3. ATUALIZA AS FUNÇÕES DE CRUD (Adicionar, Editar, Remover)

  const adicionarParada = async (nome, horario) => {
    if (!nome.trim() || !horario.trim()) {
      Alert.alert("Erro", "Preencha o nome e o horário da parada.");
      return;
    }
    try {
      await addParada(nome.trim(), horario.trim());
      await carregarDados(); // Recarrega a si mesmo (contagem da RotaScreen)
      // Avisa o Pai para recarregar (dropdowns da AlunosScreen)
      if (carregarParadasDoAlunosContext) {
        await carregarParadasDoAlunosContext();
      }
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
      await carregarDados(); // Recarrega a si mesmo
      if (carregarParadasDoAlunosContext) {
        await carregarParadasDoAlunosContext(); // Avisa o Pai
      }
      // Corrigido: A lógica de fechar o modal foi movida para RotaScreen.js
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
            await carregarDados(); // Recarrega a si mesmo
            if (carregarParadasDoAlunosContext) {
              await carregarParadasDoAlunosContext(); // Avisa o Pai
            }
          } catch (e) {
            console.log("Erro ao remover parada:", e);
          }
        },
      },
    ]);
  };

  // 4. CORRIGE A FUNÇÃO DE ALUNO (usando a lista do Pai)
  const adicionarParadaAAluno = async (alunoId, paradaId, horario) => {
    try {
      // Usa a lista de alunos do AlunosContext (que é a mais atualizada)
      const aluno = alunosDoAlunosContext.find(a => a.id === alunoId);
      
    if (aluno) {
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
        await carregarDados(); // Recarrega a contagem (numAlunos)
      }
    } catch (e) {
      console.log("Erro ao adicionar parada ao aluno:", e);
    }
  };

  return (
    <ParadasContext.Provider
      value={{ paradas, alunos, adicionarParada, editarParada, removerParada, adicionarParadaAAluno, carregarDados}}
    >
      {children}
    </ParadasContext.Provider>
  );
}