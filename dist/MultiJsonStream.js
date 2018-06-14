'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _stream = require('stream');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var MultiJsonStreamM = function (_Readable) {
  _inherits(MultiJsonStreamM, _Readable);

  function MultiJsonStreamM(streams) {
    var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

    _classCallCheck(this, MultiJsonStreamM);

    Object.assign({}, options, { objectMode: true, highWaterMark: 32 });

    var _this = _possibleConstructorReturn(this, (MultiJsonStreamM.__proto__ || Object.getPrototypeOf(MultiJsonStreamM)).call(this, options));

    _this._streams = streams;
    _this._currentStream = null;

    _this._drained = false;
    _this._isReading = false;
    _this._pushJsonBegin();
    _this._nextStream();
    return _this;
  }

  _createClass(MultiJsonStreamM, [{
    key: '_pushJsonBegin',
    value: function _pushJsonBegin() {
      this.push('{');
    }
  }, {
    key: '_pushJsonKey',
    value: function _pushJsonKey(key) {
      this.push('"' + key + '": ');
    }
  }, {
    key: '_pushJsonSeparator',
    value: function _pushJsonSeparator() {
      this.push(', ');
    }
  }, {
    key: '_pushJsonEnd',
    value: function _pushJsonEnd() {
      this.push('}');
    }
  }, {
    key: '_read',
    value: function _read() {
      this._drained = true;
      this._reading();
    }
  }, {
    key: '_reading',
    value: function _reading() {
      if (this._isReading || !this._drained || !this._currentStream) {
        return;
      }

      this._isReading = true;

      var chunk = void 0;
      while ((chunk = this._currentStream.src.read()) !== null) {
        this._drained = this.push(chunk.toString());
      }

      this._isReading = false;
    }
  }, {
    key: 'handleErrors',
    value: function handleErrors(stream) {
      var _this2 = this;

      if (!stream) {
        return;
      }

      stream.on('error', function (error) {
        _this2.destroy(error);
      });
    }
  }, {
    key: 'destroy',
    value: function destroy(error) {
      if (this._currentStream && this._currentStream.src.destroy) {
        this._currentStream.src.destroy();
      }

      _lodash2.default.forEach(this._streams, function (stream) {
        if (stream.destroy) stream.destroy();
      });

      if (error) {
        this.emit('error', error);
      }

      this.emit('close');
    }
  }, {
    key: '_nextStream',
    value: function _nextStream() {
      var _this3 = this;

      var stream = this._streams.shift();

      if (!stream) {
        this.push(null);
        this.destroy();
        return;
      }

      this._currentStream = stream;
      this._pushJsonKey(stream.key);
      this._reading();

      this.handleErrors(stream.src);

      stream.src.on('readable', function () {
        _this3._reading();
      });
      stream.src.once('end', function () {
        _this3._currentStream = null;
        if (_lodash2.default.size(_this3._streams)) {
          _this3._pushJsonSeparator();
        } else {
          _this3._pushJsonEnd();
        }
        _this3._nextStream();
      });
    }
  }]);

  return MultiJsonStreamM;
}(_stream.Readable);

exports.default = MultiJsonStreamM;
;