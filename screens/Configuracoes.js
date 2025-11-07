import React, { useState, useEffect } from "react";
import {
  View,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Image,
  Dimensions,
  TextInput,
  Modal,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Texto from "../components/Texto";
import { resetDatabase, getUsuario, setUsuario } from "../database/database";

const { width } = Dimensions.get("window");

export default function ConfiguracoesScreen({ navigation }) {
  const [nome, setNome] = useState("");
  const [modalNomeVisivel, setModalNomeVisivel] = useState(false);
  const [nomeModal, setNomeModal] = useState("");

  useEffect(() => {
    const carregarNomeUsuario = async () => {
      try {
        const usuario = await getUsuario();
        if (usuario && usuario.nome) {
          setNome(usuario.nome);
          setNomeModal(usuario.nome);
        }
      } catch (error) {
        console.error("Erro ao carregar nome do usuário:", error);
      }
    };
    carregarNomeUsuario();
  }, []);

  const apagarDados = () => {
    Alert.alert(
      "Apagar Todos os Dados",
      "Tem certeza que deseja apagar todos os dados do aplicativo? Essa ação não pode ser desfeita.",
      [
        {
          text: "Cancelar",
          style: "cancel",
        },
        {
          text: "Apagar",
          style: "destructive",
          onPress: async () => {
            try {
              await resetDatabase();
              Alert.alert(
                "Sucesso",
                "Todos os dados foram apagados. Reinicie o aplicativo.",
                [{ text: "OK" }]
              );
            } catch (error) {
              console.error("Erro ao apagar os dados:", error);
              Alert.alert("Erro", "Não foi possível apagar os dados.");
            }
          },
        },
      ]
    );
  };

  const abrirModalNome = () => {
      setNomeModal(nome);
      setModalNomeVisivel(true);
  }

  const handleSalvarNome = async () => {
    if (!nomeModal.trim()) {
      Alert.alert("Erro", "O nome não pode ficar em branco.");
      return;
    }
    try {
      await setUsuario(nomeModal.trim());
      setNome(nomeModal.trim());
      setModalNomeVisivel(false);
      Alert.alert(
        "Sucesso",
        "Nome salvo! A mudança aparecerá na tela inicial.",
        [{ text: "OK" }]
      );
    } catch (e) {
      Alert.alert("Erro", "Não foi possível salvar o nome.");
      console.error("Erro ao salvar nome:", e);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom', 'left', 'right']}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.botaoVoltar}
          onPress={() => navigation.navigate("Inicial")}
        >
          <Image
            source={require("../assets/voltar.png")}
            style={styles.iconeVoltar}
          />
        </TouchableOpacity>
        <Texto style={styles.titulo}>Ajustes</Texto>
        <View style={styles.headerPlaceholder} />
      </View>

      <View style={styles.content}>
        <TouchableOpacity style={styles.botaoAcao} onPress={abrirModalNome}>
          <Texto style={styles.botaoTexto}>Alterar Nome do Motorista</Texto>
        </TouchableOpacity>

        <View style={styles.divider} />

        <TouchableOpacity style={styles.botaoApagar} onPress={apagarDados}>
          <Texto style={styles.botaoTexto}>Apagar Todos os Dados</Texto>
        </TouchableOpacity>
      </View>

      <Modal
        visible={modalNomeVisivel}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setModalNomeVisivel(false)}
      >
        <TouchableOpacity 
            style={styles.modalFundo} 
            activeOpacity={1} 
            onPressOut={() => setModalNomeVisivel(false)}
        >
            <TouchableOpacity style={styles.modalBox} activeOpacity={1} onPress={() => {}}> 
                <Image 
                    source={require('../assets/configuracoes.png')}
                    style={styles.modalIcon}
                />
                <Texto style={styles.modalTitulo}>Alterar Nome</Texto>
                <Texto style={styles.label}>Nome do Motorista</Texto>
                <TextInput
                    style={styles.input}
                    placeholder="Nome do motorista"
                    placeholderTextColor="#AAB1C4"
                    value={nomeModal}
                    onChangeText={setNomeModal}
                    autoCapitalize="words"
                />
                <View style={styles.botoesModalContainer}>
                    <TouchableOpacity style={[styles.botaoModalAcao, styles.botaoCancelar]} onPress={() => setModalNomeVisivel(false)}>
                        <Texto style={styles.botaoTextoModal}>Cancelar</Texto>
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.botaoModalAcao, styles.botaoSalvar]} onPress={handleSalvarNome}>
                        <Texto style={styles.botaoTextoModal}>Salvar</Texto>
                    </TouchableOpacity>
                </View>
            </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#050a24",
    paddingTop: 0, // Removido paddingTop 40
  },
  header: {
    paddingVertical: 10,
    paddingHorizontal: 10,
    top: 15,
    marginBottom: 15,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
  },
  botaoVoltar: {
    padding: 10,
  },
  iconeVoltar: {
    width: 28,
    height: 28,
    resizeMode: "contain",
  },
  headerPlaceholder: {
    width: 48,
  },
  titulo: {
    color: "#FFF",
    fontSize: 28,
    fontWeight: "bold",
  },
  content: {
    flex: 1,
    paddingHorizontal: width > 768 ? width * 0.1 : 16,
    paddingTop: 20,
  },
  botaoAcao: {
    backgroundColor: "#0B49C1",
    paddingVertical: width > 768 ? 20 : 16,
    borderRadius: 16,
    alignItems: "center",
  },
  label: {
    color: "white",
    fontSize: 16,
    marginBottom: 10,
    marginLeft: 5,
    textAlign: 'left',
    width: '100%',
  },
  input: {
    backgroundColor: "#373e4f",
    width: "100%",
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 16,
    color: "#FFFFFF",
    marginBottom: 15,
    fontSize: 16,
  },
  divider: {
    height: 1,
    backgroundColor: "#1c2337",
    marginVertical: 30,
  },
  botaoApagar: {
    backgroundColor: "#c41628ff",
    paddingVertical: width > 768 ? 20 : 16,
    borderRadius: 16,
    alignItems: "center",
  },
  botaoTexto: { 
    color: "white",
    fontSize: width > 768 ? 22 : 18,
    fontWeight: "bold",
  },
  botaoTextoModal: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
   modalFundo: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.7)',
        padding: Platform.OS === 'ios' ? 20 : 0,
    },
    modalBox: {
        backgroundColor: '#1c2337',
        borderRadius: 16,
        padding: 20,
        width: '90%',
        maxWidth: 400,
        alignItems: 'center',
    },
    modalIcon: {
        width: 40,
        height: 40,
        tintColor: '#AAB1C4',
        marginBottom: 15,
    },
    modalTitulo: {
        color: '#fff',
        fontSize: 22,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 20,
    },
    botoesModalContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 10,
        gap: 10,
        width: '100%',
    },
    botaoModalAcao: {
        flex: 1,
        paddingVertical: 12,
        borderRadius: 10,
        alignItems: 'center',
    },
    botaoCancelar: {
        backgroundColor: "#373e4f",
    },
    botaoSalvar: {
        backgroundColor: "#0B49C1",
    },
});