import { ElevenLabsClient } from "elevenlabs";
import fs from 'fs';

const elevenlabs = new ElevenLabsClient({
  apiKey: "ca8815db2610a39d10f38ef0caa289ec"
});

const phrases = [
  { text: "Pročitaj ovo slovo", file: "procitaj_slovo.mp3"},
  { text: "Slovo 'A'", file: "a.mp3"},
  { text: "Slovo 'B'", file: "b.mp3"},
  { text: "Slovo 'C'", file: "c.mp3"},
  { text: "Slovo 'Č'", file: "č.mp3"},
  { text: "Slovo 'Ć'", file: "ć.mp3"},
  { text: "Slovo 'D'", file: "d.mp3"},
  { text: "Slovo 'DŽ'", file: "dž.mp3"},
  { text: "Slovo 'Đ'", file: "đ.mp3"},
  { text: "Slovo 'E'", file: "e.mp3"},
  { text: "Slovo 'F'", file: "f.mp3"},
  { text: "Slovo 'G'", file: "g.mp3"},
  { text: "Slovo 'H'", file: "h.mp3"},
  { text: "Slovo 'I'", file: "i.mp3"},
  { text: "Slovo 'J'", file: "j.mp3"},
  { text: "Slovo 'K'", file: "k.mp3"},
  { text: "Slovo 'L'", file: "l.mp3"},
  { text: "Slovo 'Lj'", file: "lj.mp3"},
  { text: "Slovo 'M'", file: "m.mp3"},
  { text: "Slovo 'N'", file: "n.mp3"},
  { text: "Slovo 'NJ'", file: "nj.mp3"},
  { text: "Slovo 'O'", file: "o.mp3"},
  { text: "Slovo 'P'", file: "p.mp3"},
  { text: "Slovo 'R'", file: "r.mp3"},
  { text: "Slovo 'S'", file: "s.mp3"},
  { text: "Slovo 'Š'", file: "š.mp3"},
  { text: "Slovo 'T'", file: "t.mp3"},
  { text: "Slovo 'U'", file: "u.mp3"},
  { text: "Slovo 'V'", file: "v.mp3"},
  { text: "Slovo 'Z'", file: "z.mp3"},
  { text: "Slovo 'Ž'", file: "ž.mp3"},
]

for(const phrase of phrases){
  await readText(phrase.text, phrase.file);
}

function readText(text, outputFile){
  return new Promise(async (resolve, reject) => {
    const audioStream = await elevenlabs.generate({
      voice: "Sarah",
      text: text,
      model_id: "eleven_turbo_v2_5",
      language_code: 'hr'
    });
    
    const writeStream = fs.createWriteStream(`sound/letters/hr/${outputFile}`);
    
    audioStream.pipe(writeStream);
    
    writeStream.on('finish', () => {
      console.log("Done with", outputFile);
      resolve(true);
    });
    
    writeStream.on('error', (err) => {
      console.log("Error with", outputFile);
        resolve(false);
    });
  })  
}