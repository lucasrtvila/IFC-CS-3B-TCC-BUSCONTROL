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
import DateTimePicker from "@react-native-community/datetimepicker";
import { LembretesContext } from "../components/LembretesContext";

const { width } = Dimensions.get("window");

function formatarData(data) {
  const dia = data.getDate().toString().padStart(2, "0");
  const mes = (data.getMonth() + 1).toString().padStart(2, "0");
  const ano = data.getFullYear();
  return `${dia}/${mes}/${ano}`;
}

function formatarHora(data) {
  const hora = data.getHours().toString().padStart(2, "0");
  const min = data.getMinutes().toString().padStart(2, "0");
  return `${hora}:${min}`;
}

export default function LembretesScreen({ navigation }) {
  const { lembretes, adicionarLembrete, editarLembrete, removerLembrete } =
    useContext(LembretesContext);

  const [modalVisible, setModalVisible] = useState(false);
  const [editarIndex, setEditarIndex] = useState(null);
  const [tituloInput, setTituloInput] = useState("");
  const [dataSelecionada, setDataSelecionada] = useState(new Date());
  const [horaSelecionada, setHoraSelecionada] = useState(new Date());
  const [dataInput, setDataInput] = useState(formatarData(new Date()));
  const [horaInput, setHoraInput] = useState(formatarHora(new Date()));
  const [mostrarDatePicker, setMostrarDatePicker] = useState(false);
  const [mostrarHoraPicker, setMostrarHoraPicker] = useState(false);

  const abrirModal = (index = null) => {
    if (index !== null) {
      setEditarIndex(lembretes[index].id); 
      setTituloInput(lembretes[index].titulo);

      // Separa data e hora do item
      const dataStr = lembretes[index].data;
      const horaStr = lembretes[index].hora || "00:00";
      setDataInput(dataStr);
      setHoraInput(horaStr);

      // Cria objetos Date para os pickers
      const [dia, mes, ano] = dataStr.split("/");
      const [h, m] = horaStr.split(":");
      const dataObj = new Date(ano, mes - 1, dia, h, m);
      setDataSelecionada(dataObj);
      setHoraSelecionada(dataObj);
    } else {
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

  const handleAdicionarLembrete = () => {
    console.log({ tituloInput, dataInput, horaInput, editarIndex });
    if (!tituloInput.trim() || !dataInput.trim() || !horaInput.trim()) {
      Alert.alert("Erro", "Preencha título, data e hora.");
      return;
    }

    if (editarIndex !== null) {
      editarLembrete(editarIndex, tituloInput, dataInput, horaInput);
    } else {
      adicionarLembrete(tituloInput, dataInput, horaInput);
    }
    
    setModalVisible(false);
  };

  const abrirDatePicker = () => setMostrarDatePicker(true);
  const abrirHoraPicker = () => setMostrarHoraPicker(true);

  const aoSelecionarData = (event, selectedDate) => {
    setMostrarDatePicker(Platform.OS === "ios");
    if (selectedDate) {
      setDataSelecionada(selectedDate);
      setDataInput(formatarData(selectedDate));
    }
  };

  const aoSelecionarHora = (event, selectedTime) => {
    setMostrarHoraPicker(Platform.OS === "ios");
    if (selectedTime) {
      setHoraSelecionada(selectedTime);
      setHoraInput(formatarHora(selectedTime));
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
      </View>

      <View style={styles.conteudo}>
        <FlatList
          data={lembretes}
          keyExtractor={item => item.id?.toString()}
          style={styles.lista}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Texto style={styles.emptyText}>Nenhum lembrete registrado</Texto>
            </View>
          }
          renderItem={({ item }) => (
            <View style={styles.lembreteItem}>
              <TouchableOpacity
                style={styles.lembreteInfo}
                onPress={() => abrirModal(lembretes.findIndex(l => l.id === item.id))}
              >
                <Texto style={styles.lembreteTitulo} numberOfLines={2}>
                  {item.titulo}
                </Texto>
                <Texto style={styles.lembreteData}>
                  {item.data} - {item.hora ? item.hora : ""}
                </Texto>
              </TouchableOpacity>

              <View style={styles.excluirContainer}>
                <TouchableOpacity
                  style={styles.botaoRemover}
                  onPress={() => removerLembrete(item.id)}
                >
                  <Texto style={styles.botaoAcaoTexto}>Excluir</Texto>
                </TouchableOpacity>
              </View>
            </View>
          )}
        />

        <TouchableOpacity style={styles.botaoNovo} onPress={() => abrirModal()}>
          <Texto style={styles.botaoTexto}>Adicionar Lembrete</Texto>
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
                placeholderTextColor="#cfcfcf"
                value={tituloInput}
                onChangeText={setTituloInput}
              />

              <Texto style={styles.label}>Data</Texto>
              <TouchableOpacity
                onPress={abrirDatePicker}
                style={styles.inputData}
              >
                <Texto style={{ color: dataInput ? "#fff" : "#cfcfcf" }}>
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
                style={styles.inputData}
              >
                <Texto style={{ color: horaInput ? "#fff" : "#cfcfcf" }}>
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

              <View style={styles.modalBotoes}>
                <TouchableOpacity
                  style={[styles.botao, styles.botaoCancelar]}
                  onPress={() => setModalVisible(false)}
                >
                  <Texto style={styles.botaoTexto}>Cancelar</Texto>
                </TouchableOpacity>
                
                <TouchableOpacity style={styles.botao} onPress={handleAdicionarLembrete}>
                  <Texto style={styles.botaoTexto}>Salvar</Texto>
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
    paddingVertical:30,
  },
  conteudo: {
    flex: 1,
    paddingBottom: 10,
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
    position: "relative",
    marginBottom: 20,
  },

  botaoVoltar: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
    position: "absolute",
    left: 3,
    zIndex: 1,
  },

  titulo: {
    color: "#FFF",
    fontSize: 28,
    fontWeight: "bold",
    textAlign: "center",
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
    marginTop: 20,
  },

  emptyText: {
    color: "#cfcfcf",
    fontSize: 16,
    textAlign: "center",
  },

  lembreteItem: {
    backgroundColor: "#1c2337",
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 16,
    marginBottom: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  lembreteInfo: {
    flex: 1,
  },

  lembreteTitulo: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 5,
  },

  lembreteData: {
    color: "#cfcfcf",
    fontSize: 14,
  },

  excluirContainer: {
    flexDirection: "row",
    gap: 10,
    marginLeft: 20,
  },

  botaoRemover: {
    width: 70,
    height: 35,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#c41628ff",
  },

  botaoAcaoTexto: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#cfcfcf",
  },

  botaoNovo: {
    backgroundColor: "#0B49C1",
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 16,
    alignItems: "center",
    marginTop: 20,
    width: "100%",
  },

  botaoTexto: {
    color: "#fff",
    fontSize: 22,
    fontWeight: "bold",
  },

  modalFundo: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#000000aa",
  },

  modalContainer: {
    backgroundColor: "#1c2337",
    padding: 20,
    borderRadius: 16,
    width: "90%",
  },

  modalTitulo: {
    color: "#fff",
    fontSize: 20,
    marginBottom: 15,
    textAlign: "center",
    fontWeight: "bold",
  },

  label: {
    color: "#fff",
    fontSize: 16,
    marginBottom: 8,
    marginTop: 10,
  },

  input: {
    backgroundColor: "#373e4f",
    width: "100%",
    borderRadius: 16,
    paddingHorizontal: 15,
    paddingVertical: 12,
    marginBottom: 15,
    fontSize: 16,
    color: "#ffffff",
  },

  inputData: {
    backgroundColor: "#373e4f",
    borderRadius: 16,
    paddingHorizontal: 15,
    paddingVertical: 12,
    marginBottom: 15,
    justifyContent: "center",
  },

  modalBotoes: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
    gap: 10,
  },

  botao: {
    backgroundColor: "#0B49C1",
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 16,
    alignItems: "center",
    marginTop: 20,
    width: "100%",
  },

  botaoCancelar: {
    backgroundColor: "#373e4f",
  },
});
