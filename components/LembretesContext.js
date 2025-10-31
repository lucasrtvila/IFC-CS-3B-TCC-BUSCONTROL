import React, { createContext, useState, useEffect } from "react";
import { Alert, Platform } from "react-native";
import * as Notifications from "expo-notifications";
import * as Device from "expo-device";
import {
  initDB,
  getLembretes,
  salvarLembrete,
  editLembrete,
  removeLembrete,
} from "../database/database";

export const LembretesContext = createContext();

// --- INÍCIO: Funções Auxiliares ---
// Funções para formatar Data/Hora para o DB
function formatarData(data) {
  if (!data) return "";
  const dia = data.getDate().toString().padStart(2, "0");
  const mes = (data.getMonth() + 1).toString().padStart(2, "0");
  const ano = data.getFullYear();
  return `${dia}/${mes}/${ano}`;
}

function formatarHora(data) {
  if (!data) return "";
  const hora = data.getHours().toString().padStart(2, "0");
  const min = data.getMinutes().toString().padStart(2, "0");
  return `${hora}:${min}`;
}

// Configura o handler de notificações
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

// Função para pedir permissão
async function registerForPushNotificationsAsync() {
  let token;
  if (Device.isDevice) {
    const { status: existingStatus } =
      await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== "granted") {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    if (finalStatus !== "granted") {
      Alert.alert(
        "Permissão Necessária",
        "É necessário permitir as notificações para que os lembretes funcionem."
      );
      return;
    }
    // Configurações para Android
    if (Platform.OS === "android") {
      await Notifications.setNotificationChannelAsync("default", {
        name: "default",
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: "#FF231F7C",
      });
    }
  } else {
    // Alert.alert("Aviso", "Notificações não funcionam em simulador.");
    console.log("Notificações não funcionam em simulador.");
  }

  return token;
}
// --- FIM: Funções Auxiliares ---

export const LembretesProvider = ({ children }) => {
  const [lembretes, setLembretes] = useState([]);
  const [dbPronto, setDbPronto] = useState(false);

  // Carrega os lembretes do banco e pede permissão ao iniciar
  useEffect(() => {
    (async () => {
      await initDB();
      setDbPronto(true);
      await carregarLembretes();
      // Pede permissão de notificação
      await registerForPushNotificationsAsync();
    })();
  }, []);

  const carregarLembretes = async () => {
    const lista = await getLembretes();
    setLembretes(lista);
  };

  const adicionarLembrete = async (titulo, triggerDate) => {
    try {
      // 1. Agendar a notificação
      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title: "Lembrete BusControl",
          body: titulo,
        },
        trigger: triggerDate,
      });

      // 2. Formatar dados para o DB
      const dataStr = formatarData(triggerDate);
      const horaStr = formatarHora(triggerDate);

      // 3. Salvar no DB (incluindo o ID da notificação)
      await salvarLembrete(titulo, dataStr, horaStr, notificationId);
      await carregarLembretes();
    } catch (e) {
      console.error("Erro ao agendar ou salvar lembrete:", e);
      Alert.alert("Erro", "Não foi possível salvar o lembrete.");
    }
  };

  const editarLembrete = async (id, novoTitulo, novoTriggerDate) => {
    try {
      // 1. Encontrar o lembrete antigo para pegar o ID da notificação
      const lembreteAntigo = lembretes.find((l) => l.id === id);
      if (lembreteAntigo && lembreteAntigo.notificationId) {
        // 2. Cancelar a notificação antiga
        await Notifications.cancelScheduledNotificationAsync(
          lembreteAntigo.notificationId
        );
      }

      // 3. Agendar a nova notificação
      const newNotificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title: "Lembrete BusControl (Atualizado)",
          body: novoTitulo,
        },
        trigger: novoTriggerDate,
      });

      // 4. Formatar dados para o DB
      const novaDataStr = formatarData(novoTriggerDate);
      const novaHoraStr = formatarHora(novoTriggerDate);

      // 5. Atualizar no DB
      await editLembrete(
        id,
        novoTitulo,
        novaDataStr,
        novaHoraStr,
        newNotificationId
      );
      await carregarLembretes();
    } catch (e) {
      console.error("Erro ao editar lembrete:", e);
      Alert.alert("Erro", "Não foi possível atualizar o lembrete.");
    }
  };

  const removerLembrete = (id) => {
    Alert.alert(
      "Confirmar remoção",
      "Deseja realmente remover este lembrete?",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Remover",
          style: "destructive",
          onPress: async () => {
            try {
              // 1. Encontrar o lembrete para pegar o ID da notificação
              const lembrete = lembretes.find((l) => l.id === id);
              if (lembrete && lembrete.notificationId) {
                // 2. Cancelar a notificação agendada
                await Notifications.cancelScheduledNotificationAsync(
                  lembrete.notificationId
                );
              }
              // 3. Remover do DB
              await removeLembrete(id);
              await carregarLembretes();
            } catch (e) {
              console.error("Erro ao remover lembrete:", e);
              Alert.alert("Erro", "Não foi possível remover o lembrete.");
            }
          },
        },
      ]
    );
  };

  return (
    <LembretesContext.Provider
      value={{ lembretes, adicionarLembrete, editarLembrete, removerLembrete }}
    >
      {children}
    </LembretesContext.Provider>
  );
};