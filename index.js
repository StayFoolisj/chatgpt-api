// Add Express
const express = require("express");
const dotenv = require('dotenv');
dotenv.config();
const res = require("express/lib/response");
const { Configuration, OpenAIApi } = require("openai");

const Genius = require("genius-lyrics");

const Client = new Genius.Client(); // Scrapes if no key is provided
const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

async function getLyrics(song) {
  const searches = await Client.songs.search(song);
  
  // Pick first one
  const firstSong = searches[0];
  console.log("About the Song:\n", firstSong, "\n");
  
  // Ok lets get the lyrics
  const lyrics = await firstSong.lyrics();
  // console.log("Lyrics of the Song:\n", lyrics, "\n");

  return lyrics
}

async function aristocratize(lyrics) {
  // Use the GPT-3 model to generate completions for the given text
  const res = await openai.createCompletion({
    prompt: `Please convert the following text to aristocratic English:\n\n${lyrics}`,
    model: 'text-davinci-002',
    temperature: 0.5,
    max_tokens: 2000,
    n: 1,
    stop: '.'
  })

  return res.data.choices[0].text;
}


// Initialize Express
const app = express();

app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
 })

// Create GET request
app.get("/", (req, res) => {
  res.send("Express on Vercel");
});


app.post("/aristrocatize", async (req, res) => {
  // get the query string
  const artist = req.title
  const songTitle = req.song_title;

  const lyrics = await getLyrics(`${artist} ${songTitle}`);
  const aristocratized = await aristocratize(lyrics);
  console.log(aristocratized)
  
  res.send({result: aristocratized});
});

// Initialize server
app.listen(5001, () => {
  console.log("Running on port 5000.");
});

// Export the Express API
module.exports = app;