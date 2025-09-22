import React, { createContext, useState, useEffect } from "react";
import { Alert } from "react-native";
import {
  initDB,
  getLembretes,
  salvarLembrete,
  editLembrete,
  removeLembrete,
} from "../database/database";

export const LembretesContext = createContext();

export const LembretesProvider = ({ children }) => {
  const [lembretes, setLembretes] = useState([]);
  const [dbPronto, setDbPronto] = useState(false);

  // Carrega os lembretes do banco ao iniciar
  useEffect(() => {
    (async () => {
      await initDB();
      setDbPronto(true);
      await carregarLembretes();
    })();
  }, []);

  const carregarLembretes = async () => {
      const lista = await getLembretes();
      setLembretes(lista);
    };


  const adicionarLembrete = async (titulo, data, hora = null) => {
    await salvarLembrete(titulo, data, hora);
    const lista = await getLembretes();
    setLembretes(lista);
  };

  const editarLembrete = async (id, novoTitulo, novaData, novaHora = null) => {
    await editLembrete(id, novoTitulo, novaData, novaHora);
    const lista = await getLembretes();
    setLembretes(lista);
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
            await removeLembrete(id);
            const lista = await getLembretes();
            setLembretes(lista);
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