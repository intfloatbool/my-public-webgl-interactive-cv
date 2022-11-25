import { AssetLoaderBase } from "./AssetLoaderBase";
import { CubeTextureLoader } from "three";

/*
    ORDER:
    'pos-x',
    'neg-x',
    'pos-y',
    'neg-y',
    'pos-z',
    'neg-z',
*/
export class CubeMapLoader extends AssetLoaderBase<THREE.CubeTexture> {
    private _cubeMapsPath: Array<string>;
    private _cubeMapTextureLoader: CubeTextureLoader;
    constructor(cubeMapsPath: Array<string>) {
        super("");
        this._cubeMapsPath = cubeMapsPath;
        this._cubeMapTextureLoader = new CubeTextureLoader();
    }

    async LoadAsync(onProgress?: (normalizedPercent: number) => void) : Promise<THREE.CubeTexture> {
        
        return new Promise((res, rej) => {
            if(this._cubeMapsPath.length < 6)
            {
                rej(new Error("CubeMap should be with 6 - size!"))
            }
            const cubeArr: string[] = [];
            for(const cubeTextureRelativePath of this._cubeMapsPath)
            {
                cubeArr.push(this._basePath + cubeTextureRelativePath);
            }

            // load a resource
            this._cubeMapTextureLoader.load(
                // resource URL
                cubeArr,

                // onLoad callback
                ( cubeTexture ) => {
                    res(cubeTexture);
                },

                (xhr) => {
                    if(onProgress != null)
                        onProgress(xhr.loaded / xhr.total);
                },

                ( err ) => {
                    rej(err.message);
                }
            );
        });
    }
}