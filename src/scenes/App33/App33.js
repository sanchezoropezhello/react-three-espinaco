import React, {useEffect, useMemo, useState, useRef, Suspense} from 'react';
import * as THREE from 'three';
import { Canvas, useFrame } from 'react-three-fiber';
import { OrbitControls, Stats, useGLTF, useFBX } from 'drei';
import Loading from '../../components/Loading';

import Map from '../../drei-espinaco/Map';
import MapPhysics from '../../drei-espinaco/map-creator/physics/MapPhysics';
import useFullmapGallery from '../../drei-espinaco/map-creator/fullmaps/useFullmapGallery';

import { Physics } from 'use-cannon';
import Ground from '../../the-gallery/components/Ground/Ground';
import Player from '../../the-gallery/components/Player/Player';
import Joystick from '../../drei-espinaco/Joystick';
import FullScreen from '../../drei-espinaco/Fullscreen';

// import Vehicle from '../../drei-espinaco/Vehicle';

// import Wall from '../../the-gallery/components/Wall/Wall.js';
import GroundPhysic from '../../the-gallery/components/Ground/GroundPhysic';

import {InstancedMesh, InstancedMeshPhysics, InstancedMeshes, InstancedFBX, InstancedGLTF, InstancedGLTFPhysics, InstancedPhysics} from '../../drei-espinaco/instancedMesh/';
import { createMapPoints, transformPointsToObjects } from '../../drei-espinaco/points-creator/';

import Ocean from '../../drei-espinaco/Ocean';
import Stars from '../../drei-espinaco/Stars';

function Lights() {
    return(
        <>
        <ambientLight intensity={0.5} />
        {/* <directionalLight
                position={[29, 50, -60]}
                intensity={0.2}
                color="skyblue"            
        /> */}
        <pointLight />
        </>
    )
}

function Cesped({}) {

    const grassMap = useMemo(() => new THREE.TextureLoader().load("assets/Textures/Grass/GrassGreenTexture0002.jpg"), []);
    grassMap.wrapS = THREE.RepeatWrapping;
    grassMap.wrapT = THREE.RepeatWrapping;
    grassMap.repeat.set(70, 70);

    return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.3, -200]} visible={true} >
                <planeBufferGeometry attach="geometry" args={[700, 700]} />
                <meshLambertMaterial attach="material">
                    <primitive attach="map" object={grassMap} />
                </meshLambertMaterial>
    </mesh>
    );
}

function Wall({
    scale,
    position,
    rotation,
    modelUrl,
    mapUrl,
    normalMapUrl 
}) {
    const objects=[
        {
            position:position,
            scale:scale,
            propsPhysics: [
                {
                    // mass: 1,
                    args:[1,50,107],
                    position:[position[0] + 71, position[1], position[2] + 53]
                },
                {
                    // mass: 1,
                    args:[1,50,107],
                    position:[position[0] - 71, position[1], position[2] + 53]
                },
                {
                    // mass: 1,
                    args:[140,50,1],
                    position:[position[0], position[1], position[2] + 110 ]
                },
                {
                    // mass: 1,
                    args:[45,50,1],
                    position:[position[0] + 46, position[1], position[2] ]
                },
                {
                    // mass: 1,
                    args:[45,50,1],
                    position:[position[0] - 46, position[1], position[2] ]
                },
                {
                    // mass: 1,
                    args:[4,50,1],
                    position:[position[0], position[1], position[2] ]
                },
            ]
        }
    ];

    const size = 20;
    const texture = useMemo(() => new THREE.TextureLoader().load(mapUrl), [mapUrl]);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(size, size);

    const normal = useMemo(() => new THREE.TextureLoader().load(normalMapUrl), [normalMapUrl]);
    normal.wrapS = THREE.RepeatWrapping;
    normal.wrapT = THREE.RepeatWrapping;
    normal.repeat.set(size, size);

    const { scene } = useGLTF(modelUrl);
    scene.traverse( function ( child ) {
        if ( child.isMesh ) {
            // child.castShadow = true;
            // child.receiveShadow = true;
            child.material = new THREE.MeshPhongMaterial();
            child.material.side = THREE.DoubleSide;
            child.material.normalMap = normal;
            child.material.map = texture;
            // child.material.metalness = 0;
            // child.material.roughness = 1;
        }
    });

    return (
        <>
        <InstancedPhysics objects={objects} visible={false} />
        <primitive                   
                    position={position}
                    scale={scale}
                    object={scene}
                    dispose={null}
                /> 
        </>
    );
}

function Trees() {
    const pointsList = [];

    for(let i = 0; i < 10; i++) {
        const x = -200 + Math.random() * 500;
        const y = 0.0;
        const z = -400 + Math.random() * 300;
        pointsList.push([x,y,z]);
    }
    
    const objects = transformPointsToObjects(pointsList, [-Math.PI / 2,0,0], [18,18,18]);

    return <InstancedGLTF src='assets/obj/city/tree/scene.gltf' objects={objects} />
}

function Boxes() {

    const objects = useMemo(()=>{
        const numPoints = 50;
        const initialPoint = [-100,10,200];
        const spaceBetweenPoint = [10, 0, 0];
        const numGroups = 50;
        const spaceBetweenGroup = [0,0,20];
        
        const pointsList = createMapPoints(numPoints, initialPoint, spaceBetweenPoint, numGroups, spaceBetweenGroup);
        
        const objects = transformPointsToObjects(pointsList, [0,Math.PI/2,0], [1, 18, 11]);  

        return objects;
    });

    return (
    <>
    <InstancedMesh geometry={new THREE.BoxBufferGeometry(1,1,1)} material={new THREE.MeshBasicMaterial({color:'green', wireframe:true})} objects={objects} /> 
    </>);
}

function ZombieDance ({}) {
    const fbx = useFBX('assets/obj/simondev/resources/zombie/mremireh_o_desbiens.fbx');
    const fbxDance = useFBX('assets/obj/simondev/resources/zombie/dance.fbx');
    const mixer = useMemo(()=>new THREE.AnimationMixer( fbx ),[]);
    useEffect(()=>{
        const action = mixer.clipAction( fbxDance.animations[ 0 ] );
        action.play();
    },[])
    useFrame(({clock}, dt)=>{
        mixer.update(dt);
    });

    const position = useMemo(()=>([
        -200 + Math.random() * 500,
        0.0,
        -400 + Math.random() * 300
    ]),[]);

    return  <primitive object={fbx} dispose={null} position={position} scale={[0.05,0.05,0.05]} />;
}

export function SceneApp33(){
    return(
        <>
        <Lights />
        <Stars />
        <Wall 
            position={[0, 0, -13.5]}
            scale={[2,1,2]}
            modelUrl={"assets/3D/Wall/scene.gltf"}
            mapUrl={"assets/3D/Wall/Textures/White_Wall.jpg"}
            normalMapUrl={"assets/3D/Wall/Textures/White_Wall_NORMAL.jpg"}
          />
        <Trees />
        <ZombieDance />
        <Ocean geometry={new THREE.PlaneBufferGeometry( 800, 800, 1, 1 )} position={[0,0.1,350]} rotation={[Math.PI/2,0,0]} />
        <Boxes />
        <Cesped />
        </>
    );
}



export function Scene() {

    return(
        <>
        <Lights />
        <Stars />
        <Physics gravity={[0, -30, 0]}>
          <Wall 
            position={[0, 0, -13.5]}
            scale={[2,1,2]}
            modelUrl={"assets/3D/Wall/scene.gltf"}
            mapUrl={"assets/3D/Wall/Textures/White_Wall.jpg"}
            normalMapUrl={"assets/3D/Wall/Textures/White_Wall_NORMAL.jpg"}
          />
          <Trees />
          {/* <GroundPhysic />  */}
          {/* <Player />        */}
        </Physics>
        <ZombieDance />
        <Ocean geometry={new THREE.PlaneBufferGeometry( 800, 800, 1, 1 )} position={[0,0.1,350]} rotation={[Math.PI/2,0,0]} />
        <Boxes />
        <Cesped />
        <OrbitControls />
        </>
    );
}

export default function App33(props) {

    return (
    <>
    <Canvas className="canvas" style={{backgroundColor:'#000000', position:'absolute'}}
        onCreated={({ gl }) => { 
        gl.shadowMap.enabled = true
        gl.shadowMap.type = THREE.PCFSoftShadowMap
    }}>
        <Stats />
        <Suspense fallback={<Loading />}>
            <Scene />
        </Suspense>
    </Canvas>
    {/* <Joystick /> */}
    </>
    );
}