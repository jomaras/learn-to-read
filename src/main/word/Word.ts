import './word.scss';
import { Teacher } from './../../teacher/Teacher'
import { ExerciseType } from '../../teacher/model/ExerciseType';
import { ValueUtils } from '../../utils/ValueUtils';


let points = 0;
let targetPoints = 1200;

const mainContainer: HTMLElement = document.querySelector("main") as HTMLElement;
 
let currentWordCounter = 0;
let fireworks;

function showPoints(){
    const pointsContainer = document.getElementById("points-container");
    if(pointsContainer != null){
        pointsContainer.textContent = `${points}/${targetPoints}`;
    }
    
    if(points >= targetPoints){
        showFireworks();
    }
}

            
function showFireworks(){
    const container = document.querySelector('#fireworks-container');
    
    if(container != null){
        container.classList.add("shown");
    }
    
    fireworks = new (window as any).Fireworks.default(container, {
        sound: {
            enabled: true,
            files: [
                'sound/explosions/explosion0.mp3',
                'sound/explosions/explosion1.mp3',
                'sound/explosions/explosion2.mp3'
            ],
            volume: {
                min: 4,
                max: 8
            }
        }
    });
    fireworks.start();

    setTimeout(() => {
        hideFireworks();
    }, 10000);
}

function hideFireworks(){
    const container = document.querySelector('#fireworks-container');
    container && container.classList.add("shown");
    fireworks.stop(true);
}
            
(async () => {
    const data = await (await fetch("wordsAndSylablles.json")).json();

    let roundStartTime = new Date();
    let roundEndTime = new Date();
    let word: string = "";

    function teachWord(currentWord: string){
        word = currentWord;
        teacher.teach(word);
    }
    
    const teacher = new Teacher(mainContainer, ExerciseType.BigWords);
    teacher.onContinue(async (hasBeenRecognized: boolean) => {
        console.log("on continue");
        roundEndTime = new Date();
        
        if(hasBeenRecognized){
            const duration = (+roundEndTime - +roundStartTime)/1000;
            let newPoints = 0;
            
            if(duration < 1){ newPoints = 50; }
            else if(duration < 1.5) {  newPoints = 40; }
            else if(duration < 2) {  newPoints = 30; }
            else if(duration < 3) {  newPoints = 20; }
            else if(duration < 4) {  newPoints = 10; }
            else {  newPoints = 5; }

            newPoints *= word.length;

            points += newPoints;
            showPoints();

            goToNextWord();
        }
        else {
            goToNextWord();
        }
    });
    

    function getCurrentWordsBank(){
        let lettersCount: any = (document.querySelector("#numberOfLettersSelector") as HTMLInputElement).value;
        if(lettersCount == "random"){
            lettersCount = ValueUtils.getRandomNumber(3, 8);
        }
        
        return data.words[lettersCount] || getCurrentWordsBank();
    }

    document.querySelector("#numberOfLettersSelector")?.addEventListener("change", () => {
        const wordsBank = getCurrentWordsBank();
        
        if(wordsBank){
            currentWordCounter = 0;
            teachWord(wordsBank[currentWordCounter].word)
        }
    });

    document.querySelector("#startButton")?.addEventListener("click", startNewGame);

    function startNewGame(){
        points = 0;
        showPoints();
        
        const wordsBank = getCurrentWordsBank();
        
        if(wordsBank){
            currentWordCounter = 0;
            //teachWord(wordsBank[currentWordCounter].word);
            teachWord("konj");
        }
    }

    function goToNextWord(){
        const wordsBank = getCurrentWordsBank();
        if(wordsBank){
            currentWordCounter++;
            if(!wordsBank[currentWordCounter]){
                currentWordCounter = 0;
            }
            
            teachWord(wordsBank[currentWordCounter].word);
        }
    }

    function goToPreviousWord(){
        const wordsBank = getCurrentWordsBank();
        if(wordsBank){
            currentWordCounter--;
            if(currentWordCounter < 0){
                currentWordCounter = wordsBank.length - 1;
            }
            
            teachWord(wordsBank[currentWordCounter].word);
        }
    }

    document.addEventListener("keydown", e => {
        if(e.which == 39 || e.which == 32) { // -> or space
            goToNextWord();
        }
        else if(e.which == 37){// <-
            goToPreviousWord();
        }
        else if(e.which == 13){
            startNewGame();
        }
        else if(e.key == "f"){
            showFireworks();
        }
    });

    document.querySelector("#letter-container")?.addEventListener("click", function(){
        goToNextWord();
    });
    
    startNewGame();
})();