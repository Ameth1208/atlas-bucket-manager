"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const path_1 = __importDefault(require("path"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const config_1 = require("./config");
const auth_1 = require("./middleware/auth");
const minioClient_1 = require("./minioClient");
const app = (0, express_1.default)();
// Middleware
app.use(express_1.default.json());
app.use((0, cookie_parser_1.default)());
app.use(express_1.default.static(path_1.default.join(__dirname, '../public')));
// --- Routes ---
// Serve HTML pages
app.get('/', (req, res) => {
    res.redirect('/login');
});
app.get('/login', (req, res) => {
    res.sendFile(path_1.default.join(__dirname, '../public/login.html'));
});
app.get('/manager', auth_1.requireAuth, (req, res) => {
    res.sendFile(path_1.default.join(__dirname, '../public/manager.html'));
});
// API Auth
app.post('/api/login', (req, res) => {
    const { username, password } = req.body;
    if (username === config_1.config.adminUser && password === config_1.config.adminPass) {
        const token = jsonwebtoken_1.default.sign({ user: username }, config_1.config.jwtSecret, { expiresIn: '1h' });
        res.cookie('auth_token', token, { httpOnly: true });
        res.json({ success: true });
    }
    else {
        res.status(401).json({ error: 'Invalid credentials' });
    }
});
app.post('/api/logout', (req, res) => {
    res.clearCookie('auth_token');
    res.json({ success: true });
});
// API Buckets
app.get('/api/buckets', auth_1.requireAuth, async (req, res) => {
    try {
        const buckets = await minioClient_1.minioManager.listBucketsWithStatus();
        res.json(buckets);
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
});
app.post('/api/buckets', auth_1.requireAuth, async (req, res) => {
    try {
        const { name } = req.body;
        if (!name)
            throw new Error("Bucket name required");
        await minioClient_1.minioManager.createBucket(name);
        res.json({ success: true });
    }
    catch (err) {
        res.status(400).json({ error: err.message });
    }
});
app.put('/api/buckets/:name/policy', auth_1.requireAuth, async (req, res) => {
    try {
        const name = req.params.name;
        const { public: isPublic } = req.body; // true or false
        if (!name)
            throw new Error("Bucket name required");
        await minioClient_1.minioManager.setBucketVisibility(name, isPublic);
        res.json({ success: true });
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
});
// Start
app.listen(config_1.config.port, () => {
    console.log(`Server running at http://localhost:${config_1.config.port}`);
});
//# sourceMappingURL=server.js.map