import React from "react";
import { useEffect } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";

import CadastroScreen from "./screens/Cadastro";
import VeiculosScreen from "./screens/Veiculos";
import InicialScreen from "./screens/Inicial";
import LembretesScreen from "./screens/Lembretes";
import AlunosScreen from "./screens/Alunos";

import { useFonts } from "expo-font";

import { VeiculosProvider } from "./components/VeiculosContext";
import { LembretesProvider } from "./components/LembretesContext";
import { AlunosProvider } from "./components/AlunosContext";
import { UsuariosProvider } from "./components/UsuariosContext";

import { initDB } from "./database/database"; //

const Stack = createStackNavigator();

export default function App() {
  useEffect(() => {
    async function prepararBanco() {
      try {
        await initDB();
        console.log("✅ Banco de dados iniciado com sucesso!");
      } catch (err) {
        console.error("Erro ao iniciar o banco:", err);
      }
    }

    prepararBanco();
  }, []);
  const [fontsLoaded] = useFonts({
    Rubik: require("./assets/fonts/Rubik.ttf"),
  });

  if (!fontsLoaded) {
    return null; // Pode colocar aqui um splash screen se quiser
  }

  return (
    <UsuariosProvider>
      <AlunosProvider>
        <VeiculosProvider>
          <LembretesProvider>
            <NavigationContainer>
              <Stack.Navigator
                initialRouteName="Cadastro"
                screenOptions={{ headerShown: false }}
              >
                <Stack.Screen name="Cadastro" component={CadastroScreen} />
                <Stack.Screen name="Veiculos" component={VeiculosScreen} />
                <Stack.Screen name="Inicial" component={InicialScreen} />
                <Stack.Screen name="Alunos" component={AlunosScreen} />

                <Stack.Screen name="Lembretes" component={LembretesScreen} />
              </Stack.Navigator>
            </NavigationContainer>
          </LembretesProvider>
        </VeiculosProvider>
      </AlunosProvider>
    </UsuariosProvider>
  );
}
