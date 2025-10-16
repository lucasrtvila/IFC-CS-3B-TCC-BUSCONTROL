import React, { useState, useEffect, useContext } from "react";
import {
  View,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  StatusBar,
  FlatList,
  Image,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";

import Texto from "../components/Texto";
import { getViagens } from "../database/database";
import { VeiculosContext } from "../components/VeiculosContext";

const { width } = Dimensions.get("window");

const ViagemCard = ({ item, getNomeVeiculo }) => {
  const [expandido, setExpandido] = useState(false);

  const getTipoViagemLabel = (tipo) => {
    if (tipo === 'so_ida') return 'Só Ida';
    if (tipo === 'ida_e_volta') return 'Ida e Volta';
    if (tipo === 'volta') return 'Viagem de Volta';
    return 'Viagem';
  }

  const alunosIda = item.alunos ? JSON.parse(item.alunos) : [];
  const alunosVolta = item.alunos_volta ? JSON.parse(item.alunos_volta) : null;

  return (
    <TouchableOpacity style={styles.card} onPress={() => setExpandido(!expandido)}>
      <View style={styles.cardHeader}>
        <Texto style={styles.cardTitulo}>{item.destino}</Texto>
        <Texto style={styles.cardTipoViagem}>{getTipoViagemLabel(item.tipoViagem)}</Texto>
      </View>
      {expandido && (
        <View style={styles.cardConteudo}>
          <Texto style={styles.cardDetalhe}>Data: {item.data}</Texto>
          <Texto style={styles.cardDetalhe}>Duração: {item.duracao}</Texto>
          <Texto style={styles.cardDetalhe}>Veículo: {getNomeVeiculo(item.veiculoId)}</Texto>
          
          <Texto style={styles.cardSubtitulo}>Alunos na Ida ({alunosIda.length}):</Texto>
          <View style={styles.alunosContainer}>
            {alunosIda.map((aluno, index) => (
              <Texto key={index} style={styles.alunoNome}>- {aluno}</Texto>
            ))}
          </View>

          {alunosVolta && (
            <>
              <Texto style={styles.cardSubtitulo}>Alunos na Volta ({alunosVolta.length}):</Texto>
              <View style={styles.alunosContainer}>
                {alunosVolta.map((aluno, index) => (
                  <Texto key={index} style={styles.alunoNome}>- {aluno}</Texto>
                ))}
              </View>
            </>
          )}
        </View>
      )}
    </TouchableOpacity>
  );
};

export default function HistoricoViagensScreen({ navigation }) {
  const [viagens, setViagens] = useState([]);
  const { veiculos } = useContext(VeiculosContext);

  const carregarHistorico = async () => {
    try {
      const dados = await getViagens();
      setViagens(dados.reverse());
    } catch (error) {
      console.error("Erro ao carregar histórico de viagens:", error);
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      carregarHistorico();
    }, [])
  );

  const getNomeVeiculo = (veiculoId) => {
    const veiculo = veiculos.find(v => v.id === veiculoId);
    return veiculo ? veiculo.nome : 'Veículo não encontrado';
  };

  return (
    <>
      <StatusBar barStyle="light-content" backgroundColor="#0A0E21" />
      <View style={styles.container}>
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
          <Texto style={styles.titulo}>Histórico de Viagens</Texto>
          <View style={{ width: 48 }} /> 
        </View>

        <FlatList
          data={viagens}
          renderItem={({ item }) => <ViagemCard item={item} getNomeVeiculo={getNomeVeiculo} />}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={{ paddingBottom: 20 }}
          ListEmptyComponent={
            <Texto style={styles.semHistoricoTexto}>
              Nenhum histórico de viagem encontrado.
            </Texto>
          }
        />
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
      header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingBottom: 20,
      },
      botaoVoltar: {
        padding: 10,
      },
      iconeVoltar: {
        width: 28,
        height: 28,
        resizeMode: "contain",
      },
      titulo: {
        fontSize: 24,
        color: "white",
        fontWeight: "bold",
        textAlign: "center",
      },
      card: {
        backgroundColor: "#1c2337",
        borderRadius: 12,
        padding: 15,
        marginBottom: 15,
      },
      cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
      },
      cardTitulo: {
        color: "white",
        fontSize: 18,
        fontWeight: "bold",
      },
      cardTipoViagem: {
        color: "#AAB1C4",
        fontSize: 12,
        fontStyle: 'italic',
      },
      cardConteudo: {
        marginTop: 15,
        borderTopWidth: 1,
        borderTopColor: '#373e4f',
        paddingTop: 10,
      },
      cardDetalhe: {
        color: "#AAB1C4",
        fontSize: 14,
        marginBottom: 5,
      },
      cardSubtitulo: {
        color: "white",
        fontSize: 16,
        fontWeight: "bold",
        marginTop: 10,
        marginBottom: 5,
      },
      alunosContainer: {
        marginLeft: 10,
      },
      alunoNome: {
        color: "#AAB1C4",
        fontSize: 14,
      },
      semHistoricoTexto: {
        color: "#ccc",
        textAlign: "center",
        marginTop: 50,
        fontSize: 16,
      },
});