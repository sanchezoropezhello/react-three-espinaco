import React, { Suspense, useMemo, useCallback, useState, useEffect, useRef } from 'react';
import * as THREE from 'three';
import { Canvas, useFrame, useLoader, useThree } from 'react-three-fiber';
import { Stats, OrbitControls, TransformControls } from 'drei';
import Loading from './Loading';

import Joystick from '../../drei-espinaco/Joystick';
import { Physics, useBox } from 'use-cannon';
import Player from './player/Player';
import GroundPhysic from '../../the-gallery/components/Ground/GroundPhysic';

import {InstancedMesh, InstancedMeshPhysics, InstancedMeshes, InstancedFBX, InstancedGLTF, InstancedGLTFPhysics, InstancedPhysics} from '../../drei-espinaco/instancedMesh/';
import { createMapsPoints, createMapPoints, transformPointsToObjects } from '../../drei-espinaco/points-creator/';

import PicturesDisplay from './displays/PicturesDisplay';
import Scene01 from './scenes/Scene01';
import Scene02 from './scenes/Scene02';
import Scene03 from './scenes/Scene03';
import Scene04 from './scenes/Scene04';
import Scene06 from './scenes/Scene06';

import Ocean from '../../drei-espinaco/Ocean';
import Plane from '../../drei-espinaco/Plane';

import { proxy, useProxy } from "valtio";

import Fullscreen from '../../drei-espinaco/Fullscreen';
import { ActionState } from './State';

import MeshTransformControls from '../../drei-espinaco/MeshTransformControls';
import { AudioComponents } from './MediaPointsShader';

import FullScreen from '../../drei-espinaco/Fullscreen';


const state = proxy({index: 0, triggers:{trigger0:false}});

function Triggers({changeEnvironment, visible=true}){

    const ref = useRef(); // group of mesh triggers
    const {camera} = useThree();
    const raycaster = new THREE.Raycaster();
    useFrame(()=>{
        if(ref.current){
            raycaster.set( 
                           new THREE.Vector3(camera.position.x,camera.position.y,camera.position.z),
                           new THREE.Vector3(0,-1.0,0)
                        );
            const intersects = raycaster.intersectObjects( ref.current.children );
            if(intersects.length !== 0){
                changeEnvironment(intersects[0].object)
            }else{
                changeEnvironment();
            }
        }
    });

    return(
        <group ref={ref}>
        <mesh name='trigger0' position={[0,0,-160]} visible={visible} geometry={new THREE.BoxBufferGeometry(24.72,5.0,170.0)} material={new THREE.MeshBasicMaterial({color:'green', wireframe:true})} />
        <mesh name='trigger0' position={[0,0,-449.19]} visible={visible} geometry={new THREE.BoxBufferGeometry(962,5.0,626.0)} material={new THREE.MeshBasicMaterial({color:'green', wireframe:true})} />
        </group>
    );
}

export function ScenePrincipal({visible}) {

    const snapState = useProxy(state);
    const [current, setCurrent] = useState();

    const changeEnvironment = useCallback((triggerMesh)=>{
        if(triggerMesh && triggerMesh.name === 'trigger0'){
            state.triggers.trigger0 = true;
        }else{
            state.triggers.trigger0 = false;
        }
    });

    useEffect(()=>{
        if(snapState.triggers.trigger0){
            setCurrent(<Scene06 />);
        }else{
            setCurrent(<Scene04 visible={visible} />);
        }
    },[snapState.triggers.trigger0, visible]);

    return(
        <>
        <Physics gravity={[0, -100, 0]} >
        {/* <MeshTransformControls /> */}
        <Suspense fallback={<Loading />}>
            
            {current}

            <Triggers changeEnvironment={changeEnvironment} visible={false} />
            <Player mass={200.0} height={4.0}/>
            <GroundPhysic />
        </Suspense>
        </Physics>
        </>
    );
}

export default function AppDirty() {

    // const changeScene = useCallback(()=>{
    //     state.index++;        
    // },[]);

    const [visiblePhysics, setVisiblePhysics] = useState(false)

    return (
    <>
    <Canvas className="canvas" style={{backgroundColor:'#000000', position:'absolute', width:'100%', height:'100vh' }}>
        {/* <Stats /> */}
        <ScenePrincipal visible={visiblePhysics} />
    </Canvas>
    <Joystick />
    <FullScreen width='30px' height='30px' backgroundImage={'url("assets/img/icon/fullscreen64.png")'} backgroundSize={'cover'} borderStyle={'none'} WebkitFilter={'invert(100%)'} opacity={0.6} />
    <div onClick={ () => setVisiblePhysics(!visiblePhysics) } style={{ position:'absolute', width:'30px', height:'30px', bottom: 135, backgroundImage:'url("assets/img/icon/scene64.png")', backgroundSize:'cover' , WebkitFilter:'invert(100%)', color: '#e60005', zIndex: 20, cursor: 'pointer', opacity:0.6 }}></div>
    
    {/* <div onClick={changeScene} style={{ position:'absolute', width:'20px', height:'20px', bottom: 40, borderStyle: 'dashed', color: '#e60005', zIndex: 20 }}></div> */}
    </>
    );
}