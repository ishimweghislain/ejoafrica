"use client";

import { useState, useEffect, use } from "react";
import {
    Plus,
    ChevronRight,
    ChevronDown,
    Book,
    Layout,
    List,
    FileText,
    Loader2,
    Trash2,
    Edit2,
    MoreVertical
} from "lucide-react";

interface Unit {
    id: string;
    title: string;
    periods: number;
}

interface Subtopic {
    id: string;
    title: string;
    units: Unit[];
    _count?: { units: number };
}

interface Topic {
    id: string;
    title: string;
    subtopics: Subtopic[];
    _count?: { subtopics: number };
}

export default function CurriculumPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const [course, setCourse] = useState<any>(null);
    const [topics, setTopics] = useState<Topic[]>([]);
    const [loading, setLoading] = useState(true);
    const [expandedTopics, setExpandedTopics] = useState<string[]>([]);
    const [expandedSubtopics, setExpandedSubtopics] = useState<string[]>([]);

    async function fetchCurriculum() {
        try {
            const res = await fetch(`/api/courses/${id}/topics`);
            const data = await res.json();
            setTopics(data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        fetchCurriculum();
    }, [id]);

    const toggleTopic = (topicId: string) => {
        setExpandedTopics(prev =>
            prev.includes(topicId) ? prev.filter(i => i !== topicId) : [...prev, topicId]
        );
    };

    const toggleSubtopic = (subId: string) => {
        setExpandedSubtopics(prev =>
            prev.includes(subId) ? prev.filter(i => i !== subId) : [...prev, subId]
        );
    };

    return (
        <div className="space-y-8 animate-fade-up">
            <div className="flex items-center justify-between">
                <div className="space-y-1">
                    <h1 className="text-2xl font-bold tracking-tight">Syllabus Architecture</h1>
                    <p className="text-gray-500 text-sm italic font-medium">Courses → Topics → Subtopics → Units</p>
                </div>
                <button className="btn-primary flex items-center gap-2">
                    <Plus className="w-4 h-4" />
                    Add Topic
                </button>
            </div>

            <div className="bg-white rounded-[3rem] border border-gray-100 shadow-sm p-4 min-h-[60vh]">
                {loading ? (
                    <div className="flex h-full items-center justify-center min-h-[40vh]">
                        <Loader2 className="w-10 h-10 animate-spin text-emerald-600" />
                    </div>
                ) : topics.length > 0 ? (
                    <div className="space-y-4">
                        {topics.map((topic) => (
                            <div key={topic.id} className="border-b border-gray-50 last:border-0">
                                <div
                                    className="flex items-center justify-between p-6 hover:bg-gray-50/50 cursor-pointer transition-colors rounded-[2rem]"
                                    onClick={() => toggleTopic(topic.id)}
                                >
                                    <div className="flex items-center gap-4">
                                        <div className={`p-2 rounded-xl border border-gray-100 ${expandedTopics.includes(topic.id) ? 'bg-emerald-600 text-white border-emerald-500 shadow-lg shadow-emerald-500/20' : 'bg-white text-gray-400'}`}>
                                            <Layout className="w-5 h-5" />
                                        </div>
                                        <div className="space-y-0.5">
                                            <h3 className="font-black tracking-tight text-gray-900">{topic.title}</h3>
                                            <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest">
                                                {topic.subtopics.length} Subtopics • Level 1 Module
                                            </p>
                                        </div>
                                    </div>
                                    {expandedTopics.includes(topic.id) ? <ChevronDown className="w-5 h-5 text-gray-300" /> : <ChevronRight className="w-5 h-5 text-gray-300" />}
                                </div>

                                {expandedTopics.includes(topic.id) && (
                                    <div className="pl-14 pr-6 pb-6 space-y-3 animate-fade-up">
                                        {topic.subtopics.map((sub) => (
                                            <div key={sub.id} className="bg-gray-50/50 rounded-3xl overflow-hidden border border-gray-100/50">
                                                <div
                                                    className="flex items-center justify-between p-5 cursor-pointer hover:bg-white transition-all group"
                                                    onClick={() => toggleSubtopic(sub.id)}
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <List className="w-4 h-4 text-gray-300 group-hover:text-blue-500 transition-colors" />
                                                        <span className="font-bold text-sm text-gray-700">{sub.title}</span>
                                                    </div>
                                                    <span className="text-[9px] font-black uppercase text-gray-300 tracking-widest group-hover:text-blue-500">
                                                        {sub.units.length} Units
                                                    </span>
                                                </div>

                                                {expandedSubtopics.includes(sub.id) && (
                                                    <div className="p-4 pt-0 space-y-2">
                                                        {sub.units.map(unit => (
                                                            <div key={unit.id} className="flex items-center justify-between bg-white p-4 rounded-2xl shadow-sm border border-gray-50 group/unit hover:scale-[1.01] transition-all">
                                                                <div className="flex items-center gap-3">
                                                                    <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover/unit:bg-emerald-600 group-hover/unit:text-white transition-all">
                                                                        <FileText className="w-4 h-4" />
                                                                    </div>
                                                                    <div className="space-y-0.5">
                                                                        <p className="text-sm font-bold text-gray-700">{unit.title}</p>
                                                                        <p className="text-[10px] text-gray-400 font-medium">{unit.periods} Periods Allocated</p>
                                                                    </div>
                                                                </div>
                                                                <button className="p-2 opacity-0 group-hover/unit:opacity-100 hover:text-emerald-600 transition-all font-black text-[10px] uppercase tracking-widest">
                                                                    View Details
                                                                </button>
                                                            </div>
                                                        ))}
                                                        <button className="w-full py-4 mt-2 border-2 border-dashed border-gray-100 rounded-2xl flex items-center justify-center gap-2 text-gray-300 hover:text-blue-500 hover:border-blue-100 hover:bg-white transition-all">
                                                            <Plus className="w-4 h-4" />
                                                            <span className="text-xs font-black uppercase tracking-widest">Append Unit</span>
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                        <button className="w-full py-3 text-xs font-black uppercase tracking-widest text-emerald-600/40 hover:text-emerald-600 transition-colors">
                                            + New Subtopic
                                        </button>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-col h-full items-center justify-center py-32 space-y-6">
                        <div className="bg-gray-50 p-10 rounded-[2.5rem] border border-gray-100">
                            <Book className="w-16 h-16 text-gray-200" />
                        </div>
                        <div className="text-center space-y-2">
                            <h3 className="text-xl font-bold text-gray-600">Curriculum is Empty</h3>
                            <p className="text-sm text-gray-400 max-w-xs mx-auto">This course hasn't been engineered yet. Start by defining the first topic.</p>
                        </div>
                        <button className="btn-primary">Initialize Syllabus</button>
                    </div>
                )}
            </div>
        </div>
    );
}
