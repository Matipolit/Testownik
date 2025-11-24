<script lang="ts">
    import { onDestroy, onMount } from "svelte";
    import Question from "./Question.svelte";
    import type { Question as QuestionType } from "../lib/types";
    import {
        ArrowRightCircle,
        ChevronRight,
        CircleCheckBig,
        RotateCcw,
    } from "@lucide/svelte";

    let { db, images }: { db: QuestionType[]; images: [string, Blob][] } =
        $props();

    let currQuestion: number = $state(0);
    let points: number = $state(0);
    let negativePoints: number = $state(0);
    let questionCorrects: boolean[] = [];
    let checked: boolean = $state(false);
    let correct: boolean = $state(false);
    let nextCallback: () => void = $state(() => {});
    let checkAnswersCallback: () => boolean = $state(() => false);
    let toggleAnswerCallback: (index: number) => void = $state(() => {});
    let ended: boolean = $state(false);
    let skipQuestionNum: number = $state(1);
    let curr_image: string | undefined = $state(undefined);

    // Keyboard event handler
    function handleKeydown(event: KeyboardEvent): void {
        // Ignore if test has ended
        if (ended) return;

        // Ignore if typing in an input field
        if (event.target instanceof HTMLInputElement) return;

        const key = event.key.toLowerCase();

        if (key === "enter" && !checked) {
            checkAnswers();
            event.preventDefault();
        } else if ((key === "arrowright" || key === "n") && checked && !ended) {
            nextQuestion();
            event.preventDefault();
        } else if (key.length === 1 && key >= "a" && key <= "z" && !checked) {
            const answerIndex = key.charCodeAt(0) - "a".charCodeAt(0);
            if (answerIndex < db[currQuestion].answers.length) {
                toggleAnswerCallback(answerIndex);
                event.preventDefault();
            }
        }
    }

    onMount(() => {
        window.addEventListener("keydown", handleKeydown);
    });

    onDestroy(() => {
        window.removeEventListener("keydown", handleKeydown);
        for (const url of imageUrls.values()) {
            URL.revokeObjectURL(url);
        }
    });

    // Create object URLs for images
    let imageUrls = new Map<string, string>();

    $effect(() => {
        // Revoke old URLs to prevent memory leaks
        for (const url of imageUrls.values()) {
            URL.revokeObjectURL(url);
        }
        imageUrls.clear();

        if (images) {
            for (const [name, blob] of images) {
                imageUrls.set(name, URL.createObjectURL(blob));
            }
        }

        // Update current image if needed
        if (db[currQuestion]?.hasImage) {
            const imagePath = db[currQuestion].imagePath;
            if (imagePath != null) {
                curr_image = imageUrls.get(imagePath);
            }
        } else {
            curr_image = undefined;
        }
    });

    function nextQuestion(): void {
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
                const imagePath = db[currQuestion].imagePath;
                if (imagePath != null) {
                    curr_image = imageUrls.get(imagePath);
                }
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
            const imagePath = db[0].imagePath;
            if (imagePath != null) {
                curr_image = imageUrls.get(imagePath);
            }
        } else {
            curr_image = undefined;
        }
    }

    function checkAnswers(): void {
        correct = checkAnswersCallback();
        checked = true;
        if (correct) {
            points++;
        } else {
            negativePoints++;
        }
    }
</script>

<div
    class="flex items-stretch md:flex-row flex-col-reverse gap-4 justify-between h-full p-2"
>
    <div
        class="md:flex-1/3 md:h-full md:w-max w-full min-w-80 align-middle flex flex-col gap-2 p-2 shrink-0 text-gray-100 transition-colors duration-200"
        class:bg-green-900={checked && correct}
        class:bg-red-900={checked && !correct}
        class:bg-gray-800={!checked}
    >
        <progress value={currQuestion} max={db.length}></progress>
        {#if !ended}
            <p class="text-xl text-gray-50">
                Pytanie: <b>{currQuestion + 1} / {db.length} </b>
            </p>
        {:else}
            <p class="text-xl text-gray-50">Koniec testu</p>
        {/if}
        <p>
            Poprawne: <b class="text-green-300">{points}</b> | Niepoprawne:
            <b class="text-red-300">{negativePoints}</b>
        </p>

        <div class="bg-gray-700 p-2 text-sm">
            <p class="font-semibold mb-1">Skróty klawiszowe:</p>
            <ul class="text-xs space-y-0.5">
                <li>
                    <kbd class="bg-gray-600 px-1 rounded">A-Z</kbd> - Zaznacz odpowiedź
                </li>
                <li>
                    <kbd class="bg-gray-600 px-1 rounded">Enter</kbd> - Sprawdź odpowiedzi
                </li>
                <li>
                    <kbd class="bg-gray-600 px-1 rounded">→</kbd> /
                    <kbd class="bg-gray-600 px-1 rounded">N</kbd> - Następne pytanie
                </li>
            </ul>
        </div>

        <div class="bg-gray-700 p-2 flex gap-4 items-center justify-between">
            <div>
                <label for="skipToQuestion">Przejdź do pytania</label>
                <input
                    class="bg-gray-600 p-1 ml-1 w-16"
                    min="1"
                    max={db.length}
                    type="number"
                    id="skipToQuestion"
                    bind:value={skipQuestionNum}
                />
            </div>
            <button
                onclick={(_) => {
                    currQuestion = skipQuestionNum - 1;
                    setParams();
                }}><ArrowRightCircle /></button
            >
        </div>
        <div class="flex w-full justify-between gap-2 mt-auto pt-4">
            <button
                onclick={() => checkAnswers()}
                class="flex items-center gap-1 w-1/2 justify-center"
                ><CircleCheckBig />Sprawdź odpowiedź</button
            >
            <button
                class="disabled:bg-gray-700 flex items-center gap-1 w-1/2 justify-center"
                disabled={!checked || ended}
                onclick={() => nextQuestion()}
                ><ChevronRight />Następne pytanie</button
            >
        </div>
    </div>
    <div
        class="md:flex-2/3 w-full flex flex-col gap-2 justify-start bg-gray-800 inset-shadow-sm inset-shadow-gray-800/50 overflow-auto min-h-0"
    >
        {#if !ended}
            <Question
                question={db[currQuestion]}
                image={curr_image}
                {checked}
                bind:onNextCallback={nextCallback}
                bind:onCheckAnswersCallback={checkAnswersCallback}
                bind:onToggleAnswerCallback={toggleAnswerCallback}
            />
        {:else}
            <p>Test zakończony</p>
            <button onclick={resetTest}><RotateCcw />Testuj ponownie</button>
        {/if}
    </div>
</div>

<style></style>
