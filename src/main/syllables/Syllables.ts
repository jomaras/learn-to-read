import './syllables.scss';
import { Teacher } from '../../teacher/Teacher'
import { ExerciseType } from '../../teacher/model/ExerciseType';
import { ITeachingResult } from '../../teacher/model/ITeachingResult';

let points = 0;
let targetPoints = 1200;

const mainContainer: HTMLElement = document.querySelector("main") as HTMLElement;
 
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
    const data = await (await fetch("wordsWithSylablles.json")).json();
    data.sort((a, b) => b.count - a.count);
    let word: string = "";

    function teachWord(currentWord: string){
        word = currentWord;
        //{ hideAfterPeriod: word.length * 350}
        teacher.teach(word);
    }
    
    const teacher = new Teacher(mainContainer, ExerciseType.Syllables);
    teacher.onContinue(async (teachingResult:ITeachingResult) => {
        console.log("on continue", teachingResult);
        
        if(teachingResult.success){
            const duration = teachingResult.duration/1000;
            let newPoints = 0;
            
            if(duration < 1){ newPoints = 40; }
            else if(duration < 1.5) {  newPoints = 35; }
            else if(duration < 2) {  newPoints = 30; }
            else if(duration < 3) {  newPoints = 25; }
            else if(duration < 4) {  newPoints = 15; }
            else {  newPoints = 5; }

            newPoints *= Math.max((word.length - 1), 1);

            points += newPoints;
            
            showPoints();

            goToNextWord();
        }
        else {
            goToNextWord();
        }
    });
    
    document.querySelector("#startButton")?.addEventListener("click", startNewGame);

    function startNewGame(){
        points = 0;
        showPoints();
        teachWord(getRandomWord());
    }

    function goToNextWord(){
        teachWord(getRandomWord());
    }

    function getRandomWord(){
        const totalWeight = data.reduce((sum, item) => sum + item.count, 0);
    
        // Generate a random number between 0 and totalWeight
        const randomNum = Math.random() * totalWeight;
        
        // Iterate through the array and find the item corresponding to the random number
        let cumulativeWeight = 0;
        for (const item of data) {
            cumulativeWeight += item.count;
            if (randomNum < cumulativeWeight) {
                return item.hyphenated;
            }
        }

        return data[Math.floor(Math.random() * data.length)].hyphenated;
    }


    document.addEventListener("keydown", e => {
        if(e.which == 39 || e.which == 32 || e.which == 37) { // -> or space
            goToNextWord();
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
    
    //await VoiceOver.playWordLetterByLetter("rat");
    startNewGame();
})();