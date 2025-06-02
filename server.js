const express = require("express");
const path = require("path");
const multer = require("multer");
const ip = require("ip");
const fs = require("fs");
const bodyParser = require("body-parser");
//跨域cors
const cors = require("cors");
const app = express();

const { getContentStudentData } = require("./contentStudentData.js");

// 使用body-parser来解析POST请求的JSON数据
app.use(bodyParser.json());
app.use(cors());

// 设置静态文件目录，假设 HTML 文件位于 "public" 文件夹下
app.use(express.static(path.join(__dirname, "/")));

// 设置 multer 存储选项
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/"); // 文件存储的目录
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname)); // 设置文件名
  },
});

// 是否停止娱乐
let isStopPlay = false;

//重定向到的网站地址
let redirectUrl = "http://192.168.3.33";
// 文件过滤和大小限制
const fileFilter = (req, file, cb) => {
  // // 允许的文件类型
  // const allowedTypes = [
  //     'image/jpeg',
  //     'image/png',
  //     'image/jpg',
  //     'application/pdf',
  //     'application/vnd.ms-powerpoint', // PowerPoint文件
  //     'application/vnd.openxmlformats-officedocument.presentationml.presentation', // PowerPoint .pptx文件
  //     'application/msword', // Word .doc 文件
  //     'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ,// Word .docx 文件
  //     'application/vnd.ms-excel', // Excel文件
  //     'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  //     'text/html',
  //     'text/plain'
  // ];

  // // 如果文件类型不符合要求，返回错误
  // if (!allowedTypes.includes(file.mimetype)) {
  //     return cb(new Error('Invalid file type'), false); // 不允许的文件类型
  // }

  // 允许上传
  cb(null, true);
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    // fileSize: 50 * 1024 * 1024, // 限制文件大小为 5MB
  },
});

// 用来保存每个用户的内容
let contentStudentData = getContentStudentData();

// 保存学生名单
let saveStudentNameList = ()=>{
  let  studentName = [];
  for (let i = 0; i < Object.keys(contentStudentData).length; i++) {
    studentName.push(contentStudentData[i].name);
  }

  fs.writeFileSync("studentName.json", JSON.stringify(studentName));
}

 saveStudentNameList()

//保存老师的内容
let contentTeacherData = { name: "老师", data: "" };

// 默认路由，访问根路径时返回 index.html
app.get("/", (req, res) => {
  const filePath = path.join(__dirname, "/", "index.html");
  res.sendFile(filePath);
});

app.get("/game1", (req, res) => {
  const filePath = path.join(__dirname, "/", "game1.html");
  res.sendFile(filePath);
});

app.get("/select", (req, res) => {
  const filePath = path.join(__dirname, "/", "RandomlySelectSomeone.html");
  res.sendFile(filePath);
});

app.get("/timer", (req, res) => {
  const filePath = path.join(__dirname, "/", "timer.html");
  res.sendFile(filePath);
});

app.get("/cats", (req, res) => {
  const filePath = path.join(__dirname, "/", "cats.html");
  res.sendFile(filePath);
});

app.get("/lyy", (req, res) => {
  const filePath = path.join(__dirname, "/", "lyy.html");
  res.sendFile(filePath);
});

//获取学生名单
app.get("/getStudentData", (req, res) => {
  //将学生名单放在一个数组中
  let studentData = [];
  for (let i = 0; i < Object.keys(contentStudentData).length; i++) {
    studentData.push(contentStudentData[i].name);
  }
  res.json(studentData);
});

//上传老师的文本
app.post("/uploadTeacherData", (req, res) => {
  // 获取客户端发送的数据
  const data = req.body;
  // 将数据保存到全局变量中
  contentTeacherData = data;

  //如果存在‘禁止游戏’
  if (contentTeacherData.data.includes("禁止游戏")) {
    isStopPlay = true;
    console.log("禁止游戏");
  } else if (contentTeacherData.data.includes("允许游戏")) {
    isStopPlay = false;
    console.log("允许游戏");
  }
  // 返回一个响应
  res.json({ message: "数据上传成功" });
});

//上传教师文本
app.post("/uploadTeacherData", (req, res) => {
  // 获取客户端发送的数据
  const data = req.body;
  // 将数据保存到全局变量中
  contentTeacherData = data;
  // 返回一个响应
  res.json({ message: "数据上传成功" });
});

//上传学生文本
app.post("/uploadStudentData", (req, res) => {
  // 获取客户端发送的数据
  const data = req.body;
  let name = data.name;
  let existed = false;
  Object.keys(contentStudentData).forEach((key) => {
    if (contentStudentData[key].name == name) {
      contentStudentData[key].data = data.data;
      existed = true;
    }
  });
  // 返回一个响应
  if (existed == true) {
    res.json({ code: 200, message: "数据上传成功" });
  } else {
    res.json({ code: 666, message: "不存在该学员" });
  }
});

//获取学生文本
app.get("/getAllStudentData", (req, res) => {
  res.json(contentStudentData);
});
//获取教师文本
app.get("/getTeacherData", (req, res) => {
  res.json(contentTeacherData);
});
//教师上传的文件列表

let teacherToStudentFileList = [];

//初始化教师上传的文件列表
let initTeacherToStudentFileList = () => {
  for (let i = 0; i < Object.keys(contentStudentData).length; i++) {
    teacherToStudentFileList[contentStudentData[i].name] = {
      updateTime: "", // 更正拼写
      fileName: "",
      fileType: "", //类型
      // fileData: '',
      isDownload: false,
      filePath: "", //真实路径
    };
  }
};
let creatUploadsFolder = () => {
  if (!fs.existsSync("uploads")) {
    fs.mkdirSync("uploads");
  }
};

let getFileName = (name) => {
  return name.substring(0, name.lastIndexOf("."));
};

// 只获取后缀名
let getExtension = (name) => {
  return name.substring(name.lastIndexOf(".") + 1);
};

creatUploadsFolder();
initTeacherToStudentFileList();

//教师上传文件
app.post("/uploadTeacherToStudentFile", upload.single("file"), (req, res) => {
  const studentName = req.body.studentName; // 从 FormData 中获取 studentName
  const file = req.file; // 获取上传的文件信息
  const { filename, originalname } = file;
  if (!req.file) {
    return res.status(400).send("No file uploaded.");
  }
  if (!teacherToStudentFileList[studentName]) {
    res.json({ code: 666, message: "不存在该学员" });
  } else {
    //如果teacherToStudentFileList[studentName].filePath存在，则删除
    if (teacherToStudentFileList[studentName].filePath) {
      fs.unlinkSync(teacherToStudentFileList[studentName].filePath);
    }

    teacherToStudentFileList[studentName].updateTime = getFileName(
      file.filename
    );
    teacherToStudentFileList[studentName].fileName = getFileName(
      Buffer.from(req.file.originalname, "latin1").toString("utf-8")
    );
    teacherToStudentFileList[studentName].fileType = path.extname(originalname);
    teacherToStudentFileList[studentName].isDownload = false;
    teacherToStudentFileList[studentName].filePath = file.path;

    // 文件上传成功
    res.send({
      message: "文件上传成功！！！",
      file: req.file,
    });
  }
});

//学生下载文件
app.get("/downloadTeacherToStudentFile", (req, res) => {
  let studentName = req.query.name;
  studentName = decodeURIComponent(studentName);
  if (!teacherToStudentFileList[studentName]) {
    res.json({ code: 666, message: "不存在该学员" });
  } else {
    let { filePath, fileName, fileType } =
      teacherToStudentFileList[studentName];
    const filePathAll = path.join(__dirname, filePath); // 替换为实际文件路径
    let newFileName = fileName + fileType; // 设置新的文件名
    res.download(filePathAll, newFileName, (err) => {
      if (err) {
        res.status(500).send("文件不存在！！！");
      }
    });
  }
});

//通过名字查询学生列表下标
let getStudentListIndexByName = (name) => {
  for (let i = 0; i < Object.keys(contentStudentData).length; i++) {
    if (contentStudentData[i].name == name) {
      return i;
    }
  }
  return -1;
};

//查询学生文本是否需要重置
app.get("/isResetStudent", (req, res) => {
  let studentName = req.query.name;
  studentName = decodeURIComponent(studentName);
  let studentIndex = getStudentListIndexByName(studentName);
  if (studentIndex == -1) {
    res.json({ code: 666, message: "不存在该学员" });
  } else {
    let msgdata = contentStudentData[studentIndex].data;
    if (contentStudentData[studentIndex].isReset == true) {
      res.json({ code: 200, isReset: true, msg: `${msgdata}` });
      contentStudentData[studentIndex].isReset = false;
    } else {
      res.json({ code: 200, isReset: false });
    }
  }
});

//学生刷新界面
app.get("/studentRefresh", (req, res) => {
  let studentName = req.query.name;
  studentName = decodeURIComponent(studentName);
  let studentIndex = getStudentListIndexByName(studentName);
  if (studentIndex == -1) {
    res.json({ code: 666, message: "不存在该学员" });
  } else {
    contentStudentData[studentIndex].isReset = true;
    res.json({ code: 200, msg: `成功启动${studentName}重置状态` });
  }
});

//所有学生文本并重置状态
app.get("/resetAllStudentMsg", (req, res) => {
  Object.keys(contentStudentData).forEach((key) => {
    contentStudentData[key].data = "";
    contentStudentData[key].isReset = true;
  });
  res.json({ code: 200, msg: `成功清空所有学生文本并重置状态` });
});

//清空对应学生文本并重置状态
app.get("/resetStudentMsg", (req, res) => {
  let studentName = req.query.name;
  let studentIndex = getStudentListIndexByName(studentName);
  if (studentIndex == -1) {
    res.json({ code: 666, msg: `没有找到学生${studentName}` });
  } else {
    contentStudentData[studentIndex].data = [];
    contentStudentData[studentIndex].isReset = true;
    res.json({ code: 200, msg: `重置学生${studentName}成功` });
  }
});

const redirectMap = [
  // ===== 短视频平台 =====
  { from: "douyin.com", to: redirectUrl }, // 抖音
  { from: "tiktok.com", to: redirectUrl }, // TikTok国际版
  { from: "kuaishou.com", to: redirectUrl }, // 快手
  { from: "huoshan.com", to: redirectUrl }, // 火山小视频
  { from: "ixigua.com", to: redirectUrl }, // 西瓜视频
  { from: "meipai.com", to: redirectUrl }, // 美拍
  { from: "quanmin.tv", to: redirectUrl }, // 全民小视频
  { from: "miaopai.com", to: redirectUrl }, // 秒拍
  { from: "weishi.qq.com", to: redirectUrl }, // 微视
  { from: "xiaokaxiu.com", to: redirectUrl }, // 小咖秀

  // ===== 国际游戏平台 =====
  { from: "poki.com", to: redirectUrl }, // Poki小游戏
  { from: "miniclip.com", to: redirectUrl }, // Miniclip游戏平台
  { from: "kongregate.com", to: redirectUrl }, // Kongregate游戏平台
  { from: "armorgames.com", to: redirectUrl }, // Armor Games
  { from: "crazygames.com", to: redirectUrl }, // Crazy Games
  { from: "y8.com", to: redirectUrl }, // Y8小游戏
  { from: "steam.com", to: redirectUrl }, // Steam游戏平台
  { from: "epicgames.com", to: redirectUrl }, // Epic游戏平台
  { from: "origin.com", to: redirectUrl }, // Origin游戏平台
  { from: "battlenet.com", to: redirectUrl }, // 暴雪战网
  { from: "roblox.com", to: redirectUrl }, // Roblox
  { from: "minecraft.net", to: redirectUrl }, // 我的世界
  { from: "leagueoflegends.com", to: redirectUrl }, // 英雄联盟
  { from: "playvalorant.com", to: redirectUrl }, // 无畏契约
  { from: "ea.com", to: redirectUrl }, // EA游戏平台
  { from: "ubisoft.com", to: redirectUrl }, // 育碧游戏
  { from: "xbox.com", to: redirectUrl }, // Xbox
  { from: "playstation.com", to: redirectUrl }, // PlayStation
  { from: "nintendo.com", to: redirectUrl }, // 任天堂

  // ===== 国内游戏平台 =====
  { from: "wegame.com", to: redirectUrl }, // WeGame腾讯游戏平台
  { from: "9game.cn", to: redirectUrl }, // 九游游戏
  { from: "4399.com", to: redirectUrl }, // 4399小游戏
  { from: "7k7k.com", to: redirectUrl }, // 7k7k小游戏
  { from: "3366.com", to: redirectUrl }, // 3366小游戏
  { from: "17173.com", to: redirectUrl }, // 17173游戏网
  { from: "duowan.com", to: redirectUrl }, // 多玩游戏
  { from: "tgbus.com", to: redirectUrl }, // 电玩巴士
  { from: "aipai.com", to: redirectUrl }, // 爱拍游戏
  { from: "kbhgames.com", to: redirectUrl }, // KBH游戏
  { from: "www.mc.js.cool", to: redirectUrl },

  // ===== 视频平台 =====
  { from: "v.qq.com", to: redirectUrl }, // 腾讯视频
  { from: "iqiyi.com", to: redirectUrl }, // 爱奇艺
  { from: "youku.com", to: redirectUrl }, // 优酷
  { from: "mgtv.com", to: redirectUrl }, // 芒果TV
  { from: "bilibili.com", to: redirectUrl }, // 哔哩哔哩
  { from: "acfun.cn", to: redirectUrl }, // AcFun
  { from: "sohu.com", to: redirectUrl }, // 搜狐视频
  { from: "pptv.com", to: redirectUrl }, // PPTV聚力
  { from: "le.com", to: redirectUrl }, // 乐视视频
  { from: "youtube.com", to: redirectUrl }, // YouTube
  { from: "netflix.com", to: redirectUrl }, // Netflix
  { from: "hulu.com", to: redirectUrl }, // Hulu
  { from: "disneyplus.com", to: redirectUrl }, // Disney+
  { from: "amazon.com", to: redirectUrl }, // Amazon Prime Video
  { from: "viu.com", to: redirectUrl }, // Viu
  { from: "wetv.vip", to: redirectUrl }, // WeTV
  { from: "wasu.cn", to: redirectUrl }, // 华数TV
  { from: "fun.tv", to: redirectUrl }, // 风行视频
  { from: "tv.sohu.com", to: redirectUrl }, // 搜狐视频
  { from: "film.qq.com", to: redirectUrl }, // 腾讯电影

  // ===== 直播平台 =====
  { from: "huya.com", to: redirectUrl }, // 虎牙直播
  { from: "douyu.com", to: redirectUrl }, // 斗鱼直播
  { from: "yy.com", to: redirectUrl }, // YY直播
  { from: "inke.cn", to: redirectUrl }, // 映客直播
  { from: "chushou.tv", to: redirectUrl }, // 触手直播
  { from: "longzhu.com", to: redirectUrl }, // 龙珠直播
  { from: "zhanqi.tv", to: redirectUrl }, // 战旗直播
  { from: "panda.tv", to: redirectUrl }, // 熊猫直播
  { from: "twitch.tv", to: redirectUrl }, // Twitch
  { from: "afreecatv.com", to: redirectUrl }, // AfreecaTV

  //其他
  { from: "fun.360.cn", to: redirectUrl },
  { from: "cn.bing.com", to: redirectUrl },
  { from: "www.hao123.com", to: redirectUrl },
  { from: "www.msn.cn", to: redirectUrl },

  // 国内AI平台
  { from: "www.doubao.com", to: redirectUrl }, // 豆包（字节跳动）
  { from: "tongyi.aliyun.com", to: redirectUrl }, // 通义千问（阿里云）
  { from: "qianwen.aliyun.com", to: redirectUrl }, // 通义千问备用域名
  { from: "yiyan.baidu.com", to: redirectUrl }, // 文心一言（百度）
  { from: "xinghuo.xfyun.cn", to: redirectUrl }, // 讯飞星火
  { from: "chatglm.cn", to: redirectUrl }, // ChatGLM（智谱AI）
  { from: "www.moonshot.cn", to: redirectUrl }, // Moonshot AI（月之暗面）
  { from: "kimi.moonshot.cn", to: redirectUrl }, // Kimi Chat
  { from: "deepseek.com", to: redirectUrl }, // DeepSeek Chat（深度求索）
  { from: "chat.deepseek.com", to: redirectUrl }, // DeepSeek Chat 聊天页
  { from: "360.cn/ai", to: redirectUrl }, // 360智脑
  { from: "bigai.sogou.com", to: redirectUrl }, // 搜狗大模型

  // 国外AI平台
  { from: "chat.openai.com", to: redirectUrl }, // ChatGPT
  { from: "www.bing.com/chat", to: redirectUrl }, // New Bing（Copilot）
  { from: "gemini.google.com", to: redirectUrl }, // Google Gemini（原Bard）
  { from: "claude.ai", to: redirectUrl }, // Claude（Anthropic）
  { from: "www.perplexity.ai", to: redirectUrl }, // Perplexity AI
  { from: "poe.com", to: redirectUrl }, // Poe（Quora旗下）
  { from: "www.phind.com", to: redirectUrl }, // Phind（AI搜索引擎）
  { from: "you.com", to: redirectUrl }, // You.com（AI搜索）
  { from: "www.mistral.ai", to: redirectUrl }, // Mistral AI
  { from: "www.anthropic.com", to: redirectUrl }, // Anthropic（Claude官网）
  { from: "coze.com", to: redirectUrl }, // Coze（字节海外AI）
  { from: "www.groq.com", to: redirectUrl }, // Groq（高速推理AI）
  { from: "www.meta.ai", to: redirectUrl }, // Meta AI（Facebook）
  { from: "pi.ai", to: redirectUrl }, // Pi AI（Inflection）
  { from: "www.huggingface.co/chat", to: redirectUrl }, // HuggingFace Chat
];

//获取重定向规则
app.get("/redirect", (req, res) => {
  res.json(isStopPlay ? redirectMap : []);
});

let ipAddress = ip.address();

// 启动服务器
app.listen(80, () => {
  console.log(`服务器启动在 http://${ipAddress}`);
});
