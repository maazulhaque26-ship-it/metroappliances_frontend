import React, { useEffect, useState } from 'react';
import { FiPlus, FiEye, FiStar, FiTrash2 } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import AdminLayout from './AdminLayout';
import LoadingState from '../../components/shared/LoadingState';
import ErrorState from '../../components/shared/ErrorState';
import { fetchCandidates, createCandidate, deleteCandidate, addToTalentPool } from '../../services/recruitmentAPI';

const SOURCE_COLORS = {
  referral:   'bg-purple-100 text-purple-700',
  job_portal: 'bg-blue-100 text-blue-700',
  walk_in:    'bg-gray-100 text-gray-600',
  agency:     'bg-orange-100 text-orange-700',
  campus:     'bg-green-100 text-green-700',
};

const SOURCES = ['referral', 'job_portal', 'walk_in', 'agency', 'campus', 'linkedin', 'direct'];
const STATUSES = ['', 'active', 'inactive', 'hired', 'blacklisted'];

const BLANK = {
  firstName: '', lastName: '', email: '', phone: '',
  currentCompany: '', currentDesignation: '', totalExperience: '',
  expectedCTC: '', source: 'job_portal', skills: '',
};

export default function AdminCandidates() {
  const [items, setItems]           = useState([]);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState(null);
  const [showModal, setShowModal]   = useState(false);
  const [form, setForm]             = useState(BLANK);
  const [saving, setSaving]         = useState(false);
  const [search, setSearch]         = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [actionId, setActionId]     = useState(null);
  const [page, setPage]             = useState(1);

  const load = () => {
    setLoading(true);
    const params = { page, limit: 20 };
    if (search) params.search = search;
    if (statusFilter) params.status = statusFilter;
    fetchCandidates(params)
      .then(r => setItems(r.data.data || []))
      .catch(e => setError(e.response?.data?.message || 'Load failed'))
      .finally(() => setLoading(false));
  };

  useEffect(load, [page, statusFilter]);

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    load();
  };

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleCreate = async () => {
    setSaving(true);
    try {
      const payload = { ...form, skills: form.skills.split(',').map(s => s.trim()).filter(Boolean) };
      await createCandidate(payload);
      setShowModal(false);
      setForm(BLANK);
      load();
    } catch (e) { alert(e.response?.data?.message || 'Create failed'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this candidate?')) return;
    setActionId(id);
    try { await deleteCandidate(id); load(); }
    catch (e) { alert(e.response?.data?.message || 'Delete failed'); }
    finally { setActionId(null); }
  };

  const handleTalentPool = async (id) => {
    const tag = window.prompt('Enter talent pool tag:');
    if (!tag) return;
    setActionId(id);
    try { await addToTalentPool(id, { tag }); alert('Added to talent pool.'); }
    catch (e) { alert(e.response?.data?.message || 'Action failed'); }
    finally { setActionId(null); }
  };

  if (loading) return <AdminLayout><LoadingState /></AdminLayout>;
  if (error)   return <AdminLayout><ErrorState message={error} /></AdminLayout>;

  return (
    <AdminLayout>
      <div className="space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Candidates</h1>
            <p className="text-sm text-gray-500 mt-1">Candidate database and talent pipeline</p>
          </div>
          <button onClick={() => setShowModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700">
            <FiPlus size={16} /> Add Candidate
          </button>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <form onSubmit={handleSearch} className="flex gap-2">
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search name or email…"
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm w-64" />
            <button type="submit" className="px-4 py-2 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700">Search</button>
          </form>
          <select value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1); }}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm">
            <option value="">All Statuses</option>
            {STATUSES.filter(Boolean).map(s => <option key={s} value={s} className="capitalize">{s}</option>)}
          </select>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200 text-sm">
            <thead className="bg-gray-50">
              <tr>
                {['Candidate #', 'Name', 'Email', 'Phone', 'Company', 'Exp (yrs)', 'Skills', 'Source', 'Status', 'Actions'].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {items.map(c => (
                <tr key={c._id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-mono text-xs text-gray-600">{c.candidateNumber}</td>
                  <td className="px-4 py-3 font-medium text-gray-900">{c.firstName} {c.lastName}</td>
                  <td className="px-4 py-3 text-gray-600">{c.email}</td>
                  <td className="px-4 py-3 text-gray-600">{c.phone}</td>
                  <td className="px-4 py-3 text-gray-600">{c.currentCompany || '—'}</td>
                  <td className="px-4 py-3 text-gray-600">{c.totalExperience ?? '—'}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1 flex-wrap">
                      {(c.skills || []).slice(0, 2).map((s, i) => (
                        <span key={i} className="px-1.5 py-0.5 bg-indigo-50 text-indigo-700 rounded text-xs">{s}</span>
                      ))}
                      {(c.skills?.length || 0) > 2 && <span className="text-xs text-gray-400">+{c.skills.length - 2}</span>}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded text-xs font-medium capitalize ${SOURCE_COLORS[c.source] || 'bg-gray-100 text-gray-600'}`}>
                      {c.source?.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="px-2 py-0.5 rounded text-xs font-medium capitalize bg-gray-100 text-gray-600">
                      {c.status || 'active'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <Link to={`/admin/hr/recruitment/candidates/${c._id}`}
                        className="p-1.5 text-indigo-600 hover:bg-indigo-50 rounded" title="View">
                        <FiEye size={14} />
                      </Link>
                      <button disabled={actionId === c._id} onClick={() => handleTalentPool(c._id)}
                        className="p-1.5 text-yellow-500 hover:bg-yellow-50 rounded" title="Add to Talent Pool">
                        <FiStar size={14} />
                      </button>
                      <button disabled={actionId === c._id} onClick={() => handleDelete(c._id)}
                        className="p-1.5 text-gray-400 hover:bg-gray-100 rounded" title="Delete">
                        <FiTrash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {!items.length && (
                <tr><td colSpan={10} className="px-4 py-8 text-center text-gray-400">No candidates found</td></tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="flex items-center gap-3">
          <button disabled={page === 1} onClick={() => setPage(p => p - 1)}
            className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg disabled:opacity-40 hover:bg-gray-50">Previous</button>
          <span className="text-sm text-gray-600">Page {page}</span>
          <button disabled={items.length < 20} onClick={() => setPage(p => p + 1)}
            className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg disabled:opacity-40 hover:bg-gray-50">Next</button>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-lg font-semibold mb-4">Add Candidate</h2>
            <div className="grid grid-cols-2 gap-4">
              {[['firstName','First Name'],['lastName','Last Name'],['email','Email'],['phone','Phone'],['currentCompany','Current Company'],['currentDesignation','Current Designation']].map(([k, l]) => (
                <div key={k}>
                  <label className="text-xs font-medium text-gray-600">{l}</label>
                  <input value={form[k]} onChange={e => set(k, e.target.value)}
                    className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
                </div>
              ))}
              <div>
                <label className="text-xs font-medium text-gray-600">Total Experience (yrs)</label>
                <input type="number" min={0} value={form.totalExperience} onChange={e => set('totalExperience', e.target.value)}
                  className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600">Expected CTC (₹)</label>
                <input type="number" value={form.expectedCTC} onChange={e => set('expectedCTC', e.target.value)}
                  className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600">Source</label>
                <select value={form.source} onChange={e => set('source', e.target.value)}
                  className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 text-sm">
                  {SOURCES.map(s => <option key={s} value={s} className="capitalize">{s.replace('_', ' ')}</option>)}
                </select>
              </div>
              <div className="col-span-2">
                <label className="text-xs font-medium text-gray-600">Skills (comma-separated)</label>
                <input value={form.skills} onChange={e => set('skills', e.target.value)}
                  placeholder="React, Node.js, MongoDB…"
                  className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-5">
              <button onClick={() => { setShowModal(false); setForm(BLANK); }}
                className="px-4 py-2 text-sm text-gray-600 border border-gray-300 rounded-lg">Cancel</button>
              <button onClick={handleCreate} disabled={saving || !form.firstName || !form.email}
                className="px-4 py-2 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50">
                {saving ? 'Saving…' : 'Create'}
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
