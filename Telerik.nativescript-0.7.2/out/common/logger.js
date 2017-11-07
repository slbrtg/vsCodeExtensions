"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var LoggerMessageType;
(function (LoggerMessageType) {
    LoggerMessageType[LoggerMessageType["Log"] = 0] = "Log";
    LoggerMessageType[LoggerMessageType["Info"] = 1] = "Info";
    LoggerMessageType[LoggerMessageType["Warning"] = 2] = "Warning";
    LoggerMessageType[LoggerMessageType["Error"] = 3] = "Error";
})(LoggerMessageType = exports.LoggerMessageType || (exports.LoggerMessageType = {}));
/**
 * The logger is a singleton.
 */
var Logger = (function () {
    function Logger() {
        this._handlers = [];
    }
    Logger.prototype.handleMessage = function (message, type, tag) {
        if (type === void 0) { type = LoggerMessageType.Log; }
        if (tag === void 0) { tag = null; }
        for (var _i = 0, _a = this._handlers; _i < _a.length; _i++) {
            var handler = _a[_i];
            if (!handler.tags || handler.tags.length == 0 || handler.tags.indexOf(tag) > -1) {
                handler.handler({ message: message, type: type });
            }
        }
    };
    Logger.prototype.log = function (message, tag) {
        if (tag === void 0) { tag = null; }
        this.handleMessage(message, LoggerMessageType.Log, tag);
    };
    Logger.prototype.info = function (message, tag) {
        if (tag === void 0) { tag = null; }
        this.handleMessage(message, LoggerMessageType.Info, tag);
    };
    Logger.prototype.warn = function (message, tag) {
        if (tag === void 0) { tag = null; }
        this.handleMessage(message, LoggerMessageType.Warning, tag);
    };
    Logger.prototype.error = function (message, tag) {
        if (tag === void 0) { tag = null; }
        this.handleMessage(message, LoggerMessageType.Error, tag);
    };
    Logger.prototype.addHandler = function (handler, tags) {
        if (tags === void 0) { tags = null; }
        tags = tags || [];
        this._handlers.push({ handler: handler, tags: tags });
    };
    /**
     * Removes all occurrence of this handler, ignoring the associated tags
     */
    Logger.prototype.removeHandler = function (handlerToRemove) {
        var i = this._handlers.length;
        while (i--) {
            if (this._handlers[i].handler == handlerToRemove) {
                this._handlers.splice(i, 1);
            }
        }
    };
    return Logger;
}());
exports.Logger = Logger;
var Tags;
(function (Tags) {
    Tags.FrontendMessage = "LoggerTag.FrontendMessage";
})(Tags = exports.Tags || (exports.Tags = {}));
var Handlers;
(function (Handlers) {
    function stdStreamsHandler(args) {
        switch (args.type) {
            case LoggerMessageType.Log:
                console.log(args.message);
                break;
            case LoggerMessageType.Info:
                console.info(args.message);
                break;
            case LoggerMessageType.Warning:
                console.warn(args.message);
                break;
            case LoggerMessageType.Error:
                console.error(args.message);
                break;
        }
    }
    Handlers.stdStreamsHandler = stdStreamsHandler;
    ;
    function createStreamHandler(stream, encoding) {
        if (encoding === void 0) { encoding = 'utf8'; }
        var isStreamClosed = false;
        stream.on('close', function () { isStreamClosed = true; });
        return function (args) {
            if (stream && !isStreamClosed) {
                stream.write(args.message, encoding);
            }
        };
    }
    Handlers.createStreamHandler = createStreamHandler;
})(Handlers = exports.Handlers || (exports.Handlers = {}));
//# sourceMappingURL=logger.js.map