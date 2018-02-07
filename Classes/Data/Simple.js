"use strict";

let Base = require("../Base.js"),
  BinOn = require("../../binon.js");

/* Types */
/* =============
0x1001 = Simple
0x1002 = Distance
0x1003 = Id
0x1004 = Signature
0x1005 = Address
================ */

class Simple extends Base {

  constructor() {
    super();
    this.type = 0x1001;
    this.map = "simple";
  }

  toBuffer(complete) {
    let activeMap = this.map || "simple",
      binon = new BinOn(activeMap);

    binon.loadMaps(null, () => {
      complete(binon.objToBuffer(this, activeMap));
    });
  }

  fromBuffer(buffer, offset, complete) {
    let activeMap = this.map || "simple",
      binon = new BinOn(activeMap);

    binon.loadMaps(null, () => {
      complete(binon.bufferToObj(buffer, offset, activeMap, this));
    });
  }
}

module.exports = Simple;
