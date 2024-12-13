const fs = require('fs');
const cheerio = require("cheerio");

const rootBookContentFolder = "./html";

function hyphenate(word){
    const wovels = 'aeiouAEIOU';
    let syllables = [];
    let currentSyllable = '';
    
    for (let i = 0; i < word.length; i++) {
        currentSyllable += word[i];
        if (wovels.includes(word[i])) {
        if (i < word.length - 1 && !wovels.includes(word[i + 1])) {
            syllables.push(currentSyllable);
            currentSyllable = '';
        }
        }
    }
    
    if (currentSyllable) {
        syllables.push(currentSyllable);
    }
    
    return syllables.join('-');
}

async function determineSentences(){
    const files = fs.readdirSync(rootBookContentFolder);
    const finalSentences = [];
    
    for(const file of files){
        const content = fs.readFileSync(`${rootBookContentFolder}/${file}`, "utf-8");
        const $ = cheerio.load(content);
        const text = $("body").text();
        
        const cleanText = text.replaceAll("â", "a");
        const sentences = cleanText.split(/\.|\!|\?|,|;|—/);

        for(let sentence of sentences){
            sentence = sentence.trim().replace(/\n/g, " ").trim();

            if(!sentence || /\d|\(|\)|:|«|»|-/.test(sentence)){ continue; }
            const words = sentence.split(/\s+/);
            if(words.length < 3 || words.length > 6) { continue; }
            
            finalSentences.push(sentence);
        }
    }

    fs.writeFileSync("sentences.txt", finalSentences.join("\n"), "utf-8");
}

async function determinewordsAndSylablles() {
    const files = fs.readdirSync(rootBookContentFolder);
    
    const syllablesCounter = new Map();
    const wordsCounter = new Map();
    const wordHyphens = new Map();
    
    for(const file of files){
        const content = fs.readFileSync(`${rootBookContentFolder}/${file}`, "utf-8");
        const $ = cheerio.load(content);
        const text = $("body").text();
        
        const cleanText = text.replaceAll("â", "a").replace(/[^\w\sčćšđžČĆŠĐŽ]/gi, '')
        const words = cleanText.split(/\s+/);
        
        for(const word of words){
            if(!wordsCounter.has(word)){
                if(word == "če") { debugger}
                wordsCounter.set(word, 0);

                if(word.length > 3){
                    const hyphenated = hyphenate(word);
                    wordHyphens.set(word, hyphenated);

                    const syllables = hyphenated.split("-");
                    for(const syllable of syllables){
                        if(!syllablesCounter.has(syllable)){
                            syllablesCounter.set(syllable, 0)
                        }

                        syllablesCounter.set(syllable, syllablesCounter.get(syllable) + 1);
                    }
                }
            }

            wordsCounter.set(word, wordsCounter.get(word) + 1);
        }
    }

    const wordEntries = [];
    for(const word of wordsCounter.keys()){
        const count = wordsCounter.get(word);
        if(count > 1){
            wordEntries.push({ word: word, count: count, hyphenated: count > 3 ? wordHyphens.get(word) : word});
        }
    }

    const syllableEntries = [];
    for(const syllable of syllablesCounter.keys()){
        syllableEntries.push({ syllable: syllable, count: syllablesCounter.get(syllable)});
    }

    syllableEntries.sort((a, b) => b.count - a.count);

    const nLetterWords = {
        "2": [],
        "3": [],
        "4": [],
        "5": [],
        "6": [],
        "7": [],
        "8": []
    };

    wordEntries.sort((a, b) => b.count - a.count);
    for(const item of wordEntries){
        console.log(item.word, item.count);
        
        if(item.word.length == 2 && item.count >= 2){ nLetterWords["2"].push(item); }
        if(item.word.length == 3 && item.count >= 2){ nLetterWords["3"].push(item); }
        if(item.word.length == 4 && item.count >= 2){ nLetterWords["4"].push(item); }
        if(item.word.length == 5 && item.count >= 2){ nLetterWords["5"].push(item); }
        if(item.word.length == 6 && item.count >= 2){ nLetterWords["6"].push(item); }
        if(item.word.length == 7 && item.count >= 2){ nLetterWords["7"].push(item); }
        if(item.word.length == 8 && item.count >= 2){ nLetterWords["8"].push(item); }
    }

    fs.writeFileSync("wordsAndSylablles.json", JSON.stringify({
        words: nLetterWords,
        syllables: syllableEntries
    }), "utf-8");
};

//await determinewordsAndSylablles();
determineSentences();