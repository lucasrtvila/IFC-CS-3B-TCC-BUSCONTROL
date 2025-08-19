// components/AlunosContext.js
import { createContext, useState, useEffect } from "react";

import {
  initDB,
  getAlunos,
  addAluno,
  updateAluno,
  deleteAluno,
} from "../database/database";

import { Alert } from "react-native";

export const AlunosContext = createContext();

export function AlunosProvider({ children }) {
  const [alunos, setAlunos] = useState([]);
  const [dbPronto, setDbPronto] = useState(false);

  useEffect(() => {
    console.log("=== INICIALIZANDO CONTEXT ===");
    
    const inicializar = async () => {
      try {
        console.log("🔄 Tentando inicializar banco...");
        
        // Aguarda um pouco para garantir que tudo esteja carregado
        await new Promise(resolve => setTimeout(resolve, 100));
        
        await initDB();
        console.log("✅ Banco inicializado com sucesso!");
        
        // Marca como pronto ANTES de carregar alunos
        setDbPronto(true);
        console.log("✅ DB marcado como pronto!");
        
        console.log("🔄 Carregando alunos iniciais...");
        await carregarAlunos();
        console.log("✅ Inicialização completa!");
        
      } catch (error) {
        console.log("❌ Erro na inicialização completa:", error);
        console.log("Stack trace:", error.stack);
        
        // Mesmo com erro, tenta marcar como pronto
        setDbPronto(true);
      }
    };
    
    inicializar();
  }, []);

  const carregarAlunos = async () => {
    console.log("=== CARREGANDO ALUNOS ===");
    try {
      const data = await getAlunos();
      console.log("✅ Alunos carregados do banco:", data);
      console.log("Quantidade:", data.length);
      setAlunos(data);
    } catch (error) {
      console.log("❌ Erro ao carregar alunos:", error);
    }
  };

  // Função para adicionar aluno - ordem: nome, cpf, status, ultimoPagamento
  const adicionarAluno = async (nome, cpf, status, ultimoPagamento) => {
    console.log("=== INICIANDO ADIÇÃO DE ALUNO ===");
    console.log("dbPronto:", dbPronto);
    console.log("Parâmetros recebidos:", { nome, cpf, status, ultimoPagamento });
    
    if (!dbPronto) {
      console.log("❌ Banco não está pronto!");
      return;
    }
    
    if (!nome.trim()) {
      console.log("❌ Nome está vazio!");
      return;
    }
    
    try {
      console.log("🔄 Chamando addAluno no banco...");
      const result = await addAluno(nome.trim(), cpf || "", status, ultimoPagamento || "");
      console.log("✅ addAluno retornou:", result);
      
      console.log("🔄 Recarregando lista de alunos...");
      await carregarAlunos();
      console.log("✅ Lista recarregada!");
    } catch (e) {
      console.log("❌ Erro ao adicionar aluno:", e);
    }
  };

  // Função para editar aluno - ordem: index, nome, cpf, status
  const editarAluno = async (index, novoNome, novoCPF, novoStatus) => {
    if (!dbPronto) return;
    const aluno = alunos[index];
    if (!aluno) return;
    
    console.log("Editando aluno:", { 
      index, 
      novoNome, 
      novoCPF, 
      novoStatus,
      alunoAtual: aluno 
    }); // Debug
    
    try {
      // Certifica-se que os parâmetros estão na ordem correta para updateAluno
      // Assumindo que updateAluno espera: (id, nome, cpf, ultimoPagamento, status)
      await updateAluno(
        aluno.id,
        novoNome.trim(),
        novoCPF || aluno.CPF || "", // preserva CPF atual se não fornecido
        aluno.ultimoPagamento || "", // preserva ultimoPagamento atual
        novoStatus
      );
      await carregarAlunos();
    } catch (e) {
      console.log("Erro ao editar aluno:", e);
    }
  };

  const removerAluno = (index) => {
    if (!dbPronto) return;
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
      value={{ alunos, adicionarAluno, editarAluno, removerAluno }}
    >
      {children}
    </AlunosContext.Provider>
  );
}