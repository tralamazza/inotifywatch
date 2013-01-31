var Inotify = require('inotify').Inotify;
var EventEmitter = require('events').EventEmitter;
var util = require('util');

function Watcher(filepath, options, callback) {
  var self = this;
  EventEmitter.call(self);
  if (typeof options === 'function') {
    callback = options;
    options = null;
  }
  options = options || {
    persistent: true
    //, events: Inotify.IN_ALL_EVENTS
  };
  var watchFor =
    Inotify.IN_MODIFY |
    Inotify.IN_CREATE |
    Inotify.IN_DELETE |
    Inotify.IN_DELETE_SELF |
    Inotify.IN_MOVE;
  var inotify = new Inotify(options.persistent);
  var trampoline = function (ev, data) {
    if (callback)
      callback(ev, data);
    self.emit(ev, data);
  };
  var moved_from;
  inotify.addWatch({
    path: filepath,
    watch_for: options.events || watchFor,
    callback: function (event) {
      if (event.mask & Inotify.IN_ACCESS) {
        trampoline('access', event.name);
      } else if (event.mask & Inotify.IN_MODIFY) {
        trampoline('modify', event.name);
      } else if (event.mask & Inotify.IN_OPEN) {
        trampoline('open', event.name);
      } else if (event.mask & Inotify.IN_CLOSE_NOWRITE) {
        trampoline('close', event.name);
      } else if (event.mask & Inotify.IN_CLOSE_WRITE) {
        trampoline('close', event.name);
      } else if (event.mask & Inotify.IN_ATTRIB) {
        trampoline('attribute', event.name);
      } else if (event.mask & Inotify.IN_CREATE) {
        trampoline('create', event.name);
      } else if (event.mask & Inotify.IN_DELETE) {
        trampoline('delete', event.name);
      } else if (event.mask & Inotify.IN_DELETE_SELF) {
        trampoline('delete', event.name);
      } else if (event.mask & Inotify.IN_MOVE_SELF) {
        trampoline('move self', event.name);
      } else if (event.mask & Inotify.IN_IGNORED) {
        trampoline('ignored', event.name);
      } else if (event.mask & Inotify.IN_MOVED_FROM) {
        trampoline('moved from', event.name);
        moved_from = event;
      } else if (event.mask & Inotify.IN_MOVED_TO) {
        trampoline('moved to', event.name);
        if (moved_from && moved_from.cookie === event.cookie) {
          trampoline('move', { from: moved_from.name, to: event.name });
          moved_from = null;
        }
      }
    }
  });
  self.close = inotify.close.bind(inotify);
  return self;
}
util.inherits(Watcher, EventEmitter);

module.exports = function (filepath, options) {
  return new Watcher(filepath, options);
};
