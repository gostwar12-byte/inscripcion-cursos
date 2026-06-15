const base = 'http://localhost:3000/api';

const headersJson = { 'Content-Type': 'application/json' };

async function safeJson(res){
  try { return await res.json(); } catch(e){ return await res.text(); }
}

async function run(){
  const email = `e2e_${Date.now()}@test.com`;
  const password = 'Pass1234!';

  console.log('Registering user', email);
  let res = await fetch(`${base}/auth/register`, {
    method: 'POST', headers: headersJson,
    body: JSON.stringify({ nombre: 'E2E User', correo: email, password })
  });
  if(!res.ok){
    console.error('Register failed', res.status, await safeJson(res));
    process.exit(2);
  }

  console.log('Logging in');
  res = await fetch(`${base}/auth/login`, {
    method: 'POST', headers: headersJson,
    body: JSON.stringify({ correo: email, password })
  });
  if(!res.ok){ console.error('Login failed', res.status, await safeJson(res)); process.exit(3); }
  const login = await safeJson(res);
  const token = login.data?.token || login.token;
  if(!token){ console.error('No token in login response', login); process.exit(4); }

  const authHeaders = { ...headersJson, Authorization: `Bearer ${token}` };

  console.log('Creating course with 1 cupo');
  const coursePayload = { nombre: 'E2E Curso', descripcion: 'Prueba E2E', cupos: 1, fechaInicio: new Date().toISOString().slice(0,10) };
  res = await fetch(`${base}/cursos`, { method: 'POST', headers: authHeaders, body: JSON.stringify(coursePayload) });
  if(!res.ok){ console.error('Create curso failed', res.status, await safeJson(res)); process.exit(5); }
  const curso = await safeJson(res);
  const cursoId = curso.data?.curso?.id || curso.curso?.id || curso.id;
  if(!cursoId){ console.error('Could not determine curso id', curso); process.exit(6); }

  console.log('Inscribiendo primera vez');
  res = await fetch(`${base}/inscripciones`, { method: 'POST', headers: authHeaders, body: JSON.stringify({ cursoId }) });
  if(res.status !== 201){ console.error('First inscription failed', res.status, await safeJson(res)); process.exit(7); }
  const firstIns = await safeJson(res);
  const insId = firstIns.data?.inscripcion?.id || firstIns.inscripcion?.id || firstIns.id;
  if(!insId){ console.error('Could not obtain inscription id', firstIns); process.exit(8); }

  console.log('Attempting second inscription (should fail)');
  res = await fetch(`${base}/inscripciones`, { method: 'POST', headers: authHeaders, body: JSON.stringify({ cursoId }) });
  if(res.ok){ console.error('Second inscription unexpectedly succeeded', await safeJson(res)); process.exit(9); }

  console.log('Cancelling inscription', insId);
  res = await fetch(`${base}/inscripciones/${insId}`, { method: 'DELETE', headers: authHeaders });
  if(!res.ok){ console.error('Delete inscription failed', res.status, await safeJson(res)); process.exit(10); }

  console.log('Verifying cupos restored');
  res = await fetch(`${base}/cursos`, { method: 'GET', headers: authHeaders });
  if(!res.ok){ console.error('Get cursos failed', res.status, await safeJson(res)); process.exit(11); }
  const cursos = await safeJson(res);
  const created = Array.isArray(cursos) ? cursos.find(c => c.id == cursoId || (c.Curso && c.Curso.id == cursoId)) : cursos;
  const cupos = created && (created.cupos || (created.Curso && created.Curso.cupos));
  if(cupos != 1){ console.error('Cupos not restored', cupos); process.exit(12); }

  console.log('E2E OK');
  process.exit(0);
}

run().catch(err => { console.error(err); process.exit(99); });
