import React, { useContext, useState, useEffect } from "react";
import { VeiculosContext } from "../components/VeiculosContext";
import { LembretesContext } from "../components/LembretesContext";
import { UsuariosContext } from "../components/UsuariosContext";
import Texto from "../components/Texto";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Alert,
  TextInput,
  Modal,
  SafeAreaView,
  Dimensions,
  Platform,
  StatusBar,
} from "react-native";
import * as Location from "expo-location";

const { width } = Dimensions.get("window");
const isTablet = width > 768;

export default function Inicial({ navigation }) {
  const { usuario } = useContext(UsuariosContext);
  const { veiculos } = useContext(VeiculosContext);
  const { lembretes } = useContext(LembretesContext);

  const [localizacao, setLocalizacao] = useState("Buscando...");
  const [mensalidade, setMensalidade] = useState(380.0);
  const [saudacao, setSaudacao] = useState("");
  const [modalVisible, setModalVisible] = useState(false);
  const [novoValorMensalidade, setNovoValorMensalidade] = useState("");

  const nomeUsuario = usuario?.nome || "Usuário";

  // Definir saudação baseada na hora
  useEffect(() => {
    const hora = new Date().getHours();
    const saudacoes = {
      manha: "Bom dia, ",
      tarde: "Boa tarde, ",
      noite: "Boa noite, "
    };
    
    if (hora >= 5 && hora < 12) setSaudacao(saudacoes.manha);
    else if (hora >= 12 && hora < 18) setSaudacao(saudacoes.tarde);
    else setSaudacao(saudacoes.noite);
  }, []);

  // Obter localização
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
          const cidade = address.city || address.subregion || "Cidade desconhecida";
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

  const salvarMensalidade = () => {
    const valor = parseFloat(novoValorMensalidade);
    if (!isNaN(valor) && valor > 0) {
      setMensalidade(valor);
      setModalVisible(false);
      setNovoValorMensalidade("");
    } else {
      Alert.alert("Valor inválido", "Por favor, insira um número válido maior que zero.");
    }
  };

  const renderStatusVeiculo = (status) => (
    <Texto style={status === "Ativo" ? styles.statusAtivo : styles.statusManutencao}>
      {status}
    </Texto>
  );

  const truncateText = (text, maxLength = 18) => 
    text.length > maxLength ? `${text.slice(0, maxLength)}...` : text;

  return (
    <>
      <StatusBar barStyle="light-content" backgroundColor="#0A0E21" />
      <SafeAreaView style={styles.container}>
        <View style={styles.content}>
          {/* Header */}
          <View style={styles.header}>
            <Image source={require("../assets/logoinicial.png")} style={styles.logo} />
            <Texto style={styles.boasVindas}>
              {saudacao}
              <Texto style={styles.nome}>{nomeUsuario}</Texto>
            </Texto>
          </View>

          {/* Cards principais */}
          <View style={styles.cardsContainer}>
            <TouchableOpacity style={styles.card}>
              <Texto style={styles.cardTitle}>Você está em</Texto>
              <Texto style={styles.cardTextBold}>{localizacao}</Texto>
              <Texto style={styles.cardSub}>Ver minha localização</Texto>
            </TouchableOpacity>

            <TouchableOpacity style={styles.card} onPress={() => setModalVisible(true)}>
              <Texto style={styles.cardTitle}>Mensalidades</Texto>
              <Texto style={styles.cardTextBold}>Valor atual: R$ {mensalidade.toFixed(2)}</Texto>
              <Texto style={styles.cardSub}>Toque para editar</Texto>
            </TouchableOpacity>
          </View>

          {/* Mini cards */}
          <View style={styles.grid}>
            <TouchableOpacity style={styles.miniCard} onPress={() => navigation.navigate("Veiculos")}>
              <Texto style={styles.cardTitle}>Veículos</Texto>
              <View style={styles.miniCardContent}>
                {veiculos.length === 0 ? (
                  <Texto style={styles.miniText}>Nenhum veículo registrado</Texto>
                ) : (
                  veiculos.slice(0, 3).map((veiculo) => (
                    <View key={veiculo.id} style={styles.itemContainer}>
                      <Texto style={styles.miniText}>{truncateText(veiculo.nome, 20)}</Texto>
                      {renderStatusVeiculo(veiculo.status)}
                    </View>
                  ))
                )}
              </View>
            </TouchableOpacity>

            <TouchableOpacity style={styles.miniCard} onPress={() => navigation.navigate("Lembretes")}>
              <Texto style={styles.cardTitle}>Lembretes</Texto>
              <View style={styles.miniCardContent}>
                {lembretes.length === 0 ? (
                  <Texto style={styles.miniText}>Nenhum lembrete registrado</Texto>
                ) : (
                  lembretes.slice(0, 3).map((lembrete) => (
                    <View key={lembrete.id} style={styles.itemContainer}>
                      <Texto style={styles.miniText}>{truncateText(lembrete.titulo, 20)}</Texto>
                      <Texto style={styles.dataText}>{lembrete.data}</Texto>
                    </View>
                  ))
                )}
              </View>
            </TouchableOpacity>
          </View>

          {/* Botão principal */}
          <TouchableOpacity style={styles.botaoPrincipal}>
            <Texto style={styles.botaoText}>Nova Viagem</Texto>
          </TouchableOpacity>
        </View>

        {/* Navegação inferior */}
        <View style={styles.abas}>
          <TouchableOpacity
            style={[styles.abaItem, styles.abaAtiva]}
            accessibilityRole="button"
            accessibilityLabel="Ir para Início"
          >
            <Image source={require("../assets/voltar.png")} style={styles.abaIcon} />
            <Texto style={[styles.abaText, styles.abaAtivaTexto]}>Início</Texto>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.abaItem}
            onPress={() => navigation.navigate("Alunos")}
            accessibilityRole="button"
            accessibilityLabel="Ir para Alunos"
          >
            <Image source={require("../assets/alunos.png")} style={styles.abaIcon} />
            <Texto style={styles.abaText}>Alunos</Texto>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.abaItem}
            onPress={() => navigation.navigate("Rota")}
            accessibilityRole="button"
            accessibilityLabel="Ir para Rota"
          >
            <Image source={require("../assets/rota.png")} style={styles.abaIcon} />
            <Texto style={styles.abaText}>Rota</Texto>
          </TouchableOpacity>
        </View>

        {/* Modal de edição de mensalidade */}
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
                  onPress={() => {
                    setModalVisible(false);
                    setNovoValorMensalidade("");
                  }}
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
    paddingHorizontal: isTablet ? width * 0.1 : 16,
    flex: 1,
    justifyContent: "space-between",
  },
  header: {
    alignItems: "center",
    paddingTop: 10,
    marginBottom: 16,
  },
  logo: {
    resizeMode: "contain",
    width: isTablet ? 130 : Math.min(110, width * 0.28),
    height: isTablet ? 65 : Math.min(55, width * 0.14),
    marginBottom: 8,
  },
  boasVindas: {
    color: "white",
    fontSize: isTablet ? 26 : 20,
    textAlign: "center",
    lineHeight: isTablet ? 32 : 26,
  },
  nome: {
    fontWeight: "bold",
  },
  cardsContainer: {
    gap: 10,
    marginBottom: 14,
  },
  card: {
    backgroundColor: "#1c2337",
    borderRadius: 16,
    paddingVertical: isTablet ? 18 : 14,
    paddingHorizontal: isTablet ? 22 : 18,
    minHeight: isTablet ? 75 : 65,
    alignItems: "center",
    justifyContent: "center",
  },
  cardTitle: {
    color: "white",
    fontSize: isTablet ? 17 : 15,
    marginBottom: 3,
    textAlign: "center",
  },
  cardTextBold: {
    color: "white",
    fontSize: isTablet ? 17 : 15,
    fontWeight: "bold",
    marginBottom: 3,
    textAlign: "center",
  },
  cardSub: {
    color: "#AAB1C4",
    fontSize: isTablet ? 15 : 13,
    marginTop: 2,
    textAlign: "center",
  },
  grid: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 10,
    marginBottom: 14,
    flex: 1,
  },
  miniCard: {
    backgroundColor: "#1c2337",
    borderRadius: 16,
    padding: isTablet ? 14 : 12,
    flex: 1,
    minHeight: isTablet ? 190 : 170,
    maxHeight: isTablet ? 210 : 190,
  },
  miniCardContent: {
    flex: 1,
    paddingTop: 8,
  },
  itemContainer: {
    marginBottom: 8,
    paddingBottom: 4,
  },
  miniText: {
    color: "#AAB1C4",
    fontSize: isTablet ? 15 : 13,
    lineHeight: isTablet ? 20 : 18,
  },
  dataText: {
    color: "#AAB1C4",
    fontSize: isTablet ? 13 : 11,
    marginTop: 2,
  },
  statusAtivo: {
    color: "limegreen",
    fontSize: isTablet ? 13 : 11,
    marginTop: 2,
  },
  statusManutencao: {
    color: "orange",
    fontSize: isTablet ? 13 : 11,
    marginTop: 2,
  },
  botaoPrincipal: {
    backgroundColor: "#0B49C1",
    paddingVertical: isTablet ? 18 : 14,
    paddingHorizontal: 16,
    borderRadius: 16,
    alignItems: "center",
    marginBottom: 14,
    minHeight: isTablet ? 54 : 48,
  },
  botaoText: {
    color: "white",
    fontSize: isTablet ? 22 : 19,
    fontWeight: "bold",
  },
  abas: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingVertical: 14,
    paddingHorizontal: 16,
    gap: 10,
  },
  abaItem: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#1c2337",
    borderRadius: 16,
    minHeight: isTablet ? 65 : 56,
    paddingVertical: 8,
  },
  abaIcon: {
    width: isTablet ? 30 : 26,
    height: isTablet ? 30 : 26,
    resizeMode: "contain",
    marginBottom: 3,
  },
  abaText: {
    color: "#AAB1C4",
    fontSize: isTablet ? 13 : 12,
    textAlign: "center",
  },
  abaAtiva: {
    backgroundColor: "#0B49C1",
  },
  abaAtivaTexto: {
    color: "white",
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
    maxWidth: isTablet ? 400 : "100%",
    alignSelf: "center",
  },
  modalTitle: {
    color: "white",
    fontSize: isTablet ? 22 : 20,
    textAlign: "center",
    marginBottom: 15,
    fontWeight: "bold",
  },
  input: {
    backgroundColor: "#373e4f",
    color: "#fff",
    borderRadius: 8,
    padding: isTablet ? 15 : 12,
    marginTop: 10,
    fontSize: isTablet ? 20 : 18,
  },
  modalButtons: {
    flexDirection: "row",
    marginTop: 20,
    gap: 10,
  },
  modalButton: {
    flex: 1,
    paddingVertical: isTablet ? 18 : 16,
    borderRadius: 16,
    alignItems: "center",
  },
  cancelButton: {
    backgroundColor: "#6B7280",
  },
  saveButton: {
    backgroundColor: "#0B49C1",
  },
  modalButtonText: {
    color: "white",
    fontSize: isTablet ? 20 : 18,
    fontWeight: "bold",
  },
});