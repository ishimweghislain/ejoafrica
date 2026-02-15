"use client";

import { useState, useEffect } from "react";
import { Plus, User, Search, Mail, Phone, Edit2, Trash2, GraduationCap, Loader2, AlertTriangle, X, Shield, ArrowLeft, Users, LayoutGrid } from "lucide-react";
import UserModal from "@/components/UserModal";
import ConfirmModal from "@/components/ConfirmModal";
import { toast } from "react-hot-toast";

interface Class {
    id: string;
    name: string;
    _count?: {
        users: number;
    }
}

interface Student {
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
    classId: string | null;
    class?: {
        name: string;
    }
}

export default function StudentsPage() {
    const [students, setStudents] = useState<Student[]>([]);
    const [classes, setClasses] = useState<Class[]>([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
    const [selectedClass, setSelectedClass] = useState<Class | null>(null);

    async function fetchData() {
        try {
            setLoading(true);
            const [studentsRes, classesRes] = await Promise.all([
                fetch("/api/users?role=STUDENT"),
                fetch("/api/classes")
            ]);

            const studentsData = await studentsRes.json();
            const classesData = await classesRes.json();

            setStudents(Array.isArray(studentsData) ? studentsData : []);
            setClasses(Array.isArray(classesData) ? classesData : []);
        } catch (err) {
            console.error(err);
            toast.error("Failed to load records.");
        } finally {
            setLoading(false);
        }
    }

    const handleDelete = async (id: string) => {
        toast.loading("Deleting student...", { id: "delete-student" });
        try {
            const res = await fetch(`/api/users/${id}`, { method: "DELETE" });
            if (!res.ok) throw new Error("Deletion failed");

            toast.success("Student deleted successfully.", { id: "delete-student", icon: "🗑️" });
            fetchData();
            setShowDeleteConfirm(null);
        } catch (error) {
            toast.error("Error: Deletion failed.", { id: "delete-student" });
        }
    };

    const handleEdit = (student: Student) => {
        setSelectedStudent(student);
        setIsModalOpen(true);
    };

    const handleAddNew = () => {
        setSelectedStudent(null);
        setIsModalOpen(true);
    };

    useEffect(() => {
        fetchData();
    }, []);

    const filteredStudents = students.filter(s => {
        const matchesSearch = `${s.firstName} ${s.lastName}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
            s.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
            s.id.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesClass = selectedClass ? s.classId === selectedClass.id : true;

        return matchesSearch && matchesClass;
    });

    // Helper to get student count for a class
    const getStudentCount = (classId: string) => {
        return students.filter(s => s.classId === classId).length;
    };

    return (
        <div className="space-y-8 animate-fade-up">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-1">
                    <div className="flex items-center gap-2">
                        {selectedClass && (
                            <button
                                onClick={() => setSelectedClass(null)}
                                className="p-2 hover:bg-slate-100 rounded-xl transition-all text-slate-400 hover:text-slate-900"
                            >
                                <ArrowLeft className="w-5 h-5" />
                            </button>
                        )}
                        <h1 className="text-3xl font-black tracking-tight text-slate-900 uppercase">
                            {selectedClass ? `${selectedClass.name} Students` : "Student Dashboard"}
                        </h1>
                    </div>
                    <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest">
                        {selectedClass
                            ? `Viewing all students registered in ${selectedClass.name}.`
                            : "Select a class to manage its students."}
                    </p>
                </div>
                <button
                    onClick={handleAddNew}
                    className="bg-emerald-600 text-white rounded-2xl px-8 py-4 font-black uppercase tracking-widest text-[10px] shadow-xl shadow-emerald-600/20 hover:bg-emerald-500 hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-2"
                >
                    <Plus className="w-5 h-5" />
                    <span>Add New Student</span>
                </button>
            </div>

            {!selectedClass ? (
                // Class Selection View
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {loading ? (
                        <div className="col-span-full py-20 flex flex-col items-center gap-4">
                            <Loader2 className="w-12 h-12 animate-spin text-emerald-600" />
                            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Loading Classes...</p>
                        </div>
                    ) : classes.length > 0 ? (
                        classes.map((cls) => (
                            <button
                                key={cls.id}
                                onClick={() => setSelectedClass(cls)}
                                className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-[0_10px_30px_rgba(0,0,0,0.02)] transition-all hover:shadow-xl hover:-translate-y-1 group text-left relative overflow-hidden"
                            >
                                <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/[0.03] rounded-full -mr-16 -mt-16 group-hover:bg-emerald-500/5 transition-colors"></div>

                                <div className="relative z-10 space-y-6">
                                    <div className="w-14 h-14 rounded-2xl bg-slate-900 flex items-center justify-center text-white shadow-xl group-hover:bg-emerald-600 transition-colors">
                                        <LayoutGrid className="w-6 h-6" />
                                    </div>

                                    <div>
                                        <h3 className="font-black text-xl text-slate-900 uppercase tracking-tighter mb-1">
                                            {cls.name}
                                        </h3>
                                        <div className="flex items-center gap-2">
                                            <Users className="w-3 h-3 text-emerald-500" />
                                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                                                {getStudentCount(cls.id)} Students Registered
                                            </span>
                                        </div>
                                    </div>

                                    <div className="pt-4 flex items-center gap-2 text-[9px] font-black uppercase tracking-widest text-emerald-600 opacity-0 group-hover:opacity-100 transition-all transform translate-y-2 group-hover:translate-y-0">
                                        View Students <Plus className="w-3 h-3" />
                                    </div>
                                </div>
                            </button>
                        ))
                    ) : (
                        <div className="col-span-full bg-white p-20 rounded-[4rem] border border-slate-100 border-dashed flex flex-col items-center justify-center text-center space-y-6">
                            <AlertTriangle className="w-16 h-16 text-slate-200" />
                            <div className="space-y-2">
                                <p className="text-xl font-black text-slate-900 uppercase">No Classes Found</p>
                                <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">You need to create classes first before managing students.</p>
                            </div>
                        </div>
                    )}
                </div>
            ) : (
                // Students List View
                <div className="space-y-6">
                    <div className="bg-white p-4 rounded-[2rem] border border-slate-100 shadow-[0_20px_50px_rgba(0,0,0,0.02)] flex flex-col md:flex-row gap-4 items-center">
                        <div className="relative flex-grow w-full">
                            <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder={`Search students in ${selectedClass.name}...`}
                                className="w-full bg-slate-50/50 border-none rounded-2xl pl-14 pr-6 py-4 text-sm font-bold text-slate-900 focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {loading ? (
                            <div className="col-span-full py-20 flex flex-col items-center gap-4">
                                <Loader2 className="w-12 h-12 animate-spin text-emerald-600" />
                                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Loading Student Records...</p>
                            </div>
                        ) : filteredStudents.length > 0 ? (
                            filteredStudents.map((s) => (
                                <div key={s.id} className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-[0_10px_30px_rgba(0,0,0,0.02)] transition-all hover:shadow-xl hover:-translate-y-1 group relative overflow-hidden">
                                    <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/5 rounded-full -mr-12 -mt-12 group-hover:bg-blue-500/10 transition-colors"></div>

                                    <div className="flex justify-between items-start mb-6 relative z-10">
                                        <div className="w-16 h-16 rounded-[1.5rem] bg-slate-900 flex items-center justify-center text-white text-xl font-black shadow-2xl shadow-slate-900/10 overflow-hidden ring-4 ring-white">
                                            {s.profileImage ? (
                                                <img src={s.profileImage} alt="" className="w-full h-full object-cover" />
                                            ) : (
                                                <span>{s.firstName[0]}{s.lastName[0]}</span>
                                            )}
                                        </div>
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => handleEdit(s)}
                                                className="p-2.5 bg-slate-50 text-slate-400 hover:bg-emerald-50 hover:text-emerald-600 rounded-xl transition-all"
                                            >
                                                <Edit2 className="w-3.5 h-3.5" />
                                            </button>
                                            <button
                                                onClick={() => setShowDeleteConfirm(s.id)}
                                                className="p-2.5 bg-slate-50 text-slate-400 hover:bg-red-50 hover:text-red-500 rounded-xl transition-all"
                                            >
                                                <Trash2 className="w-3.5 h-3.5" />
                                            </button>
                                        </div>
                                    </div>

                                    <div className="space-y-1 relative z-10">
                                        <h3 className="font-black text-lg text-slate-900 tracking-tighter group-hover:text-blue-600 transition-colors uppercase">
                                            {s.firstName} {s.lastName}
                                        </h3>
                                        <div className="flex items-center gap-2">
                                            <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></div>
                                            <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">{s.class?.name || "No Class"}</p>
                                        </div>
                                    </div>

                                    <div className="mt-6 space-y-3 pt-6 border-t border-slate-50 relative z-10">
                                        <div className="flex items-center gap-3 text-[10px] font-bold text-slate-500">
                                            <div className="w-7 h-7 rounded-lg bg-slate-50 flex items-center justify-center">
                                                <Mail className="w-3.5 h-3.5 text-slate-300" />
                                            </div>
                                            <span className="truncate">{s.email}</span>
                                        </div>
                                        <div className="flex items-center gap-3 text-[10px] font-bold text-slate-500">
                                            <div className="w-7 h-7 rounded-lg bg-slate-50 flex items-center justify-center">
                                                <Phone className="w-3.5 h-3.5 text-slate-300" />
                                            </div>
                                            <span>{s.phone || "No phone added"}</span>
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="col-span-full bg-white p-20 rounded-[4rem] border border-slate-100 border-dashed flex flex-col items-center justify-center text-center space-y-6">
                                <div className="bg-slate-50 p-8 rounded-[3rem]">
                                    <GraduationCap className="w-16 h-16 text-slate-200" />
                                </div>
                                <div className="space-y-2">
                                    <p className="text-xl font-black text-slate-900 uppercase">No Students Found</p>
                                    <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">No students registered in this class matching your search.</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}

            <ConfirmModal
                isOpen={!!showDeleteConfirm}
                onClose={() => setShowDeleteConfirm(null)}
                onConfirm={() => showDeleteConfirm && handleDelete(showDeleteConfirm)}
                title="Wipe Record?"
                description="This will permanently delete this student and their academic history."
            />

            <UserModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSuccess={fetchData}
                defaultRole="STUDENT"
                initialData={selectedStudent}
            />
        </div>
    );
}
