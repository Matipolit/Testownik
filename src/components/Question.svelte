<script lang="ts">
  import type { Question } from "../lib/types";

  export let question: Question;
  export let image: [string, string] | undefined;
  export let checked: boolean;
  // parent does `bind:onNextCallback` and calls it when moving on,
  // but because of our {#key}, it’s enough to let Svelte remount.
  export const onNextCallback = () => {};
  export const onCheckAnswersCallback = () =>
    markedAnswers.every((v, i) => v === question.correctAnswers[i]);

  let markedAnswers: boolean[] = [];

  // re‐initialize when question changes
  $: if (question) {
    markedAnswers = Array(question.answers.length).fill(false);
  }

  let answerClasses: string[] = [];

  $: answerClasses = question.answers.map((_, i) => {
    if (checked) {
      if (markedAnswers[i] && question.correctAnswers[i]) {
        return "bg-green-800 text-green-200";
      } else if (markedAnswers[i] && !question.correctAnswers[i]) {
        return "bg-red-800 text-red-200";
      } else if (!markedAnswers[i] && question.correctAnswers[i]) {
        return "bg-yellow-800 text-yellow-200";
      }
      return "bg-gray-700";
    }
    return "bg-gray-700 hover:border-gray-500";
  });
</script>

{#key question.number}
  <div class="flex gap-4 flex-col w-full inset-shadow-gray-800">
    <h2 class="text-l p-2 sticky top-0 bg-gray-800 shadow-gray-800 shadow-lg">
      {question.title}
    </h2>

    {#if image}
      <img
        alt="Ilustracja do pytania"
        style="max-width:80%; margin:24px"
        src={image[1]}
      />
    {/if}

    <div class="flex flex-col gap-2 p-2">
      {#each question.answers as answer, i}
        <div
          role="button"
          tabindex="0"
          class="answer p-2 flex gap-2 border-2 border-gray-500/0 {answerClasses[
            i
          ]}"
          onclick={() => {
            if (checked) return;
            markedAnswers[i] = !markedAnswers[i];
          }}
          onkeydown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              markedAnswers[i] = !markedAnswers[i];
            }
          }}
        >
          <input
            type="checkbox"
            disabled={checked}
            bind:checked={markedAnswers[i]}
          />
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
</style>
