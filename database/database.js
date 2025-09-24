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
    throw error;
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
    }
  });
}

// **FUNÇÃO CORRIGIDA** - Apaga todas as tabelas e as recria do zero
export async function resetDatabase() {
  return queueOperation(async () => {
    console.log("⚠️  RESETANDO BANCO - TODOS OS DADOS SERÃO PERDIDOS!");
    const database = await getDB();
    try {
      const tabelas = ['alunos', 'veiculos', 'paradas', 'lembretes', 'mensalidades', 'usuarios'];
      for (const tabela of tabelas) {
        await database.execAsync(`DROP TABLE IF EXISTS ${tabela};`);
      }
      console.log("✅ Tabelas removidas, recriando...");
      await initDB(true); // Recria as tabelas
      console.log("✅ Banco de dados resetado com sucesso!");
    } catch (error) {
      console.log("❌ Erro ao resetar banco:", error);
    }
  });
}

// Inicializa o banco de dados e cria todas as tabelas necessárias
export async function initDB(isReset = false) {
  return queueOperation(async () => {
    if (!isReset) console.log("=== INIT DB - COMEÇOU ===");
    try {
      const database = await getDB();
      await database.execAsync(`
        CREATE TABLE IF NOT EXISTS veiculos (id INTEGER PRIMARY KEY AUTOINCREMENT, nome TEXT NOT NULL, status TEXT NOT NULL);
        CREATE TABLE IF NOT EXISTS alunos (id INTEGER PRIMARY KEY AUTOINCREMENT, nome TEXT NOT NULL, cpf TEXT, ultimoPagamento TEXT, status TEXT NOT NULL, telefone TEXT, paradaId INTEGER, horario TEXT);
        CREATE TABLE IF NOT EXISTS paradas (id INTEGER PRIMARY KEY AUTOINCREMENT, nome TEXT NOT NULL, horario TEXT);
        CREATE TABLE IF NOT EXISTS lembretes (id INTEGER PRIMARY KEY AUTOINCREMENT, titulo TEXT NOT NULL, data TEXT NOT NULL, hora TEXT);
        CREATE TABLE IF NOT EXISTS usuarios (id INTEGER PRIMARY KEY AUTOINCREMENT, nome TEXT NOT NULL);
        CREATE TABLE IF NOT EXISTS mensalidades (valor REAL NOT NULL, dataVencimento TEXT NOT NULL);
      `);
      if (!isReset) console.log("✅ Tabelas verificadas/criadas com sucesso!");
      return true;
    } catch (error) {
      console.log("❌ ERRO NO INIT DB:", error);
      throw error;
    }
  });
}

// --- Funções CRUD (Veiculos, Alunos, Paradas, etc.) ---

export async function getVeiculos() {
  const database = await getDB();
  return await database.getAllAsync("SELECT * FROM veiculos");
}
export async function addVeiculo(nome, status) {
  const database = await getDB();
  return await database.runAsync("INSERT INTO veiculos (nome, status) VALUES (?, ?)", [nome, status]);
}
export async function updateVeiculo(id, nome, status) {
  const database = await getDB();
  return await database.runAsync("UPDATE veiculos SET nome = ?, status = ? WHERE id = ?", [nome, status, id]);
}
export async function deleteVeiculo(id) {
  const database = await getDB();
  return await database.runAsync("DELETE FROM veiculos WHERE id = ?", [id]);
}

export async function getAlunos() {
  const database = await getDB();
  return await database.getAllAsync("SELECT * FROM alunos");
}
export async function addAluno(nome, cpf, status, ultimoPagamento = "", telefone = "", paradaId = null) {
  const database = await getDB();
  return await database.runAsync("INSERT INTO alunos (nome, cpf, status, ultimoPagamento, telefone, paradaId) VALUES (?, ?, ?, ?, ?, ?)", [nome, cpf || "", status, ultimoPagamento, telefone || "", paradaId]);
}
export async function updateAluno(id, nome, cpf, ultimoPagamento, status, telefone, paradaId, horario) {
  const database = await getDB();
  return await database.runAsync("UPDATE alunos SET nome = ?, cpf = ?, ultimoPagamento = ?, status = ?, telefone = ?, paradaId = ?, horario = ? WHERE id = ?", [nome, cpf || "", ultimoPagamento || "", status, telefone || "", paradaId, horario, id]);
}
export async function deleteAluno(id) {
  const database = await getDB();
  return await database.runAsync("DELETE FROM alunos WHERE id = ?", [id]);
}

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
  const database = await getDB();
  return await database.runAsync("INSERT INTO paradas (nome, horario) VALUES (?, ?)", [nome, horario]);
}
export async function updateParada(id, nome, horario) {
  const database = await getDB();
  return await database.runAsync("UPDATE paradas SET nome = ?, horario = ? WHERE id = ?", [nome, horario, id]);
}
export async function deleteParada(id) {
  const database = await getDB();
  await database.runAsync("UPDATE alunos SET paradaId = NULL WHERE paradaId = ?", [id]);
  return await database.runAsync("DELETE FROM paradas WHERE id = ?", [id]);
}

export async function getUsuario() {
  const database = await getDB();
  const result = await database.getAllAsync("SELECT * FROM usuarios LIMIT 1");
  return result.length > 0 ? result[0] : null;
}
export async function setUsuario(nome) {
  const database = await getDB();
  await database.execAsync("DELETE FROM usuarios");
  await database.runAsync("INSERT INTO usuarios (nome) VALUES (?)", [nome]);
}
export async function salvarMensalidade(valor, dataVencimento) {
  const db = await getDB();
  await db.execAsync("DELETE FROM mensalidades;");
  await db.runAsync("INSERT INTO mensalidades (valor, dataVencimento) VALUES (?, ?);",[valor, dataVencimento]);
}
export async function getMensalidade() {
  const db = await getDB();
  const result = await db.getAllAsync("SELECT * FROM mensalidades LIMIT 1;");
  return result.length > 0 ? result[0] : null;
}

export async function getLembretes() {
    const database = await getDB();
    return await database.getAllAsync("SELECT * FROM lembretes ORDER BY data, hora;");
}
export async function salvarLembrete(titulo, data, hora = null) {
    const database = await getDB();
    await database.runAsync(`INSERT INTO lembretes (titulo, data, hora) VALUES (?, ?, ?);`,[titulo, data, hora]);
}
export async function editLembrete(id, titulo, data, hora = null) {
    const database = await getDB();
    await database.runAsync(`UPDATE lembretes SET titulo = ?, data = ?, hora = ? WHERE id = ?;`,[titulo, data, hora, id]);
}
export async function removeLembrete(id) {
    const database = await getDB();
    await database.runAsync(`DELETE FROM lembretes WHERE id = ?;`, [id]);
}