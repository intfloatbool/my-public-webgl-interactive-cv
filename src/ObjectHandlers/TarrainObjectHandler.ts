import { Group, Mesh, ShaderMaterial } from "three";
import { clamp } from "three/src/math/MathUtils";
import {ObjectHandlerBase} from "./ObjectHandlerBase";

export class TerrainObjectHandler extends ObjectHandlerBase{

    private _neonLightTerrainMesh: Mesh;
    private _billboardsNeonLightsMeshes: Array<Mesh>;

    constructor(rootObj: Mesh, billboardsRoot: Mesh | Group) {
        super(rootObj);

        this._neonLightTerrainMesh = rootObj.getObjectByName("NeonBorder")! as Mesh;
        this._billboardsNeonLightsMeshes = new Array<Mesh>();
        
        const neonLightName = "neon_light";
        for(const billboard of billboardsRoot.children)
        {
            billboard.traverse((child) => {
                if(child.name.includes(neonLightName) && child as Mesh) {
                    this._billboardsNeonLightsMeshes.push(child as Mesh);
                }
            })
        }

    }

    OnFrame(time: number, deltaTime: number): void {
        
        

        if(this._neonLightTerrainMesh) {
            const shaderMat = this._neonLightTerrainMesh.material as ShaderMaterial;
            if(shaderMat) {

                const changeSpeed = 2;
                const timeSin = ((Math.sin(time * changeSpeed) + 1) * 0.5);
                const minValue = 0.8;
                const maxValue = 1.5;
                const targetGlow = maxValue * timeSin;
                const glowMultiplier = clamp(targetGlow, minValue, maxValue);

                shaderMat.uniforms.lightMultipler.value = glowMultiplier;
            }
        }

        if(this._billboardsNeonLightsMeshes)
        {
            for(const neonLight of this._billboardsNeonLightsMeshes)
            {
                const shaderMat = neonLight.material as ShaderMaterial;
                if(shaderMat) {

                    const changeSpeed = 20;
                    const timeSin = ((Math.sin(time * changeSpeed) + 1) * 0.5);
                    const minValue = 0.8;
                    const maxValue = 1.1;
                    const targetGlow = maxValue * timeSin;
                    const glowMultiplier = clamp(targetGlow, minValue, maxValue);

                    shaderMat.uniforms.lightMultipler.value = glowMultiplier;
                }
            }
        }

    }
}