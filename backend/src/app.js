const express = require('express');
const cors = require('cors');
const path = require('path')
const cookieParser = require('cookie-parser');

const authRoutes = require('./router/auth.route');
const projectRoutes = require('./router/project.route')
const taskRoutes = require('./router/task.route')
const dashboardRoutes = require('./router/dashboard.routes')
const { notFound, errorHandler } = require("./middlewares/erroe.middleware");
const app = express();

app.use(cors({
  origin: process.env.CLIENT_URL || "http://localhost:5173",
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser())
app.use(express.static(path.join(__dirname,'../public')))


app.use('/api/auth', authRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/dashboard", dashboardRoutes);

app.use(notFound);
app.use(errorHandler);

app.get('/health', (req, res) => {
    res.status(200).json({ status: 'ok' });
});

app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/index.html'));
});

module.exports = app;
