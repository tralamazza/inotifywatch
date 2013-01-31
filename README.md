inotifywatch
============

File/folder watcher based on [inotify](https://github.com/c4milo/node-inotify).


### Install

```npm install inotifywatch```

### Example

```js
var inotifywatch = require('inotifywatch');

/* watcher is an EE */

var watcher = inotifywatch('.', function (event, data) {
  // you can use a callback here to capture all events
  console.log(event, data);
});
// or register for events
watcher.on('create', function (data) {
  if (data === 'close.txt')
    watcher.close();
});
```
