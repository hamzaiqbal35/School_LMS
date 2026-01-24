"use client"
import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { Loader2, Trash2, Plus, BookOpen, Layers, Clock, GraduationCap, Settings, X, Save } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface AxiosErrorLike {
    response?: {
        data?: {
            message?: string;
        };
    };
}

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
    days?: string[]; // For UI bulk creation state
}

interface MasterData {
    classes: ClassItem[];
    sections: SectionItem[];
    subjects: SubjectItem[];
    timeslots: TimeSlotItem[];
}

type MasterDataItem = ClassItem & SubjectItem & TimeSlotItem;
type TabType = 'classes' | 'sections' | 'subjects' | 'timeslots';

const TABS = [
    { id: 'classes', label: 'Classes', icon: GraduationCap, color: 'text-blue-600', bg: 'bg-blue-50' },
    { id: 'sections', label: 'Sections', icon: Layers, color: 'text-indigo-600', bg: 'bg-indigo-50' },
    { id: 'subjects', label: 'Subjects', icon: BookOpen, color: 'text-purple-600', bg: 'bg-purple-50' },
    { id: 'timeslots', label: 'Time Slots', icon: Clock, color: 'text-orange-600', bg: 'bg-orange-50' },
] as const;

export default function MasterDataPage() {
    const [activeTab, setActiveTab] = useState<TabType>('classes');
    const [data, setData] = useState<MasterData>({ classes: [], sections: [], subjects: [], timeslots: [] });
    const [loading, setLoading] = useState(true);

    // Create Forms state
    const [newItem, setNewItem] = useState<Partial<MasterDataItem>>({});
    const [submitting, setSubmitting] = useState(false);

    // Fee Structure Modal State
    const [showFeeModal, setShowFeeModal] = useState(false);
    const [selectedClass, setSelectedClass] = useState<ClassItem | null>(null);
    const [feeStructure, setFeeStructure] = useState({
        admissionFee: 0,
        monthlyTuition: 0,
        examFee: 0,
        miscCharges: 0
    });
    const [loadingFee, setLoadingFee] = useState(false);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const res = await api.get('/admin/master-data');
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
            if (activeTab === 'timeslots' && newItem.days && newItem.days.length > 0) {
                // Bulk Create Time Slots
                // eslint-disable-next-line @typescript-eslint/no-unused-vars
                const { days: _days, ...itemData } = newItem;
                const promises = newItem.days.map(day =>
                    api.post(`/admin/master-data/${activeTab}`, {
                        ...itemData,
                        day: day // explicit single day for the API
                    })
                );
                await Promise.all(promises);
            } else {
                // Standard Create
                await api.post(`/admin/master-data/${activeTab}`, newItem);
            }

            setNewItem({});
            fetchData();
        } catch (error: unknown) {
            console.error(error);
            const err = error as AxiosErrorLike;
            alert(err.response?.data?.message || 'Failed to create item(s)');
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

    const openFeeModal = async (cls: ClassItem) => {
        setSelectedClass(cls);
        setShowFeeModal(true);
        setLoadingFee(true);
        try {
            const res = await api.get(`/fees/structures/${cls._id}`);
            const data = res.data || {};
            setFeeStructure({
                admissionFee: data.admissionFee || 0,
                monthlyTuition: data.monthlyTuition || 0,
                examFee: data.examFee || 0,
                miscCharges: data.miscCharges || 0
            });
        } catch (error) {
            console.error(error);
            // Default if error
            setFeeStructure({ admissionFee: 0, monthlyTuition: 0, examFee: 0, miscCharges: 0 });
        } finally {
            setLoadingFee(false);
        }
    };

    const handleSaveFee = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedClass) return;
        try {
            await api.post('/fees/structures', { ...feeStructure, classId: selectedClass._id });
            alert('Fee Structure Saved');
            setShowFeeModal(false);
        } catch {
            alert('Failed to save fee structure');
        }
    };

    const activeTabConfig = TABS.find(t => t.id === activeTab)!;

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Academics Configuration</h1>
                    <p className="text-slate-500 mt-1">Manage classes, sections, subjects and schedules</p>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex flex-wrap gap-2 p-1 bg-white rounded-2xl shadow-sm border border-slate-200">
                {TABS.map(tab => {
                    const isActive = activeTab === tab.id;
                    const Icon = tab.icon;
                    return (
                        <button
                            key={tab.id}
                            onClick={() => { setActiveTab(tab.id as TabType); setNewItem({}); }}
                            className={`relative flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-bold transition-all duration-300 ${isActive ? 'text-slate-900' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
                                }`}
                        >
                            {isActive && (
                                <motion.div
                                    layoutId="activeTabBg"
                                    className="absolute inset-0 bg-slate-100 rounded-xl"
                                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                                />
                            )}
                            <span className={`relative z-10 flex items-center justify-center w-8 h-8 rounded-lg ${isActive ? 'bg-white shadow-sm ' + tab.color : 'bg-slate-100/50 ' + tab.color}`}>
                                <Icon className="w-4 h-4" />
                            </span>
                            <span className="relative z-10">{tab.label}</span>
                        </button>
                    )
                })}
            </div>

            {loading ? <div className="p-20 flex justify-center"><Loader2 className="animate-spin text-blue-600 w-10 h-10" /></div> : (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                    {/* List Column */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden"
                    >
                        <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
                            <h3 className="font-bold text-slate-900 flex items-center gap-2 capitalize">
                                <activeTabConfig.icon className={`w-5 h-5 ${activeTabConfig.color}`} />
                                {activeTab} List
                                <span className="ml-2 bg-white px-2 py-0.5 rounded-full text-xs border border-slate-200 text-slate-500 shadow-sm">{data[activeTab]?.length || 0}</span>
                            </h3>
                        </div>
                        <div className="p-6">
                            <div className="grid gap-3">
                                {data[activeTab]?.length === 0 && (
                                    <div className="text-center py-12">
                                        <div className={`mx-auto w-16 h-16 rounded-full flex items-center justify-center mb-3 ${activeTabConfig.bg}`}>
                                            <activeTabConfig.icon className={`w-8 h-8 ${activeTabConfig.color}`} />
                                        </div>
                                        <p className="text-slate-500 font-medium">No {activeTab} found</p>
                                    </div>
                                )}
                                <AnimatePresence>
                                    {(data[activeTab] as MasterDataItem[]).map((item) => (
                                        <motion.div
                                            key={item._id}
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{ opacity: 1, height: 'auto' }}
                                            exit={{ opacity: 0, height: 0 }}
                                            className="group flex justify-between items-center p-4 bg-white border border-slate-200 rounded-xl hover:border-blue-300 hover:shadow-md transition-all duration-200"
                                        >
                                            <div className="flex-1">
                                                <div className="flex items-center gap-3">
                                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold ${activeTabConfig.bg} ${activeTabConfig.color}`}>
                                                        {activeTab === 'classes' && (item as ClassItem).order ? (item as ClassItem).order : item.name.charAt(0).toUpperCase()}
                                                    </div>
                                                    <div>
                                                        <h4 className="font-bold text-slate-900">{item.name}</h4>

                                                        {activeTab === 'classes' && (
                                                            <button
                                                                onClick={() => openFeeModal(item as ClassItem)}
                                                                className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 mt-0.5"
                                                            >
                                                                <Settings className="w-3 h-3" /> Manage Fees
                                                            </button>
                                                        )}

                                                        {activeTab === 'subjects' && (
                                                            <div className="mt-1">
                                                                <span className="text-xs font-mono font-bold bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded mr-2">{item.code}</span>
                                                                <div className="flex flex-wrap gap-1 mt-1.5">
                                                                    {item.classes?.map((c: ClassItem | string) => (
                                                                        <span key={(typeof c === 'string' ? c : c._id) || "unknown"} className="bg-purple-50 text-purple-700 border border-purple-100 text-[10px] font-bold px-1.5 py-0.5 rounded">
                                                                            {(typeof c === 'string' ? 'Unknown' : c.name) || 'Unknown'}
                                                                        </span>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        )}
                                                        {activeTab === 'timeslots' && (
                                                            <span className="text-xs font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full mt-1 inline-block">
                                                                {item.day} | {item.startTime} - {item.endTime}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => handleDelete(activeTab, item._id)}
                                                className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg opacity-0 group-hover:opacity-100 transition-all"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </motion.div>
                                    ))}
                                </AnimatePresence>
                            </div>
                        </div>
                    </motion.div>

                    {/* Create Form Column */}
                    <div className="sticky top-6">
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden"
                        >
                            <div className="p-6 border-b border-slate-100 bg-slate-50/50">
                                <h3 className="font-bold text-slate-900 flex items-center capitalize">
                                    <span className={`w-8 h-8 rounded-lg flex items-center justify-center mr-3 ${activeTabConfig.bg} ${activeTabConfig.color}`}>
                                        <Plus className="w-4 h-4" />
                                    </span>
                                    Add New {activeTab.slice(0, -1)}
                                </h3>
                            </div>
                            <div className="p-6">
                                <form onSubmit={handleCreate} className="space-y-4">
                                    <div>
                                        <label htmlFor="itemName" className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Name / Title</label>
                                        <input
                                            id="itemName"
                                            name="itemName"
                                            type="text" required
                                            className="w-full border border-slate-200 rounded-xl p-3 text-sm font-medium focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                                            placeholder={activeTab === 'classes' ? 'e.g. 9th Grade' : 'Enter name...'}
                                            value={newItem.name || ''}
                                            onChange={e => setNewItem({ ...newItem, name: e.target.value })}
                                        />
                                    </div>

                                    {activeTab === 'classes' && (
                                        <div>
                                            <label htmlFor="itemOrder" className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Sort Order</label>
                                            <input
                                                id="itemOrder"
                                                name="itemOrder"
                                                type="number" required
                                                className="w-full border border-slate-200 rounded-xl p-3 text-sm font-medium focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                                                value={newItem.order || ''}
                                                onChange={e => setNewItem({ ...newItem, order: Number(e.target.value) })}
                                                placeholder="e.g. 1"
                                            />
                                        </div>
                                    )}

                                    {activeTab === 'subjects' && (
                                        <>
                                            <div>
                                                <label htmlFor="subjectCode" className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Subject Code</label>
                                                <input
                                                    id="subjectCode"
                                                    name="subjectCode"
                                                    type="text" required
                                                    className="w-full border border-slate-200 rounded-xl p-3 text-sm font-medium focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                                                    placeholder="e.g. PHY-101"
                                                    value={newItem.code || ''}
                                                    onChange={e => setNewItem({ ...newItem, code: e.target.value })}
                                                />
                                            </div>
                                            <div>
                                                <p className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Applicable Classes</p>
                                                <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto custom-scrollbar border border-slate-200 p-3 rounded-xl bg-slate-50/50">
                                                    {data.classes.map((cls: ClassItem) => (
                                                        <label key={cls._id} className={`flex items-center space-x-2 text-sm p-2 rounded-lg cursor-pointer transition-all ${newItem.classes?.includes(cls._id) ? 'bg-blue-100 text-blue-700' : 'hover:bg-slate-200/50'}`}>
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
                                                                className="rounded text-blue-600 focus:ring-blue-500 w-4 h-4 border-gray-300"
                                                            />
                                                            <span className="font-medium">{cls.name}</span>
                                                        </label>
                                                    ))}
                                                </div>
                                            </div>
                                        </>
                                    )}

                                    {activeTab === 'timeslots' && (
                                        <>
                                            <div>
                                                <p className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Days & Frequency</p>
                                                <div className="grid grid-cols-2 gap-2 border border-slate-200 p-3 rounded-xl bg-slate-50/50">
                                                    {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(d => (
                                                        <label key={d} className={`flex items-center space-x-2 text-sm p-2 rounded-lg cursor-pointer transition-all ${newItem.days?.includes(d) ? 'bg-blue-100 text-blue-700 font-bold' : 'hover:bg-slate-200/50 text-slate-600'}`}>
                                                            <input
                                                                type="checkbox"
                                                                value={d}
                                                                checked={newItem.days?.includes(d) || false}
                                                                onChange={(e) => {
                                                                    const checked = e.target.checked;
                                                                    const current = newItem.days || [];
                                                                    setNewItem({
                                                                        ...newItem,
                                                                        days: checked
                                                                            ? [...current, d]
                                                                            : current.filter(day => day !== d)
                                                                    });
                                                                }}
                                                                className="rounded text-blue-600 focus:ring-blue-500 w-4 h-4 border-gray-300"
                                                            />
                                                            <span>{d}</span>
                                                        </label>
                                                    ))}
                                                </div>
                                                <p className="text-[10px] text-slate-400 mt-1.5 ml-1">Select all days where this time period applies (e.g. Mon-Fri)</p>
                                            </div>
                                            <div className="grid grid-cols-2 gap-3">
                                                <div>
                                                    <label htmlFor="slotStart" className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Start Time</label>
                                                    <input
                                                        id="slotStart"
                                                        name="slotStart"
                                                        type="time" required
                                                        className="w-full border border-slate-200 rounded-xl p-3 text-sm font-medium focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                                                        value={newItem.startTime || ''} onChange={e => setNewItem({ ...newItem, startTime: e.target.value })} />
                                                </div>
                                                <div>
                                                    <label htmlFor="slotEnd" className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">End Time</label>
                                                    <input
                                                        id="slotEnd"
                                                        name="slotEnd"
                                                        type="time" required
                                                        className="w-full border border-slate-200 rounded-xl p-3 text-sm font-medium focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                                                        value={newItem.endTime || ''} onChange={e => setNewItem({ ...newItem, endTime: e.target.value })} />
                                                </div>
                                            </div>
                                            <div>
                                                <label htmlFor="slotOrder" className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Sequence Order</label>
                                                <input
                                                    id="slotOrder"
                                                    name="slotOrder"
                                                    type="number"
                                                    className="w-full border border-slate-200 rounded-xl p-3 text-sm font-medium focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                                                    value={newItem.order || 0} onChange={e => setNewItem({ ...newItem, order: Number(e.target.value) })} />
                                            </div>
                                        </>
                                    )}

                                    <button
                                        type="submit"
                                        disabled={submitting}
                                        className="w-full bg-blue-600 hover:bg-blue-700 text-white p-3.5 rounded-xl font-bold shadow-lg shadow-blue-600/20 transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-4"
                                    >
                                        {submitting ? <Loader2 className="animate-spin w-5 h-5" /> : <><Plus className="w-5 h-5" /> Create Item</>}
                                    </button>
                                </form>
                            </div>
                        </motion.div>
                    </div>
                </div>
            )}

            {/* Fee Structure Modal */}
            <AnimatePresence>
                {showFeeModal && (
                    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-white p-0 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden"
                        >
                            <div className="p-6 bg-slate-50/50 border-b border-slate-100 flex justify-between items-center">
                                <div>
                                    <h3 className="text-xl font-bold text-slate-900">Fee Structure</h3>
                                    <p className="text-sm text-slate-500">Configure fees for <span className="text-blue-600 font-bold">{selectedClass?.name}</span></p>
                                </div>
                                <button onClick={() => setShowFeeModal(false)} className="bg-white p-2 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 border border-slate-200 transition-colors">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <div className="p-6">
                                {loadingFee ? <div className="py-12 flex justify-center"><Loader2 className="animate-spin text-blue-600 w-8 h-8" /></div> : (
                                    <form onSubmit={handleSaveFee} className="space-y-6">
                                        <div className="grid grid-cols-2 gap-5">
                                            <div>
                                                <label htmlFor="admissionFee" className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Admission Fee</label>
                                                <div className="relative">
                                                    <span className="absolute left-3 top-2.5 text-slate-400 font-bold text-sm">PKR</span>
                                                    <input id="admissionFee" name="admissionFee" type="number" className="w-full pl-12 pr-4 py-2.5 border border-slate-200 rounded-xl font-medium focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none" value={feeStructure.admissionFee} onChange={e => setFeeStructure({ ...feeStructure, admissionFee: Number(e.target.value) })} />
                                                </div>
                                            </div>
                                            <div>
                                                <label htmlFor="monthlyTuition" className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Monthly Tuition</label>
                                                <div className="relative">
                                                    <span className="absolute left-3 top-2.5 text-slate-400 font-bold text-sm">PKR</span>
                                                    <input id="monthlyTuition" name="monthlyTuition" type="number" required className="w-full pl-12 pr-4 py-2.5 border border-slate-200 rounded-xl font-medium focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none" value={feeStructure.monthlyTuition} onChange={e => setFeeStructure({ ...feeStructure, monthlyTuition: Number(e.target.value) })} />
                                                </div>
                                            </div>
                                            <div>
                                                <label htmlFor="examFee" className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Exam Fee</label>
                                                <div className="relative">
                                                    <span className="absolute left-3 top-2.5 text-slate-400 font-bold text-sm">PKR</span>
                                                    <input id="examFee" name="examFee" type="number" className="w-full pl-12 pr-4 py-2.5 border border-slate-200 rounded-xl font-medium focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none" value={feeStructure.examFee} onChange={e => setFeeStructure({ ...feeStructure, examFee: Number(e.target.value) })} />
                                                </div>
                                            </div>
                                            <div>
                                                <label htmlFor="miscCharges" className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Misc Charges</label>
                                                <div className="relative">
                                                    <span className="absolute left-3 top-2.5 text-slate-400 font-bold text-sm">PKR</span>
                                                    <input id="miscCharges" name="miscCharges" type="number" className="w-full pl-12 pr-4 py-2.5 border border-slate-200 rounded-xl font-medium focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none" value={feeStructure.miscCharges} onChange={e => setFeeStructure({ ...feeStructure, miscCharges: Number(e.target.value) })} />
                                                </div>
                                            </div>
                                        </div>
                                        <div className="pt-2 flex justify-end gap-3">
                                            <button type="button" onClick={() => setShowFeeModal(false)} className="px-5 py-2.5 text-slate-600 hover:bg-slate-100 rounded-xl font-bold transition-colors">Cancel</button>
                                            <button type="submit" className="px-6 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 font-bold shadow-lg shadow-blue-600/20 flex items-center gap-2">
                                                <Save className="w-4 h-4" /> Save Structure
                                            </button>
                                        </div>
                                    </form>
                                )}
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
