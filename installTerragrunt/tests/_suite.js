"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var path_1 = __importDefault(require("path"));
describe('Sample task tests', function () {
    before(function () {
        process.env.AGENT_TEMPDIRECTORY = "agent/";
        process.env.AGENT_TOOLSDIRECTORY = "agent/";
    });
    after(function () {
    });
    it('should download a specific version for this machione', function (done) {
        this.timeout(3000);
        var taskPath = path_1.default.join(__dirname, '..', 'index.js');
        process.env['INPUT_terragruntversion'] = '0.42.8';
        require(taskPath);
        done();
    });
});
