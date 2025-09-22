import React, { useEffect, useState } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";

import { useFonts } from "expo-font";

import CadastroScreen from "./screens/Cadastro";
import VeiculosScreen from "./screens/Veiculos";
import InicialScreen from "./screens/Inicial";
import LembretesScreen from "./screens/Lembretes";
import AlunosScreen from "./screens/Alunos";
import ConfiguracoesScreen from "./screens/Configuracoes";
import RotaScreen from "./screens/Rota";
import NovaViagemScreen  from "./screens/NovaViagem.js";

import { VeiculosProvider } from "./components/VeiculosContext";
import { LembretesProvider } from "./components/LembretesContext";
import { AlunosProvider } from "./components/AlunosContext";
import { ParadasProvider } from "./components/ParadasContext";

import { initDB, resetDatabase, migrateDatabase } from "./database/database";
import { getUsuario } from "./database/database";


const Stack = createStackNavigator();

export default function App() {
  const [initialRoute, setInitialRoute] = useState(null);
  const [dbReady, setDbReady] = useState(false);

  useEffect(() => {
    async function setupDB() {
      try {
        await initDB();
        await migrateDatabase(); // cria tabelas se não existirem
        const usuario = await getUsuario();
        setInitialRoute(usuario ? "Inicial" : "Cadastro");
        setDbReady(true);
        console.log("Banco pronto ✅");
      } catch (error) {
        console.error("Erro ao inicializar banco:", error);
      }
    }

    setupDB();
  }, []);

  const [fontsLoaded] = useFonts({
    Rubik: require("./assets/fonts/Rubik.ttf"),
  });

  if (!fontsLoaded || !dbReady || !initialRoute) {
    return null;
  }

  console.log("Abrindo com initialRoute:", initialRoute);
  return (
    <AlunosProvider>
      <VeiculosProvider>
        <LembretesProvider>
          <ParadasProvider>
            <NavigationContainer>
              <Stack.Navigator
                initialRouteName={initialRoute}
                screenOptions={{ headerShown: false }}
              >
                <Stack.Screen name="Cadastro" component={CadastroScreen} />
                <Stack.Screen name="Veiculos" component={VeiculosScreen} />
                <Stack.Screen name="Inicial" component={InicialScreen} />
                <Stack.Screen name="Alunos" component={AlunosScreen} />
                <Stack.Screen name="Lembretes" component={LembretesScreen} />
                <Stack.Screen name="Rota" component={RotaScreen} />
                <Stack.Screen name="NovaViagem" component={NovaViagemScreen} />
                <Stack.Screen
                  name="Configuracoes"
                  component={ConfiguracoesScreen}
                />
              </Stack.Navigator>
            </NavigationContainer>
          </ParadasProvider>
        </LembretesProvider>
      </VeiculosProvider>
    </AlunosProvider>
  );
}
