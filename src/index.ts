import * as THREE from 'three';
import { Camera, Clock, Color, CubeTexture, Group, Mesh, PerspectiveCamera, PointLight, Scene, Vector3 } from 'three';
import { damp, degToRad } from 'three/src/math/MathUtils';
import { CubeMapLoader } from './AssetLoaders/CubeMapLoader';
import { FbxAssetLoader } from './AssetLoaders/FbxAssetLoader';
import { TextureAssetLoader } from './AssetLoaders/TextureAssetLoader';
import { EInputEventType, InputService } from './GameServices/InputService';
import { MainCameraService } from './GameServices/MainCameraService';
import { ObjectHandlerBase } from './ObjectHandlers/ObjectHandlerBase';
import { PlayerObjectHandler } from './ObjectHandlers/PlayerObjectHandler';
import { TerrainObjectHandler } from './ObjectHandlers/TarrainObjectHandler';
import { BillboardObjectCreator } from './ObjectsCreators/BillboardObjectCreator';
import { PlayerObjectCreator } from './ObjectsCreators/PlayerObjectCreator';
import { TerrainObjectCreator } from './ObjectsCreators/TerrainObjectCreator';

enum ObjectNames {
    PLAYER = "Player",
    MAP = "Map",
    BILLBOARDS = "Billboards",
}

const G_ObjectsInScene: Map<string, Group | Mesh > = new Map();
const G_ObjectsHandlersMap: Map<string, ObjectHandlerBase> = new Map();
let G_SkyBoxTexture: CubeTexture;
let G_Scene: Scene;
let G_MainCamera: PerspectiveCamera;
let G_InputService: InputService;
let G_CameraService: MainCameraService;

initializationAndStartAsync().then(() => {
    console.log("Done!");
}).catch((err) => {
    console.error(err);
})


async function initializationAndStartAsync()
{
    
    try {
        await initDataAsync();
    } catch(err)
    {
        throw new Error("initializationAndStartAsync() Some Error in initDataAsync() ! -> " + err);
    }

    try {
        await loadAssetsAsync();
    } catch(err)
    {
        throw new Error("initializationAndStartAsync() Some Error in loadAssetsAsync() ! -> " + err);
    }

    try {
        await setupSceneAsync();
    } catch(err)
    {
        throw new Error("initializationAndStartAsync() Some Error in setupSceneAsync() ! -> " + err);
    }
    
    try {
        startRendering();
    } catch(err)
    {
        throw new Error("initializationAndStartAsync() Some Error in startRendering() ! -> " + err);
    }

    
    const audio = document.createElement("audio") as HTMLAudioElement;
    audio.src = "assets/Music/best_synthwave_music.mp3";
    audio.volume = 0.2;
    audio.loop = true;
    audio.play();
    
}

function startRendering() {
    console.log("startRendering() Is Running!")
    const mainCanvas = document.getElementById("mainCanvas") as HTMLCanvasElement;
    const renderer = new THREE.WebGLRenderer({canvas: mainCanvas});
    renderer.setSize(window.innerWidth, window.innerHeight);

    window.addEventListener("resize", onWindowResize, false)
    function onWindowResize() {
        G_MainCamera.aspect = window.innerWidth / window.innerHeight;
        G_MainCamera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
        render();
    }
    G_InputService = new InputService();
    G_CameraService = new MainCameraService(G_MainCamera);

    setupPlayerObjectHandlers();

    const clock = new Clock();
    function animate() {

        const deltaTime = clock.getDelta();
        const time = clock.getElapsedTime();
        requestAnimationFrame(animate);
    
        G_CameraService.UpdateAtFrame(deltaTime);
        //cameraPos.set(cameraDampX, cameraDampY, cameraDampZ);
        for(const value of G_ObjectsHandlersMap.values())
        {
            value.OnFrame(time, deltaTime);
        }
        render();
    }
    
    function render() {
        renderer.render(G_Scene, G_MainCamera);
    }
    
    animate();
}

async function initDataAsync() {
    console.log("initDataAsync() Is Running!")
    console.log("initDataAsync() Is Done!")
}

async function loadAssetsAsync() {

    console.log("loadAssetsAsync() Is Running!")
    
    const terrainModelCreationPromise = new TerrainObjectCreator().CreateAsync();
    const skyBoxTexturePromise = await new CubeMapLoader([
        "Textures/SkyBox_0/sky_rt.jpg",
        "Textures/SkyBox_0/sky_lt.jpg",
        "Textures/SkyBox_0/sky_tp.jpg",
        "Textures/SkyBox_0/sky_bt.jpg",
        "Textures/SkyBox_0/sky_ft.jpg",
        "Textures/SkyBox_0/sky_bk.jpg",
        
    ]).LoadAsync();

    const [ terrainModel, skyBoxTexture ] = await Promise.all([terrainModelCreationPromise, skyBoxTexturePromise]);
    G_SkyBoxTexture = skyBoxTexture;

    const player = await new PlayerObjectCreator(skyBoxTexture).CreateAsync();

    const billboards = await new BillboardObjectCreator().CreateAsync();
    const billboardsRoot = new Group();
    for(let billboard of billboards) {
        billboardsRoot.add(billboard);
    }

    G_ObjectsInScene.set(ObjectNames.PLAYER, player);
    G_ObjectsInScene.set(ObjectNames.MAP, terrainModel);
    G_ObjectsInScene.set(ObjectNames.BILLBOARDS, billboardsRoot);

    console.log("loadAssetsAsync() Is Done!")
}

async function setupSceneAsync() {

    console.log("setupSceneAsync() Is Running!")

    G_Scene = new THREE.Scene();

    G_MainCamera = new THREE.PerspectiveCamera(
        75,
        window.innerWidth / window.innerHeight,
        0.1,
        1000
    );

    G_Scene.background = G_SkyBoxTexture;
    
    console.log("G_ObjectsInScene count: " + G_ObjectsInScene.size);
    for(const sceneObject of G_ObjectsInScene.values())
    {
        G_Scene.add(sceneObject)
    }


    const player = G_ObjectsInScene.get(ObjectNames.PLAYER) as Mesh;
    if(!player || player === null) {
        throw new Error("Player is missing!");
    }

    const playerStartPosition = new Vector3(0, 0, 0);
    player.position.set(playerStartPosition.x, playerStartPosition.y, playerStartPosition.z);
    const cameraOffsetZ = -10;
    const cameraOffsetY = 5;
    G_MainCamera.position.set(playerStartPosition.x, playerStartPosition.y + cameraOffsetY, playerStartPosition.z + cameraOffsetZ);
    
    G_MainCamera.lookAt(playerStartPosition);
    console.log("setupSceneAsync() Is Done!")
}

function setupPlayerObjectHandlers() {

    const billboards = G_ObjectsInScene.get(ObjectNames.BILLBOARDS);
    const lastBillboard = billboards!.children[billboards!.children.length - 1];

    G_ObjectsHandlersMap.set(ObjectNames.PLAYER, new PlayerObjectHandler(
        G_ObjectsInScene.get(ObjectNames.PLAYER)!, G_InputService, G_CameraService, lastBillboard.position
    ));
    G_ObjectsHandlersMap.set(ObjectNames.MAP, new TerrainObjectHandler(
        G_ObjectsInScene.get(ObjectNames.MAP)! as Mesh, 
        G_ObjectsInScene.get(ObjectNames.BILLBOARDS)!
    ))


    for(const objHandler of G_ObjectsHandlersMap.values())
    {
        objHandler.OnStart();
    }
}


