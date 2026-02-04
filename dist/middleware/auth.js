"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireAuth = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const config_1 = require("../config");
const requireAuth = (req, res, next) => {
    const token = req.cookies?.auth_token;
    if (!token) {
        // If API request, return 401. If Page request, redirect to login.
        if (req.path.startsWith('/api')) {
            res.status(401).json({ error: 'Unauthorized' });
            return;
        }
        else {
            res.redirect('/login');
            return;
        }
    }
    try {
        const payload = jsonwebtoken_1.default.verify(token, config_1.config.jwtSecret);
        req.user = payload;
        next();
    }
    catch (err) {
        if (req.path.startsWith('/api')) {
            res.status(401).json({ error: 'Invalid token' });
            return;
        }
        else {
            res.redirect('/login');
            return;
        }
    }
};
exports.requireAuth = requireAuth;
//# sourceMappingURL=auth.js.map