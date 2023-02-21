<script>
  import Question from "./Question.svelte"
  export let db;
  export let images;

  let currQuestion = 0;
  let points = 0;
  let negativePoints = 0;
  let questionCorrects = [];
  let currQuestionAnswers = [];
  let checked = false;
  let correct = false;
  let nextCallback;
  let checkAnswersCallback;
  let ended = false;

  function nextQuestion(){
    if(correct){
        points++;
      }else{
        negativePoints++;
    }
    questionCorrects.push(correct)
    if(currQuestion+1<db.length){
      currQuestion ++;
      checked = false;
      correct = false;
      currQuestionAnswers = [];
      console.log("Calling next callback");
      nextCallback();
    }else{
      ended = true;
      console.log("test ended");
    }
  }
  function checkAnswers(){
    correct = checkAnswersCallback();
    checked = true;
  }
</script>

<test>
  {#if !ended}
    {#if checked}
      {#if correct}
        <h2>Poprawna odpowiedź!</h2>
      {:else}
        <h2>Niepoprawna odpowiedź!</h2>
      {/if}
    {/if}
    <info>
      <p>Pytanie: {currQuestion+1} / {db.length} </p>
      <p>Poprawne odpowiedzi: <b>{points}</b> | Niepoprawne odpowiedzi: <b>{negativePoints}</b></p>
    </info>
    <Question question={db[currQuestion]} checked={checked} bind:onNextCallback={nextCallback} bind:onCheckAnswersCallback={checkAnswersCallback}/>
    <div class="bottom">
      <button on:click={() => checkAnswers()}>Sprawdź odpowiedź</button>
      <button disabled={!checked} on:click={() => nextQuestion()}>Następne pytanie</button>
    </div>
  {:else}
    <p>Test zakończony</p>
    <p>Poprawne odpowiedzi: <b>{points}</b> | Niepoprawne odpowiedzi: <b>{negativePoints}</b></p>
  {/if}
</test>

<style>
  info{
    display: flex;
    gap: 32px;
    align-items: center;
    justify-content: center;
  }
</style>