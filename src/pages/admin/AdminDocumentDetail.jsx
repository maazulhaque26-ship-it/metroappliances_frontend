import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import AdminLayout from './AdminLayout';
import {
  fetchDocument, updateDocument, uploadDocumentFile,
  fetchVersions, fetchDocumentComments, addDocumentComment,
  fetchSignatures, requestSignature, signDocument,
  fetchDocApprovals, createDocApproval, approveDocument, rejectDocument,
} from '../../services/documentAPI';

const TABS = ['Details', 'Versions', 'Comments', 'Approvals', 'Signatures'];

const STATUS_COLORS = {
  draft: 'bg-gray-100 text-gray-600',
  under_review: 'bg-amber-100 text-amber-700',
  approved: 'bg-blue-100 text-blue-700',
  published: 'bg-green-100 text-green-700',
  archived: 'bg-purple-100 text-purple-600',
};

export default function AdminDocumentDetail() {
  const { id } = useParams();
  const [doc, setDoc] = useState(null);
  const [tab, setTab] = useState('Details');
  const [versions, setVersions] = useState([]);
  const [comments, setComments] = useState([]);
  const [approvals, setApprovals] = useState([]);
  const [signatures, setSignatures] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [uploading, setUploading] = useState(false);

  const load = () => {
    fetchDocument(id).then(r => setDoc(r.data.data)).catch(console.error);
  };

  useEffect(() => {
    load();
    fetchVersions(id).then(r => setVersions(r.data.data || [])).catch(console.error);
    fetchDocumentComments(id).then(r => setComments(r.data.data || [])).catch(console.error);
    fetchDocApprovals({ document: id }).then(r => setApprovals(r.data.data || [])).catch(console.error);
    fetchSignatures(id).then(r => setSignatures(r.data.data || [])).catch(console.error);
  }, [id]);

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    const fd = new FormData();
    fd.append('file', file);
    await uploadDocumentFile(id, fd).catch(console.error);
    setUploading(false);
    load();
  };

  const handleComment = async () => {
    if (!newComment.trim()) return;
    await addDocumentComment(id, { comment: newComment });
    setNewComment('');
    fetchDocumentComments(id).then(r => setComments(r.data.data || []));
  };

  if (!doc) return <AdminLayout><div className="p-8 text-center text-gray-400">Loading…</div></AdminLayout>;

  return (
    <AdminLayout>
      <div className="p-6 space-y-4">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900">{doc.title}</h1>
            <p className="text-xs text-gray-400 font-mono mt-1">{doc.documentCode} · v{doc.versionLabel || doc.currentVersion}</p>
          </div>
          <div className="flex items-center gap-2">
            <span className={`text-xs px-3 py-1 rounded-full font-medium ${STATUS_COLORS[doc.status] || 'bg-gray-100 text-gray-600'}`}>{doc.status}</span>
            {doc.fileUrl && (
              <a href={doc.fileUrl} target="_blank" rel="noopener noreferrer" className="px-3 py-1.5 bg-indigo-600 text-white text-xs rounded-lg hover:bg-indigo-700">Download</a>
            )}
          </div>
        </div>

        <div className="flex gap-1 border-b border-gray-200">
          {TABS.map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${tab === t ? 'border-indigo-600 text-indigo-700' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
              {t}
            </button>
          ))}
        </div>

        {/* Details */}
        {tab === 'Details' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 space-y-3">
              <h3 className="text-sm font-semibold text-gray-700">Document Info</h3>
              {[
                { label: 'Type', value: doc.documentType },
                { label: 'Module', value: doc.module },
                { label: 'Owner', value: doc.owner?.name },
                { label: 'Folder', value: doc.folder?.name || '—' },
                { label: 'Category', value: doc.category?.name || '—' },
                { label: 'Version', value: doc.versionLabel || doc.currentVersion },
                { label: 'Checked Out', value: doc.isCheckedOut ? `By ${doc.checkedOutBy?.name || 'Unknown'}` : 'No' },
                { label: 'View Count', value: doc.viewCount },
                { label: 'Downloads', value: doc.downloadCount },
              ].map(r => (
                <div key={r.label} className="flex justify-between text-sm">
                  <span className="text-gray-500">{r.label}</span>
                  <span className="font-medium text-gray-800 capitalize">{r.value ?? '—'}</span>
                </div>
              ))}
              {doc.expiryDate && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Expires</span>
                  <span className={`font-medium ${new Date(doc.expiryDate) < new Date() ? 'text-red-600' : 'text-gray-800'}`}>
                    {new Date(doc.expiryDate).toLocaleDateString()}
                  </span>
                </div>
              )}
            </div>
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 space-y-3">
              <h3 className="text-sm font-semibold text-gray-700">Upload New Version</h3>
              <label className="block">
                <span className="text-xs text-gray-500 block mb-1">Select file (PDF, image, video)</span>
                <input type="file" onChange={handleFileUpload} disabled={uploading} className="text-sm w-full" />
              </label>
              {uploading && <p className="text-xs text-indigo-600">Uploading…</p>}
              {doc.description && <div><p className="text-xs text-gray-500 mb-1">Description</p><p className="text-sm text-gray-700">{doc.description}</p></div>}
              {doc.tags?.length > 0 && (
                <div><p className="text-xs text-gray-500 mb-1">Tags</p>
                  <div className="flex flex-wrap gap-1">{doc.tags.map(t => <span key={t} className="text-xs bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded">{t}</span>)}</div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Versions */}
        {tab === 'Versions' && (
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b"><tr>
                {['Code', 'Version', 'File', 'Change Type', 'Change Summary', 'By', 'Date', 'Current'].map(h =>
                  <th key={h} className="text-left px-4 py-2.5 text-xs font-semibold text-gray-500">{h}</th>)}
              </tr></thead>
              <tbody className="divide-y">
                {versions.length === 0
                  ? <tr><td colSpan={8} className="text-center py-6 text-gray-400">No versions yet.</td></tr>
                  : versions.map(v => (
                    <tr key={v._id} className={`hover:bg-gray-50 ${v.isCurrent ? 'bg-green-50' : ''}`}>
                      <td className="px-4 py-2.5 font-mono text-xs">{v.versionCode}</td>
                      <td className="px-4 py-2.5 text-sm font-medium">{v.versionLabel || v.versionNumber}</td>
                      <td className="px-4 py-2.5 text-xs text-gray-600">{v.fileName || '—'}</td>
                      <td className="px-4 py-2.5 text-xs capitalize">{v.changeType}</td>
                      <td className="px-4 py-2.5 text-xs text-gray-500">{v.changeSummary || '—'}</td>
                      <td className="px-4 py-2.5 text-xs">{v.createdBy?.name || 'System'}</td>
                      <td className="px-4 py-2.5 text-xs text-gray-400">{new Date(v.createdAt).toLocaleDateString()}</td>
                      <td className="px-4 py-2.5">{v.isCurrent && <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">Current</span>}</td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Comments */}
        {tab === 'Comments' && (
          <div className="space-y-3">
            <div className="flex gap-2">
              <input value={newComment} onChange={e => setNewComment(e.target.value)} placeholder="Add a comment…" className="flex-1 border rounded-lg px-3 py-2 text-sm" />
              <button onClick={handleComment} className="px-4 py-2 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700">Post</button>
            </div>
            <div className="space-y-2">
              {comments.length === 0
                ? <p className="text-center text-gray-400 py-4">No comments yet.</p>
                : comments.map(c => (
                  <div key={c._id} className="bg-white rounded-xl border border-gray-100 shadow-sm p-3">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-medium text-gray-700">{c.author?.name || 'Unknown'}</span>
                      <span className="text-xs text-gray-400">{new Date(c.createdAt).toLocaleString()}</span>
                      {c.isInternal && <span className="text-xs bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded">Internal</span>}
                    </div>
                    <p className="text-sm text-gray-700">{c.comment}</p>
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* Approvals */}
        {tab === 'Approvals' && (
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b"><tr>
                {['Code', 'Approver', 'Step', 'Mode', 'Status', 'Remarks', 'Decided'].map(h =>
                  <th key={h} className="text-left px-4 py-2.5 text-xs font-semibold text-gray-500">{h}</th>)}
              </tr></thead>
              <tbody className="divide-y">
                {approvals.length === 0
                  ? <tr><td colSpan={7} className="text-center py-6 text-gray-400">No approvals yet.</td></tr>
                  : approvals.map(a => (
                    <tr key={a._id} className="hover:bg-gray-50">
                      <td className="px-4 py-2.5 font-mono text-xs">{a.approvalCode}</td>
                      <td className="px-4 py-2.5 text-xs">{a.approver?.name || a.approverName || '-'}</td>
                      <td className="px-4 py-2.5 text-xs">{a.stepOrder}</td>
                      <td className="px-4 py-2.5 text-xs capitalize">{a.approvalMode}</td>
                      <td className="px-4 py-2.5">
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${a.status === 'approved' ? 'bg-green-100 text-green-700' : a.status === 'rejected' ? 'bg-red-100 text-red-600' : 'bg-amber-100 text-amber-700'}`}>{a.status}</span>
                      </td>
                      <td className="px-4 py-2.5 text-xs text-gray-500">{a.remarks || '—'}</td>
                      <td className="px-4 py-2.5 text-xs text-gray-400">{a.decidedAt ? new Date(a.decidedAt).toLocaleDateString() : '—'}</td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Signatures */}
        {tab === 'Signatures' && (
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b"><tr>
                {['Code', 'Signer', 'Email', 'Step', 'Status', 'Signed At'].map(h =>
                  <th key={h} className="text-left px-4 py-2.5 text-xs font-semibold text-gray-500">{h}</th>)}
              </tr></thead>
              <tbody className="divide-y">
                {signatures.length === 0
                  ? <tr><td colSpan={6} className="text-center py-6 text-gray-400">No signatures yet.</td></tr>
                  : signatures.map(s => (
                    <tr key={s._id} className="hover:bg-gray-50">
                      <td className="px-4 py-2.5 font-mono text-xs">{s.signatureCode}</td>
                      <td className="px-4 py-2.5 text-xs font-medium">{s.signerName || s.signer?.name || '—'}</td>
                      <td className="px-4 py-2.5 text-xs text-gray-500">{s.signerEmail || '—'}</td>
                      <td className="px-4 py-2.5 text-xs">{s.stepOrder}</td>
                      <td className="px-4 py-2.5">
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${s.status === 'signed' ? 'bg-green-100 text-green-700' : s.status === 'declined' ? 'bg-red-100 text-red-600' : 'bg-amber-100 text-amber-700'}`}>{s.status}</span>
                      </td>
                      <td className="px-4 py-2.5 text-xs text-gray-400">{s.signedAt ? new Date(s.signedAt).toLocaleString() : '—'}</td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
