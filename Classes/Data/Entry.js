"use strict";

const debug = require("debug")("Entry"),
  Complex = require("./Complex.js"),
  bigInt = require("big-integer");

class Entry extends Complex {

  constructor() {
    super();
    this.type = 0x2003;
    this.map = "entry";
    this.version = 1;
    this.payload = [];
    this.headkeys = [];
    this.tailkeys = [];
    this.nonce = bigInt.randBetween(bigInt("0x0"), bigInt("0x1").shiftLeft(255));
    this.difficulty = 0;
    this.p1keys = [];
    this.p2keys = [];
    this.p2signatures = [];
    this.p1signatures = [];
  }
}

module.exports = Entry;
