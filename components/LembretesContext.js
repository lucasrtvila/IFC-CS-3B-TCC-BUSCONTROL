import React, { createContext, useState } from "react";
import { Alert } from "react-native";

export const LembretesContext = createContext();

export const LembretesProvider = ({ children }) => {
  const [lembretes, setLembretes] = useState([]);

  const adicionarLembrete = (titulo, data) => {
    setLembretes((prev) => [...prev, { titulo, data }]); //prev: pega a versao mais atualizada da lista, ...prev copia tudo que ja tava la e no final adiciona um novo titulo e data(lembrete)
  };

  const editarLembrete = (index, novoTitulo, novaData) => {
    //editarLembretes vai receber o index do lembrete a ser editado, seu novo titulo e sua nova data como parametro
    const atualizados = [...lembretes]; // a array atualizados vai receber o que ja estava antes em lembretes, como uma duplicacao de variavel por seguranca
    atualizados[index] = { titulo: novoTitulo, data: novaData }; // dentro da array atualizados, no index fornecido la em cima, a propriedade titulo ou data podem receber os novos valores fornecidos la em cima tbm
    setLembretes(atualizados);
  };

  const removerLembrete = (index) => {
    // a funcao de remover vai pedir so o index pra achar o lembrete certo pra excluir né...
    Alert.alert(
      "Confirmar remoção",
      "Deseja realmente remover este lembrete?",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Remover",
          style: "destructive",
          onPress: () => {
            setLembretes((prev) => prev.filter((_, i) => i !== index));
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
