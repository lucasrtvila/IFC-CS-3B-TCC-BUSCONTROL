import React, { useEffect, useState, useCallback } from "react"; // [1] Importar useCallback
import { NavigationContainer } from "@react-navigation/native";
import {
  createStackNavigator,
  CardStyleInterpolators,
} from "@react-navigation/stack";
import { useFonts } from "expo-font";
import {
  SafeAreaProvider,
  initialWindowMetrics,
} from "react-native-safe-area-context";
import * as SplashScreen from "expo-splash-screen"; // [2] Importar Splash Screen

// Telas
import CadastroScreen from "./screens/Cadastro";
import VeiculosScreen from "./screens/Veiculos";
import InicialScreen from "./screens/Inicial";
import LembretesScreen from "./screens/Lembretes";
import AlunosScreen from "./screens/Alunos";
import MensalidadesScreen from "./screens/Mensalidades";
import ConfiguracoesScreen from "./screens/Configuracoes";
import RotaScreen from "./screens/Rota";
import NovaViagemScreen from "./screens/NovaViagem.js";
import ViagemAtivaScreen from "./screens/ViagemAtiva.js";
import ListaPresencaScreen from "./screens/ListaPresenca.js";
import HistoricoViagensScreen from "./screens/HistoricoViagens.js";

// Contextos
import { VeiculosProvider } from "./components/VeiculosContext";
import { LembretesProvider } from "./components/LembretesContext";
import { AlunosProvider } from "./components/AlunosContext";
import { ParadasProvider } from "./components/ParadasContext";
import { ViagemProvider } from "./components/ViagemContext";

// Banco de Dados
import {
  initDB,
  migrateDatabase,
  getUsuario,
  getMensalidade,
  salvarMensalidade,
  calcularProximoVencimento,
} from "./database/database";

const Stack = createStackNavigator();

// [3] Impedir que o splash suma automaticamente
SplashScreen.preventAutoHideAsync();

function parseDataISO(dataString) {
  if (!dataString || typeof dataString !== "string") return null;
  const parts = dataString.split("-");
  if (parts.length === 3) {
    return new Date(
      Date.UTC(
        parseInt(parts[0], 10),
        parseInt(parts[1], 10) - 1,
        parseInt(parts[2], 10)
      )
    );
  }
  return null;
}

async function verificarEAtualizarVencimento() {
  console.log("Verificando data de vencimento...");
  try {
    const config = await getMensalidade();
    if (config && config.dataVencimento) {
      const dataVencObj = parseDataISO(config.dataVencimento);
      const hoje = new Date();
      hoje.setHours(0, 0, 0, 0);

      if (dataVencObj && dataVencObj < hoje) {
        console.log(
          `Data de vencimento antiga (${config.dataVencimento}) ultrapassada.`
        );
        const proximoVencimentoISO = calcularProximoVencimento(
          config.dataVencimento
        );
        await salvarMensalidade(config.valor, proximoVencimentoISO);
        console.log(
          `✅ Data de vencimento atualizada para: ${proximoVencimentoISO}`
        );
      } else {
        console.log("Data de vencimento ainda válida.");
      }
    } else {
      console.log(
        "Nenhuma configuração de mensalidade encontrada para verificar."
      );
    }
  } catch (error) {
    console.error("Erro ao verificar/atualizar data de vencimento:", error);
  }
}

export default function App() {
  const [initialRoute, setInitialRoute] = useState(null);
  const [dbReady, setDbReady] = useState(false);

  useEffect(() => {
    async function setupDB() {
      try {
        await initDB();
        await migrateDatabase();
        await verificarEAtualizarVencimento();
        const usuario = await getUsuario();
        setInitialRoute(usuario ? "Inicial" : "Cadastro");
      } catch (error) {
        console.error("Erro ao inicializar banco:", error);
      } finally {
        setDbReady(true);
      }
    }
    setupDB();
  }, []);

  const [fontsLoaded] = useFonts({
    Rubik: require("./assets/fonts/Rubik.ttf"),
  });

  // [4] Função para esconder o splash SÓ QUANDO TUDO ESTIVER PRONTO
  const onLayoutRootView = useCallback(async () => {
    if (fontsLoaded && dbReady && initialRoute) {
      await SplashScreen.hideAsync();
    }   
  }, [fontsLoaded, dbReady, initialRoute]);

  if (!fontsLoaded || !dbReady || !initialRoute) {
    return null; // Isso é coberto pelo splash
  }

  return (
    // [5] Chamar a função de layout no provider raiz
    <SafeAreaProvider
      initialMetrics={initialWindowMetrics}
      onLayout={onLayoutRootView}
    >
      <AlunosProvider>
        <VeiculosProvider>
          <LembretesProvider>
            <ParadasProvider>
              <ViagemProvider>
                <NavigationContainer>
                  <Stack.Navigator
                    initialRouteName={initialRoute}
                    screenOptions={{
                      headerShown: false,
                      cardStyleInterpolator:
                        CardStyleInterpolators.forHorizontalIOS,
                    }}
                  >
                    <Stack.Screen name="Cadastro" component={CadastroScreen} />
                    <Stack.Screen name="Veiculos" component={VeiculosScreen} />
                    <Stack.Screen name="Inicial" component={InicialScreen} />
                    <Stack.Screen name="Alunos" component={AlunosScreen} />
                    <Stack.Screen
                      name="Mensalidades"
                      component={MensalidadesScreen}
                    />
                    <Stack.Screen name="Lembretes" component={LembretesScreen} />
                    <Stack.Screen name="Rota" component={RotaScreen} />
                    <Stack.Screen
                      name="NovaViagem"
                      component={NovaViagemScreen}
                    />
                    <Stack.Screen
                      name="ViagemAtiva"
                      component={ViagemAtivaScreen}
                    />
                    <Stack.Screen
                      name="ListaPresenca"
                      component={ListaPresencaScreen}
                    />
                    <Stack.Screen
                      name="HistoricoViagens"
                      component={HistoricoViagensScreen}
                    />
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
    </SafeAreaProvider>
  );
}