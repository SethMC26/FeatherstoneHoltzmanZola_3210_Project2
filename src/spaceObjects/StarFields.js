/**
 * Starfield class represents an stars in our game
 */
export default class StarField {
    /**
     * Creates StarField object
     * @author Gaby Zola wrote the code contained in constructor
     */
    constructor(offsetVect, starCount=2000) {
        this.offset = offsetVect;
        this.geometry = new THREE.BufferGeometry();
        this.positions = new Float32Array(starCount * 3); // X, Y, Z for each star

        for (let i = 0; i < starCount; i++) {
            // Randomly position the stars within a large cube
            this.positions[i * 3] = THREE.MathUtils.randFloatSpread(1000); // x
            this.positions[i * 3 + 1] = THREE.MathUtils.randFloatSpread(1000); // y
            this.positions[i * 3 + 2] = THREE.MathUtils.randFloat(-1000, 350); // z (depth)
        }

        // Set the star positions as geometry
        this.geometry.setAttribute("position", new THREE.BufferAttribute(this.positions, 3));
        this.geometry.attributes.position.needsUpdate = true; // Mark as needing update
        
        // Create the material for stars (white points)
        this.material = new THREE.PointsMaterial({
            color: 0xffffff,
            size: 2, // Size of each point (star)
            sizeAttenuation: true, // Makes the size diminish with distance
        });

        // Create the star particle system
        this.mesh = new THREE.Points(this.geometry, this.material);
    }

    /**
     * Moves object to back of scene to be reused 
     * 
     * @param {THREE.vector3} Camera's position (camera.position)
     * @note API name could be improved possibly 
     */
    resetObject(cameraPos) {
        this.mesh.position.x = cameraPos.x // Randomize x position
        this.mesh.position.y = cameraPos.y // Randomize y position
        this.mesh.position.z = cameraPos.z - this.offset// Reset to far distance

    }
}