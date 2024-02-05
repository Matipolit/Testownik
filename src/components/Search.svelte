<script>
  import uFuzzy from '@leeoniya/ufuzzy';

  export let db;
  let phrase = "";
  let db_titles = db.map(question => question.title)
  let db_answers = db.map(question => question.title + " " + question.answers.join(" "))
  let results = [];
  let includeAnswers = false;
  let uf = new uFuzzy({});

  /**
     * @param {string} phrase
     */
  function search(phrase){
    results = [];
    let [idxs, info, order] = [null, null, null];

    if(includeAnswers){
      console.log("including answers");
      [idxs, info, order] = uf.search(db_answers, phrase);
    }else{
      [idxs, info, order] = uf.search(db_titles, phrase);
    }

    if(idxs != null){
      idxs.forEach((idx, i) => {
        results[order[i] ]= db[idx];
      })
    }
  
  }
</script>
<div>
  <h2>
    Przeszukaj bazę

  </h2>
    <label for="inclAnswers">Przeszukaj pytania</label>
    <input id="inclAnswers" type=checkbox bind:checked={includeAnswers} on:change={search(phrase)} />
    <input type=text bind:value={phrase} on:input={event => search(event.target.value)} />
    <div class="results">
    {#each results as result, i}
      <div class="searchQuestion">
        <h3>{result.title}</h3>
          <ul>
            {#each result.answers as answer, y}
              <li class={result.correctAnswers[y] ? "correct" : "incorrect"}>{answer}</li>
            {/each}
          </ul>
      </div>
    {/each}
    </div>
</div>

<style>
  ul {
    list-style-type: none;
    padding:0;
    margin: 0;
  }
  .results {
    display: flex;
    gap: 8px;
    flex-direction: column;
  }
  .searchQuestion {
    background-color: var(--background);
    border: solid 2px var(--accent);
    padding: 0.5rem;
    border-radius: 8px;
  }
  .correct {
    color: var(--correct);
  }
  .incorrect {
    color: var(--incorrect);
  }
</style>
