# QA Checklist

## Manual Flows

- [ ] Resume button opens modal without header shift on 320x568, 360x800, 375x812, 412x915
- [ ] Resume modal locks background scroll and restores previous position on close
- [ ] Resume modal supports keyboard close (`Esc`) and focus return to `#resume-open`
- [ ] DB ranking is readable on phones (card layout) and tablets/desktops (scroll/sticky header layout)
- [ ] No unexpected page-level horizontal overflow on mobile viewports
- [ ] Books section is proportionate on 1366 and >=1440 widths
- [ ] Light mode maintains readable contrast for nav, modal, and DB ranking

## Automated Flows

- [ ] `npx playwright test tests/responsive-smoke.spec.js` passes
- [ ] `npx playwright test tests/visual-regression.spec.js` passes
- [ ] Lighthouse mobile report generated via `scripts/run_lighthouse_mobile.ps1`

## Final Sign-Off

- [ ] No regressions observed in desktop visual behavior
- [ ] Mobile/tablet responsiveness stabilized
- [ ] Accessibility and focus handling verified for modal interactions

