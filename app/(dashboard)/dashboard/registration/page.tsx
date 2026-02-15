"use client";

import { useState, useEffect } from "react";
import { UserPlus, Search, Loader2, Users, GraduationCap, Briefcase, Shield, UserCircle, Edit2, Trash2 } from "lucide-react";
import { toast } from "react-hot-toast";
import UserModal from "@/components/UserModal";
import ConfirmModal from "@/components/ConfirmModal";

interface UserType {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    role: string;
    school: string;
    phone?: string;
}

export default function RegistrationPage() {
    const [users, setUsers] = useState<UserType[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [activeTab, setActiveTab] = useState("ALL");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState<UserType | null>(null);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);

    async function fetchUsers() {
        try {
            const res = await fetch("/api/users?role=ALL");
            const data = await res.json();
            setUsers(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error(err);
            toast.error("Failed to load users.");
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        fetchUsers();
    }, []);

    const filteredUsers = users.filter(user => {
        const matchesSearch =
            (user.firstName || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
            (user.lastName || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
            (user.email || "").toLowerCase().includes(searchQuery.toLowerCase());

        const matchesTab = activeTab === "ALL" || user.role === activeTab;

        return matchesSearch && matchesTab;
    });

    const handleEdit = (user: UserType) => {
        setSelectedUser(user);
        setIsModalOpen(true);
    };

    const handleDelete = async (id: string) => {
        const tid = toast.loading("Deleting user...");
        try {
            const res = await fetch(`/api/users/${id}`, { method: "DELETE" });
            if (!res.ok) throw new Error("Could not delete user.");
            toast.success("User deleted successfully.", { id: tid });
            fetchUsers();
            setShowDeleteConfirm(null);
        } catch (err: any) {
            toast.error(`Error: ${err.message}`, { id: tid });
        }
    };

    const roles = [
        { id: "ALL", label: "All Users", icon: <Users className="w-4 h-4" /> },
        { id: "STUDENT", label: "Students", icon: <GraduationCap className="w-4 h-4" /> },
        { id: "TEACHER", label: "Teachers", icon: <Briefcase className="w-4 h-4" /> },
        { id: "SCHOOL_ADMIN", label: "Admins", icon: <Shield className="w-4 h-4" /> },
        { id: "PARENT", label: "Parents", icon: <UserCircle className="w-4 h-4" /> },
    ];

    return (
        <div className="space-y-10 animate-fade-up">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-1">
                    <h1 className="text-3xl font-black tracking-tight text-slate-900 uppercase tracking-tighter">User Management</h1>
                    <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest text-emerald-600">Create and manage accounts for students, teachers, and staff.</p>
                </div>
                <button
                    onClick={() => { setSelectedUser(null); setIsModalOpen(true); }}
                    className="bg-slate-900 text-white rounded-2xl px-10 py-5 font-black uppercase tracking-widest text-[10px] shadow-2xl shadow-slate-900/20 hover:bg-emerald-600 hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-3"
                >
                    <UserPlus className="w-5 h-5" />
                    <span>Add New User</span>
                </button>
            </div>

            <div className="flex flex-col md:flex-row gap-6 items-center justify-between bg-white p-4 rounded-[2rem] border border-slate-100 shadow-sm">
                <div className="flex flex-wrap gap-2">
                    {roles.map(role => (
                        <button
                            key={role.id}
                            onClick={() => setActiveTab(role.id)}
                            className={`flex items-center gap-2 px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === role.id
                                ? "bg-emerald-600 text-white shadow-lg shadow-emerald-600/20"
                                : "text-slate-400 hover:bg-slate-50 hover:text-slate-600"
                                }`}
                        >
                            {role.icon}
                            {role.label}
                        </button>
                    ))}
                </div>
                <div className="relative w-full md:w-72">
                    <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                    <input
                        placeholder="Search users..."
                        className="w-full bg-slate-50/50 border border-slate-100 rounded-[1.5rem] pl-12 pr-6 py-3 text-xs font-bold focus:ring-4 focus:ring-emerald-500/5 focus:bg-white outline-none transition-all"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                {loading ? (
                    <div className="col-span-full py-40 flex flex-col items-center gap-4">
                        <Loader2 className="w-12 h-12 animate-spin text-emerald-600" />
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Loading users...</p>
                    </div>
                ) : filteredUsers.length > 0 ? (
                    filteredUsers.map(user => (
                        <div key={user.id} className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-2xl hover:-translate-y-1 transition-all group relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/[0.03] rounded-full -mr-16 -mt-16 group-hover:bg-emerald-500/5 transition-colors"></div>

                            <div className="flex items-start justify-between mb-6 relative z-10">
                                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-white shadow-xl ${user.role === 'SCHOOL_ADMIN' ? 'bg-slate-900' :
                                    user.role === 'TEACHER' ? 'bg-blue-600' :
                                        user.role === 'PARENT' ? 'bg-purple-600' : 'bg-emerald-600'
                                    } group-hover:scale-110 transition-transform`}>
                                    <UserCircle className="w-8 h-8" />
                                </div>
                                <div className="flex gap-1">
                                    <button onClick={() => handleEdit(user)} className="p-3 hover:bg-emerald-50 text-slate-300 hover:text-emerald-600 rounded-xl transition-all">
                                        <Edit2 className="w-4 h-4" />
                                    </button>
                                    <button onClick={() => setShowDeleteConfirm(user.id)} className="p-3 hover:bg-red-50 text-slate-300 hover:text-red-500 rounded-xl transition-all">
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>

                            <div className="space-y-1 relative z-10">
                                <h3 className="font-black text-slate-900 text-lg leading-tight uppercase tracking-tighter">
                                    {user.firstName} {user.lastName}
                                </h3>
                                <p className="text-[10px] font-black uppercase tracking-widest text-emerald-600">{user.role.replace('_', ' ')}</p>
                            </div>

                            <div className="mt-6 pt-6 border-t border-slate-50 space-y-3 relative z-10">
                                <div className="flex items-center gap-3">
                                    <div className="w-1.5 h-1.5 rounded-full bg-slate-200"></div>
                                    <p className="text-[10px] font-bold text-slate-400 truncate tracking-wider">{user.email}</p>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-400"></div>
                                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{user.school || "Lycée de Kigali"}</p>
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="col-span-full py-40 flex flex-col items-center gap-6 bg-white rounded-[4rem] border border-dashed border-slate-200">
                        <Users className="w-16 h-16 text-slate-200" />
                        <div className="text-center space-y-2">
                            <p className="font-black text-slate-900 uppercase tracking-tighter text-xl">No Users Found</p>
                            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Clear filters or add a new user account.</p>
                        </div>
                    </div>
                )}
            </div>

            <UserModal
                isOpen={isModalOpen}
                onClose={() => { setIsModalOpen(false); setSelectedUser(null); }}
                onSuccess={fetchUsers}
                initialData={selectedUser}
            />

            <ConfirmModal
                isOpen={!!showDeleteConfirm}
                onClose={() => setShowDeleteConfirm(null)}
                onConfirm={() => showDeleteConfirm && handleDelete(showDeleteConfirm)}
                title="Delete User?"
                description="This will permanently remove this user's account and access."
            />
        </div>
    );
}
