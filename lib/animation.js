/**
 * animation of topo for personal project
 * @author ilex
 */

const Node = require('./node');
const Util = require('./util');

let isStopAll = false;
//gravity
function gravity(node, option) {
  let box = option.context;
  let gravity = option.gravity || 0.1;

  let t = null;
  let effect = {};

  function stop() {
    window.clearInterval(t);
    if (effect.onStop) {
      effect.onStop(node);
    }
    return effect;
  }

  function run() {
    let dx = option.dx || 0,
      dy = option.dy || 2;
    t = setInterval(function() {
      if (isStopAll) {
        effect.stop();
        return;
      }
      dy += gravity;
      if (node.y + node.height < box.canvas.height) {
        node.setLocation(node.x + dx, node.y + dy);
        box.updateView();
      } else {
        dy = 0;
        stop();
      }
    }, 20);
    return effect;
  }

  effect.run = run;
  effect.stop = stop;
  effect.onStop = function(f) {
    effect.onStop = f;
    return effect;
  };
  return effect;
}

//
function rotate(node, option) {
  let box = option.context;
  let t = null;
  let effect = {};
  let v = option.v;

  function run() {
    t = setInterval(function() {
      if (isStopAll) {
        effect.stop();
        return;
      }
      node.rotate += v || 0.2;
      if (node.rotate > 2 * Math.PI) {
        node.rotate = 0;
      }
      box.updateView();
    }, 100);
    return effect;
  }

  function stop() {
    window.clearInterval(t);
    if (effect.onStop) {
      effect.onStop(node);
    }
    return effect;
  }

  effect.run = run;
  effect.stop = stop;
  effect.onStop = function(f) {
    effect.onStop = f;
    return effect;
  };
  return effect;
}

//
function dividedTwoPiece(node, option) {
  let box = option.context;
  // let style = node.style;
  let effect = {};

  function genNode(x, y, r, beginDegree, endDegree) {
    let newNode = new Node();
    newNode.setImage(node.image);
    newNode.setSize(node.width, node.height);
    newNode.setLocation(x, y);
    newNode.draw = function(ctx) {
      ctx.save();
      ctx.arc(this.x + this.width / 2, this.y + this.height / 2, r, beginDegree, endDegree);
      ctx.clip();
      ctx.beginPath();
      if (this.image != null) {
        ctx.drawImage(this.image, this.x, this.y);
      } else {
        ctx.fillStyle = 'rgba(' + this.style.fillStyle + ',' + this.alpha + ')';
        ctx.rect(this.x, this.y, this.width, this.height);
        ctx.fill();
      }
      ctx.closePath();
      ctx.restore();
    };
    return newNode;
  }

  function split(angle, box) {
    let beginDegree = angle;
    let endDegree = angle + Math.PI;

    let node1 = genNode(node.x, node.y, node.width, beginDegree, endDegree);
    let node2 = genNode(node.x - 2 + Math.random() * 4, node.y, node.width, beginDegree + Math.PI, beginDegree);

    node.setVisible(false);

    box.add(node1);
    box.add(node2);
    box.updateView();

    gravity(node1, {
      context: box,
      dx: 0.3
    }).run().onStop(function(n) {
      box.remove(node1);
      box.remove(node2);
      box.updateView();
      effect.stop();
    });
    gravity(node2, {
      context: box,
      dx: -0.2
    }).run();
  }

  function run() {
    split(option.angle, box);
    return effect;
  }

  function stop() {
    if (effect.onStop) {
      effect.onStop(node);
    }
    return effect;
  }

  effect.onStop = function(f) {
    effect.onStop = f;
    return effect;
  };
  effect.run = run;
  effect.stop = stop;
  return effect;
}

function repeatThrow(node, option) {
  let gravity = 0.8;
  // let wind = 2;
  // let angle = 0;
  let box = option.context;
  node.isSelected = function() {
    return false;
  };
  node.isFocus = function() {
    return false;
  };
  node.setDragable(false);

  function initNode(node) {
    node.setVisible(true);
    node.rotate = Math.random();
    let w = box.canvas.width / 2;
    node.x = w + Math.random() * (w - 100) - Math.random() * (w - 100);
    node.y = box.canvas.height;
    node.vx = Math.random() * 5 - Math.random() * 5;
    node.vy = -25;
  }

  let t = null;
  let effect = {};

  function run() {
    initNode(node);
    t = setInterval(function() {
      if (isStopAll) {
        effect.stop();
        return;
      }
      node.vy += gravity;
      node.x += node.vx;
      node.y += node.vy;
      if (node.x < 0 || node.x > box.canvas.width || node.y > box.canvas.height) {
        if (effect.onStop) {
          effect.onStop(node);
        }
        initNode(node);
      }
      box.updateView();
    }, 50);
    return effect;
  }

  function stop() {
    window.clearInterval(t);
  }

  effect.onStop = function(f) {
    effect.onStop = f;
    return effect;
  };
  effect.run = run;
  effect.stop = stop;
  return effect;
}

function stopAll() {
  isStopAll = true;
}

function startAll() {
  isStopAll = false;
}


//cycle
function cycle(node, option) {
  let p1 = option.p1;
  let p2 = option.p2;
  let box = option.context;

  let midX = p1.x + (p2.x - p1.x) / 2;
  let midY = p1.y + (p2.y - p1.y) / 2;
  let r = Util.getDistance(p1, p2) / 2;

  let angle = Math.atan2(midY, midX);
  let speed = option.speed || 0.2;
  let effect = {};
  let t = null;

  function run() {
    t = setInterval(function() {
      if (isStopAll) {
        effect.stop();
        return;
      }
      //let newx = p1.x + midX + Math.cos(angle) * r;
      let newy = p1.y + midX + Math.sin(angle) * r;
      node.setLocation(node.x, newy);
      box.updateView();
      angle += speed;
    }, 100);
    return effect;
  }

  function stop() {
    window.clearInterval(t);
  }

  effect.run = run;
  effect.stop = stop;
  return effect;
}

//move
function move(node, option) {
  let p = option.position;
  let box = option.context;
  let easing = option.easing || 0.2;

  let effect = {};
  let t = null;

  function run() {
    t = setInterval(function() {
      if (isStopAll) {
        effect.stop();
        return;
      }
      let dx = p.x - node.x;
      let dy = p.y - node.y;
      let vx = dx * easing;
      let vy = dy * easing;

      node.x += vx;
      node.y += vy;
      box.updateView();
      if (vx < 0.01 && vy < 0.1) {
        stop();
      }
    }, 100);
    return effect;
  }

  function stop() {
    window.clearInterval(t);
  }
  effect.onStop = function(f) {
    effect.onStop = f;
    return effect;
  };
  effect.run = run;
  effect.stop = stop;
  return effect;
}

//scala
function scala(node, option) {
  // let p = option.position;
  let box = option.context;
  let scala = option.scala || 1;
  let v = 0.06;
  let oldScala = node.scala;

  let effect = {};
  let t = null;

  function run() {
    t = setInterval(function() {
      node.scala += v;

      if (node.scala >= scala) {
        stop();
      }
      box.updateView();
    }, 100);
    return effect;
  }

  function stop() {
    if (effect.onStop) {
      effect.onStop(node);
    }
    node.scala = oldScala;
    window.clearInterval(t);
  }
  effect.onStop = function(f) {
    effect.onStop = f;
    return effect;
  };
  effect.run = run;
  effect.stop = stop;
  return effect;
}

module.exports = {
  gravity: gravity,
  dividedTwoPiece: dividedTwoPiece,
  repeatThrow: repeatThrow,
  rotate: rotate,
  cycle: cycle,
  move: move,
  scala: scala,
  stopAll: stopAll,
  startAll: startAll
};
