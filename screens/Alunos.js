import React, { useContext } from 'react';
import {
  View,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  Dimensions,
  Platform,
  Text,
} from 'react-native';
import Texto from '../components/Texto';
import { AlunosContext } from '../components/AlunosContext';

const { width } = Dimensions.get('window');

export default function AlunosScreen({ navigation }) {
  const { alunos } = useContext(AlunosContext);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Texto style={styles.titulo}>Alunos</Texto>

        <ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {alunos.length === 0 && (
            <Texto style={styles.semAlunosTexto}>Nenhum aluno cadastrado.</Texto>
          )}

          {alunos.map((item) => (
            <View key={item.id} style={styles.card}>
              <TouchableOpacity
                style={styles.ladoEsquerdo}
                onPress={() => navigation.navigate('DetalhesAluno', { aluno: item })}
                activeOpacity={0.7}
              >
                <Texto style={styles.nome}>{item.nome}</Texto>
                <Texto style={styles.ponto}>{item.ponto}</Texto>
                <Texto
                  style={item.status === 'Pago' ? styles.pago : styles.naoPago}
                >
                  Status: {item.status || 'Pago'}
                </Texto>
              </TouchableOpacity>

              <View style={styles.ladoDireito}>
                <TouchableOpacity
                  style={styles.botaoPequeno}
                  onPress={() => navigation.navigate('DetalhesAluno', { aluno: item })}
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
          onPress={() => navigation.navigate('AdicionarAluno')}
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
          onPress={() => navigation.navigate('Inicial')}
          accessibilityRole="button"
          accessibilityLabel="Ir para Início"
        >
          <Text style={styles.abaIcon}>🏠</Text>
          <Texto style={styles.abaText}>Início</Texto>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.abaItem, styles.abaAtiva]}
          accessibilityRole="button"
          accessibilityLabel="Tela de Alunos"
        >
          <Text style={[styles.abaIcon, styles.abaAtivaTexto]}>👥</Text>
          <Texto style={[styles.abaText, styles.abaAtivaTexto]}>Alunos</Texto>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.abaItem}
          onPress={() => navigation.navigate('Rota')}
          accessibilityRole="button"
          accessibilityLabel="Tela de Rota"
        >
          <Text style={styles.abaIcon}>🗺️</Text>
          <Texto style={styles.abaText}>Rota</Texto>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0E21',
    paddingTop: Platform.OS === 'android' ? 25 : 0,
  },
  content: {
    flex: 1,
    paddingHorizontal: width > 768 ? width * 0.1 : 20,
    paddingTop: 20,
    paddingBottom: 20,
  },
  scrollView: {
    flex: 1,
  },
  semAlunosTexto: {
    color: '#ccc',
    fontSize: width > 768 ? 18 : 16,
    textAlign: 'center',
    marginTop: 40,
  },
  titulo: {
    fontSize: width > 768 ? 28 : 24,
    color: 'white',
    marginBottom: 20,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  card: {
    backgroundColor: '#1c2337',
    borderRadius: 12,
    marginBottom: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: width > 768 ? 25 : 15,
    alignItems: 'center',
    height: width > 768 ? 100 : 80,
  },
  ladoEsquerdo: {
    flex: 1,
    justifyContent: 'center',
  },
  ladoDireito: {
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  nome: {
    color: 'white',
    fontSize: width > 768 ? 18 : 16,
    fontWeight: 'bold',
  },
  ponto: {
    color: '#ccc',
    fontSize: width > 768 ? 16 : 14,
  },
  pago: {
    color: 'limegreen',
    fontSize: width > 768 ? 16 : 14,
  },
  naoPago: {
    color: 'orange',
    fontSize: width > 768 ? 16 : 14,
  },
  botao: {
    backgroundColor: '#0B49C1',
    paddingVertical: width > 768 ? 20 : 16,
    paddingHorizontal: 16,
    borderRadius: 16,
    alignItems: 'center',
    marginTop: 20,
    minHeight: width > 768 ? 60 : 50,
  },
  botaoTexto: {
    color: 'white',
    fontSize: width > 768 ? 24 : 20,
    fontWeight: 'bold',
  },
  botaoPequeno: {
    backgroundColor: '#0B49C1',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginVertical: 4,
    minWidth: 70,
    alignItems: 'center',
  },
  botaoPequenoTexto: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: width > 768 ? 16 : 14,
  },
  abas: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#1C1F2E',
    borderTopWidth: 1,
    borderTopColor: '#2A2D3C',
    paddingVertical: 10,
  },
  abaItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  abaIcon: {
    fontSize: 20,
    color: 'white',
    marginBottom: 2,
  },
  abaText: {
    color: '#AAB1C4',
    fontSize: 12,
  },
  abaAtiva: {
    backgroundColor: '#0B49C1',
    borderRadius: 12,
    paddingVertical: 6,
  },
  abaAtivaTexto: {
    color: 'white',
    fontWeight: 'bold',
  },
});
