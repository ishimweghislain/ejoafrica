"use client";

import { useState, useEffect } from "react";
import { Plus, Book, Clock, MapPin, ChevronRight, Search, Layout, Loader2 } from "lucide-react";
import CourseModal from "@/components/CourseModal";

interface Course {
    id: string;
    title: string;
    class: { name: string };
    teacher: { firstName: string, lastName: string };
    hoursPerWeek: number;
    _count: { topics: number };
}

export default function CoursesPage() {
    const [courses, setCourses] = useState<Course[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);

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

    return (
        <div className="space-y-8 animate-fade-up">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-gray-900">Curriculum Engine</h1>
                    <p className="text-gray-500 text-sm">Design and distribute high-quality educational content.</p>
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="btn-primary flex items-center justify-center gap-2"
                >
                    <Plus className="w-5 h-5" />
                    <span>New Course</span>
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {loading ? (
                    <div className="col-span-full py-20 flex justify-center">
                        <Loader2 className="w-10 h-10 animate-spin text-emerald-600" />
                    </div>
                ) : courses.length > 0 ? (
                    courses.map((course) => (
                        <div key={course.id} className="bg-white rounded-[2.5rem] p-4 border border-gray-100 shadow-sm hover:shadow-xl transition-all group cursor-pointer flex gap-6">
                            <div className="w-40 h-40 rounded-[2rem] bg-gray-50 relative overflow-hidden flex-shrink-0">
                                <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 to-teal-500/10 flex items-center justify-center">
                                    <Book className="w-12 h-12 text-emerald-600/20" />
                                </div>
                                <div className="absolute bottom-4 left-4">
                                    <span className="bg-white text-emerald-600 px-3 py-1 rounded-full text-[10px] font-black shadow-sm uppercase">{course.class.name}</span>
                                </div>
                            </div>

                            <div className="flex-grow py-4 pr-4 space-y-4">
                                <div className="space-y-1">
                                    <h3 className="text-xl font-bold group-hover:text-emerald-600 transition-colors leading-tight">{course.title}</h3>
                                    <p className="text-xs text-gray-400">
                                        Teacher: {course.teacher.firstName} {course.teacher.lastName}
                                    </p>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="flex items-center gap-2">
                                        <Layout className="w-4 h-4 text-emerald-500" />
                                        <span className="text-xs font-bold text-gray-500">{course._count.topics} Topics</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Clock className="w-4 h-4 text-blue-500" />
                                        <span className="text-xs font-bold text-gray-500">{course.hoursPerWeek}h/week</span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center">
                                <ChevronRight className="w-6 h-6 text-gray-200 group-hover:text-emerald-600 transition-all" />
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="lg:col-span-2 py-32 bg-gray-50/50 rounded-[3rem] border border-dashed border-gray-200 flex flex-col items-center justify-center text-center space-y-6">
                        <Layout className="w-12 h-12 text-gray-200" />
                        <h3 className="text-xl font-bold text-gray-600">No Courses Engineered</h3>
                        <button onClick={() => setIsModalOpen(true)} className="btn-primary">Initialize Syllabus</button>
                    </div>
                )}
            </div>

            <CourseModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSuccess={fetchCourses}
            />
        </div>
    );
}
