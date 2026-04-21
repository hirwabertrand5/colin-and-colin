"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.seedAllWorkflowTemplates = void 0;
const seedDueDiligence_1 = require("./seedDueDiligence");
const seedNGORegistration_1 = require("./seedNGORegistration");
const seedArbitration_1 = require("./seedArbitration");
const seedCommercialWorkflow_1 = require("./seedCommercialWorkflow");
const seedLaborProcedure_1 = require("./seedLaborProcedure");
const seedBusinessRegistration_1 = require("./seedBusinessRegistration");
const seedCriminalProcedure_1 = require("./seedCriminalProcedure");
const seedAllWorkflowTemplates = async () => {
    await (0, seedDueDiligence_1.seedDueDiligenceTemplate)();
    await (0, seedNGORegistration_1.seedNGORegistrationTemplate)();
    await (0, seedArbitration_1.seedArbitrationTemplate)();
    await (0, seedCommercialWorkflow_1.seedCommercialWorkflowTemplate)();
    await (0, seedLaborProcedure_1.seedLaborProcedureTemplate)();
    await (0, seedBusinessRegistration_1.seedBusinessRegistrationTemplate)();
    await (0, seedCriminalProcedure_1.seedCriminalProcedureTemplate)();
};
exports.seedAllWorkflowTemplates = seedAllWorkflowTemplates;
//# sourceMappingURL=index.js.map