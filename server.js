const express = require('express');
const path = require('path');
const ip = require('ip');
const bodyParser = require('body-parser');
//跨域cors
const cors = require('cors');
const app = express();

// 使用body-parser来解析POST请求的JSON数据
app.use(bodyParser.json());
app.use(cors())

// 设置静态文件目录，假设 HTML 文件位于 "public" 文件夹下
app.use(express.static(path.join(__dirname, '/')));

// 用来保存每个用户的内容
let contentStudentData = {
    // 0: {name:'余俊翼',data:''},
    // 1:{name:'陆沛林',data:''},
    // 2:{name:'黄梓涵',data:''},
    // 3:{name:'宋梓悦',data:''},
    // 0:{name:"慎梓睿",data:""},
    // 1:{name:"罗耀隆",data:""},
    0: {name:'杜睿谦',data:''},
    1:{name:'孙铱辰',data:''},
    2:{name:'陶元钦',data:''},
};

//保存老师的内容
let contentTeacherData = {name:'老师',data:''}

// 默认路由，访问根路径时返回 index.html
app.get('/', (req, res) => {
    const filePath = path.join(__dirname, '/', 'index.html');
    res.sendFile(filePath);
});

//获取学生名单
app.get('/getStudentData', (req, res) => {
    //将学生名单放在一个数组中
    let studentData = [];
    for (let i = 0; i < Object.keys(contentStudentData).length; i++) {
        studentData.push(contentStudentData[i].name);
    }
    res.json(studentData);
});

//上传老师的文本
app.post('/uploadTeacherData', (req, res) => {
    // 获取客户端发送的数据
    const data = req.body;
    // 将数据保存到全局变量中
    contentTeacherData = data;
    // 返回一个响应
    res.json({ message: '数据上传成功' });
});

//上传教师文本
app.post('/uploadTeacherData', (req, res) => {
    // 获取客户端发送的数据
    const data = req.body;
    // 将数据保存到全局变量中
    contentTeacherData = data;
    // 返回一个响应
    res.json({ message: '数据上传成功' });
});

//上传学生文本
app.post('/uploadStudentData', (req, res) => {
    // 获取客户端发送的数据
    const data = req.body;
    let name=data.name;
    let existed=false
    Object.keys(contentStudentData).forEach(key => {
        if(contentStudentData[key].name==name){
            contentStudentData[key].data=data.data;
            existed=true;
        }
    });
    // 返回一个响应
    if(existed==true){
        res.json({code:200, message: '数据上传成功' });
    }else{
        res.json({code:666, message: '不存在该学员' });
    }
    
});

//获取学生文本
app.get('/getAllStudentData', (req, res) => {
    res.json(contentStudentData);
})

//获取教师文本
app.get('/getTeacherData', (req, res) => {
    res.json(contentTeacherData);
})

let ipAddress = ip.address();

// 启动服务器
app.listen(80, () => {
    console.log(`服务器启动在 http://${ipAddress}`);
});
