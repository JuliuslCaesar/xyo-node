"use strict";

const debug = require("debug")("Ledger"),
  Complex = require("./Complex.js");

class Ledger extends Complex {

  constructor() {
    debug("constructor");
    super();
    this.type = 0x2004;
    this.map = "ledger";
    this.version = 1;
    this.entries = [];
  }
}

module.exports = Ledger;
