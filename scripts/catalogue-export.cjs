const fs = require('fs'), path = require('path'), vm = require('vm');
const root = path.resolve(__dirname, '..');
const ctx = {window: {}}; vm.createContext(ctx);
for (const f of ['data/exercises.js','data/exercises.hu.js','data/recipes.js','data/figures.js','js/plan.js','data/additions.js']) {
  vm.runInContext(fs.readFileSync(path.join(root,f),'utf8'),ctx,{filename:f});
}
process.stdout.write(JSON.stringify({exercises:ctx.window.EXERCISES,hu:ctx.window.EX_HU,art:ctx.window.EX_ART,planIds:[...new Set(ctx.window.PLAN.items.map(i=>i.ex))]}));
