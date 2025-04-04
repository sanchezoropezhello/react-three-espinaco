import React, {useEffect, useState, useCallback} from 'react';
import { Canvas, useFrame, useThree } from 'react-three-fiber';
import { OrbitControls } from 'drei';
import Loading from '../../components/Loading';
import Stars from '../../drei-espinaco/Stars';

import SimondevPersonController from '../../drei-espinaco/simondev/SimondevPersonController';
import Joystick from '../../drei-espinaco/Joystick';

export function Scene() {

    return(
        <>
        <ambientLight />
        <Stars />
        <SimondevPersonController />
        </>
    );
}

export default function App12(props) {

    
    return (
    <>
    <Canvas className="canvas" style={{backgroundColor:'#000000', position: 'absolute'}}>
        <Scene />
    </Canvas>
    <Joystick />
    </>
    );
}