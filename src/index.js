import "./styles.css";

const canvas = document.getElementById("canvas");
const context = canvas.getContext("2d");
const canvasRes = 500;

canvas.width = canvasRes;
canvas.height = canvasRes;

export const getRandom = (min, max) =>
  Math.floor(Math.random() * (max - min) + min);

const text = (x, y, str) => {
  context.font = "12px Arial";
  context.fillText(str, x, y);
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
  // renderDesc && text((x-tx) / 2, (y-ty) / 2);
  context.stroke();
  context.fillStyle = "darkgray";
  renderCenter && circ((x + tx) / 2, (y + ty) / 2, 2);
  displayText && text((x + tx) / 2, (y + ty) / 2, displayText);
};

const rect = (x, y, s) => {
  context.beginPath();
  context.rect(x, y, s, s);
  context.fillStyle = "#555";
  context.fill();
};

const SpaceEntities = [
  {
    enabled: true,
    name: "ship1",
    type: "ship",
    moving: true,
    idle: true,
    x: 10,
    y: 10,
    size: 10,
    speed: 1,
    target: { x: 0, y: 0 },
    drawNav: true,
    nav: [
      { x: 40, y: 40 }
      // { x: 250, y: 125, r: 20 },
      // { x: 320, y: 170, r: 20 },
      // { x: 350, y: 250, r: 20 },
      // { x: 300, y: 290, r: 20 },
      // { x: 250, y: 375, r: 20 }
    ]
  },
  {
    enabled: true,
    name: "ship2",
    type: "ship",
    moving: true,
    idle: true,
    x: 300,
    y: 300,
    size: 10,
    speed: 1,
    target: { x: 0, y: 0 },
    drawNav: false,
    nav: [{ x: 0, y: 0 }]
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
    persitentNav: false, // needs handling of nav order otherwise confusion...
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
        if (entity.moving) {
          if (entity.x < entity.nav[0].x) {
            entity.x += entity.speed;
          }
          if (entity.x > entity.nav[0].x) {
            entity.x -= entity.speed;
          }
          if (entity.y < entity.nav[0].y) {
            entity.y += entity.speed;
          }
          if (entity.y > entity.nav[0].y) {
            entity.y -= entity.speed;
          }

          if (entity.y === entity.nav[0].y && entity.x === entity.nav[0].x) {
            console.log("arrived nav point");
            if (entity.nav.length > 1 && !entity.persitentNav) {
              entity.nav = entity.nav.slice(1, entity.nav.length);
            } else {
              console.log(entity.name, "no nav points left");
              if (entity.idle) {
                console.log(entity.name, "start idle movement");
                entity.nav.push({
                  x: getRandom(100, 300),
                  y: getRandom(100, 300)
                });
              } else {
                entity.moving = false;
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
      if (entity.drawNav) {
        // render navigation
        let lastNav = undefined;
        entity.nav.forEach((navPoint, routeIndex) => {
          context.strokeStyle = routeIndex === 0 && "#00ff00";
          if (lastNav) {
            line(lastNav.x, lastNav.y, navPoint.x, navPoint.y);
          } else {
            const xDistance = navPoint.x - entity.x;
            const yDistance = navPoint.y - entity.y;
            const hyph = Math.sqrt(
              xDistance * xDistance + yDistance * yDistance
            );

            line(
              entity.x,
              entity.y,
              navPoint.x,
              navPoint.y,
              hyph > 0 && Math.round(hyph)
            );
            context.strokeStyle = "gray";

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
          circ(navPoint.x, navPoint.y, 3);

          lastNav = navPoint;
        });
      }

      if (entity.type === "ship") {
        // render ship
        rect(
          entity.x - entity.size / 2,
          entity.y - entity.size / 2,
          entity.size,
          entity.size
        );
      } else if (entity.type === "planet") {
        circ(entity.x, entity.y, entity.size);
      } else if (entity.type === "sun") {
        // render sun
        context.strokeStyle = "#ff00ff";
        circ(250, 250, 20);
      }
    }
  });

  // Grid
  // line(0, 250, 500, 250);
  // line(250, 0, 250, 500);
};

const mainInterval = setInterval(() => {
  update();
}, 100);
