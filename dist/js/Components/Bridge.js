/**
 * @Author: XY | The Findables Company <arietrouw>
 * @Date:   Friday, February 2, 2018 12:17 PM
 * @Email:  developer@xyfindables.com
 * @Filename: Bridge.js
 * @Last modified by:   arietrouw
 * @Last modified time: Friday, March 23, 2018 11:21 PM
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */


const debug = require(`debug`)(`Bridge`);
const Node = require(`./Node`);
const Entry = require(`../Data/Entry`);

class Bridge extends Node {
  constructor(moniker, host, ports, config) {
    debug(`constructor`);
    process.title = `XYO-Bridge`;
    super(moniker, host, ports, config);
    this.sentinels = [];
    this.archivists = [];
  }

  findSentinels(sentinels) {
    debug(`findSentinels`);

    this.sentinels = []; // remove old ones
    Object.keys(sentinels).forEach((key) => {
      const sentinel = sentinels[key];

      if (!(sentinel.ports.pipe === this.ports.pipe && sentinel.host === this.host)) {
        this.addSentinel(
          sentinel.host,
          sentinel.ports,
        );
      }
    });
  }

  findArchivists(archivists) {
    debug(`findArchivists`);

    this.archivists = []; // remove old ones
    Object.keys(archivists).forEach((key) => {
      const archivist = archivists[key];

      if (!(archivist.ports.pipe === this.ports.pipe && archivist.host === this.host)) {
        this.addArchivist(
          archivist.host,
          archivist.ports,
        );
      }
    });
  }

  findBridges(bridges) {
    debug(`detectBridges`);

    this.peers = []; // remove old ones
    Object.keys(bridges).forEach((key) => {
      const bridge = bridges[key];

      if (!(bridge.ports.pipe === this.ports.pipe && bridge.host === this.host)) {
        this.addPeer(
          bridge.host,
          bridge.ports,
        );
      }
    });
  }

  addSentinel(host, ports) {
    debug(`addSentinel`);
    if (!(this.host === host && this.ports.pipe === ports.pipe)) {
      this.sentinels.push({ host, port: ports.pipe });
    }
  }

  addArchivist(host, ports) {
    debug(`addArchivist`);
    if (!(this.host === host && this.ports.pipe === ports.pipe)) {
      this.archivists.push({ host, port: ports.pipe });
    }
  }

  initiateArchivistSend(maxEntries) {
    debug(`initiateArchivistSend`);
    const archivist = Math.floor(Math.random() * 10);

    if (archivist < this.archivists.length) {
      const entry = new Entry();

      for (let i = 0; i < maxEntries && i < this.entries.length; i++) {
        const buf = this.entries[i].toBuffer();

        if (!buf) {
          throw new Error(`Null Buffer`);
        }
        entry.payloads.push(buf);
      }
      for (let i = 0; i < this.keys.length; i++) {
        entry.p2keys.push(this.keys[i].exportKey(`components-public`).n);
      }
      const buffer = entry.toBuffer();
      this.out(this.archivists[archivist], buffer);
    }
  }

  initiateSentinelPull() {
    debug(`initiateSentinelPull`);
    const sentinel = Math.floor(Math.random() * 10);

    if (sentinel < this.sentinels.length) {
      const entry = new Entry();

      for (let i = 0; i < this.keys.length; i++) {
        entry.p2keys.push(this.keys[i].exportKey(`components-public`).n);
      }

      const buffer = entry.toBuffer();
      this.out(this.sentinels[sentinel], buffer);

      debug(`initiateSentinelPull-Done:${JSON.stringify(entry)}`);
    }
  }

  onEntry(socket, entry) {
    debug(`onEntry`);
    super.onEntry(socket, entry);
  }

  in(socket) {
    debug(`in`);
    super.in(socket);
  }

  out(target, buffer) {
    debug(`out`);
    super.out(target, buffer);
  }

  update(config) {
    debug(`update`);
    super.update(config);
    if (this.sentinels.length === 0) {
      this.findSentinels(config.sentinels);
      this.findBridges(config.bridges);
      this.findArchivists(config.archivists);
    }
    this.initiateArchivistSend(8);
    this.initiateSentinelPull(2);
  }

  status() {
    const status = super.status();

    status.type = `Bridge`;
    status.sentinels = this.sentinels.length;
    status.archivists = this.archivists.length;

    return status;
  }
}

module.exports = Bridge;
