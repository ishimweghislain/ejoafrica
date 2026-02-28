"use client";

import { useState, useEffect } from "react";
import { Plus, Book, Clock, ChevronRight, Loader2, Edit2, Trash2, AlertTriangle, X, Layout } from "lucide-react";
import CourseModal from "@/components/CourseModal";
import ConfirmModal from "@/components/ConfirmModal";
import { toast } from "react-hot-toast";
import Link from "next/link";

interface Course {
    id: string;
    title: string;
    classId: string;
    teacherId: string;
    termId: string;
    notation: string;
    class: { name: string };
    teacher: { firstName: string, lastName: string };
    hoursPerWeek: number;
    _count: { topics: number };
    term: { academicYearId: string };
}

export default function CoursesPage() {
    const [courses, setCourses] = useState<Course[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
    const [userRole, setUserRole] = useState<string | null>(null);

    async function fetchUserRole() {
        try {
            const res = await fetch("/api/auth/me");
            const data = await res.json();
            setUserRole(data.role);
        } catch (err) {
            console.error(err);
        }
    }

    async function fetchCourses() {
        try {
            const res = await fetch("/api/courses");
            const data = await res.json();
            setCourses(data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        fetchUserRole();
        fetchCourses();
    }, []);

    const canManage = userRole === "DOS" || userRole === "SCHOOL_ADMIN";

    const handleDelete = async (id: string) => {
        toast.loading("Decommissioning course node...", { id: "delete-course" });
        try {
            const res = await fetch(`/api/courses/${id}`, { method: "DELETE" });
            if (!res.ok) throw new Error("Protocol violation: Deletion refused.");

            toast.success("Course Decommissioned.", { id: "delete-course", icon: "🗑️" });
            fetchCourses();
            setShowDeleteConfirm(null);
        } catch (err) {
            toast.error("Deletion failed.", { id: "delete-course" });
        }
    };

    const handleEdit = (course: Course) => {
        setSelectedCourse(course);
        setIsModalOpen(true);
    };

    const handleAddNew = () => {
        setSelectedCourse(null);
        setIsModalOpen(true);
    };

    return (
        <div className="space-y-10 animate-fade-up">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-1">
                    <h1 className="text-3xl font-black tracking-tight text-slate-900 uppercase tracking-tighter">Course Repository</h1>
                    <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest text-emerald-600">Curriculum Management Systems Architecture</p>
                </div>
                {canManage && (
                    <button
                        onClick={handleAddNew}
                        className="bg-slate-900 text-white rounded-2xl px-8 py-4 font-black uppercase tracking-widest text-[10px] shadow-2xl shadow-slate-900/20 hover:bg-emerald-600 hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-2"
                    >
                        <Plus className="w-5 h-5" />
                        <span>Deploy Course</span>
                    </button>
                )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {loading ? (
                    <div className="col-span-full py-40 flex flex-col items-center gap-4">
                        <Loader2 className="w-12 h-12 animate-spin text-emerald-600" />
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Syncing Architecture...</p>
                    </div>
                ) : courses.length > 0 ? (
                    courses.map((course) => (
                        <div key={course.id} className="bg-white rounded-[2.5rem] p-6 border border-slate-100 shadow-sm hover:shadow-2xl hover:-translate-y-1 transition-all group relative overflow-hidden flex flex-col gap-6">
                            <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/[0.03] rounded-full -mr-12 -mt-12 group-hover:bg-emerald-500/5 transition-colors"></div>

                            <div className="flex items-start justify-between relative z-10">
                                <div className="flex items-center gap-4">
                                    <div className="w-14 h-14 rounded-2xl bg-slate-900 flex items-center justify-center text-white shadow-xl group-hover:scale-110 transition-transform">
                                        <Book className="w-7 h-7" />
                                    </div>
                                    <div className="space-y-0.5">
                                        <h3 className="text-lg font-black text-slate-900 leading-tight tracking-tighter uppercase truncate max-w-[150px]">{course.title}</h3>
                                        <div className="flex items-center gap-2">
                                            <span className="text-[10px] font-black uppercase text-emerald-600 tracking-wider bg-emerald-50 px-2 py-0.5 rounded-lg">{course.class.name}</span>
                                        </div>
                                    </div>
                                </div>
                                {canManage && (
                                    <div className="flex gap-1">
                                        <button onClick={() => handleEdit(course)} className="p-2.5 hover:bg-emerald-50 text-slate-300 hover:text-emerald-600 rounded-xl transition-all border border-transparent hover:border-emerald-100">
                                            <Edit2 className="w-4 h-4" />
                                        </button>
                                        <button onClick={() => setShowDeleteConfirm(course.id)} className="p-2.5 hover:bg-red-50 text-slate-300 hover:text-red-500 rounded-xl transition-all border border-transparent hover:border-red-100">
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                )}
                            </div>

                            <div className="grid grid-cols-2 gap-3 relative z-10">
                                <div className="bg-slate-50/50 p-3.5 rounded-2xl flex items-center gap-3 border border-slate-100/50">
                                    <div className="bg-white p-2 rounded-lg text-emerald-500 shadow-sm">
                                        <Layout className="w-3.5 h-3.5" />
                                    </div>
                                    <span className="text-[9px] font-black uppercase text-slate-500 tracking-widest">{course._count.topics} Topics</span>
                                </div>
                                <div className="bg-slate-50/50 p-3.5 rounded-2xl flex items-center gap-3 border border-slate-100/50">
                                    <div className="bg-white p-2 rounded-lg text-blue-500 shadow-sm">
                                        <Clock className="w-3.5 h-3.5" />
                                    </div>
                                    <span className="text-[9px] font-black uppercase text-slate-500 tracking-widest">{course.hoursPerWeek}H/WK</span>
                                </div>
                            </div>

                            <div className="space-y-4 relative z-10">
                                <div className="flex items-center gap-3 py-2 border-t border-slate-50">
                                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                                    <p className="text-[9px] font-black uppercase text-slate-400 tracking-widest">Lead: {course.teacher.firstName} {course.teacher.lastName}</p>
                                </div>
                                <Link
                                    href={`/dashboard/courses/${course.id}`}
                                    className="flex items-center justify-between p-4 bg-slate-50 text-slate-900 rounded-2xl group/btn transition-all hover:bg-slate-900 hover:text-white"
                                >
                                    <span className="text-[10px] font-black uppercase tracking-widest">Syllabus Access</span>
                                    <ChevronRight className="w-4 h-4 transform group-hover/btn:translate-x-1 transition-transform" />
                                </Link>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="col-span-full py-32 bg-white rounded-[4rem] border border-dashed border-slate-200 flex flex-col items-center justify-center text-center space-y-8">
                        <div className="bg-slate-50 p-8 rounded-[3rem]">
                            <Book className="w-16 h-16 text-slate-200" />
                        </div>
                        <div className="space-y-2">
                            <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tighter">No Syllabus Found</h3>
                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Curriculum engine zero records.</p>
                        </div>
                        {canManage && (
                            <button onClick={handleAddNew} className="bg-slate-900 text-white px-10 py-5 rounded-3xl font-black uppercase tracking-widest text-[10px] hover:bg-emerald-600 transition-all shadow-xl shadow-slate-200">Engineer First Course</button>
                        )}
                    </div>
                )}
            </div>

            <ConfirmModal
                isOpen={!!showDeleteConfirm}
                onClose={() => setShowDeleteConfirm(null)}
                onConfirm={() => showDeleteConfirm && handleDelete(showDeleteConfirm)}
                title="Wipe Course?"
                description="All topics, assignments and grades associated with this curriculum node will be permanently decommissioned."
            />

            <CourseModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSuccess={fetchCourses}
                initialData={selectedCourse}
            />
        </div>
    );
}
