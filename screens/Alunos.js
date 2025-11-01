import React, { useContext, useState, useEffect } from "react";
import {
  View, // Alterado de SafeAreaView
  TouchableOpacity,
  Modal,
  TextInput,
  StyleSheet,
  FlatList,
  Image,
  Dimensions,
  StatusBar,
  Linking,
  Alert, // Alert está importado
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
  // --- MUDANÇA 1/4: Buscar ambas as listas e funções do contexto ---
  const {
    alunos: alunosComStatus, // Lista com status (inclui inativos com histórico)
    alunosBase, // Lista SÓ COM ALUNOS ATIVOS (sem status do mês)
    adicionarAluno,
    editarAluno,
    removerAluno,
    paradas,
    carregarAlunos: carregarAlunosComStatus, // Função que carrega alunosComStatus
    carregarAlunosBase, // Função que carrega alunosBase
    carregarParadas,
  } = useContext(AlunosContext);

  const [alunosExibidos, setAlunosExibidos] = useState([]);
  const [filtroAtivo, setFiltroAtivo] = useState(null);

  // Estados para modais e inputs
  const [nome, setNome] = useState("");
  const [CPF, setCPF] = useState("");
  const [telefone, setTelefone] = useState("");
  // const [status, setStatus] = useState("Não Pago"); // <-- REMOVIDO
  const [paradaId, setParadaId] = useState(null);

  const [novoNome, setNovoNome] = useState("");
  const [novoCPF, setNovoCPF] = useState("");
  const [novoTelefone, setNovoTelefone] = useState("");
  const [novoStatus, setNovoStatus] = useState("Não Pago");
  const [novoParadaId, setNovoParadaId] = useState(null);

  const [alunoEditando, setAlunoEditando] = useState(null); // Agora armazena o ID
  const [alunoSelecionado, setAlunoSelecionado] = useState(null);
  const [modalAdicionarVisivel, setModalAdicionarVisivel] = useState(false);
  const [modalEditarVisivel, setModalEditarVisivel] = useState(false);
  const [modalDetalhesVisivel, setModalDetalhesVisivel] = useState(false);
  // const [dropdownVisivel, setDropdownVisivel] = useState(false); // <-- REMOVIDO
  const [editDropdownVisivel, setEditDropdownVisivel] = useState(false);
  const [filtroDropdownVisivel, setFiltroDropdownVisivel] = useState(false);

  useFocusEffect(
    React.useCallback(() => {
      // --- MUDANÇA 2/4: Carregar ambas as listas ---
      carregarAlunosBase(); // Carrega alunos ATIVOS (para filtrar)
      carregarAlunosComStatus(); // Carrega alunos com STATUS (para exibir)
      if (carregarParadas) carregarParadas();
    }, [])
  );

  useEffect(() => {
    // --- MUDANÇA 3/4: Filtrar a lista de status usando a lista de ativos ---
    
    // 1. Criar um Set de IDs de alunos ativos
    const alunosAtivosIds = new Set(alunosBase.map(a => a.id));

    // 2. Filtrar a lista que TEM o status (alunosComStatus)
    //    para incluir APENAS aqueles que estão ATIVOS (presentes no Set)
    let alunosFiltrados = alunosComStatus.filter(aluno => 
      alunosAtivosIds.has(aluno.id)
    );
    
    // 3. Aplicar filtros de exibição (Ordenação, Pagos)
    if (filtroAtivo === "nome") {
      alunosFiltrados.sort((a, b) => a.nome.localeCompare(b.nome));
    } else if (filtroAtivo === "pagos") {
      // Agora filtra a lista correta (ativos com status)
      alunosFiltrados = alunosFiltrados.filter((a) => a.status === "Pago");
    }
    
    setAlunosExibidos(alunosFiltrados);
    
  }, [alunosComStatus, alunosBase, filtroAtivo]); // Reage a AMBAS as listas
  // --- FIM DA MUDANÇA 3/4 ---


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

  // --- MUDANÇA 4/4 (Parte A): Armazena o ID para edição ---
  const abrirEdicao = (aluno) => {
    setModalDetalhesVisivel(false);
    
    // Armazena o ID do aluno que está sendo editado
    setAlunoEditando(aluno.id); 
    
    // O 'aluno' clicado (de 'alunosExibidos') já tem o status correto do mês
    setNovoNome(aluno.nome || "");
    setNovoCPF(aluno.cpf || "");
    setNovoTelefone(aluno.telefone || "");
    setNovoParadaId(aluno.paradaId || null);
    setNovoStatus(aluno.status === "Pago" ? "Pago" : "Não Pago"); // Usa o status do item clicado
    setEditDropdownVisivel(false);
    setModalEditarVisivel(true);
  };

  // --- MUDANÇA 4/4 (Parte B): Usa o ID (alunoEditando) para achar o index ---
  const salvarEdicao = () => {
    if (!novoNome.trim()) {
      Alert.alert("Erro", "Nome é obrigatório!");
      return;
    }
    if (novoCPF.trim() && !validarCPF(novoCPF)) {
      Alert.alert("Erro", "CPF inválido! Digite 11 dígitos.");
      return;
    }
    
    Alert.alert(
      "Confirmar Alterações",
      `Deseja salvar as alterações para ${novoNome.trim()}?`,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Salvar",
          style: "default",
          onPress: () => {
            // A função 'editarAluno' do contexto espera o 'index' da lista 'alunosComStatus'
            // Encontramos esse index usando o ID que salvamos em 'alunoEditando'
            const indexEmAlunosComStatus = alunosComStatus.findIndex(
              a => a.id === alunoEditando // alunoEditando é o ID
            );

            if (indexEmAlunosComStatus === -1) {
                Alert.alert("Erro", "Não foi possível encontrar o aluno para editar. Tente novamente.");
                return;
            }

            editarAluno(
              indexEmAlunosComStatus, // Passa o index correto
              novoNome,
              novoCPF,
              novoStatus,
              novoTelefone,
              novoParadaId
            );
            setModalEditarVisivel(false);
          },
        },
      ]
    );
  };
  // --- FIM DA MUDANÇA 4/4 ---

  const handleAdicionarAluno = () => {
    if (!nome.trim()) {
      Alert.alert("Erro", "Nome é obrigatório!");
      return;
    }
    if (CPF.trim() && !validarCPF(CPF)) {
      Alert.alert("Erro", "CPF inválido! Digite 11 dígitos.");
      return;
    }
    
    Alert.alert(
      "Confirmar Adição",
      `Deseja adicionar ${nome.trim()} à lista de alunos?`,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Adicionar",
          style: "default",
          onPress: () => {
            // --- MODIFICAÇÃO AQUI ---
            // Passa "Não Pago" como status padrão
            adicionarAluno(nome, CPF, "Não Pago", "", telefone, paradaId);
            // --- FIM DA MODIFICAÇÃO ---
            setNome("");
            setCPF("");
            setTelefone("");
            setParadaId(null);
            setModalAdicionarVisivel(false);
          },
        },
      ]
    );
  };

  const abrirModalAdicionar = () => {
    setNome("");
    setCPF("");
    setTelefone("");
    // setStatus("Não Pago"); // <-- REMOVIDO (Não é mais necessário)
    setParadaId(null);
    // setDropdownVisivel(false); // <-- REMOVIDO
    setModalAdicionarVisivel(true);
  };

  const handleRemoverAluno = () => {
    if (alunoSelecionado) {
      setModalEditarVisivel(false);
      setModalDetalhesVisivel(false);
      // A função removerAluno (do contexto) já espera o ID
      removerAluno(alunoSelecionado.id);
    }
  };

  return (
    <View style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#0A0E21" />
      <View style={styles.container}>
        <View style={styles.content}>
          <Header navigation={navigation} style={styles.header} />
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
            data={alunosExibidos} // Usa a nova lista filtrada
            keyExtractor={(item) => String(item.id)}
            style={styles.lista}
            ListEmptyComponent={
              <Texto style={styles.semAlunosTexto}>
                Nenhum aluno cadastrado.
              </Texto>
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
                {/* Esta seção agora exibirá o status do 'item'
                  que vem de 'alunosExibidos'. Como 'alunosExibidos'
                  agora é baseado em 'alunosComStatus', o 'item.status'
                  será "Pago" ou "Não Pago" referente ao mês visível.
                */}
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
            
            {/* --- BLOCO DE STATUS REMOVIDO DAQUI --- */}

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
              onPress={handleRemoverAluno}
            >
              <Texto style={styles.botaoModalTexto}>Excluir Aluno</Texto>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#050a24",
    paddingTop: 30,
    paddingVertical: 30, // Adicionado padding vertical
  },
  container: {
    flex: 1,
    backgroundColor: "#050a24",
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  // AQUI ESTÁ A MUDANÇA (2/2)
  header: {
    alignItems: "center",
    marginTop: -10, // Move o header para CIMA
    marginBottom: 5, // Ajusta o espaço antes do título
  },
  titulo: {
    fontSize: width > 768 ? 28 : 24,
    color: "white",
    marginBottom: 20,
    textAlign: "center",
    fontWeight: "bold",
    fontSize: 22,
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
    gap: 10,
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
    marginTop: 20,
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