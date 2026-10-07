import { useEffect, useState } from 'react';
import ConfirmDialog from './ConfirmDialog';

const CategoryManager = ({ password, onChange }) => {
  const [categories, setCategories] = useState([]);
  const [name, setName] = useState('');
  const [editing, setEditing] = useState(null);
  const [target, setTarget] = useState(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const reload = async () => {
    const response = await fetch('/api/catalog-categories/admin', { headers: { 'x-admin-password': password } });
    if (!response.ok) throw new Error('Could not load categories.');
    const data = await response.json();
    setCategories(data);
    onChange(data.filter(item => item.active).map(item => item.name));
  };
  useEffect(() => {
    let active = true;
    fetch('/api/catalog-categories/admin', { headers: { 'x-admin-password': password } })
      .then(async response => {
        if (!response.ok) throw new Error('Could not load categories.');
        return response.json();
      })
      .then(data => {
        if (!active) return;
        setCategories(data);
        onChange(data.filter(item => item.active).map(item => item.name));
      })
      .catch(error => { if (active) setError(error.message); });
    return () => { active = false; };
  }, [password, onChange]);

  const mutate = async (url, method, body, success) => {
    setBusy(true); setError(''); setMessage('');
    try {
      const response = await fetch(url, { method, headers: { 'x-admin-password': password, 'Content-Type': 'application/json' }, body: body ? JSON.stringify(body) : undefined });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.message || 'Could not update category.');
      await reload();
      window.dispatchEvent(new Event('sreepayanam:catalog-updated'));
      setMessage(success);
      setName(''); setEditing(null); setTarget(null);
    } catch (error) { setError(error.message); }
    finally { setBusy(false); }
  };

  return <section className="admin-category-manager" aria-labelledby="admin-category-heading">
    <div><h3 id="admin-category-heading">Dropdown categories</h3><p>Add, rename or remove categories shown in the Packages menu and package filters. Move packages before removing a category in use.</p></div>
    {error && <p className="form-status is-error" role="alert">{error}</p>}
    {message && <p className="form-status" role="status">{message}</p>}
    <form noValidate onSubmit={event => { event.preventDefault(); if (name.trim()) mutate('/api/catalog-categories', 'POST', { name: name.trim() }, 'Category added.'); }} className="admin-category-add">
      <label htmlFor="new-category">New category</label><input id="new-category" className="input-field" value={name} maxLength="80" onChange={event => setName(event.target.value)} placeholder="e.g. Temple circuits" />
      <button type="submit" className="btn btn-primary" disabled={busy || !name.trim()}>Add category</button>
    </form>
    <ul className="admin-category-list">{categories.map(item => <li key={item._id}>
      {editing?._id === item._id ? <form noValidate onSubmit={event => { event.preventDefault(); mutate(`/api/catalog-categories/${item._id}`, 'PUT', { name: editing.name, order: Number(editing.order), active: item.active }, 'Category updated.'); }}>
        <input className="input-field" aria-label="Category name" value={editing.name} maxLength="80" onChange={event => setEditing(current => ({ ...current, name: event.target.value }))} />
        <input className="input-field" type="number" aria-label="Menu order" value={editing.order} onChange={event => setEditing(current => ({ ...current, order: event.target.value }))} />
        <button className="btn btn-primary" type="submit" disabled={busy || !editing.name.trim()}>Save</button><button className="btn btn-ghost" type="button" onClick={() => setEditing(null)}>Cancel</button>
      </form> : <><span>{item.name}{!item.active && <small>Removed</small>}</span><div><button type="button" className="btn btn-ghost" onClick={() => setEditing({ _id: item._id, name: item.name, order: item.order })}>Edit</button>{item.active ? <button type="button" className="btn btn-ghost" onClick={() => setTarget(item)}>Remove</button> : <button type="button" className="btn btn-ghost" onClick={() => mutate(`/api/catalog-categories/${item._id}`, 'PUT', { name: item.name, order: item.order, active: true }, 'Category restored.')}>Restore</button>}</div></>}
    </li>)}</ul>
    <ConfirmDialog open={Boolean(target)} title="Remove this category?" message={target ? `“${target.name}” will disappear from the package menus. Packages must be moved out of it first.` : ''} confirmLabel="Remove category" onCancel={() => setTarget(null)} onConfirm={() => mutate(`/api/catalog-categories/${target._id}`, 'DELETE', null, 'Category removed from menus.')} busy={busy} />
  </section>;
};

export default CategoryManager;
