

// modifiable setup elements
const display_id = "display";
const display_ratio = pt(4, 3);
const display_padding = 30;
const ball_ct = 50;
const ball_quality = 4;
const fps = 60;
const background_color = rgb_to_hex(200, 200, 200);

// set up update and init func
window.onload = function () { init(); }
setInterval(update, 1000 / fps)


// public vars
var screen;



function init() { // function called on window load
    screen = screen_init();
    fps_calc(screen, stage = 1);
    calculate_canvas_dimensions(screen);
    clear_screen(screen);
    var ball_idx = 0;
    var ball_list = [];
    while (ball_idx < ball_ct) {
        ball_list.push(create_ball(screen))
        ball_idx++;
    }
    var temp = [];
    for (i in ball_list) {
        temp.push(create_object(screen, i, ball_list[i]));
    }
    ball_list = temp;
    for (i in ball_list) {
        screen.objects.push(ball_list[i])
    }
    render_objects(screen)
}

function update() { // function called on frame update
    //code
    var o;
    new_list = [];
    for (i in screen.objects) {
        o = screen.objects[i];
        o.center.x += o.vel.x;
        o.center.y += o.vel.y;
        if (o.center.x <= 0) { o.center.x = 0; o.vel.x *= -1; }
        else if (o.center.x >= screen.canvas.width) { o.center.x = screen.canvas.width; o.vel.x *= -1; }
        if (o.center.y <= 0) { o.center.y = 0; o.vel.y *= -1; }
        else if (o.center.y >= screen.canvas.height) { o.center.y = screen.canvas.height; o.vel.y *= -1; }
        o.points = get_circle_pt_list(o.center.x, o.center.y, o.radius, ball_quality, global = true);
        new_list.push(o);
    }
    var collision = false;
    screen.objects = new_list;
    new_list = [];
    for (i in screen.objects) {
        o = screen.objects[i];
        for (i2 in screen.objects) {
            o2 = screen.objects[i2]
            if (o2.id != o.id) {
                var collision_distance = o.radius + o2.radius
                var distance = ((Math.abs(o.center.x - o2.center.x)) ** 2 + (Math.abs(o.center.y - o2.center.y)) ** 2) ** 0.5
                collision = distance <= collision_distance
                if (collision) {
                    var return_data = circle_collision(o, o2)
                    o.vel.x = return_data.x
                    o.vel.y = return_data.y
                }
            }
            
        }
        new_list.push(o);
    }
    screen.objects = new_list;
    
    clear_screen(screen);
    render_objects(screen);



    fps_calc(screen, stage = 2);
}
function circle_collision(c1, c2) {
    var return_vel = { 'x': 0, 'y': 0 };
    var total_vel = ((Math.abs(c1.vel.x)) ** 2 + (Math.abs(c1.vel.y)) ** 2) ** 0.5
    nx = (c2.center.x - c1.center.x) < 0
    ny = (c2.center.y - c1.center.y) < 0
    var direction = Math.atan(Math.abs(c2.center.x - c1.center.x) / Math.abs(c2.center.y - c1.center.y))
    if (nx && !ny) { direction += (Math.PI / 2); }
    else if (ny && nx) { direction += Math.PI; }
    else if (!nx && ny) { direction += (Math.PI * 1.5); }
    return_vel.x = Math.sin(direction) * total_vel * -1
    return_vel.y = Math.cos(direction) * total_vel * -1
    return return_vel

}


function fps_calc(screen, stage) {
    if (stage == 1) {
        screen.fps_data.start = performance.now();
        return
    } else if (stage == 2) {
        screen.fps_data.end = performance.now();
        screen.frame_rate.actual = 1 / ((screen.fps_data.end - screen.fps_data.start) / 1000);
        screen.fps_data.start = screen.fps_data.end;
        return 
    }
}
function create_ball(screen) {
    var ball_size = Math.round(Math.random() * 20) + 5;
    var ball_center_x = (Math.random() * (screen.canvas.width - (2 * ball_size))) + ball_size;
    var ball_center_y = (Math.random() * (screen.canvas.height - (2 * ball_size))) + ball_size;
    var ball_vel_x = 0.001 * Math.round(Math.random() * 100) + 2;
    var ball_vel_y = 0.001 * Math.round(Math.random() * 100) + 2;
    if (Math.random() >= 0.5) { ball_vel_x *= -1; }
    if (Math.random() >= 0.5) { ball_vel_y *= -1; }
    var ball_color_r = Math.round(Math.random() * 255);
    var ball_color_g = Math.round(Math.random() * 255);
    var ball_color_b = Math.round(Math.random() * 255);
    var ball_color = rgb_to_hex(ball_color_r, ball_color_g, ball_color_b);
    var pt_list = get_circle_pt_list(ball_center_x, ball_center_y, ball_size, ball_quality, global = true);
    var ball = {
        'vel': { 'x': ball_vel_x, 'y': ball_vel_y },
        'radius': ball_size,
        'center': pt(ball_center_x, ball_center_y),
        'color': ball_color, 'points': pt_list,
        'mode': 'fill'
    }
    return ball;
}

function get_circle_pt_list(center_x, center_y, radius, quality, global=true) {
    var rad_dis = Math.PI / (2 * quality);
    var i = 0;
    var pt_list = [];
    var pt_list_global = [];
    var x;
    var y;
    while (i <= quality) {
        x = radius * Math.cos(rad_dis * i);
        y = radius * Math.sin(rad_dis * i);
        pt_list.push(pt(x, y));
        i++;
    }
    i = 0;
    var l = pt_list.length - 1;
    for (i in pt_list) {
        x = -1 * pt_list[l - i].x;
        y = pt_list[l - i].y;
        pt_list.push(pt(x, y));
    }
    l = pt_list.length - 1;
    for (i in pt_list) {
        x = pt_list[l - i].x;
        y = -1 * pt_list[l - i].y;
        pt_list.push(pt(x, y));
    }
    if (global) {
        for (i in pt_list) {
            x = pt_list[i].x + center_x;
            y = pt_list[i].y + center_y;
            pt_list_global.push(pt(x, y))
        }
        return pt_list_global
    } else {
        return pt_list
    }
}

function create_object(screen, id, object_data) {
    var new_obj = { 'id': id };
    var k = Object.keys(object_data);
    for (i in k) {
        new_obj[k[i]] = object_data[k[i]];
    }
    new_obj.renderer_ready = true;
    screen.objects.push(new_obj)
    return new_obj
}
function calculate_canvas_dimensions(screen) {
    // calculates and applies canvas dimensions based on inner window size
    var w = window.innerWidth;
    var h = window.innerHeight;
    
    n = Math.min(w / screen.ratio.x, h / screen.ratio.y);
    var x = (n * screen.ratio.x) - screen.padding;
    var y = (n * screen.ratio.y) - screen.padding;
    dim = { 'x': x, 'y': y };
    screen.canvas.width = dim.x;
    screen.canvas.height = dim.y;
}
function pt(x, y) {
    return { 'obj': 'point', 'x': x, 'y': y };
}
function clear_screen(screen) {
    screen.canvas_ctx.fillStyle = screen.background_color;
    screen.canvas_ctx.beginPath();
    screen.canvas_ctx.moveTo(0, 0);
    screen.canvas_ctx.lineTo(screen.canvas.width, 0);
    screen.canvas_ctx.lineTo(screen.canvas.width, screen.canvas.height);
    screen.canvas_ctx.lineTo(0, screen.canvas.height);
    screen.canvas_ctx.closePath();
    screen.canvas_ctx.fill();
}
function rgb_to_hex(r, g, b) {
    hex_vals = ['0', '1', '2', '3',
        '4', '5', '6', '7', '8', '9',
        'A', 'B', 'C', 'D', 'E', 'F']
    color_vals = [r, g, b]
    var val;
    var num1;
    var num2;
    var result = "#";
    for (i in color_vals) {
        val = color_vals[i]
        num1 = Math.floor(val / hex_vals.length)
        num2 = val % hex_vals.length
        result += hex_vals[num1]
        result += hex_vals[num2]
    }
    return result
}
function render_objects(screen) {
    var a;
    for (i in screen.objects) {
        renderer(screen, screen.objects[i]);
    }
    
}
function renderer(screen, object) {
    if (object.mode == 'fill') { screen.canvas_ctx.fillStyle = object.color; }
    else if (object.mode == 'stroke') {
        screen.canvas_ctx.strokeStyle = object.color;
        screen.canvas_ctx.lineWidth = object.line_width;
    }
    var o;
    screen.canvas_ctx.beginPath();
    for (i in object.points) {
        o = object.points[i]
        if (i == 0) { screen.canvas_ctx.moveTo(o.x, o.y); }
        else { screen.canvas_ctx.lineTo(o.x, o.y); }
    }
    screen.canvas_ctx.closePath();
    if (object.mode == 'fill') { screen.canvas_ctx.fill(); }
    else if (object.mode == 'stroke') { screen.canvas_ctx.stroke(); }
}


function screen_init(ratio = display_ratio, max_fps = fps,
    background = background_color, canvas_id = display_id, padding = display_padding) {
    var screen = {
        'ratio': ratio, 'frame_rate': { 'max': max_fps, 'actual': 0 },
        'fps_data': { 'start': 0, 'end': 0 }, 'background_color': background,
        'objects': [], 'canvas': document.getElementById(canvas_id),
        'canvas_ctx': document.getElementById(canvas_id).getContext('2d'),
        'padding': padding
    }
    return screen;
}