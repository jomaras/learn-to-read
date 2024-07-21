import { Teacher } from "./../Teacher/Teacher.mjs";

export class VideoReading {
    #videoElement
    #learningContainer
    #textTrackElement
    #hasLearningBeenInitialized
    #pauseBetweenLearningMinInterval = 3
    #teacher
    
    constructor(videoElement, learningContainer){
        if(!videoElement) { return null; }

        this.#videoElement = videoElement;
        this.#learningContainer = learningContainer;
        
        this.#textTrackElement = this.#videoElement.textTracks[0];
        
        this.#onCuesLoaded(() => this.#determineCuesForLearning());

        this.#teacher = new Teacher(learningContainer);
        this.#teacher.onContinue(() => {
            this.#learningContainer.classList.add("hidden");
            this.#videoElement.play();
        });
    }

    start(){
        this.#textTrackElement.addEventListener("cuechange", this.#onCueChange);
    }

    stop(){
        this.#textTrackElement.removeEventListener("cuechange", this.#onCueChange);
    }

    #onCueChange = (e) => {
        let cues = e.currentTarget.activeCues;
        if(cues.length == 0) { return; }
        
        const cue = cues[0];
        const cueText = cue.text;
        if(cue.shouldInitiateLearning){
            this.#startLearningExercise(cueText);
        }
    }

    #startLearningExercise(text){        
        this.#videoElement.pause();
        this.#learningContainer.classList.remove("hidden");
        this.#teacher.teach(text);
    }

    #determineCuesForLearning = () => {
        if(this.#textTrackElement.cues == null
        || this.#textTrackElement.cues.length == 0
        || this.#hasLearningBeenInitialized) { return; }
        
        let lastPauseTime = 0;
        for(let i = 0; i < this.#textTrackElement.cues.length; i++){
            const cue = this.#textTrackElement.cues[i];
            
            if((cue.startTime - lastPauseTime) > this.#pauseBetweenLearningMinInterval  || i == this.#textTrackElement.cues.length - 1) { 
                cue.shouldInitiateLearning = true;
                lastPauseTime = cue.endTime;
            }
            
            console.log(cue.text, cue.startTime, cue.endTime, cue.shouldInitiateLearning);
        }

        this.#hasLearningBeenInitialized = true;
    }

    #onCuesLoaded(callback){
        if(this.#textTrackElement.cues != null 
        && this.#textTrackElement.cues.length > 0){
            callback()
        }
        else {
            let timeoutId = -1;
            const loadCallback = (e) => { callback(); }
            const cleanup = () => {
                this.#textTrackElement.removeEventListener("load", loadCallback);
                clearTimeout(timeoutId);
            }
            
            const timeoutCallback = (e) => {
                if(this.#textTrackElement.cues != null 
                && this.#textTrackElement.cues.length > 0){
                    callback();
                    cleanup();
                }
                else {
                    timeoutId = setTimeout(timeoutCallback, 100);
                }
            }

            this.#textTrackElement.addEventListener("load", loadCallback);
            
            timeoutId = setTimeout(timeoutCallback, 100);
        }
    }
}