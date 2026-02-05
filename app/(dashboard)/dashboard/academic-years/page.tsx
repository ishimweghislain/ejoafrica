import { prisma } from "@/lib/db";
import { Plus, Calendar, MoreVertical, Search, Edit2, Trash2 } from "lucide-react";

export default async function AcademicYearsPage() {
    const academicYears = await prisma.academicYear.findMany({
        orderBy: { startDate: 'desc' }
    });

    return (
        <div className="space-y-8 animate-fade-up">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-gray-900">Academic Years</h1>
                    <p className="text-gray-500 text-sm">Manage calendars and terms for your institution.</p>
                </div>
                <button className="btn-primary flex items-center justify-center gap-2">
                    <Plus className="w-5 h-5" />
                    <span>New Academic Year</span>
                </button>
            </div>

            {/* Filter Bar */}
            <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex flex-col md:flex-row gap-4 items-center">
                <div className="relative flex-grow w-full">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search academic years..."
                        className="w-full bg-gray-50 border-none rounded-xl pl-11 pr-4 py-3 text-sm focus:ring-2 focus:ring-emerald-500/20 outline-none"
                    />
                </div>
                <div className="flex gap-2 w-full md:w-auto">
                    <select className="bg-gray-50 border-none rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-emerald-500/20 outline-none min-w-[120px]">
                        <option>All Status</option>
                        <option>Active</option>
                        <option>Completed</option>
                    </select>
                </div>
            </div>

            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50/50">
                                <th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-gray-400">Year Title</th>
                                <th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-gray-400">Start Date</th>
                                <th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-gray-400">End Date</th>
                                <th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-gray-400">Status</th>
                                <th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-gray-400">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {academicYears.length > 0 ? (
                                academicYears.map((year) => (
                                    <tr key={year.id} className="hover:bg-gray-50/50 transition-colors group">
                                        <td className="px-6 py-5">
                                            <div className="flex items-center gap-3">
                                                <div className="bg-emerald-50 p-2 rounded-lg text-emerald-600 transition-colors group-hover:bg-emerald-600 group-hover:text-white">
                                                    <Calendar className="w-5 h-5" />
                                                </div>
                                                <span className="font-bold text-gray-700">{year.title}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5 text-sm text-gray-500">{year.startDate.toLocaleDateString()}</td>
                                        <td className="px-6 py-5 text-sm text-gray-500">{year.endDate.toLocaleDateString()}</td>
                                        <td className="px-6 py-5">
                                            <span className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-[10px] font-black uppercase tracking-tight">Active</span>
                                        </td>
                                        <td className="px-6 py-5">
                                            <div className="flex items-center gap-2">
                                                <button className="p-2 hover:bg-white rounded-lg text-gray-400 hover:text-emerald-600 transition-all border border-transparent hover:border-gray-100"><Edit2 className="w-4 h-4" /></button>
                                                <button className="p-2 hover:bg-white rounded-lg text-gray-400 hover:text-red-500 transition-all border border-transparent hover:border-gray-100"><Trash2 className="w-4 h-4" /></button>
                                                <button className="p-2 hover:bg-white rounded-lg text-gray-400 transition-all border border-transparent hover:border-gray-100"><MoreVertical className="w-4 h-4" /></button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={5} className="px-6 py-20 text-center">
                                        <div className="flex flex-col items-center gap-4 text-gray-400">
                                            <Calendar className="w-12 h-12 opacity-20" />
                                            <div>
                                                <p className="font-bold text-gray-600">No Academic Years Found</p>
                                                <p className="text-sm">Get started by creating your first academic calendar.</p>
                                            </div>
                                            <button className="bg-emerald-50 text-emerald-600 px-6 py-2 rounded-xl text-sm font-bold mt-2 hover:bg-emerald-100 transition-colors">
                                                Add Academic Year
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
