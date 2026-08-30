const modal = document.querySelector('#quick-modal');
const input = document.querySelector('#command-input');
const toast = document.querySelector('.toast');

function openAssistant() {
  modal.hidden = false;
  window.setTimeout(() => input.focus(), 50);
}

function closeAssistant() {
  modal.hidden = true;
}

function showToast(message) {
  toast.textContent = message;
  toast.classList.add('show');
  window.setTimeout(() => toast.classList.remove('show'), 2600);
}

document.querySelectorAll('[data-action="assistant"], [data-action="quick-add"]').forEach((button) => {
  button.addEventListener('click', openAssistant);
});

document.querySelector('.modal-close').addEventListener('click', closeAssistant);
modal.addEventListener('click', (event) => {
  if (event.target === modal) closeAssistant();
});

document.addEventListener('keydown', (event) => {
  if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
    event.preventDefault();
    openAssistant();
  }
  if (event.key === 'Escape' && !modal.hidden) closeAssistant();
});

document.querySelector('.primary-action').addEventListener('click', () => {
  if (!input.value.trim()) {
    input.focus();
    return;
  }
  closeAssistant();
  showToast('Pronto! Adicionei ao seu dia.');
  input.value = '';
});

document.querySelectorAll('.task input').forEach((checkbox) => {
  checkbox.addEventListener('change', () => {
    checkbox.closest('.task').classList.toggle('done', checkbox.checked);
    const tasks = [...document.querySelectorAll('.task input')];
    const completed = tasks.filter((task) => task.checked).length;
    const percentage = Math.round((completed / tasks.length) * 100);
    document.querySelector('.progress-copy span').textContent = `${completed} de ${tasks.length} concluídas`;
    document.querySelector('.progress-copy strong').textContent = `${percentage}%`;
    document.querySelector('.progress i').style.width = `${percentage}%`;
  });
});

document.querySelector('[data-action="details"]').addEventListener('click', () => {
  showToast('Reunião às 09:30 · Sala Jatobá');
});
