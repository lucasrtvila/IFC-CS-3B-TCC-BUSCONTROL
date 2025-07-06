import React, { useContext, useState } from 'react';
import Texto from '../components/Texto';
import {
  View,
  FlatList,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Modal,
  Image,
  Dimensions,
  Platform,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { LembretesContext } from '../components/LembretesContext';

const { width } = Dimensions.get('window');

function formatarData(data) {
  const dia = data.getDate().toString().padStart(2, '0');
  const mes = (data.getMonth() + 1).toString().padStart(2, '0');
  const ano = data.getFullYear();
  return `${dia}/${mes}/${ano}`;
}

export default function LembretesScreen({ navigation }) {
  const { lembretes, setLembretes } = useContext(LembretesContext);

  const [modalVisible, setModalVisible] = useState(false);
  const [editarIndex, setEditarIndex] = useState(null);
  const [tituloInput, setTituloInput] = useState('');
  const [dataSelecionada, setDataSelecionada] = useState(new Date());
  const [dataInput, setDataInput] = useState(formatarData(new Date()));
  const [mostrarDatePicker, setMostrarDatePicker] = useState(false);

  const abrirModal = (index = null) => {
    if (index !== null) {
      setEditarIndex(index);
      setTituloInput(lembretes[index].titulo);
      setDataInput(lembretes[index].data);
      setDataSelecionada(new Date(lembretes[index].data));
    } else {
      setEditarIndex(null);
      setTituloInput('');
      const hoje = new Date();
      setDataSelecionada(hoje);
      setDataInput(formatarData(hoje));
    }
    setMostrarDatePicker(false);
    setModalVisible(true);
  };

  const salvarLembrete = () => {
    if (!tituloInput.trim() || !dataInput.trim()) {
      Alert.alert('Erro', 'Preencha título e data.');
      return;
    }

    if (editarIndex !== null) {
      const novosLembretes = [...lembretes];
      novosLembretes[editarIndex] = { titulo: tituloInput, data: dataInput };
      setLembretes(novosLembretes);
    } else {
      setLembretes([...lembretes, { titulo: tituloInput, data: dataInput }]);
    }

    setModalVisible(false);
  };

  const removerLembrete = (index) => {
    Alert.alert('Confirmar remoção', 'Deseja realmente remover este lembrete?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Remover',
        style: 'destructive',
        onPress: () => {
          const novosLembretes = lembretes.filter((_, i) => i !== index);
          setLembretes(novosLembretes);
        },
      },
    ]);
  };

  const abrirDatePicker = () => {
    setMostrarDatePicker(true);
  };

  const aoSelecionarData = (event, selectedDate) => {
    setMostrarDatePicker(Platform.OS === 'ios'); // No iOS pode deixar aberto até o usuário fechar
    if (selectedDate) {
      setDataSelecionada(selectedDate);
      setDataInput(formatarData(selectedDate));
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.botaoVoltar} onPress={() => navigation.navigate('Inicial')}>
          <Image source={require('../assets/voltar.png')} style={styles.iconeVoltar} />
        </TouchableOpacity>
        <Texto style={styles.titulo}>Lembretes</Texto>
        <View style={styles.espacoVazio} />
      </View>

      <FlatList
        data={lembretes}
        keyExtractor={(_, index) => index.toString()}
        style={styles.lista}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Texto style={styles.emptyText}>Nenhum lembrete registrado</Texto>
          </View>
        }
        renderItem={({ item, index }) => (
          <View style={styles.lembreteItem}>
            <View style={styles.lembreteInfo}>
              <Texto style={styles.lembreteTitulo} numberOfLines={2}>{item.titulo}</Texto>
              <Texto style={styles.lembreteData}>{item.data}</Texto>
            </View>
            <View style={styles.botoesContainer}>
              <TouchableOpacity style={[styles.botaoAcao, styles.botaoEditar]} onPress={() => abrirModal(index)}>
                <Texto style={styles.botaoAcaoTexto}>✏️</Texto>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.botaoAcao, styles.botaoRemover]} onPress={() => removerLembrete(index)}>
                <Texto style={styles.botaoAcaoTexto}>🗑️</Texto>
              </TouchableOpacity>
            </View>
          </View>
        )}
      />

      <TouchableOpacity style={styles.botaoNovo} onPress={() => abrirModal()}>
        <Texto style={styles.botaoTexto}>+ Novo Lembrete</Texto>
      </TouchableOpacity>

      <Modal visible={modalVisible} animationType="fade" transparent={true}>
        <View style={styles.modalFundo}>
          <View style={styles.modalContainer}>
            <Texto style={styles.modalTitulo}>{editarIndex !== null ? 'Editar Lembrete' : 'Novo Lembrete'}</Texto>

            <Texto style={styles.label}>Título</Texto>
            <TextInput
              placeholder="Digite o título do lembrete"
              placeholderTextColor="#cfcfcf"
              value={tituloInput}
              onChangeText={setTituloInput}
              style={styles.input}
            />

            <Texto style={styles.label}>Data</Texto>
            <TouchableOpacity onPress={abrirDatePicker} style={styles.input}>
              <Texto style={{ color: dataInput ? '#fff' : '#cfcfcf' }}>
                {dataInput || 'Selecionar data'}
              </Texto>
            </TouchableOpacity>

            {mostrarDatePicker && (
              <DateTimePicker
                value={dataSelecionada}
                mode="date"
                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                onChange={aoSelecionarData}
              />
            )}

            <View style={styles.modalBotoes}>
              <TouchableOpacity style={[styles.botao, styles.botaoCancelar]} onPress={() => setModalVisible(false)}>
                <Texto style={styles.botaoTexto}>Cancelar</Texto>
              </TouchableOpacity>
              <TouchableOpacity style={styles.botao} onPress={salvarLembrete}>
                <Texto style={styles.botaoTexto}>Salvar</Texto>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0E21',
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 30,
    marginTop: 10,
  },
  botaoVoltar: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconeVoltar: {
    width: 24,
    height: 24,
    tintColor: '#FFF',
  },
  titulo: {
    color: '#FFF',
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    flex: 1,
  },
  espacoVazio: {
    width: 40,
  },
  botaoNovo: {
    backgroundColor: '#0B49C1',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 16,
    alignItems: 'center',
    marginBottom: 20,
  },
  botaoTexto: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  lista: {
    flex: 1,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 50,
  },
  emptyText: {
    color: '#AAB1C4',
    fontSize: 16,
    textAlign: 'center',
  },
  lembreteItem: {
    backgroundColor: '#1c2337',
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  lembreteInfo: {
    flex: 1,
    marginRight: 12,
  },
  lembreteTitulo: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  lembreteData: {
    color: '#AAB1C4',
    fontSize: 14,
  },
  botoesContainer: {
    flexDirection: 'row',
    gap: 10,
  },
  botaoAcao: {
    padding: 8,
    borderRadius: 12,
    width: 40,
    alignItems: 'center',
  },
  botaoEditar: {
    backgroundColor: '#0B49C1',
  },
  botaoRemover: {
    backgroundColor: '#C10B0B',
  },
  botaoAcaoTexto: {
    color: '#fff',
    fontSize: 16,
  },
  modalFundo: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  modalContainer: {
    backgroundColor: '#1c2337',
    borderRadius: 16,
    padding: 20,
    width: width * 0.9,
    maxWidth: 400,
  },
  modalTitulo: {
    fontSize: 20,
    color: '#fff',
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
  },
  label: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
    marginLeft: 4,
  },
  input: {
    backgroundColor: '#0A0E21',
    color: '#ffffff',
    fontSize: 16,
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderRadius: 16,
    marginBottom: 15,
    justifyContent: 'center',
  },
  modalBotoes: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
    gap: 10,
  },
  botao: {
    backgroundColor: '#0B49C1',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 16,
    alignItems: 'center',
    flex: 1,
  },
  botaoCancelar: {
    backgroundColor: '#666',
  },
});
