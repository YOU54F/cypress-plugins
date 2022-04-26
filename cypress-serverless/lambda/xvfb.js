/**
 * This is code by @Rob--W from https://github.com/Rob--W/node-xvfb/blob/master/index.js
 *
 */
var fs = require("fs");
var path = require("path");
var spawn = require("child_process").spawn;
var exec = require("child_process").exec;
fs.exists = fs.exists || path.exists;
fs.existsSync = fs.existsSync || path.existsSync;

var usleep;
try {
  usleep = require("sleep").usleep;
} catch (e) {
  usleep = function(microsecs) {
    // Fall back to busy loop.
    var deadline = Date.now() + microsecs / 1000;
    while (Date.now() <= deadline);
  };
}

function Xvfb(options) {
  options = options || {};
  this._display = options.displayNum ? ":" + options.displayNum : null;
  this._reuse = options.reuse;
  this._timeout = options.timeout || 500;
  this._silent = options.silent;
  this._xvfb_args = options.xvfb_args || [
    "-nolisten",
    "tcp",
    "-nolisten",
    "unix",
    "-xkbdir",
    "/tmp/lib/xkb",
    "+extension",
    "RANDR"
  ];
  this._xvfb_executable = options.xvfb_executable || "./Xvfb";
  this._dry_run = options.dry_run || false;
}

Xvfb.prototype = {
  start: function(cb) {
    if (this._dry_run)
      return setImmediate(() => {
        cb(null, null);
      });
    if (!this._process) {
      var lockFile = this._lockFile();

      this._setDisplayEnvVariable();

      fs.exists(
        lockFile,
        function(exists) {
          var didSpawnFail = false;
          try {
            this._spawnProcess(exists, function(e) {
              didSpawnFail = true;
              if (cb) cb(e);
            });
          } catch (e) {
            return cb && cb(e);
          }

          var totalTime = 0;
          (function checkIfStarted() {
            fs.exists(lockFile, function(exists) {
              if (didSpawnFail) {
                // When spawn fails, the callback will immediately be called.
                // So we don't have to check whether the lock file exists.
                return;
              }
              if (exists) {
                return cb && cb(null, this._process);
              } else {
                totalTime += 10;
                if (totalTime > this._timeout) {
                  return cb && cb(new Error("Could not start Xvfb."));
                } else {
                  setTimeout(checkIfStarted.bind(this), 10);
                }
              }
            });
          }.bind(this)());
        }.bind(this)
      );
    }
  },

  startSync: function() {
    if (!this._process) {
      var lockFile = this._lockFile();

      this._setDisplayEnvVariable();
      this._spawnProcess(fs.existsSync(lockFile), function(e) {
        // Ignore async spawn error. While usleep is active, tasks on the
        // event loop cannot be executed, so spawn errors will never be
        // received during the startSync call.
      });

      var totalTime = 0;
      while (!fs.existsSync(lockFile)) {
        if (totalTime > this._timeout) {
          throw new Error("Could not start Xvfb.");
        }
        usleep(10000);
        totalTime += 10;
      }
    }

    return this._process;
  },

  stop: function(cb) {
    if (this._dry_run)
      return setImmediate(() => {
        cb(null, null);
      });
    if (this._process) {
      this._killProcess();
      this._restoreDisplayEnvVariable();

      var lockFile = this._lockFile();
      var totalTime = 0;
      (function checkIfStopped() {
        fs.exists(lockFile, function(exists) {
          if (!exists) {
            return cb && cb(null, this._process);
          } else {
            totalTime += 10;
            if (totalTime > this._timeout) {
              return cb && cb(new Error("Could not stop Xvfb."));
            } else {
              setTimeout(checkIfStopped.bind(this), 10);
            }
          }
        });
      }.bind(this)());
    } else {
      return cb && cb(null);
    }
  },

  stopSync: function() {
    if (this._process) {
      this._killProcess();
      this._restoreDisplayEnvVariable();

      var lockFile = this._lockFile();
      var totalTime = 0;
      while (fs.existsSync(lockFile)) {
        if (totalTime > this._timeout) {
          throw new Error("Could not stop Xvfb.");
        }
        usleep(10000);
        totalTime += 10;
      }
    }
  },

  display: function() {
    if (!this._display) {
      var displayNum = 98;
      //   var displayNum = 0; // we want display 1
      var lockFile;
      do {
        displayNum++;
        lockFile = this._lockFile(displayNum);
      } while (!this._reuse && fs.existsSync(lockFile));
      this._display = ":" + displayNum;
    }
    return this._display;
  },

  _setDisplayEnvVariable: function() {
    this._oldDisplay = process.env.DISPLAY;
    process.env.DISPLAY = this.display();
  },

  _restoreDisplayEnvVariable: function() {
    process.env.DISPLAY = this._oldDisplay;
  },

  _spawnProcess: function(lockFileExists, onAsyncSpawnError) {
    var display = this.display();
    if (lockFileExists) {
      if (!this._reuse) {
        throw new Error(
          "Display " +
            display +
            ' is already in use and the "reuse" option is false.'
        );
      }
    } else {
      var args = [display].concat(this._xvfb_args);
      var argsstr = args.join(" ");
      // var cmd = 'cd /tmp/pck && ' + this._xvfb_executable + ' ' + argsstr;
      console.log("Xvfb spawn() args: ", args);
      //   console.log('Xvfb spawn() args as string: ', argsstr);
      // console.log(`Xvfb exec command: [${cmd}]`);

      var newEnv = deepClone(process.env);
      newEnv.LD_LIBRARY_PATH = `/tmp/lib:${newEnv.LD_LIBRARY_PATH}`;
      console.log("New env: ", newEnv);
      this._process = spawn(this._xvfb_executable, args, { env: newEnv });
      // this._process = exec(cmd);
      //   this._process = spawn(this._xvfb_executable, [ display ].concat(this._xvfb_args), { cwd : '/tmp/app' });
      this._process.stderr.on(
        "data",
        function(data) {
          if (!this._silent) {
            process.stderr.write(data);
          }
        }.bind(this)
      );
      // Bind an error listener to prevent an error from crashing node.
      this._process.once("error", function(e) {
        onAsyncSpawnError(e);
      });
    }
  },

  _killProcess: function() {
    this._process.kill();
    this._process = null;
  },

  _lockFile: function(displayNum) {
    displayNum =
      displayNum ||
      this.display()
        .toString()
        .replace(/^:/, "");
    return "/tmp/.X" + displayNum + "-lock";
  }
};

module.exports = Xvfb;

function deepClone(obj) {
  return JSON.parse(JSON.stringify(obj));
}

if (require.main === module) {
  var assert = require("assert");
  var xvfb = new Xvfb({ displayNum: 88 });
  xvfb.startSync();
  console.error("started sync");
  xvfb.stopSync();
  console.error("stopped sync");
  xvfb.start(function(err) {
    assert.equal(err, null);
    console.error("started async");
    xvfb.stop(function(err) {
      assert.equal(err, null);
      console.error("stopped async");
      xvfb.start(function(err) {
        assert.equal(err, null);
        console.error("started async");
        xvfb.stopSync();
        console.error("stopped sync");
        xvfb.startSync();
        console.error("started sync");
        xvfb.stop(function(err) {
          assert.equal(err, null);
          console.error("stopped async");
        });
      });
    });
  });
}
