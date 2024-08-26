class VoiceOverClass {
    public language: string = "hr";
    private audioElement: HTMLAudioElement = document.getElementById("audio") as HTMLAudioElement;

    public async playLetterSound(letter){
        return new Promise(async (resolve, reject) => {
            console.log("play letter sound");
            if(this.language == "hr"){
                try {
                    await this.loadAudio(`sound/letters/${this.language}/${letter}.mp3`);
                    await this.playTillEnd();
                }
                catch(e){
                    console.log(e);
                }
            }

            resolve(true);
        });
    }
    
    public async playReadLetter(){
        return new Promise(async (resolve, reject) => {
            if(this.language == "hr"){
                await this.loadAudio(`sound/letters/${this.language}/procitaj_slovo.mp3`);
                await this.playTillEnd();
            }

            resolve(true);
        });
    }

    private async loadAudio(src: string){
        return new Promise((resolve, reject) => {
            this.audioElement.setAttribute("src", src);
            resolve(true);
        });
    }

    private async playTillEnd(){
        return new Promise((resolve, reject) => {
            const onEnded = e => {
                this.audioElement.removeEventListener("ended", onEnded);
                resolve(true);
            };
            
            this.audioElement.addEventListener("ended", onEnded);
            this.audioElement.play();
        });
    }
}

export const VoiceOver = new VoiceOverClass();