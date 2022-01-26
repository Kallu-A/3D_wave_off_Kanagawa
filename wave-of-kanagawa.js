"use strict";

var camera, scene, renderer;
var windowScale;
var cameraControls, effectController;
var clock = new THREE.Clock();
var gridX = false;
var gridY = false;
var gridZ = false;
var axes = false;
var ground = true;


var colorBG = 0xdfc7a5;



function init() {
    var canvasWidth = 846;
    var canvasHeight = 494;
    var canvasRatio = canvasWidth / canvasHeight;
    // SCENE
    scene = new THREE.Scene();
    scene.fog = new THREE.Fog(colorBG, 10, 100);

    // LIGHTS
    scene.add(new THREE.AmbientLight(colorBG));

    // RENDERER
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.gammaInput = true;
    renderer.gammaOutput = true;
    renderer.setSize(canvasWidth, canvasHeight);
    renderer.setClearColor(scene.fog.color, 1);

    // CAMERA
    camera = new THREE.PerspectiveCamera(45, canvasRatio, 10, 100);
    camera.position.set(0, 0, -15);

    // CONTROLS
    cameraControls = new THREE.OrbitControls(camera, renderer.domElement);
    cameraControls.target.set(0, 0, 0);

    setupGui();

    draw();
}

// ici se font les dessins
function draw() {


    var seaMaterial = new THREE.MeshLambertMaterial({
        color: 0x2C4E71
    });
    /*
        var cube = new THREE.Mesh(
            new THREE.BoxGeometry(2, 2, 2), seaMaterial);
        cube.position.x = 0; // (20+32) - half of width (20+64+110)/2
        cube.position.y = 0; // half of height
        cube.position.z = 0; // offset 77 + half of depth 6/2
        scene.add(cube); */
    /*for (var i = 0; i < 100; i + ) {
        var wave = new THREE.Mesh(
            new THREE.
        )
    }*/

    var curve = new THREE.CubicBezierCurve3(
        new THREE.Vector3(0, 0, 0),
        new THREE.Vector3(-5, 15, 2),
        new THREE.Vector3(20, 15, 1),
        new THREE.Vector3(10, 0, 0)
    );

    var points = curve.getPoints(40);
    var geometry = new THREE.BufferGeometry().setFromPoints(points);
    var curveObject = new THREE.Line(geometry, seaMaterial);
    scene.add(curveObject);


}

// allow the connection with the dat.gui.js
function renderGUI() {
    if (ground) {
        Coordinates.drawGround({ size: 1000 });
    }
    if (gridX) {
        Coordinates.drawGrid({ size: 1000, scale: 0.01 });
    }
    if (gridY) {
        Coordinates.drawGrid({ size: 1000, scale: 0.01, orientation: "y" });
    }
    if (gridZ) {
        Coordinates.drawGrid({ size: 1000, scale: 0.01, orientation: "z" });
    }
    if (axes) {
        Coordinates.drawAllAxes({ axisLength: 300, axisRadius: 2, axisTess: 50 });
    }
}

function setupGui() {

    effectController = {

        newGridX: gridX,
        newGridY: gridY,
        newGridZ: gridZ,
        newGround: ground,
        newAxes: axes
    };

    var gui = new dat.GUI();
    gui.add(effectController, "newGridX").name("Show XZ grid");
    gui.add(effectController, "newGridY").name("Show YZ grid");
    gui.add(effectController, "newGridZ").name("Show XY grid");
    gui.add(effectController, "newGround").name("Show ground");
    gui.add(effectController, "newAxes").name("Show axes");
}

// permet de lancer l'animation 
function animate() {
    requestAnimationFrame(animate);
    render();
}

// permet d'afficher la nouvelle scene a chaque nouvel animation demandé
function render() {
    var delta = clock.getDelta();
    cameraControls.update(delta);

    if (effectController.newGridX !== gridX || effectController.newGridY !== gridY || effectController.newGridZ !== gridZ || effectController.newGround !== ground || effectController.newAxes !== axes) {
        gridX = effectController.newGridX;
        gridY = effectController.newGridY;
        gridZ = effectController.newGridZ;
        ground = effectController.newGround;
        axes = effectController.newAxes;

        renderGUI();
    }

    renderer.render(scene, camera);
}

// utile pour faire le lien entre l'html et le js
function addToDOM() {
    var container = document.getElementById("webGL");
    container.appendChild(renderer.domElement);
}

init();
animate();