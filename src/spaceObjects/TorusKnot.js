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
            CORKSCREW: 2
        };

        // Randomly choose the movement type
        //this.movementType = THREE.MathUtils.randInt(0, 2);

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

        // Shader material
        this.material = new THREE.ShaderMaterial({
            vertexShader: vertexShaderText,
            fragmentShader: fragmentShaderText,
            uniforms: {
                scaleFactor: { value: 1.0 },
                time: { value: 0.0 }
            }
        });

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
            cameraPos.z + THREE.MathUtils.randFloatSpread(1000)
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

        // Movement logic
        switch (this.movementType) {
            case this.movement.LINEAR:
                let linearScale = deltaTime * 0.05;;
                this.mesh.translateX(this.tVec.x * linearScale);
                this.mesh.translateY(this.tVec.y * linearScale);
                this.mesh.translateZ(this.tVec.z * linearScale);
                break;
            case this.movement.PARABOLIC:
                this.rotateAroundWorldAxis(this.mesh, this.rotationAxis, deltaTime * 0.0075);
                break;
            case this.movement.CORKSCREW:
                this.mesh.translateOnAxis(this.tVec.normalize(), deltaTime);
                this.rotateAroundWorldAxis(this.mesh, this.tVec, deltaTime * 0.0075);
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
        return this.boundingBox.containsPoint(position);
    }

    // Rotate an object around an arbitrary world axis
    rotateAroundWorldAxis(object, axis, angle) {
        let rotationMatrix = new THREE.Matrix4();
        rotationMatrix.makeRotationAxis(axis.normalize(), angle);
        object.position.applyMatrix4(rotationMatrix);
    }
}
