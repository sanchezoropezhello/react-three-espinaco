import React, { Suspense, useRef, useEffect, useCallback } from 'react';
import { Canvas, useLoader, useFrame } from 'react-three-fiber';
import { OrbitControls, Stats, PointerLockControls } from 'drei';
import Loading from '../../components/Loading';
import {GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader';
import * as THREE from 'three';

import { Physics } from 'use-cannon';
import { Ground } from '../../components/Ground';
import { Player } from '../../components/Player';

import Stars from '../../drei-espinaco/Stars';
import Joystick from '../../drei-espinaco/Joystick';
import SimondevPersonController from '../../drei-espinaco/simondev/SimondevPersonController';
import Fullscreen from '../../drei-espinaco/Fullscreen';
import { AudioComponents } from '../../drei-espinaco/VideoPoints';
import ShadertoyMusic from '../../drei-espinaco/ShadertoyMusic';

export function Scene() {
    // const gltf = useLoader(GLTFLoader, 'assets/obj/cabezaPiedra.glb');
    const group = useRef();

    return(
        <>
        <Stats />
        <Stars />
        {/* <group position={[0,-5,0]} scale={[50, 50, 50]} >
            <primitive object={gltf.scene} />
        </group> */}
        <ShadertoyMusic />
        {/* <Suspense fallback={<Loading />}>
            <AudioComponents scale={[0.5,0.5,0.5]}/>
        </Suspense> */}
        <SimondevPersonController />
        {/* <OrbitControls /> */}
        </>
    );
}

export default function App13(props) {

    return (
    <>
    <Canvas className="canvas" style={{backgroundColor:'#000000', position:'absolute'}} shadowMap >
        <ambientLight />
        <Suspense fallback={<Loading />}>
        <Scene />
        </Suspense>
    </Canvas>
    <Joystick />
    <Fullscreen />
    </>
    );
}