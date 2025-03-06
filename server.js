const express = require('express');
const path = require('path');
const multer = require('multer');
const ip = require('ip');
const fs = require('fs');
const bodyParser = require('body-parser');
//跨域cors
const cors = require('cors');
const { count } = require('console');
const app = express();

// 使用body-parser来解析POST请求的JSON数据
app.use(bodyParser.json());
app.use(cors())

// 设置静态文件目录，假设 HTML 文件位于 "public" 文件夹下
app.use(express.static(path.join(__dirname, '/')));

// 设置 multer 存储选项
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/'); // 文件存储的目录
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname)); // 设置文件名
    }
});


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
        fileSize: 50 * 1024 * 1024, // 限制文件大小为 5MB
    }
});

// 用来保存每个用户的内容
let contentStudentData = {
    // 0: {name:'余俊翼',data:'',isReset:true},
    // 1:{name:'陆沛林',data:'',isReset:true},
    // 2:{name:'黄梓涵',data:'',isReset:true},
    // 0:{name:'陆沛林',data:'',isReset:true},
    // 1:{name:'黄梓涵',data:'',isReset:true},
    // 0:{name:'杨梓悦',data:'',isReset:true},
    // 0:{name:"慎梓睿",data:"",isReset:true},
    // 1:{name:"罗耀隆",data:"",isReset:true},
    0: {name:'杜睿谦',data:'',isReset:true},
    1:{name:'孙铱辰',data:'',isReset:true},
    2:{name:'陶元钦',data:'',isReset:true},
    // 0: { name: '陆沛林', data: '' ,isReset:true},
    // 0:{name:'黄熙粤',data:'',isReset:true},
    // 1:{name:'胡哲涵',data:'',isReset:true},
    // 0: {name:'徐远涵',data:'',isReset:true},
    // 1:{name:'杨政',data:'',isReset:true},
    // 2:{name:'聂可馨',data:'',isReset:true},
    //  0:{name:'彭雄晖',data:'',isReset:true},
    // 1:{name:'陈泽昊',data:'',isReset:true},
    // 0: { name: '郑博阳', data: '' ,isReset:true},
    // 1: { name: '罗耀隆', data: '' ,isReset:true},
    // 2: { name: '慎梓睿', data: '' ,isReset:true},
    // 3: { name: '谢铠烨', data: '' ,isReset:true},
    // 4: { name: '谢铠磊', data: '' ,isReset:true},
    // 5: { name: '林俊漩', data: '' ,isReset:true},
    // 6: { name: '姜希杰', data: '' ,isReset:true},
    //  0: { name: '陈少宗', data: '' ,isReset:true},
};

//保存老师的内容
let contentTeacherData = { name: '老师', data: '' }

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
    let name = data.name;
    let existed = false
    Object.keys(contentStudentData).forEach(key => {
        if (contentStudentData[key].name == name) {
            contentStudentData[key].data = data.data;
            existed = true;
        }
    });
    // 返回一个响应
    if (existed == true) {
        res.json({ code: 200, message: '数据上传成功' });
    } else {
        res.json({ code: 666, message: '不存在该学员' });
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
//教师上传的文件列表

let teacherToStudentFileList = []

//初始化教师上传的文件列表
let initTeacherToStudentFileList = () => {
    for (let i = 0; i < Object.keys(contentStudentData).length; i++) {
        teacherToStudentFileList[contentStudentData[i].name] = {
            updateTime: '', // 更正拼写
            fileName: '',
            fileType: '', //类型
            // fileData: '',
            isDownload: false,
            filePath: ''//真实路径
        };
    }
}
let creatUploadsFolder = () => {
    if (!fs.existsSync('uploads')) {
        fs.mkdirSync('uploads');
    }
}

let getFileName = (name) => {
    return name.substring(0, name.lastIndexOf("."))
}

// 只获取后缀名
let getExtension = (name) => {
    return name.substring(name.lastIndexOf(".") + 1)
}


creatUploadsFolder()
initTeacherToStudentFileList()

//教师上传文件
app.post('/uploadTeacherToStudentFile', upload.single('file'), (req, res) => {
    const studentName = req.body.studentName; // 从 FormData 中获取 studentName 
    const file = req.file; // 获取上传的文件信息 
    const { filename, originalname } = file
    if (!req.file) {
        return res.status(400).send('No file uploaded.');
    }
    if (!teacherToStudentFileList[studentName]) {
        res.json({ code: 666, message: '不存在该学员' });
    } else {
        //如果teacherToStudentFileList[studentName].filePath存在，则删除
        if (teacherToStudentFileList[studentName].filePath) {
            fs.unlinkSync(teacherToStudentFileList[studentName].filePath)
        }

        teacherToStudentFileList[studentName].updateTime = getFileName(file.filename)
        teacherToStudentFileList[studentName].fileName = getFileName(Buffer.from(req.file.originalname, 'latin1').toString('utf-8'))
        teacherToStudentFileList[studentName].fileType = path.extname(originalname)
        teacherToStudentFileList[studentName].isDownload = false
        teacherToStudentFileList[studentName].filePath = file.path

        // 文件上传成功
        res.send({
            message: '文件上传成功！！！',
            file: req.file
        });
    }
});

//学生下载文件
app.get('/downloadTeacherToStudentFile', (req, res) => {

    let studentName = req.query.name;
    studentName = decodeURIComponent(studentName);
    if (!teacherToStudentFileList[studentName]) {
        res.json({ code: 666, message: '不存在该学员' });
    } else {
        let { filePath ,fileName,fileType}= teacherToStudentFileList[studentName]
        const filePathAll = path.join(__dirname, filePath); // 替换为实际文件路径
        let newFileName = fileName+fileType; // 设置新的文件名 
        res.download(filePathAll, newFileName, (err) => {
            if (err) {
                res.status(500).send('文件不存在！！！');
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
}

//查询学生文本是否需要重置
app.get('/isResetStudent', (req, res) => {
    let studentName = req.query.name;
    studentName = decodeURIComponent(studentName);
    let studentIndex=getStudentListIndexByName(studentName)
    if(studentIndex==-1){
        res.json({ code: 666, message: '不存在该学员' });
    }else{
        let msgdata=contentStudentData[studentIndex].data
        if(contentStudentData[studentIndex].isReset==true){
            res.json({ code: 200, isReset:true,msg:`${msgdata}`});
            contentStudentData[studentIndex].isReset=false;
        }else{
         res.json({ code: 200, isReset:false});   
        }
    }
})

//学生刷新界面
app.get('/studentRefresh', (req, res) => {
    let studentName = req.query.name;
    studentName = decodeURIComponent(studentName);
    let studentIndex=getStudentListIndexByName(studentName)
    if(studentIndex==-1){
        res.json({ code: 666, message: '不存在该学员' });
    }else{
        contentStudentData[studentIndex].isReset=true;
        res.json({ code: 200, msg:`成功启动${studentName}重置状态`});
    }
})

let ipAddress = ip.address();

// 启动服务器
app.listen(80, () => {
    console.log(`服务器启动在 http://${ipAddress}`);
});
