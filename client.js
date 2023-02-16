const ytbUser = document.querySelector(".ytb_user");
const ytbId = document.querySelector(".ytb_ID");
const ytbTrendings = document.querySelector(".ytb_trendings");
const pasteUserName = document.querySelector(".paste_username");
const chCountry = document.querySelector(".country_name");
const no1Video = document.querySelector(".most_popular_video");
const no1VideoViews = document.querySelector(".most_popular_video_views");
const chSubs = document.querySelector(".subscribers_count");
const chVideos = document.querySelector(".videos_count");
const chViews = document.querySelector(".views_count");
const infoButton = document.querySelector(".info_button");
const searchForm = document.querySelector(".search_form");
const trendingsData = document.querySelector(".trendings_data");
const trendingNo1 = document.querySelector(".trending_no1");
const trendingNo1Views = document.querySelector(".trending_no1_views");
const trendingNo2 = document.querySelector(".trending_no2");
const trendingNo2Views = document.querySelector(".trending_no2_views");
const trendingNo3 = document.querySelector(".trending_no3");
const trendingNo3Views = document.querySelector(".trending_no3_views");
const trendingNo4 = document.querySelector(".trending_no4");
const trendingNo4Views = document.querySelector(".trending_no4_views");
const trendingNo5 = document.querySelector(".trending_no5");
const trendingNo5Views = document.querySelector(".trending_no5_views");
const countryList = document.querySelector(".country_list");

infoButton.disabled = true;
pasteUserName.disabled = true;
trendingsData.style.visibility = "hidden";

pasteUserName.addEventListener("input", function () {
  infoButton.disabled = pasteUserName.value === "";
  if (pasteUserName.value === "") {
    chCountry.innerHTML = "";
    no1Video.innerHTML = "";
    no1VideoViews.innerHTML = "";
    chSubs.innerHTML = "";
    chVideos.innerHTML = "";
    chViews.innerHTML = "";
  }
});

let urlEndpoint;

ytbUser.addEventListener("click", () => {
  urlEndpoint = "http://localhost:5500/?username";
  pasteUserName.value = "";
  chCountry.innerHTML = "";
  no1Video.innerHTML = "";
  no1VideoViews.innerHTML = "";
  chSubs.innerHTML = "";
  chVideos.innerHTML = "";
  chViews.innerHTML = "";
  ytbUser.style.background = "yellow";
  ytbId.style.background = "white";
  ytbTrendings.style.background = "white";
  ytbUser.style.transform = "scale(1.1)";
  ytbId.style.transform = "scale(1.0)";
  ytbTrendings.style.transform = "scale(1.0)";
  ytbUser.style.opacity = "1";
  ytbId.style.opacity = "0.5";
  ytbTrendings.style.opacity = "0.5";
  pasteUserName.placeholder = "Type channel username...";
  pasteUserName.disabled = false;
  searchForm.style.visibility = "visible";
  trendingsData.style.visibility = "hidden";
});

ytbId.addEventListener("click", () => {
  urlEndpoint = "http://localhost:5500/id/?channelId";
  pasteUserName.value = "";
  chCountry.innerHTML = "";
  no1Video.innerHTML = "";
  no1VideoViews.innerHTML = "";
  chSubs.innerHTML = "";
  chVideos.innerHTML = "";
  chViews.innerHTML = "";
  ytbId.style.background = "yellow";
  ytbUser.style.background = "white";
  ytbTrendings.style.background = "white";
  ytbId.style.transform = "scale(1.1)";
  ytbUser.style.transform = "scale(1.0)";
  ytbTrendings.style.transform = "scale(1.0)";
  ytbId.style.opacity = "1";
  ytbUser.style.opacity = "0.5";
  ytbTrendings.style.opacity = "0.5";
  pasteUserName.placeholder = "Type channel ID...";
  pasteUserName.disabled = false;
  searchForm.style.visibility = "visible";
  trendingsData.style.visibility = "hidden";
});

ytbTrendings.addEventListener("click", () => {
  ytbTrendings.style.background = "yellow";
  ytbUser.style.background = "white";
  ytbId.style.background = "white";
  ytbTrendings.style.transform = "scale(1.1)";
  ytbUser.style.transform = "scale(1.0)";
  ytbId.style.transform = "scale(1.0)";
  ytbTrendings.style.opacity = "1";
  ytbId.style.opacity = "0.5";
  ytbUser.style.opacity = "0.5";
  searchForm.style.visibility = "hidden";
  trendingsData.style.visibility = "visible";
});

infoButton.addEventListener("click", () => {
  const pasteUserNameValue = pasteUserName.value;

  fetch(`${urlEndpoint}=${pasteUserNameValue}`)
    .then((res) => res.json())
    .then((data) => {
      const regionName = new Intl.DisplayNames(["en"], { type: "region" });
      let chRegion;

      let subsCount = parseInt(
        data.chstats.items[0].statistics.subscriberCount
      );
      let subsCountNum = subsCount.toLocaleString();
      let videoCount = parseInt(data.chstats.items[0].statistics.videoCount);
      let videoCountNum = videoCount.toLocaleString();
      let viewCount = parseInt(data.chstats.items[0].statistics.viewCount);
      let viewCountNum = viewCount.toLocaleString();
      let videoViewCount = parseInt(
        data.chNo1VideoViews.items[0].statistics.viewCount
      );
      let videoViewCountNum = videoViewCount.toLocaleString();
      let videoLikesCount = parseInt(
        data.chNo1VideoViews.items[0].statistics.likeCount
      );
      let videoLikesCountNum = videoLikesCount.toLocaleString();
      let videoCommsCount = parseInt(
        data.chNo1VideoViews.items[0].statistics.commentCount
      );
      let videoCommsCountNum = videoCommsCount.toLocaleString();

      if (!data.chstats.items[0].snippet.country) {
        chRegion = "Not defined by author";
        chCountry.innerHTML = `<span style="color:white;">${chRegion}</span>`;
      } else {
        chRegion = regionName.of(`${data.chstats.items[0].snippet.country}`);
        chCountry.innerHTML = `<span style="color:white;">${data.chstats.items[0].snippet.country} - ${chRegion}</span>`;
      }

      no1Video.innerHTML = `<a href="https://www.youtube.com/watch?v=${data.chNo1Video.items[0].id.videoId}" target="blank" style="color:white; text-decoration:none; padding-top:5px; padding-bottom:5px;">${data.chNo1Video.items[0].snippet.title}</a>`;
      no1VideoViews.innerHTML = `<span style="color:white;">&#x1F525; ${videoViewCountNum} &nbsp; &nbsp; &nbsp; &#128077; ${videoLikesCountNum} &nbsp; &nbsp; &nbsp; &#128172; ${videoCommsCountNum}</span>`;
      chSubs.innerHTML = `<span style="color:white;">${subsCountNum}</span>`;
      chSubs.innerHTML = `<span style="color:white;">${subsCountNum}</span>`;
      chVideos.innerHTML = `<span style="color:white;">${videoCountNum}</span>`;
      chViews.innerHTML = `<span style="color:white;">${viewCountNum}</span>`;
    })
    .catch((err) => {
      console.log(err);
      chCountry.innerHTML = `<span style="color:white;">Please write an existing channel.</span>`;
      no1Video.innerHTML = `<a style="color:white;">Please write an existing channel.</a>`;
      no1VideoViews.innerHTML = `<span style="color:white;">Please write an existing channel.</span>`;
      chSubs.innerHTML = `<span style="color:white;">Please write an existing channel.</span>`;
      chVideos.innerHTML = `<span style="color:white;">Please write an existing channel.</span>`;
      chViews.innerHTML = `<span style="color:white;">Please write an existing channel.</span>`;
    });
});

fetch("./countries-codes.json")
  .then((response) => response.json())
  .then((data) => {
    data.forEach((item) => {
      const option = document.createElement("option");
      option.innerHTML = `${item.name} (${item.code})`;
      option.value = `${item.name} (${item.code})`;
      countryList.appendChild(option);
    });
  });

countryList.addEventListener("change", (event) => {
  const selectedCountry = event.target.value.slice(-3, -1);

  fetch(`http://localhost:5500/trendings/?trendingCountry=${selectedCountry}`)
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

      trendingNo1.innerHTML = `<span style="color:yellow; margin-left:20px">1 - <a href="https://www.youtube.com/watch?v=${data.items[0].id}" target="blank" style="color:white; text-decoration:underline; padding-top:5px; padding-bottom:5px;">${data.items[0].snippet.title}</a></span>`;
      trendingNo1Views.innerHTML = `<span style="color:white;">&#x1F525; ${trendingNo1ViewCountNum} &nbsp; &nbsp; &nbsp; &#128077; ${trendingNo1LikesCountNum} &nbsp; &nbsp; &nbsp; &#128172; ${trendingNo1CommsCountNum}</span>`;

      trendingNo2.innerHTML = `<span style="color:yellow; margin-left:20px">2 - <a href="https://www.youtube.com/watch?v=${data.items[1].id}" target="blank" style="color:white; text-decoration:underline; padding-top:5px; padding-bottom:5px;">${data.items[1].snippet.title}</a></span>`;
      trendingNo2Views.innerHTML = `<span style="color:white;">&#x1F525; ${trendingNo2ViewCountNum} &nbsp; &nbsp; &nbsp; &#128077; ${trendingNo2LikesCountNum} &nbsp; &nbsp; &nbsp; &#128172; ${trendingNo2CommsCountNum}</span>`;

      trendingNo3.innerHTML = `<span style="color:yellow; margin-left:20px">3 - <a href="https://www.youtube.com/watch?v=${data.items[2].id}" target="blank" style="color:white; text-decoration:underline; padding-top:5px; padding-bottom:5px;">${data.items[2].snippet.title}</a></span>`;
      trendingNo3Views.innerHTML = `<span style="color:white;">&#x1F525; ${trendingNo3ViewCountNum} &nbsp; &nbsp; &nbsp; &#128077; ${trendingNo3LikesCountNum} &nbsp; &nbsp; &nbsp; &#128172; ${trendingNo3CommsCountNum}</span>`;

      trendingNo4.innerHTML = `<span style="color:yellow; margin-left:20px">4 - <a href="https://www.youtube.com/watch?v=${data.items[3].id}" target="blank" style="color:white; text-decoration:underline; padding-top:5px; padding-bottom:5px;">${data.items[3].snippet.title}</a></span>`;
      trendingNo4Views.innerHTML = `<span style="color:white;">&#x1F525; ${trendingNo4ViewCountNum} &nbsp; &nbsp; &nbsp; &#128077; ${trendingNo4LikesCountNum} &nbsp; &nbsp; &nbsp; &#128172; ${trendingNo4CommsCountNum}</span>`;

      trendingNo5.innerHTML = `<span style="color:yellow; margin-left:20px">5 - <a href="https://www.youtube.com/watch?v=${data.items[4].id}" target="blank" style="color:white; text-decoration:underline; padding-top:5px; padding-bottom:5px;">${data.items[4].snippet.title}</a></span>`;
      trendingNo5Views.innerHTML = `<span style="color:white;">&#x1F525; ${trendingNo5ViewCountNum} &nbsp; &nbsp; &nbsp; &#128077; ${trendingNo5LikesCountNum} &nbsp; &nbsp; &nbsp; &#128172; ${trendingNo5CommsCountNum}</span>`;
    });
});
