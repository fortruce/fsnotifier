# fsnotifier

A Node.js module for tracking appends to a file.

fsnotifier will emit `change` events for each chunk of appends to a file.
It continuously polls the file and waits for it to stabalize, then it emits a
`change` event with a readable stream of the changes.

## Install

```bash
$ npm install fsnotifier
```

## Usage

Initialize a notifier for a file:

```javascript
var notifier = require('fsnotifier');

var n = notifier('logfile.txt');

// register a listener to the change event and pipe the changes to stdout
n.on('change', function(stream) {
  stream.pipe(process.stdout);
});

// stop notifications
n.close();
```