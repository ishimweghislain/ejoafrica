"use client";

import { useState, useEffect } from "react";
import { Plus, Search, Loader2, LayoutGrid, Edit2, Trash2 } from "lucide-react";

interface ClassType {
    id: string;
    name: string;
}

export default function ClassesPage() {
    const [classes, setClasses] = useState<ClassType[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [className, setClassName] = useState("");
    const [error, setError] = useState("");

    async function fetchClasses() {
        try {
            const res = await fetch("/api/classes");
            const data = await res.json();
            setClasses(data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        fetchClasses();
    }, []);

    async function handleAddClass(e: React.FormEvent) {
        e.preventDefault();
        setError("");
        try {
            const res = await fetch("/api/classes", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name: className }),
            });
            if (!res.ok) throw new Error("Failed to add class");
            setClassName("");
            setIsModalOpen(false);
            fetchClasses();
        } catch (err: any) {
            setError(err.message);
        }
    }

    return (
        <div className="space-y-8 animate-fade-up">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-gray-900">Academic Classes</h1>
                    <p className="text-gray-500 text-sm">Organize students into specific class levels.</p>
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="btn-primary flex items-center justify-center gap-2"
                >
                    <Plus className="w-5 h-5" />
                    <span>New Class</span>
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {loading ? (
                    <div className="col-span-full py-20 flex justify-center">
                        <Loader2 className="w-10 h-10 animate-spin text-emerald-600" />
                    </div>
                ) : classes.length > 0 ? (
                    classes.map((cls) => (
                        <div key={cls.id} className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm flex flex-col items-center text-center gap-4 group hover:shadow-xl transition-all">
                            <div className="bg-emerald-50 w-16 h-16 rounded-2xl flex items-center justify-center text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition-all">
                                <LayoutGrid className="w-8 h-8" />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold">{cls.name}</h3>
                                <p className="text-xs text-gray-400 mt-1 uppercase font-black tracking-widest text-[9px]">Class Level</p>
                            </div>
                            <div className="flex gap-2 mt-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button className="p-2 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-emerald-600"><Edit2 className="w-4 h-4" /></button>
                                <button className="p-2 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-red-500"><Trash2 className="w-4 h-4" /></button>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="col-span-full py-32 text-center text-gray-400 border-2 border-dashed rounded-[3rem]">
                        <p className="font-bold">No classes defined yet.</p>
                    </div>
                )}
            </div>

            {isModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setIsModalOpen(false)} />
                    <form onSubmit={handleAddClass} className="relative bg-white w-full max-w-md rounded-3xl p-8 shadow-2xl animate-fade-up space-y-6">
                        <h3 className="text-xl font-bold">Add New Class</h3>
                        {error && <p className="text-red-500 text-xs">{error}</p>}
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Class Name</label>
                            <input
                                required
                                className="w-full bg-gray-50 border-none rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-emerald-500/20 outline-none"
                                placeholder="e.g. Senior 1A"
                                value={className}
                                onChange={(e) => setClassName(e.target.value)}
                            />
                        </div>
                        <button type="submit" className="w-full btn-primary py-4">Create Class</button>
                    </form>
                </div>
            )}
        </div>
    );
}
