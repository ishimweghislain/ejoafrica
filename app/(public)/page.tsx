"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import {
    ArrowRight, Radio, Zap, Activity, BarChart3, Trophy, Globe, Sparkles
} from "lucide-react";

const slideInLeft = {
    hidden: { opacity: 0, x: -40 },
    visible: {
        opacity: 1,
        x: 0,
        transition: { duration: 0.8 }
    }
};

const slideInRight = {
    hidden: { opacity: 0, x: 40 },
    visible: {
        opacity: 1,
        x: 0,
        transition: { duration: 0.8 }
    }
};

const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: { staggerChildren: 0.2 }
    }
};

export default function HomePage() {
    return (
        <div className="flex flex-col pb-32 overflow-x-hidden bg-white">
            {/* Hero Section - STABLE IMAGE */}
            <section className="relative h-[85vh] flex items-center overflow-hidden">
                <div className="absolute inset-0 z-0">
                    <Image
                        src="/images/education.jpg"
                        alt="eShuri Education"
                        fill
                        className="object-cover brightness-[0.4]"
                        priority
                    />
                    <div className="absolute inset-0 bg-gradient-to-tr from-slate-900/80 via-transparent to-transparent"></div>
                </div>

                <div className="relative z-10 max-w-7xl mx-auto px-8 w-full">
                    <motion.div
                        variants={staggerContainer}
                        initial="hidden"
                        animate="visible"
                        className="max-w-2xl space-y-8"
                    >
                        <motion.div
                            variants={slideInLeft}
                            className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-400/20 text-emerald-400 text-[10px] font-black uppercase tracking-[0.3em] italic shadow-lg backdrop-blur-md"
                        >
                            <Sparkles className="w-3 h-3" />
                            <span>Academic Intelligence Node</span>
                        </motion.div>

                        <motion.h1
                            variants={slideInLeft}
                            className="text-4xl md:text-6xl font-black text-white leading-[1.1] uppercase italic tracking-tighter"
                        >
                            Infrastructure for <br />
                            <span className="text-emerald-500">Smart Education</span>
                        </motion.h1>

                        <motion.p
                            variants={slideInLeft}
                            className="text-sm md:text-base text-gray-300 leading-relaxed max-w-xl font-medium uppercase tracking-widest opacity-80"
                        >
                            The best platform for smart schools and modern learning in Africa with eShuri.
                        </motion.p>

                        <motion.div
                            variants={slideInLeft}
                            className="flex flex-wrap gap-5 pt-6"
                        >
                            <Link href="/login" className="bg-emerald-600 text-white px-8 py-4 rounded-xl font-black hover:bg-emerald-700 transition-all hover:scale-105 active:scale-95 text-xs uppercase tracking-[0.2em] flex items-center gap-3 shadow-2xl shadow-emerald-900/20">
                                System Portal
                                <ArrowRight className="w-4 h-4" />
                            </Link>
                            <Link href="/features" className="px-8 py-4 rounded-xl font-black border border-white/20 text-white hover:bg-white/10 text-xs uppercase tracking-[0.2em] transition-all backdrop-blur-sm">
                                Explore Features
                            </Link>
                        </motion.div>
                    </motion.div>
                </div>
            </section>

            {/* Feature Nodes */}
            <section className="max-w-7xl mx-auto px-8 w-full -mt-16 relative z-20">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <motion.div
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true }}
                        variants={slideInLeft}
                        className="bg-white p-8 rounded-3xl shadow-2xl border border-slate-100 flex items-center gap-6"
                    >
                        <div className="w-14 h-14 bg-rose-50 rounded-2xl flex items-center justify-center text-rose-600 flex-shrink-0 shadow-inner">
                            <Radio className="w-6 h-6 animate-pulse" />
                        </div>
                        <div className="space-y-1">
                            <h3 className="text-sm font-black text-slate-900 uppercase tracking-tight italic">Live Assessments</h3>
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em] leading-none">Real-time classroom sync.</p>
                        </div>
                    </motion.div>

                    <motion.div
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true }}
                        variants={slideInRight}
                        className="bg-slate-900 p-8 rounded-3xl shadow-2xl flex items-center gap-6 text-white"
                    >
                        <div className="w-14 h-14 bg-emerald-500 rounded-2xl flex items-center justify-center text-white flex-shrink-0 shadow-lg">
                            <Zap className="w-6 h-6" />
                        </div>
                        <div className="space-y-1">
                            <h3 className="text-sm font-black uppercase tracking-tight italic">Auto Grading</h3>
                            <p className="text-[10px] text-emerald-400 font-bold uppercase tracking-[0.2em] leading-none">Instant performance analytics.</p>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Core Pillars */}
            <section className="max-w-7xl mx-auto px-8 w-full py-24">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-center max-w-2xl mx-auto mb-16 space-y-4"
                >
                    <h2 className="text-[10px] font-black uppercase tracking-[0.5em] text-emerald-600 italic">Our Platform</h2>
                    <h3 className="text-3xl md:text-4xl font-black tracking-tighter text-slate-900 uppercase italic">Smart School Features</h3>
                    <p className="text-sm text-slate-400 font-bold uppercase tracking-widest leading-relaxed">Integrated tools for better education management.</p>
                </motion.div>

                <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                    <CapabilityCard icon={<Activity className="w-5 h-5" />} title="Flow Control" color="text-rose-500" delay={0.1} />
                    <CapabilityCard icon={<BarChart3 className="w-5 h-5" />} title="Data Analysis" color="text-blue-500" delay={0.2} />
                    <CapabilityCard icon={<Trophy className="w-5 h-5" />} title="Performance" color="text-amber-500" delay={0.3} />
                    <CapabilityCard icon={<Globe className="w-5 h-5" />} title="Regional Sync" color="text-emerald-500" delay={0.4} />
                </div>
            </section>

            {/* Global CTA */}
            <section className="max-w-5xl mx-auto px-8 w-full">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    className="bg-emerald-600 rounded-[3rem] p-16 text-center text-white relative overflow-hidden shadow-2xl"
                >
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-32 -mt-32 blur-3xl"></div>
                    <h2 className="text-2xl md:text-5xl font-black italic uppercase mb-8 tracking-tighter">Powered by Fullstack</h2>
                    <p className="text-sm font-black uppercase tracking-[0.3em] mb-10 opacity-70">Transform your school's digital experience today with eShuri.</p>
                    <Link href="/login" className="inline-flex items-center gap-4 bg-slate-900 text-white px-12 py-5 rounded-xl font-black uppercase text-xs tracking-[0.3em] hover:bg-black transition-all hover:scale-105 shadow-2xl italic group">
                        Enter System Portal <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-all" />
                    </Link>
                </motion.div>
            </section>
        </div>
    );
}

function CapabilityCard({ icon, title, color, delay }: { icon: any, title: string, color: string, delay: number }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay, duration: 0.5 }}
            className="bg-white p-8 rounded-3xl border border-slate-50 flex flex-col items-center gap-5 shadow-sm hover:shadow-xl transition-all"
        >
            <div className={`w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center ${color} shadow-inner`}>{icon}</div>
            <h4 className="font-black uppercase italic tracking-tighter text-xs text-slate-900">{title}</h4>
        </motion.div>
    );
}
