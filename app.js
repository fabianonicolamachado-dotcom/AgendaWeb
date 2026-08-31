const modal=document.querySelector('#quick-modal');
const input=document.querySelector('#command-input');
const toast=document.querySelector('.toast');
const taskList=document.querySelector('.task-list');
const waitingList=document.querySelector('#waiting-list');
const waitingCount=document.querySelector('#waiting-count');
const STORAGE_KEY='assistant-items-v2';
const CARE_KEY='assistant-care-v1';
let selectedKind=null;

const manifestLink=document.createElement('link');manifestLink.rel='manifest';manifestLink.href='manifest.webmanifest';document.head.appendChild(manifestLink);
if('serviceWorker'in navigator)window.addEventListener('load',()=>navigator.serviceWorker.register('sw.js'));

function openAssistant(){modal.hidden=false;setTimeout(()=>input.focus(),50)}
function closeAssistant(){modal.hidden=true;selectedKind=null;document.querySelectorAll('[data-kind]').forEach(b=>b.classList.remove('selected'))}
function showToast(message){toast.textContent=message;toast.classList.add('show');setTimeout(()=>toast.classList.remove('show'),3200)}
function getItems(){try{return JSON.parse(localStorage.getItem(STORAGE_KEY))||[]}catch{return[]}}
function saveItems(items){localStorage.setItem(STORAGE_KEY,JSON.stringify(items))}
function getCare(){try{return JSON.parse(localStorage.getItem(CARE_KEY))||{enabled:true,lastSuggestion:0,dismissed:[]}}catch{return{enabled:true,lastSuggestion:0,dismissed:[]}}}
function saveCare(care){localStorage.setItem(CARE_KEY,JSON.stringify(care))}
function inferKind(text){const t=text.toLowerCase();if(/ficou de|aguard|retorno|responder|estorno|orçamento|prometeu|enviar/.test(t))return'waiting';if(/às\s*\d|amanhã|hoje|reunião|consulta|evento|dentista/.test(t))return'event';return'task'}
function renderWaiting(item){const article=document.createElement('article');article.className='waiting-item';article.dataset.itemId=item.id;article.innerHTML='<div><strong></strong><small>Registrado pelo assistente · prazo a definir</small></div><span class="waiting-status">novo</span>';article.querySelector('strong').textContent=item.text;waitingList.prepend(article)}
function renderTask(item){const label=document.createElement('label');label.className='task'+(item.done?' done':'');label.dataset.itemId=item.id;label.innerHTML='<input type="checkbox" '+(item.done?'checked':'')+'><span class="checkmark"></span><span><strong></strong><small>Adicionada pelo assistente</small></span><b class="priority medium">Média</b>';label.querySelector('strong').textContent=item.text;taskList.prepend(label);bindTask(label.querySelector('input'))}
function bindTask(checkbox){checkbox.addEventListener('change',()=>{checkbox.closest('.task').classList.toggle('done',checkbox.checked);const id=checkbox.closest('.task').dataset.itemId;if(id){const items=getItems();const item=items.find(e=>e.id===id);if(item){item.done=checkbox.checked;saveItems(items)}}if(checkbox.checked)showToast('Boa. Mais uma coisa resolvida — o restante pode esperar.')})}
function updateWaitingCount(){const custom=getItems().filter(i=>i.kind==='waiting').length;waitingCount.textContent=String(2+custom)}

// Proatividade cuidadosa: baixa frequência, opt-in e sem linguagem de cobrança.
function maybeOfferCareSuggestion(){const care=getCare();if(!care.enabled)return;const now=Date.now();const minGap=90*60*1000;if(now-care.lastSuggestion<minGap)return;const options=[
  {id:'move',text:'Você está há bastante tempo na mesma atividade. Se fizer sentido, talvez seja uma boa hora para levantar e circular um pouco.'},
  {id:'water',text:'Um lembrete leve: se ainda não tomou água há algum tempo, pode ser uma boa hora para se hidratar.'},
  {id:'reset',text:'Seu dia está andando. Quer reservar alguns minutos sem tarefa nenhuma antes da próxima atividade?'}
].filter(x=>!care.dismissed.includes(x.id));if(!options.length)return;const suggestion=options[Math.floor(Math.random()*options.length)];care.lastSuggestion=now;saveCare(care);showToast(suggestion.text)}

getItems().forEach(item=>item.kind==='waiting'?renderWaiting(item):item.kind==='task'?renderTask(item):null);document.querySelectorAll('.task input').forEach(bindTask);updateWaitingCount();

document.querySelectorAll('[data-action="assistant"],[data-action="quick-add"],[data-action="add-waiting"]').forEach(b=>b.addEventListener('click',()=>{if(b.dataset.action==='add-waiting')selectedKind='waiting';openAssistant()}));
document.querySelectorAll('[data-kind]').forEach(b=>b.addEventListener('click',()=>{selectedKind=b.dataset.kind;document.querySelectorAll('[data-kind]').forEach(x=>x.classList.toggle('selected',x===b))}));
document.querySelector('.modal-close').addEventListener('click',closeAssistant);modal.addEventListener('click',e=>{if(e.target===modal)closeAssistant()});
document.addEventListener('keydown',e=>{if((e.metaKey||e.ctrlKey)&&e.key.toLowerCase()==='k'){e.preventDefault();openAssistant()}if(e.key==='Escape'&&!modal.hidden)closeAssistant()});
document.querySelector('.primary-action').addEventListener('click',()=>{const text=input.value.trim();if(!text)return input.focus();const kind=selectedKind||inferKind(text);const items=getItems();const item={id:String(Date.now()),text,kind,done:false};items.push(item);saveItems(items);if(kind==='waiting'){renderWaiting(item);updateWaitingCount();showToast('Registrei em Aguardando. Você não precisa manter isso na cabeça.')}else if(kind==='event'){showToast('Entendi como compromisso. Vamos confirmar data e alerta antes de salvar.')}else{renderTask(item);showToast('Anotado. Agora você não precisa depender da memória para isso.')}input.value='';closeAssistant()});

document.querySelectorAll('[data-action="ack"]').forEach(b=>b.addEventListener('click',()=>{b.closest('.attention-item').style.opacity='.5';showToast('Perfeito. Ciência confirmada — não vou insistir neste alerta.')}));
document.querySelectorAll('[data-action="followup"]').forEach(b=>b.addEventListener('click',()=>showToast('Posso preparar uma cobrança objetiva e gentil para sua aprovação.')));
document.querySelectorAll('[data-action="snooze"]').forEach(b=>b.addEventListener('click',()=>showToast('Tudo bem. Adiei sem perder a prioridade original.')));
document.querySelectorAll('[data-action="attention-settings"]').forEach(b=>b.addEventListener('click',()=>showToast('Aqui você poderá escolher quando quer ser lembrado, incentivado ou simplesmente deixado em paz.')));
const d=new Date();document.querySelector('#today-label').textContent=d.toLocaleDateString('pt-BR',{weekday:'long',day:'numeric',month:'long'});
window.setTimeout(maybeOfferCareSuggestion,12000);
