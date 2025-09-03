import { createContext, useState, useEffect } from "react";
import {
  initDB,
  getAlunos,
  addAluno,
  updateAluno,
  deleteAluno,
  getParadas,
} from "../database/database";
import { Alert } from "react-native";

export const AlunosContext = createContext();

export function AlunosProvider({ children }) {
  const [alunos, setAlunos] = useState([]);
  const [paradas, setParadas] = useState([]);
  const carregarParadas = async () => {
    try {
      const data = await getParadas();
      setParadas(data);
    } catch (error) {
      console.log("❌ Erro ao carregar paradas:", error);
    }
  };
  useEffect(() => {
    const inicializar = async () => {
      try {
        await initDB();
        await carregarAlunos();
        await carregarParadas();
      } catch (error) {
        console.log("❌ Erro na inicialização completa:", error);
      }
    };
    inicializar();
  }, []);

  const carregarAlunos = async () => {
    try {
      const data = await getAlunos();
      setAlunos(data);
    } catch (error) {
      console.log("❌ Erro ao carregar alunos:", error);
    }
  };

  const adicionarAluno = async (nome, cpf, status, ultimoPagamento, telefone, paradaId) => {
    if (!nome.trim()) {
      return;
    }
    try {
      await addAluno(nome.trim(), cpf || "", status, ultimoPagamento || "", telefone || "", paradaId);
      await carregarAlunos();
    } catch (e) {
      console.log("❌ Erro ao adicionar aluno:", e);
    }
  };

  const editarAluno = async (index, novoNome, novoCPF, novoStatus, novoTelefone, paradaId) => {
    const aluno = alunos[index];
    if (!aluno) return;
    try {
      await updateAluno(
        aluno.id,
        novoNome.trim(),
        novoCPF || aluno.CPF || "",
        aluno.ultimoPagamento || "",
        novoStatus,
        novoTelefone || aluno.telefone || "",
        paradaId,
      );
      await carregarAlunos();
    } catch (e) {
      console.log("Erro ao editar aluno:", e);
    }
  };

  const removerAluno = (index) => {
    const aluno = alunos[index];
    if (!aluno) return;
    Alert.alert("Confirmar remoção", "Deseja realmente remover este aluno?", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Remover",
        onPress: async () => {
          try {
            await deleteAluno(aluno.id);
            await carregarAlunos();
          } catch (e) {
            console.log("Erro ao remover aluno:", e);
          }
        },
      },
    ]);
  };

  return (
    <AlunosContext.Provider
      value={{ alunos, adicionarAluno, editarAluno, removerAluno, carregarAlunos, paradas, carregarParadas }}
    >
      {children}
    </AlunosContext.Provider>
  );
}