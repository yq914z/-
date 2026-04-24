const express = require("express");
const axios = require("axios");
const cheerio = require("cheerio");
const cron = require("node-cron");

const app = express();
// Railway 专用端口设置
const PORT = process.env.PORT || 3000;

// 存储数据的变量
let latestData = {
    period: "等待抓取...",
    nums: [0, 0, 0],
    sum: 0
};

// 1. 先定义网页路由（最重要的一步）
app.get("/", (req, res) => {
    res.send(`
    <!DOCTYPE html>
    <html lang="zh-CN">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>数据抓取服务</title>
        <style>
            body { font-family: sans-serif; padding: 20px; background: #f4f4f4; text-align: center; }
            .box { background: white; padding: 20px; border-radius: 8px; display: inline-block; }
            h1 { color: #333; }
            .nums { font-size: 28px; font-weight: bold; color: #007BFF; margin: 10px 0; }
        </style>
    </head>
    <body>
        <div class="box">
            <h1>✅ 部署成功！</h1>
            <p>期数: ${latestData.period}</p>
            <div class="nums">号码: ${latestData.nums.join(', ')}</div>
            <p>总和: ${latestData.sum}</p>
            <hr>
            <small>服务器正在后台运行...</small>
        </div>
    </body>
    </html>
    `);
});

// 2. 抓取数据的函数（暂时用模拟数据，保证不报错）
async function scrapeData() {
    try {
        console.log("开始模拟抓取数据...");
        // 这里暂时不改你的真实网址，先用随机数测试
        latestData = {
            period: "20260424-001",
            nums: [
                Math.floor(Math.random() * 10),
                Math.floor(Math.random() * 10),
                Math.floor(Math.random() * 10)
            ],
            sum: 0
        };
        latestData.sum = latestData.nums.reduce((a, b) => a + b, 0);
        console.log("抓取成功:", latestData);
    } catch (error) {
        console.error("抓取失败:", error.message);
    }
}

// 3. 启动服务器的逻辑（这是防卡死的关键）
app.listen(PORT, () => {
    console.log(`服务器已启动在端口 ${PORT}`);
    
    // 延迟 15 秒再开始第一次抓取，避开 Railway 的网络封锁
    setTimeout(() => {
        console.log("网络已就绪，开始第一次抓取...");
        scrapeData();
        
        // 之后再启动定时任务
        cron.schedule('*/15 * * * * *', () => {
            scrapeData();
        });
    }, 15000); // 15秒 = 15000毫秒
});

