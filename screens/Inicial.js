import React, { useContext, useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Image,
  Alert,
  TextInput,
  Modal,
  Dimensions,
  StatusBar,
  Platform,
} from "react-native";
import * as Location from "expo-location";
import DateTimePicker from "@react-native-community/datetimepicker";

import { VeiculosContext } from "../components/VeiculosContext";
import { LembretesContext } from "../components/LembretesContext";

import { getUsuario } from "../database/database";
import { salvarMensalidade, getMensalidade } from "../database/database";

import Texto from "../components/Texto";
import BarraNavegacao from "../components/BarraNavegacao";
import Header from "../components/Header";

const { width, height } = Dimensions.get("window");

function formatarData(data) {
  const dia = data.getDate().toString().padStart(2, "0");
  const mes = (data.getMonth() + 1).toString().padStart(2, "0");
  const ano = data.getFullYear();
  return `${dia}/${mes}/${ano}`;
}

export default function Inicial({ navigation }) {
  const [usuario, setUsuario] = useState(null);
  const [localizacao, setLocalizacao] = useState("Buscando...");
  const [mensalidade, setMensalidade] = useState(380.0);
  const [saudacao, setSaudacao] = useState("");
  const [modalVisible, setModalVisible] = useState(false);
  const [novoValorMensalidade, setNovoValorMensalidade] = useState("");
  const [dataVencimento, setDataVencimento] = useState(new Date());
  const [dataInput, setDataInput] = useState(formatarData(new Date()));
  const [mostrarDatePicker, setMostrarDatePicker] = useState(false);

  const { veiculos } = useContext(VeiculosContext);
  const { lembretes } = useContext(LembretesContext);

  useEffect(() => {
    const hora = new Date().getHours();
    if (hora >= 5 && hora < 12) setSaudacao("Bom dia, ");
    else if (hora >= 12 && hora < 18) setSaudacao("Boa tarde, ");
    else setSaudacao("Boa noite, ");
  }, []);

  useEffect(() => {
    async function carregarUsuario() {
      try {
        const usuarioDB = await getUsuario();
        setUsuario(usuarioDB);
      } catch (error) {
        console.error("Erro ao buscar usuário:", error);
      }
    }
    carregarUsuario();
  }, []);

  useEffect(() => {
    const obterLocalizacao = async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== "granted") {
          setLocalizacao("Permissão negada");
          return;
        }

        const location = await Location.getCurrentPositionAsync({});
        const [address] = await Location.reverseGeocodeAsync(location.coords);

        if (address) {
          const cidade =
            address.city || address.subregion || "Cidade desconhecida";
          const estado = address.region || "";
          setLocalizacao(`${cidade} - ${estado}`);
        } else {
          setLocalizacao("Local não encontrado");
        }
      } catch (error) {
        console.error("Erro ao obter localização:", error);
        setLocalizacao("Erro ao obter localização");
      }
    };

    obterLocalizacao();
  }, []);

  useEffect(() => {
    async function carregarMensalidade() {
      const mensalidadeBanco = await getMensalidade();
      if (mensalidadeBanco) {
        setMensalidade(mensalidadeBanco.valor);
        setDataVencimento(new Date(mensalidadeBanco.dataVencimento));
      }
    }
    carregarMensalidade();
  }, []);

  const abrirModalMensalidade = () => {
    setMostrarDatePicker(false);
    setNovoValorMensalidade("");
    setModalVisible(true);
    setDataInput(formatarData(dataVencimento));
  };

  const salvarMensalidadeHandler = async () => {
    const valor = parseFloat(novoValorMensalidade);
    if (!isNaN(valor)) {
      await salvarMensalidade(
        valor,
        dataVencimento.toISOString().split("T")[0]
      );
      setMensalidade(valor);
      setModalVisible(false);
    } else {
      Alert.alert("Valor inválido", "Por favor, insira um número válido.");
    }
  };

  const abrirDatePicker = () => {
    setMostrarDatePicker(true);
  };

  const aoSelecionarData = (event, selectedDate) => {
    setMostrarDatePicker(Platform.OS === "ios");
    if (selectedDate) setDataVencimento(selectedDate);
  };

  const nomeUsuario = usuario?.nome || "Usuário";

  return (
    <>
      <StatusBar barStyle="light-content" backgroundColor="#0A0E21" />
      <View style={styles.safeArea}>
        <View style={styles.container}>
          <Header style={styles.header} navigation={navigation} />
          <Texto style={styles.boasVindas}>
            {saudacao}
            <Texto style={styles.nome}>{nomeUsuario}</Texto>
          </Texto>

          <View style={styles.cardsContainer}>
            <TouchableOpacity style={styles.card}>
              <View style={styles.cardCenterContent}>
                <Texto style={styles.cardTitle}>Você está em</Texto>
                <Texto style={styles.cardTextBold}>{localizacao}</Texto>
                <Texto style={styles.cardSub}>Ver minha localização</Texto>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.card}
              onPress={abrirModalMensalidade}
            >
              <View style={styles.cardCenterContent}>
                <Texto style={styles.cardTitle}>Mensalidades</Texto>
                <Texto style={styles.cardTextBold}>
                  Valor atual: R$ {mensalidade.toFixed(2)}
                </Texto>
                <Texto style={styles.cardSub}>Toque para editar</Texto>
              </View>
            </TouchableOpacity>
          </View>

          <View style={styles.grid}>
            <TouchableOpacity
              style={styles.miniCard}
              onPress={() => navigation.navigate("Veiculos")}
            >
              <Texto style={styles.cardTitle}>Veículos</Texto>
              {veiculos.length === 0 ? (
                <Texto style={styles.miniText}>Nenhum veículo registrado</Texto>
              ) : (
                veiculos.slice(0, 3).map((v) => (
                  <View key={v.id} style={{ marginBottom: 6 }}>
                    <Texto style={styles.miniText}>
                      {v.nome.length > 18
                        ? v.nome.slice(0, 15) + "..."
                        : v.nome}
                    </Texto>
                    <Texto
                      style={
                        v.status === "Ativo"
                          ? styles.statusAtivo
                          : styles.statusManutencao
                      }
                    >
                      {v.status}
                    </Texto>
                  </View>
                ))
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.miniCard}
              onPress={() => navigation.navigate("Lembretes")}
            >
              <Texto style={styles.cardTitle}>Lembretes</Texto>
              {lembretes.length === 0 ? (
                <Texto style={styles.miniText}>
                  Nenhum lembrete registrado
                </Texto>
              ) : (
                lembretes.slice(0, 3).map((l) => (
                  <View key={l.id} style={{ marginBottom: 6 }}>
                    <Texto style={styles.miniText}>
                      {l.titulo.length > 18
                        ? l.titulo.slice(0, 15) + "..."
                        : l.titulo}
                    </Texto>
                    <Texto style={{ color: "#AAB1C4", fontSize: 12 }}>
                      {l.data} - {l.hora}
                    </Texto>
                  </View>
                ))
              )}
            </TouchableOpacity>
          </View>

          {/* Botão único para Nova Viagem */}
          <TouchableOpacity
            style={styles.botaoPrincipal}
            onPress={() => navigation.navigate("NovaViagem")}
          >
            <Texto style={styles.botaoText}>Nova Viagem</Texto>
          </TouchableOpacity>
        </View>

        <Modal visible={modalVisible} animationType="slide" transparent>
          <View style={styles.modalBackground}>
            <View style={styles.modalContainer}>
              <Texto style={styles.modalTitle}>Editar Mensalidade</Texto>

              <Texto style={styles.label}>Valor</Texto>
              <TextInput
                style={styles.input}
                placeholder="Novo valor"
                placeholderTextColor="#cfcfcf"
                keyboardType="numeric"
                value={novoValorMensalidade}
                onChangeText={setNovoValorMensalidade}
              />

              <Texto style={styles.label}>Data de Vencimento</Texto>
              <TouchableOpacity
                onPress={abrirDatePicker}
                style={styles.inputData}
              >
                <Texto
                  style={{ color: "#fff", fontWeight: "bold", fontSize: 16 }}
                >
                  {formatarData(dataVencimento)}
                </Texto>
              </TouchableOpacity>

              {mostrarDatePicker && (
                <DateTimePicker
                  value={dataVencimento}
                  mode="date"
                  display={Platform.OS === "ios" ? "spinner" : "default"}
                  onChange={aoSelecionarData}
                />
              )}

              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={[styles.modalButton, styles.cancelButton]}
                  onPress={() => setModalVisible(false)}
                >
                  <Texto style={styles.modalButtonText}>Cancelar</Texto>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.modalButton, styles.saveButton]}
                  onPress={salvarMensalidadeHandler}
                >
                  <Texto style={styles.modalButtonText}>Salvar</Texto>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        <BarraNavegacao navigation={navigation} abaAtiva="Inicial" />
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#050a24",
    paddingVertical: 30,
  },
  header: {
    top: -10,
  },
  container: {
    flex: 1,
    paddingHorizontal: width > 768 ? width * 0.1 : 16,
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  boasVindas: {
    color: "white",
    fontSize: width > 768 ? 24 : 20,
    textAlign: "center",
    top: -25,
  },
  nome: {
    fontWeight: "bold",
  },
  cardsContainer: {
    gap: 18,
    width: "100%",
  },
  card: {
    backgroundColor: "#1c2337",
    borderRadius: 16,
    paddingVertical: height * 0.02,
    paddingHorizontal: width * 0.04,
    justifyContent: "center",
  },
  cardCenterContent: {
    alignItems: "center",
  },
  cardTitle: {
    color: "white",
    fontSize: 16,
    marginBottom: 2,
    textAlign: "center",
  },
  cardTextBold: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 2,
  },
  cardSub: {
    color: "#AAB1C4",
    fontSize: 14,
    marginTop: 2,
  },
  grid: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
    width: "100%",
  },
  miniCard: {
    backgroundColor: "#1c2337",
    borderRadius: 16,
    padding: 12,
    flex: 1,
    minHeight: height * 0.23,
    maxHeight: height * 0.23,
  },
  miniText: {
    color: "#AAB1C4",
    fontSize: 16,
  },
  statusAtivo: {
    color: "limegreen",
    fontSize: 12,
  },
  statusManutencao: {
    color: "orange",
    fontSize: 12,
  },
  // Estilo para o botão único de largura total
  botaoPrincipal: {
    backgroundColor: "#0B49C1",
    paddingVertical: width > 768 ? 20 : 16,
    borderRadius: 16,
    alignItems: "center",
    width: "100%",
    marginTop: 30,
  },
  botaoText: {
    color: "white",
    fontSize: width > 768 ? 24 : 20,
    fontWeight: "bold",
  },
  modalBackground: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    paddingHorizontal: 20,
  },
  modalContainer: {
    backgroundColor: "#1C1F2E",
    borderRadius: 16,
    padding: 20,
  },
  modalTitle: {
    color: "white",
    fontSize: 20,
    textAlign: "center",
    marginBottom: 10,
    fontWeight: "bold",
  },
  input: {
    backgroundColor: "#373e4f",
    color: "#fff",
    borderRadius: 8,
    padding: 10,
    fontSize: 18,
  },
  modalButtons: {
    flexDirection: "row",
    marginTop: 20,
    gap: 10,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: "center",
  },
  saveButton: {
    backgroundColor: "#0B49C1",
  },
  cancelButton: {
    backgroundColor: "#373e4f",
  },
  modalButtonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
  inputData: {
    backgroundColor: "#373e4f",
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 12,
    marginBottom: 15,
    justifyContent: "center",
  },
  label: {
    color: "#fff",
    fontSize: 16,
    marginBottom: 8,
    marginTop: 10,
  },
});