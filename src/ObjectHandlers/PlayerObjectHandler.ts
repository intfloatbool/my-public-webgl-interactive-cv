import { GUI } from "dat.gui";
import { Group, MathUtils, Mesh, ShaderMaterial, Vector3, Vector4 } from "three";
import { GetRatioFromPerfectWidth, IsMobileDevice } from "../GameConstants";
import { EInputEventType, InputService } from "../GameServices/InputService";
import { CameraTarget, MainCameraService } from "../GameServices/MainCameraService";
import { ObjectHandlerBase } from "./ObjectHandlerBase";

export class PlayerObjectHandler extends ObjectHandlerBase {
    
    private _inputService: InputService;
    private _playerMaxSpeed: number;
    private _playerSpeedUpTime: number;
    private _currentPlayerSpeed: number;
    private _speedTimer: number;

    private _cameraOffset: Vector3 = new Vector3(0, 10, -20);
    private _playerLookAtOffset: Vector3 = new Vector3(0, 10, 0);

    private _isStopped: boolean;

    private _startTriggerDistance = 10;

    private _isCammeraTriggered = false;

    private _cameraService: MainCameraService;

    private _wheels: Array<Mesh> = new Array<Mesh>();

    private _forcedPlayerSpeed?: number;

    private _startTriggerPosition = new Vector3(0, 0, 60);

    private _lastTargetPosition: Vector3;

    private _carMainGlassMeshes: Array<Mesh> = new Array<Mesh>();


    constructor(object: Group | Mesh, inputService: InputService, cameraService: MainCameraService, lastTargetPosition: Vector3)
    {
        super(object);

        this._inputService = inputService;
        this._playerMaxSpeed = 70 //* 10;
        this._playerSpeedUpTime = 9;
        this._currentPlayerSpeed = 0;
        this._speedTimer = 0;

        this._cameraService = cameraService;

        this._inputService.OnUpEvTarget.addEventListener(EInputEventType.FORWARD_KEY_CLICK, this.handleOnForwardKeyUp.bind(this));

        this._inputService.OnUpEvTarget.addEventListener(EInputEventType.BACKWARD_KEY_CLICK, this.handleOnBackwardKeyUp.bind(this));

        this._inputService.OnDownEvTarget.addEventListener(EInputEventType.FORWARD_KEY_CLICK, this.handleOnForwardKeyDown.bind(this));

        this._inputService.OnDownEvTarget.addEventListener(EInputEventType.BACKWARD_KEY_CLICK, this.handleOnBackwardKeyDown.bind(this));

        this._inputService.OnDownEvTarget.addEventListener(EInputEventType.SPACE_KEY_CLICK, this.handleOnSpaceKeyDown.bind(this));

        this._isStopped = true;

        this._object.traverse((children => {
            if(children as Mesh && children.name.includes("Wheel")) {
                this._wheels.push(children as Mesh);
            }
        }));

        const zOffseetFromEndBillboard = 10;

        this._lastTargetPosition = lastTargetPosition.add(new Vector3(0, 0, zOffseetFromEndBillboard));

        this._carMainGlassMeshes.push(this._object.getObjectByName("Glasses") as Mesh);
        this._carMainGlassMeshes.push(this._object.getObjectByName("SideGlasses") as Mesh);
    }



    OnStart(): void {
        //console.log(`Window data w/h: ${window.innerWidth} , ${window.innerHeight}`)
        const widthRatio = GetRatioFromPerfectWidth();

        const playerStartZ = -100 * widthRatio;

        const playerStartPos = new Vector3(0, 0, playerStartZ);
        this._object.position.copy(playerStartPos);

        const lookAtPos = new Vector3(0,0, 45 * widthRatio);

        const startCameraPos = new Vector3(-30, 20, 30 * widthRatio);

        this._cameraService.SetPositionForce(startCameraPos);
        this._cameraService.SetLookAtForce(lookAtPos);
        this._cameraService.SetLookAtTarget(new CameraTarget(lookAtPos, 10));

        const gui = new GUI({
            width: window.innerWidth * 0.5,
            
        });
        const controlsGuiFolder = gui.addFolder("Controls");

        const controls = {
            MoveForward: () => {
                this.MoveForwardForce();
            },
            MoveBackward: () => {
                this.MoveBackwardForce();
            },
            StopMove: () => {
                this.StopMoveForce();
            }
        };

        controlsGuiFolder.add(controls, "MoveForward");
        controlsGuiFolder.add(controls, "MoveBackward");
        controlsGuiFolder.add(controls, "StopMove");

        if(IsMobileDevice()) {
            controlsGuiFolder.open();
        }
    }

    MoveForwardForce() {
        this.SetForcePlayerSpeed(this._playerMaxSpeed);
    }

    MoveBackwardForce() {
        this.SetForcePlayerSpeed(-this._playerMaxSpeed);
    }

    StopMoveForce() {
        this.SetForcePlayerSpeed(0);
    }

    SetForcePlayerSpeed(speed: number) {
        this._forcedPlayerSpeed = speed;
    }

    ClearForcePlayerSpeed() {
        this._forcedPlayerSpeed = undefined;
    }

    getPlayerOffsetedPosition(): Vector3 {
        const playerPos = this._object.position;
        const offsetedPosition = playerPos.clone();
        offsetedPosition.add(this._cameraOffset);
        return offsetedPosition;
    }

    getPlayerLookAtPosition(): Vector3 {
        const playerPos = this._object.position;
        const offsetedPosition = playerPos.clone();
        offsetedPosition.add(this._playerLookAtOffset);
        return offsetedPosition;
    }


    handleOnForwardKeyUp( ) {
        this._speedTimer = 0;
    }

    handleOnBackwardKeyUp( ) {
        this._speedTimer = 0;
    }

    handleOnForwardKeyDown( ) {
        this._isStopped  = false;
        this._speedTimer = 0;
    }

    handleOnBackwardKeyDown( ) {
        this._isStopped  = false;
        this._speedTimer = 0;
    }

    handleOnSpaceKeyDown() {
        //this.ForceStop();
        this.StopSmoothly();
    }

    

    public ForceStop() {
        this._speedTimer = this._playerSpeedUpTime;
        this._currentPlayerSpeed = 0;
        this._isStopped  = true;
    }

    public StopSmoothly() {
        this._speedTimer = 0;
        this._isStopped  = true;
    }

    OnFrame(time: number, deltaTime: number): void {
        if(this._isCammeraTriggered) {
            this.HandleControlLoop(deltaTime);
            this.HandleCameraFollowForPlayer(deltaTime);
        }
        else {
            this.HandleAutoMoveAndCameraTriggerLoop(deltaTime);
        }

        this.HandleGraphicsLoop(deltaTime);
    }

    HandleCameraFollowForPlayer(deltaTime: number) {
        const playerOffset = this.getPlayerOffsetedPosition();
        const lookAtOffset = this.getPlayerLookAtPosition();
        let smoothMoveLambda = MathUtils.clamp(
            Math.abs(this._currentPlayerSpeed), 0.5, 8
        );
  
        
        this._cameraService.SetFollowTarget(new CameraTarget(playerOffset, smoothMoveLambda));
        this._cameraService.SetLookAtTarget(new CameraTarget(lookAtOffset, smoothMoveLambda));
        
        
    }

    HandleAutoMoveAndCameraTriggerLoop(deltaTime: number) {
        const player = this._object;

        const widthFactor = GetRatioFromPerfectWidth();
        const distanceFromStartTrigger = player.position.distanceTo(this._startTriggerPosition);
        if(distanceFromStartTrigger * widthFactor <= this._startTriggerDistance * widthFactor)
        {
            this._currentPlayerSpeed = 0;
            this._isCammeraTriggered = true;
            return;
        }


        const playerFrameSpeed = this.GetPlayerSpeedLoop(this._playerMaxSpeed, deltaTime);
        player.translateZ(playerFrameSpeed);

        for(const wheel of this._wheels) {
            wheel.rotateX(-playerFrameSpeed);
        }

        this.HandleSpeedTimerLoop(deltaTime);

    }

    HandleControlLoop(deltaTime: number) {
        const player = this._object;
        let targetPlayerSpeed = 0;

        if(!this._isStopped) {

            if(this._inputService.getIsDown(EInputEventType.FORWARD_KEY_CLICK))
            {
                targetPlayerSpeed = this._playerMaxSpeed;
                this.ClearForcePlayerSpeed();
            }
            else 
            {
                if(this._inputService.getIsDown(EInputEventType.BACKWARD_KEY_CLICK))
                {
                    targetPlayerSpeed = -this._playerMaxSpeed;
                    this.ClearForcePlayerSpeed();
                }
            }
        }

        // Do not let player reach out the box from start
        if(targetPlayerSpeed < 0)  {
            
            if(player.position.z < this._startTriggerPosition.z ) {
                targetPlayerSpeed = 0;
            }
            
        }

        if(targetPlayerSpeed > 0)  {
            
            if(player.position.z > this._lastTargetPosition.z ) {
                targetPlayerSpeed = 0;
            }
            
        }
        

        if(this._forcedPlayerSpeed) {
            targetPlayerSpeed = this._forcedPlayerSpeed;
        }
        
        const playerFrameSpeed = this.GetPlayerSpeedLoop(targetPlayerSpeed, deltaTime);
        player.translateZ(playerFrameSpeed);

        for(const wheel of this._wheels) {
            wheel.rotateX(-playerFrameSpeed);
        }

        this.HandleSpeedTimerLoop(deltaTime);
        
    }

    GetPlayerSpeedLoop(targetPlayerSpeed: number, deltaTime: number): number {
        const tSpeed = this._speedTimer / this._playerSpeedUpTime;
        const playerFrameSpeed = this._currentPlayerSpeed * deltaTime;
        this._currentPlayerSpeed = MathUtils.lerp(this._currentPlayerSpeed, targetPlayerSpeed, tSpeed);
        return playerFrameSpeed;
    }

    HandleSpeedTimerLoop(deltaTime: number) {
        this._speedTimer += deltaTime;
        this._speedTimer = MathUtils.clamp(this._speedTimer, 0, this._playerSpeedUpTime);
    }

    HandleGraphicsLoop(deltaTime: number) {
        const cameraPosition = this._cameraService.GetCameraPosition();
        for(const mesh of this._carMainGlassMeshes)
        {
            if(mesh) {
                const shaderMaterial = mesh.material as ShaderMaterial;
    
                if(shaderMaterial) {
                    
                    shaderMaterial.uniforms.u_camera.value = new Vector4(
                        cameraPosition.x,
                        cameraPosition.y,
                        cameraPosition.z,
                        1
                    );
                }
            }
        }
        
    }
}