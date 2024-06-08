<script>
  import { openDirectory, Question } from "./lib/lib";
  import Test from "./components/Test.svelte";
  import Search from "./components/Search.svelte";
  let dbFile = null;
  let db = null;
  let images = null;
  let desc = null;
  let desiredLen = null;
  let wholeDb = false;
  let testing = false;
  let searching = false;
  
  async function setDb(){
    wholeDb = false;
    testing = false;
    desc = null;
    db = [];
    images = [];
    dbFile = await openDirectory();
    let i = 0;
    let y = 0;
    while(i < dbFile.length){
      if(dbFile[i].name.includes("txt")){
        y++;
      }
      i++;
    }
    desiredLen = y;
    for(let i = 0; i < dbFile.length; i++){
      const file = dbFile[i];
      if(file.name.includes("txt")){
        const reader = new FileReader();
        reader.addEventListener('load', (event) => {
          db.push(new Question(event.target.result, file.name));
          if(db.length == desiredLen){
            db.sort((a, b) => {return(a.number > b.number)})
            wholeDb = true;
          }
        })
        reader.readAsText(file);
      }else if(file.name.includes("nfo")){
        const reader = new FileReader();
        console.log("Reading description");
        reader.addEventListener('load', (event) => {
          desc = event.target.result;
        })
        reader.readAsText(file);
      }else if(file.name.includes("jpg") | file.name.includes("png")){
        const reader = new FileReader();
        reader.addEventListener('load', (event) => {
          images.push([file.name, event.target.result])
        })
        reader.readAsDataURL(file);
      }
    }
    console.log(db);
    console.log(images);
  }
</script>

<main>
  <div>
    {#if testing}
      <button on:click={() => {testing = false;}}>Stop test</button>
      <Test db={db} images={images}/>
    {:else if searching}
      <button on:click={() => {searching = false;}}>Stop search</button>
      <Search db={db} />
    {:else}
      {#if !dbFile}
        <h1>Testownik online</h1>
        <h3>By Mateusz Polito</h3>
        <p>Uwaga: jeżeli po załadowaniu polskie znaki wyświetlają się błędnie, przekonwertuj wszystkie pliki na UTF-8</p>
        <button on:click={() => {setDb();}}>Wybierz bazę danych</button>
      {:else}
        {#if !wholeDb}
          <p>Ładowanie...</p>
        {:else}
          <h3>Baza danych załadowana</h3>
          {#if desc}
            <h2>{desc}</h2>
          {/if}
          <p>Ilość pytań: <b>{db.length}</b></p>
          <button on:click={() => {testing = true;}}>Zacznij test</button>
          <button on:click={() => {testing = false; searching = true;}}>Przeszukaj bazę</button>
          <br>
          <br>
          <button on:click={() => {setDb();}}>Nowa baza</button>
        {/if}
      {/if}
    {/if}
  </div>
</main>
