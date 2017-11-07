"use strict";
/*---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *--------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
var utils = require("../../common/utilities");
var debugAdapterServices_1 = require("../../services/debugAdapterServices");
var AdapterProxy = (function () {
    function AdapterProxy(_requestTransformers, _debugAdapter, _eventHandler) {
        var _this = this;
        this._requestTransformers = _requestTransformers;
        this._debugAdapter = _debugAdapter;
        this._eventHandler = _eventHandler;
        this._debugAdapter.registerEventHandler(function (event) { return _this.onAdapterEvent(event); });
    }
    AdapterProxy.prototype.dispatchRequest = function (request) {
        var _this = this;
        if (!(request.command in this._debugAdapter)) {
            return utils.errP('unknowncommand');
        }
        return this.transformRequest(request)
            .then(function () { return _this._debugAdapter[request.command](request.arguments); })
            .then(function (body) {
            return _this.transformResponse(request, body)
                .then(function () { return body; });
        });
    };
    /**
     * Pass the request arguments through the transformers. They modify the object in place.
     */
    AdapterProxy.prototype.transformRequest = function (request) {
        return this._requestTransformers
            .filter(function (transformer) { return request.command in transformer; })
            .reduce(function (p, transformer) { return p.then(function () { return transformer[request.command](request.arguments, request.seq); }); }, Promise.resolve());
    };
    /**
     * Pass the response body back through the transformers in reverse order. They modify the body in place.
     */
    AdapterProxy.prototype.transformResponse = function (request, body) {
        if (!body) {
            return Promise.resolve();
        }
        var bodyTransformMethodName = request.command + 'Response';
        var reversedTransformers = utils.reversedArr(this._requestTransformers);
        return reversedTransformers
            .filter(function (transformer) { return bodyTransformMethodName in transformer; })
            .reduce(function (p, transformer) { return p.then(function () { return transformer[bodyTransformMethodName](body, request.seq); }); }, Promise.resolve());
    };
    /**
     * Pass the event back through the transformers in reverse. They modify the object in place.
     */
    AdapterProxy.prototype.onAdapterEvent = function (event) {
        // try/catch because this method isn't promise-based like the rest of the class
        try {
            var reversedTransformers = utils.reversedArr(this._requestTransformers);
            reversedTransformers
                .filter(function (transformer) { return event.event in transformer; })
                .forEach(function (transformer) { return transformer[event.event](event); });
            // Internal events should not be passed back through DebugProtocol
            if (AdapterProxy.INTERNAL_EVENTS.indexOf(event.event) < 0) {
                this._eventHandler(event);
            }
        }
        catch (e) {
            debugAdapterServices_1.Services.logger().error('Error handling adapter event: ' + (e ? e.stack : ''));
        }
    };
    return AdapterProxy;
}());
AdapterProxy.INTERNAL_EVENTS = ['scriptParsed', 'clearClientContext', 'clearTargetContext'];
exports.AdapterProxy = AdapterProxy;
//# sourceMappingURL=adapterProxy.js.map