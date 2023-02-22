const PORT = 5500;
require("dotenv").config({ path: "C:\\_01\\GitHub\\.env\\.env" });
const axios = require("axios");
const cheerio = require("cheerio");
const express = require("express");
const app = express();
const cors = require("cors");
const LRU = require("lru-cache");
const cache = new LRU({ max: 500 });
const nodemailer = require("nodemailer");
const { google } = require("googleapis");
const cron = require("node-cron");

const apiKey = process.env.api_key;
const senderMail = process.env.sender_mail;
const mailList = process.env.mail_list.split(",");
const clientID = process.env.client_ID;
const clientSecret = process.env.client_secret;
const redirectURI = process.env.redirect_URI;
const refreshToken = process.env.refresh_token;

const timeNow = new Date().toLocaleDateString("en-GB").replaceAll("/", "-");

const OAuth2 = google.auth.OAuth2;
const oAuth2Client = new OAuth2(clientID, clientSecret, redirectURI);

oAuth2Client.setCredentials({ refresh_token: refreshToken });

app.use(cors());

// Get channel info by username
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

// Get channel info by ID
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

// Get trendings
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

// Send e-mails with trendings
app.get("/emails/", (req, res) => {
  return fetch(
    `https://www.googleapis.com/youtube/v3/videos?part=snippet,statistics&chart=mostPopular&regionCode=BE&maxResults=5&key=${apiKey}`
  )
    .then((res) => res.json())
    .then((data) => {
      let trendingNo1ViewCount = parseInt(data.items[0].statistics.viewCount);
      let trendingNo1ViewCountNum = trendingNo1ViewCount.toLocaleString();
      let trendingNo1LikesCount = parseInt(data.items[0].statistics.likeCount);
      let trendingNo1LikesCountNum = trendingNo1LikesCount.toLocaleString();
      let trendingNo1CommsCount = parseInt(
        data.items[0].statistics.commentCount
      );
      let trendingNo1CommsCountNum = trendingNo1CommsCount.toLocaleString();

      let trendingNo2ViewCount = parseInt(data.items[1].statistics.viewCount);
      let trendingNo2ViewCountNum = trendingNo2ViewCount.toLocaleString();
      let trendingNo2LikesCount = parseInt(data.items[1].statistics.likeCount);
      let trendingNo2LikesCountNum = trendingNo2LikesCount.toLocaleString();
      let trendingNo2CommsCount = parseInt(
        data.items[1].statistics.commentCount
      );
      let trendingNo2CommsCountNum = trendingNo2CommsCount.toLocaleString();

      let trendingNo3ViewCount = parseInt(data.items[2].statistics.viewCount);
      let trendingNo3ViewCountNum = trendingNo3ViewCount.toLocaleString();
      let trendingNo3LikesCount = parseInt(data.items[2].statistics.likeCount);
      let trendingNo3LikesCountNum = trendingNo3LikesCount.toLocaleString();
      let trendingNo3CommsCount = parseInt(
        data.items[2].statistics.commentCount
      );
      let trendingNo3CommsCountNum = trendingNo3CommsCount.toLocaleString();

      let trendingNo4ViewCount = parseInt(data.items[3].statistics.viewCount);
      let trendingNo4ViewCountNum = trendingNo4ViewCount.toLocaleString();
      let trendingNo4LikesCount = parseInt(data.items[3].statistics.likeCount);
      let trendingNo4LikesCountNum = trendingNo4LikesCount.toLocaleString();
      let trendingNo4CommsCount = parseInt(
        data.items[3].statistics.commentCount
      );
      let trendingNo4CommsCountNum = trendingNo4CommsCount.toLocaleString();

      let trendingNo5ViewCount = parseInt(data.items[4].statistics.viewCount);
      let trendingNo5ViewCountNum = trendingNo5ViewCount.toLocaleString();
      let trendingNo5LikesCount = parseInt(data.items[4].statistics.likeCount);
      let trendingNo5LikesCountNum = trendingNo5LikesCount.toLocaleString();
      let trendingNo5CommsCount = parseInt(
        data.items[4].statistics.commentCount
      );
      let trendingNo5CommsCountNum = trendingNo5CommsCount.toLocaleString();

      async function sendingEmail() {
        try {
          const accessToken = await oAuth2Client.getAccessToken();

          const transport = nodemailer.createTransport({
            service: "gmail",
            auth: {
              type: "OAUTH2",
              user: senderMail,
              clientId: clientID,
              clientSecret: clientSecret,
              refreshToken: refreshToken,
              accessToken: accessToken,
            },
          });

          const mailOptions = {
            from: `Youtube Daily Trendings ▶️ <noreply-${senderMail}>`,
            bcc: `${mailList.join(", ")}`,
            subject: "Youtube Daily Trendings ▶️",
            text: "",
            html: `<body style="border-radius: 10px">
          <h3>Hi there,</h3>
          <div style="margin-bottom: 10px">I hope everything goes perfect for you today.</div>
          <div style="margin-bottom: 20px">Please see below an updated list of the most popular Youtube videos in Romania, as of ${timeNow}:</div>
          <div style="margin-bottom: 20px"><br><br>
            <div>No. 1 - <a href="https://www.youtube.com/watch?v=${data.items[0].id}" target="blank" style="text-decoration:underline; padding: 5px;">${data.items[0].snippet.title}</a></div>
            <div style="margin-left: 30px">&#x1F525; ${trendingNo1ViewCountNum} &nbsp; &nbsp; &#128077; ${trendingNo1LikesCountNum} &nbsp; &nbsp; &#128172; ${trendingNo1CommsCountNum}</div>
          </div>
          <div style="margin-bottom: 20px">
            <div>No. 2 - <a href="https://www.youtube.com/watch?v=${data.items[1].id}" target="blank" style="text-decoration:underline; padding: 5px;">${data.items[1].snippet.title}</a></div>
            <div style="margin-left: 30px">&#x1F525; ${trendingNo2ViewCountNum} &nbsp; &nbsp; &#128077; ${trendingNo2LikesCountNum} &nbsp; &nbsp; &#128172; ${trendingNo2CommsCountNum}</div>
          </div>
          <div style="margin-bottom: 20px">
            <div>No. 3 - <a href="https://www.youtube.com/watch?v=${data.items[2].id}" target="blank" style="text-decoration:underline; padding: 5px;">${data.items[2].snippet.title}</a></div>
            <div style="margin-left: 30px">&#x1F525; ${trendingNo3ViewCountNum} &nbsp; &nbsp; &#128077; ${trendingNo3LikesCountNum} &nbsp; &nbsp; &#128172; ${trendingNo3CommsCountNum}</div>
          </div>
          <div style="margin-bottom: 20px">
            <div>No. 4 - <a href="https://www.youtube.com/watch?v=${data.items[3].id}" target="blank" style="text-decoration:underline; padding: 5px;">${data.items[3].snippet.title}</a></div>
            <div style="margin-left: 30px">&#x1F525; ${trendingNo4ViewCountNum} &nbsp; &nbsp; &#128077; ${trendingNo4LikesCountNum} &nbsp; &nbsp; &#128172; ${trendingNo4CommsCountNum}</div>
          </div>
          <div style="margin-bottom: 20px">
            <div>No. 5 - <a href="https://www.youtube.com/watch?v=${data.items[4].id}" target="blank" style="text-decoration:underline; padding: 5px;">${data.items[4].snippet.title}</a></div>
            <div style="margin-left: 30px">&#x1F525; ${trendingNo5ViewCountNum} &nbsp; &nbsp; &#128077; ${trendingNo5LikesCountNum} &nbsp; &nbsp; &#128172; ${trendingNo5CommsCountNum}</div>
          </div>
          </body>`,
          };

          const result = await transport.sendMail(mailOptions);
          return result;
        } catch (error) {
          return error;
        }
      }

      res.send("Email sent!");
      // sendingEmail();

      cron.schedule(
        "31 23 * * *",
        () => {
          sendingEmail();
        },
        {
          scheduled: true,
          timezone: "Europe/Bucharest",
        }
      );
    });
});

app.listen(PORT, () => console.log(`Server running on PORT ${PORT}`));
