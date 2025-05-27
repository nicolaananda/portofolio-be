"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const contact_controller_1 = require("../controllers/contact.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = express_1.default.Router();
router.post('/', contact_controller_1.submitContact);
router.use(auth_middleware_1.protect);
router.get('/', contact_controller_1.getAllContacts);
router.get('/:id', contact_controller_1.getContact);
router.patch('/:id/read', contact_controller_1.markAsRead);
router.delete('/:id', contact_controller_1.deleteContact);
exports.default = router;
//# sourceMappingURL=contact.routes.js.map