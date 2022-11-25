import axios from "axios";
import THREE, { BoxGeometry, CubeTexture, Group, IUniform, Light, Material, Mesh, MeshBasicMaterial, MeshStandardMaterial, PointLight, ShaderMaterial, Texture, Vector3, Vector4 } from "three";
import { FbxAssetLoader } from "../AssetLoaders/FbxAssetLoader";
import { TextureAssetLoader } from "../AssetLoaders/TextureAssetLoader";


const BODY_NAME = "MainBody";

const LIGHTS_FRONT_NAME   = "FrontLights";
const LIGHTS_BACK_NAME    = "BackLights";
const GLASS_MAIN_NAME     = "Glasses";
const GLASS_SIDE_NAME     = "SideGlasses";

const FRONT_LEFT_WHEEL    = "WheelFrontLeft";
const BACK_LEFT_WHEEL     = "WheelBackLeft";

const FRONT_RIGHT_WHEEL   = "WheelFrontRight";
const BACK_RIGHT_WHEEL    = "WheelBackRight";

export class PlayerObjectCreator {

    private _cubeMapTexture: CubeTexture
    constructor(cubeMapTexture: CubeTexture) {
        this._cubeMapTexture = cubeMapTexture;
    }

    trySetupMaterialForMesh(mesh: Mesh, materials: Map<string, Material>) {
        if(materials.has(mesh.name))
            mesh.material = materials.get(mesh.name)!;
    }

    async CreateGlassShaderMaterialAsync() : Promise<ShaderMaterial> {

        const glassMainTexture = await new TextureAssetLoader(
            "Textures/Ferrari/GlassBlue.jpg"
        ).LoadAsync();

        const fragShaderResonse = await axios.get("./assets/Shaders/Glass/GlassFrag.glsl");
        const vertShaderResonce = await axios.get("./assets/Shaders/Glass/GlassVert.glsl");

        const vertShaderText: string = vertShaderResonce.data.toString();
        const fragShaderText: string = fragShaderResonse.data.toString();

        return new ShaderMaterial({
            uniforms: {
                u_camera: {
                    value: new Vector4(1, 1, 1, 1)
                },
                u_cubemap: {
                    value: this._cubeMapTexture
                },
                u_glass_texture: {
                    value: glassMainTexture
                }
            },
            vertexShader:   vertShaderText,
            fragmentShader: fragShaderText,
        });
    }

    async CreateBodyShaderMaterialAsync(): Promise<ShaderMaterial> {

        const noiseTexture = await new TextureAssetLoader("Textures/noise_texture.jpg").LoadAsync()

        const bodyTexture = await new TextureAssetLoader(
            "Textures/Ferrari/Ferrari_texure.jpg"
        ).LoadAsync();

        const fragShaderResonse = await axios.get("./assets/Shaders/PlayerFrag.glsl");
        const vertShaderResonce = await axios.get("./assets/Shaders/PlayerVert.glsl");

        const vertShaderText: string = vertShaderResonce.data.toString();
        const fragShaderText: string = fragShaderResonse.data.toString();

        return new ShaderMaterial({
            uniforms: {
                colorMap: {
                    value: bodyTexture
                },
                texture_reflection: {
                    value: this._cubeMapTexture
                },
                texture_noise: {
                    value: noiseTexture 
                },
                time: {
                    value: 1.0
                }
            },
            vertexShader:   vertShaderText,
            fragmentShader: fragShaderText,
        });
    }

    async CreateAsync(onProgress?: (normalizedPercent: number) => void) : Promise<Mesh | Group>  {
        
        const carModel = await new FbxAssetLoader(
            "Models/Ferrari.fbx"
        ).LoadAsync();

        const bodyTexture = await new TextureAssetLoader(
            "Textures/Ferrari/Ferrari_texure.jpg"
        ).LoadAsync();

        const lightsTexture = await new TextureAssetLoader(
            "Textures/Ferrari/CarLightWhite.jpg"
        ).LoadAsync();

        const glassMainTexture = await new TextureAssetLoader(
            "Textures/Ferrari/GlassBlue.jpg"
        ).LoadAsync();

        const glassSideTexture = await new TextureAssetLoader(
            "Textures/Ferrari/GlassNeon.jpg"
        ).LoadAsync();

        /*
        const bodyMaterial = new MeshBasicMaterial(
            {map: bodyTexture}
        );
        */

        const bodyMaterial = await this.CreateBodyShaderMaterialAsync();

        const wheelMaterial = new MeshBasicMaterial(
            {map: bodyTexture}
        );

        const lightsFrontMaterial = new MeshBasicMaterial(
            {
                map: lightsTexture,
                color: "#0092ff"
            }
        );

        const lightsBackMaterial = new MeshBasicMaterial(
            {
                map: lightsTexture,
                color: "#ff00ba"
            }
        );

   
        const glassMainMaterial = await this.CreateGlassShaderMaterialAsync();

        const glassSideMaterial = glassMainMaterial.clone();

        const materialsMap = new Map<string, Material>();
        materialsMap.set(BODY_NAME, bodyMaterial);
        materialsMap.set(FRONT_LEFT_WHEEL, wheelMaterial);
        materialsMap.set(FRONT_RIGHT_WHEEL, wheelMaterial);
        materialsMap.set(BACK_LEFT_WHEEL, wheelMaterial);
        materialsMap.set(BACK_RIGHT_WHEEL, wheelMaterial);
        materialsMap.set(GLASS_MAIN_NAME, glassMainMaterial);
        materialsMap.set(GLASS_SIDE_NAME, glassSideMaterial);
        materialsMap.set(LIGHTS_FRONT_NAME, lightsFrontMaterial);
        materialsMap.set(LIGHTS_BACK_NAME, lightsBackMaterial);

        const applyTexturePromise = new Promise((res, rej) => {
            const childrenCount = carModel.children.length;
            let counter = 0;
            carModel.traverse((child) => {
                const mesh = (child as THREE.Mesh);
                this.trySetupMaterialForMesh(mesh, materialsMap);
                console.log(`Check children: ${counter}, name: ${mesh.name}`);
                counter++;

                if(mesh.name.includes(LIGHTS_BACK_NAME)) {
                    mesh.position.setZ(-1);
                }
                
                if(counter >= childrenCount - 1) {
                    res(0);
                }
            });
        })

        await applyTexturePromise;

        

        const playerObj = carModel;

        const playerScaleFactor = 1 / 20;
        playerObj.scale.set(playerScaleFactor, playerScaleFactor, playerScaleFactor);

        return playerObj;
        
    }
}