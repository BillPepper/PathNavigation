import "./styles.css";

const debugElement = document.getElementById("debug");
const canvas = document.getElementById("canvas");
const context = canvas.getContext("2d");
const canvasRes = 500;

canvas.width = canvasRes;
canvas.height = canvasRes;

const debugEnabled = false;
const collisionWidth = 5;

export const getRandom = (min, max) =>
  Math.floor(Math.random() * (max - min) + min);

const text = (x, y, str) => {
  context.font = "12px Arial";
  debugEnabled && context.fillText(str, x, y);
};

const circ = (x, y, r) => {
  context.beginPath();
  context.arc(x, y, r, 0, 2 * Math.PI);
  context.fill();
  context.stroke();
};

const line = (x, y, tx, ty, displayText, renderCenter) => {
  context.beginPath();
  context.moveTo(x, y);
  context.lineTo(tx, ty);
  context.stroke();
  context.fillStyle = "darkgray";
  renderCenter && circ((x + tx) / 2, (y + ty) / 2, 2);
  displayText && debugEnabled && text((x + tx) / 2, (y + ty) / 2, displayText);
};

const rect = (x, y, s, col) => {
  context.beginPath();
  context.rect(x, y, s, s);
  context.fillStyle = col || "#555";
  context.fill();
};

const setDebugText = (text) => {
  debugElement.innerHTML = text;
};

const isInRange = (range, value, comparison) => {
  // plus minus x
  return Math.abs(value - comparison) <= range;
};

const createShip = (name, x, y, speed) => {
  SpaceEntities.push({
    enabled: true,
    selected: false,
    properties: {
      name: name,
      type: "ship",
      size: 5,
      speed: speed
    },
    status: {
      moving: true,
      idle: false,
      radar: true
    },
    position: {
      x: x,
      y: y,
      drawNav: true,
      nav: {
        postArrival: "idle",
        points: [{ x: x, y: y }]
      }
    }
  });
};

const SpaceEntities = [
  {
    enabled: false,
    name: "sun",
    type: "sun",
    moving: false,
    x: 250,
    y: 250,
    size: 20
  },
  {
    enabled: false,
    name: "planet",
    type: "planet",
    moving: true,
    x: 200,
    y: 250,
    size: 10,
    speed: 1,
    drawNav: true,
    nav: [
      { x: 215, y: 215 },
      { x: 250, y: 200 },
      { x: 285, y: 215 },
      { x: 300, y: 250 },
      { x: 285, y: 290 },
      { x: 250, y: 300 },
      { x: 215, y: 290 }
    ]
  }
];

const init = () => {
  // init ships
  createShip("EZ-100", 50, 10, 1);
  createShip("AK-886", 100, 10, 0.8);
  createShip("HG-239", 150, 10, 0.3);
  createShip("SK-945", 200, 10, 1);
  createShip("TT-934", 250, 10, 0.8);
  createShip("UT-223", 300, 10, 0.3);
};

const update = () => {
  try {
    SpaceEntities.forEach((entity) => {
      if (entity.enabled) {
        // Update ship's position
        if (entity.status.moving) {
          if (entity.position.x < entity.position.nav.points[0].x) {
            entity.position.x += entity.properties.speed;
          }
          if (entity.position.x > entity.position.nav.points[0].x) {
            entity.position.x -= entity.properties.speed;
          }
          if (entity.position.y < entity.position.nav.points[0].y) {
            entity.position.y += entity.properties.speed;
          }
          if (entity.position.y > entity.position.nav.points[0].y) {
            entity.position.y -= entity.properties.speed;
          }

          // check for arrival
          if (
            isInRange(
              collisionWidth,
              entity.position.y,
              entity.position.nav.points[0].y
            ) &&
            isInRange(
              collisionWidth,
              entity.position.x,
              entity.position.nav.points[0].x
            )
          ) {
            // remove navPoint from list
            if (entity.position.nav.points.length > 1) {
              entity.position.nav.points = entity.position.nav.points.slice(
                1,
                entity.position.nav.points.length
              );
            } else {
              if (
                !entity.status.idle &&
                entity.position.nav.postArrival === "idle"
              ) {
                console.log(entity.properties.name, "idle");
                entity.status.idle = true;
              }
              if (entity.status.idle) {
                entity.position.nav.points.push({
                  x: getRandom(20, 480),
                  y: getRandom(20, 480)
                });
              } else {
                entity.status.moving = false;
                console.log(entity.properties.name, "i'm out");
              }
            }
          }
        }
      }
    });

    draw();
  } catch (e) {
    console.log(e);
    clearInterval(mainInterval);
  }
};

const draw = () => {
  context.clearRect(0, 0, canvasRes, canvasRes);

  SpaceEntities.forEach((entity) => {
    if (entity.enabled) {
      if (entity.position.drawNav) {
        // render navigation
        let lastNav = undefined;
        entity.position.nav.points.forEach((navPoint, routeIndex) => {
          context.strokeStyle = routeIndex === 0 ? "green" : "pink";
          if (lastNav) {
            line(lastNav.x, lastNav.y, navPoint.x, navPoint.y);
          } else {
            const xDistance = navPoint.x - entity.position.x;
            const yDistance = navPoint.y - entity.position.y;
            const hyph = Math.sqrt(
              xDistance * xDistance + yDistance * yDistance
            );

            line(
              entity.position.x,
              entity.position.y,
              navPoint.x,
              navPoint.y,
              hyph > 0 && Math.round(hyph)
            );

            context.strokeStyle = "gray"; // reset color, helplines are gray anyway
            if (entity.selected) {
              line(
                entity.position.x,
                navPoint.y,
                navPoint.x,
                navPoint.y,
                hyph !== yDistance && yDistance !== 0 && `y: ${yDistance}`
              );
              line(
                entity.position.x,
                entity.position.y,
                entity.position.x,
                navPoint.y,
                yDistance !== xDistance && xDistance !== 0 && `x: ${xDistance}`
              );
            }
          }
          circ(navPoint.x, navPoint.y, 1);

          lastNav = navPoint;
        });
      }

      if (entity.properties.type === "ship") {
        // render ship
        rect(
          entity.position.x - entity.properties.size / 2,
          entity.position.y - entity.properties.size / 2,
          entity.properties.size,
          entity.properties.size
        );
      } else if (entity.properties.type === "planet") {
        circ(entity.position.x, entity.position.y, entity.properties.size);
      } else if (entity.properties.type === "sun") {
        circ(250, 250, 20);
      }
    }
  });
};

init();
const mainInterval = setInterval(() => {
  update();
}, 100);
