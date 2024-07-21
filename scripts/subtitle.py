api1 = "sk-qhoFDVxOo6VzK4apBf";
api2 = "YMT3BlbkFJ2698HMraguzgrxMkzd4Q";
apiKey = api1 + api2;

#ffmpeg -i 01.mp4 -vn -acodec copy 01.m4a
#ffmpeg -i audio.m4a -f segment -segment_time 1600 -c copy -vn output%03d.m4a


from openai import OpenAI
client = OpenAI(api_key=apiKey)

files = ["/Users/josipmaras/Projects/learn-to-read/videos/number-blocks/s01/hr/01.m4a"]

for input in files:
  print("Processing to: " + input)
  output = input.replace(".m4a", ".vtt")

  audio_file= open(input, "rb")
  transcript = client.audio.transcriptions.create(
    model="whisper-1", 
    language="hr",
    response_format="vtt",
    file=audio_file
  )

  #print(transcript)

  f = open(output, "w")
  f.write(transcript)
  f.close()

  print("Written to: " + output)