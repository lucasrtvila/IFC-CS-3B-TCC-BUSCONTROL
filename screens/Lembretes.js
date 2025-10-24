import React, { useContext, useState } from "react";
import Texto from "../components/Texto";
import {
  View,
  FlatList,
  TextInput, // Certifique-se que TextInput está aqui
  TouchableOpacity,
  StyleSheet,
  Alert,
  Modal,
  Image,
  Dimensions,
  Platform,
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { LembretesContext } from "../components/LembretesContext";

const { width } = Dimensions.get("window");

function formatarData(data) {
    if (!data) return ''; // Adiciona verificação
    const dia = data.getDate().toString().padStart(2, "0");
    const mes = (data.getMonth() + 1).toString().padStart(2, "0");
    const ano = data.getFullYear();
    return `${dia}/${mes}/${ano}`;
}

function formatarHora(data) {
    if (!data) return ''; // Adiciona verificação
    const hora = data.getHours().toString().padStart(2, "0");
    const min = data.getMinutes().toString().padStart(2, "0");
    return `${hora}:${min}`;
}

export default function LembretesScreen({ navigation }) {
  const { lembretes, adicionarLembrete, editarLembrete, removerLembrete } =
    useContext(LembretesContext);

  const [modalVisible, setModalVisible] = useState(false);
  const [editarIndex, setEditarIndex] = useState(null); // Agora armazena o ID
  const [tituloInput, setTituloInput] = useState("");
  const [dataSelecionada, setDataSelecionada] = useState(new Date());
  const [horaSelecionada, setHoraSelecionada] = useState(new Date());
  const [dataInput, setDataInput] = useState(formatarData(new Date()));
  const [horaInput, setHoraInput] = useState(formatarHora(new Date()));
  const [mostrarDatePicker, setMostrarDatePicker] = useState(false);
  const [mostrarHoraPicker, setMostrarHoraPicker] = useState(false);

  // Abre o modal para adicionar ou editar
  const abrirModal = (lembreteParaEditar = null) => { // Recebe o objeto lembrete
    if (lembreteParaEditar) {
      setEditarIndex(lembreteParaEditar.id); // Armazena o ID
      setTituloInput(lembreteParaEditar.titulo);

      const dataStr = lembreteParaEditar.data; // DD/MM/YYYY
      const horaStr = lembreteParaEditar.hora || formatarHora(new Date()); // Usa hora atual se não houver
      setDataInput(dataStr);
      setHoraInput(horaStr);

      // Converte DD/MM/YYYY e HH:MM para objeto Date
      try {
        const [dia, mes, ano] = dataStr.split("/");
        const [h, m] = horaStr.split(":");
        const dataObj = new Date(ano, mes - 1, dia, h, m);
        setDataSelecionada(dataObj);
        setHoraSelecionada(dataObj);
      } catch (e) {
          console.error("Erro ao converter data/hora do lembrete:", e)
          const hoje = new Date();
          setDataSelecionada(hoje);
          setHoraSelecionada(hoje);
      }

    } else { // Novo lembrete
      setEditarIndex(null);
      setTituloInput("");
      const hoje = new Date();
      setDataSelecionada(hoje);
      setHoraSelecionada(hoje);
      setDataInput(formatarData(hoje));
      setHoraInput(formatarHora(hoje));
    }
    setMostrarDatePicker(false);
    setMostrarHoraPicker(false);
    setModalVisible(true);
  };

  const handleSalvarLembrete = () => { // Renomeado para handleSalvarLembrete
    console.log({ tituloInput, dataInput, horaInput, editarIndex });
    if (!tituloInput.trim() || !dataInput.trim() || !horaInput.trim()) {
      Alert.alert("Erro", "Preencha título, data e hora.");
      return;
    }

    if (editarIndex !== null) {
      editarLembrete(editarIndex, tituloInput, dataInput, horaInput); // Passa o ID
    } else {
      adicionarLembrete(tituloInput, dataInput, horaInput); //
    }
    
    setModalVisible(false);
  };

  // --- FUNÇÃO DE CONFIRMAÇÃO REMOVIDA DAQUI ---
  // const confirmarRemocao = (id) => { ... }

  const abrirDatePicker = () => setMostrarDatePicker(true);
  const abrirHoraPicker = () => setMostrarHoraPicker(true);

  const aoSelecionarData = (event, selectedDate) => {
    setMostrarDatePicker(Platform.OS === "ios");
    if (selectedDate) {
      setDataSelecionada(selectedDate);
      setDataInput(formatarData(selectedDate)); // Formata para DD/MM/YYYY
    }
  };

  const aoSelecionarHora = (event, selectedTime) => {
    setMostrarHoraPicker(Platform.OS === "ios");
    if (selectedTime) {
      setHoraSelecionada(selectedTime);
      setHoraInput(formatarHora(selectedTime)); // Formata para HH:MM
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.botaoVoltar}
          onPress={() => navigation.navigate("Inicial")}
        >
          <Image
            source={require("../assets/voltar.png")}
            style={styles.iconeVoltar}
          />
        </TouchableOpacity>
        <Texto style={styles.titulo}>Lembretes</Texto>
        {/* Placeholder para centralizar título */}
        <View style={{ width: 40 }}/> 
      </View>

      <View style={styles.conteudo}>
        <FlatList
          data={lembretes}
          keyExtractor={item => item.id?.toString()} // Usa ID se disponível
          style={styles.lista}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Texto style={styles.emptyText}>Nenhum lembrete registrado</Texto>
            </View>
          }
          renderItem={({ item }) => ( // Passa o objeto 'item' diretamente
            <View style={styles.lembreteItem}>
              <TouchableOpacity
                style={styles.lembreteInfo}
                onPress={() => abrirModal(item)} // Passa o objeto lembrete para edição
              >
                <Texto style={styles.lembreteTitulo} numberOfLines={2}>
                  {item.titulo}
                </Texto>
                <Texto style={styles.lembreteData}>
                  {item.data} - {item.hora ? item.hora : ""}
                </Texto>
              </TouchableOpacity>

              <View style={styles.excluirContainer}>
                {/* --- CORREÇÃO AQUI --- */}
                {/* Chama diretamente a função 'removerLembrete' do contexto, que já tem o Alert */}
                <TouchableOpacity
                  style={styles.botaoRemover}
                  onPress={() => removerLembrete(item.id)} // Passa o ID para remoção
                >
                  <Texto style={styles.botaoAcaoTexto}>Excluir</Texto>
                </TouchableOpacity>
                {/* --- FIM DA CORREÇÃO --- */}
              </View>
            </View>
          )}
        />

        <TouchableOpacity style={styles.botaoNovo} onPress={() => abrirModal()}>
          <Texto style={styles.botaoTextoNovo}>Adicionar Lembrete</Texto>
        </TouchableOpacity>

        <Modal visible={modalVisible} animationType="fade" transparent={true}>
          <View style={styles.modalFundo}>
            <View style={styles.modalContainer}>
              <Texto style={styles.modalTitulo}>
                {editarIndex !== null ? "Editar Lembrete" : "Novo Lembrete"}
              </Texto>

              <Texto style={styles.label}>Título</Texto>
              <TextInput // O TextInput estava sendo usado aqui sem importar
                style={styles.input}
                placeholder="Digite o título do lembrete"
                placeholderTextColor="#AAB1C4" // Cor mais suave
                value={tituloInput}
                onChangeText={setTituloInput}
              />

              <Texto style={styles.label}>Data</Texto>
              <TouchableOpacity
                onPress={abrirDatePicker}
                style={styles.inputData} // Estilo de input, mas clicável
              >
                <Texto style={styles.dataHoraTexto}> 
                  {dataInput || "Selecionar data"}
                </Texto>
              </TouchableOpacity>
              {mostrarDatePicker && (
                <DateTimePicker
                  value={dataSelecionada}
                  mode="date"
                  display={Platform.OS === "ios" ? "spinner" : "default"}
                  onChange={aoSelecionarData}
                />
              )}

              <Texto style={styles.label}>Hora</Texto>
              <TouchableOpacity
                onPress={abrirHoraPicker}
                style={styles.inputData} // Estilo de input, mas clicável
              >
                <Texto style={styles.dataHoraTexto}>
                  {horaInput || "Selecionar hora"}
                </Texto>
              </TouchableOpacity>
              {mostrarHoraPicker && (
                <DateTimePicker
                  value={horaSelecionada}
                  mode="time"
                  is24Hour={true}
                  display={Platform.OS === "ios" ? "spinner" : "default"}
                  onChange={aoSelecionarHora}
                />
              )}

              {/* Botões Cancelar e Salvar lado a lado */}
              <View style={styles.modalBotoes}>
                <TouchableOpacity
                  style={[styles.botaoModal, styles.botaoCancelar]} // Aplica estilo [botaoModal, botaoCancelar]
                  onPress={() => setModalVisible(false)}
                >
                  <Texto style={styles.botaoModalTexto}>Cancelar</Texto>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={styles.botaoModal} // Aplica só o estilo base (azul)
                  onPress={handleSalvarLembrete}
                > 
                  <Texto style={styles.botaoModalTexto}>Salvar</Texto>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#050a24",
    paddingHorizontal: 20,
    paddingTop:30, // Aumentado para dar espaço ao header
    paddingVertical: 30,
  },
  conteudo: {
    flex: 1,
    paddingBottom: 10,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between", // Alterado para space-between
    // paddingHorizontal: 20, // Removido, container já tem
    marginBottom: 20,
  },
  botaoVoltar: {
    padding: 10, // Área de toque
  },
  titulo: {
    color: "#FFF",
    fontSize: 28,
    fontWeight: "bold",
    textAlign: "center",
    flex: 1, // Permite que o título centralize corretamente
  },
  iconeVoltar: {
    width: 27,
    height: 27,
    resizeMode: "contain",
  },
  lista: {
    flex: 1,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 50, // Adiciona margem
  },
  emptyText: {
    color: "#AAB1C4", // Cor mais suave
    fontSize: 16,
    textAlign: "center",
  },
  lembreteItem: {
    backgroundColor: "#1c2337",
    paddingVertical: 14,
    paddingHorizontal: 20, // Reduzido padding
    borderRadius: 16,
    marginBottom: 15, // Reduzido margem
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  lembreteInfo: {
    flex: 1, // Ocupa espaço disponível
    marginRight: 15, // Espaço antes dos botões
  },
  lembreteTitulo: {
    color: "#fff",
    fontSize: 18, // Levemente menor
    fontWeight: "bold",
    marginBottom: 5,
  },
  lembreteData: {
    color: "#AAB1C4", // Cor mais suave
    fontSize: 14,
  },
  excluirContainer: {
    // Mantém como está ou ajusta se necessário
  },
  botaoRemover: {
    // Mantém como está ou ajusta se necessário
    paddingHorizontal: 15, // Adiciona padding horizontal
    height: 35,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#c41628ff",
  },
  botaoAcaoTexto: {
    fontSize: 14, // Reduzido
    fontWeight: "bold",
    color: "#fff", // Branco para melhor contraste
  },
  botaoNovo: { 
    backgroundColor: "#0B49C1",
    paddingVertical: 16, // Aumentado padding
    borderRadius: 16,
    alignItems: "center",
    marginTop: 20,
    width: "100%",
  },
  botaoTextoNovo: { 
    color: "#fff",
    fontSize: 18, // Reduzido
    fontWeight: "bold",
  },
  modalFundo: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.7)", // Fundo mais escuro
  },
  modalContainer: {
    backgroundColor: "#1c2337",
    padding: 20,
    borderRadius: 16,
    width: "90%",
    maxWidth: 400, // Largura máxima
  },
  modalTitulo: {
    color: "#fff",
    fontSize: 20,
    marginBottom: 20, // Aumentado margem
    textAlign: "center",
    fontWeight: "bold",
  },
  label: {
    color: "#fff",
    fontSize: 16,
    marginBottom: 8,
    marginTop: 10,
    alignSelf: 'flex-start', // Garante alinhamento
  },
  input: {
    backgroundColor: "#373e4f",
    width: "100%",
    borderRadius: 10, // Menos arredondado
    paddingHorizontal: 15,
    paddingVertical: 12,
    marginBottom: 15,
    fontSize: 16,
    color: "#ffffff",
  },
  inputData: { // Estilo para os TocouhableOpacity de data/hora
    backgroundColor: "#373e4f",
    width: "100%",
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingVertical: 12,
    marginBottom: 15,
    justifyContent: 'center', // Centraliza texto verticalmente
    height: 48, // Altura similar ao TextInput
  },
  dataHoraTexto: { // Estilo para o texto dentro dos TouchableOpacity
      fontSize: 16,
      color: "#fff",
  },
  // --- Estilos Corrigidos dos Botões do Modal ---
  modalBotoes: {
    flexDirection: "row",
    justifyContent: "space-between", // Espaça os botões
    marginTop: 20,
    gap: 10, // Espaço entre os botões
  },
  botaoModal: { // Estilo base COMUM aos botões do modal
    backgroundColor: "#0B49C1", // Azul para Salvar (padrão)
    paddingVertical: 14,
    borderRadius: 10, // Menos arredondado
    alignItems: "center",
    flex: 1, // Faz os botões dividirem o espaço
  },
  botaoCancelar: {
    backgroundColor: "#373e4f", // Cinza para Cancelar
  },
  botaoModalTexto: { // Texto para AMBOS os botões do modal
    color: "#fff",
    fontSize: 16, // Tamanho padrão
    fontWeight: "bold",
  },
  // --- FIM CORREÇÃO ---
});