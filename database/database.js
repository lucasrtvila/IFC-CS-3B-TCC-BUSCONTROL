import * as SQLite from "expo-sqlite";

// SOLUÇÃO: Uma única conexão reutilizada + fila de operações
let db;
let operationQueue = Promise.resolve();

async function getDB() {
  if (!db) {
    db = await SQLite.openDatabaseAsync("buscontrol.db");
  }
  return db;
}

// Função para enfileirar operações (evita conflitos)
function queueOperation(operation) {
  operationQueue = operationQueue.then(operation).catch(error => {
    console.log('Erro na operação:', error);
    throw error;
  });
  return operationQueue;
}

// Função para verificar se uma coluna existe
async function checkIfColumnExists(tableName, columnName) {
  const database = await getDB();
  const result = await database.getAllAsync(`PRAGMA table_info(${tableName})`);
  return result.some(column => column.name === columnName);
}

// Função para migrar o banco (adicionar coluna telefone se não existir)
export async function migrateDatabase() {
  return queueOperation(async () => {
    const database = await getDB();
    try {
      const telefoneExists = await checkIfColumnExists('alunos', 'telefone');
      if (!telefoneExists) {
        console.log("Adicionando coluna telefone à tabela alunos...");
        await database.execAsync(`ALTER TABLE alunos ADD COLUMN telefone TEXT;`);
        console.log("Coluna telefone adicionada com sucesso!");
      } else {
        console.log("Coluna telefone já existe!");
      }
    } catch (error) {
      console.log("Erro na migração:", error);
    }
  });
}

// Função para resetar o banco (use apenas se necessário - APAGA TODOS OS DADOS!)
export async function resetDatabase() {
  return queueOperation(async () => {
    console.log("⚠️  RESETANDO BANCO - TODOS OS DADOS SERÃO PERDIDOS!");
    const database = await getDB();
    
    try {
      await database.execAsync(`
        DROP TABLE IF EXISTS alunos;
        DROP TABLE IF EXISTS veiculos;
        DROP TABLE IF EXISTS paradas;
        DROP TABLE IF EXISTS lembretes;
      `);
      
      console.log("✅ Tabelas removidas, recriando...");
      
      await database.execAsync(`
        CREATE TABLE veiculos (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          nome TEXT NOT NULL,
          status TEXT NOT NULL
        );
        CREATE TABLE alunos (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          nome TEXT NOT NULL,
          cpf TEXT,
          ultimoPagamento TEXT,
          status TEXT NOT NULL,
          telefone TEXT,
          paradaId INTEGER,
          horario TEXT
        );
        CREATE TABLE paradas (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          nome TEXT NOT NULL,
          horario TEXT
        );
        CREATE TABLE lembretes (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          nome TEXT NOT NULL,
          data TEXT NOT NULL
        );
      `);
      
      console.log("✅ Banco de dados resetado com sucesso!");
    } catch (error) {
      console.log("❌ Erro ao resetar banco:", error);
    }
  });
}

export async function initDB() {
  return queueOperation(async () => {
    console.log("=== INIT DB - COMEÇOU ===");
    
    try {
      const database = await getDB();
      console.log("✅ Database connection obtida");
      
      console.log("🔄 Criando tabelas (se não existirem)...");
      await database.execAsync(`
        CREATE TABLE IF NOT EXISTS veiculos (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          nome TEXT NOT NULL,
          status TEXT NOT NULL
        );
        
        CREATE TABLE IF NOT EXISTS alunos (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          nome TEXT NOT NULL,
          cpf TEXT,
          ultimoPagamento TEXT,
          status TEXT NOT NULL,
          telefone TEXT,
          paradaId INTEGER,
          horario TEXT
        );
        
        CREATE TABLE IF NOT EXISTS paradas (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          nome TEXT NOT NULL,
          horario TEXT
        );
        
        CREATE TABLE IF NOT EXISTS lembretes (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          nome TEXT NOT NULL,
          data TEXT NOT NULL
        );
      `);
      
      console.log("✅ Tabelas verificadas/criadas com sucesso!");
      
      const columns = await database.getAllAsync("PRAGMA table_info(alunos)");
      console.log("✅ Colunas da tabela alunos:", columns.map(c => c.name));
      
      const temCPF = columns.some(col => col.name === 'cpf');
      if (!temCPF) {
        console.log("🔄 Adicionando coluna CPF...");
        await database.execAsync("ALTER TABLE alunos ADD COLUMN cpf TEXT;");
        console.log("✅ Coluna CPF adicionada!");
      }
      
      console.log("✅ INIT DB - SUCESSO TOTAL!");
      return true;
      
    } catch (error) {
      console.log("❌ ERRO NO INIT DB:", error);
      console.log("❌ Stack:", error.stack);
      throw error;
    }
  });
}

// Funções para veiculos
export async function getVeiculos() {
  return queueOperation(async () => {
    const database = await getDB();
    return await database.getAllAsync("SELECT * FROM veiculos");
  });
}

export async function addVeiculo(nome, status) {
  return queueOperation(async () => {
    const database = await getDB();
    return await database.runAsync(
      "INSERT INTO veiculos (nome, status) VALUES (?, ?)",
      [nome, status]
    );
  });
}

export async function updateVeiculo(id, nome, status) {
  return queueOperation(async () => {
    const database = await getDB();
    return await database.runAsync(
      "UPDATE veiculos SET nome = ?, status = ? WHERE id = ?",
      [nome, status, id]
    );
  });
}

export async function deleteVeiculo(id) {
  return queueOperation(async () => {
    const database = await getDB();
    return await database.runAsync(
      "DELETE FROM veiculos WHERE id = ?",
      [id]
    );
  });
}

// Funções para alunos - CORRIGIDAS
export async function getAlunos() {
  return queueOperation(async () => {
    console.log("=== GETALUNOS NO BANCO ===");
    const database = await getDB();
    
    try {
      const result = await database.getAllAsync("SELECT * FROM alunos");
      console.log("✅ Consulta bem-sucedida! Encontrados:", result.length, "alunos");
      console.log("Dados:", result);
      return result;
    } catch (error) {
      console.log("❌ Erro na consulta:", error);
      throw error;
    }
  });
}

// CORRIGIDO: Função addAluno com todos os campos na ordem correta
export async function addAluno(nome, cpf, status, ultimoPagamento = '', telefone = '', paradaId = null) {
  return queueOperation(async () => {
    const database = await getDB();
    return await database.runAsync(
      "INSERT INTO alunos (nome, cpf, status, ultimoPagamento, telefone, paradaId) VALUES (?, ?, ?, ?, ?, ?)",
      [nome, cpf || '', status, ultimoPagamento, telefone || '', paradaId]
    );
  });
}

export async function updateAluno(id, nome, cpf, ultimoPagamento, status, telefone, paradaId, horario) {
  return queueOperation(async () => {
    const database = await getDB();
    return await database.runAsync(
      "UPDATE alunos SET nome = ?, cpf = ?, ultimoPagamento = ?, status = ?, telefone = ?, paradaId = ?, horario = ? WHERE id = ?",
      [nome, cpf || '', ultimoPagamento || '', status, telefone || '', paradaId, horario, id]
    );
  });
}

export async function deleteAluno(id) {
  return queueOperation(async () => {
    const database = await getDB();
    return await database.runAsync(
      "DELETE FROM alunos WHERE id = ?",
      [id]
    );
  });
}

// Funções para paradas (Novas)
export async function getParadas() {
  return queueOperation(async () => {
    const database = await getDB();
    const paradas = await database.getAllAsync("SELECT * FROM paradas ORDER BY id");
    
    // Contar alunos por parada
    const paradasComAlunos = await Promise.all(
      paradas.map(async (parada) => {
        const alunosNaParada = await database.getAllAsync(
          "SELECT id, nome, horario FROM alunos WHERE paradaId = ?",
          [parada.id]
        );
        return {
          ...parada,
          alunos: alunosNaParada,
          numAlunos: alunosNaParada.length,
        };
      })
    );
    return paradasComAlunos;
  });
}

export async function addParada(nome, horario) {
  return queueOperation(async () => {
    const database = await getDB();
    return await database.runAsync(
      "INSERT INTO paradas (nome, horario) VALUES (?, ?)",
      [nome, horario]
    );
  });
}

export async function updateParada(id, nome, horario) {
  return queueOperation(async () => {
    const database = await getDB();
    return await database.runAsync(       
      "UPDATE paradas SET nome = ?, horario = ? WHERE id = ?",
      [nome, horario, id]
    );
  });
}

export async function deleteParada(id) {
  return queueOperation(async () => {
    const database = await getDB();
    // Antes de deletar a parada, atualize todos os alunos que a ela pertencem
    await database.runAsync(
      "UPDATE alunos SET paradaId = NULL WHERE paradaId = ?",
      [id]
    );
    // Agora pode deletar a parada
    return await database.runAsync(
      "DELETE FROM paradas WHERE id = ?",
      [id]
    );
  });
}