/* Author this code: espisepi */
/* Code based in: https://tympanus.net/codrops/2019/09/06/how-to-create-a-webcam-audio-visualizer-with-three-js/ */
import React, { useRef, useEffect, useMemo, useState } from 'react';
import * as THREE from 'three';
import { useLoader, useFrame, useThree } from 'react-three-fiber';

import VideoShader0 from './shaders/VideoShader0';
import VideoShader1 from './shaders/VideoShader1';

const filterYoutubeLink = 'youtu';
const herokuapp = 'https://video-dl-esp.herokuapp.com/video/video?url=';

export const AudioComponents = ({audioSrc='assets/musica/070shake.mp4',videoSrc='assets/musica/070shake.mp4', webcam, position, rotation, scale, muted=false, type='MusicShader', shaderType, colorInput }) => {
    const configuration = `
          r = bass + 0.5;
          g = bass;
          b = bass;
          color.r = bass;
          color.g = mid;
          color.b = mid
          distance = 1;
          density = 1;
      `;
    if(audioSrc.includes(filterYoutubeLink)){
      audioSrc = herokuapp + audioSrc; // Tengo que tener levantada esa maquina en DigitalOcean
    }

    const [audio, setAudio] = useState(null);
    // useEffect(()=>{
    
    //     const audioElement = new Audio(audioSrc);
    //     audioElement.crossOrigin = 'Anonymous';
    //     audioElement.loop = true;
    //     audioElement.preload = 'auto';
    //     audioElement.style.display = 'none';

    //     const divPanel = document.createElement('div');
    //     divPanel.style.position = 'absolute';
    //     divPanel.style.zIndex = '99999';
    //     divPanel.style.width = '100%';
    //     divPanel.style.height = '100vh';
    //     divPanel.style.backgroundColor = '#101010';
    //     divPanel.addEventListener('click', (e) => {
    //         audioElement.play()
    //         divPanel.style.zIndex = '-9999';
    //         divPanel.style.display = 'none'
    //     })
    //     document.getElementById('root').appendChild(divPanel);

    //     divPanel.style.display = 'flex';
    //     divPanel.style.alignItems = 'center';
    //     divPanel.style.justifyContent = 'center';
    //     divPanel.style.color = 'white';
    //     const textPanel = document.createElement('h1');
    //     textPanel.innerHTML = 'Click On Screen to Start'
    //     divPanel.appendChild(textPanel)

    //     let audioTemp;
    //     const audioListener = new THREE.AudioListener();
    //     audioTemp = new THREE.Audio(audioListener)
    //     audioTemp.setMediaElementSource( audioElement );
    //     audioTemp.setLoop(true);
    //     audioTemp.setVolume(0.5);
    //     audioTemp.play();
    //     setAudio(audioTemp);

    //     return () => {
    //         audioElement.pause();

    //         audioTemp.stop();
    //         audioTemp.setBuffer(null);
    //         setAudio(audioTemp);
    //     }
    // }, [audioSrc])
    const audioBuffer = useLoader(THREE.AudioLoader, audioSrc);
    useEffect(()=>{
        let audioTemp;
        if(audioBuffer){
            const audioListener = new THREE.AudioListener();
            audioTemp = new THREE.Audio(audioListener);
            audioTemp.setBuffer(audioBuffer);
            audioTemp.setLoop(true);
            audioTemp.setVolume(0.5);
            audioTemp.play();
            setAudio(audioTemp);
        }
        return ()=> {
            audioTemp.stop();
            audioTemp.setBuffer(null);
            setAudio(audioTemp);
        }
    },[audioBuffer]);

    useEffect(()=>{
        if(audio){
            const volume = muted ? 0.0 : 0.5;
            audio.setVolume(volume);
        }
    }, [audio, muted]);

    if(type === 'MusicShader'){
        return (<MusicShader audio={audio} position={[0,0,-200]} scale={[20,20,20]} />);
    }else if(type === 'VideoPointsShader'){
        return (<VideoPointsShader audio={audio} videoSrc={videoSrc} webcam={webcam} configuration={configuration} position={position} rotation={rotation} scale={scale} shaderType={shaderType} colorInput={colorInput} />);
    }else{
        return null;
    }    
}

function getShader(texture) {
    return {
        uniforms: {
            iTime: { value: 0 },
            iResolution:  { value: new THREE.Vector3(1, 1, 1) },

            bass: { value: 0.0 },
            mid: { value: 0.0 },
            treble: { value: 0.0 },

            iChannel0: { value: texture }
        },
        vertexShader: `

        varying vec2 vUv;

        uniform float iTime;
        uniform sampler2D iChannel0;

        uniform float bass;
        uniform float mid;
        uniform float treble;


			void main() {
                vUv = uv;

                vec4 textureVideo = texture2D( iChannel0, vec2( vUv.x, vUv.y) );
                float gray = (textureVideo.r + textureVideo.g + textureVideo.b) / 3.0;
                float threshold = 300.0;
                vec3 pos = position;

                float r = bass + 0.5;
                float g = treble;
                float b = mid;
                float distance = 400.0;
                float distance2 = 300.0;
                float distance3 = 100.0;

                float modX = mod(pos.x,0.05);
                float modY = mod(pos.y,0.05);
                pos.z += modY * gray * bass * 30.0;
                

                float size = 1.0;
				gl_PointSize = size ;
				gl_Position = projectionMatrix * modelViewMatrix * vec4( pos, 1.0 );

			}
        `,
        fragmentShader: `
        #include <common>

        varying vec2 vUv;

        uniform vec3 iResolution;
        uniform float iTime;

        uniform float bass;
        uniform float mid;
        uniform float treble;
        uniform sampler2D iChannel0;

        vec3 colorA = vec3(0.3,0.0,0.0);
        vec3 colorB = vec3(1.0,0.0,0.0);

        void mainImage(out vec4 fragColor, in vec2 fragCoord) {
            
            vec2 uv = fragCoord.xy / iResolution.xy;
            uv.x *= iResolution.x / iResolution.y;

            
            //vec3 color = mix(colorA,colorB,bass+0.3);

            vec4 textureVideo = texture2D( iChannel0, vec2( vUv.x, vUv.y) );
            float gray = (textureVideo.r + textureVideo.g + textureVideo.b) / 3.0;
            vec3 color_red = vec3(bass+gray,0.0,0.0);
            vec3 color = textureVideo.rgb;                        
            color = ( textureVideo.rgb  ) * vec3(bass + 0.5 , bass + 0.5 , bass + 0.5 ) * 1.0;
            

            
            fragColor = vec4(color, 1.0 );


        }
        void main() {
            mainImage(gl_FragColor, vUv * iResolution.xy);
        }
        `
    }
}

export const MusicShader = ({ audio,
                              img='assets/img/masnaisraelb.png',
                              geometry=new THREE.PlaneBufferGeometry(3,3,100,100),
                              position=[0,0,0],
                              rotation=[0,0,0],
                              scale = [1,1,1] }) => {

    /** Getting mesh ready*/
    const { scene } = useThree();
    const texture = useLoader(THREE.TextureLoader,img);
    const [ mesh, setMesh] = useState();
    useEffect(()=>{
        const { vertexShader, fragmentShader, uniforms } = getShader(texture);
        const material = new THREE.ShaderMaterial({
            vertexShader: vertexShader,
            fragmentShader: fragmentShader,
            uniforms: uniforms
        });
        material.side = THREE.DoubleSide;
        const mesh = new THREE.Mesh(geometry, material);
        mesh.position.set(...position);
        mesh.rotation.set(...rotation);
        mesh.scale.set(...scale);
        scene.add(mesh);
        setMesh(mesh);
        return () => {
            scene.remove(mesh);
            mesh.geometry.dispose();
            mesh.material.dispose();
            texture.dispose();
        };
    },[]);

    const analyser = useMemo(()=>{
        if(audio){
            const fftSize = 2048;
            return new THREE.AudioAnalyser(audio, fftSize);   
        }
    },[audio]);
    const frequencyRange = useMemo(()=>{
        return {
            bass: [20, 140],
            lowMid: [140, 400],
            mid: [400, 2600],
            highMid: [2600, 5200],
            treble: [5200, 14000],
        }
    },[]);
    useFrame(({clock})=>{
        let data,bass,mid,treble;
        if(analyser){
            data = analyser.getFrequencyData();
            bass = getFrequencyRangeValue(frequencyRange.bass, data);
            mid = getFrequencyRangeValue(frequencyRange.mid, data);
            treble = getFrequencyRangeValue(frequencyRange.treble, data);
            // console.log( 'bass ' + bass + ' / mid ' + mid + ' / treble ' + treble)
        }
        if(mesh){
            mesh.material.uniforms.iTime.value = clock.elapsedTime;
            mesh.material.uniforms.bass.value = bass;
            mesh.material.uniforms.mid.value = mid;
            mesh.material.uniforms.treble.value = treble;
        }
    });

    return null;

}

/** Arguments explanation:
 * audio: THREE.audio
 * video: string => 'https://www.youtube.com/watch?v=CIb...' || 'assets/...mp4' || '' (webcam)
 * configuration: string => 
 *                              const configuration = `
                                    r = bass + 0.5;
                                    g = treble;
                                    b = mid;
                                    color.r = bass;
                                    color.g = mid;
                                    color.b = mid
                                    distance = 2;
                                `; 
 */
export const VideoPointsShader = ({ audio, videoSrc, webcam=false, shaderType, configuration, position=[0,0,0], rotation=[Math.PI, Math.PI, 0], scale=[1,1,1], colorInput = new THREE.Vector3(0,0,0) }) => {
    videoSrc = videoSrc || '';
    configuration = configuration || `
                                                r = bass + 0.5;
                                                g = treble;
                                                b = mid;
                                                color.r = bass;
                                                color.g = mid;
                                                color.b = mid
                                                distance = 2;                
                                            `;

    const configurationArray = configuration.split("\n");

    const fftSize = 2048;
    const frequencyRange = {
        bass: [20, 140],
        lowMid: [140, 400],
        mid: [400, 2600],
        highMid: [2600, 5200],
        treble: [5200, 14000],
    };

    const [analyser, setAnalyser] = useState(null);
    useEffect(()=>{
        if(audio){
            setAnalyser(new THREE.AudioAnalyser(audio, fftSize));
        }
    },[audio]);

    const {scene} = useThree();

    const [video, setVideo] = useState(null);
    const [particles, setParticles] = useState(null);

    useEffect(()=>{
        const getVideo = async () =>{
            const res = webcam === 'true' ? await initVideo() : await initVideo(videoSrc);
            setVideo(res);
        };
        getVideo();

        return ()=> {
            setVideo(null);
        }
    }, [videoSrc, webcam]);

    useEffect(()=>{
        return () => {
            if(particles) {
                scene.remove(particles);
            }
        }
    },[particles])

    useFrame(({clock})=>{
        
        if( !particles && video && video.readyState === 4 ){
            const res = createParticles(video, shaderType);
            res.position.set(...position);
            res.rotation.set(...rotation);
            res.scale.set(...scale);
            scene.add(res);
            setParticles(res);
        }
        
        let data, bass, mid, treble;
        if(analyser){
            data = analyser.getFrequencyData();
            bass = getFrequencyRangeValue(frequencyRange.bass, data);
            mid = getFrequencyRangeValue(frequencyRange.mid, data);
            treble = getFrequencyRangeValue(frequencyRange.treble, data);
            // console.log( 'bass ' + bass + ' / mid ' + mid + ' / treble ' + treble)
        }
        if(particles){
            particles.material.uniforms.iTime.value = clock.elapsedTime;
            particles.material.uniforms.bass.value = bass;
            particles.material.uniforms.mid.value = mid;
            particles.material.uniforms.treble.value = treble;
            particles.material.uniforms.colorInput.value = colorInput;
        }
        
    });

    return (
        null
    );
};

function createParticles(video, shaderType){

    const imageData = getImageData(video);
    const textureVideo = new THREE.VideoTexture(video);

    let shaderMaterial;
    if(shaderType==='videoshader1'){
        shaderMaterial = VideoShader1(textureVideo);
    }else{
        shaderMaterial = VideoShader0(textureVideo);
    }
    const material = shaderMaterial;
        
    const geometry = new THREE.BufferGeometry();
    const positions = [];
    const uvs = [];
    for (let y = 0, height = imageData.height; y < height; y += 1) {
        for (let x = 0, width = imageData.width; x < width; x += 1) {
            const vertex = new THREE.Vector3(
                x - imageData.width / 2,
                -y + imageData.height / 2,
                0
            );
            positions.push( vertex.x, vertex.y, vertex.z );
            uvs.push( x / imageData.width, y / imageData.height );
        }
    }
    geometry.setAttribute( 'position', new THREE.Float32BufferAttribute( positions, 3 ) );
    geometry.setAttribute( 'uv', new THREE.Float32BufferAttribute( uvs, 2 ) );
    
    const particles = new THREE.Points(geometry, material);

    return particles;
}

function initVideo(url) {
    if(url){
        // Get video from url
        return new Promise(resolve => {
            const video = document.createElement("video");
            video.autoplay = true;
            video.muted = true;
            video.playsInline = true;
    
            if(url && url.includes(filterYoutubeLink)){
                const src = herokuapp + url;
                video.src = src;
                video.crossOrigin = 'Anonymous';
                video.load();
                video.play();
                resolve(video);        
            }else {
                video.src = url;
                video.load();
                video.play();
                resolve(video);
            }
        });
    } else {
        // Activate Webcam
        return new Promise(resolve => {
            const video = document.createElement("video");
            video.autoplay = true;
            const option = { video:true, audio:false };
            navigator.mediaDevices.getUserMedia(option)
                .then((stream) => {
                    video.srcObject = stream;
                    video.addEventListener("loadeddata", () => {
                        resolve(video);
                    });
                })
                .catch((error) => {
                    console.log('error init webcam');
                    console.log(error);
                });
        });
    }
  }

function getImageData(video) {
    const canvas = document.createElement('CANVAS');
    const ctx = canvas.getContext('2d');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    ctx.translate(canvas.width, 0);
    ctx.scale(-1, 1);

    ctx.drawImage(video, 0, 0);
    const imageCache = ctx.getImageData(0, 0, canvas.width, canvas.height);
    return imageCache;
}

function getFrequencyRangeValue (_frequencyRange, frequencyData) {
    const data = frequencyData;
    const nyquist = 48000 / 2;
    const lowIndex = Math.round(_frequencyRange[0] / nyquist * data.length);
    const highIndex = Math.round(_frequencyRange[1] / nyquist * data.length);
    let total = 0;
    let numFrequencies = 0;

    for (let i = lowIndex; i <= highIndex; i++) {
        total += data[i];
        numFrequencies += 1;
    }

    return total / numFrequencies / 255;
};

