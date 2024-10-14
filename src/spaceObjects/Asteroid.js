/**
 * Asteroid class represents an asteroid in our game
 */
import { fragmentShaderText, vertexShaderText } from "../shaders/shaderStrings";
export default class Asteroid {
    /**
     * Creates Asteroid object
     * @author Gaby Zola wrote the code contained in constructor
     */
    constructor() {
        this.geometry = new THREE.IcosahedronGeometry(10, 1); // Create a base asteroid geometry (Icosahedron)
        /*
        this.material = new THREE.MeshStandardMaterial({
            color: 0xa52a2a, // Brown asteroid
            flatShading: true, // Gives it a rugged look
        });
        */
        let _tVec = new THREE.Vector3(0.0,0.0,0)
        //vectors with rotations of theta 
        let _rVec = new THREE.Vector3(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI)
        this.uniforms = {
            scaleFactor: { value: 1.0},
            time : { value: 0.0},
            tVec: { value: _tVec},
            rVec: { value: _rVec}
        }

        //speed each asteroid scales up and down 
        //not sure if i like each asteroid scaling up and down by itself or all asteroids scaling together better
        this.scaleSpeed = THREE.MathUtils.randFloat(0.001,2)
        //this.scaleSpeed = 0


        this.material = new THREE.ShaderMaterial (
            {
                vertexShader: vertexShaderText,
                fragmentShader: fragmentShaderText,
                uniforms: this.uniforms
            }
        )
        
        this.mesh = new THREE.Mesh(this.geometry, this.material);
   
       // Randomize the position, size, and rotation of each asteroid
       this.mesh.position.x = THREE.MathUtils.randFloatSpread(2000); // Random x position
       this.mesh.position.y = THREE.MathUtils.randFloatSpread(2000); // Random y position
       this.mesh.position.z = THREE.MathUtils.randFloat(-1000, 350); // Random z (depth)
   
       // Randomize the size of the asteroid
       let scale = THREE.MathUtils.randFloat(0.5, 3);
       this.mesh.scale.set(scale, scale, scale);
   
       // Randomize the rotation
       //this.mesh.rotation.x = ;
       //this.mesh.rotation.y = Math.random() * Math.PI;
    }

    /**
     * Moves object to back of scene to be reused 
     * 
     * @param {THREE.vector3} Camera's position (camera.position)
     * @note API name could be improved possibly 
     */
    resetObject(cameraPos) {
        this.mesh.position.z = cameraPos.z - 1500; // Reset to far distance
        this.mesh.position.x = THREE.MathUtils.randFloatSpread(2000); // Randomize x position
        this.mesh.position.y = THREE.MathUtils.randFloatSpread(2000); // Randomize y position
    }
}   