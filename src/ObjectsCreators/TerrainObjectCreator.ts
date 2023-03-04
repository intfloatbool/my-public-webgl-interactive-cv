import axios from "axios";
import THREE, { Color, Group, LoadingManager, Mesh, MeshBasicMaterial, PlaneGeometry, ShaderMaterial, Vector3 } from "three";
import { degToRad, radToDeg } from "three/src/math/MathUtils";
import { FbxAssetLoader } from "../AssetLoaders/FbxAssetLoader";
import { TextureAssetLoader } from "../AssetLoaders/TextureAssetLoader";
import { DegreesToRadians } from "../Utils/IFBMath";

export class TerrainObjectCreator {
    private _loadingManager: THREE.LoadingManager;


    constructor(loadingManager: LoadingManager) {
        this._loadingManager = loadingManager;
    }

    async CreateGlowShaderMaterialAsync(): Promise<ShaderMaterial> {

        const glowTexture = await new TextureAssetLoader(
            "Textures/neon_texture_0.jpg", this._loadingManager
        ).LoadAsync();

        const fragShaderResonse = await axios.get("./assets/Shaders/NeonGlow/NeonGlowFrag.glsl");
        const vertShaderResonce = await axios.get("./assets/Shaders/NeonGlow/NeonGlowVert.glsl");

        const vertShaderText: string = vertShaderResonce.data.toString();
        const fragShaderText: string = fragShaderResonse.data.toString();

        return new ShaderMaterial({
            uniforms: {          
                glowMap: {
                    value: glowTexture 
                },
                horizontal: {
                    value: true, //0.5
                },
                lightMultipler: {
                    value: 0
                }
                

            },
            vertexShader:   vertShaderText,
            fragmentShader: fragShaderText,
        });
    }

    async CreateAsync(onProgress?: (normalizedPercent: number) => void) : Promise<Mesh | Group>  {
        

        return new Promise(async (res, rej) => {
            const roadTexture = await new TextureAssetLoader("Textures/retro_road_pattern.jpg", this._loadingManager).LoadAsync();
   
            /*
            terrainModel.traverse((child) => {
                (child as THREE.Mesh).material = terrainMaterial;
            });
            */

            const roadModel = await new FbxAssetLoader("Models/retro_road.fbx", this._loadingManager).LoadAsync();


            const roadMaterial = new MeshBasicMaterial({
                //wireframe: true,
                map: roadTexture
            });

            const neonTexture = await new TextureAssetLoader("Textures/neon_texture_0.jpg", this._loadingManager).LoadAsync();


            const neonMaterial = await this.CreateGlowShaderMaterialAsync();

            const environmentMaterial = new MeshBasicMaterial({
                color: new Color(0.5, 0.5, 0.8),
                map: roadTexture
            });

            roadModel.traverse((child) => {
                let targetMaterial = 
                    child.name.includes("NeonBorder") ? neonMaterial : roadMaterial;

                if(child.name.includes("Environment")) {
                    targetMaterial = environmentMaterial;
                }
                (child as THREE.Mesh).material = targetMaterial;
            });
            
            const scaleFactor = 1 / 10;
            roadModel.scale.set(scaleFactor, scaleFactor, scaleFactor);
            roadModel.rotateY(degToRad(180));
            roadModel.position.copy(new Vector3());
            roadModel.position.setZ(-70);
            
            res(roadModel);
        });
     
    }
}