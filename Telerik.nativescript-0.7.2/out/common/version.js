"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Version = (function () {
    function Version(version) {
        this._version = version;
    }
    Version.parse = function (versionStr) {
        if (versionStr === null) {
            return null;
        }
        var version = versionStr.split('.').map(function (str, index, array) { return parseInt(str); });
        for (var i = version.length; i < 3; i++) {
            version.push(0);
        }
        return new Version(version);
    };
    Version.prototype.toString = function () {
        return this._version[0] + "." + this._version[1] + "." + this._version[2];
    };
    Version.prototype.compareBySubminorTo = function (other) {
        var v1 = this._version;
        var v2 = other._version;
        return (v1[0] - v2[0] != 0) ? (v1[0] - v2[0]) : (v1[1] - v2[1] != 0) ? v1[1] - v2[1] : v1[2] - v2[2];
    };
    return Version;
}());
exports.Version = Version;
//# sourceMappingURL=version.js.map