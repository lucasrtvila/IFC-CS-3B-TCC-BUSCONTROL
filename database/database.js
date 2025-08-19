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

// Função para migrar o banco (adicionar coluna CPF se não existir)
export async function migrateDatabase() {
  return queueOperation(async () => {
    const database = await getDB();
    
    try {
      // Verifica se a coluna CPF já existe
      const cpfExists = await checkIfColumnExists('alunos', 'cpf');
      
      if (!cpfExists) {
        console.log("Adicionando coluna CPF à tabela alunos...");
        await database.execAsync(`ALTER TABLE alunos ADD COLUMN cpf TEXT;`);
        console.log("Coluna CPF adicionada com sucesso!");
      } else {
        console.log("Coluna CPF já existe!");
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
      // Dropa todas as tabelas
      await database.execAsync(`
        DROP TABLE IF EXISTS alunos;
        DROP TABLE IF EXISTS veiculos;
        DROP TABLE IF EXISTS paradas;
        DROP TABLE IF EXISTS lembretes;
      `);
      
      console.log("✅ Tabelas removidas, recriando...");
      
      // Recria as tabelas com o schema correto
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
          paradaId INTEGER
        );
        CREATE TABLE paradas (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          nome TEXT NOT NULL
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
      
      // Criar tabelas apenas se não existirem
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
          paradaId INTEGER
        );
        
        CREATE TABLE IF NOT EXISTS paradas (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          nome TEXT NOT NULL
        );
        
        CREATE TABLE IF NOT EXISTS lembretes (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          nome TEXT NOT NULL,
          data TEXT NOT NULL
        );
      `);
      
      console.log("✅ Tabelas verificadas/criadas com sucesso!");
      
      // Verifica se a coluna CPF existe (migração se necessário)
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

//funcões para veiculos
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
export async function addAluno(nome, cpf, status, ultimoPagamento = '') {
  return queueOperation(async () => {
    console.log("=== ADDALUNO NO BANCO ===");
    console.log("Parâmetros:", { nome, cpf, status, ultimoPagamento });
    
    const database = await getDB();
    console.log("Database obtido:", !!database);
    
    try {
      const result = await database.runAsync(
        "INSERT INTO alunos (nome, cpf, status, ultimoPagamento) VALUES (?, ?, ?, ?)",
        [nome, cpf || '', status, ultimoPagamento]
      );
      console.log("✅ Inserção bem-sucedida! Result:", result);
      console.log("ID inserido:", result.lastInsertRowId);
      return result;
    } catch (error) {
      console.log("❌ Erro na inserção:", error);
      throw error;
    }
  });
}

// CORRIGIDO: Função updateAluno com todos os campos na ordem correta
export async function updateAluno(id, nome, cpf, ultimoPagamento, status) {
  return queueOperation(async () => {
    const database = await getDB();
    console.log("Atualizando aluno no banco:", { id, nome, cpf, ultimoPagamento, status }); // Debug
    return await database.runAsync(
      "UPDATE alunos SET nome = ?, cpf = ?, ultimoPagamento = ?, status = ? WHERE id = ?",
      [nome, cpf || '', ultimoPagamento || '', status, id]
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