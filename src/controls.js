// controls.js — WASD + Pointer-Lock mouse-look first-person controls

import * as THREE from 'three';

export class Controls {
  constructor(camera, domElement) {
    this.camera = camera;
    this.domElement = domElement;

    this.moveForward = false;
    this.moveBackward = false;
    this.moveLeft = false;
    this.moveRight = false;
    this.sprint = false;
    this.isLocked = false;

    this.euler = new THREE.Euler(0, 0, 0, 'YXZ');
    this.velocity = new THREE.Vector3();
    this.direction = new THREE.Vector3();

    this.yaw = 0;
    this.pitch = 0;

    this.speed = 18;
    this.sprintMultiplier = 2.2;
    this.damping = 12;

    this._onKeyDown = this._onKeyDown.bind(this);
    this._onKeyUp = this._onKeyUp.bind(this);
    this._onMouseMove = this._onMouseMove.bind(this);
    this._onPointerLockChange = this._onPointerLockChange.bind(this);

    document.addEventListener('keydown', this._onKeyDown);
    document.addEventListener('keyup', this._onKeyUp);
    document.addEventListener('pointerlockchange', this._onPointerLockChange);
    document.addEventListener('mousemove', this._onMouseMove);

    // Mobile joystick state
    this.joyX = 0;
    this.joyY = 0;
    this._setupMobileJoystick();
  }

  lock() {
    this.domElement.requestPointerLock();
  }

  unlock() {
    document.exitPointerLock();
  }

  _onPointerLockChange() {
    this.isLocked = document.pointerLockElement === this.domElement;
  }

  _onMouseMove(e) {
    if (!this.isLocked) return;
    const sens = 0.0018;
    this.yaw   -= e.movementX * sens;
    this.pitch -= e.movementY * sens;
    this.pitch  = Math.max(-Math.PI / 2.5, Math.min(Math.PI / 2.5, this.pitch));
    this.euler.set(this.pitch, this.yaw, 0);
    this.camera.quaternion.setFromEuler(this.euler);
  }

  _onKeyDown(e) {
    switch (e.code) {
      case 'KeyW': case 'ArrowUp':    this.moveForward  = true; break;
      case 'KeyS': case 'ArrowDown':  this.moveBackward = true; break;
      case 'KeyA': case 'ArrowLeft':  this.moveLeft     = true; break;
      case 'KeyD': case 'ArrowRight': this.moveRight    = true; break;
      case 'ShiftLeft': case 'ShiftRight': this.sprint  = true; break;
    }
  }

  _onKeyUp(e) {
    switch (e.code) {
      case 'KeyW': case 'ArrowUp':    this.moveForward  = false; break;
      case 'KeyS': case 'ArrowDown':  this.moveBackward = false; break;
      case 'KeyA': case 'ArrowLeft':  this.moveLeft     = false; break;
      case 'KeyD': case 'ArrowRight': this.moveRight    = false; break;
      case 'ShiftLeft': case 'ShiftRight': this.sprint  = false; break;
    }
  }

  _setupMobileJoystick() {
    const base  = document.getElementById('joystick-base');
    const thumb = document.getElementById('joystick-thumb');
    if (!base || !thumb) return;

    let startX = 0, startY = 0, touching = false;
    const R = 28; // max thumb travel radius

    const move = (cx, cy) => {
      let dx = cx - startX;
      let dy = cy - startY;
      const dist = Math.sqrt(dx*dx + dy*dy);
      if (dist > R) { dx = dx/dist*R; dy = dy/dist*R; }
      thumb.style.transform = `translate(${dx}px,${dy}px)`;
      this.joyX =  dx / R;
      this.joyY = -dy / R; // forward = negative screen Y
    };

    base.addEventListener('touchstart', e => {
      touching = true;
      const t = e.touches[0];
      startX = t.clientX; startY = t.clientY;
      e.preventDefault();
    }, { passive: false });
    base.addEventListener('touchmove', e => {
      if (!touching) return;
      const t = e.touches[0];
      move(t.clientX, t.clientY);
      e.preventDefault();
    }, { passive: false });
    const end = () => {
      touching = false;
      thumb.style.transform = '';
      this.joyX = 0; this.joyY = 0;
    };
    base.addEventListener('touchend', end);
    base.addEventListener('touchcancel', end);
  }

  update(delta) {
    if (!this.isLocked && this.joyX === 0 && this.joyY === 0) {
      // Apply damping when no input
      this.velocity.x -= this.velocity.x * this.damping * delta;
      this.velocity.z -= this.velocity.z * this.damping * delta;
      this.camera.position.addScaledVector(this.velocity, delta);
      return;
    }

    const spd = this.speed * (this.sprint ? this.sprintMultiplier : 1);
    const fwd = new THREE.Vector3();
    this.camera.getWorldDirection(fwd);
    fwd.y = 0; fwd.normalize();
    const right = new THREE.Vector3();
    right.crossVectors(fwd, new THREE.Vector3(0,1,0));

    // Keyboard input
    this.direction.z = Number(this.moveForward)  - Number(this.moveBackward);
    this.direction.x = Number(this.moveRight)    - Number(this.moveLeft);

    // Mobile joystick overrides
    if (Math.abs(this.joyY) > 0.05) this.direction.z = this.joyY;
    if (Math.abs(this.joyX) > 0.05) this.direction.x = this.joyX;

    this.direction.normalize();

    const acc = spd * 8;
    if (this.direction.z !== 0)
      this.velocity.addScaledVector(fwd, this.direction.z * acc * delta);
    if (this.direction.x !== 0)
      this.velocity.addScaledVector(right, this.direction.x * acc * delta);

    this.velocity.x -= this.velocity.x * this.damping * delta;
    this.velocity.z -= this.velocity.z * this.damping * delta;

    this.camera.position.addScaledVector(this.velocity, delta);

    // Keep player at eye height and within bounds
    this.camera.position.y = 1.8;
    this.camera.position.x = Math.max(-220, Math.min(220, this.camera.position.x));
    this.camera.position.z = Math.max(-220, Math.min(220, this.camera.position.z));
  }

  dispose() {
    document.removeEventListener('keydown', this._onKeyDown);
    document.removeEventListener('keyup', this._onKeyUp);
    document.removeEventListener('pointerlockchange', this._onPointerLockChange);
    document.removeEventListener('mousemove', this._onMouseMove);
  }
}
