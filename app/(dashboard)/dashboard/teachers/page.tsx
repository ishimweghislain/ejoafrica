import { prisma } from "@/lib/db";
import { Plus, User, Search, Mail, Phone, MoreHorizontal, Shield } from "lucide-react";

export default async function TeachersPage() {
    const teachers = await prisma.user.findMany({
        where: { role: 'TEACHER' },
        orderBy: { createdAt: 'desc' }
    });

    return (
        <div className="space-y-8 animate-fade-up">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-gray-900">Education Staff</h1>
                    <p className="text-gray-500 text-sm">Manage and monitor all teachers in the institution.</p>
                </div>
                <button className="btn-primary flex items-center justify-center gap-2">
                    <Plus className="w-5 h-5" />
                    <span>Add New Teacher</span>
                </button>
            </div>

            {/* Stats row for teachers */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
                    <div className="bg-emerald-50 p-3 rounded-xl text-emerald-600">
                        <User className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-[10px] font-black uppercase text-gray-400">Total Teachers</p>
                        <p className="text-2xl font-bold">{teachers.length}</p>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
                    <div className="bg-blue-50 p-3 rounded-xl text-blue-600">
                        <Shield className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-[10px] font-black uppercase text-gray-400">Active Licenses</p>
                        <p className="text-2xl font-bold">{teachers.length}</p>
                    </div>
                </div>
            </div>

            {/* Filter / Search */}
            <div className="bg-white p-4 rounded-2xl border border-gray-100 flex flex-col md:flex-row gap-4 items-center shadow-sm">
                <div className="relative flex-grow w-full">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search teachers by name, email, or subject..."
                        className="w-full bg-gray-50 border-none rounded-xl pl-11 pr-4 py-3 text-sm focus:ring-2 focus:ring-emerald-500/20 outline-none"
                    />
                </div>
            </div>

            {/* Teachers Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {teachers.map((t) => (
                    <div key={t.id} className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm transition-all hover:shadow-xl hover:-translate-y-1 group">
                        <div className="flex justify-between items-start mb-6">
                            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white text-xl font-bold shadow-lg shadow-emerald-200">
                                {t.profileImage ? (
                                    <img src={t.profileImage} alt="" className="w-full h-full object-cover rounded-2xl" />
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
                            <p className="text-[10px] font-black uppercase text-emerald-600 tracking-widest">{t.school || "Faculty of Science"}</p>
                        </div>

                        <div className="mt-6 space-y-3 pt-6 border-t border-gray-50">
                            <div className="flex items-center gap-3 text-xs text-gray-500">
                                <Mail className="w-4 h-4 text-gray-300" />
                                <span>{t.email}</span>
                            </div>
                            <div className="flex items-center gap-3 text-xs text-gray-500">
                                <Phone className="w-4 h-4 text-gray-300" />
                                <span>{t.phone || "+250 123 456 789"}</span>
                            </div>
                        </div>

                        <div className="mt-6 flex gap-2">
                            <button className="flex-grow bg-emerald-50 text-emerald-600 py-3 rounded-xl text-xs font-bold hover:bg-emerald-100 transition-colors">
                                View Schedule
                            </button>
                            <button className="px-4 bg-gray-50 text-gray-400 py-3 rounded-xl text-xs font-bold hover:bg-gray-100 transition-colors">
                                Profile
                            </button>
                        </div>
                    </div>
                ))}

                {/* Example card if none exist yet */}
                {teachers.length === 0 && (
                    <div className="bg-white p-6 rounded-[2rem] border border-gray-100 border-dashed flex flex-col items-center justify-center text-center space-y-4 py-12">
                        <div className="bg-gray-50 p-6 rounded-full">
                            <User className="w-10 h-10 text-gray-200" />
                        </div>
                        <div className="space-y-1">
                            <p className="text-sm font-bold text-gray-600">No Teachers Found</p>
                            <p className="text-xs text-gray-400 max-w-[200px]">Add your staff members to get started with scheduling.</p>
                        </div>
                        <button className="bg-emerald-600 text-white px-6 py-2 rounded-xl text-xs font-bold shadow-lg shadow-emerald-200">Add First Staff</button>
                    </div>
                )}
            </div>
        </div>
    );
}
