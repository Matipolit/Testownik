<script>
  import Question from "./Question.svelte";
  let { db, images } = $props();

  let currQuestion = $state(0);
  let points = $state(0);
  let negativePoints = $state(0);
  let questionCorrects = [];
  let currQuestionAnswers = [];
  let checked = $state(false);
  let correct = $state(false);
  let nextCallback = $state();
  let checkAnswersCallback = $state();
  let ended = $state(false);
  let skipQuestionNum = $state(1);
  let curr_image = $state(null);

  function nextQuestion() {
    if (correct) {
      points++;
    } else {
      negativePoints++;
    }
    questionCorrects.push(correct);
    currQuestion++;
    setParams();
  }

  function setParams() {
    if (currQuestion < db.length) {
      checked = false;
      correct = false;
      currQuestionAnswers = [];
      console.log("Calling next callback");
      nextCallback();
      if (db[currQuestion].hasImage) {
        curr_image = images.find(
          (img) => img[0] === db[currQuestion].imagePath
        );
      } else {
        curr_image = null;
      }
    } else {
      ended = true;
      console.log("test ended");
    }
  }

  function checkAnswers() {
    correct = checkAnswersCallback();
    checked = true;
  }
</script>

<div>
  {#if !ended}
    <div>
      <label for="skipToQuestion">Przejdź do pytania</label>
      <input
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
    <div class="info">
      <p>Pytanie: {currQuestion + 1} / {db.length}</p>
      <p>
        Poprawne odpowiedzi: <b>{points}</b> | Niepoprawne odpowiedzi:
        <b>{negativePoints}</b>
      </p>
    </div>
    <Question
      question={db[currQuestion]}
      image={curr_image}
      {checked}
      bind:onNextCallback={nextCallback}
      bind:onCheckAnswersCallback={checkAnswersCallback}
    />
    <div class="bottom">
      <button onclick={() => checkAnswers()}>Sprawdź odpowiedź</button>
      <button disabled={!checked} onclick={() => nextQuestion()}
        >Następne pytanie</button
      >
    </div>
  {:else}
    <p>Test zakończony</p>
    <p>
      Poprawne odpowiedzi: <b>{points}</b> | Niepoprawne odpowiedzi:
      <b>{negativePoints}</b>
    </p>
  {/if}
</div>

<style>
  .info {
    display: flex;
    gap: 32px;
    align-items: center;
    justify-content: center;
  }
  .bottom {
    width: 100%;
    padding: 4px;
    backdrop-filter: blur(18px) saturate(40%);
  }
  #skipToQuestion {
    width: 64px;
  }
</style>
