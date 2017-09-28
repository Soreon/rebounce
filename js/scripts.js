var canvas = document.getElementById('main-canvas');
var context = canvas.getContext('2d');

var center_point = {x: canvas.scrollHeight / 2, y: canvas.scrollHeight / 2};
var shape = [];
var segments = [];
var start_point = {x: 0, y: 0, angle: 0};

function cleanCanvas() {
    context.clearRect(0, 0, canvas.width, canvas.height);
}

function rectangle(x, y, width, height, color) {
    context.beginPath();
    context.rect(x, y, width, height);
    context.fillStyle = color;
    context.fill();
}

function circle(x, y, radius, filled) {
    context.beginPath();
    context.arc(x, y, radius, 0, 2 * Math.PI);
    context.stroke();
    if(filled) {
        context.fill();
    }
    context.closePath();
}

function line(ax, ay, bx, by, color, thickness) {
    var funcStrokeStyle = context.strokeStyle;
    var funcLineWidth = context.lineWidth;

    context.beginPath();
    context.moveTo(ax, ay);
    context.lineTo(bx, by);
    context.strokeStyle = color;
    context.lineWidth = thickness;
    context.stroke();

    context.strokeStyle = funcStrokeStyle;
    context.lineWidth = funcLineWidth;
}

function text(text, x, y, size, color) {
    context.font = size + "px Arial";
    context.fillStyle = color;
    context.fillText(text, x, y); 
}

function inside(point, vs) {
    var x = point.x, y = point.y;
    var inside = false;
    for (var i = 0, j = vs.length - 1; i < vs.length; j = i++) {
        var xi = vs[i].x, yi = vs[i].y;
        var xj = vs[j].x, yj = vs[j].y;

        var intersect = ((yi > y) != (yj > y)) && (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
        if (intersect) inside = !inside;
    }
    return inside;
};

function createShape(x, y, number_of_point, radius, offset) {
    
    var angle = (2 * Math.PI) / number_of_point;
    var tx = 0, ty = 0, rand = 0;

    for (var index = 0; index < number_of_point; index++) {
        rand = Math.floor((Math.random() * offset) * 2 - offset);
        tx = x + (radius + rand) * Math.cos(index * angle);
        ty = y + (radius + rand) * Math.sin(index * angle);

        shape.push({x: tx, y: ty});
    }
}

function drawShape() {
    context.beginPath();
    context.lineWidth = 1;
    context.moveTo(shape[0].x, shape[0].y);
    for (var index = 1; index < shape.length; index++) {
        context.lineTo(shape[index].x, shape[index].y);
    }
    context.closePath();
    context.stroke();
}

function line_intersect(ax, ay, bx, by, cx, cy, dx, dy) {
    var denominator, a, b, numerator1, numerator2, result = {
        x: null,
        y: null
    };
    denominator = ((dy - cy) * (bx - ax)) - ((dx - cx) * (by - ay));
    if (denominator == 0) {
        return result;
    }
    a = ay - cy;
    b = ax - cx;
    numerator1 = ((dx - cx) * a) - ((dy - cy) * b);
    numerator2 = ((bx - ax) * a) - ((by - ay) * b);
    a = numerator1 / denominator;
    b = numerator2 / denominator;

    // if we cast these lines infinitely in both directions, they intersect here:
    result.x = ax + (a * (bx - ax));
    result.y = ay + (a * (by - ay));

    // if line1 is a segment and line2 is infinite, they intersect if:
    if ((a > 0 && a < 1) && (b > 0 && b < 1)) {
        return result;
    } else {
        return null;
    }
};

function distance(ax, ay, bx, by) {
    return Math.sqrt( Math.pow((ax-bx), 2) + Math.pow((ay-by), 2) );
}

function animatedDrawSegments(turn = segments.length) {

    rectangle(7, 5, 150, 20, "#FFF");
    text(segments.length - turn + " rays", 10, 20, 15, "#000");
    if(turn > 1) {
        line(segments[segments.length - turn].x, segments[segments.length - turn].y, segments[segments.length - turn + 1].x, segments[segments.length - turn + 1].y, "rgba(0,0,0,0.1)", 1);
        setTimeout(function() { animatedDrawSegments(turn - 1); }, 1);
    }
}

function drawSegments(animated = false) {
    var funcStrokeStyle = context.strokeStyle;
    var funcLineWidth = context.lineWidth;
    if(animated) {
        animatedDrawSegments();
    } else {
        context.beginPath();
        context.lineWidth = 1;
        context.strokeStyle = "rgba(0,0,0,0.1)";
        context.moveTo(segments[0].x, segments[0].y);
        for (var index = 1; index < segments.length; index++) {
            context.lineTo(segments[index].x, segments[index].y);
        }
        context.stroke();
        text(segments.length-1 + " rays", 10, 20, 15, "#000");
    }
    context.strokeStyle = funcStrokeStyle;
    context.lineWidth = funcLineWidth;
}

function createRandomPointInShape() {
    var x = 0, y = 0;
    do {
        x = Math.floor((Math.random() * canvas.scrollWidth));
        y = Math.floor((Math.random() * canvas.scrollHeight));
    } while(!inside({x: x, y: y}, shape));
    
    start_point.x = x;
    start_point.y = y;
    start_point.angle = Math.random() * Math.PI * 2;
}

function round12(number) {
    return (parseFloat(number).toPrecision(12));
}

function createRay(number_of_rebounce) {
    var previous_point = JSON.parse(JSON.stringify(start_point));
    var current_point = JSON.parse(JSON.stringify(start_point));
    var radius = 100000;
    var intersection_point = null, nx, ny;
    var previous_index = -1;
    var intersection_points = [];
    var previous_distance = Infinity;

    segments.push({x: current_point.x, y: current_point.y});

    for (var index = 0; index < number_of_rebounce; index++) {
        nx = current_point.x + radius * Math.cos(current_point.angle);
        ny = current_point.y + radius * Math.sin(current_point.angle);
        intersection_points = [];
        previous_distance = Infinity;
        intersection_point = null;

        for (var index2 = 0; index2 < shape.length; index2++) {
            intersection_point = line_intersect(current_point.x, current_point.y, nx, ny, shape[index2].x, shape[index2].y, shape[(index2 + 1) % shape.length].x, shape[(index2 + 1) % shape.length].y);

            if(intersection_point != null) {
                var angle = current_point.angle;
                var deltaY = shape[(index2 + 1) % shape.length].y - shape[index2].y;
                var deltaX = shape[(index2 + 1) % shape.length].x - shape[index2].x;
                var angle_of_segment = Math.atan2(deltaY, deltaX);
                intersection_point.angle =  2 * (Math.PI + angle_of_segment) - angle;
                intersection_points.push(intersection_point);
            }
        }

        intersection_point = intersection_points[0];
        for (var index2 = 0; index2 < intersection_points.length; index2++) {
            var dist = distance(current_point.x, current_point.y, intersection_points[index2].x, intersection_points[index2].y);
            if(dist < previous_distance && round12(current_point.x) != round12(intersection_points[index2].x) && round12(current_point.y) != round12(intersection_points[index2].y)) {
                previous_distance = dist;
                intersection_point = JSON.parse(JSON.stringify(intersection_points[index2]));
            }
            circle(intersection_points[index2].x, intersection_points[index2].y, 2, true);

        }
        circle(intersection_point.x, intersection_point.y, 2, true);

        previous_point = JSON.parse(JSON.stringify(intersection_point));
        previous_index = index2;
        if(!intersection_point) {
            break;
        }
        segments.push({x: intersection_point.x, y: intersection_point.y});
        current_point = JSON.parse(JSON.stringify(intersection_point));
        intersection_point = null;
    }
}

function draw() {
    cleanCanvas();
    drawShape();
    drawSegments(true);
    circle(start_point.x, start_point.y, 1, false);
}

createShape(center_point.x, center_point.y, 20, 150, 100);
//createShape(center_point.x, center_point.y, 6, 200, 0);
createRandomPointInShape();
createRay(5000);
draw();