/**
 * @Author: XY | The Findables Company <arietrouw>
 * @Date:   Tuesday, February 13, 2018 2:25 PM
 * @Email:  developer@xyfindables.com
 * @Filename: Id.js
 * @Last modified by:   arietrouw
 * @Last modified time: Wednesday, February 14, 2018 11:25 AM
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

'use strict';

const debug = require('debug')('Entry'),
  Simple = require('./Simple.js');

class Id extends Simple {

  constructor(binOn) {
    debug('constructor');
    super(binOn);
    this.type = 0x1003;
    this.map = 'id';
    this.version = 1;
    this.domain = "xy";
    this.value = "12345";
  }

}

module.exports = Id;
