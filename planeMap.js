window.onload = function(){
    var canvas = document.getElementById("map");
    var m = canvas.getContext("2d");
    var pointsArray = [['loc1','Miles',1071,863,'','',55],['loc2','Stone',300,1600,'','',56],['loc3','',-895,1209,'','',57],['loc4','Harry',170,-350,'','',58]];
    var foundersArray = ['Miles','Stone','Harry',''];
	
    var max = 0;
    var sca = 3000,
        scaMax = 6000,
        scaMin = 1000,
        border;
    var f_colorsArray = new Array();
    var colors = ['#ff4733','#ffde5c','#33ffad','#85a9ff','#ce0aff','#ffadc6','#beff5c','#5cffff','#6c5cff','#f385ff','#ff335c','#ff9d0a','#daffd6','#0aceff','#ad96b2','#ff0a9d'];
    var cenX,cenZ;
    var maxX,maxZ;
    var minX,minZ;
    var tranX,tranZ;
    var otranX,otranZ;
    var mouseX,mouseY;
    var moveX,moveY;
    var test;
    var dragging = false;

    assignColors();
    initialize();
    resizeCanvas();
    cluster();

    function zoom(d){
        var ttx=tranX/(max/sca);
        var ttz=tranZ/(max/sca);
        if(d<0 && sca<scaMax){sca+=200;}
        else if(d>0 && sca>scaMin){sca-=200;}
        var rect = canvas.getBoundingClientRect();
        var tx = mouseX-rect.left-max/2+otranX;
        var ty = mouseY-rect.top -max/2+otranZ;
        tranX=scale(ttx);
        tranZ=scale(ttz);
        //a/(max/sca);
        translate();
    }

    function handleScroll(e) {
        var e = window.event || e;
        var delta = Math.max(-1, Math.min(1, (e.wheelDelta || -e.detail)));
        if (delta)
            zoom(delta);
    }

    function handleMouseDown(e) {
        dragging = true;
        mouseX = e.clientX;
        mouseY = e.clientY;
    }

    function handleMouseUp(e) {
        dragging = false;
    }

    function handleMouseMove(e) {
        if (dragging) {
            moveX = mouseX - e.clientX;
            moveY = mouseY - e.clientY;
            mouseX = e.clientX;
            mouseY = e.clientY;
            var tx = tranX / (max / sca);
            var tz = tranZ / (max / sca);
            var mx = moveX / (max / sca);
            var mz = moveY / (max / sca);
            if (Math.abs(tx + mx) < border) {
                tranX += moveX;
            }
            if (Math.abs(tz + mz) < border) {
                tranZ += moveY;
            }
            translate();
        }
        mouseX = e.clientX;
        mouseY = e.clientY;
        testf(e);
    }

    function testf(e) {
        var rect = canvas.getBoundingClientRect();
        var tx = e.clientX - rect.left - max / 2 + otranX;
        var ty = e.clientY - rect.top - max / 2 + otranZ;
        test = Math.round(tx / (max / sca)) + ',' + Math.round(ty / (max / sca));
        m.fillStyle = '#000';
        for (var i = 0; i < pointsArray.length; i++) {
            var x = scale(pointsArray[i][2]);
            var z = scale(pointsArray[i][3]);
            if (Math.abs(x - tx) < 15 && Math.abs(z - ty) < 15) {
                test = i;
            }
        }
        redraw();
    }

    function handleMouseOut(e) {
        dragging = false;
    }

    function checkKey(e) {
        e = e || window.event;
        var int = scale(100); //jump distance in scaled units
        switch (e.keyCode) {
            case 38:
                tranZ -= int;
                break; //up arrow
            case 87:
                tranZ -= int;
                break; //W
            case 40:
                tranZ += int;
                break; //down arrow
            case 83:
                tranZ += int;
                break; //S
            case 37:
                tranX -= int;
                break; //left arrow
            case 65:
                tranX -= int;
                break; //A
            case 39:
                tranX += int;
                break; //right arrow
            case 68:
                tranX += int;
                break; //D
            case 8 :
                zoom(-1);
                break; //back space
            case 88:
                zoom(-1);
                break; //Z
            case 69:
                zoom(-1);
                break; //E
            case 32:
                zoom(1);
                break; //space bar
            case 90:
                zoom(1);
                break; //X
            case 81:
                zoom(1);
                break; //Q
            default:
                break;
        }
        translate();
    }

    function initialize() {
        window.addEventListener('resize', resizeCanvas, false);
        document.onkeydown = checkKey;
        if (canvas.addEventListener) {
            canvas.addEventListener('mousewheel', handleScroll, false);
            canvas.addEventListener("DOMMouseScroll", handleScroll, false);
            canvas.addEventListener("mousedown", handleMouseDown, false);
            canvas.addEventListener("mouseup", handleMouseUp, false);
            canvas.addEventListener("mousemove", handleMouseMove, false);
            canvas.addEventListener("mouseout", handleMouseOut, false);
        }
    }

    function resizeCanvas() {
        var mm = max;
        var tx = tranX / (max / sca);
        var tz = tranZ / (max / sca);
        max = Math.min(window.innerWidth, window.innerHeight);
        canvas.width = max;
        canvas.height = max;
        mm = max - mm;

        m.translate(-tranX + max / 2, -tranZ + max / 2);

        redraw();
    }

    function assignColors() {
        var index = Math.floor(Math.random() * (16 - foundersArray.length));
        for (var i = 0; i < foundersArray.length; i++) {
            //var color = '#'+(Math.random()*0xFFFFFF<<0).toString(16);
            var color = colors[index];
            f_colorsArray[i] = color;
            index++;
        }
    }

    //centers canvas on middle of all locations
    function cluster() {
        //find furthest points
        maxX = 0, minX = 0, maxZ = 0, minZ = 0;
        for (var i = 0; i < pointsArray.length; i++) {
            maxX = Math.max(maxX, pointsArray[i][2]);
            minX = Math.min(minX, pointsArray[i][2]);
            maxZ = Math.max(maxZ, pointsArray[i][3]);
            minZ = Math.min(minZ, pointsArray[i][3]);
            if (pointsArray[i][2] > maxX) {
                maxX = pointsArray[i][2];
            }
            if (pointsArray[i][2] < minX) {
                minX = pointsArray[i][2];
            }
            if (pointsArray[i][3] > maxZ) {
                maxZ = pointsArray[i][3];
            }
            if (pointsArray[i][3] < minZ) {
                minZ = pointsArray[i][3];
            }
        }

        //find center of furthest points
        cenX = (maxX + minX) / 2;
        cenZ = (maxZ + minZ) / 2;

        sca = Math.round(Math.min(Math.max(maxX - cenX, minX - cenX, maxZ - cenZ, minZ - cenZ), 4000) / 1000) * 2000 + 2000;

        //translate to center of point-cluster
        otranX = max / 2;
        otranZ = max / 2;
        tranX = scale(cenX);
        tranZ = scale(cenZ);
        translate();
    }

    //scales values to fit canvas
    function scale(a) {
        var scale = max / sca;
        return a * scale;
    }

    //sets canvas translation to current values
    function translate() {
        m.translate(otranX - tranX, otranZ - tranZ);
        otranX = tranX;
        otranZ = tranZ;
        redraw();
    }

    //draws the canvas
    function redraw() {
        m.fillStyle = '#000';
        m.font = '14px Helvetica';
        clear();
        drawGrid();
        drawGuides();
        drawPoints();

        //clears the canvas
        function clear() {
            // Store the current transformation matrix
            m.save();

            // Use the identity matrix while clearing the canvas
            m.setTransform(1, 0, 0, 1, 0, 0);
            m.clearRect(0, 0, canvas.width, canvas.height);

            // Restore the transform
            m.restore();
        }

        //draw the grid of guidelines
        function drawGrid() {
            //grid settings
            border = Math.round(Math.max(maxX - cenX, minX - cenX, maxZ - cenZ, minZ - cenZ) / 1000) * 2000 + 500;//width of grid scales to furthest point
            var light = 100; //space between lines in scale units
            var dark = 5;    //how often to draw a dark line

            var len = scale(border); //

            //draw grid
            for (var i = 1; i <= border / light; i = i + 1) {
                var dis = scale(i * light); //space grid lines from origin

                m.lineWidth = 1;
                m.strokeStyle = '#0f0f0f';
                if (i % dark === 0) {
                    m.lineWidth = 2;
                    m.strokeStyle = '#080808';
                }
                m.beginPath();
                m.moveTo(-len, dis);
                m.lineTo(len, dis);
                m.moveTo(-len, -dis);
                m.lineTo(len, -dis);
                m.moveTo(dis, -len);
                m.lineTo(dis, len);
                m.moveTo(-dis, -len);
                m.lineTo(-dis, len);
                m.closePath();
                m.stroke();
            }

            //draw origin
            m.strokeStyle = '#000';
            m.lineWidth = 3;
            m.beginPath();
            m.moveTo(0, -len);
            m.lineTo(0, len);
            m.moveTo(-len, 0);
            m.lineTo(len, 0);
            m.closePath();
            m.stroke();

            m.fillStyle = '#ddd';
            m.arc(0, 0, 2, 0, 6.3, false);
            m.fillText('0,0', 3, -3);
            m.fill();

            //DEBUG/////transform center
            //m.beginPath();
            //m.strokeStyle='white';
            //m.lineWidth = 1;
            //m.strokeRect(tranX,tranZ,1,1);
            //m.closePath();
            //m.stroke();
        }

        //draws static items
        function drawGuides() {
            //store transforms
            m.save();

            //clear translate
            m.setTransform(1, 0, 0, 1, 0, 0);

            //draw compass
            m.fillStyle = '#ddd';
            m.fillText('+ X  (East)', max - 75, max / 2 + 4);
            m.fillText('- X  (West)', 8, max / 2 + 4);
            m.fillText('- Z  (North)', max / 2 - 40, 20);
            m.fillText('+ Z  (South)', max / 2 - 40, max - 10);
            m.fill();

            //DEBUG/////draw static canvas center
            m.beginPath();
            m.strokeStyle = '#ccc';
            m.lineWidth = 1;
            m.strokeRect(max / 2, max / 2, 1, 1);
            m.closePath();
            m.stroke();

            //draw scale
            m.fillText('Coordinates: (X,Z)', 10, max - 30);
            m.fillText('Scale: ' + sca + ' meters', 10, max - 10);
            m.fill();

            //draw test vars
            //m.fillText('tranXs: '+tranX/(max/sca),max/2,max-120);
            //m.fillText('tranX: '+tranX,max/2,max-100);
            //m.fillText('c: '+mouseX*(max/sca),max/2,max-80);
            //m.fillText('d: '+mouseX,max/2,max-60);
            //m.fillText(test,max/2,max-40);
            //m.fill();

            //draw key
            var pos = 15;
            m.lineWidth = 5;
            m.fillStyle = '#ddd';
            for (var i = 0; i < foundersArray.length; i++) {
                var founder = foundersArray[i];
                if (founder === '') {
                    founder = 'Unknown';
                }
                var color = f_colorsArray[i];

                m.strokeStyle = color;
                m.strokeRect(12, pos, 1, 1);
                m.fillText(founder, 22, pos + 5);
                m.fill();
                pos += 20;
            }

            //restore transforms
            m.restore();
        }

        //draws each location point
        function drawPoints() {
            m.lineWidth = 5;
            m.fillStyle = '#fff';

            for (var i = 0; i < pointsArray.length; i++) {
                var name = pointsArray[i][0];
                var founder = pointsArray[i][1];
                var index = foundersArray.indexOf(founder);
                var color = f_colorsArray[index];
                var x = pointsArray[i][2];
                var z = pointsArray[i][3];

                m.beginPath();
                m.strokeStyle = color;
                m.strokeRect(scale(x), scale(z), 1, 1);
                //m.fillText(x+','+z,scale(x)+8,scale(z)+5);m.fill();
                //DEBUG/////////draw canvas coordinate under each point
                //m.fillText(Math.round(scale(x))+','+Math.round(scale(z)),scale(x)+8,scale(z)+25);m.fill();

                m.closePath();
                m.stroke();
            }

            if (typeof (test) === 'number') {
                var name = pointsArray[test][0];
                var founder = pointsArray[test][1];
                var x = pointsArray[test][2];
                var z = pointsArray[test][3];
                if (founder === '') {
                    founder = 'Unknown';
                }

                m.fillText(x + ',' + z, scale(x) + 8, scale(z) + 5);
                m.fill();
                var rect = canvas.getBoundingClientRect();
                var tx = mouseX - rect.left - max / 2 + otranX;
                var ty = mouseY - rect.top - max / 2 + otranZ;
                var nw = m.measureText(name).width;
                var fw = m.measureText(founder).width;
                var tw = Math.max(nw, fw);

                m.beginPath();
                m.strokeStyle = 'rgba(100,100,100,.5)';
                m.strokeRect(tx, ty + 20, tw + 20, 42);
                m.fillStyle = 'rgba(200,200,200,.8)';
                m.fillRect(tx, ty + 20, tw + 20, 42);
                m.fill();

                m.fillStyle = '#111';
                m.fillText(name, tx + 10, ty + 35);
                m.fillText(founder, tx + 10, ty + 55);
                m.fill();
                m.closePath();
                m.stroke();
            }
        }

        //DEBUG/draw center of point-cluster
        m.strokeStyle = '#444';
        m.lineWidth = 1;
        m.strokeRect(scale(cenX), scale(cenZ), 1, 1);
        m.stroke();
    }
};
