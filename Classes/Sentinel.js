"use strict";

let Node = require("./Node.js");

class Sentinel extends Node {

  constructor(moniker, port, config) {
    super(moniker, port, config);
    this.entries = [];
  }

  status() {
    let status = super.status();

    return status;
  }
}

module.exports = Sentinel;
