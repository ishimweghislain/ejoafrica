import { prisma } from "@/lib/db";
import { Plus, Book, Clock, MapPin, ChevronRight, Search, Layout } from "lucide-react";

export default async function CoursesPage() {
    const courses = await prisma.course.findMany({
        include: {
            class: true,
            teacher: true,
            _count: {
                select: { topics: true }
            }
        },
        orderBy: { title: 'asc' }
    });

    return (
        <div className="space-y-8 animate-fade-up">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-gray-900">Curriculum Engine</h1>
                    <p className="text-gray-500 text-sm">Design and distribute high-quality educational content.</p>
                </div>
                <button className="btn-primary flex items-center justify-center gap-2">
                    <Plus className="w-5 h-5" />
                    <span>New Course</span>
                </button>
            </div>

            {/* Course Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                    <p className="text-[10px] font-black uppercase text-gray-400 mb-1">Total Courses</p>
                    <p className="text-2xl font-bold">{courses.length}</p>
                </div>
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                    <p className="text-[10px] font-black uppercase text-gray-400 mb-1">Subjects Covered</p>
                    <p className="text-2xl font-bold">14</p>
                </div>
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                    <p className="text-[10px] font-black uppercase text-gray-400 mb-1">Total Lessons</p>
                    <p className="text-2xl font-bold">1,248</p>
                </div>
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                    <p className="text-[10px] font-black uppercase text-gray-400 mb-1">Syllabus Completion</p>
                    <p className="text-2xl font-bold text-emerald-600">82%</p>
                </div>
            </div>

            <div className="bg-white p-4 rounded-3xl border border-gray-100 shadow-sm space-y-4">
                <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search curricula by title or class..."
                        className="w-full bg-gray-50 border-none rounded-2xl pl-11 pr-4 py-4 text-sm focus:ring-2 focus:ring-emerald-500/20 outline-none font-medium"
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {courses.map((course) => (
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
                                <p className="text-xs text-gray-400 flex items-center gap-2">
                                    <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
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

                            <div className="pt-2">
                                <div className="h-1.5 w-full bg-gray-50 rounded-full overflow-hidden">
                                    <div className="h-full bg-emerald-500 w-[65%]" />
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center">
                            <div className="p-3 rounded-2xl group-hover:bg-emerald-50 text-gray-300 group-hover:text-emerald-600 transition-all">
                                <ChevronRight className="w-6 h-6" />
                            </div>
                        </div>
                    </div>
                ))}

                {courses.length === 0 && (
                    <div className="lg:col-span-2 py-32 bg-gray-50/50 rounded-[3rem] border border-dashed border-gray-200 flex flex-col items-center justify-center text-center space-y-6">
                        <div className="bg-white p-8 rounded-full shadow-sm">
                            <Layout className="w-12 h-12 text-gray-200" />
                        </div>
                        <div className="space-y-2">
                            <h3 className="text-xl font-bold text-gray-600">No Courses Engineered</h3>
                            <p className="text-sm text-gray-400 max-w-sm">Start building your school's curriculum by adding subjects and organizing them into topics and units.</p>
                        </div>
                        <button className="btn-primary">Initialize Syllabus</button>
                    </div>
                )}
            </div>
        </div>
    );
}
