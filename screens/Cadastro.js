import React, { useContext, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  StatusBar,
  SafeAreaView,
} from "react-native";
import Texto from "../components/Texto";
import { UsuariosContext } from "../components/UsuariosContext";

export default function CadastroScreen({ navigation }) {
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const { registrarUsuario } = useContext(UsuariosContext);
  const registrarDados = () => {
    registrarUsuario({ nome, email, senha });
    navigation.navigate("Inicial");
  };
  return (
    <>
    <StatusBar barStyle="light-content" backgroundColor="#0A0E21" />
    <SafeAreaView style={styles.container}>
      <Image
        source={require("../assets/logoinicial.png")}
        style={styles.logo}
      />
      <View style={styles.content}>
        <Texto style={styles.subtitulo}>Criar conta</Texto>

        <TextInput
          style={styles.input}
          placeholder="Nome"
          placeholderTextColor="#AAB1C4"
          value={nome}
          onChangeText={setNome}
        />

        <TextInput
          style={styles.input}
          placeholder="E-mail"
          placeholderTextColor="#AAB1C4"
          value={email}
          onChangeText={setEmail}
        />

        <TextInput
          style={styles.input}
          placeholder="Senha"
          placeholderTextColor="#AAB1C4"
          secureTextEntry
          value={senha}
          onChangeText={setSenha}
        />

        <TouchableOpacity style={styles.botao} onPress={() => registrarDados()}>
          <Texto style={styles.textoBotao}>Registrar</Texto>
        </TouchableOpacity>

        <Texto style={styles.loginText}>
          Já tem uma conta? <Texto style={styles.link}>Entrar</Texto>
        </Texto>
      </View>
    </SafeAreaView>
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
    paddingBottom: 100,
  },
  content: {
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
    marginTop: -110,
  },
  logo: {
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
    fontSize: 16,
    color: "#FFFFFF",
    marginBottom: 30,
  },
  input: {
    backgroundColor: "#1c2337",
    width: "100%",
    paddingVertical: 20,
    paddingHorizontal: 20,
    borderRadius: 20,
    color: "#FFFFFF",
    marginBottom: 28,
    fontSize: 16,
  },
  botao: {
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
  loginText: {
    color: "#FFFFFF",
    marginTop: 20,
    fontSize: 14,
  },
  link: {
    color: "#246BFD",
    textDecorationLine: "underline",
  },
});
