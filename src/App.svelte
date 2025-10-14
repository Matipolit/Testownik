<script lang="ts">
  import { shuffle } from "./lib/lib";
  import { type StoredDb, type StoredDbMetadata } from "./lib/types";
  import Test from "./components/Test.svelte";
  import Search from "./components/Search.svelte";
  import DbPicker from "./components/DbPicker.svelte";
  import { ListCheck, Pencil, ArrowLeft } from "@lucide/svelte";

  enum AppState {
    StartScreen,
    Testing,
  }

  let usingShuffled: boolean = $state(false);

  let appState = $state(AppState.StartScreen);

  let selectedDb: StoredDb | null = $state(null);
  let shuffDB: StoredDb | null = $state(null);
  let dbMetadata: StoredDbMetadata | null = $state(null);

  function unloadDB() {
    selectedDb = null;
    dbMetadata = null;
    shuffDB = null;
    appState = AppState.StartScreen;
  }

  function handlePassDBCallback(db: StoredDb, metadata: StoredDbMetadata) {
    selectedDb = db;
    console.log("Received DB and metadata from DbPicker:");
    console.log("DB: ");
    console.log(db);
    console.log("Metadata: ");
    console.log(metadata);
    console.log("Images: " + JSON.stringify(db.images));
    dbMetadata = metadata;
    const questionsToShuff = [...db.questions];
    shuffle(questionsToShuff);
    shuffDB = {
      name: db.name,
      questions: questionsToShuff,
      images: db.images,
    };
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
      {#if selectedDb !== null && dbMetadata !== null && appState === AppState.StartScreen}
        <button class="md:hidden flex gap-2" onclick={unloadDB}>
          <ArrowLeft /> Wróć
        </button>
      {:else if selectedDb !== null && dbMetadata !== null && appState === AppState.Testing}
        <button
          onclick={() => {
            appState = AppState.StartScreen;
          }}
        >
          <ArrowLeft /> Zakończ test
        </button>
      {/if}
    </div>

    {#if appState === AppState.Testing && selectedDb !== null && dbMetadata !== null && shuffDB !== null}
      <div class="flex-grow min-h-0">
        <Test
          db={usingShuffled ? shuffDB.questions : selectedDb.questions}
          images={selectedDb.images}
        />
      </div>
    {:else if appState === AppState.StartScreen}
      <div class="flex flex-col md:flex-row gap-2 h-full flex-grow min-h-0 p-2">
        <div
          class="w-full md:flex-1/2 flex flex-col gap-2 justify-start overflow-auto"
          class:hidden={selectedDb !== null}
          class:md:flex={selectedDb !== null}
        >
          <DbPicker passDBtoParent={handlePassDBCallback} />
        </div>
        <div
          class="w-full md:w-max md:flex-1/2 flex flex-col gap-2 justify-start min-h-0"
          class:hidden={selectedDb === null}
          class:md:flex={selectedDb === null}
        >
          {#if selectedDb === null || dbMetadata === null}
            <span>Brak wybranej bazy.</span>
          {:else}
            <div class="flex justify-between items-center">
              <h2 class="text-2xl">{dbMetadata.name}</h2>
            </div>

            <p>{dbMetadata.description}</p>
            <p><b>{dbMetadata.questionCount}</b> Pytań</p>
            <div class="bg-gray-800 p-2">
              <button
                onclick={() => {
                  appState = AppState.Testing;
                }}><ListCheck />Rozpocznij test</button
              >
            </div>
            <Search db={selectedDb.questions} images={selectedDb.images} />
          {/if}
        </div>
      </div>
    {/if}
  </div>
</main>
