import { ISpeechRecognitionResult, SpeechRecognitionUtils } from "../speechRecognition/SpeechRecognitionUtils";
import { ExerciseType } from "./model/ExerciseType";
import { ValueUtils } from '../utils/ValueUtils';
import { VoiceOver } from '../voiceOver/VoiceOver';
import  { SpacedRepetition } from '../spacedRepetition/SpacedRepetition';
import { ITeachingResult, ITeachingResultCallback } from './model/ITeachingResult';

import './teacher.scss';

export interface ITeachConfig {
    hideAfterPeriod?: number;
}

export class Teacher {
    private rootElement: HTMLElement;
    private exerciseElement: HTMLElement;
    private continueCallbacks: ITeachingResultCallback[];
    
    private exerciseType: ExerciseType;
    private target: string = "";
    private sourceText: string = "";
    private spacedRepetition: SpacedRepetition;

    private lessonStartTime: number;
    private currentConfig: ITeachConfig;
    
    constructor(rootElement: HTMLElement, exerciseType: ExerciseType){
        this.rootElement = rootElement;
        this.exerciseElement = this.rootElement.querySelector(".main-learning-container");
        this.continueCallbacks = [];
        this.exerciseType = exerciseType;

        if(this.exerciseType == ExerciseType.Letter){
            this.spacedRepetition = new SpacedRepetition("letters");
        }

        this.onRecognizeWord = this.onRecognizeWord.bind(this);
        this.onRecognizeLetter = this.onRecognizeLetter.bind(this);

        this.rootElement.querySelector(".retry-button")?.addEventListener("click", () => {
            this.teach(this.sourceText);
        });
        
        this.rootElement.querySelector(".skip-button")?.addEventListener("click", () => {
            SpeechRecognitionUtils.offSpeechRecognition(this.onRecognizeWord);
            this.triggerContinueCallbacks(false, 0);
            return;
        });
    }

    public teach(text: string, config: ITeachConfig = null) {
        this.sourceText = text;
        this.currentConfig = config;
        
        if(this.exerciseType == ExerciseType.BigWords
        || this.exerciseType == ExerciseType.MediumWords
        || this.exerciseType == ExerciseType.SmallWords) {
            this.techBigWords(text);
        }
        else if(this.exerciseType == ExerciseType.Letter){
            this.teachLetters(text);
        }
        else if(this.exerciseType == ExerciseType.Syllables){
            this.teachSyllables(text);
        }

        this.lessonStartTime = Date.now();
    }

    private async teachLetters(text: string){
        const letters = Array.from(text).filter(it => ValueUtils.isLetter(it));
        
        const spacedRepetitionItem = this.spacedRepetition.getBestItemOf(letters);
        if(spacedRepetitionItem == null){
            this.triggerContinueCallbacks(false, 0);
            return;
        }
        
        const letter = spacedRepetitionItem.id;
        const isUpperCase = letter.toUpperCase() == letter;
        
        const upperCase = letter.toUpperCase();
        const lowercase = letter.toLowerCase();
        
        this.exerciseElement.innerHTML = `<div class='assignment-label'><span class="uppercase ${isUpperCase ? "" : "transparent-letter"}">${upperCase}</span> <span class="lowercase ${isUpperCase ? "transparent-letter" : ""}">${lowercase}</span></div>`;

        this.target = letter;

        await ValueUtils.sleep(250);
        await VoiceOver.playReadLetter();

        SpeechRecognitionUtils.onSpeechRecognition(this.onRecognizeLetter);
    }

    private timeoutId: any;

    private teachSyllables(text: string){
        clearTimeout(this.timeoutId);
        const parts = text.split("-");
        this.target = parts.join("").toLowerCase();
        
        this.exerciseElement.innerHTML = `<div class='assignment-label'>${this.generateSyllablesHtml(parts)}</div>`;

        SpeechRecognitionUtils.onSpeechRecognition(this.onRecognizeWord);
    }

    private techBigWords(text: string){
        clearTimeout(this.timeoutId);
        
        const words = ValueUtils.splitIntoWords(text).sort((a, b) => b.length - a.length);
        const bigWords = words.filter(it => it.length >= 4);

        let selectedWord = words[0];

        if(bigWords.length > 1){
            selectedWord = ValueUtils.getRandomArrayItem(bigWords);
        }

        this.exerciseElement.innerHTML = `<div class='assignment-label' data-mask='${Array.from(selectedWord).map(it => "*").join("")}'>${this.generateWordHtml(selectedWord)}</div>`;
        this.target = selectedWord.toLowerCase();

        SpeechRecognitionUtils.onSpeechRecognition(this.onRecognizeWord);

        if(this.currentConfig){
            if(this.currentConfig.hideAfterPeriod > 0){
                this.timeoutId = setTimeout(() => {
                    const assignmentLabel = this.exerciseElement.querySelector(".assignment-label");
                    assignmentLabel.textContent = assignmentLabel.getAttribute("data-mask");
                }, this.currentConfig.hideAfterPeriod);
            }
        }
    }

    private generateSyllablesHtml(parts: string[]){
        let html = "";

        for(let i = 0; i < parts.length; i++){
            const part = parts[i];
            
            html += `<span class='syllable'>${this.generateWordHtml(part)}</span>`;

            if(i != parts.length -1){
                html += "<span class='syllable-separator'>-</span>";
            }
        }

        return html;
    }

    private generateWordHtml(text: string){
        return Array.from(text).map(it => `<span class="not-pronounced" data-letter="${it.toLowerCase()}">${it}</span>`).join("")
    }

    public onContinue(callback: ITeachingResultCallback){
        this.continueCallbacks.push(callback);
    }

    private async onRecognizeLetter(results: ISpeechRecognitionResult[]){
        for(const item of results){
            const words = ValueUtils.splitIntoWords(item.text).map(it => it.toLowerCase());
            for(const word of words){
                if(word.toLowerCase() == this.target.toLowerCase()
                || word[0].toLowerCase() == this.target.toLowerCase()){
                    SpeechRecognitionUtils.offSpeechRecognition(this.onRecognizeLetter);

                    const spacedRepetitionItem = this.spacedRepetition.retrieveItem(this.target);
                    if(spacedRepetitionItem != null) {
                        const now = Date.now();
                        const elapsedTime = now - this.lessonStartTime;

                        if(elapsedTime < 2000) {
                            spacedRepetitionItem.quality = 5;
                        }
                        else if(elapsedTime < 4000) {
                            spacedRepetitionItem.quality = 4;
                        }
                        else if(elapsedTime < 6000) {
                            spacedRepetitionItem.quality = 3;
                        }
                        else if(elapsedTime < 8000) {
                            spacedRepetitionItem.quality = 2;
                        }
                        else if(elapsedTime < 10000) {
                            spacedRepetitionItem.quality = 1;
                        }
                        else {
                            spacedRepetitionItem.quality = 0;
                        }

                        this.spacedRepetition.addItem(spacedRepetitionItem);
                    }

                    const duration = Date.now() - this.lessonStartTime;
                    
                    await ValueUtils.sleep(250);
                    await VoiceOver.playLetterSound(this.target);

                    this.triggerContinueCallbacks(true, duration);
                    return;
                }
            }
        }
    }

    private async onRecognizeWord(results: ISpeechRecognitionResult[]){
        for(const item of results){
            const words = ValueUtils.splitIntoWords(item.text).map(it => it.toLowerCase());
            for(const word of words){
                if(word == this.target){
                    SpeechRecognitionUtils.offSpeechRecognition(this.onRecognizeWord);
                    
                    this.exerciseElement.querySelector(".assignment-label").classList.add("make-invisible");
                    
                    const duration = Date.now() - this.lessonStartTime;
                    
                    await this.showConfetti();
                    
                    this.triggerContinueCallbacks(true, duration);
                    return;
                }
                else if(word.length == 1){
                    const letter = word.toLowerCase();
                    const notPronouncedElement = this.exerciseElement.querySelector(".not-pronounced");
                    if(notPronouncedElement != null && notPronouncedElement.getAttribute("data-letter") == letter){
                        notPronouncedElement.classList.remove("not-pronounced");
                        notPronouncedElement.classList.add("pronounced");
                    }
                }
                else if(word.length == 2 && (word == "lj" || word == "nj")){
                    let notPronouncedElement = this.exerciseElement.querySelector(".not-pronounced");
                    let pronouncedElements = this.exerciseElement.querySelectorAll(".pronounced");
                    

                    if(notPronouncedElement != null 
                    && (notPronouncedElement.getAttribute("data-letter") == word[0]
                    || (pronouncedElements.length > 0 && pronouncedElements[pronouncedElements.length - 1]?.getAttribute("data-letter") == word[0]))){
                        notPronouncedElement.classList.remove("not-pronounced");
                        notPronouncedElement.classList.add("pronounced");
                        
                        notPronouncedElement = this.exerciseElement.querySelector(".not-pronounced");

                        if(notPronouncedElement != null && notPronouncedElement.getAttribute("data-letter") == word[1]){
                            notPronouncedElement.classList.remove("not-pronounced");
                            notPronouncedElement.classList.add("pronounced");
                        }
                    }
                }
            }

            const joined = words.join("");
            if(joined == this.target
            || joined.indexOf(this.target) >= 0){
                SpeechRecognitionUtils.offSpeechRecognition(this.onRecognizeWord);

                const duration = Date.now() - this.lessonStartTime;
                    
                this.exerciseElement.querySelector(".assignment-label").classList.add("make-invisible");
                await this.showConfetti();
                
                this.triggerContinueCallbacks(true, duration);
                return;
            }
        }
    }

    private triggerContinueCallbacks(success: boolean, duration: number){
        for(const callback of this.continueCallbacks){
            callback({
                success: success,
                duration: duration,
                target: this.target
            });
        }
    };

    private async showConfetti(){
        (window as any).confetti({particleCount: 100, spread: 70, origin: { y: 0.6 }});
        await ValueUtils.sleep(1500);
        (window as any).confetti.reset();
    }   
}