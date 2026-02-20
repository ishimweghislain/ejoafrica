"use client";

import { motion } from "framer-motion";
import {
    Radio, Zap, Activity, LayoutDashboard, Clock, BarChart3, ArrowRight,
    BookOpen, ShieldAlert, Calendar, FileText
} from "lucide-react";
import Link from "next/link";

const slideInLeft = {
    hidden: { opacity: 0, x: -30 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.7 } }
};

const slideInRight = {
    hidden: { opacity: 0, x: 30 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.7 } }
};

export default function FeaturesPage() {
    const features = [
        {
            icon: <Radio className="w-5 h-5" />,
            title: "Live Assessments",
            description: "Real-time classroom testing with instant feedback for students and teachers.",
            color: "text-rose-600",
            bg: "bg-rose-50"
        },
        {
            icon: <Zap className="w-5 h-5" />,
            title: "Auto-Scoring",
            description: "Get results immediately. Our system grades tests automatically with perfect accuracy.",
            color: "text-emerald-400",
            bg: "bg-emerald-50/10",
            dark: true
        },
        {
            icon: <Activity className="w-5 h-5" />,
            title: "Student Tracking",
            description: "Keep track of student progress and engagement across all school activities.",
            color: "text-blue-600",
            bg: "bg-blue-50"
        },
        {
            icon: <LayoutDashboard className="w-5 h-5" />,
            title: "User Portals",
            description: "Dedicated dashboards for Teachers, Students, Parents, and School Leaders.",
            color: "text-indigo-600",
            bg: "bg-indigo-50"
        },
        {
            icon: <Clock className="w-5 h-5" />,
            title: "Work Automation",
            description: "Save time with automated scheduling, report generation, and school management.",
            color: "text-orange-600",
            bg: "bg-orange-50"
        },
        {
            icon: <BarChart3 className="w-5 h-5" />,
            title: "Smart Analytics",
            description: "Understand performance trends with easy-to-read academic data and charts.",
            color: "text-cyan-600",
            bg: "bg-cyan-50"
        },
        {
            icon: <BookOpen className="w-5 h-5" />,
            title: "Curriculum Manager",
            description: "Manage courses, topics, and subtopics with high-level academic precision.",
            color: "text-purple-600",
            bg: "bg-purple-50"
        },
        {
            icon: <ShieldAlert className="w-5 h-5" />,
            title: "Discipline System",
            description: "Track student behavior and maintain institutional integrity with digital reports.",
            color: "text-red-600",
            bg: "bg-red-50",
            dark: true
        },
        {
            icon: <Calendar className="w-5 h-5" />,
            title: "Smart Timetable",
            description: "Automated scheduling for classes, teachers, and school activities.",
            color: "text-amber-600",
            bg: "bg-amber-50"
        },
        {
            icon: <FileText className="w-5 h-5" />,
            title: "Academic Reports",
            description: "Generate beautiful, comprehensive student report cards and school analytics.",
            color: "text-emerald-600",
            bg: "bg-emerald-50"
        }
    ];

    return (
        <div className="py-24 px-8 max-w-6xl mx-auto bg-white min-h-screen space-y-24">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center space-y-6"
            >
                <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-slate-900 text-white text-[10px] font-black uppercase tracking-[0.3em] italic shadow-lg">
                    <Zap className="w-4 h-4 text-yellow-400" />
                    <span>System Features</span>
                </div>
                <h1 className="text-4xl md:text-6xl font-black tracking-tighter uppercase italic text-slate-900 leading-[1.1]">
                    PLATFORM <span className="text-emerald-600 text-5xl md:text-7xl">POWER</span>
                </h1>
                <p className="text-xs md:text-sm text-slate-400 font-black uppercase tracking-[0.3em] max-w-2xl mx-auto italic leading-relaxed">
                    The core tools powering the next generation of African education.
                </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {features.map((f, idx) => (
                    <motion.div
                        key={idx}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true }}
                        variants={idx % 2 === 0 ? slideInLeft : slideInRight}
                        className={`p-10 rounded-[3rem] border transition-all duration-500 group hover:shadow-2xl hover:-translate-y-2 ${f.dark ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-100 text-slate-900'}`}
                    >
                        <div className={`p-4 rounded-2xl w-fit ${f.bg} ${f.color} mb-8 shadow-sm group-hover:scale-110 transition-transform`}>
                            {f.icon}
                        </div>
                        <div className="space-y-4">
                            <h3 className="text-xl font-black italic uppercase tracking-tighter leading-none">{f.title}</h3>
                            <p className={`text-xs md:text-sm font-medium leading-relaxed italic ${f.dark ? 'text-slate-400' : 'text-slate-500'}`}>
                                {f.description}
                            </p>
                        </div>
                    </motion.div>
                ))}
            </div>

            <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="bg-emerald-600 rounded-[4rem] p-16 text-center text-white space-y-10 shadow-2xl relative overflow-hidden"
            >
                <div className="absolute top-0 left-0 w-64 h-64 bg-white/5 rounded-full -ml-32 -mt-32 blur-3xl"></div>
                <h2 className="text-3xl font-black uppercase italic tracking-tighter leading-none relative z-10">Start your journey with eShuri</h2>
                <div className="flex justify-center relative z-10">
                    <Link href="/login" className="bg-slate-900 text-white px-12 py-5 rounded-2xl font-black uppercase text-xs tracking-[0.3em] hover:bg-black transition-all hover:scale-105 shadow-2xl flex items-center gap-4 italic group">
                        System Portal
                        <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-all" />
                    </Link>
                </div>
            </motion.div>
        </div>
    );
}
