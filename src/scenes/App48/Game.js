// https://stackoverflow.com/questions/2450954/how-to-randomize-shuffle-a-javascript-array
import { ChromaticAberration } from '@react-three/postprocessing';
import * as THREE from 'three';
import { DragControls } from 'three/examples/jsm/controls/DragControls.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { Text } from 'troika-three-text'
import { playAudio } from './App48';
import * as Audio from './audio';

export default class Game{

    constructor(state, scene, camera, renderer) {
        this.scene = scene;
        this.camera = camera;
        this.renderer = renderer;
        this.squares = [];
        this.checkers = [];
        this.state = state;
        this.index = 0;

        this.nextWord();
    }

    nextWord() {

        if(this.index === this.state.length){

            playAudio(Audio.youwin);
            playAudio(Audio.applause);
            Audio.stopAudio(Audio.fantasyAmbient);

            /** Play audio with css Interface */
            Audio.whatfoxsay.controls = true;
            Audio.whatfoxsay.volume = 0.3;
            Audio.whatfoxsay.play();
            Audio.whatfoxsay.style.position = 'absolute'
            Audio.whatfoxsay.style.top = 0;
            Audio.whatfoxsay.style.zIndex = 200;
            const el = document.getElementById('root')
            el.appendChild(Audio.whatfoxsay)

            const nameModel = this.state[this.index - 1].word;
            const modelInScreen = this.scene.getObjectByName(nameModel);
            modelInScreen.visible = false;

            const winnerModel = this.scene.getObjectByName('winner');
            winnerModel.visible = true;

            return;
        }

        const wordTarget = this.state[this.index].word;
        const wordSound = wordTarget + 'Sound';
        setTimeout(()=>{
            playAudio( Audio[wordSound], 0.6 );
        }, 1000)

        const stateEl = this.state[this.index];

        if(this.squares.length != 0 && this.checkers.length != 0){

            this.squares.forEach( square => {
                this.scene.remove(square);
            })
            this.squares = [];

            this.checkers.forEach( checker => {
                this.scene.remove(checker);
            })
            this.checkers = [];
            this.checkerPositions = [];

            const nameModel = this.state[this.index - 1].word;
            const modelInScreen = this.scene.getObjectByName(nameModel);
            modelInScreen.visible = false;
        }

        const nameModel = this.state[this.index].word;
        const modelInScreen = this.scene.getObjectByName(nameModel);
        if(modelInScreen){
            modelInScreen.visible = true;
        }

        // Draw squares and checkers
        const wordLetters = stateEl.word.split(''); // 'lion' => [ 'l', 'i', 'o', 'n' ]
        wordLetters.forEach( (letter,i) => {

            const squareMesh = new THREE.Mesh(new THREE.PlaneBufferGeometry(1,1), new THREE.MeshBasicMaterial({color:'#2d6a4f', opacity:0.8, transparent:true }));
            squareMesh.position.set(i * 1.5 - 6, 2, 0);
            squareMesh.userData.letter = letter;
            this.scene.add(squareMesh);
            this.squares.push(squareMesh);

            const checkerMesh = this.createText(letter);
            checkerMesh.position.set(i * 1.5 - 6, 0, 0.1);
            checkerMesh.userData.letter = letter;
            this.scene.add(checkerMesh);
            this.checkers.push(checkerMesh);
            
        });

        // Desordenamos los checkers
        let continuaBucle = true;
        while (continuaBucle) {

            const checkersPrev = this.checkers.map( c => ({...c.userData.letter, ...c.position}))
            this.shuffle();
            const checkersPost = this.checkers.map( c => ({...c.userData.letter, ...c.position}))

            if( JSON.stringify(checkersPrev) === JSON.stringify(checkersPost) ) {
                console.log('Words is not disorder')
                continuaBucle = true;
            } else {
                continuaBucle = false;
            }

        }

        if(this.controls){
            this.disposeControls();
        }
        this.createDragControls();

        this.index++;
    }

    shuffle() {

        const array = this.checkers.map( c => c.position.clone() ); // importante el clone() si no no funciona el algoritmo
        let currentIndex = array.length, temporaryValue, randomIndex;
      
        // While there remain elements to shuffle...
        while (0 !== currentIndex) {
      
          // Pick a remaining element...
          randomIndex = Math.floor(Math.random() * currentIndex);
          currentIndex -= 1;
      
          // And swap it with the current element.
          temporaryValue = array[currentIndex];
          array[currentIndex] = array[randomIndex];
          array[randomIndex] = temporaryValue;
        }
      
        // array.forEach( (p,i) => {
        //     console.log(p)
        //     console.log(this.checkers[i])
        //     this.checkers[i].position.set(p.x,p.y,p.z);
        // });
        
        this.checkers.forEach( (c,i) => {
            const position = array[i];
            c.position.set(position.x,position.y,position.z);
        });

        return this.checkers;
      }

    createText(text) {
        const textMesh = new Text();
        // textMesh.font = 'https://fonts.gstatic.com/s/raleway/v17/1Ptxg8zYS_SKggPN4iEgvnHyvveLxVvao7CIPrcVIT9d0c8.woff';
        textMesh.text = text
        textMesh.fontSize = 0.7;
        textMesh.color = 0xffffff;
        textMesh.sync();
        return textMesh;
    }
    
    createOrbitControls() {
        this.controls = new OrbitControls( this.camera, this.renderer.domElement );

        this.controls.enablePan = false;
        this.controls.autoRotate = true;
        this.controls.enableDamping = true;
        this.controls.dampingFactor = 0.05;
        this.controls.screenSpacePanning = false;
        this.controls.minDistance = 1;
        this.controls.maxDistance = 10;
        this.controls.maxPolarAngle = Math.PI / 2;

        const nameModel = this.state[this.index - 1].word;
        const objectTarget = this.scene.getObjectByName(nameModel);
        this.controls.target.set(objectTarget.position.x,objectTarget.position.y + 0.2,objectTarget.position.z)
    }
    
    createDragControls() {
        
        this.controls = new DragControls( [ ... this.checkers ], this.camera, this.renderer.domElement );

        const raycaster = new THREE.Raycaster();
        const self = this;
        this.controls.addEventListener( 'dragend', function ( event ) {
            const checkerMesh = event.object;
            raycaster.set(checkerMesh.position,new THREE.Vector3(0,0,-1));
            const intersectObjects = raycaster.intersectObjects( self.squares );
            if(intersectObjects.length != 0) {
                const squareMesh = intersectObjects[0].object;
                checkerMesh.position.set(squareMesh.position.x - 0.15,squareMesh.position.y + 0.4,squareMesh.position.z + 0.1);
                playAudio(Audio.selection);
                if(self.checkGameSuccess()){
                    playAudio(Audio.success);
                    self.nextWord();
                }
            }
        } );
    }

    disposeControls() {
        this.controls.dispose();
    }

    checkGameSuccess() {
        const squares = this.squares;
        const checkers = this.checkers;

        let aciertos = 0;
        checkers.forEach( checker => {
            squares.forEach( square => {
               if(square.position.x - 0.15 == checker.position.x && square.position.y + 0.4 == checker.position.y ) {
                   if(square.userData.letter == checker.userData.letter ){
                        aciertos++;
                   }
               }
            })
        });

        if(checkers.length == aciertos){
            return true;
        } else {
            return false;
        }
        
    }

    update() {
        if(this.controls?.update){
            this.controls.update()
        }
    }

}