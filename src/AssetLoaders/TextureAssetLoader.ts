import { TextureLoader } from "three";
import { AssetLoaderBase } from "./AssetLoaderBase";

//TODO: Load textures
export class TextureAssetLoader extends AssetLoaderBase<THREE.Texture> {

    private _textureLoader: THREE.TextureLoader;
    constructor(realtivePath: string) {

        super(realtivePath);
        this._textureLoader = new TextureLoader();
    }

    async LoadAsync(onProgress?: (normalizedPercent: number) => void) : Promise<THREE.Texture> {

        return new Promise((res, rej) => {
            // load a resource
            this._textureLoader.load(
                // resource URL
                this._basePath + this._relativePath,

                // onLoad callback
                ( texture ) => {
                    res(texture);
                },

                (xhr) => {
                    if(onProgress != null)
                        onProgress(xhr.loaded / xhr.total);
                },

                ( err ) => {
                    rej(err);
                }
            );
        });
    }
}