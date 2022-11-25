export class AssetLoaderBase<T> {
    protected _relativePath: string;
    protected _basePath: string;
    constructor(realtivePath: string) {
        this._relativePath = realtivePath;
        this._basePath = "assets/";
    }

    async LoadAsync(onProgress?: (normalizedPercent: number) => void): Promise<T> {
        throw new Error("Not implemented");
    }
}