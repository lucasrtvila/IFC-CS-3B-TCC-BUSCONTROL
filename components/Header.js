import { View, TouchableOpacity, Image, StyleSheet, Dimensions } from "react-native";
import Texto from "./Texto";

const { width } = Dimensions.get("window");

export default function Header({ navigation, style }) {
  return (
    <View style={[styles.header, style]}>
      <TouchableOpacity
        style={styles.historyButton}
        onPress={() => navigation.navigate("HistoricoViagens")}
      >
        <Image
          source={require("../assets/historico.png")} // Certifique-se de ter este ícone
          style={styles.historyIcon}
        />
      </TouchableOpacity>
      <Image
        source={require("../assets/logoinicial.png")}
        style={styles.logo}
      />
      <TouchableOpacity
        style={styles.configButton}
        onPress={() => navigation.navigate("Configuracoes")}
      >
        <Image
          source={require("../assets/configuracoes.png")}
          style={styles.configIcon}
        />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
    paddingHorizontal: 10,
  },
  historyButton: {
    padding: 10,
  },
  historyIcon: {
    width: 28,
    height: 28,
    resizeMode: "contain",
  },
  configButton: {
    padding: 10,
  },
  configIcon: {
    width: 28,
    height: 28,
    resizeMode: "contain",
  },
  logo: {
    resizeMode: "contain",
    width: Math.min(120, width * 0.4),
    height: Math.min(60, width * 0.2),
  },
});