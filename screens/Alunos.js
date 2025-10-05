import React, { useContext, useState } from "react";
import {
  View,
  TouchableOpacity,
  Modal,
  TextInput,
  StyleSheet,
  FlatList,
  Image,
  Dimensions,
  StatusBar,
  Linking,
  Alert,
} from "react-native";
import RNPickerSelect from "react-native-picker-select";
import Texto from "../components/Texto";
import { AlunosContext } from "../components/AlunosContext";
import BarraNavegacao from "../components/BarraNavegacao";
import Header from "../components/Header";
import { useFocusEffect } from "@react-navigation/native";

const { width } = Dimensions.get("window");

export default function AlunosScreen({ navigation }) {
  const {
    alunos,
    adicionarAluno,
    editarAluno,
    removerAluno,
    paradas,
    carregarAlunos,
    carregarParadas,
  } = useContext(AlunosContext);

  const [nome, setNome] = useState("");
  const [CPF, setCPF] = useState("");
  const [telefone, setTelefone] = useState("");
  const [status, setStatus] = useState("Não Pago");
  const [paradaId, setParadaId] = useState(null); // Para adicionar

  const [novoNome, setNovoNome] = useState("");
  const [novoCPF, setNovoCPF] = useState("");
  const [novoTelefone, setNovoTelefone] = useState("");
  const [novoStatus, setNovoStatus] = useState("Não Pago");
  const [novoParadaId, setNovoParadaId] = useState(null);

  const [alunoEditando, setAlunoEditando] = useState(null);
  const [modalAdicionarVisivel, setModalAdicionarVisivel] = useState(false);
  const [modalEditarVisivel, setModalEditarVisivel] = useState(false);
  const [dropdownVisivel, setDropdownVisivel] = useState(false);
  const [editDropdownVisivel, setEditDropdownVisivel] = useState(false);

  useFocusEffect(
    React.useCallback(() => {
      carregarAlunos();
      if (carregarParadas) carregarParadas();
    }, [])
  );
  const formatarCPF = (cpf) => {
    const apenasNumeros = cpf.replace(/\D/g, "");
    if (apenasNumeros.length <= 11) {
      return apenasNumeros
        .replace(/(\d{3})(\d)/, "$1.$2")
        .replace(/(\d{3})(\d)/, "$1.$2")
        .replace(/(\d{3})(\d{1,2})$/, "$1-$2");
    }
    return cpf;
  };

  const formatarTelefone = (text) => {
    const apenasNumeros = text.replace(/\D/g, "");
    if (apenasNumeros.length <= 2) {
      return `(${apenasNumeros}`;
    }
    if (apenasNumeros.length <= 7) {
      return `(${apenasNumeros.slice(0, 2)}) ${apenasNumeros.slice(2)}`;
    }
    return `(${apenasNumeros.slice(0, 2)}) ${apenasNumeros.slice(
      2,
      7
    )}-${apenasNumeros.slice(7, 11)}`;
  };

  const validarCPF = (cpf) => {
    const apenasNumeros = cpf.replace(/\D/g, "");
    return apenasNumeros.length === 11;
  };

  const abrirWhatsApp = (numero) => {
    if (!numero || numero.trim() === "") {
      Alert.alert("Erro", "Número de telefone inválido.");
      return;
    }
      
    const apenasNumeros = numero.replace(/\D/g, "");
    const url = `https://wa.me/55${apenasNumeros}`;

    Linking.openURL(url).catch(() => {
      Alert.alert("Erro", "Não foi possível abrir o WhatsApp.");
    });
  };

  const abrirEdicao = (index) => {
    const aluno = alunos?.[index];
    if (!aluno) return;

    setAlunoEditando(index);
    setNovoNome(aluno.nome || "");
    setNovoCPF(aluno.cpf || aluno.CPF || "");
    setNovoTelefone(aluno.telefone || "");
    setNovoParadaId(aluno.paradaId || null);
    setNovoStatus(aluno.status === "Pago" ? "Pago" : "Não Pago");
    setEditDropdownVisivel(false);
    setModalEditarVisivel(true);
  };

  const salvarEdicao = () => {
    if (!novoNome.trim()) {
      alert("Nome é obrigatório!");
      return;
    }
    if (novoCPF.trim() && !validarCPF(novoCPF)) {
      alert("CPF inválido! Digite 11 dígitos.");
      return;
    }
    const statusValido = novoStatus === "Pago" ? "Pago" : "Não Pago";
    editarAluno(
      alunoEditando,
      novoNome,
      novoCPF,
      statusValido,
      novoTelefone,
      novoParadaId
    );
    setModalEditarVisivel(false);
  };

  const handleAdicionarAluno = () => {
    if (!nome.trim()) {
      alert("Nome é obrigatório!");
      return;
    }
    if (CPF.trim() && !validarCPF(CPF)) {
      alert("CPF inválido! Digite 11 dígitos.");
      return;
    }
    const statusValido = status === "Pago" ? "Pago" : "Não Pago";
    adicionarAluno(nome, CPF, statusValido, "", telefone, paradaId);
    setNome("");
    setCPF("");
    setTelefone("");
    setStatus("Não Pago");
    setParadaId(null);
    setModalAdicionarVisivel(false);
  };

  const abrirModalAdicionar = () => {
    setNome("");
    setCPF("");
    setTelefone("");
    setStatus("Não Pago");
    setDropdownVisivel(false);
    setModalAdicionarVisivel(true);
  };

  return (
    <>
      <StatusBar barStyle="light-content" backgroundColor="#0A0E21" />
      <View style={styles.container}>
        <View style={styles.content}>
          <View style={styles.header}>
            <Header navigation={navigation} />
          </View>
          <Texto style={styles.titulo}>Alunos</Texto>
          <FlatList
            data={alunos}
            keyExtractor={(item) => String(item.id)}
            ListEmptyComponent={
              <Texto style={styles.semAlunosTexto}>
                Nenhum aluno cadastrado.
              </Texto>
            }
            renderItem={({ item, index }) => (
              <View style={styles.card}>
                <TouchableOpacity
                  style={styles.ladoEsquerdo}
                  onPress={() => abrirEdicao(index)}
                  activeOpacity={0.7}
                >
                  <Texto style={styles.nome}>{item.nome}</Texto>
                  {item.cpf && (
                    <Texto style={styles.cpf}>CPF: {item.cpf}</Texto>
                  )}
                  {item.telefone && (
                    <Texto style={styles.cpf}>Telefone: {item.telefone}</Texto>
                  )}
                  <Texto
                    style={
                      item.status === "Pago" ? styles.pago : styles.naoPago
                    }
                  >
                    Status: {item.status}
                  </Texto>
                </TouchableOpacity>
                <View style={styles.ladoDireito}>
                  {item.telefone && (
                    <TouchableOpacity
                      style={styles.botaoWhatsapp}
                      onPress={() => abrirWhatsApp(item.telefone)}
                    >
                      <Image
                        source={require("../assets/whatsapp.png")}
                        style={styles.iconeWhatsapp}
                      />
                    </TouchableOpacity>
                  )}
                  <TouchableOpacity
                    style={styles.botaoPequeno}
                    onPress={() => removerAluno(index)}
                    activeOpacity={0.7}
                  >
                    <Texto style={styles.botaoPequenoTexto}>Excluir</Texto>
                  </TouchableOpacity>
                </View>
              </View>
            )}
            contentContainerStyle={{ paddingBottom: 20 }}
          />

          <TouchableOpacity
            style={styles.botao}
            onPress={abrirModalAdicionar}
            activeOpacity={0.8}
            accessibilityLabel="Adicionar novo aluno"
          >
            <Texto style={styles.botaoTexto}>Adicionar Aluno</Texto>
          </TouchableOpacity>
        </View>

        <BarraNavegacao navigation={navigation} abaAtiva="Alunos" />

        <Modal
          visible={modalAdicionarVisivel}
          animationType="slide"
          transparent
        >
          <View style={styles.modalFundo}>
            <View style={styles.modalBox}>
              <Texto style={styles.modalTitulo}>Adicionar Aluno</Texto>
              <TextInput
                style={styles.input}
                placeholder="Nome do aluno"
                placeholderTextColor="#cfcfcf"
                value={nome}
                onChangeText={setNome}
              />
              <TextInput
                style={styles.input}
                placeholder="CPF (opcional)"
                placeholderTextColor="#cfcfcf"
                value={CPF}
                onChangeText={(text) => setCPF(formatarCPF(text))}
                keyboardType="numeric"
                maxLength={14}
              />
              <TextInput
                style={styles.input}
                placeholder="Telefone (opcional)"
                placeholderTextColor="#cfcfcf"
                value={telefone}
                onChangeText={(text) => setTelefone(formatarTelefone(text))}
                keyboardType="numeric"
                maxLength={15}
              />
              <RNPickerSelect
                onValueChange={setParadaId}
                value={paradaId}
                placeholder={{
                  label: "Selecione uma parada",
                  value: null,
                  color: "#000000ff",
                }}
                items={paradas.map((parada) => ({
                  label: parada.nome,
                  value: parada.id,
                  key: parada.id,
                  color: "#000000ff",
                }))}
                style={{
                  inputIOS: styles.pickerInput,
                  inputAndroid: styles.pickerInput,
                  placeholder: styles.pickerPlaceholder,
                }}
                useNativeAndroidPickerStyle={false}
              />
              <Texto style={styles.h1}>Status:</Texto>
              <TouchableOpacity
                style={styles.dropdown}
                onPress={() => setDropdownVisivel(!dropdownVisivel)}
              >
                <Texto style={styles.dropdownTexto}>{status}</Texto>
              </TouchableOpacity>
              {dropdownVisivel && (
                <View style={styles.dropdownOpcoes}>
                  <TouchableOpacity
                    onPress={() => {
                      setStatus("Pago");
                      setDropdownVisivel(false);
                    }}
                  >
                    <Texto style={styles.opcaoTexto}>Pago</Texto>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => {
                      setStatus("Não Pago");
                      setDropdownVisivel(false);
                    }}
                  >
                    <Texto style={styles.opcaoTextoUltima}>Não Pago</Texto>
                  </TouchableOpacity>
                </View>
              )}
              <View style={styles.botoesModal}>
                <TouchableOpacity
                  style={styles.botaoCancelar}
                  onPress={() => setModalAdicionarVisivel(false)}
                >
                  <Texto style={styles.botaoModalTexto}>Cancelar</Texto>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.botaoModal}
                  onPress={handleAdicionarAluno}
                >
                  <Texto style={styles.botaoModalTexto}>Adicionar</Texto>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        <Modal visible={modalEditarVisivel} animationType="slide" transparent>
          <View style={styles.modalFundo}>
            <View style={styles.modalBox}>
              <Texto style={styles.modalTitulo}>Informações do Aluno</Texto>
              <TextInput
                style={styles.input}
                placeholder="Novo nome"
                placeholderTextColor="#cfcfcf"
                value={novoNome}
                onChangeText={setNovoNome}
              />
              <TextInput
                style={styles.input}
                placeholder="CPF (opcional)"
                placeholderTextColor="#cfcfcf"
                value={novoCPF}
                onChangeText={(text) => setNovoCPF(formatarCPF(text))}
                keyboardType="numeric"
                maxLength={14}
              />
              <TextInput
                style={styles.input}
                placeholder="Telefone (opcional)"
                placeholderTextColor="#cfcfcf"
                value={novoTelefone}
                onChangeText={(text) => setNovoTelefone(formatarTelefone(text))}
                keyboardType="numeric"
                maxLength={15}
              />
              <RNPickerSelect
                onValueChange={setNovoParadaId}
                value={novoParadaId}
                placeholder={{
                  label: "Selecione uma parada",
                  value: null,
                  color: "#000000ff",
                }}
                items={paradas.map((parada) => ({
                  label: parada.nome,
                  value: parada.id,
                  key: parada.id,
                  color: "#000000ff",
                }))}
                style={{
                  inputIOS: styles.pickerInput,
                  inputAndroid: styles.pickerInput,
                  placeholder: styles.pickerPlaceholder,
                }}
                useNativeAndroidPickerStyle={false}
              />
              <Texto style={styles.h1}>Status:</Texto>
              <TouchableOpacity
                style={styles.dropdown}
                onPress={() => setEditDropdownVisivel(!editDropdownVisivel)}
              >
                <Texto style={styles.dropdownTexto}>{novoStatus}</Texto>
              </TouchableOpacity>

              {editDropdownVisivel && (
                <View style={styles.dropdownOpcoes}>
                  <TouchableOpacity
                    onPress={() => {
                      setNovoStatus("Pago");
                      setEditDropdownVisivel(false);
                    }}
                  >
                    <Texto style={styles.opcaoTexto}>Pago</Texto>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => {
                      setNovoStatus("Não Pago");
                      setEditDropdownVisivel(false);
                    }}
                  >
                    <Texto style={styles.opcaoTextoUltima}>Não Pago</Texto>
                  </TouchableOpacity>
                </View>
              )}

              <View style={styles.botoesModal}>
                <TouchableOpacity
                  style={styles.botaoCancelar}
                  onPress={() => setModalEditarVisivel(false)}
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
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#050a24",
    flex: 1,
    paddingVertical: 30,
  },
  content: {
    paddingHorizontal: width > 768 ? width * 0.1 : 16,
    flex: 1,
  },
  header: {
    alignItems: "center",
    top: -10,
  },
  semAlunosTexto: {
    color: "#ccc",
    fontSize: width > 768 ? 18 : 16,
    textAlign: "center",
    marginTop: 40,
  },
  titulo: {
    fontSize: width > 768 ? 24 : 20,
    color: "white",
    marginBottom: 20,
    textAlign: "center",
    top: -10,
  },
  card: {
    backgroundColor: "#1c2337",
    borderRadius: 12,
    marginBottom: 15,
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: width > 768 ? 25 : 15,
    alignItems: "center",
    minHeight: width > 768 ? 100 : 80,
  },
  ladoEsquerdo: {
    flex: 1,
    justifyContent: "center",
  },
  ladoDireito: {
    flexDirection: "row",
    alignItems: "center",
    gap: 15,
  },
  nome: {
    color: "white",
    fontSize: width > 768 ? 18 : 16,
    fontWeight: "bold",
  },
  cpf: {
    fontSize: width > 768 ? 16 : 14,
    color: "#AAB1C4",
    marginTop: 2,
  },
  pago: {
    color: "limegreen",
    fontSize: width > 768 ? 16 : 14,
    marginTop: 4,
  },
  naoPago: {
    color: "orange",
    fontSize: width > 768 ? 16 : 14,
    marginTop: 4,
  },
  botao: {
    backgroundColor: "#0B49C1",
    paddingVertical: width > 768 ? 20 : 16,
    borderRadius: 16,
    alignItems: "center",
    marginTop: 25,
    marginBottom: 10,
  },
  botaoTexto: {
    color: "white",
    fontSize: width > 768 ? 24 : 20,
    fontWeight: "bold",
  },
  botaoPequeno: {
    backgroundColor: "#c41628ff",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  botaoPequenoTexto: {
    color: "white",
    fontWeight: "bold",
    fontSize: width > 768 ? 16 : 14,
  },
  botaoWhatsapp: {
    backgroundColor: "#25D366",
    borderRadius: 50,
    padding: 8,
  },
  iconeWhatsapp: {
    width: 24,
    height: 24,
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
    maxWidth: 500,
  },
  modalTitulo: {
    color: "#fff",
    fontSize: 20,
    marginBottom: 15,
    textAlign: "center",
    fontWeight: "bold",
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
  input: {
    backgroundColor: "#373e4f",
    borderRadius: 16,
    paddingHorizontal: 15,
    paddingVertical: 12,
    marginBottom: 15,
    fontSize: 16,
    color: "#ffffff",
  },
  pickerInput: {
    backgroundColor: "#373e4f",
    color: "#fff",
    borderRadius: 16,
    paddingHorizontal: 15,
    paddingVertical: 12,
    marginBottom: 15,
    fontSize: 16,
  },
  pickerPlaceholder: {
    color: "#cfcfcf",
  },
  dropdown: {
    backgroundColor: "#373e4f",
    borderRadius: 16,
    padding: 12,
    marginBottom: 15,
  },
  dropdownTexto: {
    color: "#ffffff",
    fontSize: 16,
  },
  dropdownOpcoes: {
    backgroundColor: "#242a39",
    borderRadius: 16,
    padding: 10,
    marginTop: -10,
    marginBottom: 15,
  },
  opcaoTexto: {
    color: "#ffffff",
    fontSize: 16,
    paddingVertical: 8,
    paddingHorizontal: 5,
    borderBottomWidth: 1,
    borderBottomColor: "#6666",
  },
  opcaoTextoUltima: {
    color: "#ffffff",
    fontSize: 16,
    paddingVertical: 8,
    paddingHorizontal: 5,
  },
  h1: {
    color: "#fff",
    fontSize: 16,
    marginBottom: 8,
  },
});
