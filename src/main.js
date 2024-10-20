import Asteroid from "./spaceObjects/Asteroid";
import StarField from "./spaceObjects/StarFields";

import { FirstPersonControls } from './controls/FirstPersonControls';

let starFields = [];
let asteroids = [];
let asteroidCount = 250;

const clock = new THREE.Clock(); 

// Create the scene
const scene = new THREE.Scene();

// Create 2 cameras for front and rear-view 
const camera = new THREE.PerspectiveCamera(
75, // Field of view
window.innerWidth / window.innerHeight, // Aspect ratio
0.1, // Near plane
2000 // Far plane
);
camera.position.z = 500; // Move the camera back to see the stars and asteroids

// Create the renderer and add it to the document
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

let viewport = new THREE.Vector4();
renderer.getCurrentViewport(viewport);

//create second camera 
const rearViewCamera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    2000
);
rearViewCamera.position.z = 500;
//Have camera look behind 
rearViewCamera.rotateX(Math.PI)

let rearViewport = new THREE.Vector4(window.innerWidth/4,window.innerHeight - 300,1000, 250);

const controls = new FirstPersonControls( camera, renderer.domElement );
controls.autoForward = true
controls.movementSpeed = 30;
controls.constrainVertical = true;
controls.keyControlsOn = false;
controls.mousePointersOn = false;
//uncomment below line to disable mouse controls(simply move forward)
//controls.activeLook = false;

// Create the stars (particles)
createStars();

// Create the asteroids (3D objects)
createAsteroids();

// Add a basic light source
let light = new THREE.DirectionalLight(0xffffff, 1);
light.position.set(camera.position.x, camera.position.y, 1);
scene.add(light);

// Function to create the starfield
function createStars() {
    let starField1 = new StarField(650, 2000);
    scene.add(starField1.mesh);
    starFields.push(starField1);

    let starField2 = new StarField(-650,2000);
    scene.add(starField2.mesh);
    starFields.push(starField2);

    let starField3 = new StarField(100, 500);
    scene.add(starField3.mesh);
    starFields.push(starField3);
}

// Create asteroid objects
function createAsteroids() {
    for (let i = 0; i < asteroidCount; i++) {
        let newAsteroid = new Asteroid();

        // Add the asteroid to the scene
        scene.add(newAsteroid.mesh);
        //uncomment to see boundingBoxes
        //scene.add(newAsteroid.boundingBoxHelper)
        asteroids.push(newAsteroid);
    }
}

// Update starfield and asteroids
function animate() {

    //get deltaTime using clock object then make larger since its a small value 
    //deltaTime is the time between now and last time deltaTime was called 
    let deltaTime = clock.getDelta() * 10;
    
    //use time as a constantly increasing number(for sin function)
    let time = Date.now() * 0.001 

    //update camera controls
    controls.update(deltaTime * 1.2);

    // Move stars forward
    starFields.forEach((starField) => {
        //let positions = starField.geometry.attributes.position.array;
        if (starField.mesh.position.distanceTo(camera.position) > 450) {
            starField.resetObject(camera.position);
        }
        
        starField.geometry.attributes.position.needsUpdate = true; // Mark as needing update
    });

    //check asteroids and rotate them
    asteroids.forEach((asteroid) => {

        //scale astroid up by oscillating value(sin) with time and asteroid scaling factor
        asteroid.scaleFactor = Math.sin(time * asteroid.scaleSpeed) * 1.5 + 3
        asteroid.uniforms.time.value += deltaTime

        //update drift 
        asteroid.updateObject(deltaTime * 2);

        // Reset the asteroid if it's behind the camera
        if (asteroid.mesh.position.distanceTo(camera.position) > 2000) {
            asteroid.resetObject(camera.position)
        }

        //check object intersects camera 
        if (asteroid.intersectsPosition(camera.position)) {
            console.log("You hit an asteroid! Pos: ", camera.position);
        }

        /* Might want this in future or something similar
        asteroids.forEach((asteroidToCheck) => {
            if (asteroid.intersectsBox(asteroidToCheck.boundingBox)) {
                console.log("Asteroids hit eachother!")
            }
        });
        */
    });

    //render front view
    renderer.setViewport(viewport)
    renderer.setClearColor(0x00000)
    renderer.setScissorTest( false);

    camera.updateProjectionMatrix();
    
    renderer.render(scene, camera);

    //set rear view camera position to front camera position 
    rearViewCamera.position.set(camera.position.x, camera.position.y, camera.position.z)

    //have rear view camera look at same spot as front camera  
    rearViewCamera.lookAt(controls.lookAtVec)
    //turn rearView Camera around 
    rearViewCamera.rotateX(Math.PI)

    //set clear color to grey to look like a mirror 
    renderer.setClearColor(0xaeb4b8)
    //set viewport and scissor
    renderer.setViewport(rearViewport)
    renderer.setScissor(rearViewport)
    renderer.setScissorTest( true);

    rearViewCamera.updateProjectionMatrix();
    
    renderer.render(scene, rearViewCamera);

    requestAnimationFrame(animate);
}
 // Start the animation loop
 animate();

// Handle window resize
window.addEventListener("resize", onWindowResize, false);

// Handle window resizing
function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    controls.handleResize();
}