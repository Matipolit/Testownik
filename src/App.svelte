<script lang="ts">
  import { openDirectory, openZip, shuffle } from "./lib/lib";
  import { Question, type StoredDb, type StoredDbMetadata } from "./lib/types";
  import Test from "./components/Test.svelte";
  import Search from "./components/Search.svelte";
  import DbPicker from "./components/DbPicker.svelte";
  import { ListCheck, Pencil, SearchIcon } from "@lucide/svelte";

  enum AppState {
    StartScreen,
    Testing,
  }

  let usingShuffled: boolean = $state(false);

  let appState = $state(AppState.StartScreen);

  let newDB: StoredDb | null = $state(null);
  let newShuffDB: StoredDb | null = $state(null);
  let newDBMetadata: StoredDbMetadata | null = $state(null);

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

<main class="p-4 h-full">
  <div class="flex flex-col gap-4 h-full">
    {#if appState === AppState.Testing && newDB !== null && newDBMetadata !== null && newShuffDB !== null}
      <button
        onclick={() => {
          appState = AppState.StartScreen;
        }}>Zatrzymaj test</button
      >
      <Test
        db={usingShuffled ? newShuffDB.questions : newDB.questions}
        images={newDB.images}
      />
    {:else if appState === AppState.StartScreen}
      <div>
        <div class="flex gap-4">
          <Pencil />
          <h1 class="text-3xl bottom-2">Testownik</h1>
        </div>
        <p>
          Aplikacja do testowania zgodna z większością baz pytań używanych na
          PWR
        </p>
      </div>
      <div class="flex gap-2 h-full flex-grow min-h-0">
        <div
          class="flex-1/2 align-middle w-max flex flex-col gap-2 justify-start"
        >
          <DbPicker passDBtoParent={handlePassDBCallback} />
        </div>
        <div
          class="flex-1/2 align-middle w-max flex flex-col gap-2 justify-start"
        >
          {#if newDB === null || newDBMetadata === null}
            <span>Brak wybranej bazy.</span>
          {:else}
            <h2 class="text-2xl">{newDBMetadata.name}</h2>
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
