import { fragmentShaderText, vertexShaderText } from "../shaders/shaderStrings";
/**
 * Asteroid class represents an asteroid in our game
 */
export default class Asteroid {
    /**
     * Creates Asteroid object
     * @author Gaby Zola wrote the code contained in constructor
     */
    constructor() {
       //transformation vectors for linear transforms 
        this.tVec = new THREE.Vector3(THREE.MathUtils.randFloatSpread(10), THREE.MathUtils.randFloatSpread(10), THREE.MathUtils.randFloatSpread(10))

        //vectors with rotations of theta 
        let _rVec = new THREE.Vector3(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI)

        //Initialize scaleFactor of Asteroid
        this.scaleFactor = 1.0;

        //uniforms for shaders
        this.uniforms = {
            scaleFactor: { value: 1.0},
            time : { value: 0.0},
            rVec: { value: _rVec}
        }

        //speed each asteroid scales up and down 
        //not sure if i like each asteroid scaling up and down by itself or all asteroids scaling together better
        this.scaleSpeed = THREE.MathUtils.randFloat(.0001,2)
        //this.scaleSpeed = 1.5;
        
        //set random size
        let size = THREE.MathUtils.randFloat(15, 20);
        this.geometry = new THREE.IcosahedronGeometry(size, 1); // Create a base asteroid geometry (Icosahedron)

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
        
        //compute bounding box 
        this.boundingBox = new THREE.Box3().setFromObject(this.mesh);

        //boxhelper to draw bounding box
        this.randColor = new THREE.Color(Math.random(), Math.random(), Math.random())
        this.boundingBoxHelper = new THREE.BoxHelper(this.mesh, this.randColor)
    }

    /**
     * Moves object to back of scene to be reused 
     * 
     * @param {THREE.Vector3} Camera's position (camera.position)
     * @note API name could be improved possibly 
     */
    resetObject(cameraPos) {
        this.mesh.position.z = cameraPos.z + THREE.MathUtils.randFloat(-3000, -500); // Reset to far distance
        this.mesh.position.x = THREE.MathUtils.randFloatSpread(2000); // Randomize x position
        this.mesh.position.y = THREE.MathUtils.randFloatSpread(2000); // Randomize y position
    }

    /**
     * Update the objects scale, and location with a scale factor(delta time)
     * @param {Number} scale Scale to update drift by (delta time is a good idea here)
     */
    updateObject(scale){
        //update unifroms 
        this.uniforms.scaleFactor.value = this.scaleFactor;
        
        //set scale 
        this.mesh.scale.setScalar(this.scaleFactor);

        //scale = 0;
        //set position
        this.mesh.translateX(this.tVec.x * scale);
        this.mesh.translateY(this.tVec.y * scale);
        this.mesh.translateZ(this.tVec.z * scale);

        //update boundary box 
        this.boundingBox = new THREE.Box3().setFromObject(this.mesh);
        this.boundingBoxHelper.update();
    }
}   