const express = require("express");
const axios = require("axios");
const cheerio = require("cheerio");
const cron = require("node-cron");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

let latestData = {
    period: "等待抓取...",
    nums: [0, 0, 0],
    sum: 0,
    kill: [],
    recommendations: []
};

// 根目录，后面用来放网页
app.get("/", (req, res) => {
    res.send(`
    <!DOCTYPE html>
    <html lang="zh-CN">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>数据抓取服务</title>
        <style>
            body { font-family: sans-serif; padding: 20px; background: #f4f4f4; }
            .container { max-width: 600px; margin: auto; background: white; padding: 20px; border-radius: 8px; box-shadow: 0 0 10px rgba(0,0,0,0.1); }
            h1 { text-align: center; color: #333; }
            .data-box { margin-top: 20px; padding: 15px; border: 1px solid #ddd; border-radius: 5px; }
            .nums { font-size: 24px; font-weight: bold; color: #007BFF; }
            .sum { font-size: 20px; color: #28a745; }
            .period { font-size: 18px; color: #dc3545; }
        </style>
    </head>
    <body>
        <div class="container">
            <h1>数据抓取服务</h1>
            当前状态：<strong>运行中</strong>
            <div class="data-box">
                <div class="period">期数: <span id="period">${latestData.period}</span></div>
                <div class="nums">号码: <span id="nums">${latestData.nums.join(', ')}</span></div>
                <div class="sum">总和: <span id="sum">${latestData.sum}</span></div>
            </div>
            <p style="text-align: center; margin-top: 20px; color: #666;">
                数据每10秒自动更新一次
            
        </div>
        
        <script>
            // 定时刷新页面数据
            setInterval(() => {
                fetch('/')
                    .then(res => res.text())
                    .then(html => {
                        const parser = new DOMParser();
                        const doc = parser.parseFromString(html, 'text/html');
                        document.getElementById('period').innerText = doc.getElementById('period').innerText;
                        document.getElementById('nums').innerText = doc.getElementById('nums').innerText;
                        document.getElementById('sum').innerText = doc.getElementById('sum').innerText;
                    });
            }, 10000);
        </script>
    </body>
    </html>
    `);
});

// 抓取数据的函数 (这里需要你填入真实的抓取逻辑)
async function scrapeData() {
    try {
        // 示例：模拟抓取数据
        // 实际使用时，请替换为你的真实URL和选择器
        const response = await axios.get('https://example.com/data'); // 替换为真实网址
        const $ = cheerio.load(response.data);
        
        // 示例：假设抓取到期数和号码
        const period = $('.period-class').text().trim(); // 替换为真实选择器
        const nums = [$('.num1').text(), $('.num2').text(), $('.num3').text()]; // 替换为真实选择器
        const sum = nums.reduce((a, b) => parseInt(a) + parseInt(b), 0);
        
        latestData = {
            period: period,
            nums: nums,
            sum: sum,
            kill: [], // 杀号逻辑
            recommendations: [] // 推荐逻辑
        };
        
        console.log('数据抓取成功:', latestData);
    } catch (error) {
        console.error('抓取失败:', error.message);
    }
}

// 每10秒执行一次抓取
cron.schedule('*/10 * * * * *', () => {
    console.log('正在抓取数据...');
    scrapeData();
});

// 启动服务器
app.listen(PORT, () => {
    console.log(`服务器运行在端口 ${PORT}`);
    // 启动时立即抓取一次
    scrapeData();
});

