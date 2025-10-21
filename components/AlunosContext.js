import { createContext, useState, useEffect } from "react";
import {
  initDB,
  getAlunos, // Pega dados básicos dos alunos
  addAluno,
  updateAluno, // Atualiza dados básicos
  registrarOuAtualizarStatusPagamento, // Nova função para status
  deleteAluno,
  getParadas,
  getAlunosComStatusParaMes, // Nova função para buscar status do mês
  getMensalidade, // Precisamos buscar a config de mensalidade
} from "../database/database";
import { Alert } from "react-native";

export const AlunosContext = createContext();

// Converte string YYYY-MM-DD para objeto Date
function parseDataISO(dataString) {
    if (!dataString || typeof dataString !== 'string') return new Date();
    const parts = dataString.split('-');
    if (parts.length === 3) {
      return new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
    }
    return new Date();
}

/**
 * Determina o "mês de faturamento" (YYYY-MM) com base na data atual e no dia de vencimento.
 * @param {number} diaVencimento - O dia do mês (ex: 20) que é o vencimento.
 */
const getMesAnoDeFaturamentoAtual = (diaVencimento) => {
    const hoje = new Date();
    const diaDeHoje = hoje.getDate();
    const anoAtual = hoje.getFullYear();
    const mesAtual = hoje.getMonth(); // 0-indexado

    // Se hoje é dia 21+ e vencimento é 20, já estamos no ciclo do próximo mês.
    if (diaDeHoje > diaVencimento) {
        const proximoMes = new Date(anoAtual, mesAtual, 1);
        proximoMes.setMonth(proximoMes.getMonth() + 1);
        const anoProximo = proximoMes.getFullYear();
        const mesProximo = (proximoMes.getMonth() + 1).toString().padStart(2, '0');
        return `${anoProximo}-${mesProximo}`;
    } else {
         // Se hoje é dia 1-20, ainda estamos no ciclo do mês atual.
        return `${anoAtual}-${(mesAtual + 1).toString().padStart(2, '0')}`;
    }
};

export function AlunosProvider({ children }) {
  const [alunos, setAlunos] = useState([]); // Lista principal de alunos (id, nome, etc.)
  const [alunosComStatus, setAlunosComStatus] = useState([]); // Alunos com status do mês visível
  const [paradas, setParadas] = useState([]);
  const [mesAnoVisivel, setMesAnoVisivel] = useState(null); // Inicia como nulo
  const [diaVencimentoAtual, setDiaVencimentoAtual] = useState(20); // Padrão

  useEffect(() => {
    carregarDadosIniciais();
  }, []);

  useEffect(() => {
    // Recarrega o status dos alunos sempre que o mês visível mudar ou a lista base de alunos mudar
    if (mesAnoVisivel) {
        carregarStatusAlunosDoMes(mesAnoVisivel);
    }
  }, [mesAnoVisivel, alunos]); // Depende de 'alunos' (lista base)

  const carregarDadosIniciais = async () => {
    try {
      await initDB();
      
      const config = await getMensalidade();
      let diaVencimento = 20; // Padrão
      if (config && config.dataVencimento) {
          diaVencimento = parseDataISO(config.dataVencimento).getDate();
      }
      setDiaVencimentoAtual(diaVencimento);

      const mesAnoFaturamento = getMesAnoDeFaturamentoAtual(diaVencimento);
      setMesAnoVisivel(mesAnoFaturamento);
      
      await carregarParadas();
      await carregarAlunosBase(); 
      // O useEffect acima [mesAnoVisivel, alunos] será disparado para carregar os status
      
    } catch (error) {
      console.log("❌ Erro na inicialização completa:", error);
    }
  };

   const carregarAlunosBase = async () => {
    try {
        const data = await getAlunos();
        setAlunos(data);
    } catch (error) {
        console.log("❌ Erro ao carregar alunos base:", error);
    }
   };

    const carregarStatusAlunosDoMes = async (mesAno) => {
        if (!mesAno) return;
        try {
            const data = await getAlunosComStatusParaMes(mesAno);
            setAlunosComStatus(data);
        } catch (error) {
            console.log(`❌ Erro ao carregar status dos alunos para ${mesAno}:`, error);
        }
    };


  const carregarParadas = async () => {
    try {
      const data = await getParadas();
      setParadas(data);
    } catch (error) {
      console.log("❌ Erro ao carregar paradas:", error);
    }
  };

  const adicionarAlunoContext = async (nome, cpf, statusInicial, ultimoPagamento, telefone, paradaId) => {
    if (!nome.trim()) {
      return;
    }
    try {
      // Adiciona o aluno (que também adiciona status inicial no histórico para o ciclo atual)
      await addAluno(nome.trim(), cpf || "", statusInicial, ultimoPagamento || "", telefone || "", paradaId);
      
      await carregarAlunosBase(); // Recarrega a lista base de alunos

    } catch (e) {
      console.log("❌ Erro ao adicionar aluno:", e);
    }
  };

  // Esta função é usada pela tela Alunos.js, que passa 'index'
  const editarAlunoContext = async (index, novoNome, novoCPF, novoStatus, novoTelefone, novoParadaId) => {
    
    // 'alunos' neste contexto é o 'alunosComStatus' (lista visível)
    const alunoParaEditar = alunos[index]; 
     if (!alunoParaEditar) {
         console.error("Aluno não encontrado para edição no índice:", index);
         return;
     }

    try {
      // Atualiza os dados BÁSICOS no DB
      await updateAluno(
        alunoParaEditar.id,
        novoNome.trim(),
        novoCPF || "",
        alunoParaEditar.ultimoPagamento || "", // Preserva o ultimoPagamento
        novoTelefone || "",
        novoParadaId,
        alunoParaEditar.horario || null // Preserva o horario
      );
      
      // Atualiza o STATUS do mês ATUAL (visível) no DB
      // A tela Alunos.js não deve mudar o status de meses passados, só do atual
      await registrarOuAtualizarStatusPagamento(alunoParaEditar.id, mesAnoVisivel, novoStatus);

      // Recarrega a lista base E o status do mês visível
      await carregarAlunosBase(); 
      // await carregarStatusAlunosDoMes(mesAnoVisivel); // O useEffect [alunos] já faz isso

    } catch (e) {
      console.log("Erro ao editar aluno:", e);
    }
  };

  // Esta função é usada pela tela Mensalidades.js
  const updateStatusAlunoContext = async (idAluno, novoStatus, mesAno = mesAnoVisivel) => {
      try {
          await registrarOuAtualizarStatusPagamento(idAluno, mesAno, novoStatus);
          await carregarStatusAlunosDoMes(mesAnoVisivel); // Recarrega status do mês visível
      } catch (error) {
          console.error("Erro ao atualizar status do aluno no contexto:", error);
          throw error;
      }
  };

  const removerAlunoContext = (index) => { // Usado por Alunos.js
     const alunoParaRemover = alunos[index]; // 'alunos' é alunosComStatus
     if (!alunoParaRemover) {
        console.error("Aluno não encontrado para remoção no índice:", index);
        return;
     }

    Alert.alert("Confirmar remoção", "Deseja realmente remover este aluno?", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Remover",
         style: "destructive",
        onPress: async () => {
          try {
            await deleteAluno(alunoParaRemover.id); // Usa o ID
            await carregarAlunosBase();
          } catch (e) {
            console.log("Erro ao remover aluno:", e);
          }
        },
      },
    ]);
  };

   // Funções para navegar entre meses
   const mesAnterior = () => {
       setMesAnoVisivel(prevMesAno => {
           const [ano, mes] = prevMesAno.split('-').map(Number);
           const data = new Date(ano, mes - 1, 1); // Mês é 0-indexado
           data.setMonth(data.getMonth() - 1);
           return `${data.getFullYear()}-${(data.getMonth() + 1).toString().padStart(2, '0')}`;
       });
   };

   const proximoMes = () => {
       setMesAnoVisivel(prevMesAno => {
           const [ano, mes] = prevMesAno.split('-').map(Number);
           const data = new Date(ano, mes - 1, 1); // Mês é 0-indexado
           data.setMonth(data.getMonth() + 1);
           return `${data.getFullYear()}-${(data.getMonth() + 1).toString().padStart(2, '0')}`;
       });
   };

    // Função para verificar se o próximo mês é futuro (baseado no ciclo de faturamento)
    const isProximoMesFuturo = () => {
        // Ciclo de faturamento atual
        const cicloFaturamentoAtual = getMesAnoDeFaturamentoAtual(diaVencimentoAtual);
        
        // Ciclo que será exibido se clicar em "Próximo >"
        const [anoVisivel, mesVisivel] = mesAnoVisivel.split('-').map(Number);
        const dataVisivel = new Date(anoVisivel, mesVisivel - 1, 1);
        dataVisivel.setMonth(dataVisivel.getMonth() + 1);
        const proximoCicloVisivel = `${dataVisivel.getFullYear()}-${(dataVisivel.getMonth() + 1).toString().padStart(2, '0')}`;

        // Desabilita se o próximo ciclo visível for maior que o ciclo de faturamento atual
        // (Comparação de strings YYYY-MM funciona)
        return proximoCicloVisivel > cicloFaturamentoAtual;
    };


  return (
    <AlunosContext.Provider
      value={{
          alunos: alunosComStatus,
          alunosBase: alunos, 
          adicionarAluno: adicionarAlunoContext,
          editarAluno: editarAlunoContext,
          removerAluno: removerAlunoContext,
          carregarAlunos: () => carregarStatusAlunosDoMes(mesAnoVisivel),
          paradas,
          carregarParadas,
          updateAlunoStatus: updateStatusAlunoContext,
          mesAnoVisivel,
          mesAnterior,
          proximoMes,
          isProximoMesFuturo,
          carregarAlunosBase 
      }}
    >
      {children}
    </AlunosContext.Provider>
  );
}