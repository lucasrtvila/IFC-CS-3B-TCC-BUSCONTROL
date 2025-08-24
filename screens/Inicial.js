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
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import * as Location from "expo-location";

import { VeiculosContext } from "../components/VeiculosContext";
import { LembretesContext } from "../components/LembretesContext";
import { UsuariosContext } from "../components/UsuariosContext";
import Texto from "../components/Texto";
import BarraNavegacao from "../components/BarraNavegacao";

const { width, height } = Dimensions.get("window");

export default function Inicial({ navigation }) {
  const { usuario } = useContext(UsuariosContext);
  const nomeUsuario = usuario?.nome || "Usuário";
  const [localizacao, setLocalizacao] = useState("Buscando...");
  const [mensalidade, setMensalidade] = useState(380.0);
  const [saudacao, setSaudacao] = useState("");
  const [modalVisible, setModalVisible] = useState(false);
  const [novoValorMensalidade, setNovoValorMensalidade] = useState("");

  const { veiculos } = useContext(VeiculosContext);
  const { lembretes } = useContext(LembretesContext);

  useEffect(() => {
    const hora = new Date().getHours();
    if (hora >= 5 && hora < 12) setSaudacao("Bom dia, ");
    else if (hora >= 12 && hora < 18) setSaudacao("Boa tarde, ");
    else setSaudacao("Boa noite, ");
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

  const abrirModalMensalidade = () => {
    setNovoValorMensalidade("");
    setModalVisible(true);
  };

  const salvarMensalidade = () => {
    const valor = parseFloat(novoValorMensalidade);
    if (!isNaN(valor)) {
      setMensalidade(valor);
      setModalVisible(false);
    } else {
      Alert.alert("Valor inválido", "Por favor, insira um número válido.");
    }
  };

  return (
    <>
      <StatusBar barStyle="light-content" backgroundColor="#0A0E21" />
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.container}>
          <View style={styles.header}>
            <View style={styles.headerPlaceholder} />
            <Image
              source={require("../assets/logoinicial.png")}
              style={styles.logo}
            />
            <TouchableOpacity
              style={styles.configButton}
              onPress={() => navigation.navigate("Configuracoes")}
            >
              <Image
                source={require("../assets/configuracoes.png")}
                style={styles.configIcon}
              />
            </TouchableOpacity>
          </View>
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
                veiculos.slice(0, 4).map((v) => (
                  <View key={v.id} style={{ marginBottom: 6 }}>
                    <Texto style={styles.miniText}>
                      {v.nome.length > 22
                        ? v.nome.slice(0, 20) + "..."
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
                lembretes.slice(0, 4).map((l) => (
                  <View key={l.id} style={{ marginBottom: 6 }}>
                    <Texto style={styles.miniText}>
                      {l.titulo.length > 22
                        ? l.titulo.slice(0, 20) + "..."
                        : l.titulo}
                    </Texto>
                    <Texto style={{ color: "#AAB1C4", fontSize: 12 }}>
                      {l.data}
                    </Texto>
                  </View>
                ))
              )}
            </TouchableOpacity>
          </View>
          <TouchableOpacity
            style={styles.botaoPrincipal}
            onPress={() => Alert.alert("Funcionalidade em desenvolvimento")}
          >
            <Texto style={styles.botaoText}>Nova Viagem</Texto>
          </TouchableOpacity>
        </View>

        <Modal visible={modalVisible} animationType="slide" transparent>
          <View style={styles.modalBackground}>
            <View style={styles.modalContainer}>
              <Texto style={styles.modalTitle}>Editar Mensalidade</Texto>
              <TextInput
                style={styles.input}
                placeholder="Novo valor"
                placeholderTextColor="#cfcfcf"
                keyboardType="numeric"
                value={novoValorMensalidade}
                onChangeText={setNovoValorMensalidade}
              />
              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={[styles.modalButton, styles.cancelButton]}
                  onPress={() => setModalVisible(false)}
                >
                  <Texto style={styles.modalButtonText}>Cancelar</Texto>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.modalButton, styles.saveButton]}
                  onPress={salvarMensalidade}
                >
                  <Texto style={styles.modalButtonText}>Salvar</Texto>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        <BarraNavegacao navigation={navigation} abaAtiva="Inicial" />
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#050a24",
  },
  container: {
    flex: 1,
    paddingHorizontal: width > 768 ? width * 0.1 : 16,
    alignItems: "center",
    justifyContent: "space-between", // Distribui o espaço verticalmente
    paddingVertical: 10, // Adiciona um respiro vertical
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
    paddingHorizontal: 10,
  },
  headerPlaceholder: {
    width: 48,
  },
  configButton: {
    padding: 10,
  },
  configIcon: {
    width: 28,
    height: 28,
    resizeMode: "contain",
  },
  logo: {
    resizeMode: "contain",
    width: Math.min(120, width * 0.4),
    height: Math.min(60, width * 0.2),
  },
  boasVindas: {
    color: "white",
    fontSize: width > 768 ? 24 : 20,
    textAlign: "center",
  },
  nome: {
    fontWeight: "bold",
  },
  cardsContainer: {
    gap: 12,
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
    gap: 8,
    width: "100%",
  },
  miniCard: {
    backgroundColor: "#1c2337",
    borderRadius: 16,
    padding: 12,
    flex: 1,
    minHeight: height * 0.2,
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
  botaoPrincipal: {
    backgroundColor: "#0B49C1",
    paddingVertical: height * 0.02,
    borderRadius: 16,
    alignItems: "center",
    width: "100%",
  },
  botaoText: {
    color: "white",
    fontSize: width > 768 ? 22 : 18,
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
    marginTop: 10,
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
});