import { ISpeechRecognitionResult, SpeechRecognitionUtils } from "../SpeechRecognition/SpeechRecognitionUtils";
import { ExerciseType } from "./model/ExerciseType";
import { ValueUtils } from './../utils/ValueUtils';
import { VoiceOver } from './../voiceOver/VoiceOver';

export class Teacher {
    private rootElement: HTMLElement;
    private exerciseElement: HTMLElement;
    private continueCallbacks: Function[];
    
    private exerciseType: ExerciseType;
    private target: string = "";
    private sourceText: string = "";
    
    constructor(rootElement: HTMLElement){
        this.rootElement = rootElement;
        this.exerciseElement = this.rootElement.querySelector(".main-learning-container");
        this.continueCallbacks = [];
        this.exerciseType = ExerciseType.BigWords;

        this.onRecognizeWord = this.onRecognizeWord.bind(this);
        this.onRecognizeLetter = this.onRecognizeLetter.bind(this);

        this.rootElement.querySelector(".retry-button").addEventListener("click", () => {
            this.teach(this.sourceText);
        });
        
        this.rootElement.querySelector(".skip-button").addEventListener("click", () => {
            SpeechRecognitionUtils.offSpeechRecognition(this.onRecognizeWord);
            this.triggerContinueCallbacks();
            return;
        });
    }

    public teach(text: string) {
        this.sourceText = text;
        
        if(this.exerciseType == ExerciseType.BigWords
        || this.exerciseType == ExerciseType.MediumWords
        || this.exerciseType == ExerciseType.SmallWords) {
            this.techBigWords(text);
        }
        else if(this.exerciseType == ExerciseType.Letter){
            this.teachLetters(text);
        }
    }

    private async teachLetters(text: string){
        const letters = Array.from(text);
        const letter = letters.find(it => ValueUtils.isLetter(it));
        const isUpperCase = letter.toUpperCase() == letter;
        
        const upperCase = letter.toUpperCase();
        const lowercase = letter.toLowerCase();
        
        this.exerciseElement.innerHTML = `<div class='assignment-label'><span class="uppercase ${isUpperCase ? "" : "transparent-letter"}">${upperCase}</span> <span class="lowercase ${isUpperCase ? "transparent-letter" : ""}">${lowercase}</span></div>`;

        this.target = letter.toLowerCase();

        await this.sleep(250);
        await VoiceOver.playReadLetter();

        SpeechRecognitionUtils.onSpeechRecognition(this.onRecognizeLetter);
    }

    private techBigWords(text: string){
        const words = ValueUtils.splitIntoWords(text).sort((a, b) => b.length - a.length);
        const bigWords = words.filter(it => it.length >= 4);

        let selectedWord = words[0];

        if(bigWords.length > 1){
            selectedWord = ValueUtils.getRandomArrayItem(bigWords);
        }

        this.exerciseElement.innerHTML = `<div class='assignment-label'>${this.generateWordHtml(selectedWord)}</div>`;
        this.target = selectedWord.toLowerCase();

        SpeechRecognitionUtils.onSpeechRecognition(this.onRecognizeWord);
    }

    private generateWordHtml(text: string){
        return Array.from(text).map(it => `<span class="not-pronounced" data-letter="${it.toLowerCase()}">${it}</span>`).join("")
    }

    public onContinue(callback: Function){
        this.continueCallbacks.push(callback);
    }

    private async onRecognizeLetter(results: ISpeechRecognitionResult[]){
        for(const item of results){
            const words = ValueUtils.splitIntoWords(item.text).map(it => it.toLowerCase());
            for(const word of words){
                if(word.toLowerCase() == this.target
                || word[0].toLowerCase() == this.target){
                    SpeechRecognitionUtils.offSpeechRecognition(this.onRecognizeLetter);

                    await this.sleep(250);
                    await VoiceOver.playLetterSound(this.target);

                    this.triggerContinueCallbacks();
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
                    (window as any).confetti({particleCount: 100, spread: 70, origin: { y: 0.6 }});
                    await this.sleep(1200);
                    
                    this.triggerContinueCallbacks();
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
            }
        }
    }

    private triggerContinueCallbacks(){
        for(const callback of this.continueCallbacks){
            callback();
        }
    };

    private sleep(timeout: number){
        return new Promise((resolve, reject) => {
            setTimeout(resolve, timeout);
        });
    }
}