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
  SafeAreaView,
} from "react-native";
import { VeiculosContext } from "../components/VeiculosContext";
import Texto from "../components/Texto";

export default function VeiculosScreen({ navigation }) {
  const { veiculos, adicionarVeiculo, editarVeiculo } =
    useContext(VeiculosContext);

  const [nome, setNome] = useState("");
  const [status, setStatus] = useState("Ativo");
  const [dropdownVisivel, setDropdownVisivel] = useState(false);

  // Modal para adicionar veículo
  const [modalAdicionarVisivel, setModalAdicionarVisivel] = useState(false);

  // Modal para editar veículo
  const [modalEditarVisivel, setModalEditarVisivel] = useState(false);
  const [veiculoEditando, setVeiculoEditando] = useState(null);
  const [novoNome, setNovoNome] = useState("");
  const [novoStatus, setNovoStatus] = useState("Ativo");
  const [editDropdownVisivel, setEditDropdownVisivel] = useState(false);

  const abrirEdicao = (index) => {
    const veiculo = veiculos[index];
    setVeiculoEditando(index);
    setNovoNome(veiculo.nome);
    setNovoStatus(veiculo.status);
    setModalEditarVisivel(true);
  };

  const salvarEdicao = () => {
    if (!novoNome.trim()) return;
    editarVeiculo(veiculoEditando, novoNome, novoStatus);
    setModalEditarVisivel(false);
  };

  const handleAdicionarVeiculo = () => {
    if (!nome.trim()) return;
    adicionarVeiculo(nome, status);
    setNome("");
    setStatus("Ativo");
    setModalAdicionarVisivel(false);
  };

  const abrirModalAdicionar = () => {
    setNome("");
    setStatus("Ativo");
    setDropdownVisivel(false);
    setModalAdicionarVisivel(true);
  };

  return (
    <SafeAreaView style={styles.container}>
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
        <TouchableOpacity style={styles.botao} onPress={abrirModalAdicionar}>
          <Texto style={styles.botaoTexto}>Adicionar Veículo</Texto>
        </TouchableOpacity>

        <FlatList
          data={veiculos}
          keyExtractor={(_, index) => index.toString()}
          renderItem={({ item, index }) => (
            <TouchableOpacity
              style={styles.itemVeiculo}
              onPress={() => abrirEdicao(index)}
            >
              <Texto style={styles.botaoTexto}>{item.nome}</Texto>
              <Texto style={{ color: "#fff", fontSize: 14 }}>
                {item.status}
              </Texto>
            </TouchableOpacity>
          )}
        />

        {/* Modal para adicionar veículo */}
        <Modal visible={modalAdicionarVisivel} animationType="slide" transparent>
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
                
                <TouchableOpacity style={styles.botaoModal} onPress={handleAdicionarVeiculo}>
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
                
                <TouchableOpacity style={styles.botaoModal} onPress={salvarEdicao}>
                  <Texto style={styles.botaoModalTexto}>Salvar</Texto>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#050a24",
    paddingHorizontal: 20,
    paddingTop: 40,
    paddingBottom: 20,
  },

  conteudo: {
    paddingTop: 20,
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
    position: "relative",
  },

  botaoHome: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
    position: "absolute",
    left: 3,
    zIndex: 1,
  },

  titulo: {
    color: "#FFF",
    fontSize: 28,
    fontWeight: "bold",
    textAlign: "center",
  },

  imagemVoltar: {
    width: 27,
    height: 27,
    resizeMode: "contain",
  },

  h1: {
    color: "#FFF",
    fontSize: 18,
    alignItens: "left",
    marginBottom: 10,
    marginLeft: 10,
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
  
  botao: {
    backgroundColor: "#0B49C1",
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 16,
    alignItems: "center",
    marginTop: 10,
    width: "100%",
  },
  
  botaoTexto: {
    color: "#fff",
    fontSize: 22,
    fontWeight: "bold",
  },

  itemVeiculo: {
    alignSelf: "center",
    backgroundColor: "#1c2337",
    paddingVertical: 14,
    paddingHorizontal: 24,
    width: "100%",
    borderRadius: 16,
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
});