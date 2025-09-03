import React from "react";
import {
  View,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Image,
  Dimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import Texto from "../components/Texto";
import { resetDatabase } from "../database/database";

const { width } = Dimensions.get("window");

export default function ConfiguracoesScreen({ navigation }) {
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

  return (
    <SafeAreaView style={styles.container}>
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
        <TouchableOpacity style={styles.botaoApagar} onPress={apagarDados}>
          <Texto style={styles.botaoTexto}>Apagar Todos os Dados</Texto>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#050a24",
  },
  header: {
    paddingVertical: 10,
    paddingHorizontal: 10,
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
  botaoApagar: {
    backgroundColor: "#c41628ff",
    paddingVertical: width > 768 ? 20 : 16,
    borderRadius: 16,
    alignItems: "center",
    marginTop: 20,
  },
  botaoTexto: {
    color: "white",
    fontSize: width > 768 ? 22 : 18,
    fontWeight: "bold",
  },
});