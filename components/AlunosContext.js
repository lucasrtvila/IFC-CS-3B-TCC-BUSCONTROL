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
  const [alunos, setAlunos] = useState([]); // Lista de alunos (base, sem status)
  const [alunosComStatus, setAlunosComStatus] = useState([]); // Lista para exibição (com status do mês)
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
  }, [mesAnoVisivel, alunos]); // Depende de 'alunos' (lista base) para recalcular status

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
      await carregarAlunosBase(); // Carrega a lista base de alunos

    } catch (error) {
      console.log("❌ Erro na inicialização completa:", error);
    }
  };

   const carregarAlunosBase = async () => {
    try {
        const data = await getAlunos(); // getAlunos agora só retorna alunos ativos
        setAlunos(data); // Atualiza a lista base 'alunos'
    } catch (error) {
        console.log("❌ Erro ao carregar alunos base:", error);
    }
   };

    const carregarStatusAlunosDoMes = async (mesAno) => {
        if (!mesAno) return;
        try {
            // Busca os alunos já com o status para o mês específico (AGORA COM A NOVA LÓGICA)
            const data = await getAlunosComStatusParaMes(mesAno);
            setAlunosComStatus(data); // Atualiza a lista de exibição
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

  // --- FUNÇÃO ATUALIZADA ---
  const adicionarAlunoContext = async (nome, cpf, status, ultimoPagamento, telefone, paradaId) => {
    if (!nome.trim()) {
       Alert.alert("Erro", "O nome do aluno é obrigatório.");
      return;
    }
    
    const cpfLimpo = cpf.replace(/\D/g, ""); 
    if (cpfLimpo.length > 0) { 
        const cpfExistente = alunos.find(aluno => aluno.cpf && aluno.cpf.replace(/\D/g, "") === cpfLimpo);
        if (cpfExistente) {
            Alert.alert("CPF Duplicado", "Este CPF já está cadastrado em outro aluno.");
            return; 
        }
    }
   
    try {
      // --- ATUALIZADO: Adiciona data de cadastro ---
      const dataCadastroISO = new Date().toISOString().split('T')[0]; // Formato 'YYYY-MM-DD'
      
      await addAluno(
          nome.trim(), 
          cpf || "", 
          status, 
          ultimoPagamento || "", 
          telefone || "", 
          paradaId, 
          dataCadastroISO // Passa a data de cadastro
      );
      // --- FIM DA ATUALIZAÇÃO ---
      
      await carregarAlunosBase(); // Recarrega a lista base
       Alert.alert("Sucesso", "Aluno adicionado!");

    } catch (e) {
      console.log("❌ Erro ao adicionar aluno (Context):", e);
       Alert.alert("Erro no Cadastro", "Não foi possível adicionar o aluno. Verifique os logs.");
    }
  };
  // --- FIM DA ATUALIZAÇÃO ---


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
      // Se o alunoBase não for encontrado (ex: aluno inativo sendo editado em mês passado), 
      // precisamos buscar o ultimoPagamento de outra forma, mas para a lógica atual, 
      // só alunos ativos (presentes em 'alunos') devem ser editáveis.
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

  // ****************************************************
  // AQUI ESTÁ A MUDANÇA (1/2)
  // Esta função agora executa um "soft delete" (statusAtivo = 0)
  const removerAlunoContext = (alunoId) => { // Alterado de 'index' para 'alunoId'
     const alunoParaRemover = alunosComStatus.find(a => a.id === alunoId); // Encontra o aluno pelo ID
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
            await deleteAluno(alunoParaRemover.id); // Agora faz UPDATE statusAtivo = 0
            await carregarAlunosBase(); // Recarrega a lista base (que só pega ativos)
            // O useEffect [mesAnoVisivel, alunos] recarregará 'alunosComStatus' automaticamente
          } catch (e) {
            console.log("Erro ao remover aluno (Context):", e);
            Alert.alert("Erro", "Não foi possível remover o aluno.");
          }
        },
      },
    ]);
  };
  // FIM DA MUDANÇA (1/2)
  // ****************************************************


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
        const dataFormatadaISO = formatarDataISO(novaDataVencimentoObj); 

        if (isNaN(valorFloat) || valorFloat <= 0) {
            Alert.alert("Valor Inválido", "Insira um valor numérico positivo.");
            return false; 
        }
        if (!dataFormatadaISO) {
             Alert.alert("Data Inválida", "Selecione uma data de vencimento válida.");
            return false; 
        }

        try {
            await salvarMensalidade(valorFloat, dataFormatadaISO); 
            setValorMensalidade(valorFloat.toString());
            setDataVencimento(novaDataVencimentoObj);
            setDiaVencimentoAtual(novaDataVencimentoObj.getUTCDate()); 
            const novoMesAnoFaturamento = getMesAnoDeFaturamentoAtual(novaDataVencimentoObj.getUTCDate());
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
          alunosBase: alunos, // <--- EXPOR A LISTA BASE
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
      }}
    >
      {children}
    </AlunosContext.Provider>
  );
}