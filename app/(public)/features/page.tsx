"use client";

import { motion } from "framer-motion";
import {
    ShieldCheck, Calendar, BookOpen, Clock, Users,
    FileText, LayoutDashboard, BrainCircuit, Radio, Zap, Activity, BarChart3
} from "lucide-react";

export default function FeaturesPage() {
    const features = [
        {
            icon: <Radio className="w-8 h-8" />,
            title: "Live Assessments",
            description: "Conduct real-time classroom sessions where students respond instantly to questions on their devices with full teacher control.",
            color: "text-rose-600",
            bg: "bg-rose-50"
        },
        {
            icon: <Zap className="w-8 h-8" />,
            title: "Automated Grading",
            description: "Save hours of manual labor with our zero-delay scoring system that grades assessments as soon as they are submitted.",
            color: "text-emerald-400",
            bg: "bg-slate-900",
            dark: true
        },
        {
            icon: <Activity className="w-8 h-8" />,
            title: "Real-time Monitoring",
            description: "Track exactly who is participating, who is falling behind, and who is excelling with our live participation dashboard.",
            color: "text-blue-500",
            bg: "bg-blue-50"
        },
        {
            icon: <LayoutDashboard className="w-8 h-8" />,
            title: "Custom Dashboards",
            description: "Tailored experiences for School Admins, DOS, Teachers, Students, and Parents with relevant metrics for each role.",
            color: "text-indigo-500",
            bg: "bg-indigo-50"
        },
        {
            icon: <Clock className="w-8 h-8" />,
            title: "Smart Timetables",
            description: "Complex class scheduling with automated conflict detection and seamless teacher assignment across academic levels.",
            color: "text-orange-500",
            bg: "bg-orange-50"
        },
        {
            icon: <BarChart3 className="w-8 h-8" />,
            title: "Deep Analytics",
            description: "Generate comprehensive reports on student performance, class averages, and institutional growth metrics.",
            color: "text-cyan-500",
            bg: "bg-cyan-50"
        }
    ];

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.1 }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, scale: 0.9 },
        visible: { opacity: 1, scale: 1 }
    };

    return (
        <div className="py-20 px-6 max-w-7xl mx-auto space-y-32">
            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center space-y-8 max-w-4xl mx-auto"
            >
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-900 text-white text-[10px] font-black uppercase tracking-[0.3em] italic">
                    <Zap className="w-3 h-3 text-yellow-400" />
                    <span>Next-Gen Capabilities</span>
                </div>
                <h1 className="text-5xl md:text-8xl font-black tracking-tighter leading-none uppercase italic">
                    BUILT TO <span className="text-emerald-600 underline">EXCEL</span>
                </h1>
                <p className="text-xl text-slate-500 leading-relaxed font-medium">
                    Ejo Africa provides a comprehensive suite of tools designed to handle every aspect of modern school administration across the continent.
                </p>
            </motion.div>

            <motion.div
                variants={containerVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-12"
            >
                {features.map((feature, idx) => (
                    <motion.div
                        key={idx}
                        variants={itemVariants}
                        whileHover={{ y: -10 }}
                        className={`p-10 rounded-[3.5rem] border shadow-sm hover:shadow-2xl transition-all duration-500 flex flex-col gap-8 ${feature.dark ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-100 text-slate-900'}`}
                    >
                        <div className={`p-5 rounded-[1.5rem] w-fit ${feature.bg} ${feature.color} shadow-lg shadow-slate-200/50`}>
                            {feature.icon}
                        </div>
                        <div className="space-y-4">
                            <h3 className="text-3xl font-black italic uppercase tracking-tighter">{feature.title}</h3>
                            <p className={`leading-relaxed font-medium ${feature.dark ? 'text-slate-400' : 'text-slate-500'}`}>
                                {feature.description}
                            </p>
                        </div>
                    </motion.div>
                ))}
            </motion.div>

            {/* Bottom Section */}
            <motion.div
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                className="bg-emerald-600 rounded-[4rem] p-12 md:p-24 text-center text-white space-y-12 relative overflow-hidden"
            >
                <div className="absolute top-0 left-0 w-96 h-96 bg-white/10 rounded-full blur-[100px] -ml-48 -mt-48"></div>
                <h2 className="text-4xl md:text-6xl font-black tracking-tighter italic uppercase leading-tight">Ready to transform your <br />institution?</h2>
                <div className="flex justify-center">
                    <button className="bg-slate-900 text-white px-12 py-6 rounded-[2.5rem] font-black uppercase text-xs tracking-[0.3em] hover:bg-black transition-all hover:scale-105 active:scale-95 shadow-2xl">
                        Start Your Journey
                    </button>
                </div>
            </motion.div>
        </div>
    );
}
