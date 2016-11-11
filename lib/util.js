/**
 * util
 *
 * @param {any} name
 */
function MessageBus(name) {
  let _self = this;
  this.name = name;
  this.messageMap = {};
  this.messageCount = 0;

  this.subscribe = function(topic, action) {
    if (!(typeof topic == 'string')) {
      subscribes(topic, action);
    } else {
      let actions = _self.messageMap[topic];
      if (actions == null) {
        _self.messageMap[topic] = [];
      }
      _self.messageMap[topic].push(action);
      _self.messageCount++;
    }
  };

  function subscribes(topics, action) {
    let results = [];
    let counter = 0;
    for (let i = 0; i < topics.length; i++) {
      let topic = topics[i];
      let actions = _self.messageMap[topic];
      if (actions == null) {
        _self.messageMap[topic] = [];
      }

      function actionProxy(result) {
        results[i] = result;
        counter++;
        if (counter == topics.length) {
          counter = 0;
          return action.apply(null, results);
        } else {
          return null;
        }
      }

      _self.messageMap[topic].push(actionProxy);
      _self.messageCount++;
    }
  }

  this.unsubscribe = function(topic) {
    let actions = _self.messageMap[topic];
    if (actions && actions != null) {
      _self.messageMap[topic] = null;
      delete(_self.messageMap[topic]);
      _self.messageCount--;
    }
  };

  this.publish = function(topic, data, concurrency) {
    let actions = _self.messageMap[topic];
    if (actions && actions != null) {
      for (let i = 0; i < actions.length; i++) {
        if (concurrency) {
          (function(action, data) {
            setTimeout(function() {
              action(data);
            }, 10);
          })(actions[i], data);
        } else {
          actions[i](data);
        }
      }
    }
  };
}

function getDistance(p1, p2) {
  let dx = p2.x - p1.x;
  let dy = p2.y - p1.y;
  return Math.sqrt(dx * dx + dy * dy);
}

Array.prototype.del = function(n) {
  if (typeof n != 'number') {
    for (let i = 0; i < this.length; i++) {
      if (this[i] === n) {
        return this.slice(0, i).concat(this.slice(i + 1, this.length));
      }
    }
    return this;
  } else {
    if (n < 0) {return this;}
    return this.slice(0, n).concat(this.slice(n + 1, this.length));
  }
};

if (![].indexOf) { //IE
  Array.prototype.indexOf = function(data) {
    for (let i = 0; i < this.length; i++) {
      if (this[i] === data) {return i;}
    }
    return -1;
  };
}

if (!window.console) { //IE
  window.console = {
    log: function(msg) {},
    info: function(msg) {},
    debug: function(msg) {},
    warn: function(msg) {},
    error: function(msg) {}
  };
}

function mouseCoords(event) {
  if (event.pageX || event.pageY) {
    return {
      x: event.pageX,
      y: event.pageY
    };
  }
  return {
    x: event.clientX + document.body.scrollLeft - document.body.clientLeft,
    y: event.clientY + document.body.scrollTop - document.body.clientTop
  };
}

function getXY(box, event) {
  event = event || mouseCoords(window.event);
  let x = document.body.scrollLeft + (event.x || event.layerX);
  let y = document.body.scrollTop + (event.y || event.layerY);
  return {
    x: x - box.offset.left,
    y: y - box.offset.top
  };
}

function rotatePoint(bx, by, x, y, angle) {
  let dx = x - bx;
  let dy = y - by;
  let r = Math.sqrt(dx * dx + dy * dy);
  let a = Math.atan2(dy, dx) + angle;
  return {
    x: bx + Math.cos(a) * r,
    y: by + Math.sin(a) * r
  };
}

function rotatePoints(target, points, angle) {
  let result = [];
  for (let i = 0; i < points.length; i++) {
    let p = rotatePoint(target.x, target.y, points[i].x, points[i].y, angle);
    result.push(p);
  }
  return result;
}

function _foreach(datas, f, dur) {
  if (datas.length == 0) {return;}
  let n = 0;

  function doIt(n) {
    if (n == datas.length) {return;}
    f(datas[n]);
    setTimeout(function() {
      doIt(++n);
    }, dur);
  }
  doIt(n);
}

function _for(i, m, f, dur) {
  if (m < i) {return;}
  let n = 0;

  function doIt(n) {
    if (n == m) {return;}
    f(m);
    setTimeout(function() {
      doIt(++n);
    }, dur);
  }
  doIt(n);
}

/**
 * 生成uuid
 * @param {Object} len 长度
 * @param {Object} radix 进制
 */
function createUUID(len, radix) {
  let chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'.split('');
  let uuid = [];
  let i;
  radix = radix || chars.length;
  if (len) {
    // Compact form
    for (i = 0; i < len; i++) {
      uuid[i] = chars[0 | Math.random() * radix];
    }
  } else {
    // rfc4122, version 4 form
    let r;
    // rfc4122 requires these characters
    uuid[8] = uuid[13] = uuid[18] = uuid[23] = '-';
    uuid[14] = '4';
    // Fill in random data.  At i==19 set the high bits of clock sequence as
    // per rfc4122, sec. 4.1.5
    for (i = 0; i < 36; i++) {
      if (!uuid[i]) {
        r = 0 | Math.random() * 16;
        uuid[i] = chars[(i == 19) ? (r & 0x3) | 0x8 : r];
      }
    }
  }
  return uuid.join('');
}

module.exports = {
  createUUID: createUUID,
  rotatePoint: rotatePoint,
  rotatePoints: rotatePoints,
  getDistance: getDistance,
  getXY: getXY,
  mouseCoords: mouseCoords,
  MessageBus: MessageBus,
  _foreach: _foreach,
  _for: _for
};
