"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.seedAllWorkflowTemplates = void 0;
const seedDueDiligence_1 = require("./seedDueDiligence");
const seedNGORegistration_1 = require("./seedNGORegistration");
const seedArbitration_1 = require("./seedArbitration");
const seedCommercialWorkflow_1 = require("./seedCommercialWorkflow");
const seedLaborProcedure_1 = require("./seedLaborProcedure");
const seedBusinessRegistration_1 = require("./seedBusinessRegistration");
const seedCriminalProcedure_1 = require("./seedCriminalProcedure");
const seedAllWorkflowTemplates = () => __awaiter(void 0, void 0, void 0, function* () {
    yield (0, seedDueDiligence_1.seedDueDiligenceTemplate)();
    yield (0, seedNGORegistration_1.seedNGORegistrationTemplate)();
    yield (0, seedArbitration_1.seedArbitrationTemplate)();
    yield (0, seedCommercialWorkflow_1.seedCommercialWorkflowTemplate)();
    yield (0, seedLaborProcedure_1.seedLaborProcedureTemplate)();
    yield (0, seedBusinessRegistration_1.seedBusinessRegistrationTemplate)();
    yield (0, seedCriminalProcedure_1.seedCriminalProcedureTemplate)();
});
exports.seedAllWorkflowTemplates = seedAllWorkflowTemplates;
//# sourceMappingURL=index.js.map