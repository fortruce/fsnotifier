var fs = require('fs');
var assert = require('assert');
var util = require('util');
var EventEmitter = require('events').EventEmitter;

function Notifier(filename, options) {
  EventEmitter.call(this);
  this._filename = filename;
  this._prevSize = fs.statSync(filename).size;
  this._stable = 0;
  this._close = false;
  this._notifySize = this._prevSize;

  options = options || {};
  this._interval = options.interval || 500;
  this._pollTimes = options.pollTimes || 4;

  // ensure there is no notification for the file being stable before first change
  this._stable = this._pollTimes + 1;
}

util.inherits(Notifier, EventEmitter);

Notifier.prototype.close = function() {
  this._close = true;
};

Notifier.prototype._notify = function(curSize) {
  this.emit('change', fs.createReadStream(this._filename, {
    start: this._notifySize,
    end: curSize
  }));
  this._notifySize = curSize;
}

Notifier.prototype._size = function() {
  var stat;
  try {
    stat = fs.statSync(this._filename);
    if (stat)
      return stat.size;
  } finally {
    if (!stat) {
      this.emit('error', 'Failed to stat file.');
      this._close = true;
      return undefined;
    }
  }
}

Notifier.prototype._watch = function() {
  var curSize = this._size();
  if (this._close)
    return;

  if (this._prevSize === curSize) {
    this._stable++;
  } else {
    this._prevSize = curSize;
    this._stable = 0;
  }

  if (this._stable === this._pollTimes) {
    this._notify(curSize);
  }

  setTimeout(this._watch.bind(this), this._interval);
}

module.exports = {
  notify: function(filename) {
            var notifier = new Notifier(filename);
            notifier._watch(filename);
            return notifier;
          }
};