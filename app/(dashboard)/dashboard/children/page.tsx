"use client";

import { useState, useEffect } from "react";
import { Users, GraduationCap, Calendar, Book, Shield, ArrowRight, UserCircle, Loader2 } from "lucide-react";
import { toast } from "react-hot-toast";

export default function MyChildrenPage() {
    const [loading, setLoading] = useState(true);
    const [children, setChildren] = useState<any[]>([]);

    async function fetchChildren() {
        try {
            // Fetch profile including children
            const res = await fetch("/api/auth/me");
            const data = await res.json();
            // Assuming children are linked to the parent user
            // In a real app, we'd have a ParentChild table or relation
            // For now, let's fetch students who list this user as parent
            const cRes = await fetch(`/api/users?role=STUDENT&parentId=${data.id}`);
            const cData = await cRes.json();
            setChildren(Array.isArray(cData) ? cData : []);
        } catch (err) {
            toast.error("Failed to sync dependent nodes.");
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        fetchChildren();
    }, []);

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-40 gap-4">
                <Loader2 className="w-12 h-12 animate-spin text-emerald-600" />
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Syncing Dependent Nodes...</p>
            </div>
        );
    }

    return (
        <div className="space-y-10 animate-fade-up">
            <div className="space-y-1">
                <h1 className="text-3xl font-black tracking-tight text-slate-900 uppercase tracking-tighter">Dependent Portfolios</h1>
                <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest text-emerald-600">Monitor academic progress and conduct for linked student nodes.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {children.length > 0 ? children.map(child => (
                    <div key={child.id} className="bg-white rounded-[3.5rem] border border-slate-100 shadow-sm overflow-hidden group hover:shadow-2xl transition-all">
                        <div className="bg-slate-900 p-10 text-white relative">
                            <div className="absolute top-0 right-0 w-40 h-40 bg-emerald-500/10 rounded-full blur-[60px] -mr-20 -mt-20"></div>

                            <div className="relative z-10 flex items-center gap-6">
                                <div className="w-20 h-20 rounded-[2rem] bg-emerald-500 flex items-center justify-center text-white shadow-2xl">
                                    <UserCircle className="w-12 h-12" />
                                </div>
                                <div>
                                    <h3 className="text-2xl font-black uppercase tracking-tighter leading-tight">{child.firstName} {child.lastName}</h3>
                                    <div className="flex items-center gap-3 mt-1">
                                        <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400">Student Node</span>
                                        <span className="w-1 h-1 bg-slate-700 rounded-full"></span>
                                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{child.class?.name || "Unassigned"}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="p-10 grid grid-cols-2 gap-6">
                            <div className="bg-slate-50 p-6 rounded-3xl space-y-2 group-hover:bg-emerald-50 transition-colors">
                                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Discipline Score</p>
                                <h4 className="text-2xl font-black text-slate-900">{child.disciplineMarks || 40} / 40</h4>
                            </div>
                            <div className="bg-slate-50 p-6 rounded-3xl space-y-2 hover:bg-emerald-50 transition-colors">
                                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Academic Rank</p>
                                <h4 className="text-2xl font-black text-slate-900">#12 / 45</h4>
                            </div>

                            <button className="col-span-2 bg-slate-50 border border-slate-100 py-5 rounded-[2rem] flex items-center justify-center gap-4 text-xs font-black uppercase tracking-widest hover:bg-slate-900 hover:text-white transition-all shadow-sm">
                                <ArrowRight className="w-5 h-5" />
                                <span>Access Full Performance Schema</span>
                            </button>
                        </div>
                    </div>
                )) : (
                    <div className="col-span-full py-40 flex flex-col items-center gap-6 bg-white rounded-[4rem] border border-dashed border-slate-200">
                        <Users className="w-16 h-16 text-slate-200" />
                        <div className="text-center space-y-2">
                            <p className="font-black text-slate-900 uppercase tracking-tighter text-xl">No Linked Nodes</p>
                            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">There are no student identities linked to your guardian portfolio.</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
