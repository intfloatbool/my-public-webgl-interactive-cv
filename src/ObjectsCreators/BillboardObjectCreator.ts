import THREE, { BoxGeometry, Color, Group, Material, Mesh, MeshBasicMaterial, MeshStandardMaterial, MeshToonMaterial, PlaneGeometry, ShaderMaterial, Texture, Vector3 } from "three";
import { degToRad, radToDeg } from "three/src/math/MathUtils";
import { FbxAssetLoader } from "../AssetLoaders/FbxAssetLoader";
import { TextureAssetLoader } from "../AssetLoaders/TextureAssetLoader";
import { GetRatioFromPerfectWidth } from "../GameConstants";
import { DegreesToRadians } from "../Utils/IFBMath";
import TextGeometry, { BMFontJsonParser, TextAlign, TextGeometryOption } from "three-text-geometry";


import { FontLoader } from 'three/examples/jsm/loaders/FontLoader'
import axios from "axios";
export class BillboardObjectCreator {


    constructor() {

    }

    async CreateGlowShaderMaterialAsync(): Promise<ShaderMaterial> {

        const glowTexture = await new TextureAssetLoader(
            "Textures/neon_texture_1.jpg"
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

    async CreateAsync(onProgress?: (normalizedPercent: number) => void) : Promise<Array<Mesh | Group>>  {
        
        return new Promise(async (res, rej) => {

            const billboardsCount = 15;
            const billboardsStartPosition = new Vector3(20, -5, 100);
            const billboardsOffset = new Vector3(0, 0, 150);
            const billboards: Array<Mesh | Group> = [];
            
            const adTexturesArr = new Array<Texture | null>();
            const textureNamePrefix = `ad_texture_`;
            const textureExtension = `.jpg`;

            for(let i = 0; i < billboardsCount; i++) {
                const textureName = textureNamePrefix + i + textureExtension;
                const texturePath = "Textures/Ads/" + textureName;
                let isExists = false;
                try {
                    const response = await axios.get("./assets/" + texturePath);
                    isExists = true;
                } catch(err) {
                    isExists = false;
                }
                

                if(isExists)
                {
                    const texture = await new TextureAssetLoader(texturePath).LoadAsync();
                    adTexturesArr.push(texture);
                }
                else {
                    adTexturesArr.push(null);
                }
            }
            
            const billboardTextureMain = await new TextureAssetLoader("Textures/dark_build_gradient.jpg").LoadAsync();

            
            const billboardMaterial = new MeshBasicMaterial({
                map: billboardTextureMain,
                color: new Color(0.25, 0.25, 0.5)
            });

            const neonMaterial = await this.CreateGlowShaderMaterialAsync();
            
            
            let currentXDir = 1;

            for(let i = 0; i < billboardsCount; i++) {
                
                const billboardGroup= await new FbxAssetLoader("Models/billboard.fbx").LoadAsync();

                const adMaterial = new MeshBasicMaterial({
                    color: new Color(1, 1, 1),
                });
                const billboardIndex = i;
                billboardGroup.traverse((child) => {
                    const index = new Number(billboardIndex);
                    const childMesh = child as THREE.Mesh;
                    let targetMaterial: Material;
                    if(child.name.includes("Body"))
                    {  
                        targetMaterial = billboardMaterial;
                    }
                    else if(child.name.includes("neon_light"))
                    {
                        targetMaterial = neonMaterial
                    }
                    else if(child.name.includes("imageBox"))
                    {
                        adMaterial.map = adTexturesArr[i];
                        targetMaterial = adMaterial;
                    
                    }

                    childMesh.material = targetMaterial!;

                });

                billboardGroup.scale.multiplyScalar(1 / 20);

                billboardGroup.position.copy(
                    billboardsStartPosition.clone().add(billboardsOffset.clone().multiplyScalar(i))
                );

                billboardGroup.position.setX(billboardGroup.position.x * currentXDir);
                
                
                billboards.push(billboardGroup);

                currentXDir = -currentXDir;
    
            }
       
            res(billboards);
        });
    
    }
}