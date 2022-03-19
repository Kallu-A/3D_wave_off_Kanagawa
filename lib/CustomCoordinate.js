"use strict"; // good practice - see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Strict_mode
/*global THREE, scene*/

let axisX, axisY, axisZ, arrowX, arrowZ, arrowY;

function drawAllAxes(params) {
    params = params || {};
    var axisRadius = params.axisRadius !== undefined ? params.axisRadius:0.04;
    var axisLength = params.axisLength !== undefined ? params.axisLength:11;
    var axisTess = params.axisTess !== undefined ? params.axisTess:48;

    var axisXMaterial = new THREE.MeshLambertMaterial({ color: 0xFF0000 });
    var axisYMaterial = new THREE.MeshLambertMaterial({ color: 0x00FF00 });
    var axisZMaterial = new THREE.MeshLambertMaterial({ color: 0x0000FF });
    axisXMaterial.side = THREE.DoubleSide;
    axisYMaterial.side = THREE.DoubleSide;
    axisZMaterial.side = THREE.DoubleSide;
    axisX = new THREE.Mesh(
        new THREE.CylinderGeometry(axisRadius, axisRadius, axisLength, axisTess, 1, true),
        axisXMaterial
    );
    axisY = new THREE.Mesh(
        new THREE.CylinderGeometry(axisRadius, axisRadius, axisLength, axisTess, 1, true),
        axisYMaterial
    );
    axisZ = new THREE.Mesh(
        new THREE.CylinderGeometry(axisRadius, axisRadius, axisLength, axisTess, 1, true),
        axisZMaterial
    );
    axisX.rotation.z = - Math.PI / 2;
    axisX.position.x = axisLength/2-1;

    axisY.position.y = axisLength/2-1;

    axisZ.rotation.y = - Math.PI / 2;
    axisZ.rotation.z = - Math.PI / 2;
    axisZ.position.z = axisLength/2-1;

    scene.add( axisX );
    scene.add( axisY );
    scene.add( axisZ );

    arrowX = new THREE.Mesh(
        new THREE.CylinderGeometry(0, 4*axisRadius, 4*axisRadius, axisTess, 1, true),
        axisXMaterial
    );
    arrowY = new THREE.Mesh(
        new THREE.CylinderGeometry(0, 4*axisRadius, 4*axisRadius, axisTess, 1, true),
        axisYMaterial
    );
    arrowZ = new THREE.Mesh(
        new THREE.CylinderGeometry(0, 4*axisRadius, 4*axisRadius, axisTess, 1, true),
        axisZMaterial
    );
    arrowX.rotation.z = - Math.PI / 2;
    arrowX.position.x = axisLength - 1 + axisRadius*4/2;

    arrowY.position.y = axisLength - 1 + axisRadius*4/2;

    arrowZ.rotation.z = - Math.PI / 2;
    arrowZ.rotation.y = - Math.PI / 2;
    arrowZ.position.z = axisLength - 1 + axisRadius*4/2;

    scene.add( arrowX );
    scene.add( arrowY );
    scene.add( arrowZ );
}

function removeAllAxes() {
    scene.remove(arrowX);
    scene.remove(arrowY);
    scene.remove(arrowZ);
    scene.remove(axisX);
    scene.remove(axisY);
    scene.remove(axisZ);
}
