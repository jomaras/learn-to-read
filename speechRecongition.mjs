import fs from "fs";
import OpenAI from "openai";

const part1 = "sk-qhoFDVxOo6VzK4apBfYMT"
const part2 = "3BlbkFJ2698HMraguzgrxMkzd4Q"

async function main() {
  const openai = new OpenAI({
    apiKey: part1 + part2
  });
  
  const transcription = await openai.audio.transcriptions.create({
    file: fs.createReadStream("/Users/josipmaras/Downloads/Marija.mp3"),
    model: "whisper-1",
    language:"hr",
    response_format: "text",
  });

  console.log(transcription);
  console.log("END");
}

main();