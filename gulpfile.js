"use strict";

const gulp = require("gulp"),
  nodemon = require("gulp-nodemon"),
  env = require("gulp-env");

gulp.task("default", ["nodemon"], () => {});

gulp.task("nodemon", (cb) => {

  let started = false;

  env({
    vars: {
      DEBUG: "*,-socket.io*,-engine*,-express*,-snapdragon*"
    }
  });

  return nodemon({
    "script": "server.js"
  }).on("start", () => {
    // to avoid nodemon being started multiple times
    // thanks @matthisk
    if (!started) {
      cb();
      started = true;
    }
  });
});
