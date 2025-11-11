import React, { useContext, useState, useEffect, useCallback } from "react";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Image,
  Alert,
  Dimensions,
  StatusBar,
  Platform,
} from "react-native";
import * as Location from "expo-location";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFocusEffect } from "@react-navigation/native";

import { VeiculosContext } from "../components/VeiculosContext";
import { LembretesContext } from "../components/LembretesContext";
import { ViagemContext } from "../components/ViagemContext";
import { AlunosContext } from "../components/AlunosContext";

import { getUsuario, getMensalidade } from "../database/database";
import Texto from "../components/Texto";
import BarraNavegacao from "../components/BarraNavegacao";
import Header from "../components/Header";

const { width, height } = Dimensions.get("window");

function formatarData(data) {
  if (!data) return "";
  const dia = data.getDate().toString().padStart(2, "0");
  const mes = (data.getMonth() + 1).toString().padStart(2, "0");
  const ano = data.getFullYear();
  return `${dia}/${mes}/${ano}`;
}

export default function Inicial({ navigation }) {
  // [1] Estado de saudação (rápido, síncrono)
  const [saudacao, setSaudacao] = useState("");

  // [2] Combinar estados que carregam assincronamente
  const [dadosTela, setDadosTela] = useState({
    usuario: null,
    localizacao: "Buscando...",
    valorMensalidade: "0",
    dataVencimento: new Date(),
  });
  const [isLoading, setIsLoading] = useState(true);

  // [3] Contextos (já são gerenciados pelos providers)
  const { veiculos } = useContext(VeiculosContext);
  const { lembretes } = useContext(LembretesContext);
  const { viagemDeVoltaPendente } = useContext(ViagemContext);
  const { valorMensalidade, dataVencimento, resetMesParaAtual } = useContext(AlunosContext);

  useFocusEffect(
    useCallback(() => {
      // Chama a função do contexto para recalcular e definir o mês atual
      if (resetMesParaAtual) {
        resetMesParaAtual();
      }
    }, [resetMesParaAtual]) // A dependência é a própria função
  );
  
  // [4] useEffect para saudação (rápido, pode ficar separado)
  useEffect(() => {
    const hora = new Date().getHours();
    if (hora >= 5 && hora < 12) setSaudacao("Bom dia, ");
    else if (hora >= 12 && hora < 18) setSaudacao("Boa tarde, ");
    else setSaudacao("Boa noite, ");
  }, []);

  // [5] NOVO useEffect combinado para carregar dados do banco e localização
  useEffect(() => {
    async function carregarTodosDados() {
      setIsLoading(true);
      try {
        // 1. Pedir permissão de localização
        const { status } = await Location.requestForegroundPermissionsAsync();

        // 2. Iniciar buscas assíncronas
        const promessas = [getUsuario(), getMensalidade()];

        if (status === "granted") {
          promessas.push(Location.getCurrentPositionAsync({}));
        } else {
          promessas.push(Promise.resolve(null)); // Adiciona null se não houver permissão
        }

        // 3. Aguardar todas as buscas
        const [usuarioDB, mensalidadeBanco, location] = await Promise.all(
          promessas
        );

        // 4. Processar resultados
        let locFormatada = "Permissão negada";
        if (location) {
          try {
            const [address] = await Location.reverseGeocodeAsync(location.coords);
            if (address) {
              const cidade =
                address.city || address.subregion || "Cidade desconhecida";
              const estado = address.region || "";
              locFormatada = `${cidade} - ${estado}`;
            } else {
              locFormatada = "Local não encontrado";
            }
          } catch (geoError) {
             locFormatada = "Erro ao geocodificar";
          }
        }

        let valMensalidade = "380.00";
        let dataVenc = new Date();
        if (mensalidadeBanco) {
          valMensalidade = mensalidadeBanco.valor.toFixed(2);
          const parts = mensalidadeBanco.dataVencimento.split("-");
          if (parts.length === 3) {
            dataVenc = new Date(
              parseInt(parts[0], 10),
              parseInt(parts[1], 10) - 1,
              parseInt(parts[2], 10)
            );
          }
        }

        // 5. Atualizar o estado UMA ÚNICA VEZ
        setDadosTela({
          usuario: usuarioDB,
          localizacao: locFormatada,
          valorMensalidade: valMensalidade,
          dataVencimento: dataVenc,
        });
      } catch (error) {
        console.error("Erro ao buscar dados:", error);
        setDadosTela((prev) => ({
          ...prev,
          localizacao: "Erro ao obter dados",
        }));
      } finally {
        setIsLoading(false);
      }
    }
    carregarTodosDados();
  }, []);

  // [6] useEffects que dependem de CONTEXTO (permanecem)
  // Eles atualizam o estado se o valor do *contexto* mudar
  useEffect(() => {
    if (valorMensalidade != null) {
      setDadosTela((prev) => ({
        ...prev,
        valorMensalidade: parseFloat(valorMensalidade).toFixed(2),
      }));
    }
  }, [valorMensalidade]);

  useEffect(() => {
    if (dataVencimento) {
      setDadosTela((prev) => ({
        ...prev,
        dataVencimento: new Date(dataVencimento),
      }));
    }
  }, [dataVencimento]);

  // [Os useEffects antigos 'carregarDados' e 'obterLocalizacao' foram removidos]

  const navegarParaMensalidades = () => {
    navigation.navigate("Mensalidades");
  };

  const handleBotaoPrincipal = () => {
    if (viagemDeVoltaPendente) {
      navigation.navigate("ListaPresenca");
    } else {
      navigation.navigate("NovaViagem");
    }
  };

  return (
    <>
      <StatusBar barStyle="light-content" backgroundColor="#0A0E21" />
      <SafeAreaView style={styles.safeArea} edges={['bottom', 'left', 'right']}>
        <View style={styles.container}>
          <Header style={styles.header} navigation={navigation} />
          {/* [7] Usar os novos estados 'dadosTela' */}
          <Texto style={styles.boasVindas}>
            {saudacao}
            <Texto style={styles.nome}>
              {dadosTela.usuario?.nome || "Usuário"}
            </Texto>
          </Texto>

          <View style={styles.cardsContainer}>
            <TouchableOpacity style={styles.card}>
              <View style={styles.cardCenterContent}>
                <Texto style={styles.cardTitle}>Você está em</Texto>
                <Texto style={styles.cardTextBold}>
                  {dadosTela.localizacao}
                </Texto>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.card}
              onPress={navegarParaMensalidades}
            >
              <View style={styles.cardCenterContent}>
                <Texto style={styles.cardTitle}>Mensalidades</Texto>
                <Texto style={styles.cardTextBold}>
                  Valor atual: R$ {dadosTela.valorMensalidade}
                </Texto>
                <Texto style={styles.cardSub}>
                  Vencimento: {formatarData(dadosTela.dataVencimento)}
                </Texto>
                <Texto style={styles.cardSub}>Toque para gerenciar</Texto>
              </View>
            </TouchableOpacity>
          </View>

          <View style={styles.grid}>
            <TouchableOpacity
              style={styles.miniCard}
              onPress={() => navigation.navigate("Veiculos")}
            >
              <Texto style={styles.cardTitle}>Veículos</Texto>
              {veiculos.length === 0 ? (
                <Texto style={styles.miniText}>Nenhum veículo registrado</Texto>
              ) : (
                veiculos.slice(0, 3).map((v) => (
                  <View key={v.id} style={{ marginBottom: 6 }}>
                    <Texto style={styles.miniText} numberOfLines={1}>
                      {v.nome}
                    </Texto>
                    <Texto
                      style={
                        v.status === "Ativo"
                          ? styles.statusAtivo
                          : styles.statusManutencao
                      }
                    >
                      {v.status}
                    </Texto>
                  </View>
                ))
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.miniCard}
              onPress={() => navigation.navigate("Lembretes")}
            >
              <Texto style={styles.cardTitle}>Lembretes</Texto>
              {lembretes.length === 0 ? (
                <Texto style={styles.miniText}>
                  Nenhum lembrete registrado
                </Texto>
              ) : (
                lembretes.slice(0, 3).map((l) => (
                  <View key={l.id} style={{ marginBottom: 6 }}>
                    <Texto style={styles.miniText} numberOfLines={1}>
                      {l.titulo}
                    </Texto>
                    <Texto style={{ color: "#AAB1C4", fontSize: 12 }}>
                      {l.data} - {l.hora}
                    </Texto>
                  </View>
                ))
              )}
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={styles.botaoPrincipal}
            onPress={handleBotaoPrincipal}
          >
            <Texto style={styles.botaoText}>
              {viagemDeVoltaPendente ? "Iniciar Volta" : "Nova Viagem"}
            </Texto>
          </TouchableOpacity>
        </View>

        <BarraNavegacao navigation={navigation} abaAtiva="Inicial" />
      </SafeAreaView>
    </>
  );
}

// [Os estilos permanecem os mesmos]
const styles = StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: "#050a24",
    },
    header: {
      top: 15,
      marginBottom: 15,
    },
    container: {
      flex: 1,
      paddingHorizontal: width > 768 ? width * 0.1 : 16,
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: 20,
    },
    boasVindas: {
      color: "white",
      fontSize: width > 768 ? 24 : 20,
      textAlign: "center",
      top: -25,
    },
    nome: {
      fontWeight: "bold",
    },
    cardsContainer: {
      gap: 18,
      width: "100%",
    },
    card: {
      backgroundColor: "#1c2337",
      borderRadius: 16,
      paddingVertical: height * 0.02,
      paddingHorizontal: width * 0.04,
      justifyContent: "center",
    },
    cardCenterContent: {
      alignItems: "center",
    },
    cardTitle: {
      color: "white",
      fontSize: 16,
      marginBottom: 2,
      textAlign: "center",
    },
    cardTextBold: {
      color: "white",
      fontSize: 16,
      fontWeight: "bold",
      marginBottom: 2,
    },
    cardSub: {
      color: "#AAB1C4",
      fontSize: 14,
      marginTop: 2,
    },
    grid: {
      flexDirection: "row",
      justifyContent: "space-between",
      gap: 12,
      width: "100%",
    },
    miniCard: {
      backgroundColor: "#1c2337",
      borderRadius: 16,
      padding: 12,
      flex: 1,
      minHeight: height * 0.23,
    },
    miniText: {
      color: "#AAB1C4",
      fontSize: 16,
    },
    statusAtivo: {
      color: "limegreen",
      fontSize: 12,
    },
    statusManutencao: {
      color: "orange",
      fontSize: 12,
    },
    botaoPrincipal: {
      backgroundColor: "#0B49C1",
      paddingVertical: width > 768 ? 20 : 16,
      borderRadius: 16,
      alignItems: "center",
      width: "100%",
      marginTop: 20,
    },
    botaoText: {
      color: "white",
      fontSize: width > 768 ? 24 : 20,
      fontWeight: "bold",
    },
     modalButtons: {
      flexDirection: "row",
      marginTop: 20,
      gap: 10,
    },
    modalButton: { 
      flex: 1,
      paddingVertical: 16,
      borderRadius: 16,
      alignItems: "center",
    },
    saveButton: { 
      backgroundColor: "#0B49C1",
    },
    cancelButton: { 
      backgroundColor: "#373e4f",
    },
    modalButtonText: { 
      color: "white",
      fontSize: 18,
      fontWeight: "bold",
    },
});