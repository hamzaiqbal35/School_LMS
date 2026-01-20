"use client"
import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { Loader2, Trash2, Plus } from 'lucide-react';

interface BaseItem {
    _id: string;
    name: string;
}

interface ClassItem extends BaseItem {
    order?: number;
}

type SectionItem = BaseItem;

interface SubjectItem extends BaseItem {
    code?: string;
    classes?: (ClassItem | string)[]; // IDs or Populated objects
}

interface TimeSlotItem extends BaseItem {
    day: string;
    startTime: string;
    endTime: string;
    order?: number;
}

interface MasterData {
    classes: ClassItem[];
    sections: SectionItem[];
    subjects: SubjectItem[];
    timeslots: TimeSlotItem[];
}

// Union type for mapped items in the list
type MasterDataItem = ClassItem & SubjectItem & TimeSlotItem;
// Note: This is a loose intersection to handle the dynamic map. A discriminated union or separate lists would be stricter but this fits the current structure.

export default function MasterDataPage() {
    const [activeTab, setActiveTab] = useState<'classes' | 'sections' | 'subjects' | 'timeslots'>('classes');
    const [data, setData] = useState<MasterData>({ classes: [], sections: [], subjects: [], timeslots: [] });
    const [loading, setLoading] = useState(true);

    // Create Forms state
    const [newItem, setNewItem] = useState<Partial<MasterDataItem>>({});
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const res = await api.get('/admin/master-data');
            // Ensure array fallbacks
            const d = res.data;
            setData({
                classes: d.classes || [],
                sections: d.sections || [],
                subjects: d.subjects || [],
                timeslots: d.timeslots || []
            });
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            await api.post(`/admin/master-data/${activeTab}`, newItem);
            setNewItem({});
            fetchData();
        } catch {
            alert('Failed to create item');
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (type: string, id: string) => {
        if (!confirm('Delete this item? This might affect existing records.')) return;
        try {
            await api.delete(`/admin/master-data/${type}/${id}`);
            fetchData();
        } catch {
            alert('Failed to delete');
        }
    };

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-gray-800">Master Data Configuration</h1>

            {/* Tabs */}
            <div className="flex border-b border-gray-200 space-x-4">
                {(['classes', 'sections', 'subjects', 'timeslots'] as const).map(tab => (
                    <button
                        key={tab}
                        onClick={() => { setActiveTab(tab); setNewItem({}); }}
                        className={`py-2 px-4 border-b-2 font-medium capitalize transition-colors ${activeTab === tab
                            ? 'border-blue-600 text-blue-600'
                            : 'border-transparent text-gray-500 hover:text-gray-700'
                            }`}
                    >
                        {tab}
                    </button>
                ))}
            </div>

            {loading ? <div className="p-10 flex justify-center"><Loader2 className="animate-spin" /></div> : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* List Column */}
                    <div className="md:col-span-2 bg-white rounded-xl shadow-sm border p-4">
                        <h3 className="font-semibold mb-4 capitalize text-lg">{activeTab} List</h3>
                        <div className="space-y-2 max-h-[500px] overflow-y-auto">
                            {data[activeTab]?.length === 0 && <p className="text-gray-500 italic">No items found.</p>}
                            {(data[activeTab] as MasterDataItem[]).map((item) => (
                                <div key={item._id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg group">
                                    <div>
                                        <p className="font-medium text-gray-900">{item.name}</p>
                                        {activeTab === 'subjects' && (
                                            <div className="text-xs text-gray-500 mt-1">
                                                Code: {item.code} <br />
                                                <div className="flex flex-wrap gap-1 mt-1">
                                                    {item.classes?.map((c: ClassItem | string) => (
                                                        <span key={(typeof c === 'string' ? c : c._id) || "unknown"} className="bg-blue-50 text-blue-700 px-1 rounded">
                                                            {(typeof c === 'string' ? 'Unknown' : c.name) || 'Unknown'}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                        {activeTab === 'timeslots' && <p className="text-xs text-gray-500">{item.day} | {item.startTime}-{item.endTime}</p>}
                                    </div>
                                    <button
                                        onClick={() => handleDelete(activeTab, item._id)}
                                        className="text-red-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Create Form Column */}
                    <div className="bg-white rounded-xl shadow-sm border p-6 h-fit">
                        <h3 className="font-semibold mb-4 capitalize flex items-center">
                            <Plus className="w-4 h-4 mr-2" /> Add {activeTab.slice(0, -1)}
                        </h3>
                        <form onSubmit={handleCreate} className="space-y-4">
                            <div>
                                <label htmlFor="itemName" className="block text-sm font-medium text-gray-700 mb-1">Name / Title</label>
                                <input
                                    id="itemName"
                                    name="itemName"
                                    type="text" required
                                    className="w-full border rounded p-2"
                                    placeholder={activeTab === 'classes' ? 'e.g 9th' : 'Name'}
                                    value={newItem.name || ''}
                                    onChange={e => setNewItem({ ...newItem, name: e.target.value })}
                                />
                            </div>

                            {activeTab === 'classes' && (
                                <div>
                                    <label htmlFor="itemOrder" className="block text-sm font-medium text-gray-700 mb-1">Order (Sort)</label>
                                    <input
                                        id="itemOrder"
                                        name="itemOrder"
                                        type="number" required
                                        className="w-full border rounded p-2"
                                        value={newItem.order || ''}
                                        onChange={e => setNewItem({ ...newItem, order: Number(e.target.value) })}
                                    />
                                </div>
                            )}

                            {activeTab === 'subjects' && (
                                <>
                                    <div>
                                        <label htmlFor="subjectCode" className="block text-sm font-medium text-gray-700 mb-1">Code</label>
                                        <input
                                            id="subjectCode"
                                            name="subjectCode"
                                            type="text" required
                                            className="w-full border rounded p-2"
                                            placeholder="e.g PHY"
                                            value={newItem.code || ''}
                                            onChange={e => setNewItem({ ...newItem, code: e.target.value })}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Applicable Classes</label>
                                        <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto border p-2 rounded">
                                            {data.classes.map((cls: ClassItem) => (
                                                <label key={cls._id} className="flex items-center space-x-2 text-sm">
                                                    <input
                                                        type="checkbox"
                                                        value={cls._id}
                                                        checked={newItem.classes?.includes(cls._id) || false}
                                                        onChange={(e) => {
                                                            const checked = e.target.checked;
                                                            const current = newItem.classes || [];
                                                            setNewItem({
                                                                ...newItem,
                                                                classes: checked
                                                                    ? [...current, cls._id]
                                                                    : current.filter((c) => (typeof c === 'string' ? c : c._id) !== cls._id)
                                                            });
                                                        }}
                                                        className="rounded text-blue-600 focus:ring-blue-500"
                                                    />
                                                    <span>{cls.name}</span>
                                                </label>
                                            ))}
                                        </div>
                                    </div>
                                </>
                            )}

                            {activeTab === 'timeslots' && (
                                <>
                                    <div>
                                        <label htmlFor="slotDay" className="block text-sm font-medium text-gray-700 mb-1">Day</label>
                                        <select
                                            id="slotDay"
                                            name="slotDay"
                                            className="w-full border rounded p-2"
                                            value={newItem.day || ''}
                                            onChange={e => setNewItem({ ...newItem, day: e.target.value })}
                                            required
                                        >
                                            <option value="">Select Day</option>
                                            {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(d => (
                                                <option key={d} value={d}>{d}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="grid grid-cols-2 gap-2">
                                        <div>
                                            <label htmlFor="slotStart" className="block text-sm font-medium text-gray-700 mb-1">Start</label>
                                            <input
                                                id="slotStart"
                                                name="slotStart"
                                                type="time" required className="w-full border rounded p-1"
                                                value={newItem.startTime || ''} onChange={e => setNewItem({ ...newItem, startTime: e.target.value })} />
                                        </div>
                                        <div>
                                            <label htmlFor="slotEnd" className="block text-sm font-medium text-gray-700 mb-1">End</label>
                                            <input
                                                id="slotEnd"
                                                name="slotEnd"
                                                type="time" required className="w-full border rounded p-1"
                                                value={newItem.endTime || ''} onChange={e => setNewItem({ ...newItem, endTime: e.target.value })} />
                                        </div>
                                    </div>
                                    <div>
                                        <label htmlFor="slotOrder" className="block text-sm font-medium text-gray-700 mb-1">Order</label>
                                        <input
                                            id="slotOrder"
                                            name="slotOrder"
                                            type="number" className="w-full border rounded p-2" value={newItem.order || 0} onChange={e => setNewItem({ ...newItem, order: Number(e.target.value) })} />
                                    </div>
                                </>
                            )}

                            <button type="submit" disabled={submitting} className="w-full bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-lg font-medium shadow-sm disabled:opacity-50">
                                {submitting ? 'Saving...' : 'Create'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
