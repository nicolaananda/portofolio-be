"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_middleware_1 = require("../middleware/auth.middleware");
const blog_controller_1 = require("../controllers/blog.controller");
const router = express_1.default.Router();
router.get('/', blog_controller_1.getAllBlogs);
router.get('/:id', blog_controller_1.getBlog);
router.use(auth_middleware_1.protect);
router.post('/', blog_controller_1.createBlog);
router.put('/:id', blog_controller_1.updateBlog);
router.patch('/:id', blog_controller_1.updateBlog);
router.delete('/:id', blog_controller_1.deleteBlog);
exports.default = router;
//# sourceMappingURL=blog.routes.js.map