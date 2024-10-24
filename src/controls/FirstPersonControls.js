//Below code has been ripped directly from threeJS library to make modifications
//Source: https://github.com/mrdoob/three.js/blob/master/examples/jsm/controls/FirstPersonControls.js

import {
	Controls,
	MathUtils,
	Spherical,
	Vector3
} from 'three';


const _lookDirection = new Vector3();
const _spherical = new Spherical();
const _target = new Vector3();
const _targetPosition = new Vector3();

class FirstPersonControls extends Controls {

	constructor( object, domElement = null ) {

		super( object, domElement );

		// API

		this.movementSpeed = 1.0;
		this.lookSpeed = 0.005;
		this.currentSpeed = 0; // Initialize currentSpeed

		this.lookVertical = true;
		this.autoForward = false;

		this.activeLook = true;

		this.heightSpeed = false;
		this.heightCoef = 1.0;
		this.heightMin = 0.0;
		this.heightMax = 1.0;

		this.constrainVertical = false;
		this.verticalMin = 0;
		this.verticalMax = Math.PI;

		this.mouseDragOn = false;

        //add ability to turn off keyboard controls
        this.keyControlsOn = true;
        this.mousePointersOn = true;

		//add ability to see current lookAtVector
		this.lookAtVec = new THREE.Vector3();
		// internals

		this._autoSpeedFactor = 0.0;

		this._pointerX = 0;
		this._pointerY = 0;

		this._accelerate = false;
		this._decelerate = false;

		this._viewHalfX = 0;
		this._viewHalfY = 0;

		this._lat = 0;
		this._lon = 0;

		// Roll effect properties
		this.rollAngle = 0;          // Current roll angle in radians
		this.maxRollAngle = Math.PI / 8; // Maximum roll angle (~22.5 degrees)
		this.rollSpeed = 0.1;        // Speed at which the camera rolls towards the target angle

		// event listeners

		this._onPointerMove = onPointerMove.bind( this );
		this._onPointerDown = onPointerDown.bind( this );
		this._onPointerUp = onPointerUp.bind( this );
		this._onContextMenu = onContextMenu.bind( this );
		this._onKeyDown = onKeyDown.bind( this );
		this._onKeyUp = onKeyUp.bind( this );

		//

		if ( domElement !== null ) {

			this.connect();

			this.handleResize();

		}

		this._setOrientation();

	}

	connect() {

		window.addEventListener( 'keydown', this._onKeyDown );
		window.addEventListener( 'keyup', this._onKeyUp );

		this.domElement.addEventListener( 'pointermove', this._onPointerMove );
		this.domElement.addEventListener( 'pointerdown', this._onPointerDown );
		this.domElement.addEventListener( 'pointerup', this._onPointerUp );
		this.domElement.addEventListener( 'contextmenu', this._onContextMenu );

	}

	disconnect() {

		window.removeEventListener( 'keydown', this._onKeyDown );
		window.removeEventListener( 'keyup', this._onKeyUp );

		this.domElement.removeEventListener( 'pointerdown', this._onPointerMove );
		this.domElement.removeEventListener( 'pointermove', this._onPointerDown );
		this.domElement.removeEventListener( 'pointerup', this._onPointerUp );
		this.domElement.removeEventListener( 'contextmenu', this._onContextMenu );

	}

	dispose() {

		this.disconnect();

	}

	handleResize() {

		if ( this.domElement === document ) {

			this._viewHalfX = window.innerWidth / 2;
			this._viewHalfY = window.innerHeight / 2;

		} else {

			this._viewHalfX = this.domElement.offsetWidth / 2;
			this._viewHalfY = this.domElement.offsetHeight / 2;

		}

	}

	lookAt( x, y, z ) {

		if ( x.isVector3 ) {

			_target.copy( x );

		} else {

			_target.set( x, y, z );

		}

		this.lookAtVec = _target;
		this.object.lookAt( _target );

		this._setOrientation();

		return this;

	}

	update( delta ) {

		if ( this.enabled === false ) return;

		const dampingFactor = 0.5; // Adjust for more or less damping
		const inertiaFactor = 0.95; // Adjust for more or less inertia

		// Adjust speed based on acceleration and deceleration
		if (this._accelerate) {
			this.movementSpeed += 0.1; // Increase speed
		}
		if (this._decelerate) {
			this.movementSpeed = Math.max(0, this.movementSpeed - 0.1); // Decrease speed, but not below 0
		}

		// Calculate movement speed with damping
		const actualMoveSpeed = delta * this.movementSpeed * dampingFactor;

		// Move the object forward based on the current speed
		this.object.translateZ(-actualMoveSpeed);

		// Update currentSpeed
		this.currentSpeed = this.movementSpeed;

		// Apply inertia to mouse movement
		this._pointerX *= inertiaFactor;
		this._pointerY *= inertiaFactor;

		let actualLookSpeed = delta * this.lookSpeed;

		if (!this.activeLook) {
			actualLookSpeed = 0;
		}

		let verticalLookRatio = 1;

		if (this.constrainVertical) {
			verticalLookRatio = Math.PI / (this.verticalMax - this.verticalMin);
		}

		// Mouse movement
		this._lon -= this._pointerX * actualLookSpeed;
		if (this.lookVertical) this._lat -= this._pointerY * actualLookSpeed * verticalLookRatio;

		this._lat = Math.max(-85, Math.min(85, this._lat));

		let phi = MathUtils.degToRad(90 - this._lat);
		const theta = MathUtils.degToRad(this._lon);

		if (this.constrainVertical) {
			phi = MathUtils.mapLinear(phi, 0, Math.PI, this.verticalMin, this.verticalMax);
		}

		const position = this.object.position;

		_targetPosition.setFromSphericalCoords(1, phi, theta).add(position);

		this.object.lookAt(_targetPosition);

		// --- Roll Effect Integration ---

		// Calculate the target roll based on pointer X position
		const pointerXNormalized = this._pointerX / this._viewHalfX; // Normalize to range [-1, 1]
		const targetRoll = this.maxRollAngle * pointerXNormalized;

		// Smoothly interpolate the current roll angle towards the target roll
		this.rollAngle += (targetRoll - this.rollAngle) * this.rollSpeed;

		// Apply the roll rotation to the camera
		this.object.rotation.z = this.rollAngle;

		// --- End Roll Effect Integration ---

	}

	_setOrientation() {

		const quaternion = this.object.quaternion;

		_lookDirection.set( 0, 0, - 1 ).applyQuaternion( quaternion );
		_spherical.setFromVector3( _lookDirection );

		this._lat = 90 - MathUtils.radToDeg( _spherical.phi );
		this._lon = MathUtils.radToDeg( _spherical.theta );

	}

}

function onPointerDown( event ) {

    if (!this.mousePointersOn) {
        return
    }

	if ( this.domElement !== document ) {

		this.domElement.focus();

	}

	if ( this.activeLook ) {

		switch ( event.button ) {

			case 0: this._accelerate = true; break;
			case 2: this._decelerate = true; break;

		}

	}

	this.mouseDragOn = true;

}

function onPointerUp( event ) {
    if (!this.mousePointersOn) {
        return
    }

	if ( this.activeLook ) {

		switch ( event.button ) {

			case 0: this._accelerate = false; break;
			case 2: this._decelerate = false; break;

		}

	}

	this.mouseDragOn = false;

}

function onPointerMove( event ) {

	if ( this.domElement === document ) {

		this._pointerX = event.pageX - this._viewHalfX;
		this._pointerY = event.pageY - this._viewHalfY;

	} else {

		this._pointerX = event.pageX - this.domElement.offsetLeft - this._viewHalfX;
		this._pointerY = event.pageY - this.domElement.offsetTop - this._viewHalfY;

	}

}

function onKeyDown(event) {
    switch (event.code) {
        case 'KeyW':
        case 'ArrowUp':
            this._accelerate = true;
            break;
        case 'KeyS':
        case 'ArrowDown':
            this._decelerate = true;
            break;
    }
}

function onKeyUp(event) {
    switch (event.code) {
        case 'KeyW':
        case 'ArrowUp':
            this._accelerate = false;
            break;
        case 'KeyS':
        case 'ArrowDown':
            this._decelerate = false;
            break;
    }
}

function onContextMenu( event ) {

	if ( this.enabled === false ) return;

	event.preventDefault();

}

export { FirstPersonControls };
