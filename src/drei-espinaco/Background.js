import React, { useState, useEffect } from 'react';
import * as THREE from 'three';
import { useThree } from 'react-three-fiber';
import loadVideo from '../helpers/loadVideo';

export function BackgroundVideoRaw({video}) {
	const { scene } = useThree();
	useEffect(()=>{
		if(video){
			const textureVideo = new THREE.VideoTexture(video);
			textureVideo.minFilter = THREE.LinearFilter;
			textureVideo.magFilter = THREE.LinearFilter;
			textureVideo.format = THREE.RGBFormat;
			scene.background = textureVideo;
		}
	}, [video])

	return null;
}


export default function BackgroundVideo({ url = 'assets/musica/070Shake.mp4', muted = false }) {
	const [textureVideo, setTextureVideo] = useState({});
	useEffect( () => {
		let videoDom;
		async function load(){
			videoDom = await loadVideo(url);
			videoDom.muted=muted;
			const textureVideo1 = await new THREE.VideoTexture(videoDom);
			textureVideo1.minFilter = THREE.LinearFilter;
			textureVideo1.magFilter = THREE.LinearFilter;
			textureVideo1.format = THREE.RGBFormat;
			setTextureVideo(textureVideo1);
		}
		load();

		// Remove sound when user out of scene page
		return () => {
			videoDom.removeAttribute('src'); // empty source
			videoDom.load();
		} 
	}, [])

	useEffect(()=>{
		if(textureVideo?.image){
			textureVideo.image.muted = muted;
		}
	}, [textureVideo, muted] );


	const { scene } = useThree();
	useEffect(()=>{
		scene.background = textureVideo;
		return () => {
			scene.background = null;
		}
	}, [scene, textureVideo])

	return null;
}