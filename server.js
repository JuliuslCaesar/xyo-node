"use strict";
let debug = require("debug")("server"),
  XYO = require("./xyo.js"),
  CONFIG = require("config"),
  TESTDATACLASSES = require("./testdataclasses.js"),
  XYODATA = require("./xyodata.js");

/* ================= */
/*  Local Functions  */
/* ================= */

const initialize = (complete) => {
    debug("initializing...");
    let key;

    if (CONFIG.sentinels) {
      for (key in CONFIG.sentinels) {
        let sentinel = CONFIG.sentinels[key];

        if (sentinel.action === "launch") {
          XYO.fromPort[sentinel.ports.pipe] = XYO.fromPort[sentinel.ports.pipe] || new XYO.Sentinel(sentinel.moniker, sentinel.host, sentinel.ports, sentinel.config || {});
        }
      }
    }

    if (CONFIG.bridges) {
      for (key in CONFIG.bridges) {
        let bridge = CONFIG.bridges[key];

        if (bridge.action === "launch") {
          XYO.fromPort[bridge.ports.pipe] = XYO.fromPort[bridge.ports.pipe] || new XYO.Bridge(bridge.moniker, bridge.host, bridge.ports, bridge.config || {});
        }
      }
    }

    if (CONFIG.archivists) {
      for (key in CONFIG.archivists) {
        let archivist = CONFIG.archivists[key];

        if (archivist.action === "launch") {
          XYO.fromPort[archivist.ports.pipe] = XYO.fromPort[archivist.ports.pipe] || new XYO.Archivist(archivist.moniker, archivist.host, archivist.ports, archivist.config || {});
          XYO.fromPort[archivist.ports.pipe].findPeers(CONFIG.archivists);
        }
      }
    }

    if (CONFIG.diviners) {
      for (key in CONFIG.diviners) {
        let diviner = CONFIG.diviners[key];

        if (diviner.action === "launch") {
          XYO.fromPort[diviner.ports.pipe] = XYO.fromPort[diviner.ports.pipe] || new XYO.Diviner(diviner.moniker, diviner.host, diviner.ports, diviner.config || {});
          XYO.fromPort[diviner.ports.pipe].findPeers(CONFIG.diviners);
          XYO.fromPort[diviner.ports.pipe].findArchivists(CONFIG.archivists);
        }
      }
    }

    if (complete) {
      complete();
    }

  },
  updateObjects = () => {
    // debug(">>>>>>>>TIMER<<<<<<<<<");
    let key;

    XYO.Base.updateCount++;

    for (key in XYO.fromMoniker) {
      if (XYO.fromMoniker.hasOwnProperty(key)) {
        XYO.fromMoniker[key].update(CONFIG);
      }
    }
  },
  startTimers = () => {
    setInterval(() => {
      updateObjects();

    }, CONFIG.clock);
  },
  run = () => {
    updateObjects();
    startTimers();
  };

/* ============= */
/*  Application  */
/* ============= */

/* app.get("/blocks", (req, res) => res.send(JSON.stringify(BLOCKCHAIN.blockchain)));

app.post("/mineBlock", (req, res) => {
  let newBlock = BLOCKCHAIN.generateNextBlock(req.body.data);

  BLOCKCHAIN.addBlock(newBlock);
  // broadcast(responseLatestMsg());
  // debug('block added: ' + JSON.stringify(newBlock));
  res.send();
}); */

initialize(() => {
  XYODATA.BinOn.loadMaps(null, () => {
    if (CONFIG.testdataclasses) {
      TESTDATACLASSES.All();
    }
    run();
  });
});
