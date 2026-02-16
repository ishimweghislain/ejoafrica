"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { Plus, Search, Loader2, LayoutGrid, Edit2, Trash2, AlertTriangle, X, RefreshCcw } from "lucide-react";
import ConfirmModal from "@/components/ConfirmModal";
import { toast } from "react-hot-toast";

interface ClassType {
    id: string;
    name: string;
}

export default function ClassesPage() {
    const [mounted, setMounted] = useState(false);
    useEffect(() => { setMounted(true); }, []);

    const [classes, setClasses] = useState<ClassType[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [className, setClassName] = useState("");
    const [selectedClass, setSelectedClass] = useState<ClassType | null>(null);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);

    async function fetchClasses() {
        try {
            const res = await fetch("/api/classes");
            const data = await res.json();
            setClasses(data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        fetchClasses();
    }, []);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        const tid = toast.loading(`${selectedClass ? 'Updating' : 'Creating'} class profile...`);
        try {
            const url = selectedClass ? `/api/classes/${selectedClass.id}` : "/api/classes";
            const method = selectedClass ? "PUT" : "POST";

            const res = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name: className }),
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Operation failed");

            toast.success(`Class ${selectedClass ? 'updated' : 'added'} successfully.`, { id: tid, icon: "🏫" });
            setClassName("");
            setSelectedClass(null);
            setIsModalOpen(false);
            fetchClasses();
        } catch (err: any) {
            toast.error(`Error: ${err.message}`, { id: tid });
        }
    }

    const handleDelete = async (id: string) => {
        toast.loading("Deleting class...", { id: "delete-class" });
        try {
            const res = await fetch(`/api/classes/${id}`, { method: "DELETE" });
            if (!res.ok) throw new Error("Deletion failed");

            toast.success("Class deleted successfully.", { id: "delete-class", icon: "🗑️" });
            fetchClasses();
            setShowDeleteConfirm(null);
        } catch (error) {
            toast.error("Error: Could not delete class.", { id: "delete-class" });
        }
    };

    const handleEdit = (cls: ClassType) => {
        setSelectedClass(cls);
        setClassName(cls.name);
        setIsModalOpen(true);
    };

    const handleAddNew = () => {
        setSelectedClass(null);
        setClassName("");
        setIsModalOpen(true);
    };

    return (
        <div className="space-y-8 animate-fade-up">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-1">
                    <h1 className="text-3xl font-black tracking-tight text-slate-900 uppercase">School Classes</h1>
                    <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest">Organize and manage your school's academic classes.</p>
                </div>
                <button
                    onClick={handleAddNew}
                    className="bg-emerald-600 text-white rounded-2xl px-8 py-4 font-black uppercase tracking-widest text-[10px] shadow-xl shadow-emerald-600/20 hover:bg-emerald-500 hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-2"
                >
                    <Plus className="w-5 h-5" />
                    <span>Add New Class</span>
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-8">
                {loading ? (
                    <div className="col-span-full py-20 flex flex-col items-center gap-4">
                        <Loader2 className="w-12 h-12 animate-spin text-emerald-600" />
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Loading school classes...</p>
                    </div>
                ) : classes.length > 0 ? (
                    classes.map((cls) => (
                        <div key={cls.id} className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-[0_20px_50px_rgba(0,0,0,0.02)] flex flex-col items-center text-center gap-6 group hover:shadow-2xl hover:-translate-y-1 transition-all relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full -mr-12 -mt-12 group-hover:bg-emerald-500/10 transition-colors"></div>

                            <div className="bg-slate-900 w-20 h-20 rounded-[2rem] flex items-center justify-center text-white shadow-2xl shadow-slate-900/20 group-hover:scale-110 transition-transform">
                                <LayoutGrid className="w-10 h-10" />
                            </div>

                            <div className="space-y-2">
                                <h3 className="text-2xl font-black text-slate-900 tracking-tighter group-hover:text-emerald-600 transition-colors">{cls.name}</h3>
                                <p className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-400">Class Level</p>
                            </div>

                            <div className="flex gap-3 pt-4 opacity-0 group-hover:opacity-100 transition-all transform translate-y-4 group-hover:translate-y-0">
                                <button
                                    onClick={() => handleEdit(cls)}
                                    className="p-4 bg-slate-50 text-slate-400 hover:bg-emerald-50 hover:text-emerald-600 rounded-2xl transition-all"
                                >
                                    <Edit2 className="w-5 h-5" />
                                </button>
                                <button
                                    onClick={() => setShowDeleteConfirm(cls.id)}
                                    className="p-4 bg-slate-50 text-slate-400 hover:bg-red-50 hover:text-red-500 rounded-2xl transition-all"
                                >
                                    <Trash2 className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="col-span-full bg-white p-20 rounded-[4rem] border border-slate-100 border-dashed flex flex-col items-center justify-center text-center space-y-6">
                        <div className="bg-slate-50 p-8 rounded-[3rem]">
                            <LayoutGrid className="w-16 h-16 text-slate-200" />
                        </div>
                        <div className="space-y-2">
                            <p className="text-xl font-black text-slate-900 uppercase">No Classes Found</p>
                            <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Start by adding your first school class.</p>
                        </div>
                    </div>
                )}
            </div>

            {/* Modal for Add/Edit */}
            {isModalOpen && mounted && createPortal(
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 md:p-6">
                    <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-[2px]" onClick={() => setIsModalOpen(false)} />
                    <form onSubmit={handleSubmit} className="relative bg-white w-full max-w-md rounded-[3rem] p-8 md:p-10 shadow-2xl animate-fade-up border border-slate-100 space-y-10 overflow-y-auto max-h-[95vh]">
                        <button
                            type="button"
                            onClick={() => setIsModalOpen(false)}
                            className="absolute top-6 right-6 p-3 hover:bg-slate-50 rounded-2xl transition-all text-slate-400 hover:text-slate-600"
                        >
                            <X className="w-6 h-6" />
                        </button>

                        <div className="flex items-center gap-4">
                            <div className="bg-emerald-500 p-3 rounded-2xl text-white">
                                {selectedClass ? <RefreshCcw className="w-6 h-6" /> : <Plus className="w-6 h-6" />}
                            </div>
                            <div>
                                <h3 className="text-2xl font-black text-slate-900 leading-tight">
                                    {selectedClass ? "Update Class" : "Add New Class"}
                                </h3>
                                <p className="text-[10px] font-black uppercase tracking-widest text-emerald-500">
                                    {selectedClass ? "Edit Class Name" : "Create new class"}
                                </p>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <label className="text-[10px] font-black uppercase text-slate-400 tracking-[0.3em] ml-2 block">Class Name</label>
                            <input
                                required
                                className="w-full bg-slate-50/50 border border-slate-100 rounded-[2rem] px-8 py-6 text-sm font-bold text-slate-900 focus:ring-8 focus:ring-emerald-500/5 focus:bg-white outline-none transition-all placeholder:text-slate-300"
                                placeholder="e.g. Senior 1A"
                                value={className}
                                onChange={(e) => setClassName(e.target.value)}
                            />
                        </div>

                        <button
                            type="submit"
                            className="w-full bg-slate-900 text-white py-6 rounded-[2rem] font-black uppercase tracking-widest text-xs hover:bg-emerald-600 transition-all shadow-2xl shadow-slate-200"
                        >
                            {selectedClass ? "Save Changes" : "Create Class"}
                        </button>
                    </form>
                </div>,
                document.body
            )}

            <ConfirmModal
                isOpen={!!showDeleteConfirm}
                onClose={() => setShowDeleteConfirm(null)}
                onConfirm={() => showDeleteConfirm && handleDelete(showDeleteConfirm)}
                title="Delete Class?"
                description="This will permanently delete this class and all linked student records."
            />
        </div>
    );
}
