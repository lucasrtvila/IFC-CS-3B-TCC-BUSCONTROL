import React, { useEffect, useState } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { useFonts } from "expo-font";

// Telas
import CadastroScreen from "./screens/Cadastro";
import VeiculosScreen from "./screens/Veiculos";
import InicialScreen from "./screens/Inicial";
import LembretesScreen from "./screens/Lembretes";
import AlunosScreen from "./screens/Alunos";
import ConfiguracoesScreen from "./screens/Configuracoes";
import RotaScreen from "./screens/Rota";
import NovaViagemScreen from "./screens/NovaViagem.js";
import ViagemAtivaScreen from "./screens/ViagemAtiva.js";

// Contextos
import { VeiculosProvider } from "./components/VeiculosContext";
import { LembretesProvider } from "./components/LembretesContext";
import { AlunosProvider } from "./components/AlunosContext";
import { ParadasProvider } from "./components/ParadasContext";
import { ViagemProvider } from "./components/ViagemContext";

// Banco de Dados
import { initDB, migrateDatabase } from "./database/database";
import { getUsuario } from "./database/database";

const Stack = createStackNavigator();

export default function App() {
  const [initialRoute, setInitialRoute] = useState(null);
  const [dbReady, setDbReady] = useState(false);

  useEffect(() => {
    async function setupDB() {
      try {
      /*  await resetDatabase(); // limpa o banco para testes*/
        await initDB();
        await migrateDatabase();
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

  return (
    <AlunosProvider>
      <VeiculosProvider>
        <LembretesProvider>
          <ParadasProvider>
            <ViagemProvider>
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
                  <Stack.Screen name="ViagemAtiva" component={ViagemAtivaScreen} />
                  <Stack.Screen
                    name="Configuracoes"
                    component={ConfiguracoesScreen}
                  />
                </Stack.Navigator>
              </NavigationContainer>
            </ViagemProvider>
          </ParadasProvider>
        </LembretesProvider>
      </VeiculosProvider>
    </AlunosProvider>
  );
}