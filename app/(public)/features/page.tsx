"use client";

import { motion } from "framer-motion";
import {
    Radio, Zap, Activity, LayoutDashboard, Clock, BarChart3
} from "lucide-react";

const slideInLeft = {
    hidden: { opacity: 0, x: -30 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.6 } }
};

const slideInRight = {
    hidden: { opacity: 0, x: 30 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.6 } }
};

export default function FeaturesPage() {
    const features = [
        {
            icon: <Radio className="w-4 h-4" />,
            title: "Live Assessments",
            description: "Synchronized classroom testing.",
            color: "text-rose-600",
            bg: "bg-rose-50"
        },
        {
            icon: <Zap className="w-4 h-4" />,
            title: "Auto-Scoring",
            description: "Results delivered instantly.",
            color: "text-emerald-600",
            bg: "bg-emerald-50",
            dark: true
        },
        {
            icon: <Activity className="w-4 h-4" />,
            title: "Monitoring",
            description: "Real-time engagement tracking.",
            color: "text-blue-600",
            bg: "bg-blue-50"
        },
        {
            icon: <LayoutDashboard className="w-4 h-4" />,
            title: "Smart Portals",
            description: "Custom role-based dashboards.",
            color: "text-indigo-600",
            bg: "bg-indigo-50"
        },
        {
            icon: <Clock className="w-4 h-4" />,
            title: "Automation",
            description: "Automated institutional workflows.",
            color: "text-orange-600",
            bg: "bg-orange-50"
        },
        {
            icon: <BarChart3 className="w-4 h-4" />,
            title: "Analytics",
            description: "Deep academic performance metrics.",
            color: "text-cyan-600",
            bg: "bg-cyan-50"
        }
    ];

    return (
        <div className="py-12 px-6 max-w-4xl mx-auto bg-white min-h-screen">
            <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center space-y-2 mb-12"
            >
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900 text-white text-[7px] font-black uppercase tracking-widest italic">
                    <Zap className="w-2.5 h-2.5 text-yellow-400" />
                    <span>System Node</span>
                </div>
                <h1 className="text-xl md:text-3xl font-black tracking-tight uppercase italic text-slate-900 mb-1">
                    SYSTEM <span className="text-emerald-600">CAPABILITIES</span>
                </h1>
                <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest max-w-xs mx-auto">
                    Advanced Digital Institutional Tools.
                </p>
            </motion.div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {features.map((f, idx) => (
                    <motion.div
                        key={idx}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true }}
                        variants={idx % 2 === 0 ? slideInLeft : slideInRight}
                        className={`p-5 rounded-xl border transition-all ${f.dark ? 'bg-slate-900 border-slate-800 text-white shadow-lg' : 'bg-white border-slate-50 text-slate-900 shadow-sm'}`}
                    >
                        <div className={`p-2.5 rounded-lg w-fit ${f.bg} ${f.color} mb-4`}>
                            {f.icon}
                        </div>
                        <div className="space-y-1">
                            <h3 className="text-[11px] font-black italic uppercase tracking-tighter">{f.title}</h3>
                            <p className={`text-[9px] font-bold leading-tight ${f.dark ? 'text-slate-500' : 'text-slate-400'}`}>
                                {f.description}
                            </p>
                        </div>
                    </motion.div>
                ))}
            </div>

            <motion.div
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                className="mt-12 bg-emerald-600 rounded-xl p-8 text-center text-white space-y-4"
            >
                <h2 className="text-lg font-black uppercase italic tracking-tighter">Ready for deployment?</h2>
                <div className="flex justify-center">
                    <button className="bg-slate-900 text-white px-6 py-2.5 rounded-lg font-black uppercase text-[8px] tracking-widest hover:scale-105 transition-all">
                        Connect Now
                    </button>
                </div>
            </motion.div>
        </div>
    );
}
