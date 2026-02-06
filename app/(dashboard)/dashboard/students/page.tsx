"use client";

import { useState, useEffect } from "react";
import { Plus, User, Search, Mail, Phone, MoreHorizontal, GraduationCap, Loader2 } from "lucide-react";
import UserModal from "@/components/UserModal";

interface Student {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    school: string;
    profileImage: string | null;
}

export default function StudentsPage() {
    const [students, setStudents] = useState<Student[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);

    async function fetchStudents() {
        try {
            const res = await fetch("/api/users?role=STUDENT");
            const data = await res.json();
            setStudents(data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        fetchStudents();
    }, []);

    return (
        <div className="space-y-8 animate-fade-up">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-gray-900">Student Database</h1>
                    <p className="text-gray-500 text-sm">Monitor academic paths and personal records of all students.</p>
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="btn-primary flex items-center justify-center gap-2"
                >
                    <Plus className="w-5 h-5" />
                    <span>Register Student</span>
                </button>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex flex-col md:flex-row gap-4 items-center">
                <div className="relative flex-grow w-full">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search students by name, email or ID..."
                        className="w-full bg-gray-50 border-none rounded-xl pl-11 pr-4 py-3 text-sm focus:ring-2 focus:ring-emerald-500/20 outline-none"
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {loading ? (
                    <div className="col-span-full py-20 flex justify-center">
                        <Loader2 className="w-10 h-10 animate-spin text-emerald-600" />
                    </div>
                ) : students.length > 0 ? (
                    students.map((s) => (
                        <div key={s.id} className="bg-white p-6 rounded-[2.5rem] border border-gray-100 shadow-sm transition-all hover:shadow-xl group relative overflow-hidden">
                            <div className="flex justify-between items-start mb-6">
                                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-xl font-bold shadow-lg shadow-blue-200 overflow-hidden">
                                    {s.profileImage ? (
                                        <img src={s.profileImage} alt="" className="w-full h-full object-cover" />
                                    ) : (
                                        <span>{s.firstName[0]}{s.lastName[0]}</span>
                                    )}
                                </div>
                                <div className="bg-gray-50 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest text-gray-400">
                                    ID: {s.id.slice(-6).toUpperCase()}
                                </div>
                            </div>

                            <div className="space-y-1">
                                <h3 className="font-bold text-lg group-hover:text-blue-600 transition-colors uppercase">{s.firstName} {s.lastName}</h3>
                                <div className="flex items-center gap-2">
                                    <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></div>
                                    <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Active Enrollment</p>
                                </div>
                            </div>

                            <div className="mt-6 space-y-3 pt-6 border-t border-gray-50">
                                <div className="flex items-center gap-3 text-xs text-gray-500">
                                    <Mail className="w-4 h-4 text-gray-300" />
                                    <span className="truncate">{s.email}</span>
                                </div>
                                <div className="flex items-center gap-3 text-xs text-gray-500">
                                    <Phone className="w-4 h-4 text-gray-300" />
                                    <span>{s.phone || "No Phone Contact"}</span>
                                </div>
                            </div>

                            <button className="mt-6 w-full py-3 rounded-xl border border-gray-100 text-xs font-black uppercase tracking-widest text-gray-400 hover:bg-gray-50 hover:text-blue-600 transition-all">
                                Full Profile
                            </button>
                        </div>
                    ))
                ) : (
                    <div className="col-span-full bg-white p-12 rounded-[3.5rem] border border-gray-100 border-dashed flex flex-col items-center justify-center text-center space-y-4">
                        <div className="bg-gray-50 p-6 rounded-full">
                            <GraduationCap className="w-12 h-12 text-gray-200" />
                        </div>
                        <div className="space-y-1">
                            <p className="font-black text-gray-600 uppercase tracking-widest">No Students Registered</p>
                            <p className="text-xs text-gray-400 font-medium max-w-xs">Start your institution's registration process to see student accounts here.</p>
                        </div>
                        <button onClick={() => setIsModalOpen(true)} className="btn-primary mt-4">Start Registration</button>
                    </div>
                )}
            </div>

            <UserModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSuccess={fetchStudents}
                defaultRole="STUDENT"
            />
        </div>
    );
}
