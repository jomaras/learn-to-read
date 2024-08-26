import { SpeechRecognitionUtils } from "../SpeechRecognition/SpeechRecognitionUtils";
import { ExerciseType } from "./model/ExerciseType";

export class Teacher {
    private rootElement: HTMLElement
    private continueCallbacks: Function[];
    
    private exerciseType: ExerciseType;
    private target = ""
    
    constructor(rootElement: HTMLElement){
        this.rootElement = rootElement;
        this.continueCallbacks = [];
        this.exerciseType = ExerciseType.BigWords;

        this.onRecognizeWord = this.onRecognizeWord.bind(this);
    }

    public teach(text: string) {
        if(this.exerciseType == ExerciseType.BigWords
        || this.exerciseType == ExerciseType.MediumWords
        || this.exerciseType == ExerciseType.SmallWords) {
            this.techBigWords(text);
        }
        else if(this.exerciseType == ExerciseType.Letter){
            this.teachLetters(text);
        }
    }

    private teachLetters(text: string){

    }

    private techBigWords(text: string){
        const words = this.splitIntoWords(text).sort((a, b) => b.length - a.length);

        const longestWord = words[0];

        this.rootElement.innerHTML = `<div class='assignment-label'>${Array.from(longestWord).map(it => `<span class="not-pronounced" data-letter="${it.toLowerCase()}">${it}</span>`).join("")}</div>`;
        this.target = longestWord.toLowerCase();

        SpeechRecognitionUtils.onSpeechRecognition(this.onRecognizeWord);
    }

    public onContinue(callback: Function){
        this.continueCallbacks.push(callback);
    }

    private onRecognizeWord(results: {text: string, confidence: number}[]){
        for(const item of results){
            const words = this.splitIntoWords(item.text).map(it => it.toLowerCase());
            for(const word of words){
                if(word == this.target){
                    SpeechRecognitionUtils.offSpeechRecognition(this.onRecognizeWord);
                    this.triggerContinueCallbacks();
                    return;
                }
                else if(word.length == 1){
                    const letter = word.toLowerCase();
                    const notPronouncedElement = this.rootElement.querySelector(".not-pronounced");
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

    private splitIntoWords(text: string) {
        return text.split(/(?<=\w)(?=\W)|(?<=\W)(?=\w)/u);
    }
}