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
  Dimensions,
  Platform,
  StatusBar,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import * as Location from "expo-location"; //importa a localização pra poder usar depois pra exibir na tela

const { height, width } = Dimensions.get("window");
const isWeb = Platform.OS === "web";

export default function Inicial({ navigation, route }) {
  const { usuario } = useContext(UsuariosContext);
  const nomeUsuario = usuario?.nome || "Usuário";
  const [localizacao, setLocalizacao] = useState("Buscando..."); //useState, array que recebe estado atual e função pra alterar, no começo é passado o estado padrão. OU seja, buscando é o estado padrão e a funcao de alterar muda ela depois.
  const [mensalidade, setMensalidade] = useState(380.0);
  const [saudacao, setSaudacao] = useState("");
  const [modalVisible, setModalVisible] = useState(false);
  const [novoValorMensalidade, setNovoValorMensalidade] = useState("");

  const { veiculos } = useContext(VeiculosContext);
  const { lembretes } = useContext(LembretesContext);

  const abaAtiva = "Inicial";

  useEffect(() => {
    const hora = new Date().getHours(); //variavel hora recebe a getHours da função de data
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
      <SafeAreaView
        style={styles.container}
        edges={["bottom", "left", "right", "top"]}
      >
        <View style={styles.content}>
          <View style={styles.header}>
            <Image
              source={require("../assets/logoinicial.png")}
              style={styles.logo}
            />
            <Texto style={styles.boasVindas}>
              {saudacao}
              <Texto style={styles.nome}>{nomeUsuario}</Texto>
            </Texto>
          </View>

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
                      {v.nome.length > 22 // se a propriedade nome do obj veiculo for maior que 22 caracteres
                        ? v.nome.slice(0, 20) + "..." // se for, corta até o caractere 20 e add 3 pontos, se nao so mostra o nome inteiro
                        : v.nome}
                    </Texto>
                    <Texto
                      style={
                        v.status === "Ativo" // se a propriedade veiculo.status ativo for
                          ? styles.statusAtivo //verdadeiro: o estilo vai ser de ativo
                          : styles.statusManutencao //falso: o estilo vai ser manutencao
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
              onPress={() => navigation.navigate("Lembretes")} // quando apertar em cima vai pra lembretes
            >
              <Texto style={styles.cardTitle}>Lembretes</Texto>
              {lembretes.length === 0 ? ( // se o tamanho da lista de lembretes for 0, vai exibir nenhum lembrete registrado
                <Texto style={styles.miniText}>
                  Nenhum lembrete registrado
                </Texto>
              ) : (
                lembretes.slice(0, 4).map(
                  (
                    l // o slice limita o card a exibir no max 4 lembretes
                  ) => (
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
                  )
                )
              )}
            </TouchableOpacity>
          </View>
          <TouchableOpacity style={styles.botaoPrincipal}>
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
        {/* Barra de navegação inferior */}
        <View style={styles.abas}>
          <TouchableOpacity
            style={[styles.abaItem, styles.abaAtiva]}
            accessibilityRole="button"
            accessibilityLabel="Ir para Início"
          >
            <Image
              source={require("../assets/voltar.png")}
              style={styles.abaIcon}
            />
            <Texto style={[styles.abaText, styles.abaAtivaTexto]}>Início</Texto>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.abaItem}
            onPress={() => navigation.navigate("Alunos")}
            accessibilityRole="button"
            accessibilityLabel="Tela de Alunos"
          >
            <Image
              source={require("../assets/alunos.png")}
              style={styles.abaIcon}
            />
            <Texto style={styles.abaText}>Alunos</Texto>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.abaItem}
            onPress={() => navigation.navigate("Rota")}
            accessibilityRole="button"
            accessibilityLabel="Tela de Rota"
          >
            <Image
              source={require("../assets/rota.png")}
              style={styles.abaIcon}
            />
            <Texto style={styles.abaText}>Rota</Texto>
          </TouchableOpacity>
        </View>
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
    paddingHorizontal: width > 768 ? width * 0.1 : 16,
    flex: 1,
    paddingBottom: 0,
    minHeight: height - 120,
  },
  header: {
    alignItems: "center",
    paddingTop: 10,
  },
  abas: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingVertical: 15,
    paddingHorizontal: 15,
    marginTop: "auto",
    gap: 15,
    //bottom: 0,
  },
  abaItem: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#1c2337",
    borderRadius: 16,
    minHeight: 60,
  },
  abaIcon: {
    width: 27,
    height: 27,
    resizeMode: "contain",
  },
  abaText: {
    color: "#AAB1C4",
    fontSize: 12,
  },
  abaAtiva: {
    backgroundColor: "#0B49C1",
    borderRadius: 16,
    minHeight: 60,
  },
  abaAtivaTexto: {
    color: "white",
    fontWeight: "bold",
  },
  logo: {
    resizeMode: "contain",
    width: Math.min(120, width * 0.3),
    height: Math.min(60, width * 0.15),
    marginBottom: 5,
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
    marginTop: 16,
  },
  card: {
    backgroundColor: "#1c2337",
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 16,
    justifyContent: "center",
    marginBottom: 5,
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
    marginVertical: 12,
  },
  miniCard: {
    backgroundColor: "#1c2337",
    borderRadius: 16,
    padding: 12,
    flex: 1,
    minHeight: 250,
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
    paddingVertical: width > 768 ? 20 : 16,
    paddingHorizontal: 16,
    borderRadius: 16,
    alignItems: "center",
    marginTop: 20,
    marginBottom: 20,
    minHeight: width > 768 ? 60 : 50,
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
  modalButtonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
});