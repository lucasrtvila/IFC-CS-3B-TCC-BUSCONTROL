import { View, TouchableOpacity, Image, StyleSheet, Dimensions } from "react-native";
import Texto from "./Texto";

const { width } = Dimensions.get("window");

export default function BarraNavegacao({ navigation, abaAtiva }) {
  return (
    <View style={styles.abas}>
      <TouchableOpacity
        style={[styles.abaItem, abaAtiva === "Inicial" && styles.abaAtiva]}
        onPress={() => navigation.navigate("Inicial")}
        accessibilityRole="button"
        accessibilityLabel="Ir para Início"
      >
        <Image
          source={require("../assets/voltar.png")}
          style={styles.abaIcon}
        />
        <Texto
          style={[styles.abaText, abaAtiva === "Inicial" && styles.abaAtivaTexto]}
        >
          Início
        </Texto>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.abaItem, abaAtiva === "Alunos" && styles.abaAtiva]}
        onPress={() => navigation.navigate("Alunos")}
        accessibilityRole="button"
        accessibilityLabel="Tela de Alunos"
      >
        <Image
          source={require("../assets/alunos.png")}
          style={styles.abaIcon}
        />
        <Texto
          style={[styles.abaText, abaAtiva === "Alunos" && styles.abaAtivaTexto]}
        >
          Alunos
        </Texto>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.abaItem, abaAtiva === "Rota" && styles.abaAtiva]}
        onPress={() => navigation.navigate("Rota")}
        accessibilityRole="button"
        accessibilityLabel="Tela de Rota"
      >
        <Image
          source={require("../assets/rota.png")}
          style={styles.abaIcon}
        />
        <Texto
          style={[styles.abaText, abaAtiva === "Rota" && styles.abaAtivaTexto]}
        >
          Rota
        </Texto>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  abas: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingVertical: 15,
    paddingHorizontal: 15,
    gap: 15,
    backgroundColor: "#050a24",
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
    width: 35,
    height: 35,
    resizeMode: "contain",
  },
  abaText: {
    color: "#AAB1C4",
    fontSize: 12,
  },
  abaAtiva: {
    backgroundColor: "#0B49C1",
  },
  abaAtivaTexto: {
    color: "white",
    fontWeight: "bold",
  },
});