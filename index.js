(function (window, document) {
    'use strict';
    if (typeof window.CustomEvent !== 'function') {
        window.CustomEvent = function (event, params) {
            params = params || { bubbles: false, cancelable: false, detail: undefined };
            var evt = document.createEvent('CustomEvent');
            evt.initCustomEvent(event, params.bubbles, params.cancelable, params.detail);
            return evt;
        };
        window.CustomEvent.prototype = window.Event.prototype;
    }
    document.addEventListener('touchstart', handleTouchStart, false);
    document.addEventListener('touchmove', handleTouchMove, false);
    document.addEventListener('touchend', handleTouchEnd, false);
    var xDown = null;
    var yDown = null;
    var xDiff = null;
    var yDiff = null;
    var timeDown = null;
    var startEl = null;
    function handleTouchEnd(e) {
        if (startEl !== e.target) return;
        var swipeThreshold = parseInt(getNearestAttribute(startEl, 'data-swipe-threshold', '20'), 10);
        var swipeTimeout = parseInt(getNearestAttribute(startEl, 'data-swipe-timeout', '500'), 10);
        var timeDiff = Date.now() - timeDown;
        var eventType = '';
        var changedTouches = e.changedTouches || e.touches || [];

        if (Math.abs(xDiff) > Math.abs(yDiff)) {
            if (Math.abs(xDiff) > swipeThreshold && timeDiff < swipeTimeout) {
                if (xDiff > 0) {
                    eventType = 'swiped-left';
                }
                else {
                    eventType = 'swiped-right';
                }
            }
        }
        else if (Math.abs(yDiff) > swipeThreshold && timeDiff < swipeTimeout) {
            if (yDiff > 0) {
                eventType = 'swiped-up';
            }
            else {
                eventType = 'swiped-down';
            }
        }
        if (eventType !== '') {
            var eventData = {
                dir: eventType.replace(/swiped-/, ''),
                xStart: parseInt(xDown, 10),
                xEnd: parseInt((changedTouches[0] || {}).clientX || -1, 10),
                yStart: parseInt(yDown, 10),
                yEnd: parseInt((changedTouches[0] || {}).clientY || -1, 10)
            };
            startEl.dispatchEvent(new CustomEvent('swiped', { bubbles: true, cancelable: true, detail: eventData }));
            startEl.dispatchEvent(new CustomEvent(eventType, { bubbles: true, cancelable: true, detail: eventData }));
        }
        xDown = null;
        yDown = null;
        timeDown = null;
    }
    function handleTouchStart(e) {
        if (e.target.getAttribute('data-swipe-ignore') === 'true') return;

        startEl = e.target;

        timeDown = Date.now();
        xDown = e.touches[0].clientX;
        yDown = e.touches[0].clientY;
        xDiff = 0;
        yDiff = 0;
    }
    function handleTouchMove(e) {
        if (!xDown || !yDown) return;
        var xUp = e.touches[0].clientX;
        var yUp = e.touches[0].clientY;

        xDiff = xDown - xUp;
        yDiff = yDown - yUp;
    }
    function getNearestAttribute(el, attributeName, defaultValue) {
        while (el && el !== document.documentElement) {

            var attributeValue = el.getAttribute(attributeName);

            if (attributeValue) {
                return attributeValue;
            }
            el = el.parentNode;
        }
        return defaultValue;
    }

}(window, document));


var speed = 5;
var t=false,number=25,touchstarted=false,wallInput,lastBoxTouched=[],game,board,body,layer,inputLayer,snake = [[5,10],[4,10],[3,10],[2,10]],currentDirection="right",dirCheck = [[-1,0],[1,0],[0,1],[0,-1]],lastDir="right",buttonsClicked=[],apple=[],lost=false,score=0,currentLevel=0;
var directions = {
    "left": [-1,0,"right"],
    "right": [1,0,"left"],
    "down": [0,1,"up"],
    "up": [0,-1,"down"]
}
var walls = {
    0: [],
    1: [
        [4,0],[4,1],[4,2],[4,3],[4,4],[4,5],[4,6],[4,7],[4,8],
        [4,12],[4,13],[4,14],[4,15],[4,16],[4,17],[4,18],[4,19],[4,20],[4,21],
        [12,6],[12,7],[12,8],[12,9],[12,10],[12,11],[12,12],[12,13],[12,14],[12,15],[12,16],[12,17],[12,18],
        [20,0],[20,1],[20,2],[20,3],[20,4],[20,5],[20,6],[20,7],[20,8],
        [20,12],[20,13],[20,14],[20,15],[20,16],[20,17],[20,18],[20,19],[20,20],[20,21]
    ],
    2: [
        [0,5],[1,5],[2,5],[3,5],[4,5],[5,5],[6,5],[7,5],[8,5],[8,6],[8,7],[8,8],[8,9],
        [12,4],[12,3],[12,2],[12,1],[12,0],
        [24,5],[23,5],[22,5],[21,5],[20,5],[19,5],[18,5],[17,5],[16,5],[16,6],[16,7],[16,8],[16,9],
        [12,8],[12,9],[12,10],[12,11],[12,12],[12,13],[12,14],[12,15],[12,16],[12,17],[12,18],
        [4,19],[5,19],[6,19],[7,19],[8,19],[9,19],[10,19],[11,19],[12,19],[13,19],[14,19],[15,19],[16,19],[17,19],[18,19],[19,19],[20,19]
    ],
    3: [
        [4,12],[5,12],[6,12],[7,12],[8,12],[9,12],[10,12],[11,12],[12,12],[13,12],[14,12],[15,12],[16,12],[17,12],[18,12],[19,12],[20,12],
        [12,4],[12,5],[12,6],[12,7],[12,8],[12,9],[12,10],[12,11],[12,13],[12,14],[12,15],[12,16],[12,17],[12,18],[12,19],[12,20],
        [8,2],[8,3],[8,4],[8,5],[8,6],[8,7],[8,8],[7,8],[6,8],[5,8],[4,8],[3,8],[2,8],
        [22,8],[21,8],[20,8],[19,8],[18,8],[17,8],[16,8],[16,7],[16,6],[16,5],[16,4],[16,3],[16,2],
        [8,22],[8,21],[8,20],[8,19],[8,18],[8,17],[8,16],[7,16],[6,16],[5,16],[4,16],[3,16],[2,16],
        [16,22],[16,21],[16,20],[16,19],[16,18],[16,17],[16,16],[17,16],[18,16],[19,16],[20,16],[21,16],[22,16],
    ],
    4: [
        [5,0],[5,1],[5,2],[5,3],[5,4],[5,5],[5,6],[5,7],[5,8],
        [10,11],[10,10],[10,9],[10,8],[10,7],[10,6],[10,5],[10,4],[10,3],
        [15,0],[15,1],[15,2],[15,3],[15,4],[15,5],[15,6],[15,7],[15,8],
        [20,11],[20,10],[20,9],[20,8],[20,7],[20,6],[20,5],[20,4],[20,3],
        [0,12],[1,12],[2,12],[3,12],[4,12],[5,12],[6,12],[7,12],[8,12],[9,12],[10,12],[11,12],[12,12],[13,12],[14,12],[15,12],[16,12],[17,12],[18,12],[19,12],[20,12],
        [20,13],[20,14],[20,15],[20,16],[20,17],[20,18],[20,19],[20,20],[20,21],
        [15,24],[15,23],[15,22],[15,21],[15,20],[15,19],[15,18],[15,17],[15,16],
        [10,13],[10,14],[10,15],[10,16],[10,17],[10,18],[10,19],[10,20],[10,21],
        [5,24],[5,23],[5,22],[5,21],[5,20],[5,19],[5,18],[5,17],[5,16],
    ],
    5: [
        
    ]
}

window.onload = function() {
    game = document.getElementById("game");
    board = document.getElementById("board");
    body = document.getElementsByTagName("body")[0];
    layer = document.getElementById("layer");
    inputLayer = document.getElementById("input-layer");
    wallInput = document.getElementById("wall-input");

    board.style.height = board.style.width = Math.min(body.offsetHeight, body.offsetWidth)-25 + "px";
    wallInput.style.height = wallInput.style.width = Math.min(body.offsetHeight, body.offsetWidth)-10 + "px";
    for (let i = 1; i < number; i++) {
        board.innerHTML+=`<div class = "grid" style="height:100%;left:${i*100/number}%;width:1px;"></div>
                          <div class = "grid" style="width:100%;top:${i*100/number}%;height:1px;"></div>`;
        wallInput.innerHTML+=`<div class = "grid" style="height:100%;left:${i*100/number}%;width:1px;"></div>
                          <div class = "grid" style="width:100%;top:${i*100/number}%;height:1px;"></div>`;
    }

    // SWIPE EVENT (USING THE IMPORTED CODE SNIPPET IN THE FIRST 95 LINES)
    game.addEventListener('swiped-left', function() {
        if (currentDirection != "right") {currentDirection="left";}
        buttonsClicked.push(currentDirection);
    });
    game.addEventListener('swiped-right', function() {
        if (currentDirection != "left") {currentDirection="right";}
        buttonsClicked.push(currentDirection);
    });
    game.addEventListener('swiped-up', function() {
        if (currentDirection != "down") {currentDirection="up";}
        buttonsClicked.push(currentDirection);
    });
    game.addEventListener('swiped-down', function() {
        if (currentDirection != "up") {currentDirection="down";}
        buttonsClicked.push(currentDirection);
    });

    // CUSTOM LEVEL FOR LAPTOP
    document.getElementById("input-layer").addEventListener("mousedown",function(e) {
        touchstarted=true;
        WallInput(e.clientX,e.clientY);
    });
    document.getElementById("input-layer").addEventListener("mousemove", function(e) {
        if (touchstarted) {
            WallInput(e.clientX,e.clientY);
        }
    });
    document.getElementById("input-layer").addEventListener("mouseup", function(e) {
        WallInput(e.clientX, e.clientY);
        touchstarted=false;
    });
    document.getElementById("input-layer").addEventListener("mouseleave", function(e) {
        touchstarted=false;
    });

    // CUSTOM LEVEL FOR MOBILES
    document.getElementById("input-layer").addEventListener("touchstart",function(e) {
        touchstarted=true;
        if (e.clientX == undefined) {
            WallInput(e.touches[0].clientX,e.touches[0].clientY);
        }
        else {
            WallInput(e.clientX, e.clientY);
        }
    });
    document.getElementById("input-layer").addEventListener("touchmove", function(e) {
        if (touchstarted) {
            if (e.clientX == undefined) {
                WallInput(e.touches[0].clientX,e.touches[0].clientY);
            }
            else {
                WallInput(e.clientX, e.clientY);
            }
        }
    });
    document.getElementById("input-layer").addEventListener("touchend", function(e) {
        touchstarted=false;
    });
    document.getElementById("input-layer").addEventListener("touchleave", function(e) {
        touchstarted=false;
    });
    document.getElementById("loading").style.display = "none";
    ShowRules();
}

window.ShowRules = function() {
    document.getElementById("rules-page").style.display = "block";
    document.getElementById("rules-page").style.opacity = "1";
}

window.HideRules = function() {
    document.getElementById("rules-page").style.display = "none";
    document.getElementById("rules-page").style.opacity = "0";
}

window.WallInput = function(x,y) {
    x -= document.getElementById("wall-input").offsetLeft;
    y -= document.getElementById("wall-input").offsetTop;
    x = Math.floor(x*number/document.getElementById("wall-input").offsetHeight);
    y = Math.floor(y*number/document.getElementById("wall-input").offsetWidth);
    if (Index(walls[5],[x,y]) == -1) {
        walls[5].push([x,y]);
        document.getElementById("boxes-div").innerHTML += `<div class = "boxes" style = "left:${x*100/number}%;top:${y*100/number}%;"></div>`;
    }
}

window.ClearWalls = function() {
    document.getElementById("boxes-div").innerHTML = "";
    walls[5]=[];
}

window.DoneWalls = function() {
    document.getElementById("boxes-div").innerHTML = "";
    for (let i of ["input","dark-bg"]) {
        document.getElementById(i).style.display = "none";
    }
    OpenLevel(5);
}

window.OpenSpecialLevel = function() {
    score = 0;
    document.getElementById("score").innerHTML = "Score: 0";
    walls[5] = [];
    for (let i of ["input","dark-bg"]) {
        document.getElementById(i).style.display = "block";
    }
    document.getElementById("menu").style.display = "none";
}

window.OpenLevel = function(a) {
    currentLevel=a;
    document.getElementById("menu").style.display = "none";
    document.getElementById("score").innerHTML = "Score: 0";
    snake = [[5,10],[4,10],[3,10],[2,10]];
    let x = document.getElementsByClassName("snake-body"), y = document.getElementsByClassName("walls"),layer=document.getElementById("layer");
    while (x[2]) {
        x[2].remove();
    }
    while (y[0]) {
        y[0].remove();
    }
    for (let i = 0; i < walls[currentLevel].length; i++) {
        layer.innerHTML += `<div class = "walls" style = "left:${walls[currentLevel][i][0]*100/number}%;top:${walls[currentLevel][i][1]*100/number}%;"></div>`;
    }
    currentDirection=lastDir="right";
    score=0;
    SpawnApple();
    MakeSnake();
    t=setInterval(MoveSnake,1000/speed);
}

window.Replay = function() {
    OpenLevel(currentLevel);
    document.getElementById("you-lost").style.top = "-100vh";
    document.getElementById("dark-bg").style.display = "none";
}

window.ShowMenu = function() {
    if (t) {
        clearInterval(t);
        t=false;
    }
    document.getElementById("menu").style.display = "block";
    document.getElementById("dark-bg").style.display = "none";
    document.getElementById("you-lost").style.top = "-100vh";
}

window.ShowSettings = function() {
    document.getElementById("settings-page").style.top = "0";
    document.getElementById("dark-bg").style.display = "block";
}

window.HideSettings = function() {
    document.getElementById("settings-page").style.top = "-100vh";
    document.getElementById("dark-bg").style.display = "none";
    speed = parseInt(document.getElementsByTagName("input")[0].value)+3;
    var sheet = document.createElement('style');
    sheet.innerHTML = `.snake {transition: top ${1/speed}s linear, left ${1/speed}s linear;}`;
    document.body.appendChild(sheet);
}

function YouLost() {
    document.getElementById("you-lost").style.top = "0";
    document.getElementById("dark-bg").style.display = "block";
    document.getElementById("final-score").innerHTML = "Your final score: "+score;
}

window.addEventListener("keydown",function(e) {
    if (e.key == "ArrowUp" && currentDirection != "down") {currentDirection="up";}
    else if (e.key == "ArrowLeft" && currentDirection != "right") {currentDirection="left";}
    else if (e.key == "ArrowRight" && currentDirection != "left") {currentDirection="right";}
    else if (e.key == "ArrowDown" && currentDirection != "up") {currentDirection="down";}
    buttonsClicked.push(currentDirection);
});

function MakeSnake() {
    layer = document.getElementById("layer");
    /*layer.innerHTML = `<div id = "snake-head" class = "snake" style = "left:${snake[0][0]*5}%;top:${snake[0][1]*5}%;"></div>
                       <div id = "snake-tail" class = "snake" style = "left:${snake[snake.length-1][0]*5}%;top:${snake[snake.length-1][1]*5}%;"></div>`;*/
    var head = document.getElementById("snake-head"), tail = document.getElementById("snake-tail"), body = document.getElementsByClassName("snake-body");
    head.style.top = snake[0][1]*100/number + "%";
    head.style.left = snake[0][0]*100/number + "%";
    tail.style.top = snake[snake.length-1][1]*100/number + "%";
    tail.style.left = snake[snake.length-1][0]*100/number + "%";
    for (let i = 1; i < snake.length-1; i++) {
        /*layer.innerHTML += `<div class = "snake snake-body" style = "left:${snake[i][0]*5}%;top:${snake[i][1]*5}%;"></div>`; */
        body[i-1].style.left = snake[i][0]*100/number + "%";
        body[i-1].style.top = snake[i][1]*100/number + "%";
    }
}

function SpawnApple() {
    apple = [Math.floor(Math.random()*number), Math.floor(Math.random()*number)];
    while (Index(snake,apple) != -1 || Index(walls[currentLevel],apple) != -1) {
        //console.log("hello");
        apple = [Math.floor(Math.random()*number), Math.floor(Math.random()*number)];
    }
    document.getElementById("apple").style.left = apple[0]*100/number + "%";
    document.getElementById("apple").style.top = apple[1]*100/number + "%";
    //console.log(apple);
}

function MoveSnake() {
    let eating = false;
    if (directions[currentDirection][2] == lastDir) {
        currentDirection = buttonsClicked[buttonsClicked.length-2];
    }
    if (Equal(snake[0],apple)) {
        score+=speed;
        document.getElementById("score").innerHTML = "Score: "+score;
        SpawnApple();
        eating = true;
    }
    var snakeDir = currentDirection, n = snake.length-1;
    for (let i=0; i < snake.length-1; i++) {
        let dir = Object.values(directions)[Index(dirCheck,[snake[i+1][0]-snake[i][0],snake[i+1][1]-snake[i][1]])][2];
        snake[i] = [snake[i][0]+directions[snakeDir][0],snake[i][1]+directions[snakeDir][1]];
        snakeDir = dir;
    }
    if (eating) {snake[n+1] = [snake[n][0],snake[n][1]];}
    snake[n] = [snake[n][0]+directions[snakeDir][0],snake[n][1]+directions[snakeDir][1]];
    if (eating) {
        document.getElementById("layer").innerHTML += `<div class = "snake snake-body" style = "left:${snake[n][0]*100/number}%;top:${snake[n][1]*100/number}%;"></div>`;
        SpawnApple();
    }
    document.getElementById("snake-tail").style.transform = `rotate(${["up","right","down","left"].indexOf(snakeDir)*90}deg)`;
    document.getElementById("snake-head").style.transform = `rotate(${["up","right","down","left"].indexOf(currentDirection)*90}deg)`;
    if (Index(snake.slice(1),snake[0]) != -1 || snake[0][0]>=number || snake[0][0] < 0 || snake[0][1]>=number || snake[0][1] < 0 || Index(walls[currentLevel],snake[0]) != -1) {
        clearInterval(t);
        t=false;
        YouLost();
        return;
    }
    lastDir = currentDirection;
    //console.log(snake[0],apple);
    setTimeout(MakeSnake,25);
}

const Index = (x,y) => {
    for (let i in x) {
        if (Equal(x[i],y)) {
            return i;
        }
    }
    return -1;
}

const Equal = (x,y) => {
    if (x.length != y.length) {return false;}
    for (let i=0; i < x.length; i++) {
        if (x[i]!=y[i]) {return false;}
    }
    return true;
}




















