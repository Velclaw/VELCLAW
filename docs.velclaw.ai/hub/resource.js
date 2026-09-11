(() => {
  const fallback = { schemaVersion: '1.0.0', resources: [] };
  const esc = (value) => String(value ?? '').replace(/[&<>'"]/g, (c) => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));
  const params = new URLSearchParams(location.search);
  const id = params.get('id');
  const set = (selector, value, html = false) => {
    const el = document.querySelector(selector);
    if (el) html ? (el.innerHTML = value) : (el.textContent = value);
  };
  const render = (data) => {
    const resource = data.resources.find((item) => item.id === id) || data.resources[0];
    if (!resource) return;
    const statusLabels = { draft: 'Bản nháp', review: 'Đang xét duyệt', verified: 'Đã kiểm duyệt', published: 'Đã xuất bản' };
    const status = statusLabels[resource.status] || resource.status;
    set('#type', `TÀI NGUYÊN · ${String(resource.type).toUpperCase()}`);
    set('#title', resource.name);
    set('#description', resource.description);
    set('#meta', `<span class="resource-tag ${esc(resource.status)}">${resource.status === 'verified' || resource.status === 'published' ? '✓ ' : ''}${esc(status)}</span><span class="resource-tag">v${esc(resource.version)}</span><span class="resource-tag">${esc(resource.author)}</span><span class="resource-tag">${esc(resource.license)}</span>` , true);
    set('#resource-id', resource.id);
    set('#resource-tags', resource.tags?.length ? resource.tags.map((tag) => `<span class="resource-tag">${esc(tag)}</span>`).join('') : '');
    set('#status-value', status);
    set('#author-value', resource.author);
    set('#version-value', resource.version);
    document.title = `${resource.name} — VelclawHub`;
  };
  fetch('data/resources.json', { cache: 'no-store' }).then((r) => r.ok ? r.json() : fallback).then(render).catch(() => render(fallback));
})();
