import "./styles.css";

const canvas = document.getElementById("canvas");
const context = canvas.getContext("2d");
const canvasRes = 500;

canvas.width = canvasRes;
canvas.height = canvasRes;

const debugEnabled = false;

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
  displayText && text((x + tx) / 2, (y + ty) / 2, displayText);
};

const rect = (x, y, s, col) => {
  context.beginPath();
  context.rect(x, y, s, s);
  context.fillStyle = col || "#555";
  context.fill();
};

const SpaceEntities = [
  {
    enabled: true,
    selected: true,
    properties: {
      name: "EZ-100",
      type: "ship",
      size: 10,
      speed: 1
    },
    status: {
      moving: true,
      idle: false
    },
    position: {
      x: 10,
      y: 10,
      drawNav: true,
      nav: {
        postArrival: "idle",
        points: [{ x: 40, y: 40 }]
      }
    }
  },
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

const update = () => {
  try {
    SpaceEntities.forEach((entity) => {
      if (entity.enabled) {
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

          if (
            entity.position.y === entity.position.nav.points[0].y &&
            entity.position.x === entity.position.nav.points[0].x
          ) {
            if (entity.position.nav.points.length > 1) {
              entity.position.nav.points = entity.position.nav.points.slice(
                1,
                entity.position.nav.points.length
              );
            } else {
              console.log(entity.properties.name, "no nav points left");
              if (
                !entity.status.idle &&
                entity.position.nav.postArrival === "idle"
              ) {
                console.log(entity.properties.name, "idle");
                entity.status.idle = true;
              }
              if (entity.status.idle) {
                entity.position.nav.points.push({
                  x: getRandom(100, 300),
                  y: getRandom(100, 300)
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
    console.log("error in update, killing main thread", e);
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
          context.strokeStyle = routeIndex === 0 ? "green" : "gray";
          if (lastNav) {
            line(lastNav.x, lastNav.y, navPoint.x, navPoint.y);
          } else {
            const xDistance = navPoint.x - entity.x;
            const yDistance = navPoint.y - entity.y;
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
                entity.x,
                navPoint.y,
                navPoint.x,
                navPoint.y,
                hyph !== yDistance && yDistance !== 0 && `y: ${yDistance}`
              );
              line(
                entity.x,
                entity.y,
                entity.x,
                navPoint.y,
                yDistance !== xDistance && xDistance !== 0 && `x: ${xDistance}`
              );
            }
          }
          circ(navPoint.x, navPoint.y, 3);

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

const mainInterval = setInterval(() => {
  update();
}, 100);
