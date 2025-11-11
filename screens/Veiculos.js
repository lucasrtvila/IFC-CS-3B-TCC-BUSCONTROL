import { useState, useContext } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Image,
  TouchableOpacity,
  Modal,
  FlatList,
  Dimensions,

} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context"; // Importação Correta
import { VeiculosContext } from "../components/VeiculosContext";
import Texto from "../components/Texto";
import { StatusBar } from "expo-status-bar";

const { width } = Dimensions.get("window"); 
const isTablet = width > 768;

export default function VeiculosScreen({ navigation }) {
  const { veiculos, adicionarVeiculo, editarVeiculo, removerVeiculo } =
    useContext(VeiculosContext);

  const [nome, setNome] = useState(""); // estado para o nome do veículo
  const [status, setStatus] = useState("Ativo"); // estado para o status do veículo, ativo por padrão
  const [dropdownVisivel, setDropdownVisivel] = useState(false); // estado para controlar a visibilidade do dropdown de status

  // Modal para adicionar veículo
  const [modalAdicionarVisivel, setModalAdicionarVisivel] = useState(false);

  // Modal para editar veículo
  const [modalEditarVisivel, setModalEditarVisivel] = useState(false); // estado para controlar a visibilidade do modal de edição
  const [veiculoEditando, setVeiculoEditando] = useState(null); // estado para o veículo que está sendo editado
  const [novoNome, setNovoNome] = useState(""); // estado para o novo nome do veículo
  const [novoStatus, setNovoStatus] = useState("Ativo"); // estado para o novo status do veículo, ativo por padrão
  const [editDropdownVisivel, setEditDropdownVisivel] = useState(false); // estado para o dropdown de edição

  const abrirEdicao = (index) => {
    //funcao pra abrir o modal de edicao do veiculo
    const veiculo = veiculos[index];
    setVeiculoEditando(index);
    setNovoNome(veiculo.nome);
    setNovoStatus(veiculo.status);
    setModalEditarVisivel(true);
  };

  const salvarEdicao = () => {
    //funcao pra salvar a edicao do veiculo
    if (!novoNome.trim()) return;
    editarVeiculo(veiculoEditando, novoNome, novoStatus);
    setModalEditarVisivel(false);
  };

  const handleAdicionarVeiculo = () => {
    //funcao pra adicionar veiculo
    if (!nome.trim()) return;
    adicionarVeiculo(nome, status);
    setNome("");
    setStatus("Ativo");
    setModalAdicionarVisivel(false);
  };

  const abrirModalAdicionar = () => {
    //funcao pra abrir o modal de adicionar veiculo
    setNome("");
    setStatus("Ativo");
    setDropdownVisivel(false);
    setModalAdicionarVisivel(true);
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom', 'left', 'right']}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.botaoHome}
          onPress={() => {
            navigation.navigate("Inicial");
          }}
        >
          <Image
            source={require("../assets/voltar.png")}
            style={styles.imagemVoltar}
          />
        </TouchableOpacity>
        <Texto style={styles.titulo}>Veículos</Texto>
      </View>

      <View style={styles.conteudo}>
        <FlatList
          data={veiculos}
          keyExtractor={(_, index) => index.toString()}
          style={styles.lista}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Texto style={styles.emptyText}>Nenhum veículo registrado</Texto>
            </View>
          }
          renderItem={({ item, index }) => (
            <View style={styles.veiculoItem}>
              <TouchableOpacity
                style={styles.veiculoInfo}
                onPress={() => abrirEdicao(index)}
              >
                <Texto style={styles.veiculoTitulo} numberOfLines={2}>
                  {item.nome}
                </Texto>
                <Texto style={styles.veiculoStatus}>{item.status}</Texto>
              </TouchableOpacity>

              <View style={styles.excluirContainer}>
                <TouchableOpacity
                  style={styles.botaoRemover}
                  onPress={() => removerVeiculo(index)}
                >
                  <Texto style={styles.botaoAcaoTexto}>Excluir</Texto>
                </TouchableOpacity>
              </View>
            </View>
          )}
        />

        {/* Modal para adicionar veículo */}
        <Modal
          visible={modalAdicionarVisivel}
          animationType="slide"
          transparent
        >
          <View style={styles.modalFundo}>
            <View style={styles.modalBox}>
              <Texto style={styles.modalTitulo}>Adicionar Veículo</Texto>

              <Texto style={styles.h1}>Nome</Texto>
              <TextInput
                style={styles.input}
                placeholder="Nome do veículo"
                placeholderTextColor="#cfcfcf"
                value={nome}
                onChangeText={setNome}
              />

              <Texto style={styles.h1}>Status</Texto>
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
                      setStatus("Ativo");
                      setDropdownVisivel(false);
                    }}
                  >
                    <Texto style={styles.opcaoTexto}>Ativo</Texto>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => {
                      setStatus("Em manutenção");
                      setDropdownVisivel(false);
                    }}
                  >
                    <Texto style={styles.opcaoTextoUltima}>Em manutenção</Texto>
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
                  onPress={handleAdicionarVeiculo}
                >
                  <Texto style={styles.botaoModalTexto}>Adicionar</Texto>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        {/* Modal para editar veículo */}
        <Modal visible={modalEditarVisivel} animationType="slide" transparent>
          <View style={styles.modalFundo}>
            <View style={styles.modalBox}>
              <Texto style={styles.modalTitulo}>Editar Veículo</Texto>

              <Texto style={styles.h1}>Nome</Texto>
              <TextInput
                style={styles.input}
                placeholder="Novo nome"
                placeholderTextColor="#cfcfcf"
                value={novoNome}
                onChangeText={setNovoNome}
              />

              <Texto style={styles.h1}>Status</Texto>
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
                      setNovoStatus("Ativo");
                      setEditDropdownVisivel(false);
                    }}
                  >
                    <Texto style={styles.opcaoTexto}>Ativo</Texto>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => {
                      setNovoStatus("Em manutenção");
                      setEditDropdownVisivel(false);
                    }}
                  >
                    <Texto style={styles.opcaoTextoUltima}>Em manutenção</Texto>
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

        <TouchableOpacity style={styles.botao} onPress={abrirModalAdicionar}>
          <Texto style={styles.botaoTexto}>Adicionar Veículo</Texto>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#050a24",
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  conteudo: {
    flex: 1,
    paddingBottom: 10,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    top: 15,
    marginBottom: 30,
  },

  botaoHome: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
    position: "absolute",
    left: 3,
    zIndex: 1,
    padding: 10,
  },

 titulo: {
    color: "#FFF",
    fontSize: 28,
    fontWeight: "bold",
    textAlign: "center",
    flex: 1,
  },

  imagemVoltar: {
    width: 38,
    height: 38,
    resizeMode: "contain",
  },

  lista: {
    flex: 1,
  },

  h1: {
    color: "#FFF",
    fontSize: 18,
    alignItens: "left",
    marginBottom: 10,
    marginLeft: 10,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 20,
  },

  emptyText: {
    color: "#cfcfcf",
    fontSize: 16,
    textAlign: "center",
  },

  veiculoItem: {
    backgroundColor: "#1c2337",
    paddingVertical: isTablet ? 18 : 14,
    paddingHorizontal: isTablet ? 30 : 24, 
    borderRadius: 16,
    marginTop: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  veiculoInfo: {
    flex: 1,
  },

  veiculoTitulo: {
    color: "#fff",
    fontSize: isTablet ? 22 : 20,
    fontWeight: "bold",
    marginBottom: 5,
  },

  veiculoStatus: {
    color: "#cfcfcf",
    fontSize: isTablet ? 16 : 14,
  },

  excluirContainer: {
    flexDirection: "row",
    gap: 10,
    marginLeft: 20,
  },

  botaoRemover: {
    paddingHorizontal: 15,
    height: 35,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#c41628ff",
  },
  botaoAcaoTexto: {
    fontSize: isTablet ? 16 : 14,
    fontWeight: "bold",
    color: "#fff",
  },

  input: {
    backgroundColor: "#373e4f",
    width: "100%",
    borderRadius: 16,
    paddingHorizontal: isTablet ? 20 : 15, 
    paddingVertical: isTablet ? 16 : 12,
    marginBottom: 15,
    fontSize: isTablet ? 18 : 16,
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
    fontSize: isTablet ? 18 : 16,
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
    fontSize: isTablet ? 18 : 16,
    paddingVertical: 10,
    paddingHorizontal: 5,
    borderBottomWidth: 1,
    borderBottomColor: "#6666",
  },

  opcaoTextoUltima: {
    color: "#ffffff",
    fontSize: isTablet ? 18 : 16,
    paddingVertical: 10,
    paddingHorizontal: 5,
  },

  botao: {
    backgroundColor: "#0B49C1",
    paddingVertical: isTablet ? 18 : 14,
    paddingHorizontal: 24,
    borderRadius: 16,
    alignItems: "center",
    marginTop: 20,
    width: "100%",
  },

  botaoTexto: {
    color: "#fff",
    fontSize: isTablet ? 24 : 22,
    fontWeight: "bold",
  },

  modalFundo: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#000000aa",
  },

  modalBox: {
    backgroundColor: "#1c2337",
    padding: isTablet ? 30 : 20,
    borderRadius: 16,
    width: isTablet ? "60%" : "90%",
    maxWidth: 600,
  },

  modalTitulo: {
    color: "#fff",
    fontSize: isTablet ? 24 : 20,
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
    fontSize: isTablet ? 18 : 16,
    fontWeight: "bold",
  },
});