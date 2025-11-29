"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const mongoose_1 = __importDefault(require("mongoose"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const morgan_1 = __importDefault(require("morgan"));
const dotenv_1 = require("dotenv");
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const errorHandler_1 = require("./middleware/errorHandler");
const rateLimiter_1 = require("./middleware/rateLimiter");
const auth_routes_1 = __importDefault(require("./routes/auth.routes"));
const portfolio_routes_1 = __importDefault(require("./routes/portfolio.routes"));
const contact_routes_1 = __importDefault(require("./routes/contact.routes"));
const upload_routes_1 = __importDefault(require("./routes/upload.routes"));
const blog_routes_1 = __importDefault(require("./routes/blog.routes"));
const seo_routes_1 = __importDefault(require("./routes/seo.routes"));
(0, dotenv_1.config)();
const app = (0, express_1.default)();
app.use((0, helmet_1.default)({
    crossOriginResourcePolicy: { policy: "cross-origin" },
    crossOriginOpenerPolicy: { policy: "same-origin" },
    crossOriginEmbedderPolicy: { policy: "require-corp" }
}));
app.use((0, cors_1.default)({
    origin: process.env.NODE_ENV === 'production'
        ? ['https://nicola.id', 'https://www.nicola.id']
        : ['http://localhost:8080', 'http://localhost:5173', 'http://127.0.0.1:3000', 'http://127.0.0.1:5173', 'https://nicola.id', 'https://www.nicola.id'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    exposedHeaders: ['Set-Cookie'],
    maxAge: 86400
}));
app.use(express_1.default.json());
app.use((0, cookie_parser_1.default)());
app.use((0, morgan_1.default)('dev'));
app.use(rateLimiter_1.rateLimiter);
app.use('/api/auth', auth_routes_1.default);
app.use('/api/portfolio', portfolio_routes_1.default);
app.use('/api/contact', contact_routes_1.default);
app.use('/api/upload', upload_routes_1.default);
app.use('/api/blog', blog_routes_1.default);
app.use('/api/seo', seo_routes_1.default);
app.use(errorHandler_1.errorHandler);
mongoose_1.default
    .connect(process.env.MONGODB_URI || '')
    .then(() => {
    console.log('Connected to MongoDB');
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    });
})
    .catch((error) => {
    console.error('MongoDB connection error:', error);
    process.exit(1);
});
//# sourceMappingURL=index.js.map