import React from 'react';
import { useLoader } from 'react-three-fiber';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { useGLTF } from 'drei';

const Moon = () => {


    const { scene } = useGLTF( "assets/3D/Moon/scene.gltf");

    scene.traverse( function ( child ) {
        if ( child.isMesh ) {                                     
            child.material.fog = false;
        }
    });

    return (
        
        <primitive 
            scale={[6, 6, 6]} 
            rotation={[Math.PI / 40, Math.PI / 3.5, Math.PI / 8]}
            position={[80, 150, -200]}
            object={scene}                    
            dispose={null}
        />
    );
}
export default Moon;