const express = require("express");
const axios = require("axios");
const cheerio = require("cheerio");
const cron = require("node-cron");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());

let latestData = {
    period: "等待抓取...",
    nums: [0, 0, 0],
    sum: 0,
    kill: [],
    recommendations: []
};

app.get("/", (req, res) => {
    res.send("服务已启动！");
});

app.get("/api/data", (req, res) => {
    res.json(latestData);
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
