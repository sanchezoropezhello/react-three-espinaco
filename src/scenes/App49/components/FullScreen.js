import React, {useCallback, useEffect, useRef, useState} from 'react';
import { useThree, useLoader } from 'react-three-fiber';
import { TextureLoader, DoubleSide } from 'three';

export default function FullScreen(props) {

    const handleFullscreen = useCallback(()=>{
        try{
            if (!document.fullscreenElement) {
                document.documentElement.requestFullscreen();
            } else {
              if (document.exitFullscreen) {
                document.exitFullscreen(); 
              }
            }
        } catch(e) {
            console.log('This navigator doesnt allow Fullscreen API');
        }
        
    },[]);

    return(
        <mesh onPointerDown={ (event) => handleFullscreen() } {...props} >
            <planeBufferGeometry args={[1,1]} />
            <meshBasicMaterial color='#0000ff' transparent={true} opacity={0.0} />
        </mesh>
    );
}

