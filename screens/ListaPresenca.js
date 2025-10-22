import React, { useState, useContext, useMemo } from "react";
import {
  View,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  StatusBar,
  SectionList, // Alterado de FlatList para SectionList
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
  const { alunos: todosAlunos } = useContext(AlunosContext); // Pega todos os alunos
  const { paradas } = useContext(ParadasContext);

  // Memoiza os IDs dos alunos que foram na ida
  const alunosDaIdaIds = useMemo(
    () => new Set(viagemTemplate?.alunosSelecionadosIds || []), // Usa os IDs salvos no template
    [viagemTemplate]
  );

  // Separa os alunos em duas seções: os que foram na ida e os outros
  const secoesDeAlunos = useMemo(() => {
    const alunosQueForam = [];
    const outrosAlunos = [];

    todosAlunos.forEach(aluno => {
      if (alunosDaIdaIds.has(aluno.id)) { // Separa baseado nos IDs da ida
        alunosQueForam.push(aluno);
      } else {
        outrosAlunos.push(aluno);
      }
    });

    alunosQueForam.sort((a, b) => a.nome.localeCompare(b.nome));
    outrosAlunos.sort((a, b) => a.nome.localeCompare(b.nome));

    const sections = [];
    if (alunosQueForam.length > 0) {
        sections.push({ title: "Alunos da Ida", data: alunosQueForam }); // Seção 1
    }
    if (outrosAlunos.length > 0) {
        sections.push({ title: "Outros Alunos", data: outrosAlunos }); // Seção 2
    }
     if (sections.length === 0) {
         sections.push({ title: "Nenhum Aluno Cadastrado", data: [] });
     }

    return sections;
  }, [todosAlunos, alunosDaIdaIds]);

  // Estado para alunos selecionados para a volta
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

    // Filtra TODOS os alunos baseado na seleção atual
    const alunosQueVoltam = todosAlunos.filter((aluno) =>
      alunosPresentesParaVolta.has(aluno.id)
    );

    if (alunosQueVoltam.length === 0) {
      Alert.alert("Nenhum Aluno Selecionado", "Selecione pelo menos um aluno para iniciar a viagem de volta.");
      return;
    }

    try {
      const nomesAlunosVolta = alunosQueVoltam.map(a => a.nome);
      // Atualiza o registro original da viagem de ida com os alunos da volta
      await updateViagemVolta(viagemTemplate.historicoId, nomesAlunosVolta);
      console.log("Histórico atualizado com alunos da volta:", nomesAlunosVolta);
    } catch (error) {
      console.error("Erro ao atualizar histórico com alunos da volta:", error);
      Alert.alert("Erro", "Não foi possível atualizar o histórico da viagem.");
    }

     const paradasDaViagemComAlunosVolta = paradas
       .map((parada) => ({
         ...parada,
         alunos: alunosQueVoltam.filter( // Filtra alunos que voltam por parada
           (aluno) => aluno.paradaId === parada.id
         ),
       }))
       .filter((parada) => parada.alunos.length > 0)
       .sort((a, b) => (b.horario || "").localeCompare(a.horario || "")); // Ordena decrescente


    const destinoVolta = `Volta de ${viagemTemplate.destino}`;
    const historicoIdOriginal = viagemTemplate.historicoId; // Pega o ID original

    limparTemplate(); // Limpa o template antes de navegar

    navigation.navigate("ViagemAtiva", {
      destino: destinoVolta,
      horarioFinal: "N/A",
      paradasDaViagem: paradasDaViagemComAlunosVolta,
      veiculoId: viagemTemplate.veiculoId,
      tipoViagem: "volta", // Define o tipo como volta
      alunosSelecionadosIds: alunosQueVoltam.map(a => a.id), // Passa IDs de quem volta
      historicoIdOriginal: historicoIdOriginal, // Passa o ID original para ViagemAtiva
    });
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
  sectionHeader: { // Estilo para o cabeçalho da seção
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
  alunoNaoEstavaNaIda: { // Estilo para alunos que não foram na ida
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