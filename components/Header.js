import { View, TouchableOpacity, Image, StyleSheet, Dimensions } from "react-native";
import Texto from "./Texto";

const { width } = Dimensions.get("window");

export default function Header({ navigation, style }) {
  return (
    <View style={[styles.header, style]}>
                <View style={styles.headerPlaceholder} />
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
  headerPlaceholder: {
    width: 48,
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