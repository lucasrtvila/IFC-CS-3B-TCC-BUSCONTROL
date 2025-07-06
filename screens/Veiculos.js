import { useState, useContext } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Modal,
  FlatList,
} from 'react-native';
import { VeiculosContext } from '../components/VeiculosContext';
import Texto from '../components/Texto';

export default function VeiculosScreen() {
  const { veiculos, adicionarVeiculo, editarVeiculo } =
    useContext(VeiculosContext);

  const [nome, setNome] = useState('');
  const [status, setStatus] = useState('Ativo');
  const [dropdownVisivel, setDropdownVisivel] = useState(false);

  const [modalVisivel, setModalVisivel] = useState(false);
  const [veiculoEditando, setVeiculoEditando] = useState(null);
  const [novoNome, setNovoNome] = useState('');
  const [novoStatus, setNovoStatus] = useState('Ativo');
  const [editDropdownVisivel, setEditDropdownVisivel] = useState(false);

  const abrirEdicao = (index) => {
    const veiculo = veiculos[index];
    setVeiculoEditando(index);
    setNovoNome(veiculo.nome);
    setNovoStatus(veiculo.status);
    setModalVisivel(true);
  };

  const salvarEdicao = () => {
    if (!novoNome.trim()) return;
    editarVeiculo(veiculoEditando, novoNome, novoStatus);
    setModalVisivel(false);
  };

  const handleAdicionarVeiculo = () => {
    if (!nome.trim()) return;
    adicionarVeiculo(nome, status);
    setNome('');
    setStatus('Ativo');
  };

  return (
    <View style={styles.container}>
      <Texto style={styles.titulo}>Veículos</Texto>
      <Texto style={styles.h1}>Nome</Texto>
      <TextInput
        style={styles.input}
        placeholder="Nome do veículo"
        placeholderTextColor="#cfcfcf"
        value={nome}
        onChangeText={setNome}
      />

      <Texto style={styles.h1}>Status</Texto>

      {/* Dropdown simulando o Picker */}
      <TouchableOpacity
        style={styles.dropdown}
        onPress={() => setDropdownVisivel(!dropdownVisivel)}>
        <Texto style={styles.dropdownTexto}>{status}</Texto>
      </TouchableOpacity>

      {dropdownVisivel && (
        <View style={styles.dropdownOpcoes}>
          <TouchableOpacity
            onPress={() => {
              setStatus('Ativo');
              setDropdownVisivel(false);
            }}>
            <Texto style={styles.opcaoTexto}>Ativo</Texto>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => {
              setStatus('Em manutenção');
              setDropdownVisivel(false);
            }}>
            <Texto style={styles.opcaoTexto}>Em manutenção</Texto>
          </TouchableOpacity>
        </View>
      )}

      <TouchableOpacity style={styles.botao} onPress={handleAdicionarVeiculo}>
        <Texto style={styles.botaoTexto}>Adicionar Veículo</Texto>
      </TouchableOpacity>
      
        <FlatList
          data={veiculos}
          keyExtractor={(_, index) => index.toString()}
          renderItem={({ item, index }) => (
            <TouchableOpacity
              style={styles.itemVeiculo}
              onPress={() => abrirEdicao(index)}>
              <Texto style={styles.botaoTexto}>{item.nome}</Texto>
              <Texto style={{ color: '#fff', fontSize: 14 }}>{item.status}</Texto>
            </TouchableOpacity>
          )}
        />

      <Modal visible={modalVisivel} animationType="slide" transparent>
        <View style={styles.modalFundo}>
          <View style={styles.modalBox}>
            <Texto style={styles.modalTitulo}>Editar Veículo</Texto>
            <TextInput
              style={styles.input}
              placeholder="Novo nome"
              placeholderTextColor="#cfcfcf"
              value={novoNome}
              onChangeText={setNovoNome}
            />

            {/* Dropdown de edição */}
            <TouchableOpacity
              style={styles.dropdown}
              onPress={() => setEditDropdownVisivel(!editDropdownVisivel)}>
              <Texto style={styles.dropdownTexto}>{novoStatus}</Texto>
            </TouchableOpacity>
            {editDropdownVisivel && (
              <View style={styles.dropdownOpcoes}>
                <TouchableOpacity
                  onPress={() => {
                    setNovoStatus('Ativo');
                    setEditDropdownVisivel(false);
                  }}>
                  <Texto style={styles.opcaoTexto}>Ativo</Texto>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => {
                    setNovoStatus('Em manutenção');
                    setEditDropdownVisivel(false);
                  }}>
                  <Texto style={styles.opcaoTexto}>Em manutenção</Texto>
                </TouchableOpacity>
              </View>
            )}

            <TouchableOpacity style={styles.botao} onPress={salvarEdicao}>
              <Texto style={styles.botaoTexto}>Salvar</Texto>
            </TouchableOpacity>
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
  titulo: {
    color: '#FFF',
    fontSize: 24,
    marginBottom: 20,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  h1: {
    color: '#FFF',
    fontSize: 18,
    allignItens: 'left',
    marginBottom: 10,
    marginLeft: 10,
  },
  input: {
    backgroundColor: '#1c2337',
    width: '100%',
    borderRadius: 16,
    paddingHorizontal: 15,
    paddingVertical: 12,
    marginBottom: 15,
    fontSize: 16,
    color: '#ffffff',
  },
  dropdown: {
    width: '100%',
    backgroundColor: '#1c2337',
    borderRadius: 16,
    padding: 12,
    marginBottom: 10,
  },
  dropdownTexto: {
    color: '#ffffff',
    fontSize: 16,
  },
  dropdownOpcoes: {
    width: '100%',
    backgroundColor: '#1c2337',
    borderRadius: 16,
    padding: 10,
    marginBottom: 15,
  },
  opcaoTexto: {
    color: '#ffffff',
    fontSize: 16,
    paddingVertical: 6,
  },
  botao: {
    backgroundColor: '#0B49C1',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 16,
    alignItems: 'center',
    marginTop: 10,
    width: '100%',
  },
  botaoTexto: {
    color: '#fff',
    fontSize: 22,
    fontWeight: 'bold',
  },

  itemVeiculo: {
    alignSelf: 'center',
    backgroundColor: '#1c2337',
    paddingVertical: 14,
    paddingHorizontal: 24,
    width: '100%',
    borderRadius: 16,
    marginTop: 20,
  },
  modalFundo: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000000aa',
  },
  modalBox: {
    backgroundColor: '#1c2337',
    padding: 20,
    borderRadius: 16,
    width: '90%',
  },
  modalTitulo: {
    color: '#fff',
    fontSize: 20,
    marginBottom: 10,
  },
});
