export type ModuleSlug = 'policy-workflow' | 'data-explorer' | 'architecture' | 'interface-lab' | 'locale-inspector' | 'form-workbench';
export type ConnectIntent = 'cofound' | 'invest' | 'partner';
export type DemoState = 'idle' | 'invalid' | 'pending' | 'success' | 'unavailable' | 'error';
export interface ModuleDefinition { slug: ModuleSlug; title: string; summary: string; boundary: 'Seeded demo' | 'Local simulation'; featureIds: readonly string[]; initialSample: readonly {label:string;value:string}[] }
export interface ModuleViewProps { definition: ModuleDefinition }
export type SceneRouteMode = 'story' | 'ambient';
export interface SceneSignals { mode: SceneRouteMode; chapter:number; progress:number; pointerX:number; pointerY:number; paused:boolean }
