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
      <Text style={styles.titulo}>Veículos</Text>
      <Text style={styles.h1}>Nome</Text>
      <TextInput
        style={styles.input}
        placeholder="Nome do veículo"
        placeholderTextColor="#cfcfcf"
        value={nome}
        onChangeText={setNome}
      />

      <Text style={styles.h1}>Status</Text>

      {/* Dropdown simulando o Picker */}
      <TouchableOpacity
        style={styles.dropdown}
        onPress={() => setDropdownVisivel(!dropdownVisivel)}>
        <Text style={styles.dropdownTexto}>{status}</Text>
      </TouchableOpacity>

      {dropdownVisivel && (
        <View style={styles.dropdownOpcoes}>
          <TouchableOpacity
            onPress={() => {
              setStatus('Ativo');
              setDropdownVisivel(false);
            }}>
            <Text style={styles.opcaoTexto}>Ativo</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => {
              setStatus('Em manutenção');
              setDropdownVisivel(false);
            }}>
            <Text style={styles.opcaoTexto}>Em manutenção</Text>
          </TouchableOpacity>
        </View>
      )}

      <TouchableOpacity style={styles.botao} onPress={handleAdicionarVeiculo}>
        <Text style={styles.botaoTexto}>Adicionar Veículo</Text>
      </TouchableOpacity>
      
        <FlatList
          data={veiculos}
          keyExtractor={(_, index) => index.toString()}
          renderItem={({ item, index }) => (
            <TouchableOpacity
              style={styles.itemVeiculo}
              onPress={() => abrirEdicao(index)}>
              <Text style={styles.botaoTexto}>{item.nome}</Text>
              <Text style={{ color: '#fff', fontSize: 14 }}>{item.status}</Text>
            </TouchableOpacity>
          )}
        />

      <Modal visible={modalVisivel} animationType="slide" transparent>
        <View style={styles.modalFundo}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitulo}>Editar Veículo</Text>
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
              <Text style={styles.dropdownTexto}>{novoStatus}</Text>
            </TouchableOpacity>
            {editDropdownVisivel && (
              <View style={styles.dropdownOpcoes}>
                <TouchableOpacity
                  onPress={() => {
                    setNovoStatus('Ativo');
                    setEditDropdownVisivel(false);
                  }}>
                  <Text style={styles.opcaoTexto}>Ativo</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => {
                    setNovoStatus('Em manutenção');
                    setEditDropdownVisivel(false);
                  }}>
                  <Text style={styles.opcaoTexto}>Em manutenção</Text>
                </TouchableOpacity>
              </View>
            )}

            <TouchableOpacity style={styles.botao} onPress={salvarEdicao}>
              <Text style={styles.botaoTexto}>Salvar</Text>
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
