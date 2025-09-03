import React, { useState, useContext, useEffect } from "react";
import {
  View,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  StatusBar,
  FlatList,
  Modal,
  Image,
  TextInput,
  Alert,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import DateTimePicker from "@react-native-community/datetimepicker";
import Texto from "../components/Texto";
import { ParadasContext } from "../components/ParadasContext";
import BarraNavegacao from "../components/BarraNavegacao";
import Header from "../components/Header";

const { width } = Dimensions.get("window");

export default function RotaScreen({ navigation }) {
  const {
    paradas,
    adicionarParada,
    editarParada,
    removerParada,
    carregarDados,
  } = useContext(ParadasContext);

  const [modalNovaParadaVisivel, setModalNovaParadaVisivel] = useState(false);
  const [nomeNovaParada, setNomeNovaParada] = useState("");
  const [horarioNovaParada, setHorarioNovaParada] = useState("");
  const [showTimePicker, setShowTimePicker] = useState(false);

  const [modalEditarParadaVisivel, setModalEditarParadaVisivel] =
    useState(false);
  const [paradaEditando, setParadaEditando] = useState(null);
  const [novoNome, setNovoNome] = useState("");
  const [novoHorario, setNovoHorario] = useState("");

  useEffect(() => {
    carregarDados();
  }, []);

  const formatarHorario = (date) => {
    const hours = date.getHours().toString().padStart(2, "0");
    const minutes = date.getMinutes().toString().padStart(2, "0");
    return `${hours}:${minutes}`;
  };

  const handleAdicionarParada = () => {
    if (nomeNovaParada.trim()) {
      adicionarParada(nomeNovaParada, horarioNovaParada);
      setModalNovaParadaVisivel(false);
      setNomeNovaParada("");
      setHorarioNovaParada("");
    } else {
      Alert.alert("Erro", "Por favor, preencha o nome da parada.");
    }
  };

  const abrirModalEditar = (parada) => {
    setParadaEditando(parada);
    setNovoNome(parada.nome);
    setNovoHorario(parada.horario);
    setModalEditarParadaVisivel(true);
  };

  const handleSalvarEdicao = () => {
    if (novoNome.trim() && novoHorario.trim()) {
      editarParada(paradaEditando.id, novoNome, novoHorario);
      setModalEditarParadaVisivel(false);
      setParadaEditando(null);
      setNovoNome("");
      setNovoHorario("");
      carregarDados();
    } else {
      Alert.alert("Erro", "Por favor, preencha todos os campos.");
    }
  };

  const handleRemoverParada = () => {
    removerParada(paradaEditando.id);
    setModalEditarParadaVisivel(false);
  };

  const onChangeTime = (event, selectedDate) => {
    setShowTimePicker(Platform.OS === "ios");
    if (selectedDate) {
      setHorarioNovaParada(formatarHorario(selectedDate));
    }
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.infoCard}
      onPress={() => abrirModalEditar(item)}
    >
      <View style={styles.cardLeft}>
        <Texto style={styles.cardSubtitle}>{item.nome}</Texto>
        <Texto style={styles.cardTitle}>{item.numAlunos} alunos</Texto>
      </View>
      <View style={styles.cardRight}>
        <Texto style={styles.cardTitle}>Hora Prev.</Texto>
        <Texto style={styles.cardTime}>{item.horario}</Texto>
      </View>
    </TouchableOpacity>
  );

  return (
    <>
      <StatusBar barStyle="light-content" backgroundColor="#0A0E21" />
      <SafeAreaView style={styles.container}>
        <View style={styles.content}>
          <Header style={styles.header} navigation={navigation} />
          <Texto style={styles.titulo}>Rota</Texto>
          <FlatList
            data={paradas}
            keyExtractor={(item) => item.id.toString()}
            renderItem={renderItem}
            contentContainerStyle={styles.listContainer}
            ListEmptyComponent={() => (
              <Texto style={styles.semParadasTexto}>
                Nenhuma parada adicionada ainda.
              </Texto>
            )}
          />
          <TouchableOpacity
            style={styles.botaoAdicionar}
            onPress={() => setModalNovaParadaVisivel(true)}
          >
            <Texto style={styles.botaoAdicionarTexto}>Adicionar Parada</Texto>
          </TouchableOpacity>
        </View>

        <Modal
          visible={modalNovaParadaVisivel}
          animationType="slide"
          transparent
        >
          <View style={styles.modalFundo}>
            <View style={styles.modalBox}>
              <Texto style={styles.modalTitulo}>Nova Parada</Texto>
              <TextInput
                style={styles.input}
                placeholder="Nome da Parada"
                placeholderTextColor="#cfcfcf"
                value={nomeNovaParada}
                onChangeText={setNomeNovaParada}
              />
              <TouchableOpacity
                style={styles.input}
                onPress={() => setShowTimePicker(true)}
              >
                <Texto
                  style={{ color: horarioNovaParada ? "#fff" : "#cfcfcf" }}
                >
                  {horarioNovaParada || "Selecionar Horário"}
                </Texto>
              </TouchableOpacity>
              {showTimePicker && (
                <DateTimePicker
                  value={new Date()}
                  mode="time"
                  display="default"
                  onChange={onChangeTime}
                />
              )}
              <View style={styles.botoesModal}>
                <TouchableOpacity
                  style={styles.botaoCancelar}
                  onPress={() => setModalNovaParadaVisivel(false)}
                >
                  <Texto style={styles.botaoModalTexto}>Cancelar</Texto>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.botaoModal}
                  onPress={handleAdicionarParada}
                >
                  <Texto style={styles.botaoModalTexto}>Adicionar</Texto>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
        <Modal
          visible={modalEditarParadaVisivel}
          animationType="slide"
          transparent
        >
          <View style={styles.modalFundo}>
            <View style={styles.modalBox}>
              <Texto style={styles.modalTitulo}>Editar Parada</Texto>
              <TextInput
                style={styles.input}
                placeholder="Nome da Parada"
                placeholderTextColor="#cfcfcf"
                value={novoNome}
                onChangeText={setNovoNome}
              />
              <TouchableOpacity
                style={styles.input}
                onPress={() => setShowTimePicker(true)}
              >
                <Texto style={{ color: novoHorario ? "#fff" : "#cfcfcf" }}>
                  {novoHorario || "Selecionar Horário"}
                </Texto>
              </TouchableOpacity>
              {showTimePicker && (
                <DateTimePicker
                  value={new Date()}
                  mode="time"
                  display="default"
                  onChange={(event, selectedDate) => {
                    setShowTimePicker(Platform.OS === "ios");
                    if (selectedDate)
                      setNovoHorario(formatarHorario(selectedDate));
                  }}
                />
              )}
              <View style={styles.botoesModal}>
                <TouchableOpacity
                  style={styles.botaoCancelar}
                  onPress={() => setModalEditarParadaVisivel(false)}
                >
                  <Texto style={styles.botaoModalTexto}>Cancelar</Texto>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.botaoModal}
                  onPress={handleSalvarEdicao}
                >
                  <Texto style={styles.botaoModalTexto}>Salvar</Texto>
                </TouchableOpacity>
              </View>
              <TouchableOpacity
                style={[
                  styles.botaoModal,
                  { backgroundColor: "#c41628ff", marginTop: 10 },
                ]}
                onPress={handleRemoverParada}
              >
                <Texto style={styles.botaoModalTexto}>Excluir Parada</Texto>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        <BarraNavegacao navigation={navigation} abaAtiva="Rota" />
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#050a24",
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: width > 768 ? width * 0.1 : 16,
  },
  header: {
    alignItems: "center",
    top: -30,
    marginBottom:-10
  },
  titulo: {
    fontSize: width > 768 ? 24 : 20,
    color: "white",
    marginBottom: 30,
    textAlign: "center",

  },
  listContainer: {
    paddingBottom: 20,
  },
  infoCard: {
    backgroundColor: "#1C2337",
    borderRadius: 15,
    padding: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  cardLeft: {
    flex: 1,
  },
  cardRight: {
    alignItems: "flex-end",
  },
  cardTitle: {
    color: "#AAB1C4",
    fontSize: 14,
  },
  cardSubtitle: {
    color: "white",
    fontSize: 20,
    fontWeight: "bold",
    marginTop: 4,
  },
  cardTime: {
    color: "white",
    fontSize: 20,
    fontWeight: "bold",
    marginTop: 4,
  },
  botaoAdicionar: {
    backgroundColor: "#0B49C1",
    paddingVertical: width > 768 ? 20 : 16,
    borderRadius: 16,
    alignItems: "center",
    marginTop: 25,
    marginBottom: 10,
  },
  botaoAdicionarTexto: {
    color: "white",
    fontSize: width > 768 ? 24 : 20,
    fontWeight: "bold",
  },
  modalFundo: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#000000aa",
  },
  modalBox: {
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
  input: {
    backgroundColor: "#373e4f",
    borderRadius: 16,
    paddingHorizontal: 15,
    paddingVertical: 12,
    marginBottom: 15,
    fontSize: 16,
    color: "#ffffff",
    justifyContent: "center",
  },
  botoesModal: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
    gap: 10,
  },
  botaoCancelar: {
    backgroundColor: "#373e4f",
    paddingVertical: 14,
    borderRadius: 16,
    alignItems: "center",
    flex: 1,
  },
  botaoModal: {
    backgroundColor: "#0B49C1",
    paddingVertical: 14,
    borderRadius: 16,
    alignItems: "center",
    flex: 1,
  },
  botaoModalTexto: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  semParadasTexto: {
    color: "#AAB1C4",
    textAlign: "center",
    marginTop: 50,
  },
});
