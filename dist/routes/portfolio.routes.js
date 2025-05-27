"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const portfolio_controller_1 = require("../controllers/portfolio.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = express_1.default.Router();
router.get('/', portfolio_controller_1.getAllPortfolios);
router.get('/:id', portfolio_controller_1.getPortfolio);
router.use(auth_middleware_1.protect);
router.post('/', portfolio_controller_1.createPortfolio);
router.patch('/:id', portfolio_controller_1.updatePortfolio);
router.delete('/:id', portfolio_controller_1.deletePortfolio);
exports.default = router;
//# sourceMappingURL=portfolio.routes.js.map