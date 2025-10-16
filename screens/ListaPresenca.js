import React, { useState, useContext } from "react";
import {
  View,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  StatusBar,
  FlatList,
  Alert,
} from "react-native";
import Texto from "../components/Texto";
import Header from "../components/Header";
import { ViagemContext } from "../components/ViagemContext";
import { AlunosContext } from "../components/AlunosContext";
import { ParadasContext } from "../components/ParadasContext";
import { updateViagemVolta, addViagem } from "../database/database";

const { width } = Dimensions.get("window");

export default function ListaPresencaScreen({ navigation }) {
  const { viagemTemplate, limparTemplate } = useContext(ViagemContext);
  const { alunos } = useContext(AlunosContext);
  const { paradas } = useContext(ParadasContext);

  const alunosDaViagemOriginal = React.useMemo(
    () =>
      alunos.filter((aluno) =>
        viagemTemplate?.alunosSelecionadosIds.includes(aluno.id)
      ),
    [alunos, viagemTemplate]
  );

  const [alunosPresentes, setAlunosPresentes] = useState(() => new Set());

  const togglePresenca = (alunoId) => {
    setAlunosPresentes((prev) => {
      const novosPresentes = new Set(prev);
      if (novosPresentes.has(alunoId)) {
        novosPresentes.delete(alunoId);
      } else {
        novosPresentes.add(alunoId);
      }
      return novosPresentes;
    });
  };

  const iniciarViagemDeVolta = async () => {
    if (!viagemTemplate) {
      Alert.alert("Erro", "Não há dados da viagem de ida para iniciar a volta.");
      navigation.navigate("Inicial");
      return;
    }

    const alunosQueVoltam = alunos.filter((aluno) =>
      alunosPresentes.has(aluno.id)
    );

    if (alunosQueVoltam.length === 0) {
      Alert.alert("Nenhum Aluno", "Selecione pelo menos um aluno para iniciar a viagem de volta.");
      return;
    }
    
    try {
      const nomesAlunosVolta = alunosQueVoltam.map(a => a.nome);
      await updateViagemVolta(viagemTemplate.historicoId, nomesAlunosVolta);
    } catch (error) {
      console.error("Erro ao atualizar histórico com alunos da volta:", error);
    }


    const paradasDaViagemComAlunos = paradas
      .map((parada) => ({
        ...parada,
        alunos: alunosQueVoltam.filter(
          (aluno) => aluno.paradaId === parada.id
        ),
      }))
      .filter((parada) => parada.alunos.length > 0)
      .sort((a, b) => b.horario.localeCompare(a.horario)); 

    const destinoVolta = `Volta de ${viagemTemplate.destino}`;

    // Limpa o template ANTES de navegar para a próxima ViagemAtiva
    limparTemplate(); 

    navigation.navigate("ViagemAtiva", {
      destino: destinoVolta, 
      horarioFinal: "N/A", 
      paradasDaViagem: paradasDaViagemComAlunos,
      veiculoId: viagemTemplate.veiculoId,
      tipoViagem: "volta", 
      alunosSelecionadosIds: alunosQueVoltam.map(a => a.id),
    });
  };

  const renderAlunoItem = ({ item }) => {
    const isPresente = alunosPresentes.has(item.id);
    return (
      <TouchableOpacity
        style={[styles.alunoItem, isPresente && styles.alunoItemSelected]}
        onPress={() => togglePresenca(item.id)}
      >
        <Texto style={styles.alunoItemText}>{item.nome}</Texto>
      </TouchableOpacity>
    );
  };

  return (
    <>
      <StatusBar barStyle="light-content" backgroundColor="#0A0E21" />
      <View style={styles.container}>
        <Header navigation={navigation} />
        <Texto style={styles.titulo}>Lista de Presença (Volta)</Texto>

        <FlatList
          data={alunosDaViagemOriginal}
          renderItem={renderAlunoItem}
          keyExtractor={(item) => item.id.toString()}
          style={styles.alunosList}
          ListEmptyComponent={
            <Texto style={styles.semAlunosTexto}>
              Nenhum aluno da viagem de ida encontrado.
            </Texto>
          }
        />

        <TouchableOpacity
          style={styles.botaoIniciar}
          onPress={iniciarViagemDeVolta}
        >
          <Texto style={styles.botaoTexto}>Iniciar Volta</Texto>
        </TouchableOpacity>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#050a24",
    paddingHorizontal: 20,
    paddingTop: 30,
  },
  titulo: {
    fontSize: 24,
    color: "white",
    fontWeight: "bold",
    marginVertical: 20,
    textAlign: "center",
  },
  alunosList: {
    flex: 1,
    marginBottom: 20,
  },
  alunoItem: {
    padding: 15,
    backgroundColor: "#373e4f",
    borderRadius: 8,
    marginBottom: 10,
  },
  alunoItemSelected: {
    backgroundColor: "#0B49C1",
  },
  alunoItemText: {
    color: "#fff",
    fontSize: 16,
  },
  semAlunosTexto: {
    color: "#AAB1C4",
    textAlign: "center",
    marginTop: 50,
    fontSize: 16,
  },
  botaoIniciar: {
    backgroundColor: "#0B49C1",
    paddingVertical: 18,
    borderRadius: 12,
    alignItems: "center",
    marginBottom: 20,
  },
  botaoTexto: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
});