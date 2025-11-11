import { createContext, useState, useEffect, useCallback } from "react";
import {
  initDB,
  getAlunos,
  addAluno,
  updateAluno,
  registrarOuAtualizarStatusPagamento,
  deleteAluno,
  getParadas,
  getAlunosComStatusParaMes,
  getMensalidade,
  salvarMensalidade,
} from "../database/database";
import { Alert } from "react-native";

export const AlunosContext = createContext();

// Converte string YYYY-MM-DD para objeto Date
function parseDataISO(dataString) {
    if (!dataString || typeof dataString !== 'string') return new Date();
    const parts = dataString.split('-');
    if (parts.length === 3) {
      const ano = parseInt(parts[0], 10);
      const mes = parseInt(parts[1], 10) - 1; // 0-index
      const dia = parseInt(parts[2], 10);
      return new Date(ano, mes, dia);
    }
    return new Date(); // Retorna data atual se inválido
}
// Formata objeto Date para string "YYYY-MM-DD" 
function formatarDataISO(data) {
    if (!data) return null;
    const dia = data.getDate().toString().padStart(2, '0');
    const mes = (data.getMonth() + 1).toString().padStart(2, '0');
    const ano = data.getFullYear();
    return `${ano}-${mes}-${dia}`;
}


const getMesAnoDeFaturamentoAtual = (diaVencimento) => {
    const hoje = new Date();
    const diaDeHoje = hoje.getDate();
    const anoAtual = hoje.getFullYear();
    const mesAtual = hoje.getMonth(); 

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
  const [alunos, setAlunos] = useState([]); // Lista de alunos (base, sem status)
  const [alunosComStatus, setAlunosComStatus] = useState([]); // Lista para exibição (com status do mês)
  const [paradas, setParadas] = useState([]);
  const [reloadParadasContext, setReloadParadasContext] = useState(null);
  const [mesAnoVisivel, setMesAnoVisivel] = useState(null);
  const [diaVencimentoAtual, setDiaVencimentoAtual] = useState(20);

  const resetMesParaAtual = () => {
    // Recalcula o mesAnoVisivel com base no diaVencimentoAtual (que é um estado)
    const mesAnoFaturamento = getMesAnoDeFaturamentoAtual(diaVencimentoAtual);
    if (mesAnoFaturamento !== mesAnoVisivel) {
        setMesAnoVisivel(mesAnoFaturamento);
        console.log(`✅ MesAnoVisivel resetado para o ciclo atual: ${mesAnoFaturamento}`);
    }
  };

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
  }, [mesAnoVisivel, alunos]); // Depende de 'alunos' (lista base) para recalcular status

  const carregarDadosIniciais = async () => {
    try {
      await initDB();
      const config = await getMensalidade();
      let diaVencimento = 20;
      if (config) {
        setValorMensalidade(config.valor ? config.valor.toString() : "380.00"); // Define o valor do estado
        const dataVencObj = parseDataISO(config.dataVencimento);
        if (dataVencObj) {
            setDataVencimento(dataVencObj); // Define a data do estado
            diaVencimento = dataVencObj.getDate(); // Pega o dia
        } else {
             setDataVencimento(new Date());
        }
      } else {
          setValorMensalidade("380.00");
          setDataVencimento(new Date());
      }
      setDiaVencimentoAtual(diaVencimento);

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

 const setParadasReloadFunc = useCallback((func) => {
    setReloadParadasContext(() => func);
  }, []);

  const notificarParadasContext = async () => {
    if (reloadParadasContext) {
      console.log("🔄 Notificando ParadasContext para recarregar contagem...");
     const func = reloadParadasContext(); // <-- CORREÇÃO: Pega a função
      await func(); // <-- CORREÇÃO: Executa a função
    }
  };

const adicionarAlunoContext = async (nome, cpf, status, ultimoPagamento, telefone, paradaId) => {
    
    // 1. Verificação do nome (como você pediu)
    if (!nome.trim()) {
       Alert.alert("Erro", "O nome do aluno é obrigatório.");
       return; // Para a execução AQUI se o nome for inválido
    }
    
    // 2. Verificação do CPF
    const cpfLimpo = cpf.replace(/\D/g, ""); 
    if (cpfLimpo.length > 0) { 
        // Usamos 'alunos' (a lista base) para a verificação
        const cpfExistente = alunos.find(aluno => aluno.cpf && aluno.cpf.replace(/\D/g, "") === cpfLimpo);
        if (cpfExistente) {
            Alert.alert("CPF Duplicado", "Este CPF já está cadastrado em outro aluno.");
            return; 
        }
    }
   
    // 3. Bloco TRY principal (só executa se as verificações passarem)
    try {
      const dataCadastroISO = new Date().toISOString().split('T')[0];
      
      await addAluno(
          nome.trim(), 
          cpf || "", 
          status, 
          ultimoPagamento || "", 
          telefone || "", 
          paradaId, 
          dataCadastroISO 
      );

      await carregarAlunosBase();
      await notificarParadasContext(); // <-- A NOTIFICAÇÃO ESTÁ AQUI
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

    const cpfLimpo = novoCPF.replace(/\D/g, "");
    if (cpfLimpo.length > 0) {
        const cpfExistente = alunos.find(aluno =>
            aluno.cpf &&
            aluno.cpf.replace(/\D/g, "") === cpfLimpo &&
            aluno.id !== alunoParaEditar.id 
        );
        if (cpfExistente) {
            Alert.alert("CPF Duplicado", "Este CPF já está cadastrado em outro aluno.");
            return; 
        }
    }

    try {
      const paradaSelecionada = paradas.find(p => p.id === novoParadaId);
      const horarioParada = paradaSelecionada ? paradaSelecionada.horario : null;

      const alunoBase = alunos.find(a => a.id === alunoParaEditar.id);
      const ultimoPagamento = (alunoBase ? alunoBase.ultimoPagamento : "") || "";


      await updateAluno(
        alunoParaEditar.id,
        novoNome.trim(),
        novoCPF || "",
        ultimoPagamento, 
        novoTelefone || "",
        novoParadaId,
        horarioParada
      );

      await registrarOuAtualizarStatusPagamento(alunoParaEditar.id, mesAnoVisivel, novoStatus);
      
      await carregarAlunosBase(); 
      await notificarParadasContext();
      Alert.alert("Sucesso", "Aluno atualizado!");

    } catch (e) {
      console.log("Erro ao editar aluno (Context):", e);
      Alert.alert("Erro", "Não foi possível atualizar o aluno.");
    }
  };

  const updateStatusAlunoContext = async (idAluno, novoStatus, mesAno = mesAnoVisivel) => {
      try {
          await registrarOuAtualizarStatusPagamento(idAluno, mesAno, novoStatus);
          await carregarStatusAlunosDoMes(mesAnoVisivel); // Recarrega a lista de exibição
      } catch (error) {
          console.error("Erro ao atualizar status do aluno no contexto:", error);
          Alert.alert("Erro", "Não foi possível atualizar o status de pagamento.");
          throw error;
      }
  };

  const removerAlunoContext = (alunoId) => {
     const alunoParaRemover = alunosComStatus.find(a => a.id === alunoId);
     if (!alunoParaRemover) {
        console.error("Aluno não encontrado para remoção com ID:", alunoId);
        Alert.alert("Erro", "Aluno não encontrado para remoção.");
        return;
     }

    Alert.alert("Confirmar remoção", "Deseja realmente remover este aluno? O histórico de pagamentos será mantido.", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Remover",
         style: "destructive",
        onPress: async () => {
          try {
            await deleteAluno(alunoParaRemover.id);
            await carregarAlunosBase();
            await notificarParadasContext(); 
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

    const atualizarConfigMensalidade = async (novoValor, novaDataVencimentoObj) => {
    const valorFloat = parseFloat(novoValor);

    if (isNaN(valorFloat) || valorFloat <= 0) {
        Alert.alert("Valor Inválido", "Insira um valor numérico positivo.");
        return false;
    }
    if (!novaDataVencimentoObj || !(novaDataVencimentoObj instanceof Date)) {
        Alert.alert("Data Inválida", "Selecione uma data de vencimento válida.");
        return false;
    }

    const ano = novaDataVencimentoObj.getFullYear();
    const mes = novaDataVencimentoObj.getMonth() + 1;
    const dia = novaDataVencimentoObj.getDate();

    const dataFormatadaISO = `${ano}-${String(mes).padStart(2, '0')}-${String(dia).padStart(2, '0')}`;

    try {
        await salvarMensalidade(valorFloat, dataFormatadaISO);
        setValorMensalidade(valorFloat.toFixed(2).toString());
        setDataVencimento(new Date(ano, mes - 1, dia));
        setDiaVencimentoAtual(dia);

        const novoMesAnoFaturamento = getMesAnoDeFaturamentoAtual(dia);
        if (novoMesAnoFaturamento !== mesAnoVisivel) {
            setMesAnoVisivel(novoMesAnoFaturamento);
        } else {
            await carregarStatusAlunosDoMes(mesAnoVisivel);
       }

        console.log("Configuração de mensalidade atualizada no contexto e DB.");
        return true;
    } catch (error) {
        console.error("Erro ao atualizar configuração de mensalidade (Context):", error);
        Alert.alert("Erro", "Não foi possível salvar as configurações.");
        return false;
    }
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
         carregarAlunosBase,
          valorMensalidade,
          dataVencimento,
          atualizarConfigMensalidade,
          resetMesParaAtual,
          setParadasReloadFunc,
      }}
    >
      {children}
    </AlunosContext.Provider>
 );
}