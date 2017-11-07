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
var extensionClient_1 = require("../ipc/extensionClient");
var DebugAdapterServices = (function (_super) {
    __extends(DebugAdapterServices, _super);
    function DebugAdapterServices() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    Object.defineProperty(DebugAdapterServices.prototype, "appRoot", {
        get: function () { return this._appRoot; },
        set: function (appRoot) { this._appRoot = appRoot; },
        enumerable: true,
        configurable: true
    });
    DebugAdapterServices.prototype.extensionClient = function () {
        if (!this._extensionClient && !this._appRoot) {
            throw new Error("appRoot has no value.");
        }
        this._extensionClient = this._extensionClient || new extensionClient_1.ExtensionClient(this._appRoot);
        return this._extensionClient;
    };
    return DebugAdapterServices;
}(services_1.Services));
exports.DebugAdapterServices = DebugAdapterServices;
exports.Services = new DebugAdapterServices();
//# sourceMappingURL=debugAdapterServices.js.map