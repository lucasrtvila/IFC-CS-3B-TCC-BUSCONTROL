import { createContext, useState, useEffect } from "react";
import {
  initDB,
  getAlunos,
  addAluno,
  updateAluno,
  registrarOuAtualizarStatusPagamento,
  deleteAluno,
  getParadas,
  getAlunosComStatusParaMes,
  getMensalidade, // Importar
  salvarMensalidade, // Importar
} from "../database/database";
import { Alert } from "react-native";

export const AlunosContext = createContext();

// Converte string YYYY-MM-DD para objeto Date (mantida)
function parseDataISO(dataString) {
    if (!dataString || typeof dataString !== 'string') return new Date(); // Retorna data atual se inválido
    const parts = dataString.split('-');
    if (parts.length === 3) {
      // Cria a data em UTC para evitar problemas de fuso horário apenas na conversão
      return new Date(Date.UTC(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10)));
    }
    return new Date(); // Retorna data atual se inválido
}
// Formata objeto Date para string "YYYY-MM-DD" (mantida)
function formatarDataISO(data) {
    if (!data) return null;
    const dia = data.getUTCDate().toString().padStart(2, '0');
    const mes = (data.getUTCMonth() + 1).toString().padStart(2, '0'); // Mês é 0-indexado
    const ano = data.getUTCFullYear();
    return `${ano}-${mes}-${dia}`;
}


const getMesAnoDeFaturamentoAtual = (diaVencimento) => {
    const hoje = new Date();
    const diaDeHoje = hoje.getDate();
    const anoAtual = hoje.getFullYear();
    const mesAtual = hoje.getMonth(); // 0-indexado

    if (diaDeHoje <= diaVencimento) {
        return `${anoAtual}-${(mesAtual + 1).toString().padStart(2, '0')}`;
    }
    else {
        const proximoMes = new Date(anoAtual, mesAtual, 1);
        proximoMes.setMonth(proximoMes.getMonth() + 1);
        const anoProximo = proximoMes.getFullYear();
        const mesProximo = (proximoMes.getMonth() + 1).toString().padStart(2, '0');
        return `${anoProximo}-${mesProximo}`;
    }
};

export function AlunosProvider({ children }) {
  const [alunos, setAlunos] = useState([]);
  const [alunosComStatus, setAlunosComStatus] = useState([]);
  const [paradas, setParadas] = useState([]);
  const [mesAnoVisivel, setMesAnoVisivel] = useState(null);
  const [diaVencimentoAtual, setDiaVencimentoAtual] = useState(20);

  // --- NOVOS ESTADOS PARA MENSALIDADE ---
  const [valorMensalidade, setValorMensalidade] = useState("380.00"); // Valor padrão
  const [dataVencimento, setDataVencimento] = useState(new Date()); // Data padrão

  useEffect(() => {
    carregarDadosIniciais();
  }, []);

  useEffect(() => {
    if (mesAnoVisivel) {
        carregarStatusAlunosDoMes(mesAnoVisivel);
    }
  }, [mesAnoVisivel, alunos]);

  const carregarDadosIniciais = async () => {
    try {
      await initDB();

      // --- CARREGAR CONFIG MENSALIDADE ---
      const config = await getMensalidade();
      let diaVencimento = 20;
      if (config) {
        setValorMensalidade(config.valor ? config.valor.toString() : "380.00"); // Define o valor do estado
        const dataVencObj = parseDataISO(config.dataVencimento);
        if (dataVencObj) {
            setDataVencimento(dataVencObj); // Define a data do estado
            diaVencimento = dataVencObj.getUTCDate(); // Pega o dia (UTC)
        } else {
             setDataVencimento(new Date()); // Fallback
        }
      } else {
          // Define valores padrão se não houver config
          setValorMensalidade("380.00");
          setDataVencimento(new Date());
      }
      setDiaVencimentoAtual(diaVencimento);
      // --- FIM CARREGAR CONFIG ---

      const mesAnoFaturamento = getMesAnoDeFaturamentoAtual(diaVencimento);
      setMesAnoVisivel(mesAnoFaturamento);

      await carregarParadas();
      await carregarAlunosBase();

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

  const adicionarAlunoContext = async (nome, cpf, status, ultimoPagamento, telefone, paradaId) => {
    if (!nome.trim()) {
       Alert.alert("Erro", "O nome do aluno é obrigatório.");
      return;
    }
    try {
      await addAluno(nome.trim(), cpf || "", status, ultimoPagamento || "", telefone || "", paradaId);
      await carregarAlunosBase();
       Alert.alert("Sucesso", "Aluno adicionado!");

    } catch (e) {
      console.log("❌ Erro ao adicionar aluno (Context):", e);
       Alert.alert("Erro no Cadastro", "Não foi possível adicionar o aluno. Verifique os logs.");
    }
  };


  const editarAlunoContext = async (index, novoNome, novoCPF, novoStatus, novoTelefone, novoParadaId) => {
    const alunoParaEditar = alunosComStatus[index];
     if (!alunoParaEditar) {
         console.error("Aluno não encontrado para edição no índice:", index);
         Alert.alert("Erro", "Aluno não encontrado para edição.");
         return;
     }
    if (!novoNome.trim()) {
      Alert.alert("Erro", "O nome do aluno é obrigatório.");
      return;
    }

    try {
      const paradaSelecionada = paradas.find(p => p.id === novoParadaId);
      const horarioParada = paradaSelecionada ? paradaSelecionada.horario : null;

      await updateAluno(
        alunoParaEditar.id,
        novoNome.trim(),
        novoCPF || "",
        alunos.find(a => a.id === alunoParaEditar.id)?.ultimoPagamento || "",
        novoTelefone || "",
        novoParadaId,
        horarioParada
      );

      await registrarOuAtualizarStatusPagamento(alunoParaEditar.id, mesAnoVisivel, novoStatus);
      await carregarAlunosBase();
      Alert.alert("Sucesso", "Aluno atualizado!");

    } catch (e) {
      console.log("Erro ao editar aluno (Context):", e);
      Alert.alert("Erro", "Não foi possível atualizar o aluno.");
    }
  };

  const updateStatusAlunoContext = async (idAluno, novoStatus, mesAno = mesAnoVisivel) => {
      try {
          await registrarOuAtualizarStatusPagamento(idAluno, mesAno, novoStatus);
          await carregarStatusAlunosDoMes(mesAnoVisivel);
      } catch (error) {
          console.error("Erro ao atualizar status do aluno no contexto:", error);
          Alert.alert("Erro", "Não foi possível atualizar o status de pagamento.");
          throw error;
      }
  };

  const removerAlunoContext = (index) => {
     const alunoParaRemover = alunosComStatus[index];
     if (!alunoParaRemover) {
        console.error("Aluno não encontrado para remoção no índice:", index);
        Alert.alert("Erro", "Aluno não encontrado para remoção.");
        return;
     }

    Alert.alert("Confirmar remoção", "Deseja realmente remover este aluno?", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Remover",
         style: "destructive",
        onPress: async () => {
          try {
            await deleteAluno(alunoParaRemover.id);
            await carregarAlunosBase();
          } catch (e) {
            console.log("Erro ao remover aluno (Context):", e);
            Alert.alert("Erro", "Não foi possível remover o aluno.");
          }
        },
      },
    ]);
  };

   const mesAnterior = () => {
       setMesAnoVisivel(prevMesAno => {
           if (!prevMesAno) return null;
           const [ano, mes] = prevMesAno.split('-').map(Number);
           const data = new Date(ano, mes - 1, 1);
           data.setMonth(data.getMonth() - 1);
           return `${data.getFullYear()}-${(data.getMonth() + 1).toString().padStart(2, '0')}`;
       });
   };

   const proximoMes = () => {
       setMesAnoVisivel(prevMesAno => {
            if (!prevMesAno) return null;
           const [ano, mes] = prevMesAno.split('-').map(Number);
           const data = new Date(ano, mes - 1, 1);
           data.setMonth(data.getMonth() + 1);
           return `${data.getFullYear()}-${(data.getMonth() + 1).toString().padStart(2, '0')}`;
       });
   };

    const isProximoMesFuturo = () => {
        if (!mesAnoVisivel) return true;
        const cicloFaturamentoAtual = getMesAnoDeFaturamentoAtual(diaVencimentoAtual);
        const [anoVisivel, mesVisivel] = mesAnoVisivel.split('-').map(Number);
        const dataVisivel = new Date(anoVisivel, mesVisivel - 1, 1);
        dataVisivel.setMonth(dataVisivel.getMonth() + 1);
        const proximoCicloVisivel = `${dataVisivel.getFullYear()}-${(dataVisivel.getMonth() + 1).toString().padStart(2, '0')}`;
        return proximoCicloVisivel > cicloFaturamentoAtual;
    };

    // --- NOVA FUNÇÃO PARA ATUALIZAR MENSALIDADE ---
    const atualizarConfigMensalidade = async (novoValor, novaDataVencimentoObj) => {
        const valorFloat = parseFloat(novoValor);
        const dataFormatadaISO = formatarDataISO(novaDataVencimentoObj); // Converte Date para YYYY-MM-DD

        if (isNaN(valorFloat) || valorFloat <= 0) {
            Alert.alert("Valor Inválido", "Insira um valor numérico positivo.");
            return false; // Indica falha
        }
        if (!dataFormatadaISO) {
             Alert.alert("Data Inválida", "Selecione uma data de vencimento válida.");
            return false; // Indica falha
        }

        try {
            await salvarMensalidade(valorFloat, dataFormatadaISO); // Salva no DB
            // Atualiza os estados no contexto
            setValorMensalidade(valorFloat.toString());
            setDataVencimento(novaDataVencimentoObj);
            setDiaVencimentoAtual(novaDataVencimentoObj.getUTCDate()); // Atualiza o dia de vencimento usado nos cálculos
            // Recalcula o mês visível atual caso o dia de vencimento tenha mudado o ciclo
            const novoMesAnoFaturamento = getMesAnoDeFaturamentoAtual(novaDataVencimentoObj.getUTCDate());
            if (novoMesAnoFaturamento !== mesAnoVisivel) {
                setMesAnoVisivel(novoMesAnoFaturamento);
                // O useEffect [mesAnoVisivel] cuidará de recarregar os status
            } else {
                 await carregarStatusAlunosDoMes(mesAnoVisivel); // Recarrega status se o mês não mudou
            }

            console.log("Configuração de mensalidade atualizada no contexto e DB.");
            return true; // Indica sucesso
        } catch (error) {
            console.error("Erro ao atualizar configuração de mensalidade (Context):", error);
            Alert.alert("Erro", "Não foi possível salvar as configurações.");
            return false; // Indica falha
        }
    };
    // --- FIM NOVA FUNÇÃO ---


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
          carregarAlunosBase,
          // --- EXPORTAR ESTADOS E FUNÇÃO DA MENSALIDADE ---
          valorMensalidade,
          dataVencimento,
          atualizarConfigMensalidade,
          // --- FIM EXPORTAR ---
      }}
    >
      {children}
    </AlunosContext.Provider>
  );
}