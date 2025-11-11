import React, { useContext, useState } from "react";
import Texto from "../components/Texto";
import {
  View,
  FlatList,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Modal,
  Image,
  Dimensions,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context"; // Adicionado
import DateTimePicker from "@react-native-community/datetimepicker";
import { LembretesContext } from "../components/LembretesContext";

const { width } = Dimensions.get("window");

function formatarData(data) {
  if (!data) return ""; // verificação
  const dia = data.getDate().toString().padStart(2, "0");
  const mes = (data.getMonth() + 1).toString().padStart(2, "0");
  const ano = data.getFullYear();
  return `${dia}/${mes}/${ano}`;
}

function formatarHora(data) {
  if (!data) return ""; //  verificação
  const hora = data.getHours().toString().padStart(2, "0");
  const min = data.getMinutes().toString().padStart(2, "0");
  return `${hora}:${min}`;
}

// Função para parsear data e hora de volta para um objeto Date
function parseDataHora(dataStr, horaStr) {
  try {
    const [dia, mes, ano] = dataStr.split("/");
    const [h, m] = horaStr.split(":");
    // Ano, Mês (0-indexado), Dia, Hora, Minuto
    return new Date(ano, mes - 1, dia, h, m);
  } catch (e) {
    console.error("Erro ao parsear data/hora:", e);
    return new Date(); // Retorna data atual
  }
}

export default function LembretesScreen({ navigation }) {
  const { lembretes, adicionarLembrete, editarLembrete, removerLembrete } =
    useContext(LembretesContext);

  const [modalVisible, setModalVisible] = useState(false);
  const [editarIndex, setEditarIndex] = useState(null);
  const [tituloInput, setTituloInput] = useState("");

  // Estados para os PICKERS (Date Objects)
  const [dataSelecionada, setDataSelecionada] = useState(new Date());
  const [horaSelecionada, setHoraSelecionada] = useState(new Date());

  // Estados para os INPUTS (Strings)
  const [dataInput, setDataInput] = useState(""); // Começa vazio por padrão
  const [horaInput, setHoraInput] = useState(""); // Começa vazio por padrão

  const [mostrarDatePicker, setMostrarDatePicker] = useState(false);
  const [mostrarHoraPicker, setMostrarHoraPicker] = useState(false);

  const abrirModal = (lembreteParaEditar = null) => {
    // Recebe o objeto lembrete
    if (lembreteParaEditar) {
      setEditarIndex(lembreteParaEditar.id); // Armazena o ID
      setTituloInput(lembreteParaEditar.titulo);

      const dataStr = lembreteParaEditar.data; // DD/MM/YYYY
      const horaStr = lembreteParaEditar.hora || formatarHora(new Date());
      setDataInput(dataStr); // Define a string do input
      setHoraInput(horaStr); // Define a string do input

      const dataObj = parseDataHora(dataStr, horaStr);
      setDataSelecionada(dataObj);
      setHoraSelecionada(dataObj);
    } else {
      setEditarIndex(null);
      setTituloInput("");
      const hoje = new Date();
      // Inicializa os pickers com a data/hora atual
      setDataSelecionada(hoje);
      setHoraSelecionada(hoje);
      // Inicia campos de texto vazios
      setDataInput("");
      setHoraInput("");
    }
    setMostrarDatePicker(false);
    setMostrarHoraPicker(false);
    setModalVisible(true);
  };

  const handleSalvarLembrete = () => {
    if (!tituloInput.trim() || !dataInput.trim() || !horaInput.trim()) {
      Alert.alert("Erro", "Preencha título, data e hora.");
      return;
    }

    // Combina a Data selecionada com a Hora selecionada
    const triggerDate = new Date(dataSelecionada); // Começa com a data (Dia, Mês, Ano)
    triggerDate.setHours(horaSelecionada.getHours()); // Define a hora
    triggerDate.setMinutes(horaSelecionada.getMinutes()); // Define os minutos
    triggerDate.setSeconds(0); // Zera os segundos

    // Verifica se a data/hora está no passado
    if (triggerDate < new Date()) {
      Alert.alert(
        "Data Inválida",
        "O lembrete não pode ser agendado no passado."
      );
      return;
    }

    // Chama o contexto com o objeto Date combinado
    if (editarIndex !== null) {
      editarLembrete(editarIndex, tituloInput, triggerDate); // Passa o ID e o Date
    } else {
      adicionarLembrete(tituloInput, triggerDate); // Passa o título e o Date
    }

    setModalVisible(false);
  };

  const abrirDatePicker = () => setMostrarDatePicker(true);
  const abrirHoraPicker = () => setMostrarHoraPicker(true);

  const aoSelecionarData = (event, selectedDate) => {
    setMostrarDatePicker(Platform.OS === "ios");
    if (selectedDate) {
      setDataSelecionada(selectedDate); // Atualiza o Date
      setDataInput(formatarData(selectedDate)); // Atualiza a String do input
    }
  };

  const aoSelecionarHora = (event, selectedTime) => {
    setMostrarHoraPicker(Platform.OS === "ios");
    if (selectedTime) {
      setHoraSelecionada(selectedTime); // Atualiza o Date
      setHoraInput(formatarHora(selectedTime)); // Atualiza a String do input
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={["bottom", "left", "right"]}>
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
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.conteudo}>
        <FlatList
          data={lembretes}
          keyExtractor={(item) => item.id?.toString()} // Usa ID se disponível
          style={styles.lista}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Texto style={styles.emptyText}>Nenhum lembrete registrado</Texto>
            </View>
          }
          renderItem={({ item }) => ( // Passa o objeto item diretamente
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
                {/* Chama diretamente a função 'removerLembrete' do contexto */}
                <TouchableOpacity
                  style={styles.botaoRemover}
                  onPress={() => removerLembrete(item.id)} // Passa o ID para remoção
                >
                  <Texto style={styles.botaoAcaoTexto}>Excluir</Texto>
                </TouchableOpacity>
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
              <TextInput
                style={styles.input}
                placeholder="Digite o título do lembrete"
                placeholderTextColor="#AAB1C4"
                value={tituloInput}
                onChangeText={setTituloInput}
              />

              <Texto style={styles.label}>Data</Texto>
              <TouchableOpacity
                onPress={abrirDatePicker}
                style={styles.inputData}
              >
                <Texto
                  style={
                    dataInput ? styles.dataHoraTexto : styles.placeholderTexto
                  }
                >
                  {dataInput || "Selecionar data"}
                </Texto>
              </TouchableOpacity>
              {mostrarDatePicker && (
                <DateTimePicker
                  value={dataSelecionada}
                  mode="date"
                  display={Platform.OS === "ios" ? "spinner" : "default"}
                  onChange={aoSelecionarData}
                  minimumDate={new Date()} // Impede selecionar data passada
                />
              )}

              <Texto style={styles.label}>Hora</Texto>
              <TouchableOpacity
                onPress={abrirHoraPicker}
                style={styles.inputData}
              >
                <Texto
                  style={
                    horaInput ? styles.dataHoraTexto : styles.placeholderTexto
                  }
                >
                  {horaInput || "Selecionar hora"}
                </Texto>
              </TouchableOpacity>
              {mostrarHoraPicker && (
                <DateTimePicker
                  value={horaSelecionada}
                  mode="time"
                  is24Hour={true}
                  // Esta linha força o seletor digital (de rolo)
                  display="spinner" 
                  onChange={aoSelecionarHora}
                />
              )}
              <View style={styles.modalBotoes}>
                <TouchableOpacity
                  style={[styles.botaoModal, styles.botaoCancelar]}
                  onPress={() => setModalVisible(false)}
                >
                  <Texto style={styles.botaoModalTexto}>Cancelar</Texto>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.botaoModal}
                  onPress={handleSalvarLembrete}
                >
                  <Texto style={styles.botaoModalTexto}>Salvar</Texto>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#050a24",
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  conteudo: {
    flex: 1,
    paddingBottom: 10,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    top: 15,
    marginBottom: 30,
  },
  botaoVoltar: {
    padding: 10,
  },
  titulo: {
    color: "#FFF",
    fontSize: 28,
    fontWeight: "bold",
    textAlign: "center",
    flex: 1,
  },
  iconeVoltar: {
    width: 38,
    height: 38,
    resizeMode: "contain",
  },
  lista: {
    flex: 1,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 50,
  },
  emptyText: {
    color: "#AAB1C4",
    fontSize: 16,
    textAlign: "center",
  },
  lembreteItem: {
    backgroundColor: "#1c2337",
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 16,
    marginBottom: 15,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  lembreteInfo: {
    flex: 1,
    marginRight: 15,
  },
  lembreteTitulo: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 5,
  },
  lembreteData: {
    color: "#AAB1C4",
    fontSize: 14,
  },
  botaoRemover: {
    paddingHorizontal: 15,
    height: 35,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#c41628ff",
  },
  botaoAcaoTexto: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#fff",
  },
  botaoNovo: {
    backgroundColor: "#0B49C1",
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: "center",
    marginTop: 20,
    width: "100%",
  },
  botaoTextoNovo: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  modalFundo: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.7)",
  },
  modalContainer: {
    backgroundColor: "#1c2337",
    padding: 20,
    borderRadius: 16,
    width: "90%",
    maxWidth: 400,
  },
  modalTitulo: {
    color: "#fff",
    fontSize: 20,
    marginBottom: 20,
    textAlign: "center",
    fontWeight: "bold",
  },
  label: {
    color: "#fff",
    fontSize: 16,
    marginBottom: 8,
    marginTop: 10,
    alignSelf: "flex-start",
  },
  input: {
    backgroundColor: "#373e4f",
    width: "100%",
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingVertical: 12,
    marginBottom: 15,
    fontSize: 16,
    color: "#ffffff",
  },
  inputData: {
    backgroundColor: "#373e4f",
    width: "100%",
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingVertical: 12,
    marginBottom: 15,
    justifyContent: "center",
    height: 48,
  },
  dataHoraTexto: {
    fontSize: 16,
    color: "#fff",
  },
  placeholderTexto: {
    fontSize: 16,
    color: "#AAB1C4",
  },
  modalBotoes: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
    gap: 10,
  },
  botaoModal: {
    backgroundColor: "#0B49C1",
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: "center",
    flex: 1,
  },
  botaoCancelar: {
    backgroundColor: "#373e4f",
  },
  botaoModalTexto: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});