import * as THREE from "three";
import React from "react";
import { useLoader } from "react-three-fiber";
import { usePlane } from "use-cannon";
import grass from "../images/crop-1.jpg";

export const Ground = ({visible=true, ...props}) => {
  const [ref] = usePlane(() => ({ rotation: [-Math.PI / 2, 0, 0], ...props }))
  const texture = useLoader(THREE.TextureLoader, grass)
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping
  texture.repeat.set(240, 240)
  return (
    <mesh ref={ref} receiveShadow>
      <planeBufferGeometry args={[100, 100]} />
      {visible ? (<meshStandardMaterial map={texture} color="green" />)
               : (<meshStandardMaterial  side={THREE.BackSide} />)}
      
      
    </mesh>
  )
}
