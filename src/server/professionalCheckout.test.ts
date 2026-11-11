import assert from 'node:assert/strict';
import { test } from 'node:test';
import express from 'express';
import type { AddressInfo } from 'node:net';
import { PROFESSIONAL_COURSES } from '../data/professionalCourses.js';
import { PLANS, entitlementFor, hasCourseAccess, hasMentorshipAccess } from '../lib/pricing.js';

test('both professional courses charge exactly 2500 naira without unlocking a cohort or mentor', () => {
  for (const course of PROFESSIONAL_COURSES) {
    const plan = PLANS[course.id];
    assert.equal(plan.amountKobo, 250_000);
    const purchase = entitlementFor(plan, { reference: 'fixture', email: 'buyer@example.test' });
    assert.deepEqual(purchase.levels, []);
    assert.equal(hasCourseAccess([purchase], 'Emerging Leaders'), false);
    assert.equal(hasMentorshipAccess([purchase]), false);
  }
});

test('professional checkout verifies payment, hides instructor data, and persists isolated learner work', async t => {
  const previous = { PAYSTACK_SECRET_KEY: process.env.PAYSTACK_SECRET_KEY, SUPABASE_URL: process.env.SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY };
  process.env.PAYSTACK_SECRET_KEY = 'professional-fixture-secret';
  process.env.SUPABASE_URL = 'https://professional-storage.example.test';
  process.env.SUPABASE_SERVICE_ROLE_KEY = 'fixture-service-key';
  t.after(() => { for (const [key,value] of Object.entries(previous)) { if (value === undefined) delete process.env[key]; else process.env[key] = value; } });
  const { createPaymentRouter } = await import('./paymentRoutes.js');
  const { createLmsRouter } = await import('./lmsRoutes.js');
  const { issueLeadershipAccess } = await import('./leadershipAccess.js');
  const records = new Map<string, unknown>();
  const id = PROFESSIONAL_COURSES[0].id;
  const otherId = PROFESSIONAL_COURSES[1].id;
  const privateCourse = { id, title: 'Customer service fixture', published: true,
    answerKey: { 'question-1': 'B' }, facilitatorGuide: ['Instructor-only fixture'], sourceParagraphs: ['Private manuscript fixture'],
    modules: [{ id: 'module-1', title: 'Customer needs', lessons: [{ id: 'lesson-1', title: 'Listening', blocks: [{ id: 'reflection-1', type: 'reflection', content: 'Describe a service improvement.' }] }] }],
  };
  let available = true;
  let storageDown = false;
  let charge: any = null;
  const originalFetch = globalThis.fetch;
  t.mock.method(globalThis, 'fetch', async (input: string | URL | Request, init?: RequestInit) => {
    const url = new URL(String(input));
    if (url.hostname === 'professional-storage.example.test') {
      assert.equal(new Headers(init?.headers).get('Authorization'), 'Bearer fixture-service-key');
      if (storageDown) return Response.json({ error: 'Unavailable' }, { status: 503 });
      if (url.pathname.includes('/leadership-courses/')) {
        return available ? Response.json({ ...privateCourse, id: url.pathname.endsWith(id+'.json') ? id : otherId }) : Response.json({ statusCode: '404' }, { status: 400 });
      }
      const key = url.pathname.replace('/storage/v1/object/authenticated/','').replace('/storage/v1/object/','');
      if (init?.method === 'POST') { records.set(key, JSON.parse(String(init.body))); return Response.json({ Key: key }); }
      return records.has(key) ? Response.json(records.get(key)) : Response.json({ statusCode: '404' }, { status: 400 });
    }
    if (url.hostname === 'api.paystack.co') {
      if (url.pathname === '/transaction/initialize') { charge=JSON.parse(String(init?.body)); return Response.json({ status:true,data:{authorization_url:'https://checkout.example.test',reference:'professional-paid'} }); }
      return Response.json({status:true,data:{status:'success',domain:'live',reference:url.pathname.split('/').at(-1),amount:url.pathname.endsWith('wrong')?100:charge.amount,currency:'NGN',metadata:charge.metadata,customer:{email:'buyer@example.test'}}});
    }
    return originalFetch(input,init);
  });
  const app=express(); app.use(express.json(),createPaymentRouter(),createLmsRouter());
  const server=app.listen(0,'127.0.0.1'); await new Promise<void>(resolve=>server.once('listening',resolve));
  t.after(()=>{server.closeAllConnections();server.close();});
  const base=`http://127.0.0.1:${(server.address() as AddressInfo).port}`;
  const get=(path:string,token?:string)=>fetch(base+path,{headers:token?{Authorization:`Bearer ${token}`}:{}});
  const post=(path:string,body:unknown,token?:string)=>fetch(base+path,{method:'POST',headers:{'Content-Type':'application/json',...(token?{Authorization:`Bearer ${token}`}:{})},body:JSON.stringify(body)});
  const catalogue=await (await get('/lms/professional/availability')).json();
  assert.equal(Object.keys(catalogue.available).length,2);
  assert.ok(!JSON.stringify(catalogue).includes('Private manuscript'));
  assert.equal((await get('/lms/courses/'+id)).status,401);
  assert.equal((await get('/lms/courses/'+otherId)).status,401);
  available=false;
  assert.equal((await post('/payments/initialize',{plan:id,email:'buyer@example.test'})).status,409);
  assert.equal(charge,null);
  available=true; storageDown=true;
  assert.equal((await post('/payments/initialize',{plan:id,email:'buyer@example.test'})).status,503);
  storageDown=false;
  assert.equal((await post('/payments/initialize',{plan:id,email:'buyer@example.test',amount:1,deliveryMode:'Live class'})).status,200);
  assert.equal(charge.amount,250_000);
  assert.equal(charge.metadata.deliveryMode,'Self-paced learning');
  assert.equal((await get('/payments/verify/wrong')).status,422);
  const {entitlement}=await (await get('/payments/verify/professional-paid')).json();
  assert.deepEqual(entitlement.levels,[]);
  const token=entitlement.leadershipAccess.token;
  const course=await (await get('/lms/courses/'+id,token)).json();
  assert.equal(course.id,id);
  assert.ok(!('answerKey' in course)); assert.ok(!('sourceParagraphs' in course)); assert.ok(!('facilitatorGuide' in course));
  assert.equal((await get('/lms/courses/'+otherId,token)).status,401);
  const score=await post('/lms/leadership/'+id+'/quiz',{answers:{'question-1':'B'}},token);
  assert.equal(score.status,200);
  assert.deepEqual(await score.json(),{score:1,total:1,percentage:100});
  const work={userId:'forged',courseId:id,moduleId:'module-1',lessonId:'lesson-1',blockId:'reflection-1',data:{text:'My service improvement'}};
  assert.equal((await post('/lms/submission',work,token)).status,200);
  assert.equal((await post('/lms/submission',{...work,blockId:'invented'},token)).status,400);
  const saved=await (await get('/lms/submission/forged/'+id+'/reflection-1',token)).json();
  assert.notEqual(saved.userId,'forged'); assert.deepEqual(saved.data,work.data);
  const otherStudent=issueLeadershipAccess(id,'another@example.test','professional-fixture-secret').token;
  assert.equal(await (await get('/lms/submission/forged/'+id+'/reflection-1',otherStudent)).json(),null);
  assert.equal((await post('/lms/progress',{userId:'forged',courseId:id,completedLessons:['lesson-1','invented'],progressPercentage:500},token)).status,200);
  const progress=await (await get('/lms/progress/forged/'+id,token)).json();
  assert.deepEqual(progress.completedLessons,['lesson-1']); assert.equal(progress.progressPercentage,100);
  assert.ok(records.size>0);
});
