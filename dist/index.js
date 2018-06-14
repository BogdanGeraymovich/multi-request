'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _validUrl = require('valid-url');

var _validUrl2 = _interopRequireDefault(_validUrl);

var _MultiJsonStream = require('./MultiJsonStream');

var _MultiJsonStream2 = _interopRequireDefault(_MultiJsonStream);

var _stream = require('stream');

var _request = require('request');

var _request2 = _interopRequireDefault(_request);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var createUrlMapping = function createUrlMapping(query, baseUrl) {
  var mapping = {};

  _lodash2.default.forEach(_lodash2.default.keys(query), function (key) {
    var url = baseUrl + '/' + query[key];

    if (_validUrl2.default.isUri(url)) {
      mapping[key] = url;
    }
  });

  return mapping;
};

var startStreams = function startStreams(urls) {
  var streams = [];

  _lodash2.default.forEach(_lodash2.default.keys(urls), function (key) {
    var stream = (0, _request2.default)(urls[key]).pipe(new _stream.PassThrough());
    streams.push({
      key: key,
      src: stream
    });
  });

  return streams;
};

exports.default = function (baseUrl) {
  return function (req, res, next) {
    var query = req.query;

    var resUrls = createUrlMapping(query, baseUrl);
    var streams = startStreams(resUrls);
    var result = new _MultiJsonStream2.default(streams);

    res.contentType('application/json');

    result.pipe(res);
    next();
  };
};