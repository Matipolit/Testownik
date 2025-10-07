<script lang="ts">
  import Question from "./Question.svelte";
  import type { Question as QuestionType } from "../lib/types";
  import { ChevronRight, CircleCheckBig, RotateCcw } from "@lucide/svelte";

  let { db, images }: { db: QuestionType[]; images: [string, string][] } =
    $props();

  let currQuestion: number = $state(0);
  let points: number = $state(0);
  let negativePoints: number = $state(0);
  let questionCorrects: boolean[] = [];
  let checked: boolean = $state(false);
  let correct: boolean = $state(false);
  let nextCallback: () => void = $state(() => {});
  let checkAnswersCallback: () => boolean = $state(() => false);
  let ended: boolean = $state(false);
  let skipQuestionNum: number = $state(1);
  let curr_image: [string, string] | undefined = $state(undefined);

  function nextQuestion(): void {
    if (correct) {
      points++;
    } else {
      negativePoints++;
    }
    questionCorrects.push(correct);
    currQuestion++;
    setParams();
  }

  function setParams(): void {
    if (currQuestion < db.length) {
      checked = false;
      correct = false;
      console.log("Calling next callback");
      nextCallback();
      if (db[currQuestion].hasImage) {
        curr_image = images.find(
          (img) => img[0] === db[currQuestion].imagePath
        );
      } else {
        curr_image = undefined;
      }
    } else {
      ended = true;
      console.log("test ended");
    }
  }

  function resetTest(): void {
    currQuestion = 0;
    points = 0;
    negativePoints = 0;
    questionCorrects = [];
    checked = false;
    correct = false;
    nextCallback = () => {};
    checkAnswersCallback = () => false;
    ended = false;
    skipQuestionNum = 1;
    if (db[0].hasImage) {
      curr_image = images.find((img) => img[0] === db[0].imagePath);
    } else {
      curr_image = undefined;
    }
  }

  function checkAnswers(): void {
    correct = checkAnswersCallback();
    checked = true;
  }
</script>

<div class="flex gap-4">
  <div
    class="flex-1/3 min-w-80 align-middle w-max flex flex-col gap-2 bg-gray-800 p-2 h-full"
  >
    <progress value={currQuestion} max={db.length}></progress>
    {#if !ended}
      <p class="text-xl">Pytanie: <b>{currQuestion + 1} / {db.length} </b></p>
    {:else}
      <p class="text-xl">Koniec testu</p>
    {/if}
    <p>
      Poprawne: <b class="text-green-300">{points}</b> | Niepoprawne:
      <b class="text-red-300">{negativePoints}</b>
    </p>

    <div class="bg-gray-700 p-2">
      <label for="skipToQuestion">Przejdź do pytania</label>
      <input
        class="bg-gray-600 p-1 ml-1 w-16"
        min="1"
        max={db.length}
        type="number"
        id="skipToQuestion"
        bind:value={skipQuestionNum}
      />
      <button
        onclick={(_) => {
          currQuestion = skipQuestionNum - 1;
          setParams();
        }}>Przejdź</button
      >
    </div>
    {#if checked}
      {#if correct}
        <h2>Poprawna odpowiedź!</h2>
      {:else}
        <h2>Niepoprawna odpowiedź!</h2>
      {/if}
    {/if}
    <div class="flex w-full justify-between gap-2 mt-auto pt-4">
      <button
        onclick={() => checkAnswers()}
        class="flex items-center gap-1 w-1/2 justify-center"
        ><CircleCheckBig />Sprawdź odpowiedź</button
      >
      <button
        class="disabled:bg-gray-700 flex items-center gap-1 w-1/2 justify-center"
        disabled={!checked || ended}
        onclick={() => nextQuestion()}><ChevronRight />Następne pytanie</button
      >
    </div>
  </div>
  <div
    class="flex-2/3 align-middle w-max flex flex-col gap-2 justify-start bg-gray-800 p-2"
  >
    {#if !ended}
      <Question
        question={db[currQuestion]}
        image={curr_image}
        {checked}
        bind:onNextCallback={nextCallback}
        bind:onCheckAnswersCallback={checkAnswersCallback}
      />
    {:else}
      <p>Test zakończony</p>
      <button onclick={resetTest}><RotateCcw />Testuj ponownie</button>
    {/if}
  </div>
</div>

<style></style>
