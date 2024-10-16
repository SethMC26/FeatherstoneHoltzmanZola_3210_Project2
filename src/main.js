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
1000 // Far plane
);
camera.position.z = 500; // Move the camera back to see the stars and asteroids

// Create the renderer and add it to the document
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);


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
    let starField1 = new StarField();
    scene.add(starField1.mesh);
    starFields.push(starField1);
}

// Create asteroid objects
function createAsteroids() {
    for (let i = 0; i < asteroidCount; i++) {
        let newAsteroid = new Asteroid();

        // Add the asteroid to the scene
        scene.add(newAsteroid.mesh);
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
    controls.update(deltaTime * 1.5);

    // Move stars forward
    starFields.forEach((starField) => {
        //let positions = starField.geometry.attributes.position.array;
        if (starField.mesh.position.z > camera.position.z) {
            starField.resetObject(camera.position);
        }
        
        starField.geometry.attributes.position.needsUpdate = true; // Mark as needing update
    });

    //check asteroids and rotate them
    asteroids.forEach((asteroid) => {

        //scale astroid up by oscillating value(sin) with time and asteroid scaling factor
        asteroid.uniforms.scaleFactor.value = Math.sin(time * asteroid.scaleSpeed) * 1.5 + 2.5
        asteroid.uniforms.time.value += deltaTime

        // Reset the asteroid if it's behind the camera
        if (asteroid.mesh.position.z > camera.position.z + 100) {
            asteroid.resetObject(camera.position)
        }
    });

    // Render the scene from the perspective of the camera
    renderer.render(scene, camera);

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