import React, {useMemo, useCallback, useEffect} from 'react';
import * as THREE from 'three';
import {useBox} from 'use-cannon';
import InstancedMesh from './InstancedMesh';

export function CreatePhysicBox({props, visible = true}) {
    const [ref] = useBox(() => ({...props}));
    return (
    <mesh ref={ref}>
            <boxBufferGeometry args={[...props.args]} />
            <meshBasicMaterial color='green' wireframe={true} visible={visible} />
    </mesh>
    );
}

export function CreatePhysicBoxes({objects, visible}) {
    const physicMeshes = useMemo(()=>{
        const physicMeshes = [];
        objects.forEach((object) => {
            if(Array.isArray(object.propsPhysics)){
                object.propsPhysics.forEach((props) => {
                    props.position = props.position || object.position;
                    props.rotation = props.rotation || object.rotation;
                    const physicMesh = <CreatePhysicBox props={props} visible={visible} />
                    physicMeshes.push(physicMesh);
               });
            }
            else {
                const props = object.propsPhysics;
                props.position = props.position || object.position;
                props.rotation = props.rotation || object.rotation;
                const physicMesh = <CreatePhysicBox props={props} visible={visible} />
                physicMeshes.push(physicMesh);
            }
           
        });
        return physicMeshes;
    },[objects, visible]);

    return physicMeshes ? physicMeshes : null;
}

export default function InstancedMeshPhysics({geometry=new THREE.BoxBufferGeometry(1,1,1), material=new THREE.MeshBasicMaterial({color:'red'}), objects=[], createObjectsModBoolean = false, visible = false}){
    
    // if objects array is empty, initialize it with these default values
    if(objects.length === 0) {
        for(let i = 0; i< 5; i++){
            for(let j = 0; j < 5; j++){
                objects.push({
                    position:[j * 1,i*1,0],
                    scale: [1,1,1],
                    propsPhysics: [
                        {
                            mass: 1,
                            args: [1,1,1]
                        }
                    ]
                });
            }
        }
    }
    
    const uuid = useMemo(()=>THREE.MathUtils.generateUUID(),[]);
    const createObjectsMod = useCallback((state)=>{
        const objectsMod = [];
        if(createObjectsModBoolean) {
            state.scene.children.forEach(object => {
                if(object.uuid === uuid) {
                    object.children.forEach( (meshPhysic,id) => {
                        objectsMod.push({
                            ids: [id],
                            object: {
                                position: [meshPhysic.position.x,meshPhysic.position.y,meshPhysic.position.z],
                                rotation: [meshPhysic.rotation.x,meshPhysic.rotation.y,meshPhysic.rotation.z]
                            }
                        });
                    });
                }
            });
        }
      return objectsMod;
    },[createObjectsModBoolean]);
    
    return (
    <>
    <group uuid={uuid}>
        <CreatePhysicBoxes objects={objects} visible={visible} />
    </group>
    <InstancedMesh
        geometry={geometry}
        material={material}
        objects={objects}
        createObjectsMod={createObjectsMod}
    />
    </>
    );
}