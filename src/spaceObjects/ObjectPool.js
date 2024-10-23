import Asteroid from "./Asteroid";
import StarField from "./StarFields";
import TorusKnot from "./TorusKnot";

/**
 * Object pool manages objects in our game 
 */
export default class ObjectPool {
    /**
     * Create new Object Pool to manage objects in our game
     * @param {THREE.Scene} scene Scene to add objects to
     * @param {Number} asteroids Number of asteroids to create in the scene
     * @param {Number} torusKnots Number of torus knots to create in the scene
     */
    constructor(scene, asteroidsNum = 200, torusKnots = 50) {
        this.starFields = []
        this.asteroids = []
        this.torusKnots = []

        //create starfields 
        //starfield behind camera
        let starField1 = new StarField(650, 2000);
        scene.add(starField1.mesh);
        this.starFields.push(starField1);

        //star field in front of camera
        let starField2 = new StarField(-650, 2000);
        scene.add(starField2.mesh);
        this.starFields.push(starField2);

        //space debris in front of camera
        let starField3 = new StarField(100, 500);
        scene.add(starField3.mesh);
        this.starFields.push(starField3);

        for (let i = 0; i < asteroidsNum; i++) {
            //create asteroids
            let newAsteroid = new Asteroid();
            // Add the asteroid to the scene
            scene.add(newAsteroid.mesh);
            //uncomment to see boundingBoxes
            //scene.add(newAsteroid.boundingBoxHelper)
            this.asteroids.push(newAsteroid);
        }
        // Create torus knots
        for (let i = 0; i < torusKnots; i++) {
            let newTorusKnot = new TorusKnot();
            scene.add(newTorusKnot.mesh);
            this.torusKnots.push(newTorusKnot);
        }
    }


    /**
     * 
     * @param {Number} deltaTime Delta time to determine animation speed.
     * @param {THREE.Vector3} cameraPosition Camera current position to update objects with 
     */
    updateObjects(deltaTime, cameraPosition) {
        //check distance of stars and move starfields constantly forwards
        for (var starField of this.starFields) {
            if (starField.mesh.position.distanceTo(cameraPosition) > 450) {
                starField.resetObject(cameraPosition);
            }
        }

        //go over asteroids 
        for (var asteroid of this.asteroids) {
            //update drift 
            asteroid.updateObject(deltaTime);

            // Reset the asteroid if it is too far from camera
            if (asteroid.mesh.position.distanceTo(cameraPosition) > 2000) {
                asteroid.resetObject(cameraPosition)
            }

            //check object intersects camera 
            if (asteroid.intersectsPosition(cameraPosition)) {
                console.log("You hit an asteroid! Pos: ", cameraPosition);
            }

            // Update torus knots
        this.torusKnots.forEach(torusKnot => {
            torusKnot.updateObject(deltaTime);

            if (torusKnot.mesh.position.distanceTo(cameraPosition) > 2000) {
                torusKnot.resetObject(cameraPosition);
            }

            if (torusKnot.intersectsPosition(cameraPosition)) {
                console.log("You hit a torus knot! Pos: ", cameraPosition);
            }
        });

                /* Might want this in future or something similar
                asteroids.forEach((asteroidToCheck) => {
                    if (asteroid.intersectsBox(asteroidToCheck.boundingBox)) {
                        console.log("Asteroids hit eachother!")
                    }
                });
                */
            }
    }
}