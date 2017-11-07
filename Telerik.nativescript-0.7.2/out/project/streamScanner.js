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
var StreamScanner = (function () {
    function StreamScanner(stream, scanCallback) {
        this._stream = stream;
        this._scanCallback = scanCallback;
        this._stream.on("data", this.scan.bind(this));
    }
    StreamScanner.prototype.stop = function () {
        this._stream.removeListener("data", this.scan);
    };
    StreamScanner.prototype.scan = function (data) {
        this._scanCallback(data.toString(), this.stop);
    };
    return StreamScanner;
}());
exports.StreamScanner = StreamScanner;
var StringMatchingScanner = (function (_super) {
    __extends(StringMatchingScanner, _super);
    function StringMatchingScanner(stream) {
        var _this = _super.call(this, stream, function (data, stop) {
            _this._metas.forEach(function (meta, metaIndex) {
                if (meta.test instanceof RegExp) {
                    var result = data.match(meta.test);
                    if (result && result.length > 0) {
                        _this.matchFound(metaIndex, { chunk: data, matches: result });
                    }
                }
                else if (typeof meta.test === 'string') {
                    var result = []; // matches indices
                    var dataIndex = -1;
                    while ((dataIndex = data.indexOf(meta.test, dataIndex + 1)) > -1) {
                        result.push(dataIndex);
                    }
                    if (result.length > 0) {
                        _this.matchFound(metaIndex, { chunk: data, matches: result });
                    }
                }
                else {
                    throw new TypeError("Invalid type");
                }
            });
        }) || this;
        _this._metas = [];
        return _this;
    }
    StringMatchingScanner.prototype.onEveryMatch = function (test, handler) {
        var _this = this;
        var handlerWrapper = function (result) {
            handler(result);
            _this.nextMatch(test).then(handlerWrapper);
        };
        this.nextMatch(test).then(handlerWrapper);
    };
    StringMatchingScanner.prototype.nextMatch = function (test) {
        var meta = {
            test: test,
            resolve: null,
            reject: null,
            promise: null
        };
        meta.promise = new Promise(function (resolve, reject) {
            meta.resolve = resolve;
            meta.reject = reject;
        });
        this._metas.push(meta);
        return meta.promise;
    };
    StringMatchingScanner.prototype.matchFound = function (matchMetaIndex, matchResult) {
        var meta = this._metas[matchMetaIndex];
        this._metas.splice(matchMetaIndex, 1); // remove the meta
        meta.resolve(matchResult);
    };
    return StringMatchingScanner;
}(StreamScanner));
exports.StringMatchingScanner = StringMatchingScanner;
//# sourceMappingURL=streamScanner.js.map