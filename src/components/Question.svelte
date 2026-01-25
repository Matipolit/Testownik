<script lang="ts">
    import type { Question } from "../lib/types";

    export let question: Question;
    export let image: string | undefined;
    export let checked: boolean;
    export let onMarkAnswer: (index: number) => void = () => {};

    // parent does `bind:onNextCallback` and calls it when moving on,
    // but because of our {#key}, it's enough to let Svelte remount.
    export const onNextCallback = () => {};
    export const onCheckAnswersCallback = () =>
        markedAnswers.every((v, i) => v === question.correctAnswers[i]);
    export const onToggleAnswerCallback = (index: number) => {
        if (!checked && index >= 0 && index < markedAnswers.length) {
            markedAnswers[index] = !markedAnswers[index];
        }
        return markedAnswers.some((answer) => answer === true);
    };

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

    function getKeyboardLetter(index: number): string {
        return String.fromCharCode(65 + index); // 65 is 'A'
    }
</script>

{#key question.number}
    <div class="flex gap-4 flex-col w-full inset-shadow-gray-800">
        <h2
            class="text-l p-2 sticky top-0 bg-gray-800 shadow-gray-800 shadow-lg"
        >
            {question.title}
        </h2>

        {#if image}
            <div>
                <img
                    alt="Ilustracja do pytania"
                    class="w-full p-2"
                    src={image}
                />
                <p class="text-sm text-gray-400 w-full text-right pr-2">
                    {question.imagePath}
                </p>
            </div>
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
                        onMarkAnswer(i);
                    }}
                    onkeydown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                            onMarkAnswer(i);
                        }
                    }}
                >
                    <kbd
                        class="bg-gray-600 px-2 py-1 rounded text-xs font-mono min-w-6 text-center hidden md:block"
                        >{getKeyboardLetter(i)}</kbd
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
