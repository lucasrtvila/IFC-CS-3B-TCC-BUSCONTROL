import React, { useState, useContext } from "react";
import {
  View,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  StatusBar,
  Modal,
  Image,
  TextInput,
  Alert,
  Platform,
  FlatList,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import DateTimePicker from "@react-native-community/datetimepicker";
import RNPickerSelect from "react-native-picker-select";

import Texto from "../components/Texto";
import Header from "../components/Header";
import { VeiculosContext } from "../components/VeiculosContext";
import { AlunosContext } from "../components/AlunosContext";
//import { ViagensContext } from '../components/ViagensContext';

const { width } = Dimensions.get("window");

// Função auxiliar para formatar a data
const formatarData = (date) => {
  const dia = date.getDate().toString().padStart(2, "0");
  const mes = (date.getMonth() + 1).toString().padStart(2, "0"); // CORREÇÃO AQUI
  const ano = date.getFullYear();
  return `${dia}/${mes}/${ano}`;
};

// Função auxiliar para formatar a hora
const formatarHorario = (date) => {
  const hours = date.getHours().toString().padStart(2, "0");
  const minutes = date.getMinutes().toString().padStart(2, "0");
  return `${hours}:${minutes}`;
};

export default function NovaViagemScreen({ navigation }) {
  const { veiculos } = useContext(VeiculosContext);
  const { alunos } = useContext(AlunosContext);
  // const { adicionarViagem } = useContext(ViagensContext);

  const [inicio, setInicio] = useState(new Date());
  const [final, setFinal] = useState(new Date());
  const [data, setData] = useState(new Date());

  const [showInicioPicker, setShowInicioPicker] = useState(false);
  const [showFinalPicker, setShowFinalPicker] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);

  const [destino, setDestino] = useState("");
  const [veiculoSelecionado, setVeiculoSelecionado] = useState(null);
  const [alunosSelecionados, setAlunosSelecionados] = useState([]);

  const [modalAlunosVisivel, setModalAlunosVisivel] = useState(false);
  const [modalVeiculosVisivel, setModalVeiculosVisivel] = useState(false);

  const onChangeInicio = (event, selectedDate) => {
    setShowInicioPicker(Platform.OS === "ios");
    if (selectedDate) {
      setInicio(selectedDate);
    }
  };

  const onChangeFinal = (event, selectedDate) => {
    setShowFinalPicker(Platform.OS === "ios");
    if (selectedDate) {
      setFinal(selectedDate);
    }
  };

  const onChangeData = (event, selectedDate) => {
    setShowDatePicker(Platform.OS === "ios");
    if (selectedDate) {
      setData(selectedDate);
    }
  };

  const toggleAlunoSelecao = (aluno) => {
    setAlunosSelecionados((prev) =>
      prev.find((a) => a.id === aluno.id)
        ? prev.filter((a) => a.id !== aluno.id)
        : [...prev, aluno]
    );
  };

  const concluirViagem = async () => {
    if (!destino || !veiculoSelecionado || alunosSelecionados.length === 0) {
      Alert.alert(
        "Campos incompletos",
        "Por favor, preencha todos os detalhes da viagem."
      );
      return;
    }

    const novaViagem = {
      destino,
      data: formatarData(data),
      inicio: formatarHorario(inicio),
      final: formatarHorario(final),
      veiculoId: veiculoSelecionado,
      alunosPresentes: alunosSelecionados.map((aluno) => aluno.id), // Salva apenas os IDs
    };

    const sucesso = await adicionarViagem(novaViagem);
    if (sucesso) {
      Alert.alert(
        "Viagem Concluída",
        "Sua nova viagem foi registrada com sucesso!"
      );
      navigation.goBack();
    } else {
      Alert.alert("Erro", "Não foi possível salvar a viagem.");
    }
  };

  const renderAlunoItem = ({ item }) => {
    const isSelected = alunosSelecionados.find((a) => a.id === item.id);
    return (
      <TouchableOpacity
        style={[styles.alunoItem, isSelected && styles.alunoItemSelected]}
        onPress={() => toggleAlunoSelecao(item)}
      >
        <Texto style={styles.alunoItemText}>{item.nome}</Texto>
      </TouchableOpacity>
    );
  };

  return (
    <>
      <StatusBar barStyle="light-content" backgroundColor="#0A0E21" />
      <View style={styles.safeArea}>
        <View style={styles.container}>
          <Header style={styles.header} navigation={navigation} />
          <Texto style={styles.titulo}>Nova viagem</Texto>

          <View style={styles.content}>
            <View style={styles.timeContainer}>
              <View style={styles.timeInput}>
                <Texto style={styles.label}>Início</Texto>
                <TouchableOpacity
                  style={styles.inputLike}
                  onPress={() => setShowInicioPicker(true)}
                >
                  <Texto style={styles.inputText}>
                    {formatarHorario(inicio)}
                  </Texto>
                </TouchableOpacity>
              </View>
              <View style={styles.timeInput}>
                <Texto style={styles.label}>Final</Texto>
                <TouchableOpacity
                  style={styles.inputLike}
                  onPress={() => setShowFinalPicker(true)}
                >
                  <Texto style={styles.inputText}>
                    {formatarHorario(final)}
                  </Texto>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.divider} />
            <Texto style={styles.detalhesTitulo}>Detalhes</Texto>

            {/* Detalhes Inputs */}
            <View style={styles.inputGroup}>
              <Image
                source={require("../assets/rota.png")}
                style={[styles.icon, { height: 22 }]}
              />
              <TextInput
                style={styles.input}
                placeholder="Para onde vamos?"
                placeholderTextColor="#AAB1C4"
                value={destino}
                onChangeText={setDestino}
              />
            </View>

            <View style={styles.inputGroup}>
              <Image
                source={require("../assets/calendario.png")} // Simple calendar icon
                style={styles.icon}
              />
              <TouchableOpacity
                style={styles.input}
                onPress={() => setShowDatePicker(true)}
              >
                <Texto style={styles.inputText}>{formatarData(data)}</Texto>
              </TouchableOpacity>
            </View>

            <View style={styles.inputGroup}>
              <Image
                source={require("../assets/onibus.png")}
                style={styles.icon}
              />
              <TouchableOpacity
                style={styles.input}
                onPress={() => setModalVeiculosVisivel(true)}
              >
                <Texto style={styles.inputText}>
                  {veiculoSelecionado
                    ? veiculos.find((v) => v.id === veiculoSelecionado)?.nome
                    : "Selecione o veículo"}
                </Texto>
              </TouchableOpacity>
            </View>

            <View style={styles.inputGroup}>
              <Image
                source={require("../assets/alunos.png")}
                style={styles.icon}
              />
              <TouchableOpacity
                style={styles.input}
                onPress={() => setModalAlunosVisivel(true)}
              >
                <Texto style={styles.inputText}>
                  {alunosSelecionados.length > 0
                    ? `${alunosSelecionados.length} alunos presentes`
                    : "Alunos presentes"}
                </Texto>
              </TouchableOpacity>
            </View>

            {/* Pickers Modals */}
            {showInicioPicker && (
              <DateTimePicker
                value={inicio}
                mode="time"
                display="default"
                onChange={onChangeInicio}
              />
            )}
            {showFinalPicker && (
              <DateTimePicker
                value={final}
                mode="time"
                display="default"
                onChange={onChangeFinal}
              />
            )}
            {showDatePicker && (
              <DateTimePicker
                value={data}
                mode="date"
                display="default"
                onChange={onChangeData}
              />
            )}

            {/* Alunos Selection Modal */}
            <Modal
              visible={modalAlunosVisivel}
              animationType="slide"
              transparent
            >
              <View style={styles.modalFundo}>
                <View style={styles.modalBox}>
                  <Texto style={styles.modalTitulo}>Alunos Presentes</Texto>
                  <FlatList
                    data={alunos}
                    renderItem={renderAlunoItem}
                    keyExtractor={(item) => item.id.toString()}
                    style={styles.alunosList}
                  />
                  <TouchableOpacity
                    style={styles.botaoConcluirAlunos}
                    onPress={() => setModalAlunosVisivel(false)}
                  >
                    <Texto style={styles.botaoTexto}>Concluir</Texto>
                  </TouchableOpacity>
                </View>
              </View>
            </Modal>
          </View>

          <View style={styles.footerButtons}>
            <TouchableOpacity
              style={styles.botaoCancelar}
              onPress={() => navigation.goBack()}
            >
              <Texto style={styles.botaoTexto}>Cancelar</Texto>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.botaoConcluir}
              onPress={concluirViagem}
            >
              <Texto style={styles.botaoTexto}>Concluir</Texto>
            </TouchableOpacity>
          </View>
          {/* Veículos Selection Modal */}
          <Modal
            visible={modalVeiculosVisivel}
            animationType="slide"
            transparent
          >
            <View style={styles.modalFundo}>
              <View style={styles.modalBox}>
                <Texto style={styles.modalTitulo}>Selecionar Veículo</Texto>
                <FlatList
                  data={veiculos}
                  renderItem={({ item }) => (
                    <TouchableOpacity
                      style={[
                        styles.alunoItem,
                        veiculoSelecionado === item.id &&
                          styles.alunoItemSelected,
                      ]}
                      onPress={() => setVeiculoSelecionado(item.id)}
                    >
                      <Texto style={styles.alunoItemText}>{item.nome}</Texto>
                    </TouchableOpacity>
                  )}
                  keyExtractor={(item) => item.id.toString()}
                  style={styles.alunosList}
                />
                <TouchableOpacity
                  style={styles.botaoConcluirAlunos}
                  onPress={() => setModalVeiculosVisivel(false)}
                >
                  <Texto style={styles.botaoTexto}>Concluir</Texto>
                </TouchableOpacity>
              </View>
            </View>
          </Modal>
        </View>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#050a24",
    alignItems: "center",
    paddingHorizontal: width * 0.05,
    paddingVertical: 30,
  },
  container: {
    flex: 1,
    marginBottom:20,
    width: "100%",
    alignItems: "center",
  },
  header: {
    top: -10,
  },
  titulo: {
    fontSize: 28,
    color: "white",
    fontWeight: "bold",
    marginVertical: 20,
  },
  content: {
    flex: 1,
    width: "100%",
  },
  timeContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  timeInput: {
    width: "48%",
  },
  label: {
    color: "#AAB1C4",
    fontSize: 16,
    marginBottom: 8,
    textAlign: "center",
  },
  inputLike: {
    backgroundColor: "#1c2337",
    borderRadius: 12,
    paddingVertical: 18,
    alignItems: "center",
  },
  inputText: {
    color: "#fff",
    fontSize: 16,
    textAlignVertical: "center",
    opacity:0.7,
    fontWeight:"bold",
    paddingLeft:6
  },
  divider: {
    height: 1,
    backgroundColor: "#1c2337",
    marginVertical: 10,
  },
  detalhesTitulo: {
    color: "white",
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  inputGroup: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1c2337",
    borderRadius: 12,
    paddingHorizontal: 15,
    marginBottom: 15,
  },
  icon: {
    width: 20,
    height: 20,
    resizeMode: "contain",
    marginRight: 15,
    tintColor: "#AAB1C4",
  },
  input: {
    flex: 1,
    color: "#fff",
    fontSize: 16,
    height: 60,
    justifyContent: "center",
  },
  pickerInput: {
    flex: 1,
    color: "#fff",
    fontSize: 16,
    height: 60,
  },
  footerButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    paddingVertical: 10,
  },
  botaoCancelar: {
    backgroundColor: "#373e4f",
    paddingVertical: 18,
    borderRadius: 12,
    width: "48%",
    alignItems: "center",
  },
  botaoConcluir: {
    backgroundColor: "#0B49C1",
    paddingVertical: 18,
    borderRadius: 12,
    width: "48%",
    alignItems: "center",
  },
  botaoTexto: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
  // Modal Styles
  modalFundo: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.7)",
  },
  modalBox: {
    backgroundColor: "#1c2337",
    borderRadius: 16,
    padding: 20,
    width: "90%",
    maxHeight: "80%",
  },
  modalTitulo: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 20,
  },
  alunosList: {
    marginBottom: 20,
  },
  alunoItem: {
    padding: 15,
    backgroundColor: "#373e4f",
    borderRadius: 8,
    marginBottom: 10,
  },
  alunoItemSelected: {
    backgroundColor: "#0B49C1",
  },
  alunoItemText: {
    color: "#fff",
    fontSize: 16,
  },
  botaoConcluirAlunos: {
    backgroundColor: "#0B49C1",
    paddingVertical: 15,
    borderRadius: 12,
    alignItems: "center",
  },
});
