import React, { useState, useContext } from "react";
import {
  View,
  TouchableOpacity,
  StyleSheet,
  Image,
  Dimensions,
  StatusBar,
  FlatList,
  Modal,
  TextInput,
  Alert,
  ScrollView,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import DateTimePicker from "@react-native-community/datetimepicker";

import Texto from "../components/Texto";
import BarraNavegacao from "../components/BarraNavegacao";
import { ParadasContext } from "../components/ParadasContext";

const { width, height } = Dimensions.get("window");

export default function RotaScreen({ navigation }) {
  const { paradas, adicionarParada, removerParada } = useContext(ParadasContext);

  // Estados para o modal de adicionar nova parada
  const [modalNovaParadaVisivel, setModalNovaParadaVisivel] = useState(false);
  const [nomeNovaParada, setNomeNovaParada] = useState("");
  const [horarioNovaParada, setHorarioNovaParada] = useState("");
  const [showTimePicker, setShowTimePicker] = useState(false);

  // Estados para os cards fixos e seu modal de edição
  const [proximaParada, setProximaParada] = useState({
    nome: "Vila São João",
    horario: "7:28",
  });
  const [destinoFinal, setDestinoFinal] = useState({
    nome: "IFC Sombrio",
    horario: "7:58",
  });
  const [modalEdicaoVisivel, setModalEdicaoVisivel] = useState(false);
  const [paradaEmEdicao, setParadaEmEdicao] = useState(null);
  const [novoNome, setNovoNome] = useState("");
  const [novoHorario, setNovoHorario] = useState("");
  const [showEditTimePicker, setShowEditTimePicker] = useState(false);

  const formatarHorario = (date) => {
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  };
  
  const handleAdicionarParada = () => {
    if (nomeNovaParada.trim() && horarioNovaParada.trim()) {
      adicionarParada(nomeNovaParada, horarioNovaParada);
      setModalNovaParadaVisivel(false);
      setNomeNovaParada("");
      setHorarioNovaParada("");
    } else {
      Alert.alert("Erro", "Por favor, preencha todos os campos.");
    }
  };

  const abrirModalEdicao = (tipo, dados) => {
    setParadaEmEdicao(tipo);
    setNovoNome(dados.nome);
    setNovoHorario(dados.horario);
    setModalEdicaoVisivel(true);
  };

  const salvarEdicao = () => {
    if (!novoNome.trim() || !novoHorario.trim()) {
      Alert.alert("Erro", "Por favor, preencha todos os campos.");
      return;
    }
    if (paradaEmEdicao === "proxima") {
      setProximaParada({ nome: novoNome, horario: novoHorario });
    } else if (paradaEmEdicao === "destino") {
      setDestinoFinal({ nome: novoNome, horario: novoHorario });
    }
    setModalEdicaoVisivel(false);
  };

  const onChangeTime = (event, selectedDate) => {
    setShowTimePicker(Platform.OS === 'ios');
    if (selectedDate) {
      setHorarioNovaParada(formatarHorario(selectedDate));
    }
  };
  
  const onChangeEditTime = (event, selectedDate) => {
    setShowEditTimePicker(Platform.OS === 'ios');
    if (selectedDate) {
      setNovoHorario(formatarHorario(selectedDate));
    }
  };

  return (
    <>
      <StatusBar barStyle="light-content" backgroundColor="#0A0E21" />
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Image
            source={require("../assets/logoinicial.png")}
            style={styles.logo}
          />
          <TouchableOpacity
            onPress={() => navigation.navigate("Configuracoes")}
          >
            <Image
              source={require("../assets/configuracoes.png")}
              style={styles.configIcon}
            />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.scrollView}>
          <View style={styles.content}>
            <View style={styles.titleBar}>
              <Texto style={styles.titulo}>Rota</Texto>
              <TouchableOpacity
                style={styles.botaoNovaParada}
                onPress={() => setModalNovaParadaVisivel(true)}
              >
                <Texto style={styles.botaoNovaParadaTexto}>+ Nova Parada</Texto>
              </TouchableOpacity>
            </View>

            <View style={styles.placeholderContainer}>
              <Texto style={styles.placeholderText}>
                O mapa será implementado futuramente.
              </Texto>
            </View>

            <View style={styles.infoCard}>
              <View>
                <Texto style={styles.cardTitle}>Próxima parada</Texto>
                <Texto style={styles.cardSubtitle}>{proximaParada.nome}</Texto>
              </View>
              <View style={styles.cardRight}>
                <Texto style={styles.cardInfo}>
                  Chegada: {proximaParada.horario}
                </Texto>
                <TouchableOpacity
                  onPress={() => abrirModalEdicao("proxima", proximaParada)}
                >
                  <Texto style={styles.cardEdit}>Editar ✏️</Texto>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.infoCard}>
              <View>
                <Texto style={styles.cardTitle}>Destino Final</Texto>
                <Texto style={styles.cardSubtitle}>{destinoFinal.nome}</Texto>
              </View>
              <View style={styles.cardRight}>
                <Texto style={styles.cardInfo}>
                  Chegada: {destinoFinal.horario}
                </Texto>
                <TouchableOpacity
                  onPress={() => abrirModalEdicao("destino", destinoFinal)}
                >
                  <Texto style={styles.cardEdit}>Editar ✏️</Texto>
                </TouchableOpacity>
              </View>
            </View>

            {paradas.length > 0 && (
              <Texto style={styles.listHeader}>Paradas Adicionais</Texto>
            )}
            <FlatList
              data={paradas}
              keyExtractor={(item) => item.id.toString()}
              scrollEnabled={false}
              renderItem={({ item }) => (
                <View style={styles.infoCard}>
                  <View>
                    <Texto style={styles.cardSubtitle}>{item.nome}</Texto>
                  </View>
                  <View style={styles.cardRight}>
                    <Texto style={styles.cardInfo}>
                      Chegada: {item.horario}
                    </Texto>
                    <TouchableOpacity onPress={() => removerParada(item.id)}>
                      <Texto style={styles.cardEdit}>Excluir 🗑️</Texto>
                    </TouchableOpacity>
                  </View>
                </View>
              )}
            />
          </View>
        </ScrollView>

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
                <Texto style={{ color: horarioNovaParada ? "#fff" : "#cfcfcf" }}>
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

        <Modal visible={modalEdicaoVisivel} animationType="slide" transparent>
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
                onPress={() => setShowEditTimePicker(true)}
              >
                <Texto style={{ color: novoHorario ? "#fff" : "#cfcfcf" }}>
                  {novoHorario || "Selecionar Horário"}
                </Texto>
              </TouchableOpacity>
              {showEditTimePicker && (
                <DateTimePicker
                  value={new Date()}
                  mode="time"
                  display="default"
                  onChange={onChangeEditTime}
                />
              )}
              <View style={styles.botoesModal}>
                <TouchableOpacity
                  style={styles.botaoCancelar}
                  onPress={() => setModalEdicaoVisivel(false)}
                >
                  <Texto style={styles.botaoModalTexto}>Cancelar</Texto>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.botaoModal}
                  onPress={salvarEdicao}
                >
                  <Texto style={styles.botaoModalTexto}>Salvar</Texto>
                </TouchableOpacity>
              </View>
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
  scrollView: {
    flex: 1,
  },
  content: {
    paddingHorizontal: width * 0.05,
    paddingBottom: 20,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 10,
    paddingHorizontal: width * 0.05,
    width: "100%",
  },
  logo: {
    resizeMode: "contain",
    width: Math.min(150, width * 0.4),
    height: Math.min(75, width * 0.2),
  },
  configIcon: {
    width: 28,
    height: 28,
    resizeMode: "contain",
  },
  titleBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginVertical: 20,
  },
  titulo: {
    fontSize: width > 768 ? 32 : 28,
    color: "white",
    fontWeight: "bold",
  },
  botaoNovaParada: {
    backgroundColor: "#0B49C1",
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 12,
  },
  botaoNovaParadaTexto: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
  },
  placeholderContainer: {
    width: "100%",
    height: height * 0.3,
    borderRadius: 15,
    marginBottom: 20,
    backgroundColor: "#1c2337",
    justifyContent: "center",
    alignItems: "center",
  },
  placeholderText: {
    color: "#AAB1C4",
    fontSize: 16,
  },
  listHeader: {
    color: "white",
    fontSize: 20,
    fontWeight: "bold",
    marginTop: 20,
    marginBottom: 10,
  },
  infoCard: {
    backgroundColor: "#1c2337",
    borderRadius: 15,
    padding: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
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
  cardInfo: {
    color: "#AAB1C4",
    fontSize: 14,
  },
  cardEdit: {
    color: "white",
    fontSize: 16,
    marginTop: 8,
  },
  semParadasTexto: {
    color: "#ccc",
    textAlign: "center",
    marginTop: 20,
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
});