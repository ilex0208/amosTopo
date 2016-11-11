/**
 * Layout of topo for personal project
 *
 * @returns Layout
 * @author ilex
 */

function getStarPositions(x, y, count, radius, beginDegree, endDegree) {
  let start = beginDegree ? beginDegree : 0;
  let end = endDegree ? endDegree : 2 * Math.PI;
  let total = end - start;
  let degree = total / count;
  let result = [];

  start += degree / 2;
  for (let i = start; i <= end; i += degree) {
    let dx = x + Math.cos(i) * radius;
    let dy = y + Math.sin(i) * radius;
    result.push({
      x: dx,
      y: dy
    });
  }
  return result;
}

function getTreePositions(x, y, count, horizontal, vertical, dir) {
  let direction = dir || 'bottom';
  let result = [];

  if (direction == 'bottom') {
    let bstart = x - (count / 2) * horizontal + horizontal / 2;
    for (let b = 0; b <= count; b++) {
      result.push({
        x: bstart + b * horizontal,
        y: y + vertical
      });
    }
  } else if (direction == 'top') {
    let tstart = x - (count / 2) * horizontal + horizontal / 2;
    for (let t = 0; t <= count; t++) {
      result.push({
        x: tstart + t * horizontal,
        y: y - vertical
      });
    }
  } else if (direction == 'right') {
    let rstart = y - (count / 2) * horizontal + horizontal / 2;
    for (let r = 0; r <= count; r++) {
      result.push({
        x: x + vertical,
        y: rstart + r * horizontal
      });
    }
  } else if (direction == 'left') {
    let lstart = y - (count / 2) * horizontal + horizontal / 2;
    for (let l = 0; l <= count; l++) {
      result.push({
        x: x - vertical,
        y: lstart + l * horizontal
      });
    }
  }
  return result;
}

function getBusPositions(x, y, count, r, vertical, dir) {
  let direction = dir || 'horizontal'; //vertical
  let result = [];
  let mid = Math.round(count / 2);
  let startx = x + r;

  if (direction == 'horizontal') {
    for (let i = 0; i < mid; i++) {
      result.push({
        x: startx + i * r,
        y: y - vertical
      });
    }
    for (let j = mid; j <= count; j++) {
      result.push({
        x: startx + j * r,
        y: y + vertical
      });
    }
  } else if (direction == 'vertical') {
    console.log('vertical');
  }
  return result;
}

module.exports = {
  getStarPositions: getStarPositions,
  getTreePositions: getTreePositions,
  getBusPositions: getBusPositions
};
