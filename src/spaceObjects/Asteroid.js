/**
 * Asteroid class represents an asteroid in our game
 */
export default class Asteroid {
    /**
     * Creates Asteroid object
     * @author Gaby Zola wrote the code contained in constructor
     */
    constructor() {
        this.geometry = new THREE.IcosahedronGeometry(10, 1); // Create a base asteroid geometry (Icosahedron)
        this.material = new THREE.MeshStandardMaterial({
            color: 0xa52a2a, // Brown asteroid
            flatShading: true, // Gives it a rugged look
        });

        this.mesh = new THREE.Mesh(this.geometry, this.material);
   
       // Randomize the position, size, and rotation of each asteroid
       this.mesh.position.x = THREE.MathUtils.randFloatSpread(3000); // Random x position
       this.mesh.position.y = THREE.MathUtils.randFloatSpread(3000); // Random y position
       this.mesh.position.z = THREE.MathUtils.randFloat(-1000, 350); // Random z (depth)
   
       // Randomize the size of the asteroid
       let scale = THREE.MathUtils.randFloat(0.5, 3);
       this.mesh.scale.set(scale, scale, scale);
   
       // Randomize the rotation
       this.mesh.rotation.x = Math.random() * Math.PI;
       this.mesh.rotation.y = Math.random() * Math.PI;
    }

    /**
     * Moves object to back of scene to be reused 
     * 
     * @param {THREE.vector3} Camera's position (camera.position)
     * @note API name could be improved possibly 
     */
    resetObject(cameraPos) {
        this.mesh.position.z = cameraPos.z - 1300; // Reset to far distance
        this.mesh.position.x = THREE.MathUtils.randFloatSpread(1000); // Randomize x position
        this.mesh.position.y = THREE.MathUtils.randFloatSpread(1000); // Randomize y position
    }
}   