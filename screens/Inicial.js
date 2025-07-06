import React, { useContext, useState, useEffect } from 'react';
import { VeiculosContext } from '../components/VeiculosContext';
import { LembretesContext } from '../components/LembretesContext';
import Texto from '../components/Texto';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Alert,
  TextInput,
  Modal,
  SafeAreaView,
  Dimensions,
  Platform,
  StatusBar,
} from 'react-native';
import * as Location from 'expo-location';

const { width } = Dimensions.get('window');
const isWeb = Platform.OS === 'web';

export default function Inicial({ navigation, route }) {
  const [nome, setNome] = useState(route.params?.nome || 'Usuário');
  const [localizacao, setLocalizacao] = useState('Buscando...');
  const [mensalidade, setMensalidade] = useState(380.0);
  const [saudacao, setSaudacao] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [novoValorMensalidade, setNovoValorMensalidade] = useState('');

  const { veiculos } = useContext(VeiculosContext);
  const { lembretes } = useContext(LembretesContext);

  const abaAtiva = 'Inicial';

  useEffect(() => {
    const hora = new Date().getHours();
    if (hora >= 5 && hora < 12) setSaudacao('Bom dia, ');
    else if (hora >= 12 && hora < 18) setSaudacao('Boa tarde, ');
    else setSaudacao('Boa noite, ');
  }, []);

  useEffect(() => {
    const obterLocalizacao = async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          setLocalizacao('Permissão negada');
          return;
        }

        const location = await Location.getCurrentPositionAsync({});
        const [address] = await Location.reverseGeocodeAsync(location.coords);

        if (address) {
          const cidade = address.city || address.subregion || 'Cidade desconhecida';
          const estado = address.region || '';
          setLocalizacao(`${cidade} - ${estado}`);
        } else {
          setLocalizacao('Local não encontrado');
        }
      } catch (error) {
        console.error('Erro ao obter localização:', error);
        setLocalizacao('Erro ao obter localização');
      }
    };

    obterLocalizacao();
  }, []);

  const abrirModalMensalidade = () => {
    setNovoValorMensalidade('');
    setModalVisible(true);
  };

  const salvarMensalidade = () => {
    const valor = parseFloat(novoValorMensalidade);
    if (!isNaN(valor)) {
      setMensalidade(valor);
      setModalVisible(false);
    } else {
      Alert.alert('Valor inválido', 'Por favor, insira um número válido.');
    }
  };

  return (
    <>
      <StatusBar barStyle="light-content" backgroundColor="#0A0E21" />
      <SafeAreaView style={styles.container}>
        <View style={styles.content}>
          <View style={styles.header}>
            <Image source={require('../assets/logoinicial.png')} style={styles.logo} />
            <Texto style={styles.boasVindas}>
              {saudacao}
              <Texto style={styles.nome}>{nome}</Texto>
            </Texto>
          </View>

          <View style={styles.cardsContainer}>
            <TouchableOpacity style={styles.card}>
              <View style={styles.cardCenterContent}>
                <Texto style={styles.cardTitle}>Você está em</Texto>
                <Texto style={styles.cardTextBold}>{localizacao}</Texto>
                <Texto style={styles.cardSub}>Ver minha localização</Texto>
              </View>
            </TouchableOpacity>

            <TouchableOpacity style={styles.card} onPress={abrirModalMensalidade}>
              <View style={styles.cardCenterContent}>
                <Texto style={styles.cardTitle}>Mensalidades</Texto>
                <Texto style={styles.cardTextBold}>Valor atual: R$ {mensalidade.toFixed(2)}</Texto>
                <Texto style={styles.cardSub}>Toque para editar</Texto>
              </View>
            </TouchableOpacity>
          </View>

          <View style={styles.grid}>
            <TouchableOpacity style={styles.miniCard} onPress={() => navigation.navigate('Veiculos')}>
              <Texto style={styles.cardTitle}>Veículos</Texto>
              {veiculos.length === 0 ? (
                <Texto style={styles.miniText}>Nenhum veículo registrado</Texto>
              ) : (
                veiculos.map((v) => (
                  <View key={v.id} style={{ marginBottom: 6 }}>
                    <Texto style={styles.miniText}>
                      {v.nome.length > 22 ? v.nome.slice(0, 20) + '...' : v.nome}
                    </Texto>
                    <Texto style={v.status === 'Ativo' ? styles.statusAtivo : styles.statusManutencao}>
                      {v.status}
                    </Texto>
                  </View>
                ))
              )}
            </TouchableOpacity>

            <TouchableOpacity style={styles.miniCard} onPress={() => navigation.navigate('Lembretes')}>
              <Texto style={styles.cardTitle}>Lembretes</Texto>
              {lembretes.length === 0 ? (
                <Texto style={styles.miniText}>Nenhum lembrete registrado</Texto>
              ) : (
                lembretes.map((l) => (
                  <View key={l.id} style={{ marginBottom: 6 }}>
                    <Texto style={styles.miniText}>
                      {l.titulo.length > 22 ? l.titulo.slice(0, 20) + '...' : l.titulo}
                    </Texto>
                    <Texto style={{ color: '#AAB1C4', fontSize: 12 }}>{l.data}</Texto>
                  </View>
                ))
              )}
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.botaoPrincipal}>
            <Texto style={styles.botaoText}>Nova Viagem</Texto>
          </TouchableOpacity>
        </View>

        {/* Barra de navegação inferior */}
        <View style={styles.abas}>
          {[
            { nome: 'Inicial', icone: '🏠' },
            { nome: 'Alunos', icone: '👥' },
            { nome: 'Rota', icone: '🗺️' },
          ].map((aba) => (
            <TouchableOpacity
              key={aba.nome}
              style={[styles.abaItem, abaAtiva === aba.nome && styles.abaAtiva]}
              onPress={() => navigation.navigate(aba.nome)}
            >
              <Text style={[styles.abaIcon, abaAtiva === aba.nome && styles.abaAtivaTexto]}>
                {aba.icone}
              </Text>
              <Texto style={[styles.abaText, abaAtiva === aba.nome && styles.abaAtivaTexto]}>
                {aba.nome}
              </Texto>
            </TouchableOpacity>
          ))}
        </View>

        <Modal visible={modalVisible} animationType="slide" transparent>
          <View style={styles.modalBackground}>
            <View style={styles.modalContainer}>
              <Texto style={styles.modalTitle}>Editar Mensalidade</Texto>
              <TextInput
                style={styles.input}
                placeholder="Novo valor"
                keyboardType="numeric"
                value={novoValorMensalidade}
                onChangeText={setNovoValorMensalidade}
              />
              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={[styles.modalButton, styles.cancelButton]}
                  onPress={() => setModalVisible(false)}
                >
                  <Texto style={styles.modalButtonText}>Cancelar</Texto>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.modalButton, styles.saveButton]}
                  onPress={salvarMensalidade}
                >
                  <Texto style={styles.modalButtonText}>Salvar</Texto>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#0A0E21',
    flex: 1,
  },
  content: {
    paddingHorizontal: width > 768 ? width * 0.1 : 16,
    flex: 1,
  },
  header: {
    alignItems: 'center',
    paddingTop: 10,
  },
  logo: {
    resizeMode: 'contain',
    width: Math.min(120, width * 0.3),
    height: Math.min(60, width * 0.15),
    marginBottom: 5,
  },
  boasVindas: {
    color: 'white',
    fontSize: width > 768 ? 24 : 20,
    textAlign: 'center',
  },
  nome: {
    fontWeight: 'bold',
  },
  cardsContainer: {
    gap: 12,
    marginTop: 16,
  },
  card: {
    backgroundColor: '#1C1F2E',
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 16,
    justifyContent: 'center',
  },
  cardCenterContent: {
    alignItems: 'center',
  },
  cardTitle: {
    color: 'white',
    fontSize: 16,
    marginBottom: 2,
    textAlign: 'center',
  },
  cardTextBold: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
  cardSub: {
    color: '#AAB1C4',
    fontSize: 12,
    marginTop: 2,
  },
  grid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
    marginVertical: 16,
  },
  miniCard: {
    backgroundColor: '#1C1F2E',
    borderRadius: 16,
    padding: 12,
    flex: 1,
    minHeight: 120,
  },
  miniText: {
    color: '#AAB1C4',
    fontSize: 12,
  },
  statusAtivo: {
    color: 'limegreen',
    fontSize: 12,
  },
  statusManutencao: {
    color: 'orange',
    fontSize: 12,
  },
  botaoPrincipal: {
    backgroundColor: '#0B49C1',
    paddingVertical: 14,
    borderRadius: 16,
    alignItems: 'center',
    marginBottom: 20,
  },
  botaoText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  abas: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#1C1F2E',
    borderTopWidth: 1,
    borderTopColor: '#2A2D3C',
    paddingVertical: 8,
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
  modalBackground: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  modalContainer: {
    backgroundColor: '#1C1F2E',
    borderRadius: 16,
    padding: 20,
  },
  modalTitle: {
    color: 'white',
    fontSize: 20,
    textAlign: 'center',
    marginBottom: 10,
    fontWeight: 'bold',
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 10,
    marginTop: 10,
    fontSize: 18,
  },
  modalButtons: {
    flexDirection: 'row',
    marginTop: 20,
    gap: 10,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
  },

  saveButton: {
    backgroundColor: '#0B49C1',
  },
  modalButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
