"use client";

import { useState, useEffect } from "react";
import { Plus, User, Search, Mail, Phone, Edit2, Trash2, MoreHorizontal, Shield, Loader2, AlertTriangle, X } from "lucide-react";
import UserModal from "@/components/UserModal";
import ConfirmModal from "@/components/ConfirmModal";
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
        toast.loading("Deleting teacher account...", { id: "delete-teacher" });
        try {
            const res = await fetch(`/api/users/${id}`, { method: "DELETE" });
            if (!res.ok) throw new Error("Deletion failed");

            toast.success("Account deleted successfully.", { id: "delete-teacher", icon: "🗑️" });
            fetchTeachers();
            setShowDeleteConfirm(null);
        } catch (error) {
            toast.error("Error: Could not delete account.", { id: "delete-teacher" });
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
                    <h1 className="text-3xl font-black tracking-tight text-slate-900 uppercase">Teachers & Staff</h1>
                    <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest">Manage and view all registered teachers in the system.</p>
                </div>
                <button
                    onClick={handleAddNew}
                    className="bg-emerald-600 text-white rounded-2xl px-8 py-4 font-black uppercase tracking-widest text-[10px] shadow-xl shadow-emerald-600/20 hover:bg-emerald-500 hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-2"
                >
                    <Plus className="w-5 h-5" />
                    <span>Add New Teacher</span>
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {loading ? (
                    <div className="col-span-full py-20 flex flex-col items-center gap-4">
                        <Loader2 className="w-12 h-12 animate-spin text-emerald-600" />
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Loading staff records...</p>
                    </div>
                ) : teachers.length > 0 ? (
                    teachers.map((t) => (
                        <div key={t.id} className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-[0_10px_30px_rgba(0,0,0,0.02)] transition-all hover:shadow-xl hover:-translate-y-1 group relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full -mr-12 -mt-12 group-hover:bg-emerald-500/10 transition-colors"></div>

                            <div className="flex justify-between items-start mb-6 relative z-10">
                                <div className="w-16 h-16 rounded-[1.5rem] bg-slate-900 flex items-center justify-center text-white text-xl font-black shadow-2xl shadow-slate-900/10 overflow-hidden ring-4 ring-white">
                                    {t.profileImage ? (
                                        <img src={t.profileImage} alt="" className="w-full h-full object-cover" />
                                    ) : (
                                        <span>{t.firstName[0]}{t.lastName[0]}</span>
                                    )}
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => handleEdit(t)}
                                        className="p-2.5 bg-slate-50 text-slate-400 hover:bg-emerald-50 hover:text-emerald-600 rounded-xl transition-all"
                                    >
                                        <Edit2 className="w-3.5 h-3.5" />
                                    </button>
                                    <button
                                        onClick={() => setShowDeleteConfirm(t.id)}
                                        className="p-2.5 bg-slate-50 text-slate-400 hover:bg-red-50 hover:text-red-500 rounded-xl transition-all"
                                    >
                                        <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                </div>
                            </div>

                            <div className="space-y-1 relative z-10">
                                <h3 className="font-black text-lg text-slate-900 tracking-tighter group-hover:text-emerald-600 transition-colors">
                                    {t.firstName} {t.lastName}
                                </h3>
                                <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-100/50">
                                    <Shield className="w-2.5 h-2.5" />
                                    <span className="text-[8px] font-black uppercase tracking-widest">{t.school || "Lycée de Kigali"}</span>
                                </div>
                            </div>

                            <div className="mt-6 space-y-3 pt-6 border-t border-slate-50 relative z-10">
                                <div className="flex items-center gap-3 text-[10px] font-bold text-slate-500">
                                    <div className="w-7 h-7 rounded-lg bg-slate-50 flex items-center justify-center">
                                        <Mail className="w-3.5 h-3.5 text-slate-300" />
                                    </div>
                                    <span className="truncate">{t.email}</span>
                                </div>
                                <div className="flex items-center gap-3 text-[10px] font-bold text-slate-500">
                                    <div className="w-7 h-7 rounded-lg bg-slate-50 flex items-center justify-center">
                                        <Phone className="w-3.5 h-3.5 text-slate-300" />
                                    </div>
                                    <span>{t.phone || "Not provided"}</span>
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
                            <p className="text-xl font-black text-slate-900 uppercase">No Teachers Found</p>
                            <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Start by adding your first teacher account.</p>
                        </div>
                    </div>
                )}
            </div>

            <ConfirmModal
                isOpen={!!showDeleteConfirm}
                onClose={() => setShowDeleteConfirm(null)}
                onConfirm={() => showDeleteConfirm && handleDelete(showDeleteConfirm)}
                title="Delete Account?"
                description="This will permanently delete this teacher's account from the system."
            />

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
