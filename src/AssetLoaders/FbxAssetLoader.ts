
import { Group } from 'three';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader'
import { AssetLoaderBase } from './AssetLoaderBase';

export class FbxAssetLoader extends AssetLoaderBase<Group> {

    private _loader: FBXLoader;

    constructor(realtivePath: string) {
        super(realtivePath);
        this._loader = new FBXLoader();
    }

    async LoadAsync(onProgress?: (normalizedPercent: number) => void) : Promise<Group>  {
        this._loader = new FBXLoader();
        return new Promise((res, rej) => {
            this._loader.load(
                this._basePath + this._relativePath,
                (object) => {
                    
                    res(object);
                },
                (xhr) => {
                    if(onProgress != null)
                        onProgress(xhr.loaded / xhr.total);
                },
                (error) => {
                    rej(error);
                }
            )
        });
        
    }



}