"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const db_1 = __importDefault(require("../config/db"));
const index_1 = require("./index");
async function run() {
    await (0, db_1.default)();
    await (0, index_1.seedAllWorkflowTemplates)();
    console.log('✅ Seeded workflow templates successfully');
    process.exit(0);
}
run().catch((err) => {
    console.error('❌ Seeding failed:', err);
    process.exit(1);
});
//# sourceMappingURL=runSeeds.js.map