<script lang="ts">
  import uFuzzy from "@leeoniya/ufuzzy";
  import type { Question } from "../lib/types";
  import { SearchIcon } from "@lucide/svelte";

  let { db } = $props<{ db: Question[] }>();

  let phrase: string = $state("");
  let includeAnswers: boolean = $state(false);

  const db_titles = $derived(db.map((question: Question) => question.title));
  const db_answers = $derived(
    db.map(
      (question: Question) => question.title + " " + question.answers.join(" ")
    )
  );

  let results: Question[] = $state([]);

  const uf = new uFuzzy({});

  function search() {
    if (!phrase) {
      results = db; // If search is empty, show all questions from the current db
      return;
    }

    const haystack = includeAnswers ? db_answers : db_titles;
    const [idxs, info, order] = uf.search(haystack, phrase);

    if (idxs && order) {
      results = order.map((i) => db[idxs[i]]);
    } else {
      results = [];
    }
  }

  // This will automatically re-run the search whenever the user types,
  // toggles the checkbox, OR when a new `db` is passed in.
  $effect(() => {
    search();
  });
</script>

<div class="bg-gray-800 p-2 overflow-auto flex-grow min-h-0 flex flex-col">
  <div
    class="flex gap-2 flex-col bg-gray-700 p-2 sticky top-0 shadow-lg shadow-gray-800"
  >
    <div class="flex gap-2 justify-between">
      <span class="flex gap-2">
        <SearchIcon />
        <h2 class="text-xl">Przeszukaj</h2>
      </span>
      <span>
        <input id="inclAnswers" type="checkbox" bind:checked={includeAnswers} />
        <label for="inclAnswers">Uwzględnij odpowiedzi</label>
      </span>
    </div>
    <div>
      <input class="bg-gray-600 w-full" type="text" bind:value={phrase} />
    </div>
  </div>

  <div class="flex flex-col gap-4 mt-4 text-gray-100">
    {#each results as result}
      <div class="bg-gray-700 p-2">
        <p class="mb-2">{result.title}</p>
        <ul>
          {#each result.answers as answer, y}
            {#if result.correctAnswers[y]}
              <li class="text-green-300">
                {answer}
              </li>
            {:else}
              <li class="text-red-300">
                {answer}
              </li>
            {/if}
          {/each}
        </ul>
      </div>
    {/each}
  </div>
</div>
