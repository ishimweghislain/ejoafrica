"use client";

import { useState, useEffect } from "react";
import { Plus, User, Search, Mail, Phone, MoreHorizontal, Shield, Loader2 } from "lucide-react";
import UserModal from "@/components/UserModal";

interface Teacher {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    school: string;
    profileImage: string | null;
}

export default function TeachersPage() {
    const [teachers, setTeachers] = useState<Teacher[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);

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

    useEffect(() => {
        fetchTeachers();
    }, []);

    return (
        <div className="space-y-8 animate-fade-up">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-gray-900">Education Staff</h1>
                    <p className="text-gray-500 text-sm">Manage and monitor all teachers in the institution.</p>
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="btn-primary flex items-center justify-center gap-2"
                >
                    <Plus className="w-5 h-5" />
                    <span>Add New Teacher</span>
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {loading ? (
                    <div className="col-span-full py-20 flex justify-center">
                        <Loader2 className="w-10 h-10 animate-spin text-emerald-600" />
                    </div>
                ) : teachers.length > 0 ? (
                    teachers.map((t) => (
                        <div key={t.id} className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm transition-all hover:shadow-xl hover:-translate-y-1 group">
                            <div className="flex justify-between items-start mb-6">
                                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white text-xl font-bold shadow-lg shadow-emerald-200 overflow-hidden">
                                    {t.profileImage ? (
                                        <img src={t.profileImage} alt="" className="w-full h-full object-cover" />
                                    ) : (
                                        <span>{t.firstName[0]}{t.lastName[0]}</span>
                                    )}
                                </div>
                                <button className="text-gray-300 hover:text-gray-600 p-2">
                                    <MoreHorizontal className="w-5 h-5" />
                                </button>
                            </div>

                            <div className="space-y-1">
                                <h3 className="font-bold text-lg group-hover:text-emerald-600 transition-colors">{t.firstName} {t.lastName}</h3>
                                <p className="text-[10px] font-black uppercase text-emerald-600 tracking-widest">{t.school || "No School Assigned"}</p>
                            </div>

                            <div className="mt-6 space-y-3 pt-6 border-t border-gray-50">
                                <div className="flex items-center gap-3 text-xs text-gray-500">
                                    <Mail className="w-4 h-4 text-gray-300" />
                                    <span>{t.email}</span>
                                </div>
                                <div className="flex items-center gap-3 text-xs text-gray-500">
                                    <Phone className="w-4 h-4 text-gray-300" />
                                    <span>{t.phone || "No Phone"}</span>
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="col-span-full bg-white p-6 rounded-[2rem] border border-gray-100 border-dashed flex flex-col items-center justify-center text-center space-y-4 py-12">
                        <User className="w-10 h-10 text-gray-200" />
                        <p className="text-sm font-bold text-gray-600">No Teachers Found</p>
                    </div>
                )}
            </div>

            <UserModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSuccess={fetchTeachers}
                defaultRole="TEACHER"
            />
        </div>
    );
}
