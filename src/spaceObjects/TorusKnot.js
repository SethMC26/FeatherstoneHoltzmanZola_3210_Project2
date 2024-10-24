import { fragmentShaderText, vertexShaderText } from "../shaders/shaderStrings";

/**
 * Creates a TorusKnot object
 */
export default class TorusKnot {

    constructor() {
        // Enum for movement types
        this.movement = {
            LINEAR: 0,
            PARABOLIC: 1,
        };

        // Randomly choose the movement type
        this.movementType = THREE.MathUtils.randInt(0, 1);

        // Set transformation vector for linear movement
        this.tVec = new THREE.Vector3(
            THREE.MathUtils.randFloatSpread(10), 
            THREE.MathUtils.randFloatSpread(10), 
            THREE.MathUtils.randFloatSpread(10)
        );

        // Random rotation vector for parabolic and corkscrew movement
        this.rotationAxis = new THREE.Vector3(new THREE.Vector3(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI)
);

        // Scaling speed
        this.scaleSpeed = THREE.MathUtils.randFloat(0.001, 2);

        // Set random size for torus knot geometry
        let radius = THREE.MathUtils.randFloat(5, 20);
        let tube = THREE.MathUtils.randFloat(1.5, 5);

        // Create torus knot geometry
        this.geometry = new THREE.TorusKnotGeometry(radius, tube, 100, 16);

        let _rVec = new THREE.Vector3(Math.random() * 0.01,Math.random() * 0.01,Math.random() * 0.01)
        this.uniforms = {
            scaleFactor: { value: 1.0 },
            time: { value: 0.0 },
            rVec: { value: _rVec},
            smallColor: {value: new THREE.Vector3(Math.random(), Math.random(), Math.random())},
            bigColor: {value: new THREE.Vector3(Math.random(), Math.random(), Math.random())}
        }
        // Shader material
        this.material = new THREE.ShaderMaterial({
            vertexShader: vertexShaderText,
            fragmentShader: fragmentShaderText,
            uniforms: this.uniforms
        });

        //additional rasterization for material
        this.material.depthFunc = THREE.NotEqualDepth

        // Create the mesh
        this.mesh = new THREE.Mesh(this.geometry, this.material);

        // Set random position
        this.mesh.position.set(
            THREE.MathUtils.randFloatSpread(2000), 
            THREE.MathUtils.randFloatSpread(2000), 
            THREE.MathUtils.randFloat(-1000, 350)
        );

        // Bounding box
        this.boundingBox = new THREE.Box3().setFromObject(this.mesh);
    }

    /**
     * Moves the object to a distant position to be reused
     * 
     * @param {THREE.Vector3} cameraPos The camera's current position
     */
    resetObject(cameraPos) {
        this.mesh.position.set(
            cameraPos.x + THREE.MathUtils.randFloatSpread(1500),
            cameraPos.y + THREE.MathUtils.randFloatSpread(1500),
            cameraPos.z + THREE.MathUtils.randFloatSpread(2000)
        );
    }

    /**
     * Updates the object's movement and scale
     * 
     * @param {Number} deltaTime The delta time to determine animation speed
     */
    updateObject(deltaTime) {
        // Update scale factor
        let time = Date.now() * 0.001;
        let scaleFactor = Math.sin(time * this.scaleSpeed) * 1.5 + 3;
        this.mesh.scale.setScalar(scaleFactor);
        this.uniforms.scaleFactor.value = scaleFactor;
        this.uniforms.time.value += deltaTime;

        // Movement logic
        switch (this.movementType) {
            case this.movement.LINEAR:
                let linearScale = deltaTime * 0.05;;
                this.mesh.translateX(this.tVec.x * linearScale);
                this.mesh.translateY(this.tVec.y * linearScale);
                this.mesh.translateZ(this.tVec.z * linearScale);
                break;
            case this.movement.PARABOLIC:
                //this.rotateAboutWorldAxis(this.mesh, this.rotationAxis, deltaTime * 0.0075);
                break;
        }

        // Update bounding box
        this.boundingBox.setFromObject(this.mesh);
    }

    /**
     * Checks if this object contains the provided position
     * 
     * @param {THREE.Vector3} position The position to check
     * @returns {Boolean} True if the position is inside the bounding box, otherwise false
     */
    intersectsPosition(position) {
        if (!this.boundingBox.containsPoint(position)) {
            return false;
        }

        this.movementType = this.movement.LINEAR;

        this.tVec.x *= -1;
        this.tVec.y *= -1;
        this.mesh.position.z -= 10;
        this.tVec.z = -10;
        
        this.updateObject(5)

        return true;
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
