"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const seo_controller_1 = require("../controllers/seo.controller");
const router = express_1.default.Router();
router.get('/blog/:slug', seo_controller_1.getBlogSeo);
router.get('/portfolio/:slug', seo_controller_1.getPortfolioSeo);
exports.default = router;
//# sourceMappingURL=seo.routes.js.map