import { test } from "node:test";
import assert from "node:assert/strict";
import { modules, getModule } from "../../src/features/studio/modules/registry";
import { chapters } from "../../src/features/studio/content/story";
import { ventures } from "../../src/features/studio/content/ventures";
import { createSceneSignals, resetSceneSignals } from "../../src/features/studio/runtime/signals";
test("six serializable workbenches have honest initial fixtures", () => {
 assert.equal(modules.length,6); assert.equal(new Set(modules.map(m=>m.slug)).size,6);
 assert.equal(getModule("unknown"),undefined);
 assert.deepEqual(JSON.parse(JSON.stringify(modules)),modules);
 for(const m of modules) { assert.ok(m.initialSample.length>=2 && m.initialSample.length<=4); for(const s of m.initialSample) assert.ok(s.label && s.value); }
});
test("four authored chapters and unvalidated ventures",()=>{assert.equal(new Set(chapters.map(c=>c.id)).size,4);for(const v of ventures){assert.equal(v.status,"Validating");assert.ok(v.nextStep);}});
test("scene reset mutates the same neutral object",()=>{const s=createSceneSignals();const same=s;Object.assign(s,{mode:"story",progress:.8,pointerX:1,pointerY:-1,chapter:3,paused:true});resetSceneSignals(s,"ambient");assert.equal(s,same);assert.deepEqual(s,{mode:"ambient",chapter:0,progress:0,pointerX:0,pointerY:0,paused:false});});
