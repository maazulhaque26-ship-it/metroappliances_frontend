import React, { useEffect, useState } from 'react';
import { FiTag } from 'react-icons/fi';
import AdminLayout from './AdminLayout';
import LoadingState from '../../components/shared/LoadingState';
import ErrorState from '../../components/shared/ErrorState';
import { fetchTalentPool, addToTalentPool } from '../../services/recruitmentAPI';

const SOURCE_COLORS = {
  referral:   'bg-purple-100 text-purple-700',
  job_portal: 'bg-blue-100 text-blue-700',
  walk_in:    'bg-gray-100 text-gray-600',
  agency:     'bg-orange-100 text-orange-700',
  campus:     'bg-green-100 text-green-700',
};

export default function AdminTalentPool() {
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState(null);
  const [tagSearch, setTagSearch]   = useState('');
  const [selectedTag, setSelectedTag] = useState('');
  const [actionId, setActionId]     = useState(null);

  const load = (params = {}) => {
    setLoading(true);
    fetchTalentPool(params)
      .then(r => setCandidates(r.data.data || []))
      .catch(e => setError(e.response?.data?.message || 'Load failed'))
      .finally(() => setLoading(false));
  };

  useEffect(() => load(), []);

  const allTags = (() => {
    const counts = {};
    candidates.forEach(c => {
      (c.talentPool?.tags || []).forEach(t => { counts[t] = (counts[t] || 0) + 1; });
    });
    return Object.entries(counts).sort((a, b) => b[1] - a[1]);
  })();

  const filtered = candidates.filter(c => {
    if (!selectedTag) return true;
    return (c.talentPool?.tags || []).includes(selectedTag);
  });

  const handleAddTag = async (id) => {
    const tag = window.prompt('Add tag to talent pool:');
    if (!tag?.trim()) return;
    setActionId(id);
    try { await addToTalentPool(id, { tag: tag.trim() }); load(); }
    catch (e) { alert(e.response?.data?.message || 'Action failed'); }
    finally { setActionId(null); }
  };

  if (loading) return <AdminLayout><LoadingState /></AdminLayout>;
  if (error)   return <AdminLayout><ErrorState message={error} /></AdminLayout>;

  return (
    <AdminLayout>
      <div className="space-y-5">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Talent Pool</h1>
          <p className="text-sm text-gray-500 mt-1">Passive candidates and talent pipeline</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <h3 className="font-semibold text-gray-900 mb-3">Pool Tags</h3>
              <input value={tagSearch} onChange={e => setTagSearch(e.target.value)}
                placeholder="Filter tags…"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm mb-3" />
              <div className="space-y-1">
                <button onClick={() => setSelectedTag('')}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm flex items-center justify-between transition-colors ${!selectedTag ? 'bg-indigo-50 text-indigo-700 font-medium' : 'text-gray-700 hover:bg-gray-50'}`}>
                  <span>All Candidates</span>
                  <span className="text-xs text-gray-400">{candidates.length}</span>
                </button>
                {allTags.filter(([t]) => !tagSearch || t.toLowerCase().includes(tagSearch.toLowerCase())).map(([tag, count]) => (
                  <button key={tag} onClick={() => setSelectedTag(tag)}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm flex items-center justify-between transition-colors ${selectedTag === tag ? 'bg-indigo-50 text-indigo-700 font-medium' : 'text-gray-700 hover:bg-gray-50'}`}>
                    <span className="capitalize">{tag}</span>
                    <span className="text-xs text-gray-400">{count}</span>
                  </button>
                ))}
                {allTags.length === 0 && <p className="text-xs text-gray-400 px-3">No tags yet</p>}
              </div>
            </div>
          </div>

          <div className="lg:col-span-3">
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {filtered.map(c => (
                <div key={c._id} className="bg-white rounded-xl border border-gray-200 p-4 space-y-3 hover:shadow-sm transition-shadow">
                  <div>
                    <p className="font-semibold text-gray-900">{c.firstName} {c.lastName}</p>
                    <p className="text-sm text-gray-500">{c.currentDesignation || 'Candidate'}</p>
                    {c.currentCompany && <p className="text-xs text-gray-400">{c.currentCompany}</p>}
                  </div>

                  {c.skills?.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {c.skills.slice(0, 3).map((s, i) => (
                        <span key={i} className="px-1.5 py-0.5 bg-indigo-50 text-indigo-700 rounded text-xs">{s}</span>
                      ))}
                      {c.skills.length > 3 && <span className="text-xs text-gray-400">+{c.skills.length - 3}</span>}
                    </div>
                  )}

                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>{c.totalExperience != null ? `${c.totalExperience} yrs exp` : '—'}</span>
                    <span className={`px-1.5 py-0.5 rounded capitalize ${SOURCE_COLORS[c.source] || 'bg-gray-100 text-gray-600'}`}>
                      {c.source?.replace('_', ' ')}
                    </span>
                  </div>

                  {c.talentPool?.tags?.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {c.talentPool.tags.map((t, i) => (
                        <span key={i} className="px-1.5 py-0.5 bg-yellow-50 text-yellow-700 rounded text-xs">{t}</span>
                      ))}
                    </div>
                  )}

                  <button disabled={actionId === c._id} onClick={() => handleAddTag(c._id)}
                    className="flex items-center gap-1 text-xs text-indigo-600 hover:text-indigo-800">
                    <FiTag size={12} /> Add Tag
                  </button>
                </div>
              ))}
              {!filtered.length && (
                <div className="col-span-3 bg-white rounded-xl border border-gray-200 py-16 text-center text-gray-400">
                  No candidates in talent pool
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
