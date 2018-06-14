import _ from 'lodash';
import { Readable } from 'stream';

export default class MultiJsonStreamM extends Readable {

  constructor(streams, options = {}) {
    Object.assign({}, options, { objectMode: true, highWaterMark: 32 });
    
    super(options);
    this._streams = streams;
    this._currentStream = null;

    this._drained = false;
    this._isReading = false;
    this._pushJsonBegin();
    this._nextStream();
  }

  _pushJsonBegin() {
    this.push('{');
  }

  _pushJsonKey(key) {
    this.push(`"${key}": `);
  }

  _pushJsonSeparator() {
    this.push(', ');
  }

  _pushJsonEnd() {
    this.push('}');
  }

  _read() {
    this._drained = true;
    this._reading();
  }
  
  _reading() {
    if (this._isReading || !this._drained || !this._currentStream) {
      return;
    }
    
    this._isReading = true;

    let chunk;
    while ((chunk = this._currentStream.src.read()) !== null) {
      this._drained = this.push(chunk.toString());
    }

    this._isReading = false;
  }

  handleErrors(stream) {
    if (!stream) {
      return;
    }

    stream.on('error', error => {
      this.destroy(error);
    })
  }
  
  destroy(error) {
    if (this._currentStream && this._currentStream.src.destroy) {
      this._currentStream.src.destroy();
    }

    _.forEach(this._streams, stream => {
      if (stream.destroy) stream.destroy();
    });

    if (error) {
      this.emit('error', error);
    }
    
    this.emit('close');
  }
  
  _nextStream() {
    const stream = this._streams.shift();

    if (!stream) {
      this.push(null);
      this.destroy();
      return;
    }

    this._currentStream = stream;
    this._pushJsonKey(stream.key);
    this._reading();

    this.handleErrors(stream.src);

    stream.src.on('readable', () => {
      this._reading();
    });
    stream.src.once('end', () => {
      this._currentStream = null;
      if (_.size(this._streams)) {
        this._pushJsonSeparator();
      } else {
        this._pushJsonEnd();
      }
      this._nextStream();
    });
  }

};
