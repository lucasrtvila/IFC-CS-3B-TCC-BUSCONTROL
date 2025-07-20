import React, { useContext } from "react";
import {
  View,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  Dimensions,
  Platform,
  StatusBar,
  Text,
  Image,
} from "react-native";
import Texto from "../components/Texto";
import { AlunosContext } from "../components/AlunosContext";

const { width } = Dimensions.get("window");

export default function AlunosScreen({ navigation }) {
  const { alunos } = useContext(AlunosContext);

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
          <ScrollView
            style={styles.scrollView}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {alunos.length === 0 && (
              <Texto style={styles.semAlunosTexto}>
                Nenhum aluno cadastrado.
              </Texto>
            )}

            {alunos.map((item) => (
              <View key={item.id} style={styles.card}>
                <TouchableOpacity
                  style={styles.ladoEsquerdo}
                  onPress={() =>
                    navigation.navigate("DetalhesAluno", { aluno: item })
                  }
                  activeOpacity={0.7}
                >
                  <Texto style={styles.nome}>{item.nome}</Texto>
                  <Texto style={styles.ponto}>{item.ponto}</Texto>
                  <Texto
                    style={
                      item.status === "Pago" ? styles.pago : styles.naoPago
                    }
                  >
                    Status: {item.status || "Pago"}
                  </Texto>
                </TouchableOpacity>

                <View style={styles.ladoDireito}>
                  <TouchableOpacity
                    style={styles.botaoPequeno}
                    onPress={() =>
                      navigation.navigate("DetalhesAluno", { aluno: item })
                    }
                    activeOpacity={0.7}
                    accessibilityLabel={`Editar aluno ${item.nome}`}
                  >
                    <Texto style={styles.botaoPequenoTexto}>Editar</Texto>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </ScrollView>

          <TouchableOpacity
            style={styles.botao}
            onPress={() => navigation.navigate("AdicionarAluno")}
            activeOpacity={0.8}
            accessibilityLabel="Adicionar novo aluno"
          >
            <Texto style={styles.botaoTexto}>Adicionar Aluno</Texto>
          </TouchableOpacity>
        </View>

        {/* Abas fixas na parte inferior */}
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
            <Image source={require("../assets/alunos.png")} style={styles.abaIcon}/>
            <Texto style={[styles.abaText, styles.abaAtivaTexto]}>Alunos</Texto>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.abaItem}
            onPress={() => navigation.navigate("Rota")}
            accessibilityRole="button"
            accessibilityLabel="Tela de Rota"
          >
            <Image source={require("../assets/voltar.png")} style={styles.abaIcon}/>
            <Texto style={styles.abaText}>Rota</Texto>
          </TouchableOpacity>
        </View>
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
    paddingTop: 20,
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
    bottom: 0,
    paddingHorizontal:15,

    gap: 15
  },
  abaItem: {    
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: '#1c2337', 
    borderRadius: 16,
    minHeight:60
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
    minHeight:60
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
  scrollView: {
    flex: 1,
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
    flex: 1,
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
    backgroundColor: "#0B49C1",
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
});
