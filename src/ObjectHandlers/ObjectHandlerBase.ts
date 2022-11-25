import { Group, Mesh } from "three";

export class ObjectHandlerBase {
    protected _object: Group | Mesh;
    constructor(object: Group | Mesh) {
        this._object = object;
    }
    
    OnStart() {

    }

    OnFrame(time: number, deltaTime: number) {

    }
}