import React, { useContext, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  StatusBar,
} from "react-native";
import Texto from "../components/Texto";
import { setUsuario } from "../database/database";
 
export default function CadastroScreen({ navigation }) {
  const [nome, setNome] = useState("");;

  const registrarDados = async () => {
  await  setUsuario( nome );
    navigation.navigate("Inicial");
  };

  return (
    <>
      <StatusBar barStyle="light-content" backgroundColor="#0A0E21" />
      <View style={styles.container}>
        <Image
          source={require("../assets/logoinicial.png")}
          style={styles.logo}
        />
        <View style={styles.content}>
          <Texto style={styles.subtitulo}>Seja bem-vindo!</Texto>
          <Texto style={styles.subtitulo}>Insira seu nome para inciar</Texto>
          <TextInput
            style={styles.input}
            placeholder="Nome do motorista"
            placeholderTextColor="#AAB1C4"
            value={nome}
            onChangeText={setNome}
          />

          <TouchableOpacity
            style={styles.botao}
            onPress={() => registrarDados()}
          >
            <Texto style={styles.textoBotao}>Começar</Texto>
          </TouchableOpacity>

        </View>
      </View>
    </>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#050a24",
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
    paddingBottom: 170,
  },
  content: {
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
    marginTop: -110,
  },
  logo: {
    top: -60,
    marginBottom: 10,
    resizeMode: "contain",
    width: 300,
  },
  blue: {
    color: "#246BFD",
  },
  white: {
    color: "#FFFFFF",
  },
  subtitulo: {
    top:-20,
    fontSize: 26,
    color: "#FFFFFF",
    marginBottom: 10,
    paddingVertical:10
  },
  input: {
    backgroundColor: "#1c2337",
    width: "100%",
    paddingVertical: 20,
    paddingHorizontal: 20,
    borderRadius: 20,
    color: "#FFFFFF",
    marginBottom: 30,
    fontSize: 20,
    textAlign: "center",
  },
  botao: {
    bottom: -30,
    backgroundColor: "#246BFD",
    paddingVertical: 20,
    borderRadius: 20,
    width: "100%",
    alignItems: "center",
  },
  textoBotao: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
  },
});
