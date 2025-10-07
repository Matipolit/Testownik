<script lang="ts">
  import { openDirectory, openZip, shuffle } from "./lib/lib";
  import { Question, type StoredDb, type StoredDbMetadata } from "./lib/types";
  import Test from "./components/Test.svelte";
  import Search from "./components/Search.svelte";
  import DbPicker from "./components/DbPicker.svelte";
  import { ListCheck, Pencil, ArrowLeft } from "@lucide/svelte";
  import app from "./main";

  enum AppState {
    StartScreen,
    Testing,
  }

  let usingShuffled: boolean = $state(false);

  let appState = $state(AppState.StartScreen);

  let newDB: StoredDb | null = $state(null);
  let newShuffDB: StoredDb | null = $state(null);
  let newDBMetadata: StoredDbMetadata | null = $state(null);

  function unloadDB() {
    newDB = null;
    newDBMetadata = null;
    newShuffDB = null;
    appState = AppState.StartScreen;
  }

  function handlePassDBCallback(db: StoredDb, metadata: StoredDbMetadata) {
    newDB = db;
    newDBMetadata = metadata;
    const questionsToShuff = [...db.questions];
    shuffle(questionsToShuff);
    newShuffDB = {
      name: db.name,
      questions: questionsToShuff,
      images: db.images,
      description: db.description,
    };
    console.log("Parent got db: " + newDBMetadata.name);
  }
</script>

<main class="h-full">
  <div class="flex flex-col h-full">
    <div
      class="flex gap-8 align-middle items-center justify-between bg-gray-800 p-4"
    >
      <div class="flex gap-4 items-center">
        <Pencil />
        <h1 class="text-2xl">Testownik</h1>
      </div>
      {#if newDB !== null && newDBMetadata !== null && appState === AppState.StartScreen}
        <button class="md:hidden flex gap-2" onclick={unloadDB}>
          <ArrowLeft /> Wróć
        </button>
      {:else if newDB !== null && newDBMetadata !== null && appState === AppState.Testing}
        <button
          onclick={() => {
            appState = AppState.StartScreen;
          }}
        >
          <ArrowLeft /> Zakończ test
        </button>
      {/if}
    </div>

    {#if appState === AppState.Testing && newDB !== null && newDBMetadata !== null && newShuffDB !== null}
      <div class="flex-grow min-h-0">
        <Test
          db={usingShuffled ? newShuffDB.questions : newDB.questions}
          images={newDB.images}
        />
      </div>
    {:else if appState === AppState.StartScreen}
      <div class="flex flex-col md:flex-row gap-2 h-full flex-grow min-h-0 p-2">
        <div
          class="w-full md:flex-1/2 flex flex-col gap-2 justify-start overflow-auto"
          class:hidden={newDB !== null}
          class:md:flex={newDB !== null}
        >
          <DbPicker passDBtoParent={handlePassDBCallback} />
        </div>
        <div
          class="w-full md:w-max md:flex-1/2 flex flex-col gap-2 justify-start min-h-0"
          class:hidden={newDB === null}
          class:md:flex={newDB === null}
        >
          {#if newDB === null || newDBMetadata === null}
            <span>Brak wybranej bazy.</span>
          {:else}
            <div class="flex justify-between items-center">
              <h2 class="text-2xl">{newDBMetadata.name}</h2>
            </div>

            <p>{newDB.description}</p>
            <p><b>{newDBMetadata.questionCount}</b> Pytań</p>
            <div class="bg-gray-800 p-2">
              <button
                onclick={() => {
                  appState = AppState.Testing;
                }}><ListCheck />Rozpocznij test</button
              >
            </div>
            <Search db={newDB.questions} />
          {/if}
        </div>
      </div>
    {/if}
  </div>
</main>
