const modal = document.querySelector('#quick-modal');
const input = document.querySelector('#command-input');
const toast = document.querySelector('.toast');
const taskList = document.querySelector('.task-list');
const menuButton = document.querySelector('.mobile-menu');
const sidebar = document.querySelector('.sidebar');
const STORAGE_KEY = 'lume-items-v1';

const manifestLink = document.createElement('link');
manifestLink.rel = 'manifest';
manifestLink.href = 'manifest.webmanifest';
document.head.appendChild(manifestLink);
if ('serviceWorker' in navigator) window.addEventListener('load', () => navigator.serviceWorker.register('sw.js'));

function openAssistant() { modal.hidden = false; window.setTimeout(() => input.focus(), 50); }
function closeAssistant() { modal.hidden = true; }
function showToast(message) { toast.textContent = message; toast.classList.add('show'); window.setTimeout(() => toast.classList.remove('show'), 2600); }
function getItems() { try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || []; } catch { return []; } }
function saveItems(items) { localStorage.setItem(STORAGE_KEY, JSON.stringify(items)); }
function updateProgress() {
  const tasks = [...document.querySelectorAll('.task input')];
  const completed = tasks.filter((task) => task.checked).length;
  const percentage = tasks.length ? Math.round((completed / tasks.length) * 100) : 0;
  document.querySelector('.progress-copy span').textContent = completed + ' de ' + tasks.length + ' concluídas';
  document.querySelector('.progress-copy strong').textContent = percentage + '%';
  document.querySelector('.progress i').style.width = percentage + '%';
}
function bindTask(checkbox) {
  checkbox.addEventListener('change', () => {
    checkbox.closest('.task').classList.toggle('done', checkbox.checked);
    const id = checkbox.closest('.task').dataset.itemId;
    if (id) { const items = getItems(); const item = items.find((entry) => entry.id === id); if (item) { item.done = checkbox.checked; saveItems(items); } }
    updateProgress();
  });
}
function renderItem(item) {
  const label = document.createElement('label');
  label.className = 'task' + (item.done ? ' done' : '');
  label.dataset.itemId = item.id;
  label.innerHTML = '<input type="checkbox" ' + (item.done ? 'checked' : '') + '><span class="checkmark"></span><span><strong></strong><small>Adicionada pela Lume</small></span><b class="priority medium">Média</b>';
  label.querySelector('strong').textContent = item.text;
  taskList.appendChild(label);
  bindTask(label.querySelector('input'));
}
getItems().forEach(renderItem);
document.querySelectorAll('.task input').forEach(bindTask);
updateProgress();
document.querySelectorAll('[data-action="assistant"], [data-action="quick-add"]').forEach((button) => button.addEventListener('click', openAssistant));
document.querySelector('.modal-close').addEventListener('click', closeAssistant);
modal.addEventListener('click', (event) => { if (event.target === modal) closeAssistant(); });
document.addEventListener('keydown', (event) => {
  if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') { event.preventDefault(); openAssistant(); }
  if (event.key === 'Escape' && !modal.hidden) closeAssistant();
});
document.querySelector('.primary-action').addEventListener('click', () => {
  const text = input.value.trim();
  if (!text) { input.focus(); return; }
  const items = getItems();
  const item = { id: String(Date.now()), text, done: false };
  items.push(item); saveItems(items); renderItem(item); updateProgress();
  closeAssistant(); showToast('Pronto! Salvei no seu dia.'); input.value = '';
});
menuButton?.addEventListener('click', () => {
  const open = document.body.classList.toggle('menu-open');
  sidebar?.classList.toggle('mobile-open', open);
  menuButton.setAttribute('aria-expanded', String(open));
  menuButton.setAttribute('aria-label', open ? 'Fechar menu' : 'Abrir menu');
});
sidebar?.querySelectorAll('a').forEach((link) => link.addEventListener('click', () => { document.body.classList.remove('menu-open'); sidebar.classList.remove('mobile-open'); }));
document.querySelector('[data-action="details"]').addEventListener('click', () => showToast('Reunião às 09:30 · Sala Jatobá'));
