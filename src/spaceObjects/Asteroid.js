import { fragmentShaderText, vertexShaderText } from "../shaders/shaderStrings";
/**
 * Creates Asteroid object
 * @author Gaby Zola wrote the code contained in constructor
 */
export default class Asteroid {

    constructor() {
        //enums of our movement types
        this.movement = {
            LINEAR: 0,
            PARABOLIC: 1,
            CORKSCREW: 2
        }

        //start linear 
        this.movementType = this.movement.LINEAR;

        //half will move with some parabolic movement 
        if (THREE.MathUtils.randInt(0, 1)) {
            this.movementType = this.movement.PARABOLIC;
            //set rotation axis 
            this.rotationAxis = new THREE.Vector3(THREE.MathUtils.randFloat(0,1), THREE.MathUtils.randFloat(0,1),THREE.MathUtils.randFloat(0,1))
            //half of that half (1/4) have corkscrew movement 
            if (THREE.MathUtils.randInt(0, 1)) {
                this.movementType = this.movement.CORKSCREW
            }
        }

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
        //this.scaleSpeed = 1.35;
        
        //set random size of asteroid 
        let size = THREE.MathUtils.randFloat(15, 20);

        this.geometry = new THREE.IcosahedronGeometry(size, 1); // Create a base asteroid geometry (Icosahedron)

        this.material = new THREE.ShaderMaterial (
            {
                vertexShader: vertexShaderText,
                fragmentShader: fragmentShaderText,
                uniforms: this.uniforms
            }
        )
        

        //additional rasterization component setting a different depth test for rasterizer
        //this solves star issue and adds a trippy like effect of objects being in odd spots 
        this.material.depthFunc = THREE.NotEqualDepth

        //uncomment line for easy debug
        //this.material = new THREE.MeshBasicMaterial({color: 0xFFFFFF * Math.random()})
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
     * @param {THREE.Vector3} cameraPos Camera's position (camera.position)
     * @note API name could be improved possibly 
     */
    resetObject(cameraPos) {
        let randomSign = Math.random() < 0.5 ? -1 : 1;

        this.mesh.position.z = cameraPos.z + 1000 * randomSign; // Reset to far distance
        this.mesh.position.x = cameraPos.x + THREE.MathUtils.randFloatSpread(1500); // Randomize x position
        this.mesh.position.y = cameraPos.y + THREE.MathUtils.randFloatSpread(1500); // Randomize y position
    }

    /**
     * Update the objects scale, and location with a scale factor(delta time)
     * @param {Number} deltaTime Scale to update drift by (delta time is a good idea here)
     */
    updateObject(deltaTime){
        //console.log(scale);
        //use time as a constantly increasing number(for sin function)
        let time = Date.now() * 0.001 
        //scale astroid up by oscillating value(sin) with time and asteroid scaling factor
        this.scaleFactor = Math.sin(time * this.scaleSpeed) * 1.5 + 3
        //update unifroms 
        this.uniforms.scaleFactor.value = this.scaleFactor;
        this.uniforms.time.value += deltaTime;

        //set scale 
        this.mesh.scale.setScalar(this.scaleFactor);

        //move based on movement type
        switch(this.movementType) {
            case this.movement.LINEAR:
                let linearScale = deltaTime * 3;
                this.mesh.translateX(this.tVec.x * linearScale);
                this.mesh.translateY(this.tVec.y * linearScale);
                this.mesh.translateZ(this.tVec.z * linearScale);
                break;
            case this.movement.PARABOLIC:
                //console.log(scale * 0.01);
                this.rotateAboutWorldAxis(this.mesh, this.rotationAxis, deltaTime * 0.01);
                break;
            case this.movement.CORKSCREW:
                let normTVec = this.tVec.clone().normalize();
                this.mesh.translateX(this.tVec.x * deltaTime);
                this.mesh.translateY(this.tVec.y * deltaTime);
                this.mesh.translateZ(this.tVec.z * deltaTime);
                this.rotateAboutWorldAxis(this.mesh, normTVec, 0.01 * deltaTime);
                break;
        }

        //update boundary box 
        this.boundingBox = new THREE.Box3().setFromObject(this.mesh);
        this.boundingBoxHelper.update();
    }

    /**
     * Checks if bounding box for this object intersects another
     * @param {THREE.Box3} boundingBox Box3 of object 
     * @returns true if intersecting false otherwise
     */
    intersectsBox(boundingBox) {
        if (this.boundingBox.containsBox(boundingBox)) {
            return false;
        }

        return this.boundingBox.intersectsBox(boundingBox)
    }

    /**
     * 
     * @param {THREE.Vector3} position Vec3 of position to check
     * @returns True if point in bounding box false otherwise
     */
    intersectsPosition(position) {
        return this.boundingBox.containsPoint(position);
    }

    //From Prof. Stuetzle unit6 Lecture notes nothing has been modified 
    // From https://stackoverflow.com/questions/26660395/rotation-around-an-axis-three-js
    // In order to rotate about an axis , you must construct the
    // rotation matrix ( which will rotate about
    // the axis by default )
    rotateAboutWorldAxis(object, axis, angle) {
        var rotationMatrix = new THREE.Matrix4();
        rotationMatrix.makeRotationAxis( axis.normalize(), angle );
        var currentPos = new THREE.Vector4(object.position.x, object.position.y, object.position.z, 1);
        var newPos = currentPos.applyMatrix4(rotationMatrix);
        object.position.x = newPos.x;
        object.position.y = newPos.y;
        object.position.z = newPos.z;
    }
}   