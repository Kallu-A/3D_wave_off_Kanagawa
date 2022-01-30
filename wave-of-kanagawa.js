"use strict";

let camera, scene, renderer;
let cameraControls, effectController;
const clock = new THREE.Clock();
const near = 20;
const far = 400;

const decalx = 5;
const decalz = 5;
const size = 50;
const toRadian = Math.PI/180;
// Color
const colorBG = 0xF6F5E1;
const seaMaterial = new THREE.MeshLambertMaterial({
    color: 0x1C4E76
});

const boatMaterial = new THREE.MeshLambertMaterial({
    color: 0xE4BD92
});

//gui var
let axes = true;

// ici se font les dessins
function draw() {
    //z is blue
    //y is green
    //x is red

    let ground = new THREE.Mesh(
        new THREE.BoxGeometry(size, 2, size), seaMaterial);
    ground.position.x = decalx + size / 2;
    ground.position.y = -2;
    ground.position.z = decalz + size / 2;
    scene.add(ground);

    let boat = new THREE.Mesh(
        new THREE.CylinderGeometry(1, 1, 15, 20, 6), boatMaterial
    );
    boat.rotation.x = 90 * toRadian;
    boat.rotation.z = 45 * toRadian;
    boat.position.x = decalx + 10;
    boat.position.y = 0;
    boat.position.z = decalz + 10;

    scene.add(boat);

}

// permet le lien entre le gui
function renderGUI() {
    if (effectController.newAxes !== axes) {
        axes = effectController.newAxes;

        fillScene();
    }
}

// initialise le gui
function setupGui() {

    effectController = {
        newAxes: axes
    }

    let gui = new dat.GUI();
    gui.add(effectController, "newAxes").name("Show axes");
}


function init() {
    const canvasWidth = 846;
    const canvasHeight = 494;
    const canvasRatio = canvasWidth / canvasHeight;

    // RENDERER
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.gammaInput = true;
    //renderer.gammaOutput = true;
    renderer.setSize(canvasWidth, canvasHeight);
    renderer.setClearColor(colorBG, 1);

    // CAMERA
    camera = new THREE.PerspectiveCamera(45, canvasRatio, near, far);
    camera.position.set(decalx + size / 2, 25, -60 + decalz);

    // CONTROLS
    cameraControls = new THREE.OrbitControls(camera, renderer.domElement);
    cameraControls.target.set(decalx + size / 2,0 , decalz);

    fillScene();
}

function fillScene() {
    // SCENE
    scene = new THREE.Scene();
    scene.fog = new THREE.Fog(colorBG, far, far);

    // LIGHTS
    scene.add(new THREE.AmbientLight(0XFFFFFF));

    if (axes) {
        Coordinates.drawAllAxes({ axisLength: 20, axisRadius: 0.3, axisTess: 10 });
        document.getElementById('axes_legend').style.visibility = "visible";
    } else {
        document.getElementById('axes_legend').style.visibility = "hidden";
    }

    draw();
}


// permet de lancer l'animation 
function animate() {
    window.requestAnimationFrame(animate);
    render();
}

// permet d'afficher la nouvelle scene a chaque nouvel animation demandé
function render() {
    let delta = clock.getDelta();
    cameraControls.update(delta);

    renderGUI();
    renderer.render(scene, camera);
}

// utile pour faire le lien entre l'html et le js
function addToDOM() {
    let container = document.getElementById("webGL");
    container.appendChild(renderer.domElement);
}

try {
    init();
    setupGui();
    animate();
} catch (e) {
    document.getElementById('webGL').textContent = e;
}