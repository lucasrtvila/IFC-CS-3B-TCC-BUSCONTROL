import React, { useState, useContext, useMemo } from "react";
import {
  View,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  StatusBar,
  SectionList,
  Alert,
  Image,
} from "react-native";
import Texto from "../components/Texto";
import Header from "../components/Header";
import { ViagemContext } from "../components/ViagemContext";
import { AlunosContext } from "../components/AlunosContext";
import { ParadasContext } from "../components/ParadasContext";
import { updateViagemVolta } from "../database/database";

const { width } = Dimensions.get("window");

export default function ListaPresencaScreen({ navigation }) {
  const { viagemTemplate, limparTemplate } = useContext(ViagemContext);
  const { alunos: todosAlunos } = useContext(AlunosContext);
  const { paradas } = useContext(ParadasContext);

  const alunosDaIdaIds = useMemo(
    () => new Set(viagemTemplate?.alunosSelecionadosIds || []),
    [viagemTemplate]
  );

  const secoesDeAlunos = useMemo(() => {
    const alunosQueForam = [];
    const outrosAlunos = [];

    todosAlunos.forEach(aluno => {
      if (alunosDaIdaIds.has(aluno.id)) {
        alunosQueForam.push(aluno);
      } else {
        outrosAlunos.push(aluno);
      }
    });

    alunosQueForam.sort((a, b) => a.nome.localeCompare(b.nome));
    outrosAlunos.sort((a, b) => a.nome.localeCompare(b.nome));

    const sections = [];
    if (alunosQueForam.length > 0) {
        sections.push({ title: "Alunos da Ida", data: alunosQueForam });
    }
    if (outrosAlunos.length > 0) {
        sections.push({ title: "Outros Alunos", data: outrosAlunos });
    }
     if (sections.length === 0) {
         sections.push({ title: "Nenhum Aluno Cadastrado", data: [] });
     }

    return sections;
  }, [todosAlunos, alunosDaIdaIds]);

  const [alunosPresentesParaVolta, setAlunosPresentesParaVolta] = useState(() => new Set());

  const togglePresenca = (alunoId) => {
    setAlunosPresentesParaVolta((prev) => {
      const novosPresentes = new Set(prev);
      if (novosPresentes.has(alunoId)) {
        novosPresentes.delete(alunoId);
      } else {
        novosPresentes.add(alunoId);
      }
      return novosPresentes;
    });
  };

  const iniciarViagemDeVolta = async () => {
    if (!viagemTemplate) {
      Alert.alert("Erro", "Não há dados da viagem de ida para iniciar a volta.");
      navigation.navigate("Inicial");
      return;
    }

    const alunosQueVoltam = todosAlunos.filter((aluno) =>
      alunosPresentesParaVolta.has(aluno.id)
    );

    if (alunosQueVoltam.length === 0) {
      Alert.alert("Nenhum Aluno Selecionado", "Selecione pelo menos um aluno para iniciar a viagem de volta.");
      return;
    }

    // Verifica quantos dos que foram na ida não foram selecionados para volta
    const idsQueForamNaIda = Array.from(alunosDaIdaIds);
    const faltantesIds = idsQueForamNaIda.filter(id => !alunosPresentesParaVolta.has(id));
    const faltantesCount = faltantesIds.length;

    const mensagem = faltantesCount > 0
      ? `Atenção: ${faltantesCount} ${faltantesCount === 1 ? 'aluno que foi na ida não embarcou' : 'alunos que foram na ida não embarcaram'}.\nDeseja continuar mesmo assim?`
      : "Iniciar viagem de volta?";

    Alert.alert(
      "Confirmar Viagem",
      mensagem,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Confirmar",
          onPress: async () => {
            try {
              const nomesAlunosVolta = alunosQueVoltam.map(a => a.nome);
              // Atualiza o registro original da viagem de ida com os alunos da volta
              await updateViagemVolta(viagemTemplate.historicoId, nomesAlunosVolta);
              console.log("Histórico atualizado com alunos da volta:", nomesAlunosVolta);
            } catch (error) {
              console.error("Erro ao atualizar histórico com alunos da volta:", error);
              Alert.alert("Erro", "Não foi possível atualizar o histórico da viagem.");
              return;
            }

            const paradasDaViagemComAlunosVolta = paradas
              .map((parada) => ({
                ...parada,
                alunos: alunosQueVoltam.filter(
                  (aluno) => aluno.paradaId === parada.id
                ),
              }))
              .filter((parada) => parada.alunos.length > 0)
              .sort((a, b) => (b.horario || "").localeCompare(a.horario || ""));

            const destinoVolta = `Volta de ${viagemTemplate.destino}`;
            const historicoIdOriginal = viagemTemplate.historicoId; // Pega o ID original

            limparTemplate();

            navigation.navigate("ViagemAtiva", {
              destino: destinoVolta,
              horarioFinal: "N/A",
              paradasDaViagem: paradasDaViagemComAlunosVolta,
              veiculoId: viagemTemplate.veiculoId,
              tipoViagem: "volta",
              alunosSelecionadosIds: alunosQueVoltam.map(a => a.id),
              historicoIdOriginal: historicoIdOriginal,
            });
          }
        }
      ]
    );
  };
  const renderAlunoItem = ({ item }) => {
    const isPresente = alunosPresentesParaVolta.has(item.id);
    const estavaNaIda = alunosDaIdaIds.has(item.id);

    return (
      <TouchableOpacity
        style={[
            styles.alunoItem,
            isPresente && styles.alunoItemSelected,
            !estavaNaIda && styles.alunoNaoEstavaNaIda // Aplica estilo se não estava na ida
        ]}
        onPress={() => togglePresenca(item.id)}
      >
        <Texto style={styles.alunoItemText}>{item.nome}</Texto>
      </TouchableOpacity>
    );
  };

   const renderSectionHeader = ({ section: { title } }) => (
    <Texto style={styles.sectionHeader}>{title}</Texto> // Renderiza título da seção
  );


  return (
    <>
      <StatusBar barStyle="light-content" backgroundColor="#0A0E21" />
      <View style={styles.container}>
        <Header navigation={navigation} />
        <Texto style={styles.titulo}>Lista de Presença (Volta)</Texto>
        <Texto style={styles.subtitulo}>Selecione quem irá voltar:</Texto>

        <SectionList // Usa SectionList para exibir as seções
          sections={secoesDeAlunos}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderAlunoItem}
          renderSectionHeader={renderSectionHeader}
          style={styles.alunosList}
          stickySectionHeadersEnabled={false}
           ListEmptyComponent={
            <Texto style={styles.semAlunosTexto}>
              Nenhum aluno cadastrado no sistema.
            </Texto>
          }
        />

        <TouchableOpacity
          style={styles.botaoIniciar}
          onPress={iniciarViagemDeVolta}
        >
          <Texto style={styles.botaoTexto}>Iniciar Volta ({alunosPresentesParaVolta.size})</Texto>
        </TouchableOpacity>
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
  titulo: {
    fontSize: 24,
    color: "white",
    fontWeight: "bold",
    marginVertical: 15,
    textAlign: "center",
  },
   subtitulo: {
    fontSize: 16,
    color: "#AAB1C4",
    marginBottom: 15,
    textAlign: "center",
  },
  alunosList: {
    flex: 1,
    marginBottom: 20,
  },
  sectionHeader: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#AAB1C4",
    backgroundColor: "#1c2337",
    paddingVertical: 8,
    paddingHorizontal: 15,
    marginTop: 15,
    marginBottom: 10,
    borderRadius: 8,
  },
  alunoItem: {
    padding: 15,
    backgroundColor: "#373e4f",
    borderRadius: 8,
    marginBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderLeftWidth: 4,
    borderLeftColor: 'transparent',
  },
  alunoItemSelected: {
    backgroundColor: "#0B49C1",
    borderLeftColor: 'limegreen',
  },
  alunoNaoEstavaNaIda: {
     opacity: 0.8,
  },
  alunoItemText: {
    color: "#fff",
    fontSize: 16,
  },
  indicadorIda: {
      fontSize: 12,
      color: '#AAB1C4',
      fontStyle: 'italic',
  },
  semAlunosTexto: {
    color: "#AAB1C4",
    textAlign: "center",
    marginTop: 50,
    fontSize: 16,
  },
  botaoIniciar: {
    backgroundColor: "#0B49C1",
    paddingVertical: 18,
    borderRadius: 12,
    alignItems: "center",
  },
  botaoTexto: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
});