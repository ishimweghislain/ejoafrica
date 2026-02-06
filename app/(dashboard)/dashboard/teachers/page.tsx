"use client";

import { useState, useEffect } from "react";
import { Plus, User, Search, Mail, Phone, Edit2, Trash2, MoreHorizontal, Shield, Loader2, AlertTriangle, X } from "lucide-react";
import UserModal from "@/components/UserModal";
import { toast } from "react-hot-toast";

interface Teacher {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    school: string;
    profileImage: string | null;
    role: string;
    accountPin: string;
    country: string;
    city: string;
    address: string;
}

export default function TeachersPage() {
    const [teachers, setTeachers] = useState<Teacher[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedTeacher, setSelectedTeacher] = useState<Teacher | null>(null);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);

    async function fetchTeachers() {
        try {
            const res = await fetch("/api/users?role=TEACHER");
            const data = await res.json();
            setTeachers(data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    }

    const handleDelete = async (id: string) => {
        toast.loading("Decommissioning institutional node...", { id: "delete-teacher" });
        try {
            const res = await fetch(`/api/users/${id}`, { method: "DELETE" });
            if (!res.ok) throw new Error("Deletion failed");

            toast.success("Node Decommissioned.", { id: "delete-teacher", icon: "🗑️" });
            fetchTeachers();
            setShowDeleteConfirm(null);
        } catch (error) {
            toast.error("Protocol Error: Deletion failed.", { id: "delete-teacher" });
        }
    };

    const handleEdit = (teacher: Teacher) => {
        setSelectedTeacher(teacher);
        setIsModalOpen(true);
    };

    const handleAddNew = () => {
        setSelectedTeacher(null);
        setIsModalOpen(true);
    };

    useEffect(() => {
        fetchTeachers();
    }, []);

    return (
        <div className="space-y-8 animate-fade-up">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-1">
                    <h1 className="text-3xl font-black tracking-tight text-slate-900 uppercase">Education Staff</h1>
                    <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest">Manage and monitor all institutional nodes for teachers.</p>
                </div>
                <button
                    onClick={handleAddNew}
                    className="bg-emerald-600 text-white rounded-2xl px-8 py-4 font-black uppercase tracking-widest text-[10px] shadow-xl shadow-emerald-600/20 hover:bg-emerald-500 hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-2"
                >
                    <Plus className="w-5 h-5" />
                    <span>Provision New Teacher</span>
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {loading ? (
                    <div className="col-span-full py-20 flex flex-col items-center gap-4">
                        <Loader2 className="w-12 h-12 animate-spin text-emerald-600" />
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Syncing Staff Records...</p>
                    </div>
                ) : teachers.length > 0 ? (
                    teachers.map((t) => (
                        <div key={t.id} className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-[0_20px_50px_rgba(0,0,0,0.02)] transition-all hover:shadow-2xl hover:-translate-y-2 group relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full -mr-16 -mt-16 group-hover:bg-emerald-500/10 transition-colors"></div>

                            <div className="flex justify-between items-start mb-8 relative z-10">
                                <div className="w-20 h-20 rounded-[2rem] bg-slate-900 flex items-center justify-center text-white text-2xl font-black shadow-2xl shadow-slate-900/20 overflow-hidden ring-4 ring-white">
                                    {t.profileImage ? (
                                        <img src={t.profileImage} alt="" className="w-full h-full object-cover" />
                                    ) : (
                                        <span>{t.firstName[0]}{t.lastName[0]}</span>
                                    )}
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => handleEdit(t)}
                                        className="p-3 bg-slate-50 text-slate-400 hover:bg-emerald-50 hover:text-emerald-600 rounded-2xl transition-all"
                                    >
                                        <Edit2 className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={() => setShowDeleteConfirm(t.id)}
                                        className="p-3 bg-slate-50 text-slate-400 hover:bg-red-50 hover:text-red-500 rounded-2xl transition-all"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>

                            <div className="space-y-2 relative z-10">
                                <h3 className="font-black text-xl text-slate-900 tracking-tighter group-hover:text-emerald-600 transition-colors">
                                    {t.firstName} {t.lastName}
                                </h3>
                                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-100/50">
                                    <Shield className="w-3 h-3" />
                                    <span className="text-[9px] font-black uppercase tracking-widest">{t.school || "Lycée de Kigali"}</span>
                                </div>
                            </div>

                            <div className="mt-8 space-y-4 pt-8 border-t border-slate-50 relative z-10">
                                <div className="flex items-center gap-4 text-[11px] font-bold text-slate-500">
                                    <div className="w-8 h-8 rounded-xl bg-slate-50 flex items-center justify-center">
                                        <Mail className="w-4 h-4 text-slate-300" />
                                    </div>
                                    <span className="truncate">{t.email}</span>
                                </div>
                                <div className="flex items-center gap-4 text-[11px] font-bold text-slate-500">
                                    <div className="w-8 h-8 rounded-xl bg-slate-50 flex items-center justify-center">
                                        <Phone className="w-4 h-4 text-slate-300" />
                                    </div>
                                    <span>{t.phone || "Signal Unavailable"}</span>
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="col-span-full bg-white p-20 rounded-[4rem] border border-slate-100 border-dashed flex flex-col items-center justify-center text-center space-y-6">
                        <div className="bg-slate-50 p-8 rounded-[3rem]">
                            <User className="w-16 h-16 text-slate-200" />
                        </div>
                        <div className="space-y-2">
                            <p className="text-xl font-black text-slate-900 uppercase">Registry Empty</p>
                            <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">No teacher nodes have been provisioned yet.</p>
                        </div>
                    </div>
                )}
            </div>

            {/* Delete Confirmation Modal */}
            {showDeleteConfirm && (
                <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
                    <div
                        className="absolute inset-0 bg-white/40 backdrop-blur-md"
                        onClick={() => setShowDeleteConfirm(null)}
                    />
                    <div className="relative bg-white rounded-[2.5rem] p-10 max-w-sm w-full shadow-2xl animate-fade-up border border-slate-100">
                        <div className="flex flex-col items-center text-center space-y-6">
                            <div className="bg-red-50 p-6 rounded-[2.5rem] text-red-500 shadow-xl shadow-red-500/10">
                                <AlertTriangle className="w-10 h-10" />
                            </div>
                            <div className="space-y-3">
                                <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tighter leading-tight">Wipe Record?</h3>
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest leading-relaxed">
                                    This will permanently decommission this teacher node from the institutional core.
                                </p>
                            </div>
                            <div className="grid grid-cols-2 gap-4 w-full pt-6">
                                <button
                                    onClick={() => setShowDeleteConfirm(null)}
                                    className="bg-slate-50 text-slate-400 py-5 rounded-3xl font-black uppercase tracking-widest text-[10px] hover:bg-slate-100 transition-all flex items-center justify-center gap-2"
                                >
                                    <X className="w-4 h-4" />
                                    Abort
                                </button>
                                <button
                                    onClick={() => handleDelete(showDeleteConfirm)}
                                    className="bg-red-500 text-white py-5 rounded-3xl font-black uppercase tracking-widest text-[10px] shadow-xl shadow-red-500/20 hover:bg-red-600 transition-all flex items-center justify-center gap-2"
                                >
                                    <Trash2 className="w-4 h-4" />
                                    Confirm
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <UserModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSuccess={fetchTeachers}
                defaultRole="TEACHER"
                initialData={selectedTeacher}
            />
        </div>
    );
}
