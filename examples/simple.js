var inotwatch = require('..');

var watcher = inotwatch('.', console.log);
watcher.on('create', function (data) {
  if (data === 'foobar')
    watcher.close();
});
