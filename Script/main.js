let game;
let scoreWidth;
let levels = [];
let Bubble;
preload();
const bgm = new Audio("./Assets/Sounds/963624.mp3");
let soundVolume = 0.75;
document.body.addEventListener("click", bgmSetup, false);
document.querySelector(".btn.start").addEventListener("click", bgmSetup, false);
function playCollision() {
  const soundCollision = new Audio("./Assets/Sounds/200406.mp3");
  soundCollision.load();
  soundCollision.volume = soundVolume;
  soundCollision.play();
}
function bgmSetup() {
  soundVolume = Number(document.querySelector("input.bgm").value) / 100;
  bgm.loop = true;
  bgm.load();
  bgm.volume = soundVolume;
  bgm.play();
  document.querySelector("input.bgm").addEventListener(
    "input",
    (e) => {
      soundVolume = Number(e.target.value) / 100;
      bgm.volume = soundVolume;
    },
    false
  );
  document.body.removeEventListener("click", bgmSetup);
  document.querySelector(".btn.start").removeEventListener("click", bgmSetup);
}
document.querySelector("a.credit").addEventListener(
  "click",
  () => {
    document.querySelector("div.overlay").classList.toggle("hidden");
  },
  false
);
document.querySelector("div.overlay").addEventListener(
  "click",
  () => {
    document.querySelector("div.overlay").classList.toggle("hidden");
  },
  false
);
const { Bodies, Body, Composite, Engine, Events, Render, Runner, Sleeping } = Matter;

const WIDTH = 680; // 横幅
const HEIGHT = 800; // 高さ
const WALL_T = 15; // 壁の厚さ
const DEADLINE = 790; // ゲームオーバーになる高さ
const FRICTION = 0.28; // 摩擦
const MAX_FRICTION = 20;
const MASS = 1; // 重量
const MAX_MASS = 20;
const RANDOM_RATIO = 8;
const MAX_LEVEL = 10;
const WALL_COLOR = "#f90";
const BUBBLE_COLORS = {
  0: "#ff7f7f",
  1: "#ff7fbf",
  2: "#ff7fff",
  3: "#bf7fff",
  4: "#7f7fff",
  5: "#7fbfff",
  6: "#7fffff",
  7: "#7fffbf",
  8: "#7fff7f",
  9: "#bfff7f",
  10: "#ffff7f",
};
const BUBBLE_TEXTURES = {
  0: ["./Assets/Images/Character/0600.png.webp", 0.16], // Daiyousei
  1: ["./Assets/Images/Character/0601.png.webp", 0.23], // Rumia
  2: ["./Assets/Images/Character/0602.png.webp", 0.305], // Cirno
  3: ["./Assets/Images/Character/0603.png.webp", 0.375], // Meirin
  4: ["./Assets/Images/Character/0604.png.webp", 0.475], // Koakuma
  5: ["./Assets/Images/Character/0605.png.webp", 0.55], // Patchouli
  6: ["./Assets/Images/Character/0606.png.webp", 0.63], // Sakuya
  7: ["./Assets/Images/Character/0607.png.webp", 0.71], // Remilia
  8: ["./Assets/Images/Character/0608.png.webp", 0.79], // Flandre
  9: ["./Assets/Images/Character/0609.png.webp", 0.87], // Marisa
  10: ["./Assets/Images/Character/0610.png.webp", 0.95], // Reimu
};

const OBJECT_CATEGORIES = {
  WALL: 0x0001,
  BUBBLE: 0x0002,
  BUBBLE_PENDING: 0x0004,
};

class BubbeGame {
  engine;
  render;
  runner;
  currentBubble = undefined;
  score;
  scoreChangeCallBack;
  gameover = false;
  defaultX = WIDTH / 2;
  message;
  combo;
  scoreBoardURI;
  scoreBoardSheet;

  constructor(container, message, scoreChangeCallBack) {
    this.message = message;
    this.scoreBoardURI = "https://script.google.com/macros/s/AKfycbxUeoA_v6nLRSlt2jJzCnG4OXt7s4VMDAjmdXhTkq3K7Iqd6JO5XeInswroP3Cu0VWA/exec";
    this.scoreChangeCallBack = scoreChangeCallBack;
    this.engine = Engine.create({
      constraintIterations: 3,
    });
    this.render = Render.create({
      element: container,
      engine: this.engine,
      options: {
        width: WIDTH,
        height: HEIGHT,
        wireframes: false,
        background: "#fff5",
      },
    });
    this.runner = Runner.create();
    Render.run(this.render);
    container.addEventListener("click", this.handleClick.bind(this));
    container.addEventListener("mousemove", this.handleMouseMove.bind(this));
    Events.on(this.engine, "collisionStart", this.handleCollision.bind(this));
    Events.on(this.engine, "afterUpdate", this.checkGameOver.bind(this));
  }

  init(e) {
    while (levels.length != 0) {
      levels.shift();
    }
    levels.push(Math.floor(Math.random() * 5));
    // リセット時も使うので一旦全部消す
    Composite.clear(this.engine.world);
    this.resetMessage();

    // 状態初期化
    this.gameover = false;
    this.setScore(0);
    this.combo = 0;
    this.setCombo(this.combo);

    // 地面と壁作成
    // 矩形の場合X座標、Y座標、横幅、高さの順に指定、最後にオプションを設定できる
    const ground = Bodies.rectangle(WIDTH / 2, HEIGHT - WALL_T / 2, WIDTH, WALL_T, {
      isStatic: true,
      label: "ground",
      render: {
        fillStyle: WALL_COLOR,
      },
    });
    const leftWall = Bodies.rectangle(WALL_T / 2, HEIGHT / 2, WALL_T, HEIGHT, {
      isStatic: true,
      label: "leftWall",
      render: {
        fillStyle: WALL_COLOR,
      },
    });
    const rightWall = Bodies.rectangle(WIDTH - WALL_T / 2, HEIGHT / 2, WALL_T, HEIGHT, {
      isStatic: true,
      label: "rightWall",
      render: {
        fillStyle: WALL_COLOR,
      },
    });
    // 地面と壁を描画
    Composite.add(this.engine.world, [ground, leftWall, rightWall]);
    Runner.run(this.runner, this.engine);

    // ステータスをゲーム準備完了に
    this.gameStatus = "ready";
    // console.log(e);
    if (e) {
      this.start();
    } else {
      this.showReadyMessage();
    }
  }

  start(e) {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    if (this.gameStatus === "ready") {
      document.querySelector(".title").classList.add("hidden");
      this.gameStatus = "canput";
      this.createNewBubble();
      this.resetMessage();
      this.getScoreBoard();
    }
  }

  getScoreBoard() {
    fetch(this.scoreBoardURI, {
      method: "GET",
    })
      .then((r) => r.json())
      .then((data) => {
        console.debug(data);
        this.switchScoreBoard(data.content);
        setInterval(() => {
          this.switchScoreBoard(data.content);
        }, 10000);
      });
  }

  switchScoreBoard(data) {
    const gsapText = (selector, text) => gsap.to(document.querySelector(selector), { duration: duration, text: text, ease: "ease" });
    let duration = 0.2;
    if (this.scoreBoardSheet == 5 || typeof this.scoreBoardSheet != "number") {
      this.scoreBoardSheet = 0;
    }
    let $ = ["nd", "ld", "nm", "lm", "t"][this.scoreBoardSheet],
      $a = ["今日の", "昨日の", "今月の", "先月の", "総合"][this.scoreBoardSheet];
    gsapText(".bottomLeft > .label", $a + "ランキング");
    gsapText(".firstScore", data[$].length > 0 ? data[$][0].score.toLocaleString("en-us") : "-");
    gsapText(".secondScore", data[$].length > 1 ? data[$][1].score.toLocaleString("en-us") : "-");
    gsapText(".thirdScore", data[$].length > 2 ? data[$][2].score.toLocaleString("en-us") : "-");
    gsapText(".firstName", data[$].length > 0 ? data[$][0].uid.split(":")[0] : "---");
    gsapText(".secondName", data[$].length > 1 ? data[$][1].uid.split(":")[0] : "---");
    gsapText(".thirdName", data[$].length > 2 ? data[$][2].uid.split(":")[0] : "---");
    this.scoreBoardSheet++;
  }

  createNewBubble() {
    if (this.gameover) {
      return;
    }
    // バブルの大きさをランダムに決定
    levels.push(Math.floor(Math.random() * 5));
    const level = levels.shift();
    document.querySelector(".next .image").style.backgroundImage = "url(" + BUBBLE_TEXTURES[levels[0]][0] + ")";
    const radius = level * 10 + 20;
    const sprite = BUBBLE_TEXTURES[level]
      ? {
          texture: BUBBLE_TEXTURES[level][0],
          xScale: BUBBLE_TEXTURES[level][1],
          yScale: BUBBLE_TEXTURES[level][1],
        }
      : {};
    // 描画位置のX座標、y座標、円の半径を渡す
    const random = Math.floor(Math.random() * RANDOM_RATIO);
    const currentBubble = Bodies.circle(this.defaultX, 30, radius, {
      isSleeping: true,
      label: "bubble_" + level,
      mass: random == 0 ? MAX_MASS : MASS,
      friction: random == 0 ? MAX_FRICTION : FRICTION,
      collisionFilter: {
        group: 0,
        category: OBJECT_CATEGORIES.BUBBLE_PENDING, // まだ落下位置の決定前なのですでにあるバブルと衝突しないようにする
        mask: OBJECT_CATEGORIES.WALL | OBJECT_CATEGORIES.BUBBLE,
      },
      render: {
        sprite: sprite,
        fillStyle: BUBBLE_COLORS[level],
        lineWidth: 1,
      },
    });
    this.currentBubble = currentBubble;
    Composite.add(this.engine.world, [currentBubble]);
  }

  putCurrentBubble() {
    if (this.currentBubble) {
      Sleeping.set(this.currentBubble, false);
      this.currentBubble.collisionFilter.category = OBJECT_CATEGORIES.BUBBLE;
      this.currentBubble = undefined;
    }
  }

  // ゲームオーバー判定
  // 本家がどうしてるかわからないけど一定以上の高さに上方向の速度を持つオブジェクトが存在している場合ゲームオーバーとする
  checkGameOver() {
    const bubbles = Composite.allBodies(this.engine.world).filter((body) => body.label.startsWith("bubble_"));
    for (const bubble of bubbles) {
      if (bubble.position.y < HEIGHT - DEADLINE && bubble.velocity.y < 0) {
        Runner.stop(this.runner);
        this.gameover = true;
        this.showGameOverMessage();
        break;
      }
    }
  }

  showReadyMessage() {
    // const p = document.createElement("p");
    // p.classList.add("mainText");
    // p.textContent = "バブルゲーム";
    // const p2 = document.createElement("p");
    // p2.classList.add("subText");
    // p2.textContent = "バブルを大きくしよう";
    // const button = document.createElement("button");
    // button.setAttribute("type", "button");
    // button.classList.add("button");
    // button.addEventListener("click", this.start.bind(this));
    // button.innerText = "ゲーム開始";
    // this.message.appendChild(p);
    // this.message.appendChild(p2);
    // this.message.appendChild(button);
    // this.message.style.display = "block";
    document.querySelector(".btn.start").addEventListener("click", this.start.bind(this));
  }

  showGameOverMessage() {
    const p = document.createElement("p");
    p.classList.add("mainText");
    p.textContent = "Game Over";
    const p2 = document.createElement("p");
    p2.classList.add("subText");
    p2.textContent = `Score: ${this.score}`;
    const button = document.createElement("button");
    button.setAttribute("type", "button");
    button.classList.add("button");
    button.addEventListener("click", this.init.bind(this));
    button.innerText = "もう一度";
    this.message.appendChild(p);
    this.message.appendChild(p2);
    this.message.appendChild(button);
    this.message.style.display = "block";
  }

  resetMessage() {
    this.message.replaceChildren();
    this.message.style.display = "none";
  }

  handleClick() {
    if (this.gameover) {
      return;
    }
    if (this.gameStatus === "canput") {
      this.combo = 0;
      this.setCombo(this.combo);
      this.putCurrentBubble();
      this.gameStatus = "interval";
      setTimeout(() => {
        this.createNewBubble();
        this.gameStatus = "canput";
      }, 500);
    }
  }

  handleCollision({ pairs }) {
    for (const pair of pairs) {
      const { bodyA, bodyB } = pair;
      // 既に衝突して消滅済みのバブルについての判定だった場合スキップ
      if (!Composite.get(this.engine.world, bodyA.id, "body") || !Composite.get(this.engine.world, bodyB.id, "body")) {
        continue;
      }
      if (bodyA.label === bodyB.label && bodyA.label.startsWith("bubble_")) {
        const currentBubbleLevel = Number(bodyA.label.substring(7));
        // スコア加算
        this.setScore(this.score + Math.floor(2 ** currentBubbleLevel * (1 + 0.2 * this.combo)));
        this.combo++;
        this.setCombo(this.combo);
        playCollision();
        if (currentBubbleLevel === 10) {
          // 最大サイズの場合新たなバブルは生まれない
          Composite.remove(this.engine.world, [bodyA, bodyB]);
          continue;
        }
        const newLevel = currentBubbleLevel + 1;
        const sprite = BUBBLE_TEXTURES[newLevel]
          ? {
              texture: BUBBLE_TEXTURES[newLevel][0],
              xScale: BUBBLE_TEXTURES[newLevel][1],
              yScale: BUBBLE_TEXTURES[newLevel][1],
            }
          : {};
        const newX = (bodyA.position.x + bodyB.position.x) / 2;
        const newY = (bodyA.position.y + bodyB.position.y) / 2;
        const newRadius = newLevel * 10 + 20;
        const random = Math.floor(Math.random() * RANDOM_RATIO);
        const newBubble = Bodies.circle(newX, newY, newRadius, {
          label: "bubble_" + newLevel,
          mass: random == 0 ? MAX_MASS : MASS,
          friction: random == 0 ? MAX_FRICTION : FRICTION,
          collisionFilter: {
            group: 0,
            category: OBJECT_CATEGORIES.BUBBLE,
            mask: OBJECT_CATEGORIES.WALL | OBJECT_CATEGORIES.BUBBLE,
          },
          render: {
            sprite: sprite,
            fillStyle: BUBBLE_COLORS[newLevel],
            lineWidth: 1,
          },
        });
        Composite.remove(this.engine.world, [bodyA, bodyB]);
        Composite.add(this.engine.world, [newBubble]);
      }
    }
  }

  // 落とすバブルのX位置を移動する
  handleMouseMove(e) {
    if (this.gameStatus !== "canput" || !this.currentBubble) {
      return;
    }
    const { offsetX } = e;
    const currentBubbleRadius = Number(this.currentBubble.label.substring(7)) * 10 + 20;
    const newX = Math.max(Math.min(offsetX, WIDTH - 10 - currentBubbleRadius), 10 + currentBubbleRadius);
    Body.setPosition(this.currentBubble, {
      x: newX,
      y: this.currentBubble.position.y,
    });
    this.defaultX = newX;
  }

  setScore(score) {
    let scoreStr = score.toLocaleString("en-us");
    let scoreArr = [];
    // scoreStr.split("").forEach((e) => {
    //   let el = document.createElement("p");
    //   el.innerText = e;
    //   scoreArr.push(el.outerHTML);
    // });
    this.score = score;
    if (this.scoreChangeCallBack) {
      // this.scoreChangeCallBack(scoreArr.join(""));
      this.scoreChangeCallBack("<p>" + scoreStr + "</p>");
    }
  }

  setCombo(combo) {
    const area = document.querySelector(".score .combo");
    let el = document.createElement("p");
    el.textContent = combo > 1 ? combo + " コンボ !" : " ";
    area.replaceChildren(el);
    setTimeout(() => {
      el.animate({ transform: ["scale(1.2) rotateZ(-10deg)", "scale(1) rotateZ(0deg)"] }, { duration: 400, easing: "linear", fill: "forwards" });
    }, 0);
  }
}

window.onload = () => {
  gsap.registerPlugin(TextPlugin);
  const container = document.querySelector(".container");
  const message = document.querySelector(".message");
  scoreWidth = document.querySelector(".upperLeft").getBoundingClientRect().width - 20;
  const onChangeScore = (val) => {
    const score = document.querySelector(".score .base");
    // score.replaceChildren(val);
    // console.log(val);
    score.innerHTML = val;
    for (let size = 64; score.querySelector("p").scrollWidth > scoreWidth && size > 1; size--) {
      score.style.fontSize = size + "px";
    }
  };
  // とりあえずゲーム作成
  game = new BubbeGame(container, message, onChangeScore);
  Bubble = game;
  // とりあえず初期化する
  game.init();

  const scaleAdjust = (element, container, margin) => {
    let elementSize = 1;
    element = document.querySelector(element);
    container = document.querySelector(container);
    if (element.getBoundingClientRect().height > container.getBoundingClientRect().height - margin && element.getBoundingClientRect().width > container.getBoundingClientRect().width - margin) {
      for (
        let i = 0;
        i < 100 &&
        element.getBoundingClientRect().height > container.getBoundingClientRect().height - margin &&
        element.getBoundingClientRect().width > container.getBoundingClientRect().width - margin;
        i++
      ) {
        elementSize -= 0.01;
        element.style.transform = `scale(${elementSize})`;
      }
    }
  };
  setInterval(() => {
    scaleAdjust(".content", "body", 20);
    scaleAdjust(".main", ".content", 50);
    scaleAdjust(".container > canvas", ".container", 50);
  }, 100);
  // debug
  //game.start();
};
