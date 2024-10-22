import { fragmentShaderText, vertexShaderText } from "../shaders/shaderStrings";

/**
 * Creates TorusKnot object
 */
export default class TorusKnot {

    constructor() {
        // Enum for movement types
        this.movement = {
            LINEAR: 0,
            PARABOLIC: 1,
            CORKSCREW: 2
        };

        // Default to linear movement
        this.movementType = this.movement.LINEAR;

        // Set random movement types (parabolic or corkscrew)
        if (THREE.MathUtils.randInt(0, 1)) {
            this.movementType = this.movement.PARABOLIC;
            this.rotationAxis = new THREE.Vector3(THREE.MathUtils.randFloat(0,1), THREE.MathUtils.randFloat(0,1), THREE.MathUtils.randFloat(0,1));

            if (THREE.MathUtils.randInt(0, 1)) {
                this.movementType = this.movement.CORKSCREW;
            }
        }

        // Transformation vectors for linear motion
        this.tVec = new THREE.Vector3(THREE.MathUtils.randFloatSpread(10), THREE.MathUtils.randFloatSpread(10), THREE.MathUtils.randFloatSpread(10));

        // Random rotation vector
        let _rVec = new THREE.Vector3(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI);

        // Initialize scaleFactor for torus knot
        this.scaleFactor = 1.0;

        // Uniforms for shaders
        this.uniforms = {
            scaleFactor: { value: 1.0 },
            time: { value: 0.0 },
            rVec: { value: _rVec }
        };

        // Scaling speed for each torus knot (random for variability)
        this.scaleSpeed = THREE.MathUtils.randFloat(0.001, 2);

        // Set random size of torus knot geometry
        let radius = THREE.MathUtils.randFloat(5, 20);
        let tube = THREE.MathUtils.randFloat(1.5, 5);

        // Create torus knot geometry
        this.geometry = new THREE.TorusKnotGeometry(radius, tube, 100, 16);

        // Shader material for torus knot (you can use BasicMaterial for simpler debugging)
        this.material = new THREE.ShaderMaterial({
            vertexShader: vertexShaderText,
            fragmentShader: fragmentShaderText,
            uniforms: this.uniforms
        });

        // Depth function for additional effects
        this.material.depthFunc = THREE.NotEqualDepth;

        // Create the mesh
        this.mesh = new THREE.Mesh(this.geometry, this.material);

        // Set random initial position and rotation
        this.mesh.position.x = THREE.MathUtils.randFloatSpread(2000);
        this.mesh.position.y = THREE.MathUtils.randFloatSpread(2000);
        this.mesh.position.z = THREE.MathUtils.randFloat(-1000, 350);

        // Compute bounding box
        this.boundingBox = new THREE.Box3().setFromObject(this.mesh);

        // Bounding box helper for debugging
        this.randColor = new THREE.Color(Math.random(), Math.random(), Math.random());
        this.boundingBoxHelper = new THREE.BoxHelper(this.mesh, this.randColor);
    }

    /**
     * Moves object to a distant position to be reused
     * 
     * @param {THREE.Vector3} cameraPos Camera's position (camera.position)
     */
    resetObject(cameraPos) {
        let randomSign = Math.random() < 0.5 ? -1 : 1;

        this.mesh.position.z = cameraPos.z + 1000 * randomSign; // Reset far away
        this.mesh.position.x = cameraPos.x + THREE.MathUtils.randFloatSpread(1500); // Randomize x
        this.mesh.position.y = cameraPos.y + THREE.MathUtils.randFloatSpread(1500); // Randomize y
    }

    /**
     * Updates the object's scale and movement based on deltaTime
     * @param {Number} deltaTime Delta time for smooth animations
     */
    updateObject(deltaTime) {
        let time = Date.now() * 0.001;
        this.scaleFactor = Math.sin(time * this.scaleSpeed) * 1.5 + 3;
        this.uniforms.scaleFactor.value = this.scaleFactor;
        this.uniforms.time.value += deltaTime;

        // Update scale
        this.mesh.scale.setScalar(this.scaleFactor);

        // Handle movement based on movement type
        switch (this.movementType) {
            case this.movement.LINEAR:
                let linearScale = deltaTime * 3;
                this.mesh.translateX(this.tVec.x * linearScale);
                this.mesh.translateY(this.tVec.y * linearScale);
                this.mesh.translateZ(this.tVec.z * linearScale);
                break;
            case this.movement.PARABOLIC:
                this.rotateAboutWorldAxis(this.mesh, this.rotationAxis, deltaTime * 0.0075);
                break;
            case this.movement.CORKSCREW:
                let normTVec = this.tVec.clone().normalize();
                this.mesh.translateX(this.tVec.x * deltaTime);
                this.mesh.translateY(this.tVec.y * deltaTime);
                this.mesh.translateZ(this.tVec.z * deltaTime);
                this.rotateAboutWorldAxis(this.mesh, normTVec, 0.0075 * deltaTime);
                break;
        }

        // Update bounding box
        this.boundingBox = new THREE.Box3().setFromObject(this.mesh);
        this.boundingBoxHelper.update();
    }

    /**
     * Checks if this object intersects with another object's bounding box
     * @param {THREE.Box3} boundingBox Box3 of the object to check intersection with
     * @returns True if intersecting, false otherwise
     */
    intersectsBox(boundingBox) {
        if (this.boundingBox.containsBox(boundingBox)) {
            return false;
        }

        return this.boundingBox.intersectsBox(boundingBox);
    }

    /**
     * Checks if this object contains the provided position
     * @param {THREE.Vector3} position Vec3 of the position to check
     * @returns True if the point is inside the bounding box, false otherwise
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

        this.updateObject(5);

        return true;
    }

    // Rotate around an arbitrary axis (same function as Asteroid)
    rotateAboutWorldAxis(object, axis, angle) {
        var rotationMatrix = new THREE.Matrix4();
        rotationMatrix.makeRotationAxis(axis.normalize(), angle);
        var currentPos = new THREE.Vector4(object.position.x, object.position.y, object.position.z, 1);
        var newPos = currentPos.applyMatrix4(rotationMatrix);
        object.position.x = newPos.x;
        object.position.y = newPos.y;
        object.position.z = newPos.z;
    }
}
