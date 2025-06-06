/** CLIP GataCattana (L) */

import React, { Suspense, useEffect, useRef, useState, useMemo, useCallback } from 'react';
import { Canvas, useFrame, useLoader, useThree } from 'react-three-fiber';
import { OrbitControls, PointerLockControls, Stats } from 'drei';
import * as THREE from 'three';
import Loading from './Loading';
import Background from './Background';
import Ocean from '../../drei-espinaco/Ocean';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';

import { Physics } from 'use-cannon';
import { Ground } from '../../components/Ground';
import { Player } from '../../components/Player';

import SimondevPersonController from '../../drei-espinaco/simondev/SimondevPersonController';
import Joystick from '../../drei-espinaco/Joystick';
import Fullscreen from '../../drei-espinaco/Fullscreen';

import ShaderHorse from './shaders/shaderHorse';

import TweenAnimations from './TweenAnimations';

function AssetGltf({ url, speed = 1 }) {

    /* --------- Load horse ----------- */
    const { nodes, materials, animations } = useLoader(GLTFLoader, url);

    /* --------- Material horse ---------- */
    const [tRoad, tLut] = useLoader(THREE.TextureLoader, [ 'assets/img/gatacattana/road.jpg', 'assets/img/gatacattana/lut.png'])
    const { gl, scene } = useThree();
    const canvas = gl.domElement;
    const pixelRatio = window.devicePixelRatio;
    const width  = canvas.clientWidth  * pixelRatio | 0;
    const height = canvas.clientHeight * pixelRatio | 0;
    const resolution = useMemo(()=>(new THREE.Vector2(width, height)),[width, height]) ;

    const uniforms = Object.assign({}, THREE.UniformsLib.lights, {
        iResolution: { value: resolution },
        iChannel0: { value: scene.background },
        iChannel1: { value: tRoad },
        iLookup: { value: tLut },
        opacity: { value: 1 },
        diffuse: {  value: new THREE.Color(0xffffff) },
		iGlobalTime: {  value: 0 },
    });

    nodes.mesh_0.material.onBeforeCompile = function (shader) {
        shader.fragmentShader = ShaderHorse.fragmentShader;
        Object.assign(shader.uniforms, uniforms);
        shader.vertexShader = 'varying vec2 vUv;\n' + shader.vertexShader;
        shader.vertexShader = 'uniform vec2 iResolution;\n' + shader.vertexShader;
        shader.vertexShader = shader.vertexShader.replace(
          '#include <begin_vertex>',
          [ 
            '#include <begin_vertex>',
            'vec4 newPosition = projectionMatrix * modelViewMatrix * vec4(position, 1.0);',
            'vec2 screenPos = newPosition.xy / newPosition.w;',
            'vUv = screenPos;',
            'vUv.x *= iResolution.x / iResolution.y;'
          ].join('\n')
          );
    }


    /* --------- Animations horse --------- */
    const [ mixer ] = useState(() => new THREE.AnimationMixer());
    const group = useRef();
    useEffect(()=> void mixer.clipAction(animations[0], group.current).play(),[]);
    useFrame((state, delta) => {
        mixer.update(delta * speed);
    });

    return (
        <group ref={group} dispose={null} scale={[1,1,1]} position={[0,0,0]}>
            <primitive object={nodes.mesh_0} />
        </group>
    );
}

export function Scene({ url = 'assets/musica/gotham.mp4', enabled = false, muted = true, autoRotate = true }) {

    const [enabledCopy, setEnabledCopy] = useState(enabled)

    return (
        <>
        <directionalLight args={[ 0xffffff, 0.54 ]} castShadow={true} shadow-mapSize={new THREE.Vector2( 1024, 1024 )} />
        <hemisphereLight args={[0xffffff, 0xffffff, 0.61]} />

        <Background url={url} muted={muted} />

        <group rotation={[0,-Math.PI/2,0]}>
            <Ocean geometry={new THREE.BoxBufferGeometry( 10000, 10000, 10000 )} position={[0,5000,0]} rotation={[0,Math.PI/2,0]} />
        </group>

        <Suspense fallback={<Loading />}>
            <AssetGltf url="assets/obj/Horse.glb" />
        </Suspense>

        <TweenAnimations setEnabled={setEnabledCopy} />

        <OrbitControls enabled={enabledCopy} autoRotate={ enabledCopy ? autoRotate : false} rotateSpeed={0.5} enablePan={false} autoRotateSpeed={1} maxPolarAngle={Math.PI / 2 - 0.005} maxDistance={2500} />
        </>
    )
}


export default function App6() {

    const [visible, setVisible] = useState(false);
    const changeVisible = useCallback(()=>{
        setVisible(v => !v)
    },[]);

    // 0: (3rd person)   ,   1: (1st person)
    const [zoomType, setZoomType] = useState(1);
    const changeZoom = useCallback(() => {
        setZoomType(z => !z)
    });

    const [muted, setMuted] = useState(0);
    const changeMuted = useCallback(() => {
        setMuted(m => !m)
    });

    const [enabled, setEnabled] = useState(false)
    const [autoRotate, setAutoRotate] = useState(false)

    return (
    <>
    <Canvas className="canvas" style={{backgroundColor:'#000000', position: 'absolute'}} camera={{position:[52.74, 52.74, 175.80], fov:55, far:20000}}>
        {/* <Stats /> */}
        <directionalLight args={[ 0xffffff, 0.54 ]} castShadow={true} shadow-mapSize={new THREE.Vector2( 1024, 1024 )} />
        <hemisphereLight args={[0xffffff, 0xffffff, 0.61]} />

        <Background url='assets/musica/gotham.mp4' muted={muted} />

        <group rotation={[0,-Math.PI/2,0]}>
            <Ocean geometry={new THREE.BoxBufferGeometry( 10000, 10000, 10000 )} position={[0,5000,0]} rotation={[0,Math.PI/2,0]} />
        </group>

        <Suspense fallback={<Loading />}>
            <AssetGltf url="assets/obj/Horse.glb" />
        </Suspense>

        <TweenAnimations setEnabled={setEnabled} />

        <OrbitControls enabled={enabled} autoRotate={ enabled ? autoRotate : false} autoRotateSpeed={1} maxPolarAngle={Math.PI / 2 - 0.005} maxDistance={2500} />

        {/* <Physics gravity={[0, -30, 0]}>
			<Ground position={[0,-1,0]} visible={false} />
			<Player position={[0, 50, -100]} />
		</Physics>
        <PointerLockControls /> */}

        {/* <SimondevPersonController visible={visible} zoomType={zoomType} /> */}
        
    </Canvas>
    {/* <Joystick /> */}
    <Fullscreen />
    <div onClick={() => setAutoRotate(!autoRotate) } style={{ position:'absolute', width:'20px', height:'20px', bottom: 40, borderStyle: 'dashed', color: '#e60005', zIndex: 20 }}></div>
    <div onClick={changeVisible} style={{ position:'absolute', width:'20px', height:'20px', bottom: 80, borderStyle: 'dashed', color: '#e60005', zIndex: 20 }}></div>
    <div onClick={changeMuted} style={{ position:'absolute', width:'20px', height:'20px', bottom: 120, borderStyle: 'dashed', color: '#e60005', zIndex: 20 }}></div>
    </>
    );
}

/* Instrucciones para que funcione el efecto visual del oceano (de chiste churra)
* Rotar [0,Math.PI/2,0] tanto la camara como el mesh del oceano
* <Player position={[0, 50, 20]} /> (para que la escena empiece en la cuspide del cubo y se renderice el video dentro del cubo)
* Moverse un poquito por el escenario
*/