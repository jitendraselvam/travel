import http from 'node:http';
import { DatabaseSync } from 'node:sqlite';
import { randomBytes, createHash } from 'node:crypto';
import { mkdirSync, readFileSync, writeFileSync, existsSync, statSync, renameSync } from 'node:fs';
import { join, resolve } from 'node:path';
const root=resolve('public'), data=resolve(process.env.DATA_DIR||'data');
mkdirSync(data,{recursive:true,mode:0o700});
const hash=s=>createHash('sha256').update(s).digest('hex'), token=()=>randomBytes(24).toString('hex');
const db=new DatabaseSync(join(data,'trip.sqlite'));
db.exec(`PRAGMA journal_mode=WAL; PRAGMA foreign_keys=ON; PRAGMA busy_timeout=5000;
CREATE TABLE IF NOT EXISTS members(id INTEGER PRIMARY KEY,name TEXT NOT NULL,code_hash TEXT UNIQUE NOT NULL);
CREATE TABLE IF NOT EXISTS sessions(token_hash TEXT PRIMARY KEY,member_id INTEGER NOT NULL REFERENCES members(id),expires INTEGER NOT NULL);
CREATE TABLE IF NOT EXISTS items(id INTEGER PRIMARY KEY,category TEXT NOT NULL CHECK(category IN ('food','place')),name TEXT NOT NULL,location TEXT NOT NULL DEFAULT '',note TEXT NOT NULL DEFAULT '',added_by INTEGER REFERENCES members(id),done INTEGER NOT NULL DEFAULT 0,created INTEGER NOT NULL,UNIQUE(category,name COLLATE NOCASE));
CREATE TABLE IF NOT EXISTS votes(item_id INTEGER REFERENCES items(id) ON DELETE CASCADE,member_id INTEGER REFERENCES members(id),rating INTEGER CHECK(rating BETWEEN 1 AND 5),PRIMARY KEY(item_id,member_id));
CREATE TABLE IF NOT EXISTS meta(key TEXT PRIMARY KEY,value TEXT);`);
if(!db.prepare('SELECT count(*) n FROM members').get().n){
 const invitations=Array.from({length:4},(_,i)=>({name:`Traveler ${i+1}`,code:randomBytes(12).toString('base64url')}));
 writeFileSync(join(data,'invitations.json'),JSON.stringify(invitations,null,2),{mode:0o600});
 db.exec('BEGIN');try{for(const m of invitations)db.prepare('INSERT INTO members(name,code_hash) VALUES(?,?)').run(m.name,hash(m.code));db.exec('COMMIT');}catch(e){db.exec('ROLLBACK');throw e;}
}
// Existing member credentials live in the persistent database, not source control.
// Complete any pending invitation-file publication from the legacy V3.1 migration.
const invitationPending=join(data,'invitations.v31.pending');
if(existsSync(invitationPending))renameSync(invitationPending,join(data,'invitations.json'));
if(!db.prepare("SELECT value FROM meta WHERE key='seeded'").get()){
 const seeds=JSON.parse(readFileSync('seed.json','utf8'));
 db.exec('BEGIN');try{for(const [category,name,location,note] of seeds)db.prepare('INSERT OR IGNORE INTO items(category,name,location,note,created) VALUES(?,?,?,?,?)').run(category,name,location,note,Date.now());db.prepare("INSERT INTO meta VALUES('seeded','1')").run();db.exec('COMMIT');}catch(e){db.exec('ROLLBACK');throw e;}
}
db.exec(`CREATE TABLE IF NOT EXISTS itinerary(day INTEGER PRIMARY KEY, revision INTEGER NOT NULL DEFAULT 0, rows TEXT NOT NULL);`);
const defaults=JSON.parse(readFileSync('plans.json','utf8'));
db.exec('BEGIN');try{
for(let i=0;i<defaults.length;i++)db.prepare('INSERT OR IGNORE INTO itinerary(day,rows) VALUES(?,?)').run(i,JSON.stringify(defaults[i]));
if(!db.prepare("SELECT value FROM meta WHERE key='food-v2'").get()){
for(const [category,name,location,note] of JSON.parse(readFileSync('food-v2.json','utf8')))db.prepare('INSERT OR IGNORE INTO items(category,name,location,note,created) VALUES(?,?,?,?,?)').run(category,name,location,note,Date.now());
db.prepare("INSERT INTO meta VALUES('food-v2','1')").run();}
if(!db.prepare("SELECT value FROM meta WHERE key='secret-v3'").get()){
for(const [category,name,location,note] of JSON.parse(readFileSync('secret-v3.json','utf8')))db.prepare('INSERT OR IGNORE INTO items(category,name,location,note,created) VALUES(?,?,?,?,?)').run(category,name,location,note,Date.now());
// Refresh the original guide pick without changing its ID, completion or votes.
const train=JSON.parse(readFileSync('secret-v3.json','utf8'))[0];
db.prepare("UPDATE items SET location=?,note=? WHERE category='place' AND name='Holiday Nostalgia Train' COLLATE NOCASE AND added_by IS NULL AND note='Sunday vintage subway; verify schedule'").run(train[2],train[3]);
db.prepare("INSERT INTO meta VALUES('secret-v3','1')").run();}
db.exec('COMMIT');}catch(e){db.exec('ROLLBACK');throw e;}
const reply=(res,status,obj,headers={})=>{res.writeHead(status,{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store',...headers});res.end(JSON.stringify(obj));};
const fail=(status,msg)=>Object.assign(new Error(msg),{status});
const current=req=>{const t=(req.headers.cookie||'').match(/(?:^|;\s*)nyc_session=([a-f0-9]{48})(?:;|$)/)?.[1];return t?db.prepare('SELECT m.id,m.name FROM sessions s JOIN members m ON m.id=s.member_id WHERE s.token_hash=? AND s.expires>?').get(hash(t),Date.now()):null;};
const cookie=(req,t,age)=>`nyc_session=${t}; Path=/; HttpOnly; SameSite=Strict; Max-Age=${age}${req.headers['x-forwarded-proto']==='https'?'; Secure':''}`;
async function body(req){if(!String(req.headers['content-type']).startsWith('application/json'))throw fail(415,'JSON required');let n=0,chunks=[];for await(const c of req){n+=c.length;if(n>65536)throw fail(413,'Request too large');chunks.push(c);}try{const x=JSON.parse(Buffer.concat(chunks).toString());if(!x||Array.isArray(x)||typeof x!=='object')throw 0;return x;}catch{throw fail(400,'Invalid request');}}
function field(x,max,required=false){if(typeof x!=='string'&&x!==undefined)throw fail(400,'Invalid text');const s=(x||'').trim();if(s.length>max||required&&!s)throw fail(400,`Enter ${required?'1–':'up to '}${max} characters`);return s;}
function board(user){return {user,members:db.prepare('SELECT id,name FROM members ORDER BY id').all(),items:db.prepare(`SELECT i.*,m.name author, (SELECT avg(rating) FROM votes WHERE item_id=i.id) average,(SELECT count(*) FROM votes WHERE item_id=i.id) count,(SELECT rating FROM votes WHERE item_id=i.id AND member_id=?) my_rating FROM items i LEFT JOIN members m ON m.id=i.added_by ORDER BY i.done, i.id DESC`).all(user.id)};}
let attempts=[];
async function api(req,res,path){const method=req.method;
 if(method!=='GET' && req.headers['x-trip-request']!=='1')throw fail(403,'Invalid request origin');
 if(path==='/api/login'&&method==='POST'){
  attempts=attempts.filter(t=>t>Date.now()-60000);if(attempts.length>=30)throw fail(429,'Too many attempts. Try again in a minute.');attempts.push(Date.now());
  const b=await body(req),code=field(b.code,80,true);const u=db.prepare('SELECT id,name FROM members WHERE code_hash=?').get(hash(code));if(!u)throw fail(401,'Invalid invitation code');
  const t=token(),age=30*86400;db.prepare('DELETE FROM sessions WHERE expires<=?').run(Date.now());db.prepare('INSERT INTO sessions VALUES(?,?,?)').run(hash(t),u.id,Date.now()+age*1000);return reply(res,200,{user:u},{'Set-Cookie':cookie(req,t,age)});
 }
 const u=current(req);if(!u)throw fail(401,'Enter your personal invitation code to join the board.');
 if(path==='/api/itinerary'&&method==='GET')return reply(res,200,{days:db.prepare('SELECT * FROM itinerary ORDER BY day').all().map(x=>({...x,rows:JSON.parse(x.rows)}))});
 if(path==='/api/itinerary'&&method==='POST'){
 const b=await body(req);if(!Array.isArray(b.days)||!b.days.length||b.days.length>7)throw fail(400,'Invalid days');
 db.exec('BEGIN');try{for(const d of b.days){if(!Number.isInteger(d.day)||d.day<0||d.day>6||!Number.isInteger(d.revision)||!Array.isArray(d.rows)||d.rows.length>40)throw fail(400,'Invalid itinerary');
 const rows=d.rows.map(r=>{if(!Array.isArray(r)||r.length<5||r.length>6)throw fail(400,'Invalid stop');return [field(r[0],80),field(r[1],120,true),field(r[2],180)||field(r[1],120,true),field(r[3],400),r[4]==='walk'?'walk':'transit', ['booked','fixed','optional'].includes(r[5])?r[5]:''];});
 if(!db.prepare('UPDATE itinerary SET rows=?,revision=revision+1 WHERE day=? AND revision=?').run(JSON.stringify(rows),d.day,d.revision).changes)throw fail(409,'Someone changed this day. Reload before editing again.');}
 db.exec('COMMIT');}catch(e){db.exec('ROLLBACK');throw e;}return reply(res,200,{ok:true});}
 if(path==='/api/board'&&method==='GET')return reply(res,200,board(u));
 if(path==='/api/logout'&&method==='POST'){const t=(req.headers.cookie||'').match(/(?:^|;\s*)nyc_session=([a-f0-9]{48})/)?.[1];if(t)db.prepare('DELETE FROM sessions WHERE token_hash=?').run(hash(t));return reply(res,200,{ok:true},{'Set-Cookie':cookie(req,'',0)});}
 if(path==='/api/profile'&&method==='POST'){const b=await body(req),name=field(b.name,40,true);db.prepare('UPDATE members SET name=? WHERE id=?').run(name,u.id);return reply(res,200,{ok:true});}
 if(path==='/api/items'&&method==='POST'){const b=await body(req);if(!['food','place'].includes(b.category))throw fail(400,'Choose Food or Places');const name=field(b.name,120,true),loc=field(b.location,180),note=field(b.note,400);if(db.prepare('SELECT id FROM items WHERE category=? AND name=? COLLATE NOCASE').get(b.category,name))throw fail(409,'Already on the shared checklist');if(db.prepare('SELECT count(*) n FROM items').get().n>=1000)throw fail(409,'Checklist is full');db.prepare('INSERT INTO items(category,name,location,note,added_by,created) VALUES(?,?,?,?,?,?)').run(b.category,name,loc,note,u.id,Date.now());return reply(res,201,{ok:true});}
 const match=path.match(/^\/api\/items\/(\d+)\/(rating|done)$/);if(match&&method==='POST'){const id=Number(match[1]);if(!db.prepare('SELECT id FROM items WHERE id=?').get(id))throw fail(404,'Item not found');const b=await body(req);if(match[2]==='rating'){if(!Number.isInteger(b.rating)||b.rating<0||b.rating>5)throw fail(400,'Choose 1–5 stars');if(!b.rating)db.prepare('DELETE FROM votes WHERE item_id=? AND member_id=?').run(id,u.id);else db.prepare('INSERT INTO votes VALUES(?,?,?) ON CONFLICT(item_id,member_id) DO UPDATE SET rating=excluded.rating').run(id,u.id,b.rating);}else{if(typeof b.done!=='boolean')throw fail(400,'Invalid status');db.prepare('UPDATE items SET done=? WHERE id=?').run(Number(b.done),id);}return reply(res,200,{ok:true});}
 const del=path.match(/^\/api\/items\/(\d+)$/);if(del&&method==='DELETE'){const item=db.prepare('SELECT added_by FROM items WHERE id=?').get(Number(del[1]));if(!item)throw fail(404,'Item not found');if(item.added_by!==u.id)throw fail(403,'Only the person who added this item can remove it');db.prepare('DELETE FROM items WHERE id=?').run(Number(del[1]));return reply(res,200,{ok:true});}
 throw fail(404,'Not found');
}
const mime={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.png':'image/png','.webmanifest':'application/manifest+json','.txt':'text/plain; charset=utf-8'};
const server=http.createServer(async(req,res)=>{res.setHeader('X-Content-Type-Options','nosniff');res.setHeader('Referrer-Policy','strict-origin-when-cross-origin');res.setHeader('X-Frame-Options','DENY');res.setHeader('X-Robots-Tag','noindex, nofollow');try{const path=new URL(req.url,'http://localhost').pathname;if(path==='/healthz')return reply(res,200,{ok:true});if(path.startsWith('/api/'))return await api(req,res,path);if(!['GET','HEAD'].includes(req.method))throw fail(405,'Method not allowed');const file=path==='/'?'index.html':path.slice(1);if(!/^[\w.-]+$/.test(file)||!Object.hasOwn(mime,file.slice(file.lastIndexOf('.'))))throw fail(404,'Not found');const p=join(root,file);if(!existsSync(p)||!statSync(p).isFile())throw fail(404,'Not found');res.writeHead(200,{'Content-Type':mime[file.slice(file.lastIndexOf('.'))],'Cache-Control':'no-cache'});res.end(req.method==='HEAD'?undefined:readFileSync(p));}catch(e){if(!e.status)console.error(e);if(!res.headersSent)reply(res,e.status||500,{error:e.status?e.message:'Server error'});else res.end();}});
server.requestTimeout=15000;server.headersTimeout=10000;server.listen(Number(process.env.PORT||8080),'0.0.0.0',()=>console.log('NYC / 04 listening'));
