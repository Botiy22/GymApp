/* Shared calorie calculation and validated private registration profile.
   The draft is kept in memory until the account is created. */
window.PersonalSetup = (function () {
  'use strict';
  const ACTIVITIES = [1.2, 1.375, 1.55, 1.725, 1.9];
  const num = v => { const n = parseFloat(String(v == null ? '' : v).replace(',', '.')); return isFinite(n) ? n : 0; };
  function calculate(p) {
    const w = num(p.weight), hgt = num(p.height), a = num(p.age); if (!w || !hgt || !a) return null;
    if (a < 14 || a > 100 || hgt < 120 || hgt > 230 || w < 30 || w > 300) return { bad: true };
    const act = ACTIVITIES.indexOf(+p.activity) >= 0 ? +p.activity : 1.55;
    const bmr = 10 * w + 6.25 * hgt - 5 * a + (p.sex === 'm' ? 5 : -161), tdee = bmr * act, m2 = (hgt / 100) * (hgt / 100);
    const goal = ['cut', 'maintain', 'bulk'].indexOf(p.goal) < 0 ? 'maintain' : a < 18 && p.goal === 'cut' ? 'maintain' : p.goal, floor = p.sex === 'm' ? 1500 : 1200;
    let kcal = Math.round(tdee * (1 + { cut: -0.18, maintain: 0, bulk: 0.1 }[goal]) / 10) * 10, floored = false;
    if (goal === 'cut' && kcal < floor) { kcal = Math.min(floor, Math.round(tdee / 10) * 10); floored = true; }
    const ref = Math.min(w, 27 * m2);
    const pr = Math.round(ref * (goal === 'cut' ? 2.0 : 1.8)), fat = Math.round(Math.max(ref * 0.8, kcal * 0.25 / 9));
    return { bmr: Math.round(bmr / 10) * 10, tdee: Math.round(tdee / 10) * 10, kcal, p: pr, c: Math.max(0, Math.round((kcal - pr * 4 - fat * 9) / 4)), f: fat, bmi: Math.round(w / m2 * 10) / 10, goal, floored, floor, minor: a < 18 && p.goal === 'cut' };
  }
  function bodyValid(p) {
    if (!p || typeof p !== 'object' || !['m', 'f'].includes(p.sex)) return false;
    if (!['age','height','weight'].every(k => ['string','number'].includes(typeof p[k]) && /^[0-9]+([.,][0-9]+)?$/.test(String(p[k]).trim()))) return false;
    const c = calculate({ sex: p.sex, age: p.age, height: p.height, weight: p.weight });
    return Number.isInteger(num(p.age)) && !!c && !c.bad;
  }
  function normalize(p) {
    if (!p || typeof p !== 'object' || !['string','number'].includes(typeof p.activity) || !bodyValid(p) || !['cut','maintain','bulk'].includes(p.goal) || !ACTIVITIES.includes(+p.activity)) return null;
    return { sex: p.sex, age: String(num(p.age)), height: String(num(p.height)), weight: String(num(p.weight)), activity: +p.activity, goal: p.goal };
  }
  const fresh = () => ({ step: 0, profile: { sex: '', goal: '', age: '', height: '', weight: '', activity: '' } });
  return { calculate, normalize, bodyValid, fresh };
})();
