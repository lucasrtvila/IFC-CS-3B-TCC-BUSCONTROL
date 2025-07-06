import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
} from 'react-native';
import Texto from '../components/Texto';

export default function CadastroScreen() {
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');

  return (
    <View style={styles.container}>
      {/* Ícone de ônibus */}
      {/* <Image source={require('../assets/bus.png')} style={styles.icon} /> */}

      <Texto style={styles.title}>
        <Texto style={styles.blue}>BUS</Texto>{' '}
        <Texto style={styles.white}>CONTROL</Texto>
      </Texto>

      <Texto style={styles.subtitulo}>Criar conta</Texto>

      <TextInput
        style={styles.input}
        placeholder="Nome"
        placeholderTextColor="#aaaa"
        value={nome}
        onChangeText={setNome}
      />

      <TextInput
        style={styles.input}
        placeholder="E-mail"
        placeholderTextColor="#aaaa"
        value={email}
        onChangeText={setEmail}
      />

      <TextInput
        style={styles.input}
        placeholder="Senha"
        placeholderTextColor="#aaaa"
        secureTextEntry
        value={senha}
        onChangeText={setSenha}
      />

      <TouchableOpacity style={styles.botao}>
        <Texto style={styles.textoBotao}>Registrar</Texto>
      </TouchableOpacity>

      <Texto style={styles.loginText}>
        Já tem uma conta? <Texto style={styles.link}>Entrar</Texto>
      </Texto>
    </View>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#050a24',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  icon: {
    width: 50,
    height: 50,
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  blue: {
    color: '#246BFD',
  },
  white: {
    color: '#FFFFFF',
  },
  subtitulo: {
    fontSize: 16,
    color: '#FFFFFF',
    marginBottom: 30,
  },
  input: {
    backgroundColor: '#1c2337',
    width: '100%',
    paddingVertical: 20,
    paddingHorizontal: 20,
    borderRadius: 20,
    color: '#FFFFFF',
    marginBottom: 28,
     fontSize: 16,
  },
  botao: {
    backgroundColor: '#246BFD',
    paddingVertical: 20,
    borderRadius: 20,
    width: '100%',
    alignItems: 'center',
    
  },
  textoBotao: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  loginText: {
    color: '#FFFFFF',
    marginTop: 20,
    fontSize: 14,
  },
  link: {
    color: '#246BFD',
    textDecorationLine: 'underline',
  },
});
