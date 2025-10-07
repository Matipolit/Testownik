import type { StoredDb, StoredDbMetadata } from "./types";

const DB_PREFIX = "testownik_db_";

export function saveDb(db: StoredDb): void {
  const metadata: StoredDbMetadata = {
    name: db.name,
    questionCount: db.questions.length,
    createdAt: new Date(),
  };
  const dbList = getDbList();
  localStorage.setItem(DB_PREFIX + db.name, JSON.stringify(db));
  updateDbList(metadata);
}

export function getDb(name: string): StoredDb | null {
  const dbString = localStorage.getItem(DB_PREFIX + name);
  if (!dbString) {
    return null;
  }
  const db = JSON.parse(dbString) as StoredDb;
  return db;
}

export function getDbList(): StoredDbMetadata[] {
  const listString = localStorage.getItem(DB_PREFIX + "list");
  if (!listString) {
    return [];
  }
  return JSON.parse(listString);
}

function updateDbList(newDb: StoredDbMetadata): void {
  let list = getDbList();
  list = list.filter((db) => db.name !== newDb.name);
  list.push(newDb);
  localStorage.setItem(DB_PREFIX + "list", JSON.stringify(list));
}

export function deleteDb(name: string): void {
  localStorage.removeItem(DB_PREFIX + name);
  let list = getDbList();
  list = list.filter((db) => db.name !== name);
  localStorage.setItem(DB_PREFIX + "list", JSON.stringify(list));
}
