import { View, Text, Button, TouchableOpacity, StyleSheet } from 'react-native';


// Componente de como será exibido o nome e o botão de excluir.
// Defini como componente para caso precisar reutilizar ele em outro tela, por exemplo.
export default function ItemNome({ nome, onExcluir }) {
  return (
    <View style={styles.container}>
      <Text style={styles.nome}>{nome}</Text>
        <TouchableOpacity onPress={onExcluir} style={styles.botaoExcluir}>
        <Text style={styles.xTexto}>X</Text>
      </TouchableOpacity>
    </View>
  );
}

// Estilização, muito semelhante ao CSS normal. Nota-se que aqui eu não estou usando inline.
const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
    padding: 10,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
  },
  nome: {
    fontSize: 16,
  },
   nomeTexto: {
    fontSize: 18,
  },
  botaoExcluir: {
    backgroundColor: 'red',
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  xTexto: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
