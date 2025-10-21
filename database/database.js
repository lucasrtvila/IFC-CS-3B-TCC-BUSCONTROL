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
        alunos: ['telefone', 'cpf'],
        paradas: ['horario'],
        lembretes: ['hora'],
        viagens_historico: ['tipoViagem', 'alunos_volta'],
      };

      for (const tabela in colunasParaAdicionar) {
        for (const coluna of colunasParaAdicionar[tabela]) {
          const existe = await checkIfColumnExists(tabela, coluna);
          if (!existe) {
            await database.execAsync(`ALTER TABLE ${tabela} ADD COLUMN ${coluna} TEXT;`);
            console.log(`✅ Coluna '${coluna}' adicionada à tabela '${tabela}'.`);
          }
        }
      }

      const mensalidadesExists = await database.getAllAsync("SELECT name FROM sqlite_master WHERE type='table' AND name='mensalidades';");
      if (mensalidadesExists.length === 0) {
        await database.execAsync(`CREATE TABLE IF NOT EXISTS mensalidades (valor REAL NOT NULL, dataVencimento TEXT NOT NULL);`);
        console.log("✅ Tabela 'mensalidades' criada!");
      }

    } catch (error) {
      console.log("❌ Erro na migração:", error);
      throw error;
    }
  });
}

// **FUNÇÃO CORRIGIDA** - Apaga todas as tabelas e as recria do zero
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
            FOREIGN KEY (aluno_id) REFERENCES alunos(id) ON DELETE CASCADE
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
        CREATE TABLE IF NOT EXISTS alunos (id INTEGER PRIMARY KEY AUTOINCREMENT, nome TEXT NOT NULL, cpf TEXT, ultimoPagamento TEXT, status TEXT, telefone TEXT, paradaId INTEGER, horario TEXT);
        CREATE TABLE IF NOT EXISTS paradas (id INTEGER PRIMARY KEY AUTOINCREMENT, nome TEXT NOT NULL, horario TEXT);
        CREATE TABLE IF NOT EXISTS lembretes (id INTEGER PRIMARY KEY AUTOINCREMENT, titulo TEXT NOT NULL, data TEXT NOT NULL, hora TEXT);
        CREATE TABLE IF NOT EXISTS usuarios (id INTEGER PRIMARY KEY AUTOINCREMENT, nome TEXT NOT NULL);
        CREATE TABLE IF NOT EXISTS mensalidades (valor REAL NOT NULL, dataVencimento TEXT NOT NULL);
        CREATE TABLE IF NOT EXISTS viagens_historico (id INTEGER PRIMARY KEY AUTOINCREMENT, data TEXT, destino TEXT, duracao TEXT, veiculoId INTEGER, alunos TEXT, tipoViagem TEXT, alunos_volta TEXT);
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

export async function addViagem(data, destino, duracao, veiculoId, alunos, tipoViagem) {
    return queueOperation(async () => {
        const database = await getDB();
        const alunosJSON = JSON.stringify(alunos);
        return await database.runAsync(
          "INSERT INTO viagens_historico (data, destino, duracao, veiculoId, alunos, tipoViagem) VALUES (?, ?, ?, ?, ?, ?)",
          [data, destino, duracao, veiculoId, alunosJSON, tipoViagem]
        );
    });
}

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

export async function getViagens() {
    const database = await getDB();
    return await database.getAllAsync("SELECT * FROM viagens_historico");
}


// --- Funções CRUD (Veiculos, Paradas, Lembretes, Usuario) ---

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

// Busca alunos (dados base, sem status)
export async function getAlunos() {
  const database = await getDB();
  return await database.getAllAsync("SELECT id, nome, cpf, ultimoPagamento, telefone, paradaId, horario FROM alunos");
}

// Adiciona aluno
export async function addAluno(nome, cpf, statusInicial = "Não Pago", ultimoPagamento = "", telefone = "", paradaId = null) {
 return queueOperation(async () => {
     const database = await getDB();
     // Insere o statusInicial na tabela principal 'alunos' para fallback
     const result = await database.runAsync("INSERT INTO alunos (nome, cpf, ultimoPagamento, telefone, paradaId, status) VALUES (?, ?, ?, ?, ?, ?)", [nome, cpf || "", ultimoPagamento, telefone || "", paradaId, statusInicial]);
     const alunoId = result.lastInsertRowId;

     if (alunoId) {
         // Determina o ciclo de faturamento atual para registrar o status inicial
         const config = await getMensalidade(); // Busca config de vencimento
         const diaVenc = config ? parseDataISO(config.dataVencimento).getDate() : 20; // Padrão 20
         const mesAnoAtual = getMesAnoDeFaturamentoAtual(diaVenc); // Usa a função helper

         // Registra o status inicial no histórico para o ciclo atual
         await registrarOuAtualizarStatusPagamento(alunoId, mesAnoAtual, statusInicial);
     }
    return result;
 });
}

// Atualiza dados gerais (NÃO O STATUS DE PAGAMENTO)
export async function updateAluno(id, nome, cpf, ultimoPagamento, telefone, paradaId, horario) {
 return queueOperation(async () => {
     const database = await getDB();
     // Remove 'status' desta query
     return await database.runAsync("UPDATE alunos SET nome = ?, cpf = ?, ultimoPagamento = ?, telefone = ?, paradaId = ?, horario = ? WHERE id = ?", [nome, cpf || "", ultimoPagamento || "", telefone || "", paradaId, horario, id]);
 });
}

// Registra/Atualiza o status na tabela historico_pagamentos
export async function registrarOuAtualizarStatusPagamento(aluno_id, mes_ano, status) {
    return queueOperation(async () => {
        const database = await getDB();
        const dataModificacao = new Date().toISOString();
        const updateResult = await database.runAsync(
            "UPDATE historico_pagamentos SET status = ?, data_modificacao = ? WHERE aluno_id = ? AND mes_ano = ?",
            [status, dataModificacao, aluno_id, mes_ano]
        );

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


export async function deleteAluno(id) {
 return queueOperation(async () => {
     const database = await getDB();
     return await database.runAsync("DELETE FROM alunos WHERE id = ?", [id]);
 });
}

// --- Funções Paradas ---
export async function getParadas() {
  const database = await getDB();
  const paradas = await database.getAllAsync("SELECT * FROM paradas ORDER BY horario");
  return await Promise.all(
    paradas.map(async (parada) => {
      const alunosNaParada = await database.getAllAsync("SELECT id, nome, horario FROM alunos WHERE paradaId = ?", [parada.id]);
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
     return await database.runAsync("UPDATE paradas SET nome = ?, horario = ? WHERE id = ?", [nome, horario, id]);
 });
}
export async function deleteParada(id) {
  return queueOperation(async () => {
      const database = await getDB();
      await database.runAsync("UPDATE alunos SET paradaId = NULL WHERE paradaId = ?", [id]);
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
      await database.execAsync("DELETE FROM usuarios");
      await database.runAsync("INSERT INTO usuarios (nome) VALUES (?)", [nome]);
  });
}

// --- Funções Mensalidade ---
export async function salvarMensalidade(valor, dataVencimento) { // dataVencimento deve ser string YYYY-MM-DD
  return queueOperation(async () => {
      const db = await getDB();
      await db.execAsync("DELETE FROM mensalidades;");
      await db.runAsync("INSERT INTO mensalidades (valor, dataVencimento) VALUES (?, ?);",[valor, dataVencimento]);
  });
}
export async function getMensalidade() {
  const db = await getDB();
  const result = await db.getAllAsync("SELECT * FROM mensalidades LIMIT 1;");
  return result.length > 0 ? result[0] : null;
}

// --- Funções Lembretes ---
export async function getLembretes() {
    const database = await getDB();
    return await database.getAllAsync("SELECT * FROM lembretes ORDER BY data, hora;");
}
export async function salvarLembrete(titulo, data, hora = null) {
    return queueOperation(async () => {
        const database = await getDB();
        await database.runAsync(`INSERT INTO lembretes (titulo, data, hora) VALUES (?, ?, ?);`,[titulo, data, hora]);
    });
}
export async function editLembrete(id, titulo, data, hora = null) {
    return queueOperation(async () => {
        const database = await getDB();
        await database.runAsync(`UPDATE lembretes SET titulo = ?, data = ?, hora = ? WHERE id = ?;`,[titulo, data, hora, id]);
    });
}
export async function removeLembrete(id) {
    return queueOperation(async () => {
        const database = await getDB();
        await database.runAsync(`DELETE FROM lembretes WHERE id = ?;`, [id]);
    });
}

// --- Histórico Pagamentos e Verificação ---

// Busca alunos com status para um mês específico
export async function getAlunosComStatusParaMes(mes_ano) {
    return queueOperation(async () => {
        const database = await getDB();
        if (!database) {
            console.error("Database connection not available in getAlunosComStatusParaMes");
            throw new Error("Database connection failed");
        }
        const query = `
            SELECT
                a.id, a.nome, a.cpf, a.telefone, a.paradaId, a.horario,
                COALESCE(hp.status, 'Não Pago') as status
            FROM alunos a
            LEFT JOIN historico_pagamentos hp ON a.id = hp.aluno_id AND hp.mes_ano = ?
            ORDER BY a.nome;
        `;
        try {
            const alunosComStatus = await database.getAllAsync(query, [mes_ano]);
            return alunosComStatus;
        } catch (error) {
            console.error(`Erro ao buscar alunos com status para ${mes_ano}:`, error);
            throw error;
        }
    });
}

// Função resetarStatusPagamentoAlunos (Uso Manual - CUIDADO)
export async function resetarStatusPagamentoAlunos() {
 return queueOperation(async () => {
     console.warn("🔄 Resetando status de pagamento de todos os alunos para 'Não Pago' NA TABELA ALUNOS (USO MANUAL).");
     const database = await getDB();
     try {
         const result = await database.runAsync("UPDATE alunos SET status = 'Não Pago'");
         console.warn(`⚠️ Status de ${result.changes} alunos resetado na tabela principal 'alunos'.`);
         return result;
     } catch (error) {
         console.error("❌ Erro ao resetar status de pagamento:", error);
         throw error;
     }
 });
}

// Funções de último reset (Não mais usadas pela lógica automática)
/*
export async function getUltimoReset() {
    const db = await getDB();
    const result = await db.getAllAsync("SELECT value FROM app_config WHERE key = 'ultimoResetStatus' LIMIT 1;");
    return result.length > 0 ? result[0].value : null;
}
export async function setUltimoReset(data) {
    return queueOperation(async () => {
        const db = await getDB();
        await db.runAsync("UPDATE app_config SET value = ? WHERE key = 'ultimoResetStatus';", [data]);
        console.log("✅ Data do último reset salva:", data);
    });
}
*/

// Função de verificação (Simplificada)
export async function verificarEVAtualizarStatusMensalidade() {
    console.log("🧐 Verificação de status de mensalidade iniciada (sem reset automático).");
    const configMensalidade = await getMensalidade();
    if (!configMensalidade || !configMensalidade.dataVencimento) {
      console.log("⚠️ Configuração de mensalidade não encontrada. Verificação de status pulada.");
      return;
    }
    console.log("✅ Verificação de status de mensalidade concluída.");
}

// --- Funções Auxiliares Internas ---

function parseDataISO(dataString) {
    if (!dataString || typeof dataString !== 'string') return null;
    const parts = dataString.split('-');
    if (parts.length === 3) {
      return new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
    }
    return null;
}
function formatarDataISO(data) {
    if (!data) return null;
    const dia = data.getDate().toString().padStart(2, '0');
    const mes = (data.getMonth() + 1).toString().padStart(2, '0');
    const ano = data.getFullYear();
    return `${ano}-${mes}-${dia}`;
}

// Helper para determinar o ciclo de faturamento (usado em addAluno)
const getMesAnoDeFaturamentoAtual = (diaVencimento) => {
    const hoje = new Date();
    const diaDeHoje = hoje.getDate();
    const anoAtual = hoje.getFullYear();
    const mesAtual = hoje.getMonth(); // 0-indexado

    if (diaDeHoje <= diaVencimento) {
        return `${anoAtual}-${(mesAtual + 1).toString().padStart(2, '0')}`;
    } else {
        const proximoMes = new Date(anoAtual, mesAtual, 1);
        proximoMes.setMonth(proximoMes.getMonth() + 1);
        const anoProximo = proximoMes.getFullYear();
        const mesProximo = (proximoMes.getMonth() + 1).toString().padStart(2, '0');
        return `${anoProximo}-${mesProximo}`;
    }
};