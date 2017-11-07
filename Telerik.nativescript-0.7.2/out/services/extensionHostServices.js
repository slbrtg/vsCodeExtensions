"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var services_1 = require("./services");
var extensionVersionService_1 = require("../common/extensionVersionService");
var extensionServer_1 = require("../ipc/extensionServer");
var analyticsService_1 = require("../analytics/analyticsService");
var workspaceConfigService_1 = require("../common/workspaceConfigService");
var ExtensionHostServices = (function (_super) {
    __extends(ExtensionHostServices, _super);
    function ExtensionHostServices() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    Object.defineProperty(ExtensionHostServices.prototype, "globalState", {
        get: function () { return this._globalState; },
        set: function (globalState) { this._globalState = globalState; },
        enumerable: true,
        configurable: true
    });
    ExtensionHostServices.prototype.workspaceConfigService = function () {
        this._workspaceConfigService = this._workspaceConfigService || new workspaceConfigService_1.WorkspaceConfigService();
        return this._workspaceConfigService;
    };
    ExtensionHostServices.prototype.extensionVersionService = function () {
        if (!this._extensionVersionService && !this._globalState) {
            throw new Error("Global state has no value.");
        }
        this._extensionVersionService = this._extensionVersionService || new extensionVersionService_1.ExtensionVersionService(this.globalState);
        return this._extensionVersionService;
    };
    ExtensionHostServices.prototype.extensionServer = function () {
        this._extensionServer = this._extensionServer || new extensionServer_1.ExtensionServer();
        return this._extensionServer;
    };
    ExtensionHostServices.prototype.analyticsService = function () {
        this._analyticsService = this._analyticsService || new analyticsService_1.AnalyticsService();
        return this._analyticsService;
    };
    return ExtensionHostServices;
}(services_1.Services));
exports.ExtensionHostServices = ExtensionHostServices;
exports.Services = new ExtensionHostServices();
//# sourceMappingURL=extensionHostServices.js.map