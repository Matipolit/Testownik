<script>
  import { onMount, afterUpdate } from 'svelte';
  let changedAnswers = [];
  export let question;
  export let image;

  let markedAnswers = [];
  export let checked;
  export const onNextCallback = () => nextCallback();
  export const onCheckAnswersCallback = () => checkAnswersCallback();
  console.log("rerendering question");
  let nextDone = false;

  for(let i = 0; i < question.answers.length; i++){
    console.log("initializing value " + i);
    markedAnswers[i] = false;
    changedAnswers[i] = false;
  }

  afterUpdate(() => {
    if(!nextDone){
      console.log("question after update: ");
      console.log(question);
      markedAnswers = [];
      changedAnswers = [];
      console.log("Reset marked answers: " + markedAnswers);
      console.log("Reset changed answers: " + changedAnswers);
      for(let i = 0; i < question.answers.length; i++){
        console.log("resetting value " + i);
        markedAnswers[i] = false;
        changedAnswers[i] = false;
      }
    }
    nextDone = true;
  })

  function nextCallback(){
    console.log("Next callback called");
    nextDone = false;
  }

  function checkAnswersCallback(){
    console.log("Marked answers length: " + markedAnswers.length);
    console.log("Marked answers: " + markedAnswers);
    console.log("Correct answers: " + question.correctAnswers);
    for(let i = 0; i < markedAnswers.length; i++){
      if(markedAnswers[i] != question.correctAnswers[i]){
        return false;
      }
    }
    return true;
  }

</script>

<question>
  <title>
    <number>{question.number}</number>
    <h2>{question.title}</h2>
  </title>
  {#if image!=null}
    <img alt="Ilustracja do pytania" style="max-width:80%; margin: 24px;" src={image[1]}/>
  {/if}
  <div class="answers">
    {#each question.answers as answer, i}
      <!-- svelte-ignore a11y-click-events-have-key-events -->
      <answer 
        class:correct="{checked && changedAnswers[i] && question.correctAnswers[i]}"
        class:incorrect="{checked && changedAnswers[i] && !question.correctAnswers[i]}"
        class:notMarked="{checked && !changedAnswers[i] && question.correctAnswers[i]}"
        
        on:click={() => {changedAnswers[i] = !changedAnswers[i]; markedAnswers[i]=!markedAnswers[i];}}>
        <input type="checkbox" bind:checked={markedAnswers[i]} >
        <p>{answer}</p>
      </answer>
    {/each}
  </div>
</question>

<style>
  p{
    margin: 0;
  }
  answer{
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
  answer:hover{
    border-color: var(--accent);
  }
  title{
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
  number{
    font-weight: bold;
    font-size: 1.5em;
    padding: 0.3em 0.6em;
    border-radius: 8px;
    border: 0.2rem;
    border-radius: 8px;
    border-style: solid;
    border-color: var(--accent);     
  }
  .answers{
    margin: 1rem;
  }
  .correct{
    background-color: var(--correct);
  }
  .incorrect{
    background-color: var(--incorrect);
  }
  .notMarked{
    background-color: var(--notMarked);
  }
</style>
