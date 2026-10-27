const $ = id => document.getElementById(id);
const escapeHTML = value => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const steps = [
  ['received',0,'↙','Lead received','Instant form → lead desk'],
  ['message',2,'↗','Instant text + email sent','A personal welcome, in two seconds.'],
  ['contact',3,'▤','Contact created in CRM','Source, consent and contact details saved.'],
  ['profile',4,'✧','Lead profiled + scored','Property fit meets buyer intent.'],
  ['match',5,'◎','Agent matched','The right person for this property.'],
  ['bridge',6,'☎','Bridge call','Calling Alfred first…'],
  ['decision',13,'◇','Did the buyer answer?','Choose an outcome to explore the branch.'],
  ['branch',18,'✓','Call connected','Recording announced; every person consents.'],
  ['transcript',30,'≡','Transcript ready','The conversation, captured word for word.'],
  ['summary',36,'✧','AI summary','The details that move the lead forward.'],
  ['updated',41,'▤','CRM updated','Showing requested. Next task created.'],
  ['email',45,'↗','Follow-up email drafted','Personal, specific and ready for review.']
];
let elapsed=0, running=false, speed=1, selectedTab='crm', started=false, lastTick=0;
let buyer={name:'Maya Thompson',phone:'(617) 555-0142',email:'maya@example.com',timeline:'soon',approved:'Yes'};
const answered=()=>$('outcome').value==='answered';
const firstName=()=>buyer.name.trim().split(/\s+/)[0]||'Maya';
const score=()=>25+(buyer.timeline==='soon'?30:buyer.timeline==='middle'?20:10)+(buyer.approved==='Yes'?25:buyer.approved==='Not sure'?10:0)+20;
const has=t=>started&&elapsed>=t;
const time=n=>`${String(Math.floor(n/60)).padStart(2,'0')}:${String(Math.floor(n%60)).padStart(2,'0')}`;
function detail(id){
 const name=escapeHTML(firstName());
 if(id==='message')return `<div class="bubble">Hi ${name}, it's Alfred's team — thanks for asking about the Malden condo! I'm calling you in a minute from this number.</div><div style="margin-top:6px">Welcome email sent · property details included</div>`;
 if(id==='profile')return `<div class="score-line"><span>Malden · $449k · condo</span><b>${score()}<small style="font-size:10px"> / 100</small></b></div>+${buyer.timeline==='soon'?30:buyer.timeline==='middle'?20:10} timeline ${buyer.timeline==='soon'?'0–3 mo':buyer.timeline==='middle'?'3–6 mo':'6+ mo'}<br>+${buyer.approved==='Yes'?25:buyer.approved==='Not sure'?10:0} pre-approval: ${escapeHTML(buyer.approved)}<br>+20 price in range · +15 location fit · +10 condo fit`;
 if(id==='match')return `<div class="team-list"><strong>● Alfred K. — Malden/Medford, condos</strong><br>○ Agent 2 — Cambridge/Somerville<br>○ Agent 3 — first-time buyers</div>Rule: match location + property type → Alfred K.`;
 if(id==='bridge')return `<span class="ringing">☎</span> ${elapsed<9?'Calling Alfred first…':elapsed<11?'Alfred pressed 1 to accept…':`Now calling ${name}…`}`;
 if(id==='decision')return `<div class="decision-buttons"><button type="button" data-answer="answered" class="${answered()?'selected':''}">She answered</button><button type="button" data-answer="missed" class="${!answered()?'selected missed':''}">No answer</button></div>`;
 if(id==='branch')return answered()?`Call recorded — caller was told 'this call is recorded'.<br>Recording starts after all participants consent.`:'Voicemail dropped (pre-recorded).<br>Follow-up text scheduled in 10 min.<br>Retry plan: call again in 2 h, then next morning.';
 return '';
}
function renderFlow(){
 const visible=answered()?steps:steps.filter(s=>!['transcript','summary','updated','email'].includes(s[0]));
 let current=-1;visible.forEach((s,i)=>{if(has(s[1]))current=i;});
 $('flow').innerHTML=visible.map(([id,t,icon,title,description],i)=>{
 if(id==='branch'&&!answered()){title='No answer — follow-up underway';description='The lead stays in the follow-up queue.';icon='↻';}
 if(id==='branch'&&answered())title='Call recorded';
 return `<div class="node ${id==='decision'?'decision':''} ${has(t)?i===current&&elapsed<47?'active':'done':''} ${id==='branch'&&has(t)?answered()?'success':'failure':''}"><div class="node-icon">${id==='decision'?'<span>?</span>':icon}</div><div class="node-title">${title}<span class="node-time">${time(t)}</span></div><div class="node-description">${description}</div>${detail(id)?`<div class="node-detail">${detail(id)}</div>`:''}</div>`;
 }).join('');
 document.querySelectorAll('[data-answer]').forEach(b=>b.onclick=()=>{ $('outcome').value=b.dataset.answer;render(); });
}
const transcript = [
 ['ALFRED',"Hi, is this Maya? It's Alfred from the team — you asked about the Malden condo a minute ago. Just so you know, this call is recorded so I don't miss any details. Is now an OK time?"],
 ['MAYA','Oh wow, that was fast. Yeah, sure.'],
 ['ALFRED','Great. What caught your eye about this one?'],
 ['MAYA',"The price, honestly, and it's close to the Orange Line. I work in Back Bay."],
 ['ALFRED',"Makes sense — it's about a 9-minute walk to Malden Center. Are you working with a lender yet?"],
 ['MAYA',"I'm pre-approved up to 470, with Salem Five."],
 ['ALFRED','Perfect. Timeline?'],
 ['MAYA','My lease ends in February, so ideally I close by then.'],
 ['ALFRED',"That works. Anything you need, or can't live with?"],
 ['MAYA',"Two bedrooms for sure, in-unit laundry, and parking. I don't want to be on a first floor."],
 ['ALFRED',"This one's second floor with in-unit laundry and one deeded spot. Want to see it Saturday? I have 11 or 1."],
 ['MAYA','11 works.'],
 ['ALFRED',"Done. I'll text you the address and send two similar ones in Medford you might like too."],
 ['MAYA','Amazing, thank you.']
];
function empty(title,description){return `<div class="empty-state"><div class="empty-icon">${selectedTab==='phone'?'☏':'▤'}</div><h3>${title}</h3><p>${description}</p>${selectedTab==='crm'?'<div class="preview">Contact details <span>Waiting</span><br>Lead score <span>— / 100</span><br>Next step <span>Waiting</span></div>':''}</div>`;}
function renderOutput(){
 let html='';const name=escapeHTML(buyer.name), first=escapeHTML(firstName());
 if(selectedTab==='crm'){
 if(!has(3))html=empty('Your next lead lands here.','Run the demo to watch a contact become a conversation — and a showing.');
 else html=`<div class="output-kicker">CONTACT / MALDEN CONDO AD</div><div class="contact-header"><div class="contact-avatar">${escapeHTML(buyer.name.split(/\s+/).map(n=>n[0]).slice(0,2).join(''))}</div><div><h3>${name}</h3><small>Assigned to ${has(5)?'Alfred K.':'team queue'}</small></div></div><dl class="contact-details"><div><dt>Phone</dt><dd>${escapeHTML(buyer.phone)}</dd></div><div><dt>Email</dt><dd>${escapeHTML(buyer.email)}</dd></div><div><dt>Source</dt><dd>Malden condo ad</dd></div><div><dt>Lead score</dt><dd>${has(4)?`${score()} / 100`:'Profiling…'}</dd></div><div><dt>Stage</dt><dd><span class="pill ${!answered()&&has(18)?'red':''}">${has(41)&&answered()?'Hot — showing requested':has(18)&&!answered()?'No answer — follow-up':has(18)?'Call connected':'New lead'}</span></dd></div><div><dt>Consent</dt><dd>Call/text · form checkbox</dd></div></dl><div class="tags"><span class="tag">Malden</span><span class="tag">Condo</span>${buyer.approved==='Yes'?'<span class="tag">Pre-approved</span>':''}<span class="tag">${buyer.timeline==='soon'?'0–3 months':buyer.timeline==='middle'?'3–6 months':'6+ months'}</span></div><div class="task"><small>NEXT TASK</small><h3>${has(41)&&answered()?'Showing Sat 11am':has(18)&&!answered()?'Follow-up text in 10 min':'Connect buyer with Alfred'}</h3><p>${has(18)&&!answered()?'Call again in 2 h · next morning retry':has(41)&&answered()?'Send address + two similar Medford listings.':'The workflow will update this automatically.'}</p></div>`;
 }else if(selectedTab==='phone'){
 html=`<div class="phone-mock"><div class="phone-top">9:41<div class="phone-notch"></div>▰</div><div class="phone-contact"><span>A</span><strong>Alfred's team</strong>Messages</div><div class="phone-messages"><small>Today · simulated</small>${has(2)?`<div class="sms">Hi ${first}, it's Alfred's team — thanks for asking about the Malden condo! I'm calling you in a minute from this number.</div>`:'<p style="text-align:center;color:#7e8a9c">Waiting for the first message…</p>'}${has(18)?answered()?'<div class="sms" style="margin-top:15px">☎ Connected with Alfred<br>Call recording announced; consent received.</div>':'<div class="voicemail"><strong>☎ Missed call · Alfred’s team</strong><p>Voicemail · 0:18</p>Hi, it’s Alfred’s team about the Malden condo. Call us back when you have a moment.</div><p style="font-size:9px;color:#718095">Follow-up text scheduled in 10 min.</p>':''}</div></div>`;
 }else if(!answered()&&has(18))html=empty('No conversation to summarize.','Voicemail dropped. The CRM and phone tabs show the follow-up plan. No transcript or email draft is created.');
 else if(selectedTab==='transcript')html=has(30)?`<div class="output-kicker">SAMPLE CALL / CONSENT RECEIVED</div><div class="transcript">${transcript.map(([who,line])=>`<p><span class="speaker ${who==='MAYA'?'buyer':''}">${who}:</span>${escapeHTML(line)}</p>`).join('')}</div>`:empty('The conversation comes next.','The sample transcript appears after the connected call.');
 else if(selectedTab==='summary')html=has(36)?`<div class="output-kicker">AI SUMMARY / SAMPLE CONVERSATION</div><h3>Ready for a Saturday showing.</h3><ul class="summary-list"><li><strong>Budget</strong>Up to $470,000; the $449,000 listing fits.</li><li><strong>Timeline</strong>Close before her lease ends in February.</li><li><strong>Pre-approval</strong>Approved with Salem Five, up to $470,000.</li><li><strong>Must-haves</strong>2 bedrooms, in-unit laundry, parking, close to the Orange Line for Back Bay commute.</li><li><strong>Objections</strong>No first-floor units.</li><li><strong>Next step</strong>Saturday 11am showing. Send address and two similar Medford listings.</li></ul>`:empty('The important details, extracted.','Budget, timing and next steps appear after the transcript is ready.');
 else if(selectedTab==='email')html=has(45)?`<div class="output-kicker">EMAIL DRAFT / NOT SENT</div><div class="email-subject"><strong>To:</strong> ${escapeHTML(buyer.email)}<br><strong>Subject:</strong> Your Malden condo showing — Saturday at 11am</div><div class="email-body">Hi ${first},

Great speaking with you! Let's meet Saturday at 11am to see the Malden condo. I'll text you the address before we meet.

With two bedrooms, in-unit laundry, a deeded parking spot and a second-floor location, it checks the boxes you mentioned. The 9-minute walk to Malden Center should make your Back Bay commute easier, too.

At $449,000, it's within your $470,000 Salem Five pre-approval. We'll keep your February lease end in mind as we plan next steps.

Two similar options to compare:
• Medford condo A — [sample listing link]
• Medford condo B — [sample listing link]

Does Saturday at 11am still work for you?

Alfred
Alfred's team</div><div class="email-note">Draft for agent review. Sample details from the supplied Maya conversation. No email is sent.</div>`:empty('A follow-up that remembers.','A personal email draft appears after the CRM is updated.');
 $('output').innerHTML=html;
}
let lastActive='',lastAutoTab='';
function followRun(){
 if(!running)return;
 const n=document.querySelector('#flow .node.active');
 const key=n?n.textContent.slice(0,30):'';
 if(n&&key!==lastActive){lastActive=key;n.scrollIntoView({block:'nearest',behavior:'smooth'});}
 const want=!answered()?(has(18)?'phone':has(3)?'crm':''):has(45)?'email':has(36)?'summary':has(30)?'transcript':has(3)?'crm':'';
 if(want&&want!==lastAutoTab){lastAutoTab=want;const t=document.getElementById('tab-'+want);if(t)t.click();}
}
function render(){
 $('clock').textContent=time(elapsed);renderFlow();renderOutput();followRun();
 $('run').textContent=running?'Ⅱ Pause':elapsed>=47?'↺ Run again':started?'▶ Resume':'▶ Run demo';
 $('statusText').textContent=elapsed>=47?'Workflow complete':running?'Automation running':started?'Demo paused':'Ready for a new lead';
 $('statusText').parentElement.classList.toggle('running',running);
 $('finalCard').className=`final-card ${elapsed>=47?'complete':''} ${!answered()&&elapsed>=47?'missed':''}`;
 $('finalLabel').textContent=answered()?'Lead to live conversation':'Lead to follow-up plan';
 $('finalTime').textContent='0:47';
 $('finalNote').textContent=answered()?'One lead. Every detail handled.':'No answer. No lead left behind.';
}
function readBuyer(){buyer={name:$('fullName').value.trim(),phone:$('phone').value.trim(),email:$('email').value.trim(),timeline:$('timeline').value,approved:$('approved').value};}
function start(){
 if(!$('leadForm').reportValidity()){$('formNote').textContent='Complete the form and tick the required consent box to run.';return;}
 if(!started||elapsed>=47){readBuyer();elapsed=0;started=true;}
 running=true;lastTick=performance.now();$('formNote').textContent='Simulated lead received. No messages or calls are sent.';render();
}
function toggle(){if(running){running=false;render();}else start();}
function reset(){lastActive='';lastAutoTab='';running=false;started=false;elapsed=0;$('formNote').textContent='Fictional buyer. Nothing is sent.';render();}
 $('leadForm').addEventListener('submit',e=>{e.preventDefault();reset();start();});
 $('run').onclick=toggle;$('reset').onclick=reset;
 $('speed').onclick=()=>{speed=speed===1?3:1;$('speed').setAttribute('aria-pressed',String(speed===3));$('speed').textContent=speed===3?'Speed ×3 · on':'Speed ×3';};
 $('sample').onclick=()=>{reset();$('fullName').value='Maya Thompson';$('phone').value='(617) 555-0142';$('email').value='maya@example.com';$('timeline').value='soon';$('approved').value='Yes';$('consent').checked=false;$('formNote').textContent='Sample filled. Tick consent to start the demo.';};
 $('outcome').onchange=render;
 document.querySelectorAll('[data-tab]').forEach(b=>{b.onclick=()=>{selectedTab=b.dataset.tab;document.querySelectorAll('[data-tab]').forEach(t=>t.setAttribute('aria-selected',String(t===b)));$('output').setAttribute('aria-labelledby',b.id);renderOutput();};b.onkeydown=e=>{if(!['ArrowLeft','ArrowRight'].includes(e.key))return;e.preventDefault();const tabs=[...document.querySelectorAll('[data-tab]')],i=tabs.indexOf(b),next=tabs[(i+(e.key==='ArrowRight'?1:-1)+tabs.length)%tabs.length];next.focus();next.click();};});
 document.addEventListener('keydown',e=>{if(e.code==='Space'&&!/INPUT|SELECT|TEXTAREA|BUTTON/.test(e.target.tagName)&&!e.target.isContentEditable){e.preventDefault();toggle();}});
 setInterval(()=>{if(!running)return;const now=performance.now();const prev=Math.floor(elapsed);elapsed=Math.min(47,elapsed+(now-lastTick)/1000*speed);lastTick=now;if(elapsed>=47)running=false;if(Math.floor(elapsed)!==prev||!running)render();},100);
 render();

// 6 questions → open Messages / email with answers filled in (10-27)
(function () {
  const form = document.getElementById('qForm');
  if (!form) return;
  const qs = [...form.querySelectorAll('legend')].map(l => l.textContent);
  function answers() {
    const f = new FormData(form);
    const lines = ['Hi Dawit, my answers on the Speed-to-Lead questions:'];
    ['q1', 'q2', 'q3', 'q4', 'q5', 'q6'].forEach((k, i) => {
      const v = (f.get(k) || '').toString().trim();
      lines.push('', qs[i], '→ ' + (v || '(skipped)'));
    });
    lines.push('', '— Alfred');
    return lines.join('\n');
  }
  document.getElementById('qText').addEventListener('click', () => {
    location.href = 'sms:+17816005025?&body=' + encodeURIComponent(answers());
  });
  document.getElementById('qEmail').addEventListener('click', () => {
    location.href = 'mailto:dawitsellassie1819@gmail.com?subject=' + encodeURIComponent('Speed-to-Lead answers') + '&body=' + encodeURIComponent(answers());
  });
})();
