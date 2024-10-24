import { FirstPersonControls } from "./controls/FirstPersonControls";
import ObjectPool from "./spaceObjects/ObjectPool";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

//create Clock to use for time and delta time
const clock = new THREE.Clock();

// Create the scene
const scene = new THREE.Scene();

// Create the renderer and add it to the document
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Create 2 cameras for front and rear-view
const camera = new THREE.PerspectiveCamera(
    60, //  human-like field of view
    window.innerWidth / window.innerHeight, // Aspect ratio
    0.1, // Near plane
    2000 // Far plane
);
//camera.position.z = 500; // Move the camera back to see the stars and asteroids

//save viewport of main camera
let viewport = new THREE.Vector4();
renderer.getCurrentViewport(viewport);

//create controls for main camera
const controls = new FirstPersonControls(camera, renderer.domElement);
controls.autoForward = false; // Initially set autoForward to false to pause movement
controls.movementSpeed = 30;
controls.constrainVertical = true;
controls.keyControlsOn = false;
controls.mousePointersOn = false;
//uncomment below line to disable mouse controls(simply move forward)
//controls.activeLook = false;

//create second camera
const rearViewCamera = new THREE.PerspectiveCamera(
    60, // Field of view
    window.innerWidth / window.innerHeight,
    0.1,
    1500
);
rearViewCamera.position.z = 500;
rearViewCamera.fov = 45;

//create rearViewport
let rearViewport = new THREE.Vector4(
    window.innerWidth / 4,
    window.innerHeight / 1.45,
    window.innerWidth / 2,
    window.innerHeight / 4
);

const rearViewControls = new FirstPersonControls(
    rearViewCamera,
    renderer.domElement
);
rearViewControls.autoForward = false; // we manually set position
rearViewControls.movementSpeed = 30;
rearViewControls.constrainVertical = true;
rearViewControls.keyControlsOn = false;
rearViewControls.mousePointersOn = false;

// Add a basic light source
let light = new THREE.DirectionalLight(0xffffff, 1);
light.position.set(camera.position.x, camera.position.y, 1);
scene.add(light);

//create new ObjectPool to create and manage objects in our scene
const objectPool = new ObjectPool(scene);

// Create the loader
const gltfLoader = new GLTFLoader();

// Declare the model variable at the top
let backgroundModel;
let cockpit;

// Define the animate function outside of the loader
function animate() {
    // Update model position if needed
    if (backgroundModel) {
        updateBackgroundModelPosition();
    }
    let deltaTime = clock.getDelta() * 10;

    // Update camera controls
    controls.update(deltaTime * 1.2);
    rearViewControls.update(deltaTime * 1.2);

    // Update object pool
    objectPool.updateObjects(deltaTime, camera.position, rearViewCamera.position);

        // Update speed display
        if (controls.currentSpeed !== undefined) {
            document.getElementById('speedDisplay').innerText = `Speed: ${controls.currentSpeed.toFixed(2)}`;
        } else {
            document.getElementById('speedDisplay').innerText = 'Speed: 0';
        }

    // Render front view
    renderer.setViewport(viewport);
    renderer.setClearColor(0x00000);
    renderer.setScissorTest(false);

    camera.updateProjectionMatrix();
    renderer.render(scene, camera);

    // Set rear view camera position to front camera position
    rearViewCamera.position.set(
        camera.position.x,
        camera.position.y,
        camera.position.z
    );
    rearViewCamera.rotateX(Math.PI);

    // Set clear color to grey to look like a mirror
    renderer.setClearColor(0x1e202b);
    renderer.setViewport(rearViewport);
    renderer.setScissor(rearViewport);
    renderer.setScissorTest(true);

    rearViewCamera.updateProjectionMatrix();
    renderer.render(scene, rearViewCamera);

    requestAnimationFrame(animate);
}

// Start the animation loop
animate();

// Load the GLB model for the background
gltfLoader.load(
    "src/models/galaxy.glb",
    (gltf) => {
        backgroundModel = gltf.scene; // Assign the loaded model to the declared variable
        scene.add(backgroundModel); // Add the model to the scene

        // Center the model and scale it up
        backgroundModel.position.set(0, 0, 0);
        backgroundModel.scale.set(1000, 1000, 1000); // Adjust scale as needed

        // Ensure the model is always rendered behind other objects
        backgroundModel.traverse((child) => {
            if (child.isMesh) {
                //child.material.depthWrite = false;
                //child.material.depthTest = false; // Disable depth testing
            }
        });
    },
    undefined,
    (error) => {
        console.error("An error occurred while loading the GLB model:", error);
    }
);

// Load the cockpit model
gltfLoader.load(
    "src/models/scene.gltf",
    (gltf) => {
        // Called when the resource is loaded
        cockpit = gltf.scene;

        // Adjust materials and textures
        cockpit.traverse((child) => {
            if (child.isMesh) {
                child.material.side = THREE.DoubleSide;

                if (child.material.map) {
                    child.material.map.encoding = THREE.sRGBEncoding;
                    child.material.map.needsUpdate = true;
                }
            }
        });

        // Scale and position the cockpit
        cockpit.scale.set(1, 1, 1); // Adjust as needed
        cockpit.position.set(0, 0, 0); // Adjust as needed

        // Add the cockpit to the camera
        camera.add(cockpit);
    },
    undefined,
    (error) => {
        console.error("An error occurred while loading the cockpit model:", error);
    }
);

// Update model position in the animation loop
function updateBackgroundModelPosition() {
    backgroundModel.position.copy(camera.position);
}

// Handle window resize
window.addEventListener("resize", onWindowResize, false);

// Handle window resizing
function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.aspect = window.innerWidth / window.innerHeight;

    camera.updateProjectionMatrix();
    rearViewCamera.updateProjectionMatrix();
    rearViewport = new THREE.Vector4(
        window.innerWidth / 4,
        window.innerHeight / 1.45,
        window.innerWidth / 2,
        window.innerHeight / 4
    );

    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.getCurrentViewport(viewport);

    controls.handleResize();
}
