const $ = s => document.querySelector(s);

async function api(url, options) {
  const r = await fetch(url, options);

  if (!r.ok) {
    throw new Error(`HTTP ${r.status}`);
  }

  return r.json();
}

async function stats() {
  try {
    const s = await api('/api/stats');

    $('#projectsCount').textContent = s.projects ?? 0;
    $('#filesCount').textContent = s.files ?? 0;
    $('#jobsCount').textContent = s.jobs ?? 0;
    $('#ticketsCount').textContent = s.tickets ?? 0;
  } catch (error) {
    console.error('Stats error:', error);
  }
}

/* =========================================================
   PROJECT CREATION
   ========================================================= */

const projectModal = $('#projectModal');
const projectForm = $('#projectForm');
const projectName = $('#projectName');
const projectSlug = $('#projectSlug');
const projectDescription = $('#projectDescription');
const projectRuntime = $('#projectRuntime');
const projectVisibility = $('#projectVisibility');
const projectStatus = $('#projectFormStatus');
const projectCreateButton = $('#projectCreate');

function slugify(value) {
  return String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);
}

function setProjectStatus(message = '', type = '') {
  projectStatus.textContent = message;
  projectStatus.className = 'project-form-status';

  if (type) {
    projectStatus.classList.add(type);
  }
}

function openProjectModal() {
  projectModal.classList.add('open');
  projectModal.setAttribute('aria-hidden', 'false');

  setProjectStatus('');

  requestAnimationFrame(() => {
    projectName.focus();
  });
}

function closeProjectModal() {
  if (projectCreateButton.disabled) return;

  projectModal.classList.remove('open');
  projectModal.setAttribute('aria-hidden', 'true');
}

function resetProjectForm() {
  projectForm.reset();

  projectSlug.value = '';
  projectRuntime.value = 'node';
  projectVisibility.value = 'private';

  document.getElementById('typeApp').checked = true;

  setProjectStatus('');
}

projectName.addEventListener('input', () => {
  projectSlug.value = slugify(projectName.value);
});

projectSlug.addEventListener('input', () => {
  projectSlug.value = slugify(projectSlug.value);
});

async function createProject(event) {
  event.preventDefault();

  const name = projectName.value.trim();

  if (!name) {
    setProjectStatus('Project name is required.', 'error');
    projectName.focus();
    return;
  }

  const slug = slugify(projectSlug.value || name);

  if (!slug) {
    setProjectStatus('Invalid project slug.', 'error');
    projectSlug.focus();
    return;
  }

  const type =
    document.querySelector('input[name="projectType"]:checked')?.value ||
    'app';

  projectCreateButton.disabled = true;
  setProjectStatus('Creating project...');

  try {
    const project = await api('/api/projects', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        name,
        slug,
        description: projectDescription.value.trim(),
        type,
        runtime: projectRuntime.value,
        visibility: projectVisibility.value
      })
    });

    setProjectStatus('Project created.', 'success');

    await stats();

    /*
     * Give the API a moment to finish persistence before
     * closing the creation surface.
     */
    await new Promise(resolve => setTimeout(resolve, 350));

    projectModal.classList.remove('open');
    projectModal.setAttribute('aria-hidden', 'true');

    resetProjectForm();

    /*
     * If the backend returns an explicit project URL,
     * use it. Otherwise remain in the workspace.
     */
    if (project && project.url) {
      location.href = project.url;
    }

  } catch (error) {
    console.error('Project creation error:', error);

    setProjectStatus(
      'Unable to create project. Check the server.',
      'error'
    );
  } finally {
    projectCreateButton.disabled = false;
  }
}

$('#newProject').onclick = openProjectModal;
$('#newProject2').onclick = openProjectModal;

$('#projectClose').onclick = closeProjectModal;
$('#projectCancel').onclick = closeProjectModal;

projectForm.addEventListener('submit', createProject);

projectModal.addEventListener('click', event => {
  if (event.target === projectModal) {
    closeProjectModal();
  }
});

document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && projectModal.classList.contains('open')) {
    closeProjectModal();
  }
});

/* =========================================================
   SIDEBAR
   ========================================================= */

$('#menu').onclick = () => {
  $('#sidebar').classList.toggle('open');
};

document.querySelectorAll('.nav').forEach(button => {
  button.onclick = () => {
    document.querySelectorAll('.nav')
      .forEach(x => x.classList.remove('active'));

    button.classList.add('active');

    $('#sidebar').classList.remove('open');
  };
});

/* =========================================================
   WEBSOCKET
   ========================================================= */

const socket = new WebSocket(
  `${location.protocol === 'https:' ? 'wss' : 'ws'}://${location.host}`
);

socket.onopen = () => {
  $('#connection').textContent = 'Connected';
};

socket.onclose = () => {
  $('#connection').textContent = 'Offline';
};

socket.onerror = () => {
  $('#connection').textContent = 'Offline';
};

stats();
