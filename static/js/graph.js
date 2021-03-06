let width = 600;
let height = 600;

// center coordinates
let centX = 0;
let centY = 0;

// translates
let transX = width / 2;
let transY = height / 2;

// infinite graph
let xMove = 0;
let yMove = 0;

let strWeight = 1;
let fontSize = 10;

// zooming
var zoom = 5.00;
var zMin = 0.05;
var zMax = 50.00;
var sensativity = 0.05;

let figures = [];
let json = {points:[], lines:[], circles:[]}

var cvn;

function drawPoint(p) {
    fill(color(0, 0, 0))
    circle(p.x, p.y, 2 / zoom);
    //point(p.pointX, p.pointY);
    fill(color(0, 0, 0, 0))
    scale(1, -1)
    textSize(fontSize * 2 / zoom);
    text(p.name, p.x, -p.y)
    scale(1, -1)
}

function handleJSON(json) {
    stroke(0);
    strokeWeight(strWeight / zoom);
    for (const p of json.points) {
        drawPoint(p)
    }
    for (const l of json.lines) {
        line(l.x1, l.y1, l.x2, l.y2)
    }
    for (const c of json.circles) {
        //radius = Math.sqrt(Math.abs(c.center.x - c.r.x) ** 2 + Math.abs(c.center.y - c.r.y) ** 2)
        ellipse(c.center.x, c.center.y, c.r.x * 2, c.r.x * 2)
        drawPoint(c.center)
    }
}

function setup() {
    cvn =  createCanvas(width, height);
    cvn.id("drawing");
    $("#canvas_container").prepend($("#drawing"));
}

function draw() {
    background(255);
    translate(transX, transY);

    scale(zoom, -zoom)

    drawCoordinates()
    drawObjects()
}

function mouseWheel(event) {
    zoom -= sensativity * event.delta;
    zoom = constrain(zoom, zMin, zMax);
    return false;
}

function mouseDragged() {
    if($("#drawing").is(":hover")){
        transX += mouseX - pmouseX;
        transY += mouseY - pmouseY;
        centX += mouseX - pmouseX;
        centY += mouseY - pmouseY;
    }
}

function drawRes(res) {
    figures = [];
    let myPoints = JSON.parse(res);
    for (var p of myPoints) {
        figures.push(p);
    }
}

function stepFn(x) {
    let lower = 10 ** Math.floor(Math.log10(x))
    if (x < lower * 2) {
        return lower
    } else if (x < lower * 5) {
        return lower * 2
    }
    return lower * 5
}

function drawCoordinates() {
    stroke(150);
    strokeWeight(strWeight / zoom);
    textSize(fontSize / zoom);

    let step = stepFn(1 / zoom) * 100
    const beginx = Math.floor((-transX / zoom) / step) * step,
        endx = Math.ceil((-transX + width) / zoom / step) * step,
        beginy = Math.floor(-transY / zoom / step) * step,
        endy = Math.ceil((-transY + height) / zoom / step) * step

    // draw coordinates
    for (var i = beginx; i < endx; i += step) {
        i == 0 ? stroke(0) : stroke(150);
        line(i, -beginy, i, -endy);
    }
    for (var i = beginy; i < endy; i += step) {
        i == 0 ? stroke(0) : stroke(150);
        line(beginx, -i, endx, -i);
    }

    // draw labels
    textSize(fontSize / zoom);
    scale(1, -1)
    for (var i = beginx; i < endx; i += step) {
        text(int(i * 100) / 100., i, fontSize / zoom)
    }
    for (var i = beginy; i < endy; i += step) {
        text(-int(i * 100) / 100., -2 * fontSize / zoom, i);
    }
    scale(1, -1)
}

function drawObjects() {
    handleJSON(json)
    let len = figures.length;
    for (let i = 0; i < len - 1; i++) {
        drawPoint(figures[i]);
        if (i == len - 2) {
            drawPoint(figures[i + 1])
        }
        stroke(0);
        strokeWeight(strWeight / zoom);
        if (i == len - 2 && len > 2) {
            line(figures[i + 1].pointX, figures[i + 1].pointY,
                figures[0].pointX, figures[0].pointY);
        }
        line(figures[i].pointX, figures[i].pointY,
            figures[i + 1].pointX, figures[i + 1].pointY);
    }
}

$('#run').click((e) => {
    data ={code: $('#code').val() + '\n'}
    $.ajax({
        type: "POST",
        url: '/code',
        contentType: 'application/json',
        data: JSON.stringify(data)
    }).then((res)=>{
        res = JSON.parse(res)
        $('#answer').text(res[0][0])
       json = JSON.parse(res[1])
       console.log(json)
    })
})

$('#zoom').click((e) => {
    zoom += sensativity * 20;
})

$('#unzoom').click((e) => {
    zoom -= sensativity * 20;
})