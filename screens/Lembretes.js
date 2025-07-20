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

export default function LembretesScreen({ navigation }) {
  const { lembretes, setLembretes } = useContext(LembretesContext);

  const [modalVisible, setModalVisible] = useState(false);
  const [editarIndex, setEditarIndex] = useState(null);
  const [tituloInput, setTituloInput] = useState("");
  const [dataSelecionada, setDataSelecionada] = useState(new Date());
  const [dataInput, setDataInput] = useState(formatarData(new Date()));
  const [mostrarDatePicker, setMostrarDatePicker] = useState(false);

  const abrirModal = (index = null) => {
    if (index !== null) {
      setEditarIndex(index);
      setTituloInput(lembretes[index].titulo);
      setDataInput(lembretes[index].data);
      setDataSelecionada(new Date(lembretes[index].data));
    } else {
      setEditarIndex(null);
      setTituloInput("");
      const hoje = new Date();
      setDataSelecionada(hoje);
      setDataInput(formatarData(hoje));
    }
    setMostrarDatePicker(false);
    setModalVisible(true);
  };

  const salvarLembrete = () => {
    if (!tituloInput.trim() || !dataInput.trim()) {
      Alert.alert("Erro", "Preencha título e data.");
      return;
    }

    if (editarIndex !== null) {
      const novosLembretes = [...lembretes];
      novosLembretes[editarIndex] = { titulo: tituloInput, data: dataInput };
      setLembretes(novosLembretes);
    } else {
      setLembretes([...lembretes, { titulo: tituloInput, data: dataInput }]);
    }

    setModalVisible(false);
  };

  const removerLembrete = (index) => {
    Alert.alert(
      "Confirmar remoção",
      "Deseja realmente remover este lembrete?",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Remover",
          style: "destructive",
          onPress: () => {
            const novosLembretes = lembretes.filter((_, i) => i !== index);
            setLembretes(novosLembretes);
          },
        },
      ]
    );
  };

  const abrirDatePicker = () => {
    setMostrarDatePicker(true);
  };

  const aoSelecionarData = (event, selectedDate) => {
    setMostrarDatePicker(Platform.OS === "ios"); // No iOS pode deixar aberto até o usuário fechar
    if (selectedDate) {
      setDataSelecionada(selectedDate);
      setDataInput(formatarData(selectedDate));
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
        <View style={styles.espacoVazio} />
      </View>
      <View style={styles.conteudo}>
        <FlatList
          data={lembretes}
          keyExtractor={(_, index) => index.toString()}
          style={styles.lista}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Texto style={styles.emptyText}>Nenhum lembrete registrado</Texto>
            </View>
          }
          renderItem={({ item, index }) => (
            <View style={styles.lembreteItem}>
              <View style={styles.lembreteInfo}>
                <Texto style={styles.lembreteTitulo} numberOfLines={2}>
                  {item.titulo}
                </Texto>
                <Texto style={styles.lembreteData}>{item.data}</Texto>
              </View>
              <View style={styles.botoesContainer}>
                <TouchableOpacity
                  style={[styles.botaoAcao, styles.botaoEditar]}
                  onPress={() => abrirModal(index)}
                >
                  <Texto style={styles.botaoAcaoTexto}>✏️</Texto>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.botaoAcao, styles.botaoRemover]}
                  onPress={() => removerLembrete(index)}
                >
                  <Texto style={styles.botaoAcaoTexto}>🗑️</Texto>
                </TouchableOpacity>
              </View>
            </View>
          )}
        />

        <TouchableOpacity style={styles.botaoNovo} onPress={() => abrirModal()}>
          <Texto style={styles.botaoTexto}>+ Novo Lembrete</Texto>
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

              <View style={styles.modalBotoes}>
                <TouchableOpacity
                  style={[styles.botao, styles.botaoCancelar]}
                  onPress={() => setModalVisible(false)}
                >
                  <Texto style={styles.botaoTexto}>Cancelar</Texto>
                </TouchableOpacity>
                <TouchableOpacity style={styles.botao} onPress={salvarLembrete}>
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
    paddingTop: 40,
    paddingBottom: 20,
  },
  conteudo: {
    flex: 1,
    paddingTop: 20,
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
    position: "relative",
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
    marginTop: 20,
  },

  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 50,
  },

  emptyText: {
    color: "#cfcfcf",
    fontSize: 16,
    textAlign: "center",
  },

  lembreteItem: {
    backgroundColor: "#1c2337",
    padding: 15,
    borderRadius: 16,
    marginBottom: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  lembreteInfo: {
    flex: 1,
  },

  lembreteTitulo: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 5,
  },

  lembreteData: {
    color: "#cfcfcf",
    fontSize: 14,
  },

  botoesContainer: {
    flexDirection: "row",
    gap: 10,
  },

  botaoAcao: {
    width: 35,
    height: 35,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },

  botaoEditar: {
    backgroundColor: "#0B49C1",
  },

  botaoRemover: {
    backgroundColor: "#dc3545",
  },

  botaoAcaoTexto: {
    fontSize: 16,
  },

  botaoNovo: {
    backgroundColor: "#0B49C1",
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 16,
    alignItems: "center",
    marginTop: 10,
  },

  botaoTexto: {
    color: "#fff",
    fontSize: 16,
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
    flex: 1,
  },

  botaoCancelar: {
    backgroundColor: "#373e4f",
  },
});
