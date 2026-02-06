"use client";

import { useState, useEffect } from "react";
import { Plus, Book, Clock, ChevronRight, Loader2, Edit2, Trash2, AlertTriangle, X, Layout } from "lucide-react";
import CourseModal from "@/components/CourseModal";
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
        fetchCourses();
    }, []);

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
        <div className="space-y-8 animate-fade-up">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-1">
                    <h1 className="text-3xl font-black tracking-tight text-slate-900 uppercase tracking-tighter">Curriculum Engine</h1>
                    <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest">Design and distribute high-quality institutional educational content.</p>
                </div>
                <button
                    onClick={handleAddNew}
                    className="bg-emerald-600 text-white rounded-2xl px-8 py-4 font-black uppercase tracking-widest text-[10px] shadow-xl shadow-emerald-600/20 hover:bg-emerald-500 hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-2"
                >
                    <Plus className="w-5 h-5" />
                    <span>Engineer New Course</span>
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {loading ? (
                    <div className="col-span-full py-20 flex flex-col items-center gap-4">
                        <Loader2 className="w-12 h-12 animate-spin text-emerald-600" />
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Syncing Syllabus Architecture...</p>
                    </div>
                ) : courses.length > 0 ? (
                    courses.map((course) => (
                        <div key={course.id} className="bg-white rounded-[3rem] p-6 border border-slate-100 shadow-[0_20px_50px_rgba(0,0,0,0.02)] hover:shadow-2xl transition-all group relative overflow-hidden flex flex-col sm:flex-row gap-8">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full -mr-16 -mt-16 group-hover:bg-emerald-500/10 transition-colors"></div>

                            <div className="w-full sm:w-48 h-48 rounded-[2.5rem] bg-slate-900 relative overflow-hidden flex-shrink-0 shadow-2xl">
                                <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/20 to-transparent flex items-center justify-center">
                                    <Book className="w-16 h-16 text-white/10 group-hover:scale-110 transition-transform" />
                                </div>
                                <div className="absolute bottom-6 left-6">
                                    <span className="bg-white/10 backdrop-blur-md text-white border border-white/10 px-4 py-2 rounded-2xl text-[10px] font-black shadow-sm uppercase tracking-widest">{course.class.name}</span>
                                </div>
                            </div>

                            <div className="flex-grow py-4 space-y-6 relative z-10">
                                <div className="flex justify-between items-start">
                                    <div className="space-y-2">
                                        <h3 className="text-2xl font-black text-slate-900 leading-tight group-hover:text-emerald-600 transition-colors tracking-tighter uppercase">{course.title}</h3>
                                        <div className="flex items-center gap-2">
                                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                                            <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">
                                                Facilitator: {course.teacher.firstName} {course.teacher.lastName}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => handleEdit(course)}
                                            className="p-3 bg-slate-50 text-slate-400 hover:bg-emerald-50 hover:text-emerald-600 rounded-2xl transition-all"
                                        >
                                            <Edit2 className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => setShowDeleteConfirm(course.id)}
                                            className="p-3 bg-slate-50 text-slate-400 hover:bg-red-50 hover:text-red-500 rounded-2xl transition-all"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="bg-slate-50/50 p-4 rounded-3xl flex items-center gap-3">
                                        <div className="bg-white p-2 rounded-xl text-emerald-500 shadow-sm">
                                            <Layout className="w-4 h-4" />
                                        </div>
                                        <span className="text-[10px] font-black uppercase text-slate-500 tracking-widest">{course._count.topics} Topics</span>
                                    </div>
                                    <div className="bg-slate-50/50 p-4 rounded-3xl flex items-center gap-3">
                                        <div className="bg-white p-2 rounded-xl text-blue-500 shadow-sm">
                                            <Clock className="w-4 h-4" />
                                        </div>
                                        <span className="text-[10px] font-black uppercase text-slate-500 tracking-widest">{course.hoursPerWeek}h/Week</span>
                                    </div>
                                </div>

                                <Link
                                    href={`/dashboard/courses/${course.id}`}
                                    className="flex items-center justify-between p-5 bg-slate-900 text-white rounded-[2rem] group/btn transition-all hover:bg-emerald-600 shadow-2xl shadow-slate-200"
                                >
                                    <span className="text-[10px] font-black uppercase tracking-widest">Expand Syllabus</span>
                                    <ChevronRight className="w-5 h-5 transform group-hover/btn:translate-x-1 transition-transform" />
                                </Link>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="lg:col-span-2 py-32 bg-white rounded-[4rem] border border-dashed border-slate-200 flex flex-col items-center justify-center text-center space-y-8">
                        <div className="bg-slate-50 p-8 rounded-[3rem]">
                            <Layout className="w-16 h-16 text-slate-200" />
                        </div>
                        <div className="space-y-2">
                            <h3 className="text-2xl font-black text-slate-900 uppercase">No Courses Engineered</h3>
                            <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Initialize institutional syllabus nodes to populate records.</p>
                        </div>
                        <button onClick={handleAddNew} className="bg-slate-900 text-white px-10 py-5 rounded-3xl font-black uppercase tracking-widest text-[10px] hover:bg-emerald-600 transition-all">Initialize Syllabus</button>
                    </div>
                )}
            </div>

            {/* Delete Confirmation Modal */}
            {showDeleteConfirm && (
                <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
                    <div
                        className="absolute inset-0 bg-slate-900/60"
                        onClick={() => setShowDeleteConfirm(null)}
                    />
                    <div className="relative bg-white rounded-[2.5rem] p-10 max-w-sm w-full shadow-2xl animate-fade-up border border-slate-100">
                        <div className="flex flex-col items-center text-center space-y-6">
                            <div className="bg-red-50 p-6 rounded-[2.5rem] text-red-500 shadow-xl shadow-red-500/10">
                                <AlertTriangle className="w-10 h-10" />
                            </div>
                            <div className="space-y-3">
                                <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tighter leading-tight">Wipe Course?</h3>
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest leading-relaxed">
                                    All topics, assignments and grades associated with this curriculum node will be permanently decommissioned.
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

            <CourseModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSuccess={fetchCourses}
                initialData={selectedCourse}
            />
        </div>
    );
}
