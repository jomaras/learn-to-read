const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
const SpeechGrammarList = window.SpeechGrammarList || window.webkitSpeechGrammarList;
const SpeechRecognitionEvent = window.SpeechRecognitionEvent || window.webkitSpeechRecognitionEvent;

class SpeechRecognitionUtilsClass {
    #speechRecognition;
    #speechRecognitionCallbacks;
    #shouldSpeechRecognitionBeRunning;
    
    constructor(){
        this.#speechRecognitionCallbacks = [];
        
        this.#speechRecognition = new SpeechRecognition();
        this.#speechRecognition.continuous = true;
        this.#speechRecognition.lang = "hr";
        this.#speechRecognition.interimResults = true;
        this.#speechRecognition.maxAlternatives = 10;

        this.#shouldSpeechRecognitionBeRunning = false;

        this.#speechRecognition.onresult = (event) => {
            const lastResult = event.results[event.results.length - 1];
            const nonEmptyResults = [];
            
            for(const item of lastResult){
                console.log(`${item.transcript}, Confidence: ${item.confidence}`);

                if(!(item.transcript || "").trim()){
                    console.log("Aborting speech recognition");
                    this.#speechRecognition.stop();
                    this.#speechRecognition.abort();
                }
                else {
                    nonEmptyResults.push({ text: item.transcript, confidence: item.confidence});
                }
            }

            if(nonEmptyResults.length > 0){
                this.#triggerCallbacks(nonEmptyResults);
            }
        };
            
        this.#speechRecognition.onend = e => {
            console.log("Ended, restarting...");
            if(this.#shouldSpeechRecognitionBeRunning){
                this.#speechRecognition.start();
            }
        };

        this.#speechRecognition.onerror = (event) => {
            console.log(`Error occurred: ${event.error}`);    
            // Optionally, you can restart on certain errors
            if (event.error === 'no-speech' || event.error === 'aborted') {
                console.log("Restarting due to error...");
                this.#speechRecognition.start();
            }
        };
    }

    onSpeechRecognition(callback){
        if(!callback) { return; }
        
        if(this.#speechRecognitionCallbacks.indexOf(callback) >= 0) { return; }

        this.#speechRecognitionCallbacks.push(callback);

        if(this.#speechRecognitionCallbacks.length == 1){
            this.#speechRecognition.start();
            this.#shouldSpeechRecognitionBeRunning = true;
        }
    }

    offSpeechRecognition(callback){
        const callbackIndex = this.#speechRecognitionCallbacks.indexOf(callback);
        if(callbackIndex >= 0) {
            this.#speechRecognitionCallbacks.splice(callbackIndex, 1);
        }

        if(this.#speechRecognitionCallbacks.length == 0){
            this.#speechRecognition.stop();
            this.#shouldSpeechRecognitionBeRunning = false;
        }
    }

    #triggerCallbacks(results){
        for(const callback of this.#speechRecognitionCallbacks){
            callback(results);
        }
    }
}

export const SpeechRecognitionUtils = new SpeechRecognitionUtilsClass;