class VoiceOverClass {
    public language: string = "hr";
    private audioElement: HTMLAudioElement = document.getElementById("audio") as HTMLAudioElement;

    public async playWordLetterByLetter(word: string){
        for(const letter of word){
            await this.playLetterSound(letter, 2.5);
        }
    }

    public async playLetterSound(letter, playbackRate: number = 1){
        return new Promise(async (resolve, reject) => {
            if(this.language == "hr"){
                try {
                    await this.loadAudio(`sound/letters/${this.language}/${letter}.mp3`);
                    this.audioElement.playbackRate = playbackRate;
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