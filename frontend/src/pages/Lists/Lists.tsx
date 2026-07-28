import React, { useEffect, useState } from 'react';
import PageHeader from '../../components/PageHeader/PageHeader';
import { apiUrl, getAuthHeader } from '../../api';
import './Lists.css';

type TweetListSummary = { id: string; name: string; date_created: string };
type Member = { id: string; username: string; full_name: string | null };

const Lists: React.FC = () => {
    const [lists, setLists] = useState<TweetListSummary[]>([]);
    const [newListName, setNewListName] = useState('');
    const [selectedListId, setSelectedListId] = useState<string | null>(null);
    const [members, setMembers] = useState<Member[]>([]);

    const loadLists = async () => {
        const res = await fetch(`${apiUrl}/lists`, { headers: { ...getAuthHeader() } });
        const data = await res.json();
        setLists(Array.isArray(data) ? data : []);
    };

    useEffect(() => {
        loadLists();
    }, []);

    const loadMembers = async (listId: string) => {
        const res = await fetch(`${apiUrl}/lists/${listId}/members`, { headers: { ...getAuthHeader() } });
        const data = await res.json();
        setMembers(Array.isArray(data) ? data : []);
        setSelectedListId(listId);
    };

    const createList = async () => {
        if (!newListName.trim()) return;
        await fetch(`${apiUrl}/lists`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
            body: JSON.stringify({ name: newListName }),
        });
        setNewListName('');
        loadLists();
    };

    const deleteList = async (listId: string) => {
        await fetch(`${apiUrl}/lists/${listId}`, { method: 'DELETE', headers: { ...getAuthHeader() } });
        if (selectedListId === listId) {
            setSelectedListId(null);
            setMembers([]);
        }
        loadLists();
    };

    return (
        <div className="page-container">
            <PageHeader title="Lists" />
            <div className="lists-body">
                <div className="lists-create">
                    <input
                        value={newListName}
                        onChange={(e) => setNewListName(e.target.value)}
                        placeholder="New list name"
                    />
                    <button onClick={createList}>Create</button>
                </div>
                {lists.length === 0 && <p className="lists-empty">No lists yet.</p>}
                {lists.map((l) => (
                    <div key={l.id} className="list-item">
                        <span onClick={() => loadMembers(l.id)}>{l.name}</span>
                        <button onClick={() => deleteList(l.id)}>Delete</button>
                    </div>
                ))}
                {selectedListId && (
                    <div className="list-members">
                        <h3>Members</h3>
                        {members.length === 0 && <p>No members yet.</p>}
                        {members.map((m) => (
                            <div key={m.id}>{m.full_name || m.username}</div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Lists;
