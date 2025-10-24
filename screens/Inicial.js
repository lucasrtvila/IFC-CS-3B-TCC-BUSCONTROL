import React, { useContext, useState, useEffect } from "react";
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

import { VeiculosContext } from "../components/VeiculosContext";
import { LembretesContext } from "../components/LembretesContext";
import { ViagemContext } from "../components/ViagemContext";
import { AlunosContext } from "../components/AlunosContext"; // Importar AlunosContext

import { getUsuario } from "../database/database"; // Manter getUsuario

import Texto from "../components/Texto";
import BarraNavegacao from "../components/BarraNavegacao"; // Mantenha a importação
import Header from "../components/Header";

const { width, height } = Dimensions.get("window");

// Manter formatarData
function formatarData(data) {
  if (!data) return "";
    const dia = data.getUTCDate().toString().padStart(2, "0"); // Usar getUTCDate
    const mes = (data.getUTCMonth() + 1).toString().padStart(2, "0"); // Usar getUTCMonth
    const ano = data.getUTCFullYear(); // Usar getUTCFullYear
  return `${dia}/${mes}/${ano}`;
}

export default function Inicial({ navigation }) {
  const [usuario, setUsuario] = useState(null);
  const [localizacao, setLocalizacao] = useState("Buscando...");
  const [saudacao, setSaudacao] = useState("");

  const { veiculos } = useContext(VeiculosContext);
  const { lembretes } = useContext(LembretesContext);
  const { viagemDeVoltaPendente } = useContext(ViagemContext);
  // --- USAR VALORES DO ALUNOSCONTEXT ---
  const { valorMensalidade, dataVencimento } = useContext(AlunosContext);

  useEffect(() => {
    const hora = new Date().getHours();
    if (hora >= 5 && hora < 12) setSaudacao("Bom dia, ");
    else if (hora >= 12 && hora < 18) setSaudacao("Boa tarde, ");
    else setSaudacao("Boa noite, ");
  }, []);

 // --- MANTER USEEFFECT PARA USUARIO ---
 useEffect(() => {
    async function carregarUsuario() {
      try {
        const usuarioDB = await getUsuario();
        setUsuario(usuarioDB);
      } catch (error) {
        console.error("Erro ao buscar usuário:", error);
      }
    }
    carregarUsuario();
  }, []); // Executa só uma vez ao montar


  useEffect(() => {
    const obterLocalizacao = async () => {
       try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== "granted") {
          setLocalizacao("Permissão negada");
          return;
        }

        const location = await Location.getCurrentPositionAsync({});
        const [address] = await Location.reverseGeocodeAsync(location.coords);

        if (address) {
          const cidade =
            address.city || address.subregion || "Cidade desconhecida";
          const estado = address.region || "";
          setLocalizacao(`${cidade} - ${estado}`);
        } else {
          setLocalizacao("Local não encontrado");
        }
      } catch (error) {
        setLocalizacao("Erro ao obter localização");
      }
    };
    obterLocalizacao();
  }, []);

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
      <View style={styles.safeArea}>
        <View style={styles.container}>
          <Header style={styles.header} navigation={navigation} />
          <Texto style={styles.boasVindas}>
            {saudacao}
            <Texto style={styles.nome}>{usuario?.nome || "Usuário"}</Texto>
          </Texto>

          <View style={styles.cardsContainer}>
            <TouchableOpacity style={styles.card}>
              <View style={styles.cardCenterContent}>
                <Texto style={styles.cardTitle}>Você está em</Texto>
                <Texto style={styles.cardTextBold}>{localizacao}</Texto>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.card}
              onPress={navegarParaMensalidades}
            >
              <View style={styles.cardCenterContent}>
                <Texto style={styles.cardTitle}>Mensalidades</Texto>
                <Texto style={styles.cardTextBold}>
                  {/* Usa valorMensalidade do contexto */}
                  Valor atual: R$ {parseFloat(valorMensalidade || 0).toFixed(2)}
                </Texto>
                 <Texto style={styles.cardSub}>
                    {/* Usa dataVencimento do contexto */}
                    Vencimento: {formatarData(dataVencimento)}
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

         {/* Adicione a BarraNavegacao de volta aqui */}
        <BarraNavegacao navigation={navigation} abaAtiva="Inicial" />
      </View>
    </>
  );
}

// Estilos (mantidos)
const styles = StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: "#050a24",
      paddingTop: 30,
      // Remova paddingVertical: 30 se a BarraNavegacao ficar por cima
    },
    header: {
      top: -10,
    },
    container: {
      flex: 1,
      paddingHorizontal: width > 768 ? width * 0.1 : 16,
      alignItems: "center",
      justifyContent: "space-between", // Ajuste se necessário
      // Remova marginBottom: 20 se a BarraNavegacao ficar por cima
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
});