import React, {useEffect, useMemo, useState, Suspense} from 'react';
import * as THREE from 'three';
import { Canvas } from 'react-three-fiber';
import { OrbitControls, Stats } from 'drei';
import Loading from '../../components/Loading';

import Map from '../../drei-espinaco/Map';
import randomMapCreation from '../../drei-espinaco/map-creator/maps/randomMapCreation';
import mapSimple from '../../drei-espinaco/map-creator/maps/mapSimple';
import useMapGallery from '../../drei-espinaco/map-creator/maps/useMapGallery';

import MapPhysics from '../../drei-espinaco/map-creator/physics/MapPhysics';
import simpleMapPhysics from '../../drei-espinaco/map-creator/physics/maps/simpleMapPhysics';

import { Physics } from 'use-cannon';
import Ground from '../../the-gallery/components/Ground/Ground';
import Player from '../../the-gallery/components/Player/Player';
import Joystick from '../../drei-espinaco/Joystick';
import FullScreen from '../../drei-espinaco/Fullscreen';



export function Scene() {

    const map = useMapGallery();

    const [mapPhysics, setMapPhysics] = useState([]);
    useEffect(()=>{
      setMapPhysics(simpleMapPhysics);
    },[simpleMapPhysics]);

    return(
        <>
        <ambientLight intensity={0.1} />
        <pointLight args={[0xffffff, 1, 100]} />
        <Map args={map} />
        {/* <OrbitControls /> */}
        <Physics gravity={[0, -30, 0]}>
          <MapPhysics args={simpleMapPhysics} visible={true} />
          <Suspense fallback={null}>
            <Ground /> 
          </Suspense>  
          <Player />       
        </Physics>
        </>
    );
}

export default function App17(props) {

    return (
    <>
    <Canvas className="canvas" style={{backgroundColor:'#000000', position:'absolute'}}>
        <Stats />
        <Scene />
    </Canvas>
    <Joystick />
    </>
    );
}