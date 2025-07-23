import * as SQLite from "expo-sqlite";

let db;

export async function initDB() {
  db = await SQLite.openDatabaseAsync("buscontrol.db");
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS veiculos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nome TEXT NOT NULL,
      status TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS alunos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nome TEXT NOT NULL,
      ultimoPagamento TEXT,
      status TEXT NOT NULL
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
}

export async function getVeiculos() {
  const result = await db.getAllAsync("SELECT * FROM veiculos");
  return result;
}

export async function addVeiculo(nome, status) {
  if (!db) throw new Error("Banco de dados não inicializado!");
  await db.runAsync(
    "INSERT INTO veiculos (nome, status) VALUES (?, ?)",
    nome,
    status
  );
}

export async function updateVeiculo(id, nome, status) {
  if (!db) throw new Error("Banco de dados não inicializado!");
  await db.runAsync(
    "UPDATE veiculos SET nome = ?, status = ? WHERE id = ?",
    nome,
    status,
    id
  );
}

export async function deleteVeiculo(id) {
  if (!db) throw new Error("Banco de dados não inicializado!");
  await db.runAsync(
    "DELETE FROM veiculos WHERE id = ?",
    id
  );
}