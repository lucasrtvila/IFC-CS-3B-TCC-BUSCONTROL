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
    // Não deve mostrar 'volta' como tipo principal no histórico
    // if (tipo === 'volta') return 'Viagem de Volta (Erro?)';
    return 'Viagem';
  }

  // Parse JSON, tratando possíveis erros ou valores nulos
  let alunosIda = [];
  try {
      alunosIda = item.alunos ? JSON.parse(item.alunos) : [];
  } catch (e) { console.error("Erro ao parsear alunos da ida:", e); }

  let alunosVolta = null;
  try {
      alunosVolta = item.alunos_volta ? JSON.parse(item.alunos_volta) : null;
  } catch (e) { console.error("Erro ao parsear alunos da volta:", e); }


  return (
    <TouchableOpacity style={styles.card} onPress={() => setExpandido(!expandido)}>
      <View style={styles.cardHeader}>
        {/* --- MUDANÇA AQUI (1/2): Adicionado numberOfLines e ellipsizeMode --- */}
        <Texto 
          style={styles.cardTitulo} 
          numberOfLines={1} 
          ellipsizeMode="tail"
        >
          {item.destino}
        </Texto>
        {/* --- FIM DA MUDANÇA --- */}
        
        {/* Só mostra o tipo se for 'so_ida' ou 'ida_e_volta' */}
        {(item.tipoViagem === 'so_ida' || item.tipoViagem === 'ida_e_volta') && (
             <Texto style={styles.cardTipoViagem}>{getTipoViagemLabel(item.tipoViagem)}</Texto>
        )}
      </View>
      {expandido && (
        <View style={styles.cardConteudo}>
          <Texto style={styles.cardDetalhe}>Data: {item.data}</Texto>
          {/* --- Exibição condicional das durações --- */}
          {item.tipoViagem === 'ida_e_volta' ? (
            <>
              <Texto style={styles.cardDetalhe}>Duração Ida: {item.duracao || 'N/A'}</Texto>
              <Texto style={styles.cardDetalhe}>Duração Volta: {item.duracao_volta || 'N/A'}</Texto> {/* Mostra duracao_volta */}
            </>
          ) : (
            <Texto style={styles.cardDetalhe}>Duração: {item.duracao || 'N/A'}</Texto> // Para 'so_ida'
          )}
          {/* --- FIM --- */}
          <Texto style={styles.cardDetalhe}>Veículo: {getNomeVeiculo(item.veiculoId)}</Texto>

          {/* Mostra alunos da ida */}
           <>
              <Texto style={styles.cardSubtitulo}>Alunos na Ida ({alunosIda.length}):</Texto>
              <View style={styles.alunosContainer}>
                  {alunosIda.length > 0 ? (
                      alunosIda.map((aluno, index) => (
                      <Texto key={`ida-${index}`} style={styles.alunoNome}>- {aluno || 'Nome Inválido'}</Texto> // Adicionado fallback
                      ))
                  ) : (
                       <Texto style={styles.alunoNome}>Nenhum aluno registrado na ida.</Texto>
                  )}
              </View>
           </>


          {/* Mostra alunos da volta se existirem (e se for 'ida_e_volta') */}
          {item.tipoViagem === 'ida_e_volta' && alunosVolta && (
            <>
              <Texto style={styles.cardSubtitulo}>Alunos na Volta ({alunosVolta.length}):</Texto>
              <View style={styles.alunosContainer}>
                {alunosVolta.map((aluno, index) => (
                  <Texto key={`volta-${index}`} style={styles.alunoNome}>- {aluno || 'Nome Inválido'}</Texto> // Adicionado fallback
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
      const dados = await getViagens(); // Busca viagens ordenadas DESC
      // Não precisa mais reverter a ordem aqui
      setViagens(dados);
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
        paddingVertical: 50,
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
        flex: 1, // Permite que o título ocupe o espaço
        flexShrink: 1, // --- MUDANÇA AQUI (2/2): Permite que este item encolha
        marginRight: 10, // Adiciona espaço entre título e tipo
      },
      cardTipoViagem: {
        color: "#AAB1C4",
        fontSize: 12,
        fontStyle: 'italic',
        textAlign: 'right', // Alinha à direita
        flexShrink: 0, // --- MUDANÇA AQUI (2/2): Impede que este item encolha
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