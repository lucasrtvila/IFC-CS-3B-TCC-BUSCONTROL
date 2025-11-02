import React, { useState, useEffect, useContext } from "react";
import {
  View,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  StatusBar,
  FlatList,
  Modal,
  Alert,
} from "react-native";
import Texto from "../components/Texto";
import Header from "../components/Header";
import { ViagemContext } from "../components/ViagemContext";
import { AlunosContext } from "../components/AlunosContext";
import { addViagem, updateDuracaoVolta } from "../database/database";

const { width } = Dimensions.get("window");

export default function ViagemAtivaScreen({ route, navigation }) {
  const {
    destino,
    horarioFinal,
    paradasDaViagem,
    veiculoId,
    tipoViagem,
    alunosSelecionadosIds,
    historicoIdOriginal,
  } = route.params;

  const { salvarViagemComoTemplate, limparTemplate } = useContext(ViagemContext);
  const { alunos: todosOsAlunos } = useContext(AlunosContext);

  const [duracao, setDuracao] = useState(0);
  const [modalAlunosVisivel, setModalAlunosVisivel] = useState(false);
  const [alunosNaParada, setAlunosNaParada] = useState([]);
  const [paradaSelecionadaNome, setParadaSelecionadaNome] = useState("");
  const [paradaSelecionadaId, setParadaSelecionadaId] = useState(null);
  const [paradasAtivas, setParadasAtivas] = useState(paradasDaViagem || []);

  const [alunosEmbarcadosNaIda, setAlunosEmbarcadosNaIda] = useState({});
  const [alunosSelecionadosNaParadaTemp, setAlunosSelecionadosNaParadaTemp] =
    useState(new Set());

  const [alunosNaVolta, setAlunosNaVolta] = useState([]);

  useEffect(() => {
    if (tipoViagem === "volta") {
      const alunosFiltrados = todosOsAlunos.filter((aluno) =>
        alunosSelecionadosIds.includes(aluno.id)
      );
      const alunosFormatados = alunosFiltrados
        .map((aluno) => ({
          id: aluno.id,
          nome: aluno.nome,
          paradaOriginalId: aluno.paradaId,
          desembarcou: false,
        }))
        .sort((a, b) => {
          const paradaA = paradasDaViagem?.find(
            (p) => p.id === a.paradaOriginalId
          );
          const paradaB = paradasDaViagem?.find(
            (p) => p.id === b.paradaOriginalId
          );
          if (paradaA?.horario && paradaB?.horario) {
            return paradaB.horario.localeCompare(paradaA.horario);
          }
          return a.nome.localeCompare(b.nome);
        });

      setAlunosNaVolta(alunosFormatados);
      setParadasAtivas([]);
    } else {
      setAlunosEmbarcadosNaIda({});
      setParadasAtivas(paradasDaViagem || []);
      setAlunosNaVolta([]);
    }
  }, [tipoViagem, alunosSelecionadosIds, todosOsAlunos, paradasDaViagem]);

  useEffect(() => {
    const timer = setInterval(() => {
      setDuracao((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatarDuracao = (totalSegundos) => {
    const minutos = Math.floor(totalSegundos / 60)
      .toString()
      .padStart(2, "0");
    const segundos = (totalSegundos % 60).toString().padStart(2, "0");
    return `${minutos}:${segundos}`;
  };
  const handleEncerramento = async () => {
    const titulo = "Confirmar Encerramento";
    const mensagem =
      tipoViagem === "ida_e_volta"
        ? "Deseja realmente encerrar a viagem de IDA?"
        : "Deseja realmente encerrar a viagem?";

    Alert.alert(
      titulo,
      mensagem,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Encerrar",
          style: "destructive",
          onPress: async () => {
            const duracaoFormatada = formatarDuracao(duracao);
            const dataViagem = new Date().toLocaleDateString("pt-BR");

            let historicoId = null;

            if (tipoViagem !== "volta") {
              try {
                const alunosQueEmbarcaramIds = new Set();
                Object.values(alunosEmbarcadosNaIda).forEach((idsDaParada) => {
                  idsDaParada.forEach((id) => alunosQueEmbarcaramIds.add(id));
                });
                const alunosQueEmbarcaramNomes = todosOsAlunos
                  .filter((aluno) => alunosQueEmbarcaramIds.has(aluno.id))
                  .map((aluno) => aluno.nome);

                const result = await addViagem(
                  dataViagem,
                  destino,
                  duracaoFormatada,
                  veiculoId,
                  alunosQueEmbarcaramNomes,
                  tipoViagem
                );
                historicoId = result.lastInsertRowId;
                console.log(
                  `Viagem tipo '${tipoViagem}' salva com ID: ${historicoId}`
                );
              } catch (error) {
                console.error(
                  "Erro ao salvar viagem de IDA no histórico:",
                  error
                );
                Alert.alert(
                  "Erro",
                  "Não foi possível salvar a viagem de ida no histórico."
                );
              }
            } else {
              if (historicoIdOriginal) {
                try {
                  await updateDuracaoVolta(
                    historicoIdOriginal,
                    duracaoFormatada
                  );
                  console.log(
                    `Duração da volta (${duracaoFormatada}) salva para histórico ID: ${historicoIdOriginal}`
                  );
                } catch (error) {
                  console.error(
                    "Erro ao salvar duração da volta no histórico:",
                    error
                  );
                  Alert.alert(
                    "Erro",
                    "Não foi possível salvar a duração da volta no histórico."
                  );
                }
              } else {
                console.warn(
                  "historicoIdOriginal não encontrado ao encerrar viagem de volta."
                );
              }
            }

            if (tipoViagem === "ida_e_volta") {
              if (historicoId !== null) {
                const alunosQueEmbarcaramIdsArray = Array.from(
                  Object.values(alunosEmbarcadosNaIda).reduce((acc, ids) => {
                    ids.forEach((id) => acc.add(id));
                    return acc;
                  }, new Set())
                );
                const template = {
                  destino,
                  veiculoId,
                  alunosSelecionadosIds: alunosQueEmbarcaramIdsArray,
                  tipoViagem,
                  historicoId,
                };
                salvarViagemComoTemplate(template);
              } else if (tipoViagem !== "volta") {
                console.error(
                  "Erro crítico: historicoId é nulo ao tentar salvar template para ida_e_volta."
                );
                Alert.alert(
                  "Erro",
                  "Ocorreu um problema ao registrar a viagem de ida para habilitar a volta."
                );
                limparTemplate();
                navigation.navigate("Inicial");
                return;
              }
            } else {
              limparTemplate();
            }

            navigation.navigate("Inicial");
          },
        },
      ]
    );
  };

  const verAlunosDaParada = (parada) => {
    setAlunosNaParada(parada.alunos || []);
    setParadaSelecionadaNome(parada.nome);
    setParadaSelecionadaId(parada.id);
    setAlunosSelecionadosNaParadaTemp(
      new Set(alunosEmbarcadosNaIda[parada.id] || [])
    );
    setModalAlunosVisivel(true);
  };

  const toggleAlunoSelecaoIda = (alunoId) => {
    setAlunosSelecionadosNaParadaTemp((prevSet) => {
      const newSet = new Set(prevSet);
      if (newSet.has(alunoId)) {
        newSet.delete(alunoId);
      } else {
        newSet.add(alunoId);
      }
      return newSet;
    });
  };

  const handleConcluirParada = () => {
    const todosSelecionados =
      alunosNaParada.length > 0 &&
      alunosSelecionadosNaParadaTemp.size === alunosNaParada.length;
    let mensagemConfirmacao =
      "Confirmar os alunos selecionados para esta parada?";

    if (!todosSelecionados && alunosNaParada.length > 0) {
      const faltantes =
        alunosNaParada.length - alunosSelecionadosNaParadaTemp.size;
      mensagemConfirmacao = `Faltam ${faltantes} ${
        faltantes > 1 ? "alunos" : "aluno"
      }. Deseja confirmar mesmo assim?`;
    } else if (
      alunosSelecionadosNaParadaTemp.size === 0 &&
      alunosNaParada.length > 0
    ) {
      mensagemConfirmacao =
        "Nenhum aluno selecionado. Deseja confirmar a parada como vazia?";
    } else if (alunosNaParada.length === 0) {
      mensagemConfirmacao =
        "Nenhum aluno esperado nesta parada. Deseja marcar a parada como concluída?";
    }

    Alert.alert(
      "Concluir Parada",
      mensagemConfirmacao,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Confirmar",
          style: "default",
          onPress: () => {
            setAlunosEmbarcadosNaIda((prevState) => ({
              ...prevState,
              [paradaSelecionadaId]: Array.from(
                alunosSelecionadosNaParadaTemp
              ),
            }));

            setParadasAtivas((prevParadas) =>
              prevParadas.filter((p) => p.id !== paradaSelecionadaId)
            );
            setModalAlunosVisivel(false);
            setAlunosSelecionadosNaParadaTemp(new Set());
            setParadaSelecionadaId(null);
            setParadaSelecionadaNome("");
            setAlunosNaParada([]);
          },
        },
      ]
    );
  };

  const confirmarDesembarque = (alunoId) => {
    setAlunosNaVolta((prevState) =>
      prevState.map((aluno) =>
        aluno.id === alunoId ? { ...aluno, desembarcou: true } : aluno
      )
    );
  };

  const handleEntregarClick = (aluno) => {
    Alert.alert(
      "Confirmar Entrega",
      `Tem certeza que deseja marcar "${aluno.nome}" como entregue?`,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Entregar",
          style: "default",
          onPress: () => confirmarDesembarque(aluno.id),
        },
      ]
    );
  };

  const renderParadaIda = ({ item }) => (
    <TouchableOpacity
      style={styles.cardParada}
      onPress={() => verAlunosDaParada(item)}
    >
      <View style={styles.cardParadaEsquerda}>
        <Texto style={styles.nomeParada}>{item.nome}</Texto>
        <Texto style={styles.verAlunos}>
          Confirmar alunos ({item.alunos?.length ?? 0})
        </Texto>
      </View>
      <View style={styles.cardParadaDireita}>
        <Texto style={styles.horaPrevLabel}>Hora Prev.</Texto>
        <Texto style={styles.horaPrevValor}>{item.horario}</Texto>
      </View>
    </TouchableOpacity>
  );

  const renderAlunoVolta = ({ item }) => (
    <View style={styles.cardAlunoVoltaContainer}>
      <View style={styles.cardAlunoVoltaInfo}>
        <Texto style={styles.nomeAlunoVolta}>{item.nome}</Texto>
      </View>
      <TouchableOpacity
        style={styles.botaoEntregarAluno}
        onPress={() => handleEntregarClick(item)}
      >
        <Texto style={styles.botaoEntregarTexto}>Entregar</Texto>
      </TouchableOpacity>
    </View>
  );

  return (
    <>
      <StatusBar barStyle="light-content" backgroundColor="#0A0E21" />
      <View style={styles.container}>
        <Header navigation={navigation} />

        <View style={styles.content}>
          <Texto style={styles.titulo}>Viagem Ativa: {destino}</Texto>

          <View style={styles.metricasContainer}>
            <View style={styles.metricaBox}>
              <Texto style={styles.metricaLabel}>Duração</Texto>
              <Texto style={styles.metricaValor}>
                {formatarDuracao(duracao)}
              </Texto>
            </View>
            <View style={styles.metricaBox}>
              <Texto style={styles.metricaLabel}>
                {tipoViagem === "volta" ? "Alunos Rest." : "Cheg. Prev."}
              </Texto>
              <Texto style={styles.metricaValor}>
                {tipoViagem === "volta"
                  ? alunosNaVolta.filter((a) => !a.desembarcou).length
                  : horarioFinal}
              </Texto>
            </View>
          </View>

          {tipoViagem === "volta" ? (
            <>
              <Texto style={styles.subtitulo}>Alunos (Volta):</Texto>
              <FlatList
                data={alunosNaVolta.filter((aluno) => !aluno.desembarcou)}
                renderItem={renderAlunoVolta}
                keyExtractor={(item) => item.id.toString()}
                style={{ flex: 1 }}
                contentContainerStyle={{ paddingBottom: 10 }}
                ListEmptyComponent={
                  <View style={{ alignItems: "center", marginTop: 50 }}>
                    <Texto style={{ color: "#AAB1C4", fontSize: 16 }}>
                      Todos os alunos foram entregues.
                    </Texto>
                  </View>
                }
              />
            </>
          ) : (
            <>
              <Texto style={styles.subtitulo}>Próx. Paradas (Ida):</Texto>
              <FlatList
                data={paradasAtivas}
                renderItem={renderParadaIda}
                keyExtractor={(item) => item.id.toString()}
                style={{ flex: 1 }}
                contentContainerStyle={{ paddingBottom: 10 }}
                ListEmptyComponent={
                  <View style={{ alignItems: "center", marginTop: 50 }}>
                    <Texto style={{ color: "#AAB1C4", fontSize: 16 }}>
                      Nenhuma parada restante.
                    </Texto>
                  </View>
                }
              />
            </>
          )}

          <TouchableOpacity
            style={styles.botaoEncerrar}
            onPress={handleEncerramento}
          >
            <Texto style={styles.botaoTexto}>
              {tipoViagem === "ida_e_volta" ? "Encerrar Ida" : "Encerrar Viagem"}
            </Texto>
          </TouchableOpacity>
        </View>

        <Modal visible={modalAlunosVisivel} animationType="fade" transparent>
          <View style={styles.modalFundo}>
            <View style={styles.modalBox}>
              <Texto style={styles.modalTitulo}>
                Confirmar Alunos em "{paradaSelecionadaNome}"
              </Texto>
              <FlatList
                data={alunosNaParada}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={[
                      styles.alunoItem,
                      alunosSelecionadosNaParadaTemp.has(item.id) &&
                        styles.alunoItemSelected,
                    ]}
                    onPress={() => toggleAlunoSelecaoIda(item.id)}
                    key={item.id}
                  >
                    <Texto style={styles.alunoItemText}>{item.nome}</Texto>
                  </TouchableOpacity>
                )}
                keyExtractor={(item) => item.id.toString()}
                style={styles.alunosList}
                ListEmptyComponent={
                  <Texto style={styles.semAlunosTexto}>
                    Nenhum aluno nesta parada.
                  </Texto>
                }
              />
              <View style={styles.botoesModalContainer}>
                <TouchableOpacity
                  style={[
                    styles.botaoModalAcao,
                    styles.botaoCancelarModal,
                  ]}
                  onPress={() => setModalAlunosVisivel(false)}
                >
                  <Texto style={styles.botaoModalTexto}>Cancelar</Texto>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.botaoModalAcao,
                    styles.botaoConcluirParada,
                  ]}
                  onPress={handleConcluirParada}
                >
                  <Texto style={styles.botaoModalTexto}>Concluir Parada</Texto>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#050a24",
    paddingHorizontal: 20,
    paddingTop: 30,
    paddingBottom: 20,
  },
  content: {
    flex: 1,
    justifyContent: "flex-start",
  },
  titulo: {
    color: "#246BFD",
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "center",
    marginVertical: 15,
    borderWidth: 1,
    borderColor: "#246BFD",
    paddingVertical: 8,
    borderRadius: 8,
  },
  metricasContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 20,
  },
  metricaBox: {
    backgroundColor: "#1c2337",
    borderRadius: 15,
    paddingVertical: 15,
    paddingHorizontal: 20,
    alignItems: "center",
    width: "45%",
  },
  metricaLabel: {
    color: "#AAB1C4",
    fontSize: 14,
    marginBottom: 5,
    textAlign: "center",
  },
  metricaValor: {
    color: "white",
    fontSize: 28,
    fontWeight: "bold",
  },
  subtitulo: {
    color: "white",
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 10,
  },
  cardParada: {
    backgroundColor: "#1c2337",
    borderRadius: 15,
    padding: 15,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  cardParadaEsquerda: {
    flex: 1,
    marginRight: 10,
  },
  nomeParada: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
  verAlunos: {
    color: "#AAB1C4",
    fontSize: 12,
    marginTop: 4,
  },
  cardParadaDireita: {
    alignItems: "flex-end",
  },
  horaPrevLabel: {
    color: "#AAB1C4",
    fontSize: 12,
  },
  horaPrevValor: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 4,
  },
  cardAlunoVoltaContainer: {
    backgroundColor: "#1c2337",
    borderRadius: 12,
    paddingVertical: 8,
    paddingHorizontal: 15,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  cardAlunoVoltaInfo: {
    flex: 1,
    marginRight: 10,
  },
  nomeAlunoVolta: {
    color: "white",
    fontSize: 16,
  },
  botaoEntregarAluno: {
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 8,
    marginLeft: 10,
    backgroundColor: "green",
  },
  botaoEntregarTexto: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
  },
  botaoEncerrar: {
    backgroundColor: "#c41628ff",
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: "center",
    marginTop: 15,
  },
  botaoTexto: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  modalFundo: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.7)",
  },
  modalBox: {
    backgroundColor: "#1c2337",
    borderRadius: 16,
    padding: 20,
    width: "90%",
    maxHeight: "80%",
  },
  modalTitulo: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 15,
  },
  alunosList: {
    maxHeight: Dimensions.get("window").height * 0.45,
    marginBottom: 15,
  },
  alunoItem: {
    padding: 12,
    backgroundColor: "#373e4f",
    borderRadius: 8,
    marginBottom: 8,
    borderLeftWidth: 4,
    borderLeftColor: "#c41628ff", 
  },
  alunoItemSelected: {
    backgroundColor: "#1E40AF", 
    borderLeftColor: "limegreen",
  },
  alunoItemText: {
    color: "#fff",
    fontSize: 14,
  },
  semAlunosTexto: {
    color: "#AAB1C4",
    textAlign: "center",
    marginVertical: 20,
    fontSize: 14,
  },
  botoesModalContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 15,
    gap: 10,
  },
  botaoModalAcao: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
  },
  botaoCancelarModal: {
    backgroundColor: "#373e4f", 
  },
  botaoConcluirParada: {
    backgroundColor: "#0B49C1", 
  },
  botaoModalTexto: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
});