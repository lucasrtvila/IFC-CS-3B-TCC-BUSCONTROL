import React, { useEffect, useState } from "react";
import { NavigationContainer } from "@react-navigation/native";
// Importe o CardStyleInterpolators
import {
  createStackNavigator,
  CardStyleInterpolators,
} from "@react-navigation/stack";
import { useFonts } from "expo-font";

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
  // --- ATUALIZADO: Importações para Regra 3 ---
  getMensalidade,
  salvarMensalidade,
  calcularProximoVencimento,
  // --- FIM DA ATUALIZAÇÃO ---
} from "./database/database";

const Stack = createStackNavigator();

// --- ATUALIZADO (1/3): Função helper copiada do AlunosContext ---
function parseDataISO(dataString) {
    if (!dataString || typeof dataString !== 'string') return null;
    const parts = dataString.split('-');
    if (parts.length === 3) {
      // Cria a data em UTC
      return new Date(Date.UTC(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10)));
    }
    return null;
}

// --- ATUALIZADO (2/3): Lógica da Regra 3 (Renovação Automática) ---
async function verificarEAtualizarVencimento() {
  console.log("Verificando data de vencimento...");
  try {
    const config = await getMensalidade();
    if (config && config.dataVencimento) {
      const dataVencObj = parseDataISO(config.dataVencimento);
      const hoje = new Date();
      
      // Ajusta 'hoje' para o início do dia (meia-noite) para comparação
      hoje.setHours(0, 0, 0, 0);

      // Se a data de vencimento armazenada (em UTC) for anterior a hoje
      if (dataVencObj && dataVencObj < hoje) {
        console.log(`Data de vencimento antiga (${config.dataVencimento}) ultrapassada.`);
        // Calcula a próxima data de vencimento
        const proximoVencimentoISO = calcularProximoVencimento(config.dataVencimento);
        // Salva a nova data no banco
        await salvarMensalidade(config.valor, proximoVencimentoISO);
        console.log(`✅ Data de vencimento atualizada para: ${proximoVencimentoISO}`);
      } else {
        console.log("Data de vencimento ainda válida.");
      }
    } else {
        console.log("Nenhuma configuração de mensalidade encontrada para verificar.");
    }
  } catch (error) {
    console.error("Erro ao verificar/atualizar data de vencimento:", error);
  }
}
// --- FIM DA ATUALIZAÇÃO ---


export default function App() {
  const [initialRoute, setInitialRoute] = useState(null);
  const [dbReady, setDbReady] = useState(false);

  useEffect(() => {
    async function setupDB() {
      try {
        await initDB();
        await migrateDatabase();
        // --- ATUALIZADO (3/3): Chama a verificação de vencimento ---
        await verificarEAtualizarVencimento();
        // --- FIM DA ATUALIZAÇÃO ---
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
                  // Adicione screenOptions aqui
                  screenOptions={{
                    headerShown: false,
                    // Define a animação de transição para todas as telas
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
  );
}