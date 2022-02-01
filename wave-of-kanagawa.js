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

var rotation = 0;

// Color
const colorBG = 0xD1D1D1;

const seaMaterial = new THREE.MeshLambertMaterial({
    color: 0x1C4E76
});

const boatMaterial = new THREE.MeshLambertMaterial({
    color: 0xE4BD92
});

const mountainMaterial = new THREE.MeshLambertMaterial({
    color: 0x163C59
});

const snowMaterial = new THREE.MeshBasicMaterial({
    color: 0xF1F1F1, //specular: 0XFFFFFF, shininess: 4
});

//gui var
let axes = true;

// contient les object qui vont faire une rotation
let movables = [];
let oldRotate = [];

// ici se font les dessins
function draw() {
    //z is blue
    //y is green
    //x is red
    drawGround();
    drawMountain();

    // bas droite
    create_boat(size/3, 0, size/3, 0, 85 * toRadian, 0);

    //haut droite
    create_boat(size/3, 0, size/1.2, 0, 95 * toRadian, 0);

    //gauche
    create_boat(size/ 1.2, 0, size/2, 0, 70 * toRadian, 0);

    /*
    let boat = new THREE.Mesh(
        new THREE.CylinderGeometry(1, 1, 15, 20, 6), boatMaterial
    );
    boat.rotation.x = 90 * toRadian;
    boat.rotation.z = 45 * toRadian;
    boat.position.x = decalx + 30;
    boat.position.y = 0;
    boat.position.z = decalz + 30;

    scene.add(boat);
     */

}

// dessine le sol
function drawGround() {
    let ground = new THREE.Mesh(
        new THREE.BoxGeometry(size, 2, size), seaMaterial);
    ground.position.x = decalx + size / 2;
    ground.position.y = -2;
    ground.position.z = decalz + size / 2;
    scene.add(ground);
}

// dessine la montagne
function drawMountain() {

    let mountain = new THREE.Mesh(
        new THREE.CylinderGeometry(1, 20, 13, 10, 6), mountainMaterial);
    mountain.translateZ(decalz + size * 1.35);
    mountain.translateX( size / 2);
    mountain.translateY(3);
    scene.add(mountain);

    let snow = new THREE.Mesh(
        new THREE.CylinderGeometry(1, 10, 6, 10, 6), snowMaterial);
    snow.translateZ(decalz + size * 1.35);
    snow.translateX( size / 2);
    snow.translateY( 7);
    scene.add(snow);


}

// charge les différents fichiers
function create_boat(x, y, z, rx, ry, rz) {
    var loader = new THREE.OBJLoader();
    // Charger le fichier

    loader.load('boat.obj ',
        function(object) {
            object.scale.set(1.7,1.7,1.7);
            object.position.x = x;
            object.position.y = y - 1;
            object.position.z = z;
            object.rotation.x = rx;
            object.rotation.y = ry;
            object.rotation.z = rz;

            object.traverse( function (obj) {
                if (obj.isMesh){
                    obj.material = boatMaterial;
                }
            } );
            oldRotate.push(object.rotation.y);
            movables.push(object);
            scene.add(object);
        });

}

// permet le lien entre le gui
function renderGUI() {
    if (effectController.newAxes !== axes ) {
        axes = effectController.newAxes;
        fillScene();
    }
}

// initialise le gui
function setupGui() {

    effectController = {
        newAxes: axes,
        rot: 0.0,
    }

    let gui = new dat.GUI();
    gui.add(effectController, "newAxes").name("Show axes");
    gui.add(effectController, "rot", -5.0, 5.0,).name("Rotation");
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
    camera.position.set(decalx + size / 2, 30, -size + decalz);

    // CONTROLS
    cameraControls = new THREE.OrbitControls(camera, renderer.domElement);
    cameraControls.target.set(decalx + size / 2,15 , decalz);

    fillScene();
}

function fillScene() {
    // SCENE
    scene = new THREE.Scene();
    scene.fog = new THREE.Fog(colorBG, far, far);

    // LIGHTS
    scene.add(new THREE.AmbientLight(0X838384));
    var light = new THREE.DirectionalLight( 0xE4BD92, 0.5 );
    light.position.set( decalx, 30, decalz );
    scene.add(light);

    if (axes) {
        Coordinates.drawAllAxes({ axisLength: 20, axisRadius: 0.3, axisTess: 7 });
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

    for (let i = 0; i < movables.length; i++) {
        movables[i].rotation.y =  effectController.rot + oldRotate[i];
    }
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
