import { SpeechRecognitionUtils } from "./../SpeechRecognition/SpeechRecognitionUtils.mjs";

//MODES:
/*
    - letter
    - smallWords
    - mediumWords
    - bigWords
*/

export class Teacher {
    #rootElement
    #continueCallbacks
    
    #mode = "bigWords"
    #target = ""
    
    constructor(rootElement){
        this.#rootElement = rootElement;
        this.#continueCallbacks = [];
    }

    teach = (text) => {
        const words = this.#splitIntoWords(text).sort((a, b) => b.length - a.length);

        const longestWord = words[0];

        this.#rootElement.innerHTML = `<div class='assignment-label'>${longestWord}</div>`;
        this.#target = longestWord.toLowerCase();

        SpeechRecognitionUtils.onSpeechRecognition(this.#onRecognizeSpeech);
    };

    onContinue = (callback) => {
        this.#continueCallbacks.push(callback);
    };

    #onRecognizeSpeech = (results) => {
        for(const item of results){
            const words = this.#splitIntoWords(item.text).map(it => it.toLowerCase());
            for(const word of words){
                if(word == this.#target){
                    this.#triggerContinueCallbacks();
                }
            }
        }
    }

    #triggerContinueCallbacks = () => {
        for(const callback of this.#continueCallbacks){
            callback();
        }
    };

    #splitIntoWords = (text) => {
        return text.split(/\b/g);
    }
}