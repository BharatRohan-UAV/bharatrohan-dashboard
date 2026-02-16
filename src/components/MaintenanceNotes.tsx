'use client';

import { useState } from 'react';
import { supabase, MaintenanceNote } from '@/lib/supabase';

export default function MaintenanceNotes({
    droneId,
    initialNotes,
}: {
    droneId: string;
    initialNotes: MaintenanceNote[];
}) {
    const [notes, setNotes] = useState<MaintenanceNote[]>(initialNotes);
    const [newNote, setNewNote] = useState('');
    const [saving, setSaving] = useState(false);

    const addNote = async () => {
        const trimmed = newNote.trim();
        if (!trimmed) return;

        setSaving(true);
        const { data, error } = await supabase
            .from('maintenance_notes')
            .insert({ drone_id: droneId, note: trimmed })
            .select()
            .single();

        setSaving(false);

        if (error) {
            alert('Failed to add note: ' + error.message);
            return;
        }

        if (data) {
            setNotes([data, ...notes]);
            setNewNote('');
        }
    };

    const deleteNote = async (noteId: string) => {
        const { error } = await supabase
            .from('maintenance_notes')
            .delete()
            .eq('id', noteId);

        if (error) {
            alert('Failed to delete note: ' + error.message);
            return;
        }

        setNotes(notes.filter((n) => n.id !== noteId));
    };

    return (
        <div>
            <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
                <textarea
                    value={newNote}
                    onChange={(e) => setNewNote(e.target.value)}
                    placeholder="Add a maintenance note..."
                    rows={2}
                    style={{
                        flex: 1,
                        padding: '8px 12px',
                        border: '1px solid #ddd',
                        borderRadius: '4px',
                        fontSize: '14px',
                        fontFamily: 'inherit',
                        resize: 'vertical',
                    }}
                />
                <button
                    onClick={addNote}
                    disabled={saving || !newNote.trim()}
                    style={{
                        padding: '8px 16px',
                        backgroundColor: saving ? '#ccc' : '#28a745',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: saving ? 'default' : 'pointer',
                        fontSize: '14px',
                        alignSelf: 'flex-start',
                    }}
                >
                    {saving ? 'Saving...' : 'Add Note'}
                </button>
            </div>

            {notes.length === 0 ? (
                <p style={{ color: '#999' }}>No maintenance notes yet.</p>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {notes.map((note) => (
                        <div
                            key={note.id}
                            style={{
                                padding: '12px',
                                backgroundColor: '#f8f9fa',
                                borderRadius: '4px',
                                border: '1px solid #eee',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'flex-start',
                                gap: '12px',
                            }}
                        >
                            <div style={{ flex: 1 }}>
                                <div style={{ fontSize: '14px', marginBottom: '4px' }}>{note.note}</div>
                                <div style={{ fontSize: '12px', color: '#888' }}>
                                    {new Date(note.created_at).toLocaleString()}
                                </div>
                            </div>
                            <button
                                onClick={() => deleteNote(note.id)}
                                style={{
                                    padding: '4px 8px',
                                    backgroundColor: 'transparent',
                                    color: '#dc3545',
                                    border: '1px solid #dc3545',
                                    borderRadius: '4px',
                                    cursor: 'pointer',
                                    fontSize: '12px',
                                }}
                            >
                                Delete
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
