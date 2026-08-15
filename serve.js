// 简单的本地预览服务器
// 用于开发时预览静态页面，CI 部署不需要此文件
const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// 静态文件服务
app.use(express.static(__dirname, {
    index: 'index.html',
    extensions: ['html']
}));

// SPA 路由支持 - task 详情通过 URL 参数 ?id=xxx 访问
app.get('/task', (req, res) => {
    res.sendFile(path.join(__dirname, 'task.html'));
});

app.get('/task/:id', (req, res) => {
    res.redirect(`/task.html?id=${req.params.id}`);
});

app.listen(PORT, () => {
    console.log(`切片任务前端预览服务器: http://localhost:${PORT}`);
    console.log(`任务列表: http://localhost:${PORT}/`);
    console.log(`任务详情: http://localhost:${PORT}/task.html?id=tumote_left_20250814`);
});