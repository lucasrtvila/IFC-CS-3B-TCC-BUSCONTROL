import * as SQLite from "expo-sqlite";

// Conexão única com o banco de dados para ser reutilizada
let db;
// Fila para garantir que as operações no banco de dados executem em sequência
let operationQueue = Promise.resolve();

async function getDB() {
  if (!db) {
    db = await SQLite.openDatabaseAsync("buscontrol.db");
  }
  return db;
}

// Enfileira as operações para evitar conflitos de acesso simultâneo
function queueOperation(operation) {
  operationQueue = operationQueue.then(operation).catch((error) => {
    console.log("Erro na operação:", error);
    // throw error; // Pode parar a fila
  });
  return operationQueue;
}

// Função para verificar se uma coluna específica já existe em uma tabela
async function checkIfColumnExists(tableName, columnName) {
  const database = await getDB();
  const result = await database.getAllAsync(`PRAGMA table_info(${tableName})`);
  return result.some((column) => column.name === columnName);
}

// Adiciona novas colunas a tabelas existentes se elas não existirem
export async function migrateDatabase() {
  return queueOperation(async () => {
    const database = await getDB();
    try {
      console.log("🔄 Executando migrações...");

      const colunasParaAdicionar = {
        // --- ATUALIZADO (1/3): Adicionado dataCadastro e statusAtivo ---
        alunos: ['telefone', 'cpf', 'dataCadastro', 'statusAtivo'],
        paradas: ['horario'],
        // ADICIONA notificationId AQUI
        lembretes: ['hora', 'notificationId'],
        // Adiciona duracao_volta aqui
        viagens_historico: ['tipoViagem', 'alunos_volta', 'duracao_volta'],
      };

      for (const tabela in colunasParaAdicionar) {
        for (const coluna of colunasParaAdicionar[tabela]) {
          const existe = await checkIfColumnExists(tabela, coluna);
          if (!existe) {
            // Define o tipo de coluna (TEXT para dataCadastro, INTEGER para statusAtivo)
            let columnType = "TEXT";
            if (coluna === 'statusAtivo') {
              columnType = "INTEGER DEFAULT 1"; // Ativo por padrão
            }
            
            await database.execAsync(`ALTER TABLE ${tabela} ADD COLUMN ${coluna} ${columnType};`);
            console.log(`✅ Coluna '${coluna}' adicionada à tabela '${tabela}'.`);
          }
        }
      }

       // --- ATUALIZADO (2/3): Define data de cadastro para alunos existentes ---
       // Define a data de cadastro como a data atual para alunos que não a possuem
       await database.execAsync(`UPDATE alunos SET dataCadastro = strftime('%Y-%m-%d', 'now') WHERE dataCadastro IS NULL`);
       // Garante que alunos existentes sejam definidos como ativos
       await database.execAsync(`UPDATE alunos SET statusAtivo = 1 WHERE statusAtivo IS NULL`);
       // --- FIM DA ATUALIZAÇÃO ---


       // Garante que a coluna duracao_volta exista (caso a migração anterior falhe ou seja antiga)
      const duracaoVoltaExists = await checkIfColumnExists('viagens_historico', 'duracao_volta');
      if (!duracaoVoltaExists) {
        await database.execAsync(`ALTER TABLE viagens_historico ADD COLUMN duracao_volta TEXT;`);
        console.log("✅ Coluna 'duracao_volta' adicionada à tabela 'viagens_historico'.");
      }


      const mensalidadesExists = await database.getAllAsync("SELECT name FROM sqlite_master WHERE type='table' AND name='mensalidades';");
      if (mensalidadesExists.length === 0) {
        await database.execAsync(`CREATE TABLE IF NOT EXISTS mensalidades (valor REAL NOT NULL, dataVencimento TEXT NOT NULL);`);
        console.log("✅ Tabela 'mensalidades' criada!");
      }

      // Verifica e cria a tabela historico_pagamentos se não existir (essencial para outras partes do app)
       const historicoPagamentosExists = await database.getAllAsync("SELECT name FROM sqlite_master WHERE type='table' AND name='historico_pagamentos';");
        if (historicoPagamentosExists.length === 0) {
            await initHistoricoPagamentosTable(); // Chama a função para criar a tabela
            console.log("✅ Tabela 'historico_pagamentos' criada!");
        }


    } catch (error) {
      console.log("❌ Erro na migração:", error);
      throw error;
    }
  });
}

// Apaga todas as tabelas e as recria do zero
export async function resetDatabase() {
  return queueOperation(async () => {
    console.log("⚠️  RESETANDO BANCO - TODOS OS DADOS SERÃO PERDIDOS!");
    const database = await getDB();
    try {
      const tabelas = ['alunos', 'veiculos', 'paradas', 'lembretes', 'mensalidades', 'usuarios', 'viagens_historico', 'app_config', 'historico_pagamentos'];
      for (const tabela of tabelas) {
        await database.execAsync(`DROP TABLE IF EXISTS ${tabela};`);
      }
      console.log("✅ Tabelas removidas, recriando...");
      await initDB(true); // Recria as tabelas
      console.log("✅ Banco de dados resetado com sucesso!");
    } catch (error) {
      console.log("❌ Erro ao resetar banco:", error);
      throw error;
    }
  });
}

// Adiciona uma tabela simples para configurações gerais do app
async function initConfigTable() {
  const database = await getDB();
  await database.execAsync(`CREATE TABLE IF NOT EXISTS app_config (key TEXT PRIMARY KEY, value TEXT);`);
  await database.runAsync(`INSERT OR IGNORE INTO app_config (key, value) VALUES (?, ?);`, ['ultimoResetStatus', '']); // Mantido, mas não usado para reset automático
  console.log("✅ Tabela 'app_config' verificada/criada.");
}

// Cria a nova tabela de histórico de pagamentos
async function initHistoricoPagamentosTable() {
    const database = await getDB();
    await database.execAsync(`
        CREATE TABLE IF NOT EXISTS historico_pagamentos (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            aluno_id INTEGER NOT NULL,
            mes_ano TEXT NOT NULL, -- Formato 'YYYY-MM'
            status TEXT NOT NULL, -- 'Pago' ou 'Não Pago'
            data_modificacao TEXT, -- Data ISO de quando foi marcado como Pago/Não Pago
            /* --- ATUALIZADO (3/3): Removido ON DELETE CASCADE --- */
            FOREIGN KEY (aluno_id) REFERENCES alunos(id)
        );
    `);
    await database.execAsync(`CREATE INDEX IF NOT EXISTS idx_pagamento_aluno_mes ON historico_pagamentos (aluno_id, mes_ano);`);
    console.log("✅ Tabela 'historico_pagamentos' verificada/criada.");
}

// Inicializa o banco de dados e cria todas as tabelas necessárias
export async function initDB(isReset = false) {
  return queueOperation(async () => {
    if (!isReset) console.log("=== INIT DB - COMEÇOU ===");
    try {
      const database = await getDB();
      await database.execAsync(`
        CREATE TABLE IF NOT EXISTS veiculos (id INTEGER PRIMARY KEY AUTOINCREMENT, nome TEXT NOT NULL, status TEXT NOT NULL);
        /* --- ATUALIZADO: Adicionado dataCadastro e statusAtivo --- */
        CREATE TABLE IF NOT EXISTS alunos (
            id INTEGER PRIMARY KEY AUTOINCREMENT, 
            nome TEXT NOT NULL, 
            cpf TEXT, 
            ultimoPagamento TEXT, 
            status TEXT, 
            telefone TEXT, 
            paradaId INTEGER, 
            horario TEXT,
            dataCadastro TEXT,
            statusAtivo INTEGER DEFAULT 1
        );
        CREATE TABLE IF NOT EXISTS paradas (id INTEGER PRIMARY KEY AUTOINCREMENT, nome TEXT NOT NULL, horario TEXT);
        /* ADICIONA notificationId AQUI */
        CREATE TABLE IF NOT EXISTS lembretes (id INTEGER PRIMARY KEY AUTOINCREMENT, titulo TEXT NOT NULL, data TEXT NOT NULL, hora TEXT, notificationId TEXT);
        CREATE TABLE IF NOT EXISTS usuarios (id INTEGER PRIMARY KEY AUTOINCREMENT, nome TEXT NOT NULL);
        CREATE TABLE IF NOT EXISTS mensalidades (valor REAL NOT NULL, dataVencimento TEXT NOT NULL);
        /* Adiciona duracao_volta na criação da tabela */
        CREATE TABLE IF NOT EXISTS viagens_historico (id INTEGER PRIMARY KEY AUTOINCREMENT, data TEXT, destino TEXT, duracao TEXT, veiculoId INTEGER, alunos TEXT, tipoViagem TEXT, alunos_volta TEXT, duracao_volta TEXT);
      `);
       await initConfigTable();
       await initHistoricoPagamentosTable(); // Criar a nova tabela
      if (!isReset) console.log("✅ Tabelas verificadas/criadas com sucesso!");
      return true;
    } catch (error) {
      console.log("❌ ERRO NO INIT DB:", error);
      throw error;
    }
  });
}

// --- Funções CRUD (Viagens) ---

// addViagem: Apenas insere a duração da ida (coluna 'duracao')
export async function addViagem(data, destino, duracao, veiculoId, alunos, tipoViagem) {
    return queueOperation(async () => {
        const database = await getDB();
        const alunosJSON = JSON.stringify(alunos);
        // Não inclui duracao_volta aqui
        return await database.runAsync(
          "INSERT INTO viagens_historico (data, destino, duracao, veiculoId, alunos, tipoViagem) VALUES (?, ?, ?, ?, ?, ?)",
          [data, destino, duracao, veiculoId, alunosJSON, tipoViagem]
        );
    });
}

// updateViagemVolta: Apenas atualiza a lista de alunos da volta
export async function updateViagemVolta(viagemId, alunosVolta) {
    return queueOperation(async () => {
        const database = await getDB();
        const alunosVoltaJSON = JSON.stringify(alunosVolta);
        return await database.runAsync(
            "UPDATE viagens_historico SET alunos_volta = ? WHERE id = ?",
            [alunosVoltaJSON, viagemId]
        );
    });
}

// Atualiza apenas a duração da volta
export async function updateDuracaoVolta(viagemId, duracaoVolta) {
    return queueOperation(async () => {
        const database = await getDB();
        console.log(`Atualizando duracao_volta para viagem ID ${viagemId}: ${duracaoVolta}`);
        return await database.runAsync(
            "UPDATE viagens_historico SET duracao_volta = ? WHERE id = ?",
            [duracaoVolta, viagemId]
        );
    });
}

// getViagens: Busca todas as colunas, incluindo duracao_volta, ordenado por ID DESC
export async function getViagens() {
    const database = await getDB();
    // Garante que busca a nova coluna e ordena pelo ID decrescente para pegar a mais recente primeiro
    return await database.getAllAsync("SELECT * FROM viagens_historico ORDER BY id DESC"); //
}


// --- Funções CRUD (Veiculos) ---
export async function getVeiculos() {
  const database = await getDB();
  return await database.getAllAsync("SELECT * FROM veiculos");
}
export async function addVeiculo(nome, status) {
  return queueOperation(async () => {
      const database = await getDB();
      return await database.runAsync("INSERT INTO veiculos (nome, status) VALUES (?, ?)", [nome, status]);
  });
}
export async function updateVeiculo(id, nome, status) {
 return queueOperation(async () => {
     const database = await getDB();
     return await database.runAsync("UPDATE veiculos SET nome = ?, status = ? WHERE id = ?", [nome, status, id]);
 });
}
export async function deleteVeiculo(id) {
  return queueOperation(async () => {
      const database = await getDB();
      return await database.runAsync("DELETE FROM veiculos WHERE id = ?", [id]);
  });
}

// --- Funções Alunos ---
export async function getAlunos() {
  const database = await getDB();
  // --- ATUALIZADO: Busca todas as colunas, incluindo as novas ---
  return await database.getAllAsync("SELECT id, nome, cpf, ultimoPagamento, telefone, paradaId, horario, dataCadastro, statusAtivo, status FROM alunos WHERE statusAtivo = 1");
}


// --- ATUALIZADO: addAluno ---
// Adiciona dataCadastro (YYYY-MM-DD) e define statusAtivo = 1
export async function addAluno(nome, cpf, status, ultimoPagamento = "", telefone = "", paradaId = null, dataCadastro) {
  return queueOperation(async () => {
    const database = await getDB();
    console.log(`Tentando adicionar aluno: ${nome}, Data Cadastro: ${dataCadastro}`);
    try {
      const result = await database.runAsync(
          "INSERT INTO alunos (nome, cpf, ultimoPagamento, telefone, paradaId, status, dataCadastro, statusAtivo) VALUES (?, ?, ?, ?, ?, ?, ?, 1)",
          [nome, cpf || "", ultimoPagamento, telefone || "", paradaId, status, dataCadastro]
      );
      console.log(`Aluno ${nome} adicionado com ID: ${result.lastInsertRowId}`);
      return result; 
    } catch (error) {
      console.error(`❌ Erro ao inserir aluno ${nome} no banco:`, error);
      throw error; 
    }
  });
}
// --- FIM DA ATUALIZAÇÃO ---


// --- updateAluno CORRIGIDO para incluir horário ---
export async function updateAluno(id, nome, cpf, ultimoPagamento, telefone, paradaId, horario) { // Adicionado horario
 return queueOperation(async () => {
     const database = await getDB();
     return await database.runAsync(
         "UPDATE alunos SET nome = ?, cpf = ?, ultimoPagamento = ?, telefone = ?, paradaId = ?, horario = ? WHERE id = ?", // Adicionado horario = ?
         [nome, cpf || "", ultimoPagamento || "", telefone || "", paradaId, horario, id] // Passa o horário
     );
 });
}
// --- FIM CORREÇÃO ---

// --- ATUALIZADO: deleteAluno (Soft Delete) ---
// Agora apenas marca o aluno como inativo (statusAtivo = 0)
// NÃO remove mais o histórico de pagamentos.
export async function deleteAluno(id) {
 return queueOperation(async () => {
     const database = await getDB();
     console.log(`Desativando aluno ID: ${id}`);
     // Apenas atualiza o status para inativo
     return await database.runAsync("UPDATE alunos SET statusAtivo = 0 WHERE id = ?", [id]);
 });
}
// --- FIM DA ATUALIZAÇÃO ---


// --- Funções Paradas ---
export async function getParadas() {
  const database = await getDB();
  const paradas = await database.getAllAsync("SELECT * FROM paradas ORDER BY horario"); // Ordena por horário
  // Busca os alunos ATIVOS para cada parada
  return await Promise.all(
    paradas.map(async (parada) => {
      const alunosNaParada = await database.getAllAsync("SELECT id, nome, horario FROM alunos WHERE paradaId = ? AND statusAtivo = 1", [parada.id]);
      return { ...parada, alunos: alunosNaParada, numAlunos: alunosNaParada.length };
    })
  );
}
export async function addParada(nome, horario) {
 return queueOperation(async () => {
     const database = await getDB();
     return await database.runAsync("INSERT INTO paradas (nome, horario) VALUES (?, ?)", [nome, horario]);
 });
}
export async function updateParada(id, nome, horario) {
 return queueOperation(async () => {
     const database = await getDB();
     // Atualiza também o horário dos alunos vinculados a esta parada
     await database.runAsync("UPDATE alunos SET horario = ? WHERE paradaId = ?", [horario, id]);
     return await database.runAsync("UPDATE paradas SET nome = ?, horario = ? WHERE id = ?", [nome, horario, id]);
 });
}
export async function deleteParada(id) {
  return queueOperation(async () => {
      const database = await getDB();
      // Remove a paradaId dos alunos antes de deletar a parada
      await database.runAsync("UPDATE alunos SET paradaId = NULL, horario = NULL WHERE paradaId = ?", [id]);
      return await database.runAsync("DELETE FROM paradas WHERE id = ?", [id]);
  });
}

// --- Funções Usuario ---
export async function getUsuario() {
  const database = await getDB();
  const result = await database.getAllAsync("SELECT * FROM usuarios LIMIT 1");
  return result.length > 0 ? result[0] : null;
}
export async function setUsuario(nome) {
  return queueOperation(async () => {
      const database = await getDB();
      // Apaga o usuário antigo (se existir) e insere o novo
      await database.execAsync("DELETE FROM usuarios");
      await database.runAsync("INSERT INTO usuarios (nome) VALUES (?)", [nome]);
  });
}

// --- Funções Mensalidade ---
// Salva/Atualiza a configuração (valor e data de vencimento YYYY-MM-DD)
export async function salvarMensalidade(valor, dataVencimento) {
  return queueOperation(async () => {
      const db = await getDB();
      // Remove configuração antiga e insere a nova
      await db.execAsync("DELETE FROM mensalidades;");
      await db.runAsync("INSERT INTO mensalidades (valor, dataVencimento) VALUES (?, ?);",[valor, dataVencimento]);
  });
}
// Busca a configuração atual
export async function getMensalidade() {
  const db = await getDB();
  const result = await db.getAllAsync("SELECT * FROM mensalidades LIMIT 1;");
  return result.length > 0 ? result[0] : null;
}

// --- Funções Lembretes ---
export async function getLembretes() {
    const database = await getDB();
    // Seleciona todas as colunas, incluindo a nova notificationId
    return await database.getAllAsync("SELECT * FROM lembretes ORDER BY data, hora;");
}
// ATUALIZADO: Aceita notificationId
export async function salvarLembrete(titulo, data, hora = null, notificationId = null) { // Data DD/MM/YYYY
    return queueOperation(async () => {
        const database = await getDB();
        await database.runAsync(`INSERT INTO lembretes (titulo, data, hora, notificationId) VALUES (?, ?, ?, ?);`,[titulo, data, hora, notificationId]);
    });
}
// ATUALIZADO: Aceita notificationId
export async function editLembrete(id, titulo, data, hora = null, notificationId = null) { // Data DD/MM/YYYY
    return queueOperation(async () => {
        const database = await getDB();
        await database.runAsync(`UPDATE lembretes SET titulo = ?, data = ?, hora = ?, notificationId = ? WHERE id = ?;`,[titulo, data, hora, notificationId, id]);
    });
}
export async function removeLembrete(id) {
    return queueOperation(async () => {
        const database = await getDB();
        await database.runAsync(`DELETE FROM lembretes WHERE id = ?;`, [id]);
    });
}

// --- Histórico Pagamentos e Verificação ---

// Registra ou atualiza o status ('Pago'/'Não Pago') para um aluno em um mês específico (YYYY-MM)
export async function registrarOuAtualizarStatusPagamento(aluno_id, mes_ano, status) {
    return queueOperation(async () => {
        const database = await getDB();
        const dataModificacao = new Date().toISOString(); // Data atual em ISO string

        // Tenta atualizar primeiro
        const updateResult = await database.runAsync(
            "UPDATE historico_pagamentos SET status = ?, data_modificacao = ? WHERE aluno_id = ? AND mes_ano = ?",
            [status, dataModificacao, aluno_id, mes_ano]
        );

        // Se nada foi atualizado (não existia), insere
        if (updateResult.changes === 0) {
            await database.runAsync(
                "INSERT INTO historico_pagamentos (aluno_id, mes_ano, status, data_modificacao) VALUES (?, ?, ?, ?)",
                [aluno_id, mes_ano, status, dataModificacao]
            );
            console.log(`✅ Status '${status}' inserido para aluno ${aluno_id} no mês ${mes_ano}`);
        } else {
            console.log(`✅ Status '${status}' atualizado para aluno ${aluno_id} no mês ${mes_ano}`);
        }
    });
}

export async function getAlunosComStatusParaMes(mes_ano) {
    return queueOperation(async () => {
        const database = await getDB();
        if (!database) {
            console.error("Database connection not available in getAlunosComStatusParaMes");
            throw new Error("Database connection failed");
        }
        
        // Regra 1: Mostrar alunos ativos (statusAtivo = 1) que foram cadastrados ANTES ou NO mês visualizado (strftime(...) <= mes_ano).
        // Regra 2: Mostrar alunos inativos (statusAtivo = 0) APENAS SE eles tiverem um registro de pagamento (hp.mes_ano = mes_ano) nesse mês específico.
        const query = `
           SELECT
                a.id, a.nome, a.cpf, a.telefone, a.paradaId, a.horario,
                a.statusAtivo, 
                COALESCE(hp.status, 'Não Pago') as status
            FROM alunos a
            LEFT JOIN historico_pagamentos hp ON a.id = hp.aluno_id AND hp.mes_ano = ?
            WHERE
                (
                    a.statusAtivo = 1 AND strftime('%Y-%m', a.dataCadastro) <= ?
                )
                OR
                (
                    a.statusAtivo = 0 AND hp.mes_ano = ?
                )
            ORDER BY a.nome;
        `;
        try {
            // Passa o 'mes_ano' 3 vezes para preencher os '?'
            const alunosComStatus = await database.getAllAsync(query, [mes_ano, mes_ano, mes_ano]);
            return alunosComStatus;
        } catch (error) {
            console.error(`Erro ao buscar alunos com status para ${mes_ano}:`, error);
            throw error;
        }
    });
}
// --- FIM DA ATUALIZAÇÃO ---


// --- Funções Auxiliares Internas ---

// Converte string "YYYY-MM-DD" para objeto Date (considerando UTC para evitar fuso)
function parseDataISO(dataString) {
    if (!dataString || typeof dataString !== 'string') return null;
    const parts = dataString.split('-');
    if (parts.length === 3) {
      // Cria a data em UTC
      return new Date(Date.UTC(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10)));
    }
    return null;
}

// Formata objeto Date para string "YYYY-MM-DD" (considerando UTC)
function formatarDataISO(data) {
    if (!data) return null;
    const dia = data.getUTCDate().toString().padStart(2, '0');
    const mes = (data.getUTCMonth() + 1).toString().padStart(2, '0'); // Mês é 0-indexado
    const ano = data.getUTCFullYear();
    return `${ano}-${mes}-${dia}`;
}

// Calcula o mês/ano de faturamento atual ("YYYY-MM") baseado no dia de vencimento
const getMesAnoDeFaturamentoAtual = (diaVencimento) => {
    const hoje = new Date();
    const diaDeHoje = hoje.getDate();
    const anoAtual = hoje.getFullYear();
    const mesAtual = hoje.getMonth(); // 0-indexado

    // Se hoje é antes ou no dia do vencimento, o faturamento é do mês atual
    if (diaDeHoje <= diaVencimento) {
        return `${anoAtual}-${(mesAtual + 1).toString().padStart(2, '0')}`;
    }
    // Se hoje é depois do dia do vencimento, o faturamento é do próximo mês
    else {
        // Cria uma data para o próximo mês
        const proximoMes = new Date(anoAtual, mesAtual, 1);
        proximoMes.setMonth(proximoMes.getMonth() + 1);
        const anoProximo = proximoMes.getFullYear();
        const mesProximo = (proximoMes.getMonth() + 1).toString().padStart(2, '0');
        return `${anoProximo}-${mesProximo}`;
    }
};

// Helper para calcular a próxima data de vencimento string "YYYY-MM-DD"
export function calcularProximoVencimento(dataVencimentoAtualISO) {
    try {
        if (!dataVencimentoAtualISO || typeof dataVencimentoAtualISO !== 'string') {
             throw new Error("Data de vencimento atual inválida");
        }
        const [ano, mes, dia] = dataVencimentoAtualISO.split('-').map(Number);
        // Cria a data baseada na data atual salva, garantindo UTC para evitar problemas de fuso
        const dataAtual = new Date(Date.UTC(ano, mes - 1, dia)); // Month is 0-indexed in JS Date

        // Adiciona um mês (UTC)
        dataAtual.setUTCMonth(dataAtual.getUTCMonth() + 1);

        // Verifica se o dia mudou (ex: Jan 31 + 1 mês -> Mar 3 se Fev não tem 31)
        // Se mudou, precisamos voltar para o último dia do mês anterior (que é o mês correto)
        if (dataAtual.getUTCDate() !== dia) {
            // Vai para o dia 0 do mês atual, que é o último dia do mês anterior
            dataAtual.setUTCDate(0);
        }

        const novoAno = dataAtual.getUTCFullYear();
        const novoMes = (dataAtual.getUTCMonth() + 1).toString().padStart(2, '0'); // +1 porque getUTCMonth é 0-indexed
        const novoDia = dataAtual.getUTCDate().toString().padStart(2, '0');

        return `${novoAno}-${novoMes}-${novoDia}`; //
    } catch (e) {
        console.error("Erro ao calcular próximo vencimento:", e);
        // Fallback: retorna a data de hoje + 1 mês (menos preciso com os dias)
        const fallbackDate = new Date();
        fallbackDate.setMonth(fallbackDate.getMonth() + 1);
        const novoAno = fallbackDate.getFullYear();
        const novoMes = (fallbackDate.getMonth() + 1).toString().padStart(2, '0');
        const novoDia = fallbackDate.getDate().toString().padStart(2, '0');
        return `${novoAno}-${novoMes}-${novoDia}`;
    }
}