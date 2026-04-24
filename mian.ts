// 引入 Deno 官方 HTTP 服务器模块
import { serve } from "https://deno.land/std/http/server.ts";
import { Cron } from "https://deno.land/x/cron/cron.ts";

// --- 配置区 ---
const TARGET_URL = "https://G28.cc"; // 数据源网站，需确认实际可访问性
const REFRESH_INTERVAL_SECONDS = 10;
const HISTORY_LENGTH = 50;

// --- 5y 数据定义 ---
const FIVE_Y = {
  "5y1": [1, 6, 11, 16, 21, 26],
  "5y2": [2, 7, 12, 17, 22, 27],
  "5y3": [3, 8, 13, 18, 23],
  "5y4": [4, 9, 14, 19, 24],
  "5y5": [0, 5, 10, 15, 20, 25],
};

// --- 数据存储 (内存中) ---
let currentPeriod = "计算中...";
let killGroupResult = "等待计算...";
let suggestComboResult = ["等待计算..."];
let historyRecords: any[] = [];
let lastFetchedData: any[] = []; // 存储最近3期原始数据

// --- 核心算法函数 ---
function calculate(data: any[]) {
  if (data.length < 3) {
    console.log("数据不足3期，无法计算");
    return;
  }

  // 假设 data 格式为 [{period: '3145407', nums: [a,b,c]}, ...]
  // 此处需要根据 G28.cc 的实际 HTML 结构解析，这里先做模拟
  const p1 = data[0]; // 3145407
  const p2 = data[1]; // 3145406
  const p3 = data[2]; // 3145405
  
  // 模拟解析出的数字
  const nums1 = p1.nums; // e.g., [6,0,3]
  const nums2 = p2.nums; // e.g., [9, '小单'] -> 假设解析为 [9, null, null] 或特定值
  const nums3 = p3.nums; // e.g., [1,0,3]

  // 按照你的逻辑计算组合
  // 这里简化为直接操作数字数组，你需要根据实际开奖结果的"形态"来调整
  const combo1 = parseInt(`${nums1[0]}${nums1[1]}${nums3[2]}`); // 603
  const combo2 = parseInt(`${nums2[0]}${nums2[1]}${nums1[2]}`); // 103
  const combo3 = parseInt(`${nums3[0]}${nums3[1]}${nums3[2]}`); // 038

  let sumVal = combo1 + combo2 + combo3;
  let finalSum = String(sumVal).split('').reduce((a, b) => Number(a) + Number(b), 0); // 744 -> 7+4+4=15
  
  // 查找 5y
  let killGroupType = "";
  for (const key in FIVE_Y) {
    if (FIVE_Y[key].includes(finalSum)) {
      killGroupType = key; // e.g., 5y3
      break;
    }
  }
  
  // 查找历史替换 (简化逻辑，实际需要查历史表)
  // ...
  
  // 最终杀组结果
  killGroupResult = `杀${killGroupType} ${finalSum}`; // 示例

  // 建议组合计算 (根据你的描述逻辑)
  const sumTotal = finalSum; // 假设 25
  let suggest1 = "";
  let suggest2 = "";

  if (sumTotal >= 14 && sumTotal <= 27 && sumTotal % 2 !== 0) { // 大单
    suggest1 = "大单";
    suggest2 = "小双"; // 根据规则补位
  } else if (sumTotal >= 14 && sumTotal <= 27 && sumTotal % 2 === 0) { // 大双
    suggest1 = "大双";
    suggest2 = "小单";
  } else if (sumTotal >= 0 && sumTotal <= 13 && sumTotal % 2 !== 0) { // 小单
    suggest1 = "小单";
    suggest2 = "大双";
  } else { // 小双
    suggest1 = "小双";
    suggest2 = "大单";
  }
  
  // 自动修正
  if (killGroupResult.includes(suggest1)) {
    suggest1 = suggest2;
    suggest2 = suggest1 === "大单" ? "小双" : "大单"; // 切换
  }

  suggestComboResult = [`${suggest1}`, `${suggest2}`];
  currentPeriod = p1.period;
}

// --- 数据抓取函数 ---
async function fetchData() {
  try {
    console.log("正在从 G28.cc 抓取数据...");
    // Deno Deploy 中 fetch 外部资源可能需要特定配置，这里先写逻辑
    // const response = await fetch(TARGET_URL);
    // const html = await response.text();
    // const $ = load(html); // 需要引入 cheerio 的 deno 版本
    
    // 模拟数据 (用于测试，部署时请替换为真实解析逻辑)
    const mockData = [
      { period: "3145407", nums: [6, 0, 3], result: "9小单" },
      { period: "3145406", nums: [9, 0, 0], result: "1+0+3=4小双" }, // 模拟解析
      { period: "3145405", nums: [1, 0, 3], result: "11小单" },
    ];
    
    lastFetchedData = mockData;
    calculate(mockData);
    updateHistory(mockData[0]);
    console.log("数据抓取与计算完成");

  } catch (e) {
    console.error("抓取失败:", e.message);
  }
}

// --- 历史记录更新 ---
function updateHistory(latest: any) {
  const isHit = Math.random() > 0.5 ? "中" : "没中"; // 模拟命中
  historyRecords.unshift({
    period: latest.period,
    result: latest.result,
    hit: isHit,
    kill: killGroupResult,
    suggest: suggestComboResult.join('/')
  });
  if (historyRecords.length > HISTORY_LENGTH) {
    historyRecords.pop();
  }
}

// --- 定时任务 ---
const cronJob = new Cron();
cronJob.add(`*/${REFRESH_INTERVAL_SECONDS} * * * * *`, fetchData);
cronJob.start();

// 初始运行
fetchData();

// --- HTML 生成 (暗黑朋克风格) ---
function generateHtml() {
  const historyRows = historyRecords.map(r => `
    <tr>
      <td>${r.period}</td>
      <td>${r.result}</td>
      <td style="color: #ff4757;">${r.kill}</td>
      <td style="color: #2ed573;">${r.suggest}</td>
      <td class="${r.hit === '中' ? 'hit' : 'miss'}">${r.hit}</td>
    </tr>
  `).join('');

  return `
  <!DOCTYPE html>
  <html lang="zh-CN">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>夜曲独家预测系统</title>
    <style>
      body { 
        background-color: #0a0a0f; 
        color: #e0e0e0; 
        font-family: 'Courier New', monospace; 
        margin: 0; 
        padding: 20px;
        background-image: linear-gradient(rgba(255,0,80,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,0,80,0.05) 1px, transparent 1px);
        background-size: 20px 20px;
      }
      .container { max-width: 900px; margin: auto; border: 1px solid #ff0055; box-shadow: 0 0 20px rgba(255,0,85,0.3); padding: 20px; background: rgba(10,10,15,0.9); }
      header { text-align: center; border-bottom: 2px dashed #ff0055; padding-bottom: 10px; margin-bottom: 20px; }
      h1 { color: #ff0055; text-shadow: 0 0 10px #ff0055; letter-spacing: 3px; }
      .tagline { color: #00d8ff; font-size: 0.9em; }
      .results { display: flex; justify-content: space-around; text-align: center; margin: 20px 0; }
      .result-box { border: 1px solid #444; padding: 15px; min-width: 200px; background: #111; }
      .result-box h3 { margin: 0 0 10px 0; color: #888; }
      .result-value { font-size: 1.8em; font-weight: bold; color: #2ed573; text-shadow: 0 0 5px #2ed573; }
      .kill-group { color: #ff4757 !important; }
      .suggest-combo { color: #ffa502 !important; }
      table { width: 100%; border-collapse: collapse; margin-top: 20px; font-size: 0.85em; }
      th, td { border: 1px solid #333; padding: 8px; text-align: center; }
      th { background-color: #1a1a2e; color: #ff0055; }
      tr:nth-child(even) { background-color: #111; }
      .hit { color: #2ed573; font-weight: bold; }
      .miss { color: #ff4757; }
      footer { text-align: center; margin-top: 20px; color: #555; font-size: 0.8em; }
      .refresh-btn { background: #ff0055; color: #fff; border: none; padding: 10px 20px; cursor: pointer; font-family: inherit; font-size: 1em; margin-top: 10px; transition: all 0.3s; }
      .refresh-btn:hover { background: #00d8ff; color: #000; }
    </style>
  </head>
  <body>
    <div class="container">
      <header>
        <h1>🌙 夜曲独家预测系统 🦇</h1>
        <p class="tagline">旺旺号: 856322512 | 数据驱动 · 暗黑朋克</p>
      </header>

      <div class="results">
        <div class="result-box">
          <h3>第 ${currentPeriod} 期 杀组结果</h3>
          <div class="result-value kill-group">${killGroupResult}</div>
        </div>
        <div class="result-box">
          <h3>第 ${currentPeriod} 期 建议组合</h3>
          <div class="result-value suggest-combo">${suggestComboResult.join(' / ')}</div>
        </div>
      </div>
      
      <button class="refresh-btn" onclick="location.reload()">🔄 点击刷新 / 每 ${REFRESH_INTERVAL_SECONDS} 秒自动刷新</button>

      <h3 style="color: #ff0055; border-left: 3px solid #ff0055; padding-left: 10px;">最近 ${HISTORY_LENGTH} 期开奖记录</h3>
      <table>
        <thead>
          <tr><th>期数</th><th>开奖结果</th><th>杀组</th><th>建议组合</th><th>状态</th></tr>
        </thead>
        <tbody>
          ${historyRows}
        </tbody>
      </table>
      
      <footer>
        <p>© 2026 夜曲预测 | Powered by Deno Deploy</p>
      </footer>
    </div>
  </body>
  </html>
  `;
}

// --- 启动 HTTP 服务器 ---
serve((req) => {
  return new Response(generateHtml(), {
    headers: { "content-type": "text/html; charset=utf-8" },
  });
}, { port: 8000 });

console.log("服务器已启动，访问 https://你的项目名.deno.dev");
