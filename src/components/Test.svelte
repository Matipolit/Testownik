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
  let skipQuestionNum = 1;
  let curr_image = null;

  function nextQuestion(){
    if(correct){
        points++;
      }else{
        negativePoints++;
    }
    questionCorrects.push(correct);
    currQuestion ++;
    setParams();
  }

  function setParams(){
    if(currQuestion<db.length){
      checked = false;
      correct = false;
      currQuestionAnswers = [];
      console.log("Calling next callback");
      nextCallback();
      if(db[currQuestion].hasImage) {
        curr_image = images.find((img) => img[0] === db[currQuestion].imagePath)
      }else{
        curr_image = null;
      }
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
    <div>
      <label for="skipToQuestion">Przejdź do pytania</label>
      <input min="1" max={db.length} type="number" id="skipToQuestion" bind:value={skipQuestionNum} />
      <button on:click={_ => {
          currQuestion=skipQuestionNum-1;
          setParams();
        }} >Przejdź</button>
    </div>
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
    <Question question={db[currQuestion]} image={curr_image}
      checked={checked} bind:onNextCallback={nextCallback} 
      bind:onCheckAnswersCallback={checkAnswersCallback}/>
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
  .bottom{
    width: 100%;
    padding: 4px;
    backdrop-filter: blur(18px) saturate(40%);
  }
  #skipToQuestion {
    width: 64px;
  }
</style>
