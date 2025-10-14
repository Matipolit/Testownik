import type { Question, StoredDb, StoredDbMetadata } from "./types";

const DB_NAME = "TestownikDB";
const DB_VERSION = 1;
const METADATA_STORE = "metadata";
const QUESTIONS_STORE = "questions";
const IMAGES_STORE = "images";

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;

      if (!db.objectStoreNames.contains(METADATA_STORE)) {
        db.createObjectStore(METADATA_STORE, { keyPath: "name" });
      }
      if (!db.objectStoreNames.contains(QUESTIONS_STORE)) {
        db.createObjectStore(QUESTIONS_STORE, { keyPath: "name" });
      }
      if (!db.objectStoreNames.contains(IMAGES_STORE)) {
        db.createObjectStore(IMAGES_STORE);
      }
    };
  });
}

export async function saveDb(name: string, questions: Question[], images: [string, File][], description: string): Promise<void> {
  const idb = await openDB();
  const tx = idb.transaction([METADATA_STORE, QUESTIONS_STORE, IMAGES_STORE], "readwrite");

  console.log("got " + questions.length + " questions")
  const metadata: StoredDbMetadata = {
    name: name,
    description: description,
    questionCount: questions.length,
    createdAt: new Date(),
  };

  tx.objectStore(METADATA_STORE).put(metadata);
  tx.objectStore(QUESTIONS_STORE).put({ name: name, questions: JSON.parse(JSON.stringify(questions)) });

  // Store images with composite key
  const imageStore = tx.objectStore(IMAGES_STORE);
  for (const [imageName, blob] of images) {
    imageStore.put(blob, `${name}:${imageName}`);
  }

  return new Promise<void>((resolve, reject) => {
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export async function getDbList(): Promise<StoredDbMetadata[]> {
  const idb = await openDB();
  const tx = idb.transaction(METADATA_STORE, "readonly");
  const store = tx.objectStore(METADATA_STORE);
  
  return new Promise((resolve, reject) => {
    const request = store.getAll();
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function getDb(name: string): Promise<StoredDb | null> {
  const idb = await openDB();
  const tx = idb.transaction([METADATA_STORE, QUESTIONS_STORE, IMAGES_STORE], "readonly");

  const metadata = await new Promise<StoredDbMetadata>((resolve, reject) => {
    const request = tx.objectStore(METADATA_STORE).get(name);
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });

  if (!metadata) return null;

  const questionsData = await new Promise<{ name: string; questions: any[] }>((resolve, reject) => {
    const request = tx.objectStore(QUESTIONS_STORE).get(name);
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });

  // Get all images for this database
  const imageStore = tx.objectStore(IMAGES_STORE);
  const images: [string, Blob][] = await new Promise((resolve, reject) => {
    const request = imageStore.openCursor();
    const results: [string, Blob][] = [];

    request.onsuccess = (event) => {
      const cursor = (event.target as IDBRequest).result;
      if (cursor) {
        const key = cursor.key as string;
        if (key.startsWith(`${name}:`)) {
          const imageName = key.substring(name.length + 1);
          results.push([imageName, cursor.value]);
        }
        cursor.continue();
      } else {
        resolve(results);
      }
    };
    request.onerror = () => reject(request.error);
  });

  return {
    name: metadata.name,
    questions: questionsData.questions,
    images,
  };
}

export async function deleteDb(name: string): Promise<void> {
  const idb = await openDB();
  const tx = idb.transaction([METADATA_STORE, QUESTIONS_STORE, IMAGES_STORE], "readwrite");

  tx.objectStore(METADATA_STORE).delete(name);
  tx.objectStore(QUESTIONS_STORE).delete(name);

  // Delete all images for this database
  const imageStore = tx.objectStore(IMAGES_STORE);
  const request = imageStore.openCursor();

  request.onsuccess = (event) => {
    const cursor = (event.target as IDBRequest).result;
    if (cursor) {
      const key = cursor.key as string;
      cursor.continue();
    }
  };

  return new Promise<void>((resolve, reject) => {
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

