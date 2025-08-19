import React, { useContext, useState } from "react";
import {
  View,
  TouchableOpacity,
  Modal,
  TextInput,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  Dimensions,
  Platform,
  StatusBar,
  Text,
  FlatList,
  Image,
} from "react-native";
import Texto from "../components/Texto";
import { AlunosContext } from "../components/AlunosContext";

const { width } = Dimensions.get("window");

export default function AlunosScreen({ navigation }) {
  const { alunos, adicionarAluno, editarAluno, removerAluno } =
    useContext(AlunosContext);

  const [nome, setNome] = useState(""); 
  const [CPF, setCPF] = useState(""); 
  const [status, setStatus] = useState("Não Pago"); 
  const [ultimoPagamento, setUltimoPagamento] = useState(""); 
  const [dropdownVisivel, setDropdownVisivel] = useState(false); 

  // Modal para adicionar aluno
  const [modalAdicionarVisivel, setModalAdicionarVisivel] = useState(false);

  // Modal para editar aluno
  const [modalEditarVisivel, setModalEditarVisivel] = useState(false); 
  const [alunoEditando, setAlunoEditando] = useState(null); 
  const [novoNome, setNovoNome] = useState(""); 
  const [novoCPF, setNovoCPF] = useState(""); 
  const [novoStatus, setNovoStatus] = useState("Não Pago"); 
  const [editDropdownVisivel, setEditDropdownVisivel] = useState(false); 

  // Função para formatar CPF
  const formatarCPF = (cpf) => {
    // Remove tudo que não é número
    const apenasNumeros = cpf.replace(/\D/g, '');
    
    // Aplica a máscara XXX.XXX.XXX-XX
    if (apenasNumeros.length <= 11) {
      return apenasNumeros
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
    }
    return cpf;
  };

  // Função para validar CPF (básica)
  const validarCPF = (cpf) => {
    const apenasNumeros = cpf.replace(/\D/g, '');
    return apenasNumeros.length === 11;
  };

  const abrirEdicao = (index) => {
    const aluno = alunos?.[index];
    if (!aluno) return;
    
    console.log("=== ABRINDO EDIÇÃO ===");
    console.log("Aluno selecionado:", aluno);
    console.log("CPF do aluno:", aluno.cpf || aluno.CPF);
    
    setAlunoEditando(index);
    setNovoNome(aluno.nome || "");
    // Tenta pegar CPF tanto em minúsculo quanto maiúsculo
    setNovoCPF(aluno.cpf || aluno.CPF || "");
    setNovoStatus(aluno.status === "Pago" ? "Pago" : "Não Pago");
    setEditDropdownVisivel(false);
    setModalEditarVisivel(true);
  };

  const salvarEdicao = () => {
    if (!novoNome.trim()) {
      alert("Nome é obrigatório!");
      return;
    }
    
    // Validação do CPF se preenchido
    if (novoCPF.trim() && !validarCPF(novoCPF)) {
      alert("CPF inválido! Digite 11 dígitos.");
      return;
    }
    
    const statusValido = novoStatus === "Pago" ? "Pago" : "Não Pago";
    editarAluno(alunoEditando, novoNome, novoCPF, statusValido);
    setModalEditarVisivel(false);
    setEditDropdownVisivel(false);
  };

  const handleAdicionarAluno = () => {
    if (!nome.trim()) {
      alert("Nome é obrigatório!");
      return;
    }
    
    // Validação do CPF se preenchido
    if (CPF.trim() && !validarCPF(CPF)) {
      alert("CPF inválido! Digite 11 dígitos.");
      return;
    }
    
    console.log("=== ADICIONANDO ALUNO NA TELA ===");
    console.log("Dados a serem enviados:", { 
      nome: nome.trim(), 
      cpf: CPF, 
      status: status, 
      ultimoPagamento: ultimoPagamento 
    });
    
    const statusValido = status === "Pago" ? "Pago" : "Não Pago";
    adicionarAluno(nome, CPF, statusValido, ultimoPagamento);
    setNome("");
    setCPF("");
    setStatus("Não Pago");
    setUltimoPagamento("");
    setDropdownVisivel(false);
    setModalAdicionarVisivel(false);
  };

  const abrirModalAdicionar = () => {
    setNome("");
    setCPF("");
    setStatus("Não Pago");
    setUltimoPagamento("");
    setDropdownVisivel(false);
    setModalAdicionarVisivel(true);
  };

  const fecharModalAdicionar = () => {
    setModalAdicionarVisivel(false);
    setDropdownVisivel(false);
    setNome("");
    setCPF("");
    setStatus("Não Pago");
    setUltimoPagamento("");
  };

  const fecharModalEditar = () => {
    setModalEditarVisivel(false);
    setEditDropdownVisivel(false);
    setAlunoEditando(null);
    setNovoNome("");
    setNovoCPF("");
    setNovoStatus("Não Pago");
  };

  return (
    <>
      <StatusBar barStyle="light-content" backgroundColor="#0A0E21" />
      <SafeAreaView style={styles.container}>
        <View style={styles.content}>
          <View style={styles.header}>
            <Image
              source={require("../assets/logoinicial.png")}
              style={styles.logo}
            />
            <Texto style={styles.titulo}>Alunos</Texto>
          </View>
          <FlatList
            data={alunos}
            keyExtractor={(item, idx) =>
              item.id ? String(item.id) : String(idx)
            }
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
                  {/* Exibir CPF se existir */}
                  {item.cpf && (
                    <Texto style={styles.cpf}>CPF: {item.cpf}</Texto>
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
            contentContainerStyle={{ flexGrow: 1 }}
            style={styles.scrollView}
            keyboardShouldPersistTaps="handled"
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
        
        <View style={styles.abas}>
          <TouchableOpacity
            style={styles.abaItem}
            onPress={() => navigation.navigate("Inicial")}
            accessibilityRole="button"
            accessibilityLabel="Ir para Início"
          >
            <Image
              source={require("../assets/voltar.png")}
              style={styles.abaIcon}
            />
            <Texto style={styles.abaText}>Início</Texto>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.abaItem, styles.abaAtiva]}
            accessibilityRole="button"
            accessibilityLabel="Tela de Alunos"
          >
            <Image
              source={require("../assets/alunos.png")}
              style={styles.abaIcon}
            />
            <Texto style={[styles.abaText, styles.abaAtivaTexto]}>Alunos</Texto>
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

        {/* Modal para adicionar aluno */}
        <Modal
          visible={modalAdicionarVisivel}
          animationType="slide"
          transparent
        >
          <View style={styles.modalFundo}>
            <View style={styles.modalBox}>
              <Texto style={styles.modalTitulo}>Adicionar Aluno</Texto>

              <Texto style={styles.h1}>Nome:</Texto>
              <TextInput
                style={styles.input}
                placeholder="Nome do aluno"
                placeholderTextColor="#cfcfcf"
                value={nome}
                onChangeText={setNome}
              />

              <Texto style={styles.h1}>CPF (opcional):</Texto>
              <TextInput
                style={styles.input}
                placeholder="000.000.000-00"
                placeholderTextColor="#cfcfcf"
                value={CPF}
                onChangeText={(text) => setCPF(formatarCPF(text))}
                keyboardType="numeric"
                maxLength={14} // Máximo para XXX.XXX.XXX-XX
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
                  onPress={fecharModalAdicionar}
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

        {/* Modal de edição de aluno */}
        <Modal visible={modalEditarVisivel} animationType="slide" transparent>
          <View style={styles.modalFundo}>
            <View style={styles.modalBox}>
              <Texto style={styles.modalTitulo}>Informações do Aluno</Texto>

              <Texto style={styles.h1}>Nome:</Texto>
              <TextInput
                style={styles.input}
                placeholder="Novo nome"
                placeholderTextColor="#cfcfcf"
                value={novoNome}
                onChangeText={setNovoNome}
              />

              <Texto style={styles.h1}>CPF (opcional):</Texto>
              <TextInput
                style={styles.input}
                placeholder="000.000.000-00"
                placeholderTextColor="#cfcfcf"
                value={novoCPF}
                onChangeText={(text) => setNovoCPF(formatarCPF(text))}
                keyboardType="numeric"
                maxLength={14}
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
                  onPress={fecharModalEditar}
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
  },
  header: {
    alignItems: "center",
    paddingTop: 10,
  },
  abas: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingVertical: 15,
    //bottom: 0,
    paddingHorizontal: 15,
    gap: 15,
    marginTop: "auto",
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
  },
  card: {
    backgroundColor: "#1c2337",
    borderRadius: 12,
    marginBottom: 15,
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: width > 768 ? 25 : 15,
    alignItems: "center",
    height: width > 768 ? 100 : 80,
  },
  ladoEsquerdo: {
  
    justifyContent: "center",
  },
  ladoDireito: {
    alignItems: "flex-end",
    justifyContent: "center",
  },
  nome: {
    color: "white",
    fontSize: width > 768 ? 18 : 16,
    fontWeight: "bold",
  },
  cpf: {
  fontSize: width > 768 ? 16 : 14,
  color: "white",
},
  ponto: {
    color: "#ccc",
    fontSize: width > 768 ? 16 : 14,
  },
  pago: {
    color: "limegreen",
    fontSize: width > 768 ? 16 : 14,
  },
  naoPago: {
    color: "orange",
    fontSize: width > 768 ? 16 : 14,
  },
  botao: {
    backgroundColor: "#0B49C1",
    paddingVertical: width > 768 ? 20 : 16,
    paddingHorizontal: 16,
    borderRadius: 16,
    alignItems: "center",
    marginTop: 20,
    marginBottom: 20,
    minHeight: width > 768 ? 60 : 50,
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
    marginVertical: 4,
    minWidth: 70,
    alignItems: "center",
  },
  botaoPequenoTexto: {
    color: "white",
    fontWeight: "bold",
    fontSize: width > 768 ? 16 : 14,
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

  botoesModal: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
    gap: 10,
  },

  botaoCancelar: {
    backgroundColor: "#373e4f",
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 16,
    alignItems: "center",
    flex: 1,
  },

  botaoModal: {
    backgroundColor: "#0B49C1",
    paddingVertical: 14,
    paddingHorizontal: 24,
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
    width: "100%",
    borderRadius: 16,
    paddingHorizontal: 15,
    paddingVertical: 12,
    marginBottom: 15,
    fontSize: 16,
    color: "#ffffff",
  },

  dropdown: {
    width: "100%",
    backgroundColor: "#373e4f",
    borderRadius: 16,
    padding: 12,
    marginBottom: 20,
  },

  dropdownTexto: {
    color: "#ffffff",
    fontSize: 16,
  },

  dropdownOpcoes: {
    width: "100%",
    backgroundColor: "#242a39",
    borderRadius: 16,
    padding: 10,
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
    marginTop: 10,
  },
});
