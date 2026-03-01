"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { X, Loader2, BookOpen, Layers, ChevronRight, AlertCircle } from "lucide-react";
import { toast } from "react-hot-toast";

interface Unit {
    id: string;
    title: string;
    periods: number;
    subtopicTitle: string;
    topicTitle: string;
}

interface LessonModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    schemeId?: string;
    courseId?: string;
    initialData?: any; // null = create, object = edit
}

export default function LessonModal({ isOpen, onClose, onSuccess, schemeId, courseId, initialData }: LessonModalProps) {
    const [mounted, setMounted] = useState(false);
    useEffect(() => { setMounted(true); }, []);

    const isEditing = !!initialData;

    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(false);
    const [units, setUnits] = useState<Unit[]>([]);
    const [fetchError, setFetchError] = useState<string | null>(null);

    const [formData, setFormData] = useState({
        title: "",
        unitId: "",
        startDate: "",
        endDate: "",
        teachingMethod: "",
        resources: "",
        evaluation: "",
        observation: "",
    });

    // Pre-fill form when editing
    useEffect(() => {
        if (isOpen && initialData) {
            const fmt = (d: string) => d ? new Date(d).toISOString().slice(0, 16) : "";
            setFormData({
                title: initialData.title || "",
                unitId: initialData.unit?.id || initialData.unitId || "",
                startDate: fmt(initialData.startDate),
                endDate: fmt(initialData.endDate),
                teachingMethod: initialData.teachingMethod || "",
                resources: initialData.resources || "",
                evaluation: initialData.evaluation || "",
                observation: initialData.observation || "",
            });
        } else if (isOpen && !initialData) {
            setFormData({ title: "", unitId: "", startDate: "", endDate: "", teachingMethod: "", resources: "", evaluation: "", observation: "" });
        }
    }, [isOpen, initialData]);

    useEffect(() => {
        if (!isOpen) return;

        const actualCourseId = courseId;

        if (!actualCourseId || actualCourseId === "undefined") {
            setFetchError("The current plan does not have a valid course linkage. Please ask the DOS to re-link this scheme to a course.");
            setFetching(false);
            return;
        }

        setFetchError(null);
        setUnits([]);
        setFetching(true);

        async function fetchUnits() {
            try {
                const res = await fetch(`/api/courses/${actualCourseId}`);
                if (!res.ok) throw new Error(`Status ${res.status}`);
                const data = await res.json();

                if (data.error) throw new Error(data.error);

                const allUnits: Unit[] = [];
                const topics = data.topics || [];

                if (topics.length === 0) {
                    // Diagnostic: check if it's the right object
                    if (data.title) {
                        setFetchError(`Found course "${data.title}" but it has no topics defined in the syllabus yet.`);
                    } else {
                        setFetchError("Found the course linkage, but its syllabus is empty. Ask the DOS to add topics.");
                    }
                    return;
                }

                topics.forEach((t: any) => {
                    const subtopics = t.subtopics || [];
                    subtopics.forEach((s: any) => {
                        const units = s.units || [];
                        units.forEach((u: any) => {
                            allUnits.push({
                                id: u.id,
                                title: u.title,
                                periods: u.periods,
                                subtopicTitle: s.title || "No Subtopic",
                                topicTitle: t.title || "No Topic",
                            });
                        });
                    });
                });

                if (allUnits.length === 0) {
                    setFetchError(`The syllabus for "${data.title}" has topics but no specific units defined yet.`);
                } else {
                    setUnits(allUnits);
                    setFetchError(null);
                }
            } catch (err: any) {
                console.error("Unit fetch error:", err);
                setFetchError("Service failure: " + err.message);
                toast.error("Could not sync syllabus data.");
            } finally {
                setFetching(false);
            }
        }

        fetchUnits();
    }, [isOpen, courseId, schemeId]);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (!isEditing && !schemeId) { toast.error("No scheme selected."); return; }
        if (!formData.unitId) { toast.error("Please select a unit."); return; }

        setLoading(true);
        const tid = toast.loading(isEditing ? "Updating lesson..." : "Saving lesson...");

        try {
            const url = isEditing ? `/api/lessons/${initialData.id}` : "/api/lessons";
            const method = isEditing ? "PATCH" : "POST";
            const res = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ ...formData, schemeId }),
            });

            if (!res.ok) {
                const err = await res.json();
                throw new Error(err.error || "Failed to save.");
            }

            const result = await res.json();
            toast.success(isEditing ? "Lesson updated! ✓" : "Lesson saved! Now record attendance. ✓", { id: tid, icon: "📓" });
            setFormData({ title: "", unitId: "", startDate: "", endDate: "", teachingMethod: "", resources: "", evaluation: "", observation: "" });
            onSuccess();
            onClose();
        } catch (err: any) {
            toast.error(`Error: ${err.message}`, { id: tid });
        } finally {
            setLoading(false);
        }
    }

    if (!isOpen || !mounted) return null;

    const inputClass = "w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-3.5 text-xs font-semibold focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-400 outline-none transition-all placeholder:text-slate-300 text-slate-700";
    const labelClass = "text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1.5 block ml-1";

    return createPortal(
        <div className="fixed inset-0 z-[80] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={onClose} />
            <div className="relative bg-white w-full max-w-2xl rounded-[2.5rem] p-8 shadow-2xl animate-fade-up max-h-[92vh] overflow-y-auto">

                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-emerald-500 rounded-2xl flex items-center justify-center text-white shadow-lg">
                            <BookOpen className="w-6 h-6" />
                        </div>
                        <div>
                            <h3 className="text-xl font-black uppercase tracking-tighter text-slate-900">
                                {isEditing ? "Edit Lesson" : "Add Lesson"}
                            </h3>
                            <p className="text-[9px] font-black uppercase tracking-widest text-emerald-600">
                                {isEditing ? "Update lesson details" : "Record what you taught today"}
                            </p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-3 hover:bg-slate-100 rounded-2xl transition-all">
                        <X className="w-5 h-5 text-slate-400" />
                    </button>
                </div>

                {/* Unit loading state */}
                {fetching && (
                    <div className="flex items-center gap-3 bg-emerald-50 border border-emerald-100 rounded-2xl p-4 mb-6">
                        <Loader2 className="w-5 h-5 animate-spin text-emerald-600 shrink-0" />
                        <p className="text-[10px] font-black uppercase tracking-widest text-emerald-700">Loading units from syllabus...</p>
                    </div>
                )}

                {fetchError && !fetching && (
                    <div className="flex items-start gap-3 bg-red-50 border border-red-100 rounded-2xl p-4 mb-6">
                        <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-red-600 mb-1">Cannot Load Units</p>
                            <p className="text-xs text-red-500">{fetchError}</p>
                        </div>
                    </div>
                )}

                {!fetching && units.length > 0 && (
                    <div className="bg-emerald-50 border border-emerald-100 rounded-2xl px-4 py-3 mb-6 flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                            <Layers className="w-4 h-4 text-emerald-600 shrink-0" />
                            <p className="text-[10px] font-black uppercase tracking-widest text-emerald-700">
                                {units.length} lesson unit{units.length !== 1 ? "s" : ""} available
                            </p>
                        </div>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">
                    {/* Lesson Title */}
                    <div>
                        <label className={labelClass}>Lesson Title / Objective</label>
                        <input
                            required
                            className={inputClass}
                            placeholder="e.g. Introduction to Newton's Laws"
                            value={formData.title}
                            onChange={e => setFormData({ ...formData, title: e.target.value })}
                        />
                    </div>

                    {/* Unit selector */}
                    <div>
                        <label className={labelClass}>Unit <span className="text-red-400">*</span></label>
                        {fetching ? (
                            <div className={`${inputClass} flex items-center gap-2 text-slate-400`}>
                                <Loader2 className="w-4 h-4 animate-spin" /> Loading units...
                            </div>
                        ) : fetchError ? (
                            <div className={`${inputClass} text-red-400 flex items-center gap-2`}>
                                <AlertCircle className="w-4 h-4" /> No units available
                            </div>
                        ) : (
                            <select
                                required
                                className={inputClass}
                                value={formData.unitId}
                                onChange={e => setFormData({ ...formData, unitId: e.target.value })}
                            >
                                <option value="">— Select a unit —</option>
                                {units.map(u => (
                                    <option key={u.id} value={u.id}>
                                        {u.topicTitle} › {u.subtopicTitle} › {u.title} ({u.periods}p)
                                    </option>
                                ))}
                            </select>
                        )}
                    </div>

                    {/* Dates */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className={labelClass}>Start Date & Time</label>
                            <input
                                type="datetime-local"
                                required
                                className={inputClass}
                                value={formData.startDate}
                                onChange={e => setFormData({ ...formData, startDate: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className={labelClass}>End Date & Time</label>
                            <input
                                type="datetime-local"
                                required
                                className={inputClass}
                                value={formData.endDate}
                                onChange={e => setFormData({ ...formData, endDate: e.target.value })}
                            />
                        </div>
                    </div>

                    {/* Teaching method + Evaluation */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className={labelClass}>Teaching Method</label>
                            <textarea
                                className={`${inputClass} h-20 resize-none`}
                                placeholder="e.g. Group discussion, demonstration"
                                value={formData.teachingMethod}
                                onChange={e => setFormData({ ...formData, teachingMethod: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className={labelClass}>Evaluation</label>
                            <textarea
                                className={`${inputClass} h-20 resize-none`}
                                placeholder="e.g. Formative quiz, peer review"
                                value={formData.evaluation}
                                onChange={e => setFormData({ ...formData, evaluation: e.target.value })}
                            />
                        </div>
                    </div>

                    {/* Resources */}
                    <div>
                        <label className={labelClass}>Resources / Materials</label>
                        <input
                            className={inputClass}
                            placeholder="e.g. Textbook p.42-50, whiteboard, projector"
                            value={formData.resources}
                            onChange={e => setFormData({ ...formData, resources: e.target.value })}
                        />
                    </div>

                    {/* Observation */}
                    <div>
                        <label className={labelClass}>Teacher's Observation / Remarks</label>
                        <textarea
                            className={`${inputClass} h-16 resize-none`}
                            placeholder="Any remarks about this lesson..."
                            value={formData.observation}
                            onChange={e => setFormData({ ...formData, observation: e.target.value })}
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading || fetching || (!isEditing && !!fetchError)}
                        className="w-full bg-slate-900 text-white py-5 rounded-[1.5rem] font-black uppercase tracking-widest text-[10px] hover:bg-emerald-600 transition-all shadow-xl disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-3"
                    >
                        {loading ? (
                            <><Loader2 className="w-4 h-4 animate-spin" /> {isEditing ? "Updating..." : "Saving..."}</>
                        ) : (
                            <><BookOpen className="w-4 h-4" /> {isEditing ? "Update Lesson" : "Save Lesson"}</>
                        )}
                    </button>
                </form>
            </div>
        </div>,
        document.body
    );
}
