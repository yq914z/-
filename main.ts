import { serve } from "https://deno.land/std/http/server.ts";
import { Cron } from "https://deno.land/x/cron/cron.ts";

// 存储数据的变量
let latestData = {
    period: "等待抓取...",
    nums: [0, 0, 0],
    sum: 0
};

// 抓取数据的函数
async function scrapeData() {
    try {
        console.log("开始模拟抓取数据...");
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

// 启动定时任务 (每15秒执行一次)
const cron = new Cron();
cron.add("*/15 * * * * *", scrapeData);
cron.start();

// 启动 HTTP 服务器
serve((req: Request) => {
    const html = `
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
    `;
    return new Response(html, {
        headers: { "content-type": "text/html; charset=utf-8" },
    });
}, { port: 8000 });

console.log("服务器已启动，访问 https://你的项目名.deno.dev");

