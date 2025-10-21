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
  SafeAreaView, // Import SafeAreaView
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";

import Texto from "../components/Texto";
import Header from "../components/Header";
import { VeiculosContext } from "../components/VeiculosContext";
import { AlunosContext } from "../components/AlunosContext";
import { ParadasContext } from "../components/ParadasContext";
import { ViagemContext } from "../components/ViagemContext";

const { width } = Dimensions.get("window");

const formatarData = (date) => {
  if (!date) return ''; // Add check for null or undefined date
  const dia = date.getDate().toString().padStart(2, "0");
  const mes = (date.getMonth() + 1).toString().padStart(2, "0");
  const ano = date.getFullYear();
  return `${dia}/${mes}/${ano}`;
};

const formatarHorario = (date) => {
    if (!date) return ''; // Add check for null or undefined date
  const hours = date.getHours().toString().padStart(2, "0");
  const minutes = date.getMinutes().toString().padStart(2, "0");
  return `${hours}:${minutes}`;
};

export default function NovaViagemScreen({ navigation }) {
  const { veiculos } = useContext(VeiculosContext);
  const { alunos } = useContext(AlunosContext);
  const { paradas } = useContext(ParadasContext);
  const { limparTemplate } = useContext(ViagemContext);

  const [tipoViagem, setTipoViagem] = useState("so_ida"); // 'so_ida' ou 'ida_e_volta'
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
    if (selectedDate) setInicio(selectedDate);
  };

  const onChangeFinal = (event, selectedDate) => {
    setShowFinalPicker(Platform.OS === "ios");
    if (selectedDate) setFinal(selectedDate);
  };

  const onChangeData = (event, selectedDate) => {
    setShowDatePicker(Platform.OS === "ios");
    if (selectedDate) setData(selectedDate);
  };

  const toggleAlunoSelecao = (aluno) => {
    setAlunosSelecionados((prev) =>
      prev.find((a) => a.id === aluno.id)
        ? prev.filter((a) => a.id !== aluno.id)
        : [...prev, aluno]
    );
  };

  const iniciarViagem = () => {
    if (!destino || !veiculoSelecionado || alunosSelecionados.length === 0) {
      Alert.alert(
        "Campos incompletos",
        "Por favor, preencha todos os detalhes da viagem."
      );
      return;
    }

    limparTemplate(); // Limpa qualquer template anterior ao iniciar uma nova viagem

    const paradasDaViagemComAlunos = paradas
      .map((parada) => ({
        ...parada,
        alunos: alunosSelecionados.filter(
          (aluno) => aluno.paradaId === parada.id
        ),
      }))
      .filter((parada) => parada.alunos.length > 0)
      .sort((a, b) => a.horario.localeCompare(b.horario));

    const horarioFinalFormatado = formatarHorario(final);

    navigation.navigate("ViagemAtiva", {
      destino,
      horarioFinal: horarioFinalFormatado,
      paradasDaViagem: paradasDaViagemComAlunos,
      veiculoId: veiculoSelecionado,
      tipoViagem: tipoViagem, // Passa o tipo de viagem
      alunosSelecionadosIds: alunosSelecionados.map(a => a.id), // Passa os IDs para o template
    });
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
       {/* Use SafeAreaView to wrap the entire screen content */}
      <SafeAreaView style={styles.safeArea}>
        {/* Replace ScrollView with a simple View */}
        <View style={styles.container}>
            <Header style={styles.header} navigation={navigation} />
            <Texto style={styles.titulo}>Nova viagem</Texto>

            {/* Wrap the main content area in a View with flex: 1 */}
            <View style={styles.content}>
              <View style={styles.tipoViagemContainer}>
                <TouchableOpacity
                  style={[
                    styles.tipoViagemBotao,
                    tipoViagem === "so_ida" && styles.tipoViagemBotaoAtivo,
                  ]}
                  onPress={() => setTipoViagem("so_ida")}
                >
                  <Texto
                    style={[
                      styles.tipoViagemTexto,
                      tipoViagem === "so_ida" && styles.tipoViagemTextoAtivo,
                    ]}
                  >
                    Só Ida
                  </Texto>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.tipoViagemBotao,
                    tipoViagem === "ida_e_volta" && styles.tipoViagemBotaoAtivo,
                  ]}
                  onPress={() => setTipoViagem("ida_e_volta")}
                >
                  <Texto
                    style={[
                      styles.tipoViagemTexto,
                      tipoViagem === "ida_e_volta" && styles.tipoViagemTextoAtivo,
                    ]}
                  >
                    Ida e Volta
                  </Texto>
                </TouchableOpacity>
              </View>

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
                  source={require("../assets/calendario.png")}
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
                      ? veiculos.find((v) => v.id === veiculoSelecionado)?.nome ?? 'Veículo não encontrado' // Added nullish coalescing
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
            {/* End of main content View */}
            </View>


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


            <View style={styles.footerButtons}>
              <TouchableOpacity
                style={styles.botaoCancelar}
                onPress={() => navigation.goBack()}
              >
                <Texto style={styles.botaoTexto}>Cancelar</Texto>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.botaoIniciar}
                onPress={iniciarViagem}
              >
                <Texto style={styles.botaoTexto}>Iniciar</Texto>
              </TouchableOpacity>
            </View>
          {/* End of container View */}
          </View>
        {/* End of SafeAreaView */}
      </SafeAreaView>

      <Modal
        visible={modalAlunosVisivel}
        animationType="slide"
        transparent
      >
        <SafeAreaView style={styles.modalSafeArea}>
            <View style={styles.modalBox}>
                <Texto style={styles.modalTitulo}>Alunos Presentes</Texto>
                <FlatList
                data={alunos}
                renderItem={renderAlunoItem}
                keyExtractor={(item) => item.id.toString()}
                style={styles.alunosList}
                />
                <TouchableOpacity
                style={styles.botaoIniciarModal}
                onPress={() => setModalAlunosVisivel(false)}
                >
                <Texto style={styles.botaoTexto}>Concluir</Texto>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
      </Modal>

      <Modal
        visible={modalVeiculosVisivel}
        animationType="slide"
        transparent
      >
        <SafeAreaView style={styles.modalSafeArea}>
            <View style={styles.modalBox}>
                <Texto style={styles.modalTitulo}>Selecionar Veículo</Texto>
                <FlatList
                data={veiculos.filter(v => v.status === 'Ativo')} // Filter only active vehicles
                renderItem={({ item }) => (
                    <TouchableOpacity
                    style={[
                        styles.alunoItem,
                        veiculoSelecionado === item.id && styles.alunoItemSelected,
                    ]}
                    onPress={() => setVeiculoSelecionado(item.id)}
                    >
                    <Texto style={styles.alunoItemText}>{item.nome}</Texto>
                    </TouchableOpacity>
                )}
                keyExtractor={(item) => item.id.toString()}
                style={styles.alunosList}
                ListEmptyComponent={<Texto style={styles.emptyListText}>Nenhum veículo ativo</Texto>} // Added empty state
                />
                <TouchableOpacity
                style={styles.botaoIniciarModal}
                onPress={() => setModalVeiculosVisivel(false)}
                >
                <Texto style={styles.botaoTexto}>Concluir</Texto>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#050a24",
    paddingVertical: 30,
  },
  container: {
    flex: 1, // Make container take full available space within SafeAreaView
    paddingHorizontal: 20,
    paddingTop: 10, // Reduced top padding as SafeAreaView handles status bar
    justifyContent: "space-between", // Distribute space between header, content, footer
  },
  header: {
    alignItems: "center",
    top: -20,
    marginBottom:-20,
  },
  titulo: {
    fontSize: 28,
    color: "white",
    fontWeight: "bold",
    marginVertical: 10,
    textAlign: "center",
  },
  content: {
     flex: 1, // Allow content to take up remaining space
     width: "100%",
     // Removed justifyContent: 'center' to allow natural flow
  },
  tipoViagemContainer: {
    flexDirection: "row",
    backgroundColor: "#1c2337",
    borderRadius: 12,
    marginBottom: 15, // Adjusted margin
    padding: 4,
  },
  tipoViagemBotao: {
    flex: 1,
    paddingVertical: 10, // Adjusted padding
    borderRadius: 10,
    alignItems: "center",
  },
  tipoViagemBotaoAtivo: {
    backgroundColor: "#0B49C1",
  },
  tipoViagemTexto: {
    color: "#AAB1C4",
    fontSize: 16,
    fontWeight: "bold",
  },
  tipoViagemTextoAtivo: {
    color: "white",
  },
  timeContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 15, // Adjusted margin
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
    paddingVertical: 15, // Adjusted padding
    alignItems: "center",
  },
  inputText: {
    color: "#fff",
    fontSize: 16,
    textAlignVertical: "center",
    opacity: 0.8,
    fontWeight: "bold",
  },
  divider: {
    height: 1,
    backgroundColor: "#1c2337",
    marginVertical: 10, // Adjusted margin
  },
  detalhesTitulo: {
    color: "white",
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 15, // Adjusted margin
    textAlign: "center",
  },
  inputGroup: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1c2337",
    borderRadius: 12,
    paddingHorizontal: 15,
    marginBottom: 10, // Adjusted margin
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
    height: 50, // Adjusted height
    justifyContent: "center",
  },
  footerButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    paddingTop: 10,
    paddingBottom: 10, // Reduced bottom padding as SafeAreaView handles nav bar
    borderTopWidth: 1, // Optional: add a divider
    borderTopColor: '#1c2337', // Optional: divider color
  },
  botaoCancelar: {
    backgroundColor: "#373e4f",
    paddingVertical: 15, // Adjusted padding
    borderRadius: 12,
    width: "48%",
    alignItems: "center",
  },
  botaoIniciar: {
    backgroundColor: "#0B49C1",
    paddingVertical: 15, // Adjusted padding
    borderRadius: 12,
    width: "48%",
    alignItems: "center",
  },
  botaoTexto: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
   modalSafeArea: { // Style for SafeAreaView inside Modals
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: "rgba(0,0,0,0.7)", // Keep the background dimming
  },
  modalBox: {
    backgroundColor: "#1c2337",
    borderRadius: 16,
    padding: 20,
    width: "90%",
    maxHeight: "80%", // Keep maxHeight
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
   emptyListText: { // Added style for empty list text
    color: "#AAB1C4",
    textAlign: 'center',
    marginTop: 20,
    fontSize: 16,
  },
  botaoIniciarModal: {
    backgroundColor: "#0B49C1",
    paddingVertical: 15,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 10, // Added margin top for spacing
  },
});