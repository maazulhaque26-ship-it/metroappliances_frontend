import React, { useEffect, useState, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import AdminLayout from './AdminLayout';
import { FiPlus, FiMoreVertical } from 'react-icons/fi';
import { fetchBoards, createBoard, fetchColumns, fetchCards, createCard, moveCard } from '../../services/projectAPI';

const STATUS_COLORS = {
  todo: '#6b7280', in_progress: '#3b82f6', review: '#f59e0b', done: '#10b981', cancelled: '#ef4444',
};

export default function AdminKanbanBoard() {
  const { id: projectId } = useParams();
  const [boards, setBoards]     = useState([]);
  const [boardId, setBoardId]   = useState(null);
  const [columns, setColumns]   = useState([]);
  const [cards, setCards]       = useState([]);
  const [loading, setLoading]   = useState(true);
  const [newCardCol, setNewCardCol] = useState(null);
  const [newCardTitle, setNewCardTitle] = useState('');
  const [dragging, setDragging] = useState(null);

  const loadBoard = useCallback((bid) => {
    Promise.all([fetchColumns(bid), fetchCards(bid)])
      .then(([colRes, cardRes]) => {
        setColumns(colRes.data.data || colRes.data || []);
        setCards(cardRes.data.data || cardRes.data || []);
      }).catch(() => {});
  }, []);

  useEffect(() => {
    fetchBoards(projectId)
      .then(r => {
        const b = r.data.data || r.data || [];
        setBoards(b);
        if (b.length > 0) { setBoardId(b[0]._id); loadBoard(b[0]._id); }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [projectId, loadBoard]);

  const handleCreateBoard = () => {
    createBoard(projectId, { name: 'Sprint Board' })
      .then(r => {
        const b = r.data.data || r.data;
        setBoards(prev => [...prev, b]);
        setBoardId(b._id);
        loadBoard(b._id);
      }).catch(() => {});
  };

  const handleAddCard = (colId) => {
    if (!newCardTitle.trim()) return;
    createCard(boardId, { column: colId, title: newCardTitle.trim() })
      .then(() => { setNewCardTitle(''); setNewCardCol(null); loadBoard(boardId); })
      .catch(() => {});
  };

  const handleDragStart = (e, cardId) => {
    setDragging(cardId);
    e.dataTransfer.setData('cardId', cardId);
  };

  const handleDrop = (e, colId) => {
    e.preventDefault();
    const cardId = e.dataTransfer.getData('cardId');
    if (cardId) {
      moveCard(cardId, { columnId: colId })
        .then(() => loadBoard(boardId))
        .catch(() => {});
    }
    setDragging(null);
  };

  const handleDragOver = (e) => { e.preventDefault(); };

  const colCards = (colId) => cards.filter(c => String(c.column) === String(colId) && !c.isDeleted);

  if (loading) return <AdminLayout><div className="p-8 text-gray-400 text-center">Loading kanban...</div></AdminLayout>;

  return (
    <AdminLayout>
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Kanban Board</h1>
            <p className="text-sm text-gray-500 mt-1">Project #{projectId?.slice(-6)}</p>
          </div>
          {boards.length === 0 && (
            <button onClick={handleCreateBoard} className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg text-sm font-medium">
              <FiPlus size={16} /> Create Board
            </button>
          )}
        </div>

        {boards.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <p className="text-lg font-medium mb-2">No board yet</p>
            <p className="text-sm">Create a board to start managing tasks visually.</p>
          </div>
        ) : (
          <div className="flex gap-4 overflow-x-auto pb-4">
            {columns.map(col => (
              <div
                key={col._id}
                className="flex-shrink-0 w-72 bg-gray-50 rounded-xl border border-gray-200"
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, col._id)}
              >
                <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: col.color || '#6b7280' }} />
                    <span className="font-semibold text-gray-800 text-sm">{col.name}</span>
                    <span className="text-xs text-gray-400 bg-gray-200 rounded-full px-1.5">{colCards(col._id).length}</span>
                  </div>
                  <button onClick={() => setNewCardCol(col._id)} className="text-gray-400 hover:text-gray-600">
                    <FiPlus size={16} />
                  </button>
                </div>
                <div className="p-2 space-y-2 min-h-[200px]">
                  {colCards(col._id).sort((a, b) => a.order - b.order).map(card => (
                    <div
                      key={card._id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, card._id)}
                      className={`bg-white rounded-lg border border-gray-200 p-3 cursor-grab shadow-sm hover:shadow-md transition-shadow ${dragging === card._id ? 'opacity-50' : ''}`}
                    >
                      <p className="text-sm font-medium text-gray-800">{card.title}</p>
                      {card.labels?.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {card.labels.map(l => (
                            <span key={l} className="text-xs bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded">{l}</span>
                          ))}
                        </div>
                      )}
                      {card.dueDate && (
                        <p className="text-xs text-gray-400 mt-1">{new Date(card.dueDate).toLocaleDateString()}</p>
                      )}
                    </div>
                  ))}
                  {newCardCol === col._id && (
                    <div className="bg-white rounded-lg border border-orange-300 p-2">
                      <input
                        autoFocus
                        value={newCardTitle}
                        onChange={e => setNewCardTitle(e.target.value)}
                        onKeyDown={e => { if (e.key === 'Enter') handleAddCard(col._id); if (e.key === 'Escape') setNewCardCol(null); }}
                        placeholder="Card title..."
                        className="w-full text-sm border-none outline-none p-1"
                      />
                      <div className="flex gap-2 mt-1">
                        <button onClick={() => handleAddCard(col._id)} className="text-xs bg-orange-500 text-white px-2 py-1 rounded">Add</button>
                        <button onClick={() => setNewCardCol(null)} className="text-xs text-gray-500">Cancel</button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
