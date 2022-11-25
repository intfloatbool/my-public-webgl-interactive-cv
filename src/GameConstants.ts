export enum CONSTANTS {
    PERFECT_WIDTH = 1664,
    PERFECT_HEIGHT = 764
}

export function IsMobileDevice(): boolean {
    const ua = navigator.userAgent;
    if (/(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(ua)) {
        return true;
    }
    else if (/Mobile|Android|iP(hone|od)|IEMobile|BlackBerry|Kindle|Silk-Accelerated|(hpw|web)OS|Opera M(obi|ini)/.test(ua)) {
        return true;
    }
    return false;
}

export function GetRatioFromPerfectWidth() {
    return window.innerWidth / CONSTANTS.PERFECT_WIDTH    
}

export function GetRatioFromPerfectHeight() {
    return window.innerHeight / CONSTANTS.PERFECT_HEIGHT    
}