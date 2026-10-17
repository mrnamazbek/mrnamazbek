import { test } from "node:test";
import assert from "node:assert/strict";
import {
  searchNotes,
  searchRoles,
  getRoleFixture,
} from "../../src/features/studio/modules/data-explorer/domain";
import {
  notes,
  sampleRoles,
} from "../../src/features/studio/modules/data-explorer/fixtures";

test("invented notes and roles preserve distinct schemas and immutable fixtures", () => {
  assert.equal(notes.length, 19);
  assert.equal(sampleRoles.length, 9);
  assert.equal(new Set(notes.map((note) => note.id)).size, 19);
  assert.equal(new Set(sampleRoles.map((role) => role.id)).size, 9);
  const before = structuredClone({ notes, sampleRoles });
  searchNotes(notes, "", "all", 4);
  searchRoles(sampleRoles, "", "all", 2);
  assert.deepEqual({ notes, sampleRoles }, before);
});

test("normalized Unicode queries intersect categories and clamp shrinking pages", () => {
  assert.equal(searchNotes(notes, " CAFÉ ", "all", 4).total, 1);
  assert.equal(
    searchNotes(notes, "  EVENT   STREAMS  ", "systems", 4).total,
    1,
  );
  assert.equal(searchNotes(notes, "қазақша", "all", 1).total, 1);
  assert.equal(searchNotes(notes, "replay the same", "all", 1).total, 1);
  assert.equal(searchNotes(notes, "event streams", "research", 1).total, 0);
  const filtered = searchNotes(notes, "café", "all", 4);
  assert.equal(filtered.page, 1);
  assert.equal(filtered.pages, 1);
  assert.equal(searchNotes(notes, "", "all", 4).items.length, 1);
  for (const page of [-2, 0, NaN, Infinity])
    assert.equal(searchNotes(notes, "", "all", page).page, 1);
  assert.equal(searchNotes(notes, "", "all", 100).page, 4);
  assert.deepEqual(searchNotes(notes, "no such note", "all", 1), {
    items: [],
    total: 0,
    page: 1,
    pages: 1,
  });
});

test("sample role adapters never expose stale records in empty or unavailable mode", () => {
  assert.equal(getRoleFixture("seeded").roles.length, 9);
  assert.deepEqual(getRoleFixture("empty"), { state: "empty", roles: [] });
  assert.deepEqual(getRoleFixture("unavailable"), {
    state: "unavailable",
    roles: [],
  });
  assert.equal(
    searchRoles(sampleRoles, "  RELIABILITY  ", "Platform", 2).page,
    1,
  );
  assert.equal(searchRoles(sampleRoles, "reliability", "Platform", 1).total, 1);
  assert.equal(searchRoles(sampleRoles, "reliability", "Design", 1).total, 0);
});
