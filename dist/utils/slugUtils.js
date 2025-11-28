"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateSlug = generateSlug;
exports.generateUniqueSlug = generateUniqueSlug;
const slugify_1 = __importDefault(require("slugify"));
const portfolio_model_1 = require("../models/portfolio.model");
function generateSlug(title) {
    return (0, slugify_1.default)(title, {
        lower: true,
        strict: true,
        remove: /[*+~.()'"!:@]/g,
        locale: 'id',
    });
}
async function generateUniqueSlug(title, existingId = null, model = portfolio_model_1.Portfolio, fallbackBase = 'portfolio-item') {
    let baseSlug = generateSlug(title);
    if (!baseSlug || baseSlug.trim().length === 0) {
        baseSlug = fallbackBase;
    }
    let slug = baseSlug;
    let counter = 1;
    while (true) {
        const query = { slug };
        if (existingId) {
            query._id = { $ne: existingId };
        }
        const existing = await model.findOne(query);
        if (!existing) {
            break;
        }
        slug = `${baseSlug}-${counter}`;
        counter++;
        if (counter > 1000) {
            slug = `${baseSlug}-${Date.now()}`;
            break;
        }
    }
    return slug;
}
//# sourceMappingURL=slugUtils.js.map