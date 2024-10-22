import { FirstPersonControls } from './controls/FirstPersonControls';
import ObjectPool from "./spaceObjects/ObjectPool";

//create Clock to use for time and delta time
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

//save viewport of main camera 
let viewport = new THREE.Vector4();
renderer.getCurrentViewport(viewport);

//create second camera 
const rearViewCamera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1500
);
rearViewCamera.position.z = 500;
rearViewCamera.fov = 90;
rearViewCamera.up.set(0,1,0);
//Have camera look behind 
rearViewCamera.rotateX(Math.PI);

//create rearViewport
let rearViewport = new THREE.Vector4(window.innerWidth/4,window.innerHeight/1.45,window.innerWidth/2, window.innerHeight/4);

//create controls for main camera
const controls = new FirstPersonControls( camera, renderer.domElement );
controls.autoForward = true
controls.movementSpeed = 30;
controls.constrainVertical = true;
controls.keyControlsOn = false;
controls.mousePointersOn = false;
//uncomment below line to disable mouse controls(simply move forward)
//controls.activeLook = false;

// Add a basic light source
let light = new THREE.DirectionalLight(0xffffff, 1);
light.position.set(camera.position.x, camera.position.y, 1);
scene.add(light);

const objectPool = new ObjectPool(scene);
// Update starfield and asteroids
function animate() {

    //get deltaTime using clock object then make larger since its a small value 
    //deltaTime is the time between now and last time deltaTime was called 
    let deltaTime = clock.getDelta() * 10;

    //update camera controls 
    controls.update(deltaTime * 1.2);

    //have object Pool Update objects 
    objectPool.updateObjects(deltaTime, camera.position);

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
    renderer.setClearColor(0x1E202B)
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
    camera.aspect = window.innerWidth / window.innerHeight;

    camera.updateProjectionMatrix();
    rearViewCamera.updateProjectionMatrix();
    rearViewport = new THREE.Vector4(window.innerWidth/4,window.innerHeight/1.45,window.innerWidth/2, window.innerHeight/4);

    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.getCurrentViewport(viewport);

    controls.handleResize();
}