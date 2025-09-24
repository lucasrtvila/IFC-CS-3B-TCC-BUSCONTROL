import React, { useState, useEffect, useContext } from 'react';
import { View, TouchableOpacity, StyleSheet, Dimensions, StatusBar, FlatList, Modal, Image } from 'react-native';
import Texto from '../components/Texto';
import Header from '../components/Header';
import { ViagemContext } from '../components/ViagemContext';

const { width } = Dimensions.get('window');

export default function ViagemAtivaScreen({ route, navigation }) {
  // Recebe os dados da viagem da tela anterior
  const { destino, horarioFinal, paradasDaViagem, veiculoId, tipoViagem } = route.params;
  
  // Obtém a função do contexto para salvar o template
  const { salvarViagemComoTemplate } = useContext(ViagemContext);

  const [duracao, setDuracao] = useState(0);
  const [modalAlunosVisivel, setModalAlunosVisivel] = useState(false);
  const [alunosNaParada, setAlunosNaParada] = useState([]);
  const [paradaSelecionadaNome, setParadaSelecionadaNome] = useState('');

  // Efeito para o timer da duração da viagem
  useEffect(() => {
    const timer = setInterval(() => {
      setDuracao(prev => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatarDuracao = (totalSegundos) => {
    const minutos = Math.floor(totalSegundos / 60).toString().padStart(2, '0');
    const segundos = (totalSegundos % 60).toString().padStart(2, '0');
    return `${minutos}:${segundos}`;
  };

  const encerrarViagem = () => {
    // Se for uma viagem de "Ida", salva os dados como um modelo para a "Volta"
    if (tipoViagem === 'ida') {
      const alunosSelecionadosIds = paradasDaViagem.flatMap(p => p.alunos.map(a => a.id));
      
      const template = {
        destino,
        veiculoId,
        alunosSelecionadosIds,
      };
      salvarViagemComoTemplate(template);
    }

    navigation.navigate('Inicial');
  };
  
  // Abre o modal para visualizar os alunos de uma parada específica
  const verAlunosDaParada = (parada) => {
    setAlunosNaParada(parada.alunos || []);
    setParadaSelecionadaNome(parada.nome);
    setModalAlunosVisivel(true);
  };

  // Componente para renderizar cada parada na lista
  const renderParada = ({ item }) => (
    <TouchableOpacity style={styles.cardParada} onPress={() => verAlunosDaParada(item)}>
      <View style={styles.cardParadaEsquerda}>
        <Texto style={styles.nomeParada}>{item.nome}</Texto>
        <Texto style={styles.verAlunos}>Ver alunos ({item.alunos.length})</Texto>
      </View>
      <View style={styles.cardParadaDireita}>
        <Texto style={styles.horaPrevLabel}>Hora Prev.</Texto>
        <Texto style={styles.horaPrevValor}>{item.horario}</Texto>
      </View>
    </TouchableOpacity>
  );

  return (
    <>
      <StatusBar barStyle="light-content" backgroundColor="#0A0E21" />
      <View style={styles.container}>
        <Header navigation={navigation} />

        <View style={styles.content}>
          <Texto style={styles.titulo}>Viagem para: {destino}</Texto>

          <View style={styles.metricasContainer}>
            <View style={styles.metricaBox}>
              <Texto style={styles.metricaLabel}>Duração</Texto>
              <Texto style={styles.metricaValor}>{formatarDuracao(duracao)}</Texto>
            </View>
            <View style={styles.metricaBox}>
              <Texto style={styles.metricaLabel}>Cheg. Prev.</Texto>
              <Texto style={styles.metricaValor}>{horarioFinal}</Texto>
            </View>
          </View>

          <Texto style={styles.subtitulo}>Próx. Paradas:</Texto>

          <FlatList
            data={paradasDaViagem}
            renderItem={renderParada}
            keyExtractor={item => item.id.toString()}
            contentContainerStyle={{ paddingBottom: 20 }}
            ListEmptyComponent={
                <View style={{alignItems: 'center', marginTop: 50}}>
                    <Texto style={{color: '#AAB1C4', fontSize: 16}}>Nenhuma parada nesta viagem.</Texto>
                </View>
            }
          />
        </View>

        <TouchableOpacity style={styles.botaoEncerrar} onPress={encerrarViagem}>
          <Texto style={styles.botaoTexto}>Encerrar Viagem</Texto>
        </TouchableOpacity>

        <Modal
          visible={modalAlunosVisivel}
          animationType="fade"
          transparent
        >
          <View style={styles.modalFundo}>
            <View style={styles.modalBox}>
              <Texto style={styles.modalTitulo}>Alunos em "{paradaSelecionadaNome}"</Texto>
              <FlatList
                data={alunosNaParada}
                renderItem={({ item }) => (
                    <View style={styles.alunoItem}>
                        <Texto style={styles.alunoItemText}>{item.nome}</Texto>
                    </View>
                )}
                keyExtractor={(item) => item.id.toString()}
                style={styles.alunosList}
                ListEmptyComponent={() => (
                    <Texto style={styles.semAlunosTexto}>Nenhum aluno nesta parada.</Texto>
                )}
              />
              <TouchableOpacity
                style={styles.botaoFecharModal}
                onPress={() => setModalAlunosVisivel(false)}
              >
                <Texto style={styles.botaoTexto}>Fechar</Texto>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#050a24',
        paddingHorizontal: 20,
        paddingVertical: 30,
    },
    content: {
        flex: 1,
    },
    titulo: {
        color: '#246BFD',
        fontSize: 20,
        fontWeight: 'bold',
        textAlign: 'center',
        marginVertical: 20,
        borderWidth: 1,
        borderColor: '#246BFD',
        paddingVertical: 8,
        borderRadius: 8,
    },
    metricasContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginBottom: 30,
    },
    metricaBox: {
        backgroundColor: '#1c2337',
        borderRadius: 15,
        paddingVertical: 20,
        paddingHorizontal: 30,
        alignItems: 'center',
        width: '45%',
    },
    metricaLabel: {
        color: '#AAB1C4',
        fontSize: 16,
        marginBottom: 5,
    },
    metricaValor: {
        color: 'white',
        fontSize: 32,
        fontWeight: 'bold',
    },
    subtitulo: {
        color: 'white',
        fontSize: 22,
        fontWeight: 'bold',
        marginBottom: 15,
    },
    cardParada: {
        backgroundColor: '#1c2337',
        borderRadius: 15,
        padding: 20,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 15,
    },
    cardParadaEsquerda: {
        flex: 1,
    },
    nomeParada: {
        color: 'white',
        fontSize: 20,
        fontWeight: 'bold',
    },
    verAlunos: {
        color: '#AAB1C4',
        fontSize: 14,
        marginTop: 4,
    },
    cardParadaDireita: {
        alignItems: 'center',
    },
    horaPrevLabel: {
        color: '#AAB1C4',
        fontSize: 14,
    },
    horaPrevValor: {
        color: 'white',
        fontSize: 22,
        fontWeight: 'bold',
        marginTop: 4,
    },
    botaoEncerrar: {
        backgroundColor: '#c41628ff',
        paddingVertical: 18,
        borderRadius: 16,
        alignItems: 'center',
        marginTop: 20,
    },
    botaoTexto: {
        color: 'white',
        fontSize: 18,
        fontWeight: 'bold',
    },
    modalFundo: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "rgba(0,0,0,0.7)",
    },
    modalBox: {
        backgroundColor: "#1c2337",
        borderRadius: 16,
        padding: 20,
        width: "90%",
        maxHeight: "80%",
    },
    modalTitulo: {
        color: "#fff",
        fontSize: 20,
        fontWeight: "bold",
        textAlign: "center",
        marginBottom: 20,
    },
    alunosList: {
        marginBottom: 20,
    },
    alunoItem: {
        padding: 15,
        backgroundColor: "#373e4f",
        borderRadius: 8,
        marginBottom: 10,
    },
    alunoItemText: {
        color: "#fff",
        fontSize: 16,
    },
    semAlunosTexto: {
        color: '#AAB1C4',
        textAlign: 'center',
        marginVertical: 20,
    },
    botaoFecharModal: {
        backgroundColor: "#0B49C1",
        paddingVertical: 15,
        borderRadius: 12,
        alignItems: "center",
    },
});