import type { SceneRouteMode, SceneSignals } from '../modules/types';
export function createSceneSignals(): SceneSignals {return {mode:'ambient',chapter:0,progress:0,pointerX:0,pointerY:0,paused:false};}
export function resetSceneSignals(signals:SceneSignals, mode:SceneRouteMode):void {Object.assign(signals,{mode,chapter:0,progress:0,pointerX:0,pointerY:0,paused:false});}
