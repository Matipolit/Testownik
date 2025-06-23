<script>
  import { openDirectory, openZip, Question, shuffle } from "./lib/lib";
  import Test from "./components/Test.svelte";
  import Search from "./components/Search.svelte";
  let dbFile = null;
  let db = $state(null);
  let shuffDb = $state([]);
  let images = $state(null);
  let desc = $state(null);
  let desiredLen = null;
  let wholeDb = false;
  let testing = $state(false);
  let searching = $state(false);

  let loading = $state(false);
  let unzipping = $state(false);
  let unzipped = $state(0);
  let unzipping_goal = $state(0);

  let startScreen = $state(true);
  let usingShuffled = $state(false);

  let supportsFileSystemAccess =
    "webkitdirectory" in document.createElement("input");

  function removeDb() {
    wholeDb = false;
    testing = false;
    searching = false;
    startScreen = true;
    desc = null;
    db = [];
    images = [];
  }

  function unzippingProgress(idx, length) {
    unzipped = idx;
    unzipping_goal = length;
  }

  async function setDb(isZip) {
    wholeDb = false;
    testing = false;
    searching = false;
    desc = null;
    db = [];
    images = [];
    if (!isZip) {
      dbFile = await openDirectory();
    } else {
      unzipping = true;
      dbFile = await openZip(unzippingProgress);
      unzipping = false;
    }
    let i = 0;
    let y = 0;
    while (i < dbFile.length) {
      if (dbFile[i].name.includes("txt")) {
        y++;
      }
      i++;
    }
    desiredLen = y;
    for (let i = 0; i < dbFile.length; i++) {
      const file = dbFile[i];

      if (file.name.includes("txt")) {
        if (file.name.includes("answers_only")) {
          desiredLen -= 1;
          continue;
        }
        const reader = new FileReader();
        reader.addEventListener("load", (event) => {
          db.push(new Question(event.target.result, file.name));
          if (db.length == desiredLen) {
            db.sort((a, b) => {
              return a.number > b.number;
            });
            shuffDb = [...db];
            shuffle(shuffDb);
            wholeDb = true;
            loading = false;
          }
        });
        reader.readAsText(file);
      } else if (file.name.includes("nfo")) {
        const reader = new FileReader();
        console.log("Reading description");
        reader.addEventListener("load", (event) => {
          desc = event.target.result;
        });
        reader.readAsText(file);
      } else if (file.name.includes("jpg") | file.name.includes("png")) {
        const reader = new FileReader();
        reader.addEventListener("load", (event) => {
          let fileNameRelative = file.name;
          fileNameRelative = fileNameRelative.split("/");
          fileNameRelative = fileNameRelative[fileNameRelative.length - 1];
          images.push([fileNameRelative, event.target.result]);
        });
        reader.readAsDataURL(file);
      }
    }
    console.log("shuff len: ", shuffDb.length);
    console.log(db);
    console.log(images);
  }
</script>

<main>
  <div>
    {#if testing}
      <button
        onclick={() => {
          testing = false;
        }}>Zatrzymaj test</button
      >
      <Test db={usingShuffled ? shuffDb : db} {images} />
    {:else if searching}
      <button
        onclick={() => {
          searching = false;
        }}>Zatrzymaj szukanie</button
      >
      <Search {db} />
    {:else if startScreen}
      <h1>Testownik online</h1>
      <h3>By Mateusz Polito</h3>
      <button
        class="action"
        onclick={async () => {
          loading = true;
          startScreen = false;
          setDb(false);
        }}>Wybierz bazę danych</button
      >
      {#if !supportsFileSystemAccess}
        <p>
          Jest szansa, że Twoja przeglądarka nie wspiera otwierania folderów!
        </p>
      {/if}
      <button
        class="action"
        onclick={async () => {
          loading = true;
          startScreen = false;
          await setDb(true);
        }}>Przekaż bazę jako .zip</button
      >
      <p>
        Uwaga: jeżeli po załadowaniu polskie znaki wyświetlają się błędnie,
        przekonwertuj wszystkie pliki na UTF-8
      </p>
    {:else if loading}
      <p>Ładowanie...</p>
      {#if unzipping}
        <p>Odpakowano {unzipped} z {unzipping_goal} plików</p>
        <progress value={unzipped} max={unzipping_goal}></progress>
      {/if}
    {:else}
      <h3>Baza danych załadowana</h3>
      {#if desc}
        <h2>{desc}</h2>
      {/if}
      <p>Ilość pytań: <b>{db.length}</b></p>
      <div>
        <label>
          <input type="checkbox" bind:checked={usingShuffled} />
          Użyj pomieszanej bazy
        </label>
        <button
          class="action"
          onclick={() => {
            testing = true;
          }}>Zacznij test</button
        >
        <button
          class="secondary"
          onclick={() => {
            shuffle(shuffDb);
          }}>Przemieszaj jeszcze raz</button
        >
      </div>
      <button
        class="action"
        onclick={() => {
          testing = false;
          searching = true;
        }}>Przeszukaj bazę</button
      >
      <br />
      <br />
      <button
        onclick={() => {
          removeDb();
        }}>Nowa baza</button
      >
    {/if}
  </div>
</main>
