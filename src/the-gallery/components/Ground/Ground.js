import React, { useMemo } from 'react';
import { usePlane } from "use-cannon";
import * as THREE from 'three';
import { Reflector } from '@react-three/drei';

const Ground = () => {
    const size = 4.6;

    const [ref] = usePlane(() => ({ 
        rotation: [-Math.PI / 2, 0, 0],
        position: [0, 0.1, 22],
    }));

    const marbleMap = useMemo(() => new THREE.TextureLoader().load("assets/Textures/BazaltMarble/BAZALT-diffuse.jpg"), []);
    marbleMap.wrapS = THREE.MirroredRepeatWrapping;
    marbleMap.wrapT = THREE.MirroredRepeatWrapping;
    marbleMap.repeat.set(size, size);

    const marbleAlphaMap = useMemo(() => new THREE.TextureLoader().load("assets/Textures/BazaltMarble/BAZALT-ao.jpg"), []);
    marbleAlphaMap.wrapS = THREE.MirroredRepeatWrapping;
    marbleAlphaMap.wrapT = THREE.MirroredRepeatWrapping;
    marbleAlphaMap.repeat.set(size, size);

    const marbleNormalMap = useMemo(() => new THREE.TextureLoader().load("assets/Textures/BazaltMarble/BAZALT-normal.jpg"), []);
    marbleNormalMap.wrapS = THREE.MirroredRepeatWrapping;
    marbleNormalMap.wrapT = THREE.MirroredRepeatWrapping;
    marbleNormalMap.repeat.set(size, size);

    const grassMap = useMemo(() => new THREE.TextureLoader().load("assets/Textures/Grass/GrassGreenTexture0002.jpg"), []);
    grassMap.wrapS = THREE.RepeatWrapping;
    grassMap.wrapT = THREE.RepeatWrapping;
    grassMap.repeat.set(70, 70);

    return (
        <>
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.3, 22]} visible={true} >
                <planeBufferGeometry attach="geometry" args={[1000, 1000]} />
                <meshLambertMaterial attach="material">
                    <primitive attach="map" object={grassMap} />
                </meshLambertMaterial>
            </mesh>

            <mesh ref={ref} receiveShadow>
                <planeBufferGeometry attach="geometry" args={[70,75]} />
                <meshStandardMaterial 
                    attach="material"
                    reflectivity={0}
                    transparent
                    roughness={0.5}
                    metalness={0.3}
                    side={THREE.DoubleSide}
                >
                    <primitive attach="map" object={marbleMap} />
                    <primitive attach="alphaMap" object={marbleAlphaMap} />
                    <primitive attach="normalMap" object={marbleNormalMap} />
                </meshStandardMaterial>
            </mesh>
        </>
    );
}

export default Ground;