//変数定義
const canvas = document.getElementById("gamen");
const ctx = canvas.getContext('2d');
const stars = [];
const myshot = [];
const enemypos = [];
const enshot = [];
const itempos = [];
const bosspos = [];
const movestatus = { u: 0, r: 0, d: 0, l: 0 };
const myimg = new Image();
const myshotimg = new Image();
const enemyimg = [new Image(), new Image(), new Image()];
const itemimg = [new Image(), new Image(), new Image()];
const bossimg = [new Image(), new Image(), new Image()];
const shotwav = new Audio();
const hitwav = new Audio();
const hitwav_boss = new Audio();
const powerupwav = new Audio();
const mypos = { x: canvas.width / 2, y: canvas.height / 1.5 };
const enemypattern = ["00f", "10f", "f01", "210", "305", "41f", "305", "20f", "51f", "205", "405", "205", "405", "205", "405", "205", "405", "205", "00a", "e01",
    "00f", "202", "40a", "302", "502", "60f", "41f", "31f", "11f", "00a", "e01",
    "00f", "502", "302", "502", "302", "502", "302", "502", "302", "502", "602", "502", "602", "502", "602", "502", "602", "502", "602", "502", "602", "502", "602", "502", "602", "502", "602", "502", "602", "502", "302", "502", "302", "502", "302", "502", "302", "502", "302", "502", "302", "502", "302", "502", "302", "502", "302", "502", "302", "502", "302", "502", "302", "502", "302", "502", "302", "502", "302", "502", "302", "502", "302", "502", "302", "502", "302", "502", "302", "502", "302", "502", "302", "502", "302", "00a", "e01", "d01"];
myimg.src = "me.png";
myshotimg.src = "shot.png";
enemyimg[0].src = "enemy1.png";
enemyimg[1].src = "enemy2.png";
itemimg[0].src = "3-way.png";
bossimg[0].src = "boss1.png";
shotwav.src = "shot.wav";
hitwav.src = "hit.wav";
hitwav_boss.src = "hit_boss.wav";
powerupwav.src = "powerup.wav";
let speed_back = 5;
let addEnemy_interval = 0;
let addEnemy_intmax = 20;
let stage = 1;
let level = 5000;
let patternnum = -1;
let pattern = -1;
let patterncount = 0;
let patternmax = 0;
let shotlevel = 0;
let mainloop;
let addenshotfunc;
let space_pressing = false;

//あれこれ
for (let i = 0; i < 100; i++) {
    stars[i] = setStarPosition();
}

//星の位置を設定
function setStarPosition() {
    return { x: Math.random() * canvas.width, y: Math.random() * canvas.height, speed: Math.random() * 5 };
}

//スクロール
function scroll() {
    for (let i = 0; i < 100; i++) {
        stars[i].y += stars[i].speed + speed_back;
        if (stars[i].y > canvas.height) {
            stars[i] = setStarPosition();
            stars[i].y = 0;
        }
        ctx.fillStyle = "#fff";
        ctx.fillRect(stars[i].x, stars[i].y, 2 + stars[i].speed, 2 + stars[i].speed);
    }
}

//自機移動
function mymove() {
    if (movestatus.u !== 0) {
        mypos.y -= (mypos.y > 0) * 10;
    }
    if (movestatus.d !== 0) {
        mypos.y += (mypos.y < canvas.height - 24) * 10;
    }
    if (movestatus.l !== 0) {
        mypos.x -= (mypos.x > 0) * 10;
    }
    if (movestatus.r !== 0) {
        mypos.x += (mypos.x < canvas.width - 24) * 10;
    }
    ctx.drawImage(myimg, mypos.x, mypos.y, 24, 24);

    //弾移動
    myshot.forEach(function (m, num) {
        m.x += m.x1;
        m.y += m.y1;
        ctx.drawImage(myshotimg, m.x, m.y, 24, 24);
        if (m.y < 0) {
            myshot.splice(num, 1);
        }
        enemypos.forEach(function (e) {
            if (Math.abs((m.x + 12) - (e.x + 12)) < 17 && Math.abs((m.y + 12) - (e.y + 12)) < 17 && !e.destroyed) {
                e.strength -= 1;
                myshot.splice(num, 1);
                if (e.strength == 0) {
                    e.destroyed = true;
                    hitwav.currentTime = 0;
                    hitwav.play();
                    if (e.pattern == 15) {
                        additem(0, e.x, e.y);
                    }
                } else {
                    hitwav_boss.currentTime = 0;
                    hitwav_boss.play();
                }
            }
        });
        bosspos.forEach(function (e) {
            if (Math.abs((e.x + 56) - (m.x + 12)) < 56 && Math.abs((e.y + 56) - (m.y + 12)) < 56 && !e.destroyed) {
                e.damage += 1;
                myshot.splice(num, 1);
                hitwav_boss.currentTime = 0;
                hitwav_boss.play();
                if (e.damage == 50) {
                    e.destroyed = true;
                }
            }
        });
    });
}

//キー入力時
function onkeydown(key) {
    switch (key.key) {
        case "ArrowUp":
            movestatus.u = -1;
            break;
        case "ArrowLeft":
            movestatus.l = 1;
            break;
        case "ArrowDown":
            movestatus.d = 1;
            break;
        case "ArrowRight":
            movestatus.r = -1;
            break;
        case " ":
            if (!space_pressing) {
                myshot.push({ x: mypos.x, y: mypos.y - 32, x1: 0, y1: -15 });
                if (shotlevel == 1) {
                    myshot.push({ x: mypos.x, y: mypos.y - 32, x1: -5, y1: -15 });
                    myshot.push({ x: mypos.x, y: mypos.y - 32, x1: 5, y1: -15 });
                }
                shotwav.currentTime = 0;
                shotwav.play();
                space_pressing = true;
            }
            break;
    }
}

//キー入力ストップ時
function onkeyup(key) {
    switch (key.key) {
        case "ArrowUp":
            movestatus.u = 0;
            break;
        case "ArrowLeft":
            movestatus.l = 0;
            break;
        case "ArrowDown":
            movestatus.d = 0;
            break;
        case "ArrowRight":
            movestatus.r = 0;
            break;
        case " ":
            space_pressing = false;
            break;
    }
}

//敵追加
function addenemy() {
    if (patterncount == 0) {
        patterncount = 1;
        patternnum += 1;
        pattern = parseInt(enemypattern[patternnum].substr(0, 1), 16);
        patternmax = parseInt(enemypattern[patternnum].substr(1, 2), 16);
        console.log(pattern, patternnum, patternmax, enemypattern[patternnum].substr(1, 2))
    }
    switch (pattern) {
        case 0:
            addEnemy_intmax = 10;
            break;
        case 1:
            enemypos.push({ x: canvas.width / 2, y: 0, x2: 0, y2: 0, destroyed: false, boomcount: 0, pattern: 1, strength: 1 });
            addEnemy_intmax = 10;
            break;
        case 2:
            enemypos.push({ x: canvas.width * Math.random(), y: 0, x2: 0, y2: 0, destroyed: false, boomcount: 0, pattern: 2, strength: 1 });
            addEnemy_intmax = 20;
            break;
        case 3:
            enemypos.push({ x: 0, y: 0, x2: 1, y2: 0, destroyed: false, boomcount: 0, pattern: 3, strength: 1 });
            enemypos.push({ x: canvas.width, y: 0, x2: -1, y2: 0, destroyed: false, boomcount: 0, pattern: 3, strength: 1 });
            addEnemy_intmax = 5;
            break;
        case 4:
            enemypos.push({ x: canvas.width * Math.random(), y: 0, x2: Math.random() * 8 - 4, y2: 0, destroyed: false, boomcount: 0, pattern: 4, strength: 2 });
            addEnemy_intmax = 10;
            break;
        case 5:
            const a = Math.random() * 20 - 10;
            enemypos.push({ x: canvas.width * Math.random(), y: 0, x2: a, y2: (a > 0) ? 1 : 0, destroyed: false, boomcount: 0, pattern: 5, strength: 3 });
            addEnemy_intmax = 10;
            break;
        case 6:
            enemypos.push({ x: canvas.width * Math.random(), y: 0, x2: 0, y2: 0, destroyed: false, boomcount: 0, pattern: 6, strength: 5 });
            addEnemy_intmax = 30;
            break;
        case 13:
            patternnum = -1;
            pattern = -1;
            patterncount = 0;
            patternmax = 0;
            addEnemy_interval = 0;
            addEnemy_intmax = 1;
            clearInterval(addenshotfunc);
            if (level > 100) {
                level -= 500;
            }
            addenshotfunc = setInterval(addenshot, level);
            break;
        case 14:
            addboss();
            break;
        case 15:
            const b = canvas.width * Math.random();
            enemypos.push({ x: b, y: 0, x2: (mypos.x > b) ? 3 : -3, y2: 0, destroyed: false, boomcount: 0, pattern: 15, strength: 2 });
            addEnemy_intmax = 10;
            break;
    }
    patterncount += 1;
    if (patterncount > patternmax) {
        patterncount = 0;
    }
}

//敵移動
function moveenemy() {
    enemypos.forEach(function (e, num) {
        if (e.destroyed) {
            for (let i = 0; i < 4; i++) {
                ctx.beginPath();
                ctx.fillStyle = `rgb(${Math.random() * 256}, ${Math.random() * 256}, ${Math.random() * 256})`;
                ctx.arc(e.x + 16 - Math.random() * 32, e.y + 16 - Math.random() * 32, 12, 0, 2 * Math.PI);
                ctx.fill();
                ctx.closePath();
            }
            e.boomcount += 1;
            if (e.boomcount == 20) {
                enemypos.splice(num, 1);
            }
        } else {
            switch (e.pattern) {
                case 1:
                    e.x += 0;
                    e.y += 10;
                    break;
                case 2:
                    e.x += 0;
                    e.y += 5;
                    break;
                case 3:
                    if (e.x2 == 1) {
                        e.x += 15;
                    } else {
                        e.x -= 15;
                    }
                    if (e.x < 0) {
                        e.x2 = 1;
                    }
                    if (e.x > canvas.width) {
                        e.x2 = -1;
                    }
                    e.y += 8;
                    break;
                case 4:
                    e.y2 += 1;
                    if (e.y2 == 20) {
                        e.x2 = Math.random() * 8 - 4;
                    }
                    if (e.y2 == 40) {
                        e.y2 = 0;
                    }
                    if (e.y2 < 20) {
                        e.y += 8;
                    } else {
                        e.x += ((e.x2 < 0) ? -5 : 5);
                        e.y += 3;
                    }
                    break;
                case 5:
                    e.x += e.x2;
                    if (e.y2 == 1) {
                        e.x2 += 1;
                        if (e.x2 > 10) {
                            e.y2 = 0;
                        }
                    } else {
                        e.x2 -= 1;
                        if (e.x2 < -10) {
                            e.y2 = 1;
                        }
                    }
                    e.y += 6;
                    break;
                case 6:
                    if (e.y2 == 0) {
                        e.x += (mypos.x > e.x) ? 5 : -5;
                        if (Math.abs((mypos.x + 12) - (e.x + 12)) < 16) {
                            e.y2 = 20;
                        }
                    }
                    e.y += e.y2;
                    break;
                case 15:
                    e.x += e.x2;
                    e.y += 5;
                    break;
            }
            if (e.y > canvas.height) {
                enemypos.splice(num, 1);
            }
            ctx.drawImage(enemyimg[0 + (e.pattern == 15)], e.x, e.y, 24, 24);
            if (Math.abs((e.x + 12) - (mypos.x + 12)) < 12 && Math.abs((e.y + 12) - (mypos.y + 12)) < 12) {
                clearInterval(mainloop);
            }
        }
    });
}

//敵弾追加
function addenshot() {
    if (enemypos.length == 0) {
        return;
    }
    const enemynum = Math.trunc(Math.random() * enemypos.length);
    const shotpos = enemypos[enemynum];
    if (shotpos.destroyed) {
        return;
    }
    let movex = (mypos.x - shotpos.x) / 40;
    let movey = (mypos.y - shotpos.y) / 40;
    if (Math.abs(movex) > 6 || Math.abs(movey) > 6) {
        while (!(Math.abs(movex) < 6 && Math.abs(movey) < 6)) {
            movex = movex / 2;
            movey = movey / 2;
        }
    }
    while (Math.abs(movex) < 6 && Math.abs(movey) < 6) {
        movex = movex * 1.1;
        movey = movey * 1.1;
    }
    enshot.push({ x: shotpos.x, y: shotpos.y, movex: movex, movey: movey });
}

//敵弾移動
function moveenshot() {
    enshot.forEach((pos, num) => {
        pos.x += pos.movex;
        pos.y += pos.movey;
        ctx.fillStyle = `rgb(${Math.random() * 255}, ${Math.random() * 255}, ${Math.random() * 255})`;
        ctx.fillRect(pos.x, pos.y, 10, 10);
        if (pos.x < 0 || pos.x > canvas.width || pos.y < 0 || pos.y > canvas.height) enshot.splice(num, 1);
        if (Math.abs((mypos.x + 10) - (pos.x + 4)) < 10 && Math.abs((mypos.y + 10) - (pos.y + 4)) < 10) {
            clearInterval(mainloop);
        }
    });
}

//ボス追加
function addboss() {
    bosspos.push({ x: canvas.width / 2 - 100, y: -100, x1: 19, y1: 10, x2: 1, y2: 1, damage: 0, attack_interval: 0, shutsugen: true, destroyed: false, boomcount: 0 });
    addEnemy_intmax = -1;
}

//ボス移動
function moveboss() {
    bosspos.forEach(function (e, num) {
        if (e.destroyed) {
            for (let i = 0; i < 4; i++) {
                ctx.beginPath();
                ctx.fillStyle = `rgb(${Math.random() * 256}, ${Math.random() * 256}, ${Math.random() * 256})`;
                ctx.arc(e.x + Math.random() * 112, e.y + Math.random() * 112, 12, 0, 2 * Math.PI);
                ctx.fill();
                ctx.closePath();
            }
            e.boomcount += 1;
            if (e.boomcount == 200) {
                bosspos.splice(num, 1);
                addEnemy_interval = 0;
                addEnemy_intmax = 1;
            }
        } else {
            if (e.y < 20 && e.shutsugen) {
                e.y += 3;
            } else {
                e.shutsugen = false;
                e.x += e.x1;
                e.x1 += (e.x2 == 1) ? 1 : -1;
                if (e.x1 == 20) {
                    e.x2 = 0;
                }
                if (e.x1 == -20) {
                    e.x2 = 1;
                }
                e.y += e.y1;
                e.y1 += (e.y2 == 1) ? 0.5 : -0.5;
                if (e.y1 > 10) {
                    e.y2 = 0;
                }
                if (e.y1 < -10) {
                    e.y2 = 1;
                }
                e.attack_interval += 1;
                if (e.attack_interval % 10 == 0) {
                    enshot.push({ x: e.x + 56, y: e.y + 56, movex: 0, movey: 12 });
                    enshot.push({ x: e.x + 168, y: e.y + 56, movex: 0, movey: 12 });
                    enshot.push({ x: e.x + 56, y: e.y + 61, movex: 0, movey: 12 });
                    enshot.push({ x: e.x + 168, y: e.y + 61, movex: 0, movey: 12 });
                }
                if ((e.attack_interval % (level / 100)) == 0) {
                    let movex = (mypos.x - e.x) / 40;
                    let movey = (mypos.y - e.y) / 40;
                    if (Math.abs(movex) > 6 || Math.abs(movey) > 6) {
                        while (!(Math.abs(movex) < 6 && Math.abs(movey) < 6)) {
                            movex = movex / 2;
                            movey = movey / 2;
                        }
                    }
                    while (Math.abs(movex) < 6 && Math.abs(movey) < 6) {
                        movex = movex * 1.1;
                        movey = movey * 1.1;
                    }
                    enshot.push({ x: e.x, y: e.y, movex: movex, movey: movey });
                }
            }
            ctx.drawImage(bossimg[0], e.x, e.y, 112, 112);
        }
    });
}

//アイテム追加
function additem(num, x, y) {
    itempos.push({ x: x, y: y, num: num });
}

//アイテム移動
function moveitem() {
    itempos.forEach(function (e, num) {
        e.y += 5;
        if (e.y > canvas.height) {
            itempos.splice(num, 1);
        }
        ctx.drawImage(itemimg[e.num], e.x, e.y, 24, 24);
        if (Math.abs((mypos.x + 12) - (e.x + 12)) < 20 && Math.abs((mypos.y + 12) - (e.y + 12)) < 20) {
            itempos.splice(num, 1);
            shotlevel = e.num + 1;
            powerupwav.currentTime = 0;
            powerupwav.play();
        }
    });
}

//メイン
function main() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    scroll();
    mymove();
    moveenemy();
    moveenshot();
    moveitem();
    moveboss();
    addEnemy_interval += 1;
    if (addEnemy_interval == addEnemy_intmax) {
        addenemy();
        addEnemy_interval = 1;
    }
}

mainloop = setInterval(main, 20);
addenshotfunc = setInterval(addenshot, level);
window.addEventListener("keydown", function (e) { onkeydown(e) });
window.addEventListener("keyup", function (e) { onkeyup(e) });