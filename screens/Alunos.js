import React, { useContext } from "react";
import {
  View,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Dimensions,
  StatusBar,
  FlatList,
  Image,
} from "react-native";
import Texto from "../components/Texto";
import { AlunosContext } from "../components/AlunosContext";

const { width } = Dimensions.get("window");
const isTablet = width > 768;

export default function AlunosScreen({ navigation }) {
  const { alunos } = useContext(AlunosContext);

  const navigateToDetalhes = (aluno) => {
    navigation.navigate("DetalhesAluno", { aluno });
  };

  const renderStatusAluno = (status) => (
    <Texto style={status === "Pago" ? styles.pago : styles.naoPago}>
      Status: {status || "Pago"}
    </Texto>
  );

  const renderAlunoCard = ({ item }) => (
    <View style={styles.card}>
      <TouchableOpacity
        style={styles.ladoEsquerdo}
        onPress={() => navigateToDetalhes(item)}
        activeOpacity={0.7}
      >
        <Texto style={styles.nome}>{item.nome}</Texto>
        <Texto style={styles.ponto}>{item.ponto}</Texto>
        {renderStatusAluno(item.status)}
      </TouchableOpacity>
      <View style={styles.ladoDireito}>
        <TouchableOpacity
          style={styles.botaoPequeno}
          onPress={() => navigateToDetalhes(item)}
          activeOpacity={0.7}
          accessibilityLabel={`Editar aluno ${item.nome}`}
        >
          <Texto style={styles.botaoPequenoTexto}>Editar</Texto>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderEmptyList = () => (
    <Texto style={styles.semAlunosTexto}>Nenhum aluno cadastrado.</Texto>
  );

  return (
    <>
      <StatusBar barStyle="light-content" backgroundColor="#0A0E21" />
      <SafeAreaView style={styles.container}>
        <View style={styles.content}>
          {/* Header */}
          <View style={styles.header}>
            <Image source={require("../assets/logoinicial.png")} style={styles.logo} />
            <Texto style={styles.titulo}>Alunos</Texto>
          </View>

          {/* Lista de alunos */}
          <FlatList
            data={alunos}
            keyExtractor={(item, idx) => item.id ? String(item.id) : String(idx)}
            renderItem={renderAlunoCard}
            ListEmptyComponent={renderEmptyList}
            contentContainerStyle={{ flexGrow: 1 }}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          />

          {/* Botão adicionar */}
          <TouchableOpacity
            style={styles.botao}
            onPress={() => navigation.navigate("AdicionarAluno")}
            activeOpacity={0.8}
            accessibilityLabel="Adicionar novo aluno"
          >
            <Texto style={styles.botaoTexto}>Adicionar Aluno</Texto>
          </TouchableOpacity>
        </View>

        {/* Navegação inferior */}
        <View style={styles.abas}>
          <TouchableOpacity
            style={styles.abaItem}
            onPress={() => navigation.navigate("Inicial")}
            accessibilityRole="button"
            accessibilityLabel="Ir para Início"
          >
            <Image source={require("../assets/voltar.png")} style={styles.abaIcon} />
            <Texto style={styles.abaText}>Início</Texto>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.abaItem, styles.abaAtiva]}
            accessibilityRole="button"
            accessibilityLabel="Tela de Alunos"
          >
            <Image source={require("../assets/alunos.png")} style={styles.abaIcon} />
            <Texto style={[styles.abaText, styles.abaAtivaTexto]}>Alunos</Texto>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.abaItem}
            onPress={() => navigation.navigate("Rota")}
            accessibilityRole="button"
            accessibilityLabel="Tela de Rota"
          >
            <Image source={require("../assets/rota.png")} style={styles.abaIcon} />
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
    paddingHorizontal: isTablet ? width * 0.1 : 16,
    flex: 1,
    paddingBottom: 0,
  },
  header: {
    alignItems: "center",
    paddingTop: 10,
    marginBottom: 25,
  },
  logo: {
    resizeMode: "contain",
    width: isTablet ? 130 : Math.min(110, width * 0.28),
    height: isTablet ? 65 : Math.min(55, width * 0.14),
    marginBottom: 5,
  },
  titulo: {
    fontSize: isTablet ? 26 : 24,
    color: "white",
    marginBottom: 0,
    textAlign: "center",
    fontWeight: "bold",
  },
  semAlunosTexto: {
    color: "#AAB1C4",
    fontSize: isTablet ? 18 : 16,
    textAlign: "center",
    marginTop: 40,
  },
  card: {
    backgroundColor: "#1c2337",
    borderRadius: 16,
    marginBottom: 8,
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: isTablet ? 22 : 18,
    alignItems: "center",
    minHeight: isTablet ? 80 : 70,
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
    fontSize: isTablet ? 18 : 16,
    fontWeight: "bold",
    marginBottom: 2,
  },
  ponto: {
    color: "#AAB1C4",
    fontSize: isTablet ? 15 : 14,
    marginBottom: 2,
  },
  pago: {
    color: "limegreen",
    fontSize: isTablet ? 14 : 13,
  },
  naoPago: {
    color: "orange",
    fontSize: isTablet ? 14 : 13,
  },
  botao: {
    backgroundColor: "#0B49C1",
    paddingVertical: isTablet ? 18 : 16,
    paddingHorizontal: 16,
    borderRadius: 16,
    alignItems: "center",
    marginTop: 16,
    marginBottom: 16,
    minHeight: isTablet ? 54 : 50,
  },
  botaoTexto: {
    color: "white",
    fontSize: isTablet ? 22 : 20,
    fontWeight: "bold",
  },
  botaoPequeno: {
    backgroundColor: "#0B49C1",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 10,
    minWidth: 70,
    alignItems: "center",
  },
  botaoPequenoTexto: {
    color: "white",
    fontWeight: "bold",
    fontSize: isTablet ? 15 : 14,
  },
  abas: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingVertical: 14,
    paddingHorizontal: 16,
    gap: 10,
  },
  abaItem: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#1c2337",
    borderRadius: 16,
    minHeight: isTablet ? 65 : 56,
    paddingVertical: 8,
  },
  abaIcon: {
    width: isTablet ? 30 : 26,
    height: isTablet ? 30 : 26,
    resizeMode: "contain",
    marginBottom: 3,
  },
  abaText: {
    color: "#AAB1C4",
    fontSize: isTablet ? 13 : 12,
    textAlign: "center",
  },
  abaAtiva: {
    backgroundColor: "#0B49C1",
  },
  abaAtivaTexto: {
    color: "white",
    fontWeight: "bold",
  },
});