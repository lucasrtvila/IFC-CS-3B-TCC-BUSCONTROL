import React, { useContext, useState, useEffect } from "react";
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
  SafeAreaView,
} from "react-native";
import RNPickerSelect from "react-native-picker-select";
import { useFocusEffect } from "@react-navigation/native";
import * as Print from 'expo-print';

import Texto from "../components/Texto";
import { AlunosContext } from "../components/AlunosContext";
import BarraNavegacao from "../components/BarraNavegacao";
import Header from "../components/Header";

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

  const [alunosExibidos, setAlunosExibidos] = useState([]);
  const [filtroAtivo, setFiltroAtivo] = useState(null);

  // Estados para modais e inputs
  const [nome, setNome] = useState("");
  const [CPF, setCPF] = useState("");
  const [telefone, setTelefone] = useState("");
  const [status, setStatus] = useState("Não Pago");
  const [paradaId, setParadaId] = useState(null);

  const [novoNome, setNovoNome] = useState("");
  const [novoCPF, setNovoCPF] = useState("");
  const [novoTelefone, setNovoTelefone] = useState("");
  const [novoStatus, setNovoStatus] = useState("Não Pago");
  const [novoParadaId, setNovoParadaId] = useState(null);

  const [alunoEditando, setAlunoEditando] = useState(null);
  const [alunoSelecionado, setAlunoSelecionado] = useState(null);
  const [modalAdicionarVisivel, setModalAdicionarVisivel] = useState(false);
  const [modalEditarVisivel, setModalEditarVisivel] = useState(false);
  const [modalDetalhesVisivel, setModalDetalhesVisivel] = useState(false);
  const [dropdownVisivel, setDropdownVisivel] = useState(false);
  const [editDropdownVisivel, setEditDropdownVisivel] = useState(false);
  const [filtroDropdownVisivel, setFiltroDropdownVisivel] = useState(false);

  useFocusEffect(
    React.useCallback(() => {
      carregarAlunos();
      if (carregarParadas) carregarParadas();
    }, [])
  );

  useEffect(() => {
    let alunosFiltrados = [...alunos];
    if (filtroAtivo === "nome") {
      alunosFiltrados.sort((a, b) => a.nome.localeCompare(b.nome));
    } else if (filtroAtivo === "pagos") {
      alunosFiltrados = alunosFiltrados.filter((a) => a.status === "Pago");
    }
    setAlunosExibidos(alunosFiltrados);
  }, [alunos, filtroAtivo]);

  const limparFiltros = () => {
    setFiltroAtivo(null);
    setFiltroDropdownVisivel(false);
  };

  const gerarPDF = async () => {
    const htmlContent = `
      <html>
        <head>
          <style>
            body { font-family: Helvetica, Arial, sans-serif; font-size: 10px; }
            h1 { text-align: center; }
            table { width: 100%; border-collapse: collapse; }
            th, td { border: 1px solid #ddd; padding: 6px; text-align: left; }
            th { background-color: #f2f2f2; }
          </style>
        </head>
        <body>
          <h1>Lista de Alunos</h1>
          <table>
            <thead>
              <tr>
                <th>Nome</th>
                <th>CPF</th>
                <th>Telefone</th>
                <th>Status</th>
                <th>Parada</th>
              </tr>
            </thead>
            <tbody>
              ${alunosExibidos
                .map(
                  (aluno) => `
                <tr>
                  <td>${aluno.nome || ""}</td>
                  <td>${aluno.cpf || "Não informado"}</td>
                  <td>${aluno.telefone || "Não informado"}</td>
                  <td>${aluno.status || ""}</td>
                  <td>${
                    paradas.find((p) => p.id === aluno.paradaId)?.nome || "N/A"
                  }</td>
                </tr>
              `
                )
                .join("")}
            </tbody>
          </table>
        </body>
      </html>
    `;

    try {
      await Print.printAsync({ html: htmlContent });
    } catch (error) {
      Alert.alert("Erro", "Não foi possível gerar o PDF.");
    }
  };

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
    if (apenasNumeros.length <= 2) return `(${apenasNumeros}`;
    if (apenasNumeros.length <= 7)
      return `(${apenasNumeros.slice(0, 2)}) ${apenasNumeros.slice(2)}`;
    return `(${apenasNumeros.slice(0, 2)}) ${apenasNumeros.slice(
      2,
      7
    )}-${apenasNumeros.slice(7, 11)}`;
  };

  const validarCPF = (cpf) => cpf.replace(/\D/g, "").length === 11;

  const abrirWhatsApp = (numero) => {
    if (!numero?.trim()) {
      Alert.alert("Erro", "Número de telefone inválido.");
      return;
    }
    const url = `https://wa.me/55${numero.replace(/\D/g, "")}`;
    Linking.openURL(url).catch(() =>
      Alert.alert("Erro", "Não foi possível abrir o WhatsApp.")
    );
  };
  
  const abrirModalDetalhes = (aluno) => {
    setAlunoSelecionado(aluno);
    setModalDetalhesVisivel(true);
  };
  
  const abrirEdicao = (aluno) => {
    setModalDetalhesVisivel(false);
    const index = alunos.findIndex((a) => a.id === aluno.id);
    if (index === -1) return;

    setAlunoEditando(index);
    setNovoNome(aluno.nome || "");
    setNovoCPF(aluno.cpf || "");
    setNovoTelefone(aluno.telefone || "");
    setNovoParadaId(aluno.paradaId || null);
    setNovoStatus(aluno.status === "Pago" ? "Pago" : "Não Pago");
    setEditDropdownVisivel(false);
    setModalEditarVisivel(true);
  };

  const salvarEdicao = () => {
    if (!novoNome.trim()) return alert("Nome é obrigatório!");
    if (novoCPF.trim() && !validarCPF(novoCPF))
      return alert("CPF inválido! Digite 11 dígitos.");
    editarAluno(
      alunoEditando,
      novoNome,
      novoCPF,
      novoStatus,
      novoTelefone,
      novoParadaId
    );
    setModalEditarVisivel(false);
  };

  const handleAdicionarAluno = () => {
    if (!nome.trim()) return alert("Nome é obrigatório!");
    if (CPF.trim() && !validarCPF(CPF))
      return alert("CPF inválido! Digite 11 dígitos.");
    adicionarAluno(nome, CPF, status, "", telefone, paradaId);
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
    setParadaId(null);
    setDropdownVisivel(false);
    setModalAdicionarVisivel(true);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#0A0E21" />
      <View style={styles.container}>
        <View style={styles.content}>
          <Header navigation={navigation} />
          <Texto style={styles.titulo}>Alunos</Texto>

          <View style={styles.botoesTopoContainer}>
            <TouchableOpacity style={styles.botaoTopo} onPress={gerarPDF}>
              <Texto style={styles.botaoTopoTexto}>Imprimir</Texto>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.botaoTopo}
              onPress={() => setFiltroDropdownVisivel(true)}
            >
              <Texto style={styles.botaoTopoTexto}>Filtrar</Texto>
            </TouchableOpacity>
          </View>

          <FlatList
            data={alunosExibidos}
            keyExtractor={(item) => String(item.id)}
            style={styles.lista}
            ListEmptyComponent={
              <Texto style={styles.semAlunosTexto}>Nenhum aluno cadastrado.</Texto>
            }
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.card}
                onPress={() => abrirModalDetalhes(item)}
                activeOpacity={0.7}
              >
                <View style={styles.ladoEsquerdo}>
                  <Texto style={styles.nome}>{item.nome}</Texto>
                  <Texto style={styles.parada}>
                    Parada:{" "}
                    {paradas.find((p) => p.id === item.paradaId)?.nome || "N/A"}
                  </Texto>
                </View>
                <View style={styles.ladoDireito}>
                  <Texto
                    style={
                      item.status === "Pago" ? styles.pago : styles.naoPago
                    }
                  >
                    {item.status}
                  </Texto>
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
                </View>
              </TouchableOpacity>
            )}
            contentContainerStyle={{ paddingBottom: 20 }}
          />

          <TouchableOpacity
            style={styles.botaoAdicionar}
            onPress={abrirModalAdicionar}
          >
            <Texto style={styles.botaoTexto}>Adicionar Aluno</Texto>
          </TouchableOpacity>
        </View>
      </View>

      <BarraNavegacao navigation={navigation} abaAtiva="Alunos" />

      {/* Modais aqui... */}
      <Modal
        visible={filtroDropdownVisivel}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setFiltroDropdownVisivel(false)}
      >
        <TouchableOpacity
          style={styles.modalFundo}
          activeOpacity={1}
          onPressOut={() => setFiltroDropdownVisivel(false)}
        >
          <View style={styles.modalFiltroBox}>
            <TouchableOpacity
              style={[
                styles.opcaoFiltro,
                filtroAtivo === "nome" && styles.filtroAtivo,
              ]}
              onPress={() => {
                setFiltroAtivo("nome");
                setFiltroDropdownVisivel(false);
              }}
            >
              <Texto style={styles.opcaoTexto}>Ordenar por Nome (A-Z)</Texto>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.opcaoFiltro,
                filtroAtivo === "pagos" && styles.filtroAtivo,
              ]}
              onPress={() => {
                setFiltroAtivo("pagos");
                setFiltroDropdownVisivel(false);
              }}
            >
              <Texto style={styles.opcaoTexto}>Mostrar Apenas Pagos</Texto>
            </TouchableOpacity>
            <TouchableOpacity style={styles.opcaoFiltro} onPress={limparFiltros}>
              <Texto style={styles.opcaoTexto}>Limpar Filtros</Texto>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      {alunoSelecionado && (
        <Modal
          visible={modalDetalhesVisivel}
          animationType="slide"
          transparent
        >
          <View style={styles.modalFundo}>
            <View style={styles.modalBox}>
              <Texto style={styles.modalTitulo}>Detalhes do Aluno</Texto>
              <Texto style={styles.detalheLabel}>Nome:</Texto>
              <Texto style={styles.detalheValor}>{alunoSelecionado.nome}</Texto>
              <Texto style={styles.detalheLabel}>CPF:</Texto>
              <Texto style={styles.detalheValor}>
                {alunoSelecionado.cpf || "Não informado"}
              </Texto>
              <Texto style={styles.detalheLabel}>Telefone:</Texto>
              <Texto style={styles.detalheValor}>
                {alunoSelecionado.telefone || "Não informado"}
              </Texto>
              <Texto style={styles.detalheLabel}>Parada:</Texto>
              <Texto style={styles.detalheValor}>
                {paradas.find((p) => p.id === alunoSelecionado.paradaId)?.nome ||
                  "Não informada"}
              </Texto>
              <Texto style={styles.detalheLabel}>Status:</Texto>
              <Texto
                style={
                  alunoSelecionado.status === "Pago"
                    ? styles.pago
                    : styles.naoPago
                }
              >
                {alunoSelecionado.status}
              </Texto>

              <View style={styles.botoesModal}>
                <TouchableOpacity
                  style={styles.botaoCancelar}
                  onPress={() => setModalDetalhesVisivel(false)}
                >
                  <Texto style={styles.botaoModalTexto}>Fechar</Texto>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.botaoModal}
                  onPress={() => abrirEdicao(alunoSelecionado)}
                >
                  <Texto style={styles.botaoModalTexto}>Editar</Texto>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      )}

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
              }}
              items={paradas.map((parada) => ({
                label: parada.nome,
                value: parada.id,
                key: parada.id,
              }))}
              style={{
                inputIOS: styles.pickerInput,
                inputAndroid: styles.pickerInput,
                placeholder: { color: "#cfcfcf" },
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
                <TouchableOpacity onPress={() => { setStatus("Pago"); setDropdownVisivel(false); }}>
                  <Texto style={styles.opcaoTexto}>Pago</Texto>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => { setStatus("Não Pago"); setDropdownVisivel(false); }}>
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
            <Texto style={styles.modalTitulo}>Editar Aluno</Texto>
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
              }}
              items={paradas.map((parada) => ({
                label: parada.nome,
                value: parada.id,
                key: parada.id,
              }))}
              style={{
                inputIOS: styles.pickerInput,
                inputAndroid: styles.pickerInput,
                placeholder: { color: "#cfcfcf" },
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
                <TouchableOpacity onPress={() => { setNovoStatus("Pago"); setEditDropdownVisivel(false); }}>
                  <Texto style={styles.opcaoTexto}>Pago</Texto>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => { setNovoStatus("Não Pago"); setEditDropdownVisivel(false); }}>
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
            <TouchableOpacity
              style={styles.botaoExcluir}
              onPress={() => {
                setModalEditarVisivel(false);
                const index = alunos.findIndex(a => a.id === alunoSelecionado.id);
                removerAluno(index);
              }}
            >
              <Texto style={styles.botaoModalTexto}>Excluir Aluno</Texto>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#050a24",
  },
  container: {
    flex: 1,
    backgroundColor: "#050a24",
    paddingTop: 30,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  header: {
    alignItems: "center",
  },
  titulo: {
    fontSize: width > 768 ? 28 : 24,
    color: "white",
    marginBottom: 20,
    textAlign: "center",
    fontWeight: "bold",
  },
  botoesTopoContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 20,
    gap: 10,
  },
  botaoTopo: {
    backgroundColor: "#1c2337",
    paddingVertical: 10,
    paddingHorizontal: 25,
    borderRadius: 12,
  },
  botaoTopoTexto: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  lista: {
    flex: 1,
  },
  card: {
    backgroundColor: "#1c2337",
    borderRadius: 12,
    marginBottom: 15,
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 15,
    alignItems: "center",
  },
  ladoEsquerdo: {
    flex: 1,
  },
  ladoDireito: {
    flexDirection: "row",
    alignItems: "center",
    gap: 15,
  },
  nome: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
  parada: {
    fontSize: 14,
    color: "#AAB1C4",
    marginTop: 4,
  },
  pago: {
    color: "limegreen",
    fontSize: 14,
    fontWeight: "bold",
  },
  naoPago: {
    color: "orange",
    fontSize: 14,
    fontWeight: "bold",
  },
  botaoAdicionar: {
      backgroundColor: "#0B49C1",
      paddingVertical: width > 768 ? 20 : 16,
      borderRadius: 16,
      alignItems: "center",
      width: "100%",
      marginTop: 10,
    marginBottom: 15, // Ajustado para descer um pouco mais
  },
  botaoTexto: {
    color: "white",
    fontSize: 20,
    fontWeight: "bold",
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
    backgroundColor: "rgba(0,0,0,0.7)",
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
    fontSize: 22,
    marginBottom: 20,
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
  botaoExcluir: {
    backgroundColor: "#c41628ff",
    paddingVertical: 14,
    borderRadius: 16,
    alignItems: "center",
    marginTop: 10,
  },
  botaoModalTexto: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  input: {
    backgroundColor: "#373e4f",
    borderRadius: 16,
    padding: 15,
    marginBottom: 15,
    fontSize: 16,
    color: "#ffffff",
  },
  pickerInput: {
    backgroundColor: "#373e4f",
    borderRadius: 16,
    padding: 15,
    marginBottom: 15,
    fontSize: 16,
    color: "#ffffff",
  },
  dropdown: {
    backgroundColor: "#373e4f",
    borderRadius: 16,
    padding: 15,
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
    paddingVertical: 10,
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
  semAlunosTexto: {
    color: "#ccc",
    textAlign: "center",
    marginTop: 50,
    fontSize: 16,
  },
  modalFiltroBox: {
    backgroundColor: "#1c2337",
    borderRadius: 12,
    padding: 10,
    position: "absolute",
    top: 130,
    right: 16,
    width: 250,
  },
  opcaoFiltro: {
    paddingVertical: 12,
    paddingHorizontal: 15,
  },
  filtroAtivo: {
    backgroundColor: "#0B49C1",
    borderRadius: 8,
  },
  detalheLabel: {
    color: "#AAB1C4",
    fontSize: 16,
    marginTop: 10,
  },
  detalheValor: {
    color: "white",
    fontSize: 18,
    marginBottom: 5,
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
      fontSize: 14,
  },
});