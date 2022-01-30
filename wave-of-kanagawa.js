"use strict";

var camera, scene, renderer;
var windowScale;
var cameraControls, effectController;
const clock = new THREE.Clock();
const near = 20;
const far = 200;

// Color
const colorBG = 0xdfc7a5;
const seaMaterial = new THREE.MeshLambertMaterial({
    color: 0x1C4E76
});

const boatMaterial = new THREE.MeshLambertMaterial({
    color: 0xE4BD92
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


    var ground = new THREE.Mesh(
        new THREE.BoxGeometry(50, 2, 50), seaMaterial);
    ground.position.x = 0;
    ground.position.y = 0;
    ground.position.z = 0;
    scene.add(ground);

    var boat = new THREE.Mesh(
        new THREE.BoxGeometry(20, 5, 20), boatMaterial);
    ground.position.x = 0;
    ground.position.y = 0;
    ground.position.z = 0;
    scene.add( boat );

}

// permet le lien entre le gui
function renderGUI() {}

// initialise le gui
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