"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var vscode = require("vscode");
var WorkspaceConfigService = (function () {
    function WorkspaceConfigService() {
    }
    Object.defineProperty(WorkspaceConfigService.prototype, "isAnalyticsEnabled", {
        get: function () {
            return vscode.workspace.getConfiguration('nativescript').get('analytics.enabled');
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(WorkspaceConfigService.prototype, "tnsPath", {
        get: function () {
            return vscode.workspace.getConfiguration('nativescript').get('tnsPath');
        },
        enumerable: true,
        configurable: true
    });
    return WorkspaceConfigService;
}());
exports.WorkspaceConfigService = WorkspaceConfigService;
//# sourceMappingURL=workspaceConfigService.js.map