import { TextInput, StyleSheet } from 'react-native';

// Criei um componente que é um textInput diferente, onde já defini um estilo padrão e os únicos valores que eu altero
// (parâmetros) são o "value", "onChangeText" e "placeholder".
export default function CampoTexto({ value, onChangeText, placeholder }) {
  return (
    <TextInput
      style={styles.input}
      value={value}
      onChangeText={onChangeText}
      placeholder={placeholder}
    />
  );
}

// Estilização normal, sem ser inline (trás maior organização ao código).
const styles = StyleSheet.create({
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    borderRadius: 5,
    marginBottom: 10,
  },
});
