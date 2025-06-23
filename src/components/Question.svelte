<script>
  export let question;
  export let image;
  export let checked;
  // parent does `bind:onNextCallback` and calls it when moving on,
  // but because of our {#key}, it’s enough to let Svelte remount.
  export const onNextCallback = () => {};
  export const onCheckAnswersCallback = () =>
    markedAnswers.every((v, i) => v === question.correctAnswers[i]);

  let markedAnswers = [];

  // re‐initialize when question changes
  $: if (question) {
    markedAnswers = Array(question.answers.length).fill(false);
  }
</script>

{#key question.number}
  <div class="question">
    <div class="title">
      <div class="number">{question.number}</div>
      <h2>{question.title}</h2>
    </div>

    {#if image}
      <img
        alt="Ilustracja do pytania"
        style="max-width:80%; margin:24px"
        src={image[1]}
      />
    {/if}

    <div class="answers">
      {#each question.answers as answer, i}
        <!-- svelte-ignore a11y-click-events-have-key-events -->
        <div
          class="answer"
          class:correct={checked &&
            markedAnswers[i] &&
            question.correctAnswers[i]}
          class:incorrect={checked &&
            markedAnswers[i] &&
            !question.correctAnswers[i]}
          class:notMarked={checked &&
            !markedAnswers[i] &&
            question.correctAnswers[i]}
          on:click={() => (markedAnswers[i] = !markedAnswers[i])}
        >
          <input type="checkbox" bind:checked={markedAnswers[i]} />
          <p>{answer}</p>
        </div>
      {/each}
    </div>
  </div>
{/key}

<style>
  p {
    margin: 0;
  }
  .answer {
    display: flex;
    border-radius: 8px;
    padding: 0.5rem;
    margin: 0.5rem;
    background-color: var(--background);
    border-radius: 8px;
    border: 0.2em solid transparent;
    transition: border-color 0.1s;
    cursor: pointer;
  }
  .answer:hover {
    border-color: var(--accent);
  }
  .title {
    display: flex;
    align-items: center;
    gap: 8px;
    background-color: var(--background);
    padding: 0.3em 0.6em;
    border: 0.2em;
    border-radius: 8px;
    border-style: solid;
    border-color: var(--accent);
  }
  .number {
    font-weight: bold;
    font-size: 1.5em;
    padding: 0.3em 0.6em;
    border-radius: 8px;
    border: 0.2rem;
    border-radius: 8px;
    border-style: solid;
    border-color: var(--accent);
  }
  .answers {
    margin: 1rem;
  }
  .correct {
    background-color: var(--correct);
  }
  .incorrect {
    background-color: var(--incorrect);
  }
  .notMarked {
    background-color: var(--notMarked);
  }
</style>
