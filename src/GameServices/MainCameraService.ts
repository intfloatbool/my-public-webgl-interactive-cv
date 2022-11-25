import { Group, MathUtils, Matrix4, Mesh, PerspectiveCamera, Quaternion, Vector3 } from "three";

export class CameraTarget {

    private _target: Vector3;
    private _speed?: number;

    constructor(target: Vector3, speed: number) {
        this._target = target;
        this._speed = speed;
    }

    public get Target() {
        return this._target;
    }


    public get Speed() {
        return this._speed;
    }
}


export class MainCameraService {
    
    private _currentTargetToFollow?: CameraTarget;
    private _currentTargetToLookAt?: CameraTarget;

    private _cameraRotationMatrix?: Matrix4 = new Matrix4();

    private _cameraRotationQuaternion?: Quaternion = new Quaternion();

    private _camera: PerspectiveCamera;

    constructor(camera: PerspectiveCamera) {
        this._camera = camera;
    }

    GetCameraPosition() {
        return this._camera.position.clone();
    }

    SetFollowTarget(cameraTarget: CameraTarget) {
        this._currentTargetToFollow = cameraTarget;
    }

    SetLookAtTarget(cameraTarget: CameraTarget) {
        this._currentTargetToLookAt = cameraTarget;
    }

    SetPositionForce(pos: Vector3) {
        this._camera.position.copy(pos);
    }

    SetLookAtForce(pos: Vector3) {
        this._cameraRotationMatrix!.lookAt(this._camera.position, pos, this._camera.up);

        this._cameraRotationQuaternion!.setFromRotationMatrix(this._cameraRotationMatrix!); 

        this._camera.quaternion.setFromRotationMatrix(this._cameraRotationMatrix!);

        this._camera.quaternion.rotateTowards(this._cameraRotationQuaternion!, 10000000000);

        this._camera.lookAt(pos);
    }



    public UpdateAtFrame(deltaTime: number) {

        if(this._currentTargetToLookAt) {
            this.HandleCameraLookAt(deltaTime);
        }

        if(this._currentTargetToFollow) {
            this.HandleCameraFollow(deltaTime);
        }

        
    }

    private HandleCameraFollow(deltaTime: number) {
        
        const currentCameraPos = this._camera.position;
        const targetPos = this._currentTargetToFollow?.Target!;
        const lambda = this._currentTargetToFollow!.Speed!;

        const cameraSmoothPos = new Vector3(
            MathUtils.damp(currentCameraPos.x, targetPos.x, lambda, deltaTime),

            MathUtils.damp(currentCameraPos.y, targetPos.y, lambda, deltaTime),

            MathUtils.damp(currentCameraPos.z, targetPos.z, lambda, deltaTime)
        );

        this._camera.position.copy(cameraSmoothPos);
    }

    private HandleCameraLookAt(deltaTime: number) {
        
        const lookAtTarget = this._currentTargetToLookAt!.Target!;
        const lookAtSpeed = this._currentTargetToLookAt!.Speed!;

        this._cameraRotationMatrix!.lookAt(this._camera.position, lookAtTarget, this._camera.up);

        this._cameraRotationQuaternion!.setFromRotationMatrix(this._cameraRotationMatrix!); 


        if(!this._camera.quaternion.equals(this._cameraRotationQuaternion!))
        {
            const rotationStep = lookAtSpeed * deltaTime;

            this._camera.quaternion.slerp(this._cameraRotationQuaternion!, rotationStep);
        }
    }
}