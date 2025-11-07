import React, { useState, useEffect, useContext } from "react";
import {
  View,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  StatusBar,
  FlatList,
  TextInput,
  Alert,
  Platform,
  Image,
  Modal,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context"; // Adicionado
import DateTimePicker from "@react-native-community/datetimepicker";
import Texto from "../components/Texto";
import { AlunosContext } from "../components/AlunosContext";

const { width } = Dimensions.get("window");

function formatarData(data) {
    if (!data) return "Selecione a data";
    const dia = data.getDate().toString().padStart(2, "0");
    const mes = (data.getMonth() + 1).toString().padStart(2, "0");
    const ano = data.getFullYear();
    return `${dia}/${mes}/${ano}`;
}

const formatarMesAnoDisplay = (mesAnoString) => {
    if (!mesAnoString) return "";
    const [ano, mes] = mesAnoString.split('-');
    const meses = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
    return `${meses[parseInt(mes, 10) - 1]}/${ano}`;
};


export default function MensalidadesScreen({ navigation }) {

  const {
      alunos,
      updateAlunoStatus,
      carregarAlunos, // Para garantir recarregamento se necessário
      mesAnoVisivel,
      mesAnterior,
      proximoMes,
      isProximoMesFuturo,
      valorMensalidade: valorMensalidadeContext,
      dataVencimento: dataVencimentoContext,
      atualizarConfigMensalidade
  } = useContext(AlunosContext);


  const [valorModal, setValorModal] = useState("0");
  const [dataModal, setDataModal] = useState(new Date());

  const [mostrarDatePicker, setMostrarDatePicker] = useState(false);
  const [totalPago, setTotalPago] = useState(0);
  const [totalNaoPago, setTotalNaoPago] = useState(0);
  const [totalEsperado, setTotalEsperado] = useState(0);

  const [modalResumoVisivel, setModalResumoVisivel] = useState(false);
  const [modalConfigVisivel, setModalConfigVisivel] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);

  // Carrega os valores do contexto para o modal quando ele abre
  useEffect(() => {
    setValorModal(valorMensalidadeContext);
    setDataModal(dataVencimentoContext);
  }, [valorMensalidadeContext, dataVencimentoContext]);

  // Calcula o resumo (usa valorMensalidadeContext)
  useEffect(() => {
    const valorNum = parseFloat(valorMensalidadeContext) || 0;
    let pagos = 0;
    alunos.forEach(aluno => {
        if (aluno.status === "Pago") {
            pagos++;
        }
    });
    const naoPagos = alunos.length - pagos;
    setTotalPago(pagos);
    setTotalNaoPago(naoPagos);
    setTotalEsperado(alunos.length * valorNum);
  }, [alunos, valorMensalidadeContext]);

  const handleSalvarConfig = async () => {
    // Chama a função do contexto passando os valores do modal
    const sucesso = await atualizarConfigMensalidade(valorModal, dataModal);
    if (sucesso) {
      setModalConfigVisivel(false);
      Alert.alert("Sucesso", "Configurações de mensalidade salvas.");
    }
  };

  const handleToggleStatus = async (aluno) => {
      if (!isEditMode) return;
      const novoStatus = aluno.status === "Pago" ? "Não Pago" : "Pago";
      try {
          await updateAlunoStatus(aluno.id, novoStatus, mesAnoVisivel);
      } catch (error) {
          console.error("Erro ao atualizar status (Tela Mensalidades):", error);
      }
  };

  const aoSelecionarData = (event, selectedDate) => {
    const currentDate = selectedDate || dataModal;
    setMostrarDatePicker(Platform.OS === "ios");
    setDataModal(currentDate);
  };


  const renderAlunoItem = ({ item }) => (
    <TouchableOpacity
      style={[
          styles.cardAluno,
          item.status === "Pago" ? styles.cardAlunoPago : styles.cardAlunoNaoPago,
          isEditMode && styles.cardAlunoEditavel
      ]}
      onPress={() => handleToggleStatus(item)}
      activeOpacity={isEditMode ? 0.7 : 1.0}
    >
      <Texto style={styles.nomeAluno}>{item.nome}</Texto>
      <View style={item.status === "Pago" ? styles.statusBadgePago : styles.statusBadgeNaoPago}>
            <Texto style={styles.statusTextoBadge}>{item.status}</Texto>
      </View>
    </TouchableOpacity>
  );

  return (<>
  <StatusBar barStyle="light-content" backgroundColor="#0A0E21" />
    <SafeAreaView style={styles.safeArea} edges={['bottom', 'left', 'right']}>
      <View style={styles.container}>
         <View style={styles.headerNav}>
           <TouchableOpacity onPress={() => navigation.goBack()} style={styles.botaoVoltar}>
               <Image source={require('../assets/voltar.png')} style={styles.iconeVoltar} />
           </TouchableOpacity>

           <TouchableOpacity onPress={() => setModalResumoVisivel(true)} style={styles.botaoHeaderIcone}>
                <Image source={require('../assets/historico.png')} style={styles.iconeHeader} />
           </TouchableOpacity>

           <Texto style={styles.titulo}>Mensalidades</Texto>

           <TouchableOpacity onPress={() => setModalConfigVisivel(true)} style={styles.botaoHeaderIcone}>
                <Image source={require('../assets/configuracoes.png')} style={styles.iconeHeader} />
           </TouchableOpacity>

           <View style={{ width: 28 }} />
         </View>

        <View style={styles.navegacaoMesContainer}>
            <TouchableOpacity onPress={mesAnterior} style={styles.botaoNavMes}>
                <Texto style={styles.botaoTextoNavMes}>{"< Anterior"}</Texto>
            </TouchableOpacity>
            <Texto style={styles.mesAnoDisplay}>{formatarMesAnoDisplay(mesAnoVisivel)}</Texto>
            <TouchableOpacity
                onPress={proximoMes}
                style={[styles.botaoNavMes, isProximoMesFuturo() && styles.botaoNavMesDisabled]}
                disabled={isProximoMesFuturo()}
            >
                <Texto style={styles.botaoTextoNavMes}>{"Próximo >"}</Texto>
            </TouchableOpacity>
        </View>

        <View style={styles.listaHeaderContainer}>
            <Texto style={styles.subtituloLista}>Alunos</Texto>
            {isEditMode ? (
                <TouchableOpacity style={[styles.botaoHeaderAcao, styles.botaoSalvar]} onPress={() => setIsEditMode(false)}>
                    <Texto style={[styles.botaoHeaderAcaoTexto, {color: 'white'}]}>Concluir</Texto>
                </TouchableOpacity>
            ) : (
                <TouchableOpacity style={styles.botaoHeaderAcao} onPress={() => setIsEditMode(true)}>
                    <Image source={require('../assets/configuracoes.png')} style={styles.iconeEditar} />
                    <Texto style={styles.botaoHeaderAcaoTexto}>Editar Status</Texto>
                </TouchableOpacity>
            )}
        </View>

         {isEditMode && (
            <Texto style={styles.editHelperText}>Toque em um aluno para alterar o status de pagamento.</Texto>
         )}


        <FlatList
          data={alunos}
          renderItem={renderAlunoItem}
          keyExtractor={(item) => item.id.toString()}
          style={styles.listaAlunos}
          ListEmptyComponent={
            <Texto style={styles.textoVazio}>Nenhum aluno cadastrado.</Texto>
          }
           extraData={alunos}
        />
      </View>

      <Modal
        visible={modalResumoVisivel}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setModalResumoVisivel(false)}
      >
        <TouchableOpacity style={styles.modalFundo} activeOpacity={1} onPressOut={() => setModalResumoVisivel(false)}>
            <TouchableOpacity style={styles.modalBox} activeOpacity={1}>
                <Texto style={styles.modalTitulo}>Resumo de {formatarMesAnoDisplay(mesAnoVisivel)}</Texto>
                <View style={styles.resumoLinha}>
                    <Texto style={styles.resumoLabel}>Pagos:</Texto>
                    <Texto style={[styles.resumoValor, styles.statusPago]}>{totalPago}</Texto>
                </View>
                <View style={styles.resumoLinha}>
                    <Texto style={styles.resumoLabel}>Não Pagos:</Texto>
                    <Texto style={[styles.resumoValor, styles.statusNaoPago]}>{totalNaoPago}</Texto>
                </View>
                <View style={styles.resumoLinha}>
                    <Texto style={styles.resumoLabel}>Total Alunos:</Texto>
                    <Texto style={styles.resumoValor}>{alunos.length}</Texto>
                </View>
                <View style={styles.resumoLinha}>
                    <Texto style={styles.resumoLabel}>Valor Esperado:</Texto>
                    <Texto style={styles.resumoValor}>R$ {(alunos.length * (parseFloat(valorMensalidadeContext) || 0)).toFixed(2)}</Texto>
                </View>
                 <TouchableOpacity style={styles.botaoModalFechar} onPress={() => setModalResumoVisivel(false)}>
                    <Texto style={styles.botaoTexto}>Fechar</Texto>
                </TouchableOpacity>
            </TouchableOpacity>
        </TouchableOpacity>
      </Modal>

      {/* --- MODAL DE CONFIGURAÇÕES --- */}
        <Modal
            visible={modalConfigVisivel}
            animationType="fade"
            transparent={true}
            onRequestClose={() => setModalConfigVisivel(false)}
        >
            <TouchableOpacity style={styles.modalFundo} activeOpacity={1} onPressOut={() => setModalConfigVisivel(false)}>
                <TouchableOpacity style={styles.modalBox} activeOpacity={1}>
                    <Texto style={styles.modalTitulo}>Configurações</Texto>

                    <Texto style={styles.label}>Valor da Mensalidade (R$):</Texto>
                    <TextInput
                        style={styles.inputConfig}
                        keyboardType="numeric"
                        value={valorModal} // Usa estado local do modal
                        onChangeText={setValorModal} // Atualiza estado local
                    />

                    <Texto style={styles.label}>Próximo Vencimento:</Texto>
                    <TouchableOpacity
                        style={styles.inputConfig}
                        onPress={() => setMostrarDatePicker(true)}
                    >
                        <Texto style={styles.dataTexto}>{formatarData(dataModal)}</Texto>
                    </TouchableOpacity>

                    {mostrarDatePicker && (
                        <DateTimePicker
                        value={dataModal || new Date()} // Usa estado local
                        mode="date"
                        display={Platform.OS === "ios" ? "spinner" : "default"}
                        onChange={aoSelecionarData} // Atualiza estado local
                        minimumDate={new Date()}
                        />
                    )}

                    <View style={styles.botoesModalContainer}>
                        <TouchableOpacity style={[styles.botaoModalAcao, styles.botaoCancelar]} onPress={() => setModalConfigVisivel(false)}>
                            <Texto style={styles.botaoTexto}>Cancelar</Texto>
                        </TouchableOpacity>
                        <TouchableOpacity style={[styles.botaoModalAcao, styles.botaoSalvarConfig]} onPress={handleSalvarConfig}>
                            <Texto style={styles.botaoTexto}>Salvar</Texto>
                        </TouchableOpacity>
                    </View>

                </TouchableOpacity>
            </TouchableOpacity>
        </Modal>
    </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#050a24",
    paddingTop: 10, 
  },
  container: {
    flex: 1,
    paddingHorizontal: 15,
  },
   headerNav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    top: 15,
    marginBottom: 25,
    paddingHorizontal: 5,
  },
  botaoVoltar: {
     padding: 5,
     width: 28,
     alignItems: 'flex-start'
  },
  iconeVoltar: {
      width: 28,
      height: 28,
      resizeMode: 'contain',
  },
   botaoHeaderIcone: {
       padding: 5,
       width: 43,
       alignItems: 'flex-end'
   },
   iconeHeader: {
       width: 26,
       height: 26,
       resizeMode: 'contain',
       tintColor: '#AAB1C4'
   },
  titulo: {
    color: "#FFF",
    fontSize: 24,
    fontWeight: "bold",
     textAlign: 'center',
     flex: 1,
     marginHorizontal: 10,
  },
  // Navegação Mês
   navegacaoMesContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 8,
        marginBottom: 10,
        backgroundColor: '#101629',
        borderRadius: 8,
        paddingHorizontal: 5,
   },
   botaoNavMes: {
       paddingHorizontal: 15,
       paddingVertical: 8,
   },
   botaoNavMesDisabled: {
       opacity: 0.4,
   },
   botaoTextoNavMes: {
       color: '#FFF',
       fontSize: 16,
       fontWeight: 'bold',
   },
   mesAnoDisplay: {
       color: '#FFF',
       fontSize: 18,
       fontWeight: 'bold',
   },
  listaHeaderContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 5,
      paddingHorizontal: 5,
  },
  subtituloLista: {
      color: "white",
      fontSize: 18,
      fontWeight: "bold",
      textAlign: 'left',
      flex: 1,
  },
  botaoHeaderAcao: { // Botão Editar
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: '#1c2337',
      paddingVertical: 8,
      paddingHorizontal: 12,
      borderRadius: 8,
  },
  botaoSalvar: { // Botão Concluir
      backgroundColor: '#0B49C1',
  },
  botaoHeaderAcaoTexto: {
      color: '#AAB1C4',
      fontSize: 14,
      fontWeight: 'bold',
      marginLeft: 5,
  },
  iconeEditar: {
       width: 16,
       height: 16,
       tintColor: '#AAB1C4',
  },
  editHelperText: {
      color: '#AAB1C4',
      fontSize: 12,
      textAlign: 'center',
      marginBottom: 10,
      fontStyle: 'italic',
  },

  //Lista Alunos
  listaAlunos: {
    flex: 1,
    marginBottom: 10,
  },
  cardAluno: {
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
    borderLeftWidth: 4,
  },
  cardAlunoPago: {
      backgroundColor: "#1f2937",
      borderColor: "limegreen",
  },
  cardAlunoNaoPago: {
      backgroundColor: "#1c2337",
      borderColor: "orange",
  },
  nomeAluno: {
    color: "white",
    fontSize: 16,
     flex: 1,
     marginRight: 8,
  },
  statusBadgePago: {
      backgroundColor: 'limegreen',
      borderRadius: 10,
      paddingHorizontal: 10,
      paddingVertical: 3,
      minWidth: 70,
      alignItems: 'center',
  },
  statusBadgeNaoPago: {
      backgroundColor: 'orange',
      borderRadius: 10,
      paddingHorizontal: 10,
      paddingVertical: 3,
       minWidth: 70,
       alignItems: 'center',
  },
  statusTextoBadge: {
      color: '#050a24',
      fontSize: 11,
      fontWeight: 'bold',
      textTransform: 'uppercase',
  },
  textoVazio: {
    color: "#AAB1C4",
    textAlign: "center",
    marginTop: 30,
    fontSize: 16,
  },

  // Estilos de Modal
   modalFundo: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.7)',
        padding: Platform.OS === 'ios' ? 20 : 0,
    },
    modalBox: {
        backgroundColor: '#1c2337',
        borderRadius: 16,
        padding: 20,
        width: '90%',
        maxWidth: 400,
    },
    modalTitulo: {
        color: '#fff',
        fontSize: 20,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 20,
    },
    resumoLinha: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 10,
        paddingBottom: 5,
        borderBottomWidth: 1,
        borderBottomColor: '#373e4f'
    },
    resumoLabel: {
        color: '#AAB1C4',
        fontSize: 16,
    },
    resumoValor: {
        color: '#FFF',
        fontSize: 16,
        fontWeight: 'bold',
    },
     statusPago: {
        color: "limegreen",
    },
    statusNaoPago: {
        color: "orange",
    },
     botaoModalFechar: {
         backgroundColor: "#373e4f",
         paddingVertical: 12,
         borderRadius: 10,
         alignItems: "center",
         marginTop: 20,
     },
    label: {
        color: "#AAB1C4",
        fontSize: 16,
        marginBottom: 8,
        marginTop: 5,
    },
     inputConfig: {
        backgroundColor: "#373e4f",
        borderRadius: 8,
        paddingHorizontal: 15,
        paddingVertical: 12,
        fontSize: 16,
        color: "#ffffff",
        marginBottom: 10,
        justifyContent: 'center',
    },
     dataTexto: {
      color: "#fff",
      fontSize: 15, 
    },
    botoesModalContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 20,
        gap: 10,
    },
    botaoModalAcao: {
        flex: 1,
        paddingVertical: 12,
        borderRadius: 10,
        alignItems: 'center',
    },
    botaoCancelar: {
        backgroundColor: "#373e4f",
    },
    botaoSalvarConfig: {
        backgroundColor: "#0B49C1",
    },
    botaoTexto: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "bold",
    },
});