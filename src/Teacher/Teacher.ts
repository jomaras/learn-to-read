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
        this.exerciseType = ExerciseType.Letter;

        this.onRecognizeSpeech = this.onRecognizeSpeech.bind(this);
    }

    public teach = (text: string) => {
        const words = this.splitIntoWords(text).sort((a, b) => b.length - a.length);

        const longestWord = words[0];

        this.rootElement.innerHTML = `<div class='assignment-label'>${longestWord}</div>`;
        this.target = longestWord.toLowerCase();

        SpeechRecognitionUtils.onSpeechRecognition(this.onRecognizeSpeech);
    };

    public onContinue(callback: Function){
        this.continueCallbacks.push(callback);
    };

    private onRecognizeSpeech(results: {text: string, confidence: number}[]){
        for(const item of results){
            const words = this.splitIntoWords(item.text).map(it => it.toLowerCase());
            for(const word of words){
                if(word == this.target){
                    this.triggerContinueCallbacks();
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