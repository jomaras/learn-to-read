import { ExerciseType } from "../teacher/model/ExerciseType";
import { Teacher } from "../teacher/Teacher";

export class VideoReading {
    private videoElement: HTMLVideoElement
    private learningContainer: HTMLDivElement;
    private textTrack: TextTrack;
    
    private hasLearningBeenInitialized: boolean;
    private pauseBetweenLearningMinInterval: number = 3
    private teacher: Teacher;
    
    constructor(videoElement, learningContainer){
        if(!videoElement) { return; }

        this.videoElement = videoElement;
        this.learningContainer = learningContainer;
        
        this.textTrack = this.videoElement.textTracks[0];
        let a = this.videoElement.textTracks[0];
        
        this.onCuesLoaded(() => this.determineCuesForLearning());

        this.teacher = new Teacher(learningContainer, ExerciseType.Letter);
        this.teacher.onContinue(() => {
            this.learningContainer.classList.add("hidden");
            this.videoElement.play();
        });

        this.onCueChange = this.onCueChange.bind(this);
    }

    public start(){
        this.textTrack.addEventListener("cuechange", this.onCueChange);
    }

    public stop(){
        this.textTrack.removeEventListener("cuechange", this.onCueChange);
    }

    private onCueChange(e){
        let cues = e.currentTarget.activeCues;
        if(cues.length == 0) { return; }
        
        const cue = cues[0];
        const cueText = cue.text;
        if(cue.shouldInitiateLearning){
            this.startLearningExercise(cueText);
        }
    }

    private startLearningExercise(text){        
        this.videoElement.pause();
        this.learningContainer.classList.remove("hidden");
        this.teacher.teach(text);
    }

    private determineCuesForLearning() {
        if(this.textTrack.cues == null
        || this.textTrack.cues.length == 0
        || this.hasLearningBeenInitialized) { return; }
        
        let lastPauseTime = 0;
        for(let i = 0; i < this.textTrack.cues.length; i++){
            const cue: any = this.textTrack.cues[i];
            
            if((cue.startTime - lastPauseTime) > this.pauseBetweenLearningMinInterval  || i == this.textTrack.cues.length - 1) { 
                cue.shouldInitiateLearning = true;
                lastPauseTime = cue.endTime;
            }
            
            console.log(cue.text, cue.startTime, cue.endTime, cue.shouldInitiateLearning);
        }

        this.hasLearningBeenInitialized = true;
    }

    private onCuesLoaded(callback){
        if(this.textTrack.cues != null 
        && this.textTrack.cues.length > 0){
            callback()
        }
        else {
            let timeoutId: any = -1;
            const loadCallback = (e) => { callback(); }
            const cleanup = () => {
                this.textTrack.removeEventListener("load", loadCallback);
                clearTimeout(timeoutId);
            }
            
            const timeoutCallback = (e) => {
                if(this.textTrack.cues != null 
                && this.textTrack.cues.length > 0){
                    callback();
                    cleanup();
                }
                else {
                    timeoutId = setTimeout(timeoutCallback, 100);
                }
            }

            this.textTrack.addEventListener("load", loadCallback);
            
            timeoutId = setTimeout(timeoutCallback, 100);
        }
    }
}