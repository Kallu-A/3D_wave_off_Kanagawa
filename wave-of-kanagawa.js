"use strict";

var camera, scene, renderer;
var windowScale;
var cameraControls, effectController;
var clock = new THREE.Clock();

// GUI var
var gridX = false;
var gridY = false;
var gridZ = false;
var axes = false;
var ground = false;

const near = 20;
const far = 200;

// Color
const colorBG = 0xdfc7a5;
const seaMaterial = new THREE.MeshLambertMaterial({
    color: 0x1C4E76
});


function init() {
    var canvasWidth = 846;
    var canvasHeight = 494;
    var canvasRatio = canvasWidth / canvasHeight;
    // SCENE
    scene = new THREE.Scene();
    scene.fog = new THREE.Fog(colorBG, far, far);

    // LIGHTS
    scene.add(new THREE.AmbientLight(0XFFFFFF));

    // RENDERER
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.gammaInput = true;
    //renderer.gammaOutput = true;
    renderer.setSize(canvasWidth, canvasHeight);
    renderer.setClearColor(scene.fog.color, 1);

    // CAMERA
    camera = new THREE.PerspectiveCamera(45, canvasRatio, near, far);
    camera.position.set(0, 30, -100);

    // CONTROLS
    cameraControls = new THREE.OrbitControls(camera, renderer.domElement);
    cameraControls.target.set(0, 0, 0);

    setupGui();

    draw();
}

// ici se font les dessins
function draw() {


    var cube = new THREE.Mesh(
        new THREE.BoxGeometry(50, 1, 50), seaMaterial);
    cube.position.x = 0;
    cube.position.y = 0;
    cube.position.z = 0;
    scene.add(cube);
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
function renderGUI() {}

function setupGui() {
    var gui = new dat.GUI();
}

// permet de lancer l'animation 
function animate() {
    window.requestAnimationFrame(animate);
    render();
}

// permet d'afficher la nouvelle scene a chaque nouvel animation demandé
function render() {
    var delta = clock.getDelta();
    cameraControls.update(delta);

    renderGUI();
    renderer.render(scene, camera);
}

// utile pour faire le lien entre l'html et le js
function addToDOM() {
    var container = document.getElementById("webGL");
    container.appendChild(renderer.domElement);
}

try {
    init();
    animate();
} catch (e) {
    var errorReport = "Your program encountered an unrecoverable error, can not draw on canvas. Error was:<br/><br/>";
    $('#webGL').append(errorReport + e);
}