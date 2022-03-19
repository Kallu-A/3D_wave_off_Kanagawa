"use strict";

let camera, scene, renderer, gui, stats, webGL, isParticuleSet, returnButton;
let cameraControls, effectController;
const clock = new THREE.Clock();
const near = 0.2;
const far = 300;
const canvasWidth = 846;
const canvasHeight = 494;

const decalx = 5;
const decalz = 5;
const size = 50;
const toRadian = Math.PI/180;
const hypotenuse = 4.5;
let pointFront = new Float32Array(3);
let pointEnd = new Float32Array(3);
let wave, wasAdventure;
let topWave = [];
let oldCamera = new Float32Array(3);
wasAdventure = false;
isParticuleSet = false;

const positions = new Float32Array((6 + 6 + 6 + 6) * 3 * size);
const uv = new Float32Array(( (6 + 6 + 6 + 6) * 3 * size ) * (2/3) ); // on précalcule les uv car ceux-ci ne changent pas

// Texture
var loader = new THREE.TextureLoader();
let waveTexture = loader.load('res/wave_texture.png');
let waveWhiteTexture = loader.load('res/white_part.png');
let particleTexture = loader.load( 'res/particle.png' );

let incrX = 0, incrY = 0.02, vY = 1;
waveTexture.wrapS = waveTexture.wrapT = THREE.MirroredRepeatWrapping;
waveWhiteTexture.wrapS = waveWhiteTexture.wrapT = THREE.RepeatWrapping;

// Color
const colorBG = 0xD1D1D1;

const waveMaterial = new THREE.MeshBasicMaterial({
    map: waveTexture
});

const boatMaterial = new THREE.MeshLambertMaterial({
    color: 0xE4BD92
});

const whiteWaveMaterial = new THREE.MeshBasicMaterial({
    /*color: 0xEAEAEA,*/ map: waveWhiteTexture, transparent: true
});

const mountainMaterial = new THREE.MeshLambertMaterial({
    color: 0x163C59
});

const snowMaterial = new THREE.MeshBasicMaterial({
    color: 0xF1F1F1
});

const particleMaterial = new THREE.SpriteMaterial( { map: particleTexture, transparent: true, depthWrite: false } );

let skyBoxLoader = new THREE.CubeTextureLoader()
    .setPath('res/skybox/')
    .load(['px.png', 'mx.png',
        'py.png', 'my.png',
        'pz.png', 'mz.png']);

//gui var
let axes = false;
let isDrag= false;
let resetCamera = {
    reset: function() {
        camera.setFocalLength(24.4);
        cameraControls.target.set(decalx + size / 2,15 , decalz);
        camera.position.set(decalx + size / 2, 30, -size + decalz);
        cameraControls.enable = true;
    }
};
let resetWave = {
    reset: function() {
        effectController.freq = 6.8
        liveValue = 0;
        resetWaveFunction();
        generateParticles();
        groupParticle.children.forEach(function(child) {
            if (child.position.y <= 1 || child.position.x <= decalx) groupParticle.remove(child);
            child.position.x -= 16;
            child.position.y -= 3 / child.position.x;
        });
    }
}
let resetLive = {
    reset: function() {
        effectController.incrementLiveValue = 0.2;
        effectController.liveMode = false;
        effectController.adventureMode = false;
    }
}

// contient les object qui vont subir des changements
let lastFreq = 6.8;
let movables = [];
let oldRot = new Float32Array(3);
for (let i = 0; i < oldRot.length; i++) {
    oldRot[i] = 0;
}
let live = false;
let liveValue = 0;
let incrementLiveValue = 0.2;

// PARTICULES utiles pour tout retirer d'un coup
let groupParticle = new THREE.Object3D();

// Drag EventsControls
let eventsControls;

// ici se font les dessins
function draw() {
    drawGround();
    drawMountain();
    create_boats();
    createWave();
}

// créer la vague
function createWave() {
    let i = 0;
    let y, ya, ym1, ym2;
    ym1 = 0;
    ym2 = 0;
    for (let ix = 0; ix < size; ix++) {
        // decal les valeurs sur notre ground
        y = calculateY(ix, true);
        ya = calculateY(ix + 1, true);

        if ( ix !== 0 ) {
            if ( ym2 < ym1 &&  ym1 > y  && y > 2 && ym1 > 2 && ym2 > 2) white_part_wave(decalx + ix - 1);
        }

        // vue du haut
        {
            //triangle 1
            // point devant
            positions[i] = decalx + ix;
            positions[i + 1] = -1;
            positions[i + 2] = decalz;

            positions[i + 1] += y * 0.3; // y

            // point arrière
            i += 3;
            positions[i] = decalx + ix;
            positions[i + 1] = -1;
            positions[i + 2] = decalz + size;

            positions[i] += 1; // x
            positions[i + 1] += y; // y

            // point devant suivant
            i += 3;
            positions[i] = decalx + ix + 1;
            positions[i + 1] = -1;
            positions[i + 2] = decalz;

            positions[i + 1] += ya * 0.3; // y

            // triangle 2
            // point devant suivant
            i += 3;
            positions[i] = decalx + ix + 1;
            positions[i + 1] = -1;
            positions[i + 2] = decalz;

            positions[i + 1] += ya * 0.3; // y

            // point arrière
            i += 3;
            positions[i] = decalx + ix;
            positions[i + 1] = -1;
            positions[i + 2] = decalz + size;

            positions[i] += 1; // x
            positions[i + 1] += y; // y

            // point arrière suivant
            i += 3;
            positions[i] = decalx + ix + 1;
            positions[i + 1] = -1;
            positions[i + 2] = decalz + size;

            positions[i] += 1; // x
            positions[i + 1] += ya; // y
            i += 3;
        }

        // vue de face
        {
            //triangle 1
            // point devant
            positions[i] = decalx + ix;
            positions[i + 1] = -1;
            positions[i + 2] = decalz;


            // point devant haut
            i += 3;
            positions[i] = decalx + ix;
            positions[i + 1] = -1;
            positions[i + 2] = decalz;

            positions[i + 1] += y * 0.3; // y


            // point devant suivant
            i += 3;
            positions[i] = decalx + ix + 1;
            positions[i + 1] = -1;
            positions[i + 2] = decalz;


            //triangle 2
            // point devant haut
            i += 3;
            positions[i] = decalx + ix;
            positions[i + 1] = -1;
            positions[i + 2] = decalz;

            positions[i + 1] += y * 0.3; // y

            // point devant haut suivant
            i += 3;
            positions[i] = decalx + ix + 1;
            positions[i + 1] = -1;
            positions[i + 2] = decalz;

            positions[i + 1] += ya * 0.3; // y

            // point suivant
            i += 3;
            positions[i] = decalx + ix + 1;
            positions[i + 1] = -1;
            positions[i + 2] = decalz;


            i += 3;
        }

        // vue de derrière
        {
            //triangle 1
            // point derrière
            positions[i] = decalx + ix;
            positions[i + 1] = -1;
            positions[i + 2] = decalz + size;

            // point derrière suivant
            i += 3;
            positions[i] = decalx + ix + 1;
            positions[i + 1] = -1;
            positions[i + 2] = decalz + size;

            // point derrière haut
            i += 3;
            positions[i] = decalx + ix + 1;
            positions[i + 1] = -1;
            positions[i + 2] = decalz + size;

            positions[i + 1] += y; // y

            //triangle 2
            // point derrière haut
            i += 3;
            positions[i] = decalx + ix + 1;
            positions[i + 1] = -1;
            positions[i + 2] = decalz + size;

            positions[i + 1] += y; // y

            // point derrière bas
            i += 3;
            positions[i] = decalx + ix + 1;
            positions[i + 1] = -1;
            positions[i + 2] = decalz + size;

            // point derrière haut suivant
            i += 3;
            positions[i] = decalx + ix + 2;
            positions[i + 1] = -1;
            positions[i + 2] = decalz + size;

            positions[i + 1] += ya; // y

            i += 3;
        }
        ym2 = ym1;
        ym1 = y;

    }

    // pour ne pas avoir la texture blanche qui pop d'un coup
    for (let ix = size; ix < size + 10; ix++ ) {
        y = calculateY(ix, true);
        ya = calculateY(ix + 1, true);

        if ( ix !== 0 ) {
            if ( ym2 < ym1 &&  ym1 > y  && y > 2 && ym1 > 2 && ym2 > 2) white_part_wave(decalx + ix - 1);
        }

        ym2 = ym1;
        ym1 = y;
    }

    let ix2 = size;
    i = 2700;
    {
        // fait la partie en x = size de la face de la vague
        y = calculateY(ix2, true);
        // triangle 1
        // point devant bas
        positions[i] = decalx + ix2;
        positions[i + 1] = -1;
        positions[i + 2] = decalz;

        // point devant haut
        i += 3;
        positions[i] = decalx + ix2;
        positions[i + 1] = -1;
        positions[i + 2] = decalz;

        positions[i + 1] += y * 0.3; // y

        // point arrière haut
        i += 3;
        positions[i] = decalx + ix2;
        positions[i + 1] = -1;
        positions[i + 2] = decalz + size;

        positions[i] += 1;
        positions[i + 1] += y; // y

        i += 3;
        // triangle 2
        // point bas arrière
        positions[i] = decalx + ix2;
        positions[i + 1] = -1;
        positions[i + 2] = decalz + size;

        // point bas devant
        i += 3;
        positions[i] = decalx + ix2;
        positions[i + 1] = -1;
        positions[i + 2] = decalz;


        // point haut arrière
        i += 3;
        positions[i] = decalx + ix2;
        positions[i + 1] = -1;
        positions[i + 2] = decalz + size;

        positions[i + 1] += y; // y
        positions[i] += 1;

        i += 3;
    }
    {

        // fait la partie en x = decalx de la face de la vague
        ix2 = 0;
        y = calculateY(ix2, true);
        // triangle 1
        // point devant haut
        positions[i] = decalx;
        positions[i + 1] = -1;
        positions[i + 2] = decalz;

        positions[i + 1] += y * 0.3; // y

        // point devant bas
        i += 3;
        positions[i] = decalx;
        positions[i + 1] = -1;
        positions[i + 2] = decalz;

        // point arrière haut
        i += 3;
        positions[i] = decalx + ix2;
        positions[i + 1] = -1;
        positions[i + 2] = decalz + size;

        positions[i] += 1;
        positions[i + 1] += y; // y

        // triangle 2
        // point devant bas
        i += 3;
        positions[i] = decalx;
        positions[i + 1] = -1;
        positions[i + 2] = decalz;

        // point arrière bas
        i += 3;
        positions[i] = decalx;
        positions[i + 1] = -1;
        positions[i + 2] = decalz + size;

        // point arrière haut
        i += 3;
        positions[i] = decalx + ix2;
        positions[i + 1] = -1;
        positions[i + 2] = decalz + size;

        positions[i] += 1;
        positions[i + 1] += y; // y
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute( 'position', new THREE.BufferAttribute( positions, 3 ) );
    geometry.setAttribute( 'uv', new THREE.BufferAttribute( uv, 2 ) );
    let object = new THREE.Mesh(geometry, waveMaterial);
    wave = object;
    scene.add(object);
    scene.add(groupParticle);
}

// créer la partie supérieur blanche de la vague
function white_part_wave(x) {
    let i = 0;
    let i_uv = 0, ixu = 0;
    let y, ya, ym1, ym2;
    ym1 = 0;
    let decalUV = 0
    let position = new Float32Array(532);
    let uv_white = new Float32Array(532);
    let inc = 1 / ( (15 - lastFreq) * 2  + 8);
    for (let ix = x - decalx - (23 - lastFreq)  ; ix < x - decalx + (15 - lastFreq) ; ix++) {
        // decal les valeurs sur notre ground
        if (ix + decalx > decalx + size) {
            decalUV -= inc;
            continue;
        }
        if ( ix + decalx <= decalx -1 ) {
            decalUV += inc;
            continue;
        }
        y = calculateY(ix, true) + 0.3;
        ya = calculateY(ix + 1, true) + 0.3;

        // vue du haut uv
        {
            // triangle 1
            // point devant
            uv_white[i_uv] = ixu * inc + decalUV;
            uv_white[i_uv + 1] = 0;
            i_uv += 2;

            //point arrière
            uv_white[i_uv] = ixu * inc + decalUV;
            uv_white[i_uv + 1] = 1;
            i_uv += 2;

            //point devant suivant
            uv_white[i_uv] = (ixu + 1) * inc + decalUV;
            uv_white[i_uv + 1] = 0;
            i_uv += 2;

            // triangle 2
            // point devant suivant
            uv_white[i_uv] = (ixu + 1) * inc + decalUV;
            uv_white[i_uv + 1] = 0;
            i_uv += 2;

            // point arrière
            uv_white[i_uv] = ixu * inc + decalUV;
            uv_white[i_uv + 1] = 1;
            i_uv += 2;

            // point arrière suivant
            uv_white[i_uv] = (ixu + 1) * inc + decalUV;
            uv_white[i_uv + 1] = 1;
            i_uv += 2;
        }

        // vue du haut
        {
            //triangle 1
            // point devant
            position[i] = decalx + ix;
            position[i + 1] = -1;
            position[i + 2] = decalz;

            position[i + 1] += y * 0.3; // y

            // point arrière
            i += 3;
            position[i] = decalx + ix;
            position[i + 1] = -1;
            position[i + 2] = decalz + size;

            position[i] += 1; // x
            position[i + 1] += y; // y

            // point devant suivant
            i += 3;
            position[i] = decalx + ix + 1;
            position[i + 1] = -1;
            position[i + 2] = decalz;

            position[i + 1] += ya * 0.3; // y

            // triangle 2
            // point devant suivant
            i += 3;
            position[i] = decalx + ix + 1;
            position[i + 1] = -1;
            position[i + 2] = decalz;

            position[i + 1] += ya * 0.3; // y

            // point arrière
            i += 3;
            position[i] = decalx + ix;
            position[i + 1] = -1;
            position[i + 2] = decalz + size;

            position[i] += 1; // x
            position[i + 1] += y; // y

            // point arrière suivant
            i += 3;
            position[i] = decalx + ix + 1;
            position[i + 1] = -1;
            position[i + 2] = decalz + size;

            position[i] += 1; // x
            position[i + 1] += ya; // y
            i += 3;
        }

        ym2 = ym1;
        ym1 = y;
        ixu++;
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute( 'position', new THREE.BufferAttribute( position, 3 ) );
    geometry.setAttribute( 'uv', new THREE.BufferAttribute( uv_white, 2 ) );
    let object = new THREE.Mesh(geometry, whiteWaveMaterial);
    scene.add(object);
    topWave.push(object);

    if (x === size + decalx + 8 && !isParticuleSet) {
        isParticuleSet = true;
        scene.remove(groupParticle);
        groupParticle = new THREE.Object3D();
        generateParticles();
    } else {
        incrParticles();
    }
    if (x < decalx + 20)
        isParticuleSet = false;
}

// génere des particules
function generateParticles() {
    let particles, sizeParticule;
    for ( let count = 0; count < lastFreq * 20; count += 1 ) {
        particles = new THREE.Sprite( particleMaterial);
        sizeParticule = Math.random() * 0.6 + 0.1;
        particles.scale.set(sizeParticule, sizeParticule, sizeParticule);
        particles.position.x = (decalx + size) - ( Math.random() * 30);
        particles.position.z = ( Math.random() * size) + decalz;
        particles.position.y = Math.random() * lastFreq * (particles.position.x / 15) * ((particles.position.z + decalz) / size) + 1;
        groupParticle.add(particles);
    }
}

// s'occupe de déplacer les particules
function incrParticles() {
    groupParticle.children.forEach(function(child) {
        if (child.position.y <= 1 || child.position.x <= decalx) groupParticle.remove(child);
        child.position.x -= incrementLiveValue * 0.8;
        child.position.y -= (2 / child.position.x) * (incrementLiveValue * 7 ) - incrementLiveValue / 9;
    });
}

// dessine le sol
function drawGround() {
    let ground = new THREE.Mesh(
        new THREE.BoxGeometry(size, 2, size), waveMaterial);
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

// créer tous les bateaux
function create_boats() {
    // bas droite
    create_boat(size/3, size/3, 0, 85 * toRadian, 0, 0);

    //haut droite
    create_boat(size/3, size/1.2, 0, 95 * toRadian, 0, 1);

    //gauche
    create_boat(size/ 1.2, size/2, 0, 70 * toRadian, 0, 2);
}

// créer un bateau
function create_boat(x, z, rx, ry, rz, i) {
    let loader = new THREE.OBJLoader();
    // Charge le fichier
    loader.load('res/boat.obj ',
        function(object) {
            object.scale.set(1.7,1.7,1.7);
            object.position.x = x;
            object.position.z = z;
            object.rotation.x = rx;
            object.rotation.y = ry;
            object.rotation.z = rz;

            object.traverse( function (obj) {
                if (obj.isMesh){
                    obj.material = boatMaterial;
                }
            } );
            movables.push(object);
            updateBoatWave(object, i);
            scene.add(object);
            eventsControls.attach(object);
        });
}

// Adapte le bateau à la forme de la vague
// La fonction sera appelé au début et seulement après quand la rotation du bateau devra changer
function updateBoatWave(movable, i) {
    // adapte à la hauteur de la vague
    // calcul en fonction de la position de la pente de la vague
    let y = calculateY(movable.position.x - 5, true);
    y = ((chaslesY(y, movable.position.z)) - 0.8) * 0.97;
    movable.position.y = y;

    // calcul des points d'extrémité du bateau
    pointFront[0] = hypotenuse ;
    pointFront[2] = movable.position.z;
    pointEnd[0] = -pointFront[0] + 3;
    pointEnd[2] = pointFront[2];

    // remise des valeurs par rapport à la position du bateau pour le calcul de la hauteur
    pointFront[0] += movable.position.x - 6;
    pointEnd[0] += movable.position.x - 6;

    // calcul des y
    pointFront[1] = calculateY(pointFront[0], false);
    pointEnd[1] = calculateY(pointEnd[0], false);
    pointFront[1] = chaslesY(pointFront[1], pointFront[2], false);
    pointEnd[1] = chaslesY(pointEnd[1], pointEnd[2], false);

    let op = pointFront[1] - pointEnd[1];
    let adj = pointFront[0] - pointEnd[0];
    oldRot[i] = 50 * (Math.atan(op / adj)) * toRadian;

    movable.rotateOnWorldAxis(new THREE.Vector3(0, 0, 1), oldRot[i]);
}

function resetWaveFunction() {
    scene.remove(wave);
    topWave.forEach( item => {
        scene.remove(item);
    });
    topWave.pop();
    topWave.pop();
    topWave.pop();

    createWave();
    for (let i = 0; i < movables.length; i++) {
        movables[i].rotateOnWorldAxis(new THREE.Vector3(0, 0, 1), -oldRot[i]);
        updateBoatWave(movables[i], i);
    }
}

// permet le lien entre le gui
function renderGUI() {
    // GUI
    if (!axes && effectController.newAxes) {
        axes = true;
        drawAllAxes({ axisLength: 20, axisRadius: 0.3, axisTess: 7 });
        document.getElementById('axes_legend').style.visibility = "visible";

    } else if (axes && !effectController.newAxes){
        document.getElementById('axes_legend').style.visibility = "hidden";
        removeAllAxes();
        axes = false;
    }

    if (effectController.fullScreen) {
        if (webGL.className === "") {
            renderer.setSize(window.innerWidth, window.innerHeight);
            webGL.className = "display-full";
            returnButton.className = "hide"
            document.body.style.overflow = "hidden";

        }
    } else {
        if (webGL.className === "display-full") {
            renderer.setSize(canvasWidth, canvasHeight);
            webGL.className = "";
            returnButton.className ="float-button"
            document.body.style.overflow = "visible";
        }
    }

    if (lastFreq !== effectController.freq) {
        lastFreq = effectController.freq;

        resetWaveFunction();
    }

    incrementLiveValue = effectController.incrementLiveValue;
    if (effectController.liveMode === true ) {
        liveValue += incrementLiveValue;
        if (liveValue > 999999) liveValue = 0; // pour éviter que si le mode live tourne pendant très longtemps on dépasse la taille de bit maximum pour liveValue

        resetWaveFunction();
    }

    // gère le mode aventure
    if ( effectController.adventureMode === true ) {
        wasAdventure = true;
        for (let i = 0; i < 3; i++)
            eventsControls.detach(movables[i]);
        // met la camera a la place du point de vue sur le bateau
        if (effectController.boatSelected === "0") {
            camera.position.x = movables[1].position.x + 3;
            camera.position.z = movables[1].position.z;
        } else if (effectController.boatSelected === "1") {
            camera.position.x = movables[0].position.x + 3;
            camera.position.z = movables[0].position.z;
        } else if (effectController.boatSelected === "2") {
            camera.position.x = movables[2].position.x + 3;
            camera.position.z = movables[2].position.z;
        }

        camera.position.y = calculateY(camera.position.x - 6, true);
        camera.position.y = (chaslesY(camera.position.y, camera.position.z, false));
        if (camera.position.z < size / 1.5) camera.position.y += 0.3;
        camera.position.y += 2;

        // change la fov pour une meilleur immersion
        camera.setFocalLength(15);

        let posZ;
        if (camera.position.z > 30 ) {
            posZ = camera.position.z - 8
        } else {
            posZ = camera.position.z + 8
        }
        // défini une target a observer pour un meilleur rendu
        cameraControls.target.set( camera.position.x + 10,
            camera.position.y * 1.8,
            posZ );

        cameraControls.enable = false;
        effectController.liveMode = true;

        // désactive l'aspect de la camera
    } else if (wasAdventure === true) {
        camera.setFocalLength(24.4);
        cameraControls.target.set(decalx + size / 2,15 , decalz);
        camera.position.set(decalx + size / 2, 30, -size + decalz);
        cameraControls.enable = true;
        wasAdventure = false;
        effectController.liveMode = false;
        for (let i = 0; i < 3; i++)
            eventsControls.attach(movables[i]);
    }
}

// initialise le gui
function setupGui() {
    effectController = {
        newAxes: axes,
        freq: 6.8,
        liveMode: false,
        incrementLiveValue: incrementLiveValue,
        adventureMode: false,
        boatSelected: "0",
        fullScreen: false
    }

    gui = new dat.GUI();
    const settingFolder = gui.addFolder("Settings");
    settingFolder.add(effectController, "newAxes").name("Show axes");
    settingFolder.add(effectController, "fullScreen").name("Full Screen");
    settingFolder.add(effectController, "freq", 3, 8).name("Wave").listen();
    const runFolder = gui.addFolder("Live Mode");
    runFolder.add(effectController, "liveMode").name("Run").listen();
    runFolder.add(effectController, "incrementLiveValue", 0.05, 1).name("Speed").listen();
    runFolder.add(effectController, "adventureMode").name("Human view").listen();
    runFolder.add(effectController, "boatSelected", { 'Bateau 1': 0, 'Bateau 2': 1, 'Bateau 3': 2 }).name("Boat");
    const resetFolder = gui.addFolder("Reset");
    resetFolder.add(resetCamera, "reset").name("Reset Camera");
    resetFolder.add(resetWave, "reset").name("Reset Wave");
    resetFolder.add(resetLive, "reset").name("Reset Live Mode");

    runFolder.open();
    settingFolder.open();
}

function init() {
    const canvasRatio = canvasWidth / canvasHeight;

    // RENDERER
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.gammaOutput = false;
    renderer.setSize(canvasWidth, canvasHeight);
    renderer.setClearColor(colorBG, 1);

    // CAMERA
    camera = new THREE.PerspectiveCamera(45, canvasRatio, near, far);
    camera.position.set(decalx + size / 2, 30, -size + decalz);

    // CONTROLS
    cameraControls = new THREE.OrbitControls(camera, renderer.domElement);
    cameraControls.target.set(decalx + size / 2,15 , decalz);

    camera.setFocalLength(24.4);
    // STATS
    stats = new Stats();
    stats.setMode(0);

    fillScene();

    // EventControls
    eventsControls = new EventsControls( camera, renderer.domElement );

    eventsControls.attachEvent( 'mouseOver', function () {
        cameraControls.enable = false;
        this.container.style.cursor = 'pointer';
    });

    eventsControls.attachEvent( 'mouseOut', function () {
        cameraControls.enable = true;
        this.container.style.cursor = 'auto';
    });

    eventsControls.attachEvent( 'dragAndDrop', function () {
        isDrag = true;
        camera.position.set(oldCamera[0], oldCamera[1], oldCamera[2]);
        cameraControls.enable = false;
        this.container.style.cursor = 'move';
        this.focused.position.y = this.previous.y;

        for (let i = 0; i < 3; i++) {
            if (this.focused === movables[i]) {
                movables[i].rotateOnWorldAxis(new THREE.Vector3(0, 0, 1), -oldRot[i]);
                updateBoatWave(movables[i], i);
            }
        }
    });

    eventsControls.attachEvent( 'mouseUp', function () {
        cameraControls.enable = true;
        isDrag = false;
        this.container.style.cursor = 'auto';
    });

    eventsControls.map = wave;

}

function fillScene() {
    // SCENE
    scene = new THREE.Scene();
    scene.fog = new THREE.Fog(colorBG, far / 2, far / 1.5 );

    // LIGHTS
    scene.add(new THREE.AmbientLight(0X838384));
    let light = new THREE.DirectionalLight( 0xE4BD92, 0.5 );
    light.position.set( decalx, 30, decalz );
    scene.add(light);

    // BACKGROUND (SKYBOX)
    scene.background = skyBoxLoader;

    draw();
    tweenStart.chain(tweenEnd);
    tweenEnd.chain(tweenStart);
    tweenStart.start();
    waveWhiteTexture.offset.set(0, 5);

}

// permet de lancer l'animation
function animate() {
    window.requestAnimationFrame(animate);
    render();
    stats.update();
}

// permet d'afficher la nouvelle scene a chaque nouvelle animation demandé
function render() {
    let delta = clock.getDelta();
    cameraControls.update(delta);
    if (!isDrag) {
        oldCamera[0] = camera.position.x;
        oldCamera[1] = camera.position.y;
        oldCamera[2] = camera.position.z;
    }

    incrX += effectController.incrementLiveValue / 100;
    TWEEN.update();

    renderGUI();
    renderer.render(scene, camera);
}

// fait le lien entre l'html et le js
function addToDOM() {
    webGL = document.getElementById("webGL");
    returnButton = document.getElementById("returnButton");
    webGL.appendChild(renderer.domElement);
    document.getElementById("stats").appendChild( stats.domElement );
}

// calcul le y de la vague par rapport au x
function calculateY(x, isLimit) {
    let xDecal = x + liveValue;
    let y  = ((x * 0.3) * Math.sin(((lastFreq * xDecal) / (size * 1.1)) * -1)) + lastFreq * 0.7;
    y += 3;
    if (y < 0 ) {
        if (isLimit) {
            y = 0.2;
        } else {
            // contrainte force du mouvement lié à la résistance de l'eau
            y /= 2;
        }
    }

    return y;
}

// applique la formule de Chasles
function chaslesY(y, z, isLimit) {
    let decalY = y * 0.3
    y = z * ( (y - decalY)  / (decalz + size) );
    y += decalY;
    if (y < 0 ) {
        if (isLimit) {
            y = 0.2;
        } else {
            // contrainte force du mouvement lié à la résistance de l'eau
            y /= 2;
        }
    }
    return y;
}

// précalcule les UV pour le faire qu'une fois
function precalculateUv_Pos() {
    let i = 0;
    let y, ya;
    let inc = 1 / size;
    for (let ix = 0; ix < size; ix++) {
        // decal les valeurs sur notre ground
        // vue du haut
        {
            // triangle 1
            // point devant
            uv[i] = ix * inc;
            uv[i + 1] = 0;
            i += 2;

            //point arrière
            uv[i] = ix * inc;
            uv[i + 1] = 1;
            i += 2;

            //point devant suivant
            uv[i] = (ix + 1) * inc;
            uv[i + 1] = 0;
            i += 2;

            // triangle 2
            // point devant suivant
            uv[i] = (ix + 1) * inc;
            uv[i + 1] = 0;
            i += 2;

            // point arrière
            uv[i] = ix * inc;
            uv[i + 1] = 1;
            i += 2;

            // point arrière suivant
            uv[i] = (ix + 1) * inc;
            uv[i + 1] = 1;
            i += 2;
        }
        // vue de face
        {
            //triangle 1
            // point devant
            uv[i] = ix * inc;
            uv[i + 1] = 0.3;
            i += 2;
            // point devant haut
            uv[i] = ix * inc;
            uv[i + 1] = 0;
            i += 2;
            // point devant suivant
            uv[i] = (ix + 1) * inc;
            uv[i + 1] = 0.3;
            i += 2;

            //triangle 2
            // point devant haut
            uv[i] = ix * inc;
            uv[i + 1] = 0;
            i += 2;
            // point devant haut suivant
            uv[i] = (ix + 1) * inc;
            uv[i + 1] = 0;
            i += 2;
            // point suivant
            uv[i] = (ix + 1) * inc;
            uv[i + 1] = 0.3;
            i += 2;
        }
        // vue derrière
        {
            //triangle 1
            // point derrière
            uv[i] = ix * inc;
            uv[i + 1] = 0.7;
            i += 2;

            // point derrière suivant
            uv[i] = (ix + 1) * inc;
            uv[i + 1] = 0.7;
            i += 2;
            // point derrière haut
            uv[i] = ix * inc;
            uv[i + 1] = 1;
            i += 2;

            //triangle 2
            // point derrière suivant haut
            uv[i] = (ix + 1) * inc;
            uv[i + 1] = 1;
            i += 2;
            // point derrière bas suivant
            uv[i] = (ix + 1) * inc;
            uv[i + 1] = 0.7;
            i += 2;
            // point derrière haut suivant
            uv[i] = (ix + 1) * inc;
            uv[i + 1] = 1;
            i += 2;
        }
    }

    // fait la partie en x = size de la face de la vague
    {
        // triangle 1
        // point devant bas
        uv[i + 1] = 0;
        uv[i] = 0.9;
        i += 2;

        // point devant haut
        uv[i + 1] = 0;
        uv[i] = 1;
        i += 2;

        // point arrière haut
        uv[i + 1] = 1;
        uv[i] = 1;
        i += 2;

        // triangle 2
        // point bas arrière
        uv[i + 1] = 1;
        uv[i] = 0.9;
        i += 2;

        // point bas devant
        uv[i + 1] = 0;
        uv[i] = 0.9;
        i += 2;


        // point haut arrière
        uv[i + 1] = 1;
        uv[i] = 1;
        i += 2;
    }
    // fait la partie en x = decalx de la face de la vague
    {
        // triangle 1
        // point devant haut
        uv[i + 1] = 0;
        uv[i] = 0;
        i += 2;
        // point devant bas
        uv[i + 1] = 0;
        uv[i] = 0.1;
        i += 2;

        // point arrière haut
        uv[i + 1] = 1;
        uv[i] = 0;
        i += 2;

        // triangle 2
        // point devant bas
        uv[i + 1] = 0;
        uv[i] = 0.1;
        i += 2;

        // point arrière bas
        uv[i + 1] = 1;
        uv[i] = 0.1;
        i += 2;

        // point arrière haut
        uv[i + 1] = 1;
        uv[i] = 0;
    }
}

// TWEEN
var current = { x: 0 };

let update  = function(){
    incrY += 0.005 * effectController.incrementLiveValue;
    waveTexture.offset.set(incrX, incrY);
    waveWhiteTexture.offset.set(0, incrY);
}

let updateReverse  = function(){
    incrY -= 0.005 * effectController.incrementLiveValue;
    waveTexture.offset.set(incrX, incrY);
    waveWhiteTexture.offset.set(0, incrY);
}

let tweenStart = new TWEEN.Tween(current)
    .to({x: +100}, 3000)
    .delay(1)
    .easing(TWEEN.Easing.Bounce.In)
    .onUpdate(update);

let tweenEnd = new TWEEN.Tween(current)
    .to({x: +0}, 3000)
    .delay(1)
    .easing(TWEEN.Easing.Bounce.Out)
    .onUpdate(updateReverse);
// FIN - TWEEN

try {
    init();
    precalculateUv_Pos();
    setupGui();
    // initialise les particules à la main lors du lancement
    generateParticles();
    groupParticle.children.forEach(function(child) {
        if (child.position.y <= 1 || child.position.x <= decalx) groupParticle.remove(child);
        child.position.x -= 16;
        child.position.y -= 3 / child.position.x;
    });

} catch (e) {
    document.getElementById('webGL').textContent = "Error : " + e;
    console.log(e);
}

// lance l'animation que quand la page est prête
document.addEventListener("DOMContentLoaded", function() {
    // ajoute listener resize window adapté le mode plein écran webGL
    window.addEventListener("resize", function() {
        if (effectController.fullScreen) {
            renderer.setSize(window.innerWidth, window.innerHeight);
        }
    });
    try {
        animate();
    } catch (e) {
        document.getElementById('webGL').textContent = "Error : " + e;
        console.log(e);
    }
});