export class AssetLoaderBase<T> {
    protected _loadingManager: THREE.LoadingManager;
    protected _relativePath: string;
    protected _basePath: string;
    constructor(realtivePath: string, loadingManager: THREE.LoadingManager) {
        this._relativePath = realtivePath;
        this._basePath = "assets/";
        this._loadingManager = loadingManager;
    }

    async LoadAsync(onProgress?: (normalizedPercent: number) => void): Promise<T> {
        throw new Error("Not implemented");
    }
}