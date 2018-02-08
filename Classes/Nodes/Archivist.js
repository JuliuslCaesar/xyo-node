"use strict";

let Node = require("./Node.js"),
  format = require("string-format");

class Archivist extends Node {

  constructor(moniker, port, config) {
    console.log("Archivist - constructor");
    let self;

    super(moniker, port, config);
    self = this;
    this.entries = [];
    this.entriesByKey = {};
    this.app.get("*", (req, res) => {
      self.get(req, res);
    });
    this.app.post("/", (req, res) => {
      self.post(req, res);
    });

    this.io.on("connection", (socket) => {
      console.log(format("New Connection"));
      socket.on("peers", (data) => {
        console.log(format("onPeers[Archivist]:{}", data));
      });
      socket.emit("peers", format("peers[Archivist] [{}, {}]", moniker, port));
    });
  }

  get(req, res) {
    console.log("Archivist - get");
    let contentType = req.headers["content-type"],
      parts = req.path.split("/"),
      id = null;

    if (parts.length > 1) {
      id = parts[1];
    }

    if (id.length === 0) {
      if (!contentType || contentType.indexOf("application/json") !== 0) {
        this.returnJSONStatus(req, res);
      } else {
        res.send({
          "objects": Node.fromMoniker.length,
          "updates": Node.updateCount
        });
      }
    } else if (id != null) {
      let entries = this.entriesByKey[id];

      if (entries) {
        res.send({
          "id": id,
          "entries": this.entriesByKey[id]
        });
      } else {
        res.status(404).send(format("(${}) Not Found", id));
      }
    } else {
      res.status(404).send(req.path);
    }
  }

  post(req, res) {
    console.log("Archivist - post");
    let action = req.body.action;

    switch (action) {
      case "add":
        if (req.body.entries) {
          this.addEntriesToDatabase(req.body.entries);
          res.status(201);
          res.send({
            "entriesAdded": req.body.entries.length,
            "totalEntries": this.entries.length
          });
        } else if (req.body.payloads) {
          this.addPayloadsToDatabase(req.body.payloads);
          res.status(201);
          res.send({
            "entriesAdded": req.body.payloads.length,
            "totalEntries": this.entries.length
          });
        }
        break;
      case "find":
        if (req.body.epoch) {
          let entries = this.find(req.body.keys, req.body.max, req.body.epoch);

          res.status(200);
          res.send({
            "entriesFound": Object.keys(entries).length,
            "entries": entries
          });
        } else {
          let entries = this.find(req.body.keys, req.body.max);

          res.status(200);
          res.send({
            "entriesFound": Object.keys(entries).length,
            "entries": entries
          });
        }
        break;
      default:
        res.send("default");
        break;
    }
  }

  find(keys, max, epoch, entries) {
    console.log("Archivist - find");
    let entryList = entries || {};

    keys.forEach((key) => {
      let entry = this.entriesByKey[key];

      if (entry && !(key in entries)) {
        entryList[key] = entry;
        if (entry.pk1 === key) {
          entryList = this.find([entry.pk2], max, epoch, entryList);
        } else {
          entryList = this.find([entry.pk1], max, epoch, entryList);
        }
      }
    });

    return entryList;
  }

  addEntriesToDatabase(entries) {
    console.log("Archivist - addEntriesToDatabase");
    entries.forEach((entry) => {
      let pk1Entries = this.entriesByKey[entry.pk1] || [],
        pk2Entries = this.entriesByKey[entry.pk2] || [];

      this.entriesByKey[entry.pk1] = pk1Entries;
      this.entriesByKey[entry.pk2] = pk2Entries;

      this.entries.push(entry);
      pk1Entries.push(entry);
      pk2Entries.push(entry);
    });
  }

  addPayloadsToDatabase(payloads) {
    console.log("Archivist - addPayloadsToDatabase");
    let entries = [];

    payloads.forEach((payload) => {
      entries.push(this.payload2Entry(payload));
    });

    this.addEntriesToDatabase(entries);
  }

  payload2Entry(payload) {
    return {
      "data": Buffer.from(payload).toString("base64")
    };
  }

  findPeers(archivists) {
    console.log(format("Archivist - findPeers: {}", JSON.stringify(this.config)));
    archivists.forEach((archivist) => {
      this.addPeer(archivist.domain, archivist.port);
    });
  }

  status() {
    let status = super.status();

    status.archivists = this.archivists.length;
    return status;
  }
}

module.exports = Archivist;
