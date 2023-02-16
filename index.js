const PORT = 5500;
require("dotenv").config();
const axios = require("axios");
const cheerio = require("cheerio");
const express = require("express");
const app = express();
const cors = require("cors");
const LRU = require("lru-cache");
const cache = new LRU({ max: 500 });

const apiKey = process.env.api_key;

app.use(cors());

app.get("/", (req, res) => {
  if (!req.query.username) {
    return res
      .status(400)
      .send({ error: "Username query parameter is required." });
  }

  const username = req.query.username;

  const cachedResponse = cache.get(username);
  if (cachedResponse) {
    return res.send(cachedResponse);
  }
  const channelUsernameUrl = `https://www.youtube.com/@${username}`;

  axios(channelUsernameUrl)
    .then((response) => {
      const html = response.data;
      const $ = cheerio.load(html);
      const chId = $('meta[property="og:url"]').attr("content");
      const chIdSliced = chId.slice(32);

      const urlStats = `https://www.googleapis.com/youtube/v3/channels?part=snippet,statistics&id=${chIdSliced}&key=${apiKey}`;
      const urlNo1Video = `https://www.googleapis.com/youtube/v3/search?part=snippet&channelId=${chIdSliced}&maxResults=1&order=viewCount&key=${apiKey}`;

      Promise.all([axios(urlStats), axios(urlNo1Video)])
        .then(([statsResponse, videoResponse]) => {
          const chstats = statsResponse.data;
          const chNo1Video = videoResponse.data;

          const urlNo1VideoViews = `https://www.googleapis.com/youtube/v3/videos?part=statistics&id=${chNo1Video.items[0].id.videoId}&key=${apiKey}`;

          axios(urlNo1VideoViews).then((viewResponse) => {
            const chNo1VideoViews = viewResponse.data;

            const resData = { chstats, chNo1Video, chNo1VideoViews };
            cache.set(username, resData);
            res.send(resData);
          });
        })
        .catch((err) => {
          console.log(err);
          res.status(500).send({ error: "This is not an existing account." });
        });
    })
    .catch((err) => {
      console.log(err);
      res.status(500).send({ error: "This is not an existing username." });
    });
});

app.get("/id/", (req, res) => {
  const chId = req.query.channelId;
  const cachedResponse = cache.get(chId);
  if (cachedResponse) {
    return res.send(cachedResponse);
  }

  const channelId = chId.split("/").pop();
  const urlStats = `https://www.googleapis.com/youtube/v3/channels?part=snippet,statistics&id=${channelId}&key=${apiKey}`;
  const urlNo1Video = `https://www.googleapis.com/youtube/v3/search?part=snippet&channelId=${channelId}&maxResults=1&order=viewCount&key=${apiKey}`;

  Promise.all([axios(urlStats), axios(urlNo1Video)])
    .then(([statsResponse, videoResponse]) => {
      const chstats = statsResponse.data;
      const chNo1Video = videoResponse.data;
      const urlNo1VideoViews = `https://www.googleapis.com/youtube/v3/videos?part=statistics&id=${chNo1Video.items[0].id.videoId}&key=${apiKey}`;

      axios(urlNo1VideoViews).then((viewResponse) => {
        const chNo1VideoViews = viewResponse.data;
        const resData = { chstats, chNo1Video, chNo1VideoViews };
        cache.set(chId, resData);
        res.send(resData);
      });
    })
    .catch((err) => {
      console.log(err);
      res.status(500).send({ error: "This is not an existing account." });
    });
});

app.get("/trendings/", (req, res) => {
  const trendingCountry = req.query.trendingCountry;
  const cachedResponse = cache.get(trendingCountry);
  if (cachedResponse) {
    return res.send(cachedResponse);
  }

  const urlTrendings = `https://www.googleapis.com/youtube/v3/videos?part=snippet,statistics&chart=mostPopular&regionCode=${trendingCountry}&maxResults=10&key=${apiKey}`;

  axios(urlTrendings)
    .then((trendingsResponse) => {
      const trendingsData = trendingsResponse.data;
      cache.set(trendingsData);
      res.send(trendingsData);
    })
    .catch((err) => {
      console.log(err);
      res.status(500).send({ error: "This is not an existing account." });
    });
});

app.listen(PORT, () => console.log(`Server running on PORT ${PORT}`));
