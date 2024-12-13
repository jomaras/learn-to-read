import fs from 'fs';

const wordsAndSylablles = JSON.parse(fs.readFileSync("./wordsAndSylablles.json", "utf-8"));

const words = [...wordsAndSylablles.words[4], ...wordsAndSylablles.words[5], ...wordsAndSylablles.words[6], ...wordsAndSylablles.words[7], ...wordsAndSylablles.words[8]];

const unhyphenatedWords = words.filter(it => it.hyphenated.indexOf("-") == -1);

unhyphenatedWords.forEach(word => {
    const parts = [];
    const vowels = ["a", "e", "i", "o", "u", "A", "E", "I", "O", "U"];
    parts.push(word.hyphenated[0]);

    if(vowels.indexOf(word.hyphenated[0]) >= 0){
        parts.push("");
    }
    
    for(let i = 1; i < word.hyphenated.length; i++){
        const previousLetter = word.hyphenated[i]
        const letter = word.hyphenated[i];
        const nextLetter = word.hyphenated[i + 1];

        parts[parts.length-1] += letter;
        
        if(vowels.indexOf(letter) >= 0) {    
            parts.push("");
        }
    }

    if(!parts[parts.length - 1]){ parts.pop(); }
    if(parts[parts.length - 1].length == 1 && vowels.indexOf(parts[parts.length - 1]) == -1){
        const lastLetter = parts.pop();
        parts[parts.length - 1] += lastLetter;
    }

    console.log(word.hyphenated, parts.join("-"));
    word.hyphenated = parts.join("-");
});

fs.writeFileSync("wordsWithSylablles.json", JSON.stringify(words), "utf-8");