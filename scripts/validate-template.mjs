import fs from 'node:fs';
import path from 'node:path';
const root=process.cwd();
const readJson=(p)=>JSON.parse(fs.readFileSync(path.join(root,p),'utf8'));
const teacher=readJson('src/data/teacher.json');
const curriculum=readJson('src/data/curriculum.json');
const settings=readJson('src/data/template-settings.json');
if(!teacher.appName||!teacher.name) throw new Error('Teacher identity is incomplete');
if(!Array.isArray(curriculum.levels)||curriculum.levels.length!==4) throw new Error('Curriculum must contain four levels');
const ids=curriculum.levels.flatMap(l=>l.subjects.flatMap(s=>s.units.flatMap(u=>u.lessons.map(x=>x.id))));
for(const id of ids){if(!fs.existsSync(path.join(root,'src/data/lessons',id+'.json'))) throw new Error('Missing lesson file: '+id);}
if(!settings.storageNamespace||settings.demoMode!==false) throw new Error('Production settings are not configured');
console.log('Template validation passed: '+ids.length+' lesson references checked.');
