"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { X, Loader2, Book, Layers, FolderPlus, FilePlus } from "lucide-react";
import { toast } from "react-hot-toast";

type CurriculumType = "TOPIC" | "SUBTOPIC" | "UNIT";

interface CurriculumModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    type: CurriculumType;
    parentId: string; // Course ID for TOPIC, Topic ID for SUBTOPIC, Subtopic ID for UNIT
    initialData?: any; // If provided, we are editing
}

export default function CurriculumModal({ isOpen, onClose, onSuccess, type, parentId, initialData }: CurriculumModalProps) {
    const [mounted, setMounted] = useState(false);
    useEffect(() => { setMounted(true); }, []);

    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        title: "",
        periods: "1",
        knowledge: "",
        skills: "",
        attitudes: "",
    });

    useEffect(() => {
        if (isOpen) {
            if (initialData) {
                setFormData({
                    title: initialData.title || "",
                    periods: initialData.periods?.toString() || "1",
                    knowledge: initialData.knowledge || "",
                    skills: initialData.skills || "",
                    attitudes: initialData.attitudes || "",
                });
            } else {
                setFormData({ title: "", periods: "1", knowledge: "", skills: "", attitudes: "" });
            }
        }
    }, [isOpen, initialData]);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setLoading(true);
        const action = initialData ? "Updating" : "Provisioning";
        const tid = toast.loading(`${action} ${type.toLowerCase()} node...`);

        try {
            const baseEndpoint = type === "TOPIC" ? "/api/topics" : type === "SUBTOPIC" ? "/api/subtopics" : "/api/units";
            const endpoint = initialData ? `${baseEndpoint}/${initialData.id}` : baseEndpoint;
            const method = initialData ? "PATCH" : "POST";

            const payload = {
                title: formData.title,
                ...(!initialData && type === "TOPIC" && { courseId: parentId }),
                ...(!initialData && type === "SUBTOPIC" && { topicId: parentId }),
                ...(!initialData && type === "UNIT" && { subtopicId: parentId }),
                ...(type === "UNIT" && {
                    periods: formData.periods,
                    knowledge: formData.knowledge,
                    skills: formData.skills,
                    attitudes: formData.attitudes
                }),
            };

            const res = await fetch(endpoint, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            if (!res.ok) throw new Error("Protocol rejection.");

            toast.success(`${type} Node ${initialData ? 'Updated' : 'Integrated'}.`, { id: tid, icon: "✅" });
            onSuccess();
            onClose();
        } catch (err: any) {
            toast.error(`ERROR: ${err.message}`, { id: tid });
        } finally {
            setLoading(false);
        }
    }

    if (!isOpen || !mounted) return null;

    const inputClass = "w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 text-xs font-bold focus:ring-4 focus:ring-emerald-500/5 outline-none transition-all placeholder:text-slate-300";
    const labelClass = "text-[9px] font-black uppercase tracking-widest text-slate-400 mb-2 block ml-2";

    return createPortal(
        <div className="fixed inset-0 z-[80] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={onClose} />
            <div className="relative bg-white w-full max-w-lg rounded-[2.5rem] p-10 shadow-2xl animate-fade-up">
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-slate-900 rounded-2xl flex items-center justify-center text-white">
                            {type === "TOPIC" ? <Book className="w-6 h-6" /> : type === "SUBTOPIC" ? <Layers className="w-6 h-6" /> : <FilePlus className="w-6 h-6" />}
                        </div>
                        <div>
                            <h3 className="text-xl font-black uppercase tracking-tighter">{initialData ? 'Update' : 'Syllabus Extension'}</h3>
                            <p className="text-[10px] font-black uppercase tracking-widest text-emerald-600">{initialData ? 'Editing' : 'Provisioning'} {type}</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-slate-50 rounded-xl transition-all"><X className="w-5 h-5 text-slate-400" /></button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className={labelClass}>{type} Identifier</label>
                        <input
                            required
                            className={inputClass}
                            placeholder={`e.g. ${type === 'TOPIC' ? 'Intro to Mechanics' : type === 'SUBTOPIC' ? 'Newton Laws' : 'Practical Experiment'}`}
                            value={formData.title}
                            onChange={e => setFormData({ ...formData, title: e.target.value })}
                        />
                    </div>

                    {type === "UNIT" && (
                        <>
                            <div>
                                <label className={labelClass}>Period Dimension</label>
                                <input type="number" required className={inputClass} value={formData.periods} onChange={e => setFormData({ ...formData, periods: e.target.value })} />
                            </div>
                            <div className="space-y-4">
                                <div>
                                    <label className={labelClass}>Knowledge Requirements</label>
                                    <textarea className={`${inputClass} h-20 resize-none`} value={formData.knowledge} onChange={e => setFormData({ ...formData, knowledge: e.target.value })} />
                                </div>
                                <div>
                                    <label className={labelClass}>Skills Acquired</label>
                                    <textarea className={`${inputClass} h-20 resize-none`} value={formData.skills} onChange={e => setFormData({ ...formData, skills: e.target.value })} />
                                </div>
                            </div>
                        </>
                    )}

                    <button disabled={loading} className="w-full bg-slate-900 text-white py-5 rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-emerald-600 transition-all shadow-xl disabled:opacity-50">
                        {loading ? "Processing..." : initialData ? "Update Node" : "Commit Expansion"}
                    </button>
                </form>
            </div>
        </div>,
        document.body
    );
}
