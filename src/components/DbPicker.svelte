<script lang="ts">
  import { onMount } from "svelte";
  import { getDbList, deleteDb, saveDb, getDb } from "../lib/db";
  import type { StoredDbMetadata } from "../lib/types";
  import { Question } from "../lib/types";
  import {
    Folder,
    FolderArchive,
    LucideMousePointerSquareDashed,
    PlusCircle,
    Save,
    Trash,
    Upload,
  } from "@lucide/svelte";
  import { openDirectory, openZip } from "../lib/lib";

  // Provide a default empty function for safety
  let { passDBtoParent = () => {} } = $props();

  enum DBPickerState {
    StartScreen,
    Adding,
    LoadingFolder,
    LoadingZip,
    LoadedTempDB,
  }

  let dbPickerState = $state(DBPickerState.StartScreen);

  // functions for dbs in localStorage
  let dbs: StoredDbMetadata[] = $state([]);

  onMount(() => {
    dbs = getDbList();
    console.log("Loaded dbs " + JSON.stringify(dbs));
  });

  export function refresh() {
    dbs = getDbList();
  }

  function loadDb(name: string) {
    let metadata = dbs.filter((db) => db.name === name)[0];
    let db = getDb(name);
    if (db != null && metadata != null) {
      passDBtoParent(db, metadata);
    } else {
      console.log(
        "Something went very wrong! Could not find the DB or it's metadata"
      );
    }
  }

  function handleDelete(name: string) {
    deleteDb(name);
    dbs = getDbList();
  }

  function saveTempDB(
    questions: Question[],
    images: [string, string][],
    name: string,
    desc: string
  ) {
    console.log("Saving db " + name);
    const db = {
      name: name,
      questions: questions,
      images: images,
      description: desc,
    };
    saveDb(db);
    dbs = getDbList();
    toggleAddDbPopup();
    discardTempDB();
  }

  let addingDbPopupVisible = $state(false);

  function toggleAddDbPopup() {
    addingDbPopupVisible = !addingDbPopupVisible;
  }

  // when a db is loaded, it's stored here before saving
  let tempQuestions: Question[] = $state([]);
  let tempImages: [string, string][] = $state([]);
  let tempName: string = $state("");
  let tempDesc: string = $state("");
  let tempDesiredLen: number | null = null;

  let unzipping: boolean = $state(false);
  let unzipped: number = $state(0);
  let unzipping_goal: number = $state(0);

  function unzippingProgress(idx: number, length: number): void {
    unzipped = idx;
    unzipping_goal = length;
  }

  function discardTempDB() {
    tempQuestions = [];
    tempImages = [];
    tempName = "";
    tempDesc = "";
    tempDesiredLen = null;
    unzipping = false;
    unzipped = 0;
    unzipping_goal = 0;
    dbPickerState = DBPickerState.StartScreen;
  }

  async function loadTempDB(isZip: boolean): Promise<void> {
    let dbFile: (File[] | undefined) | null = null;

    if (!isZip) {
      dbFile = await openDirectory();
      dbPickerState = DBPickerState.LoadingFolder;
    } else {
      dbPickerState = DBPickerState.LoadingZip;
      unzipping = true;
      dbFile = await openZip(unzippingProgress);
      unzipping = false;
    }
    if (!dbFile) {
      dbPickerState = DBPickerState.StartScreen;
      return;
    }
    let i = 0;
    let y = 0;
    while (i < dbFile.length) {
      if (dbFile[i].name.includes("txt")) {
        y++;
      }
      i++;
    }
    tempDesiredLen = y;
    for (let i = 0; i < dbFile.length; i++) {
      const file = dbFile[i];

      if (file.name.includes("txt")) {
        if (file.name.includes("answers_only")) {
          tempDesiredLen -= 1;
          continue;
        }
        const reader = new FileReader();
        reader.addEventListener("load", (event: ProgressEvent<FileReader>) => {
          if (event.target?.result) {
            tempQuestions.push(
              new Question(event.target.result as string, file.name)
            );
            if (tempQuestions.length == tempDesiredLen) {
              // loading has finished!
              tempQuestions.sort((a, b) => {
                return a.number > b.number ? 1 : -1;
              });
              dbPickerState = DBPickerState.LoadedTempDB;
            }
          }
        });
        reader.readAsText(file);
      } else if (file.name.includes("nfo")) {
        const reader = new FileReader();
        console.log("Reading tempDescription");
        reader.addEventListener("load", (event: ProgressEvent<FileReader>) => {
          tempDesc = event.target?.result as string;
        });
        reader.readAsText(file);
      } else if (file.name.includes("jpg") || file.name.includes("png")) {
        const reader = new FileReader();
        reader.addEventListener("load", (event: ProgressEvent<FileReader>) => {
          let fileNameRelative = file.name;
          fileNameRelative = fileNameRelative.split("/").pop()!;
          if (event.target?.result) {
            tempImages.push([fileNameRelative, event.target.result as string]);
          }
        });
        reader.readAsDataURL(file);
      }
    }
    console.log(tempQuestions);
    console.log(tempImages);
  }
</script>

<div class="flex gap-2 flex-col bg-gray-800 p-2 h-min overflow-auto">
  {#if addingDbPopupVisible}
    <div
      class="absolute inset-0 flex align-middle items-center justify-center z-50 bg-black/50 bg-opacity-50"
    >
      <dialog
        class="m-auto flex flex-col bg-gray-700 text-white p-4 rounded shadow-lg gap-8"
        open
      >
        <div class="flex items-center align-middle gap-4 justify-between">
          <h3 class="text-xl">Dodaj nową bazę</h3>
          <button onclick={toggleAddDbPopup}> Zamknij </button>
        </div>
        {#if dbPickerState === DBPickerState.StartScreen}
          <div class="flex w-full gap-2">
            <button
              onclick={async () => {
                loadTempDB(false);
              }}
            >
              <Folder /> Z folderu
            </button>
            <button
              onclick={async () => {
                loadTempDB(true);
              }}
            >
              <FolderArchive /> Z pliku .zip</button
            >
          </div>
        {:else if dbPickerState === DBPickerState.LoadingFolder}
          <p>Ładowanie...</p>
        {:else if dbPickerState === DBPickerState.LoadingZip}
          <p>Odpakowano {unzipped} z {unzipping_goal} plików</p>
          <progress value={unzipped} max={unzipping_goal}></progress>
        {:else if dbPickerState === DBPickerState.LoadedTempDB}
          <p>Baza załadowana</p>
          <p>Liczba pytań: <b>{tempDesiredLen}</b></p>
          <label for="tempDBTitle">Tytuł:</label>
          <input
            class="bg-gray-800 p-2"
            id="tempDBTitle"
            bind:value={tempName}
          />
          <label for="tempDBDesc">Opis:</label>
          <textarea
            class="bg-gray-800 p-2"
            id="tempDBDesc"
            bind:value={tempDesc}
          ></textarea>
          <div class="flex items-center align-middle gap-4 justify-between">
            <button onclick={discardTempDB}> <Trash /> Odrzuć</button>
            <button
              onclick={() =>
                saveTempDB(tempQuestions, tempImages, tempName, tempDesc)}
              ><Save />Zapisz</button
            >
          </div>
        {/if}
      </dialog>
    </div>
  {/if}
  <h2 class="text-2xl">Zapisane bazy</h2>
  <button onclick={toggleAddDbPopup}><PlusCircle /> Dodaj nową </button>
  {#if dbs.length === 0}
    <p>Brak zapisanych baz.</p>
  {:else}
    <ul class="flex flex-col gap-2">
      {#each dbs as db}
        <li class="bg-gray-700 p-2 gap-4 flex items-center justify-between">
          <div>
            <h3 class="text-xl">{db.name}</h3>
            <p><b>{db.questionCount}</b> pytań</p>
            <p>Zaimportowano: {new Date(db.createdAt).toLocaleString()}</p>
          </div>
          <div class="flex gap-2">
            <button onclick={() => loadDb(db.name)}><Upload /></button>
            <button onclick={() => handleDelete(db.name)}><Trash /></button>
          </div>
        </li>
      {/each}
    </ul>
  {/if}
</div>
