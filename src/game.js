import Asteroid from "./spaceObjects/Asteroid";
import StarField from "./spaceObjects/StarFields";

let starFields = [];
let asteroids = [];
let asteroidCount = 250;
let mouseDiff = new THREE.Vector2(0,0)
let cameraLookAt = new THREE.Vector3(0,0,0); // Speed of camera rotation

// Create the scene
let scene = new THREE.Scene();

// Create 2 cameras for front and rear-view 
let camera = new THREE.PerspectiveCamera(
75, // Field of view
window.innerWidth / window.innerHeight, // Aspect ratio
0.1, // Near plane
1000 // Far plane
);
camera.position.z = 500; // Move the camera back to see the stars and asteroids

camera.lookAt(cameraLookAt)

// Create the renderer and add it to the document
let renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

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
    camera.position.z -= 4;
    //console.log(camera.position)
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

        // Rotate the asteroid for visual effect
        asteroid.mesh.rotation.x += 0.03;
        asteroid.mesh.rotation.y += 0.03;

        // Reset the asteroid if it's behind the camera
        if (asteroid.mesh.position.z > camera.position.z) {
            asteroid.resetObject(camera.position)
        }
    });

    // Render the scene from the perspective of the camera
    renderer.render(scene, camera);

    requestAnimationFrame(animate);
}

// Handle window resize
window.addEventListener("resize", onWindowResize, false);

// Handle window resizing
function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

document.addEventListener('mousemove', onMouseMove, false);

let movementSpeed = 0.50
let mouse = THREE.Vector2
function onMouseMove(event) {
    mouseDiff.x = event.movementX || 0
    mouseDiff.y = event.movementY || 0

    
    // Update camera rotation based on mouse movement
    camera.position.x += mouseDiff.x * movementSpeed; // Horizontal movement
    camera.position.y -= mouseDiff.y * movementSpeed; // Vertical movement
    /*
    cameraLookAt.x += event.movementX * movementSpeed
    //set limits to prevent world breakage 
    cameraLookAt.x = (cameraLookAt.x < -200) ? -200 : cameraLookAt.x;
    cameraLookAt.x = (cameraLookAt.x > 200) ? 200 : cameraLookAt.x;

    cameraLookAt.y -= event.movementY * movementSpeed
    cameraLookAt.y = (cameraLookAt.y < -50) ? -50 : cameraLookAt.y;
    cameraLookAt.y = (cameraLookAt.y > 50) ? 50 : cameraLookAt.y;

    camera.lookAt(cameraLookAt)
    console.log("camer look at ", cameraLookAt)
    */

}

// Start the animation loop
animate();