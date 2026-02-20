"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    ArrowRight, Radio, Zap, Activity, BarChart3, Trophy, Globe, Sparkles
} from "lucide-react";

const heroImages = [
    "/images/education.jpg",
    "https://images.unsplash.com/photo-1523050335392-9385117942d4?q=80&w=2070&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1503676260728-1c00da07bb5e?q=80&w=2026&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1509062522246-3755967927d7?q=80&w=2070&auto=format&fit=crop"
];

const slideInLeft = {
    hidden: { opacity: 0, x: -40 },
    visible: {
        opacity: 1,
        x: 0,
        transition: { duration: 0.7 }
    }
};

const slideInRight = {
    hidden: { opacity: 0, x: 40 },
    visible: {
        opacity: 1,
        x: 0,
        transition: { duration: 0.7 }
    }
};

const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: { staggerChildren: 0.15 }
    }
};

export default function HomePage() {
    const [currentImage, setCurrentImage] = useState(0);

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentImage((prev) => (prev + 1) % heroImages.length);
        }, 2000);
        return () => clearInterval(timer);
    }, []);

    return (
        <div className="flex flex-col pb-20 overflow-x-hidden bg-white">
            {/* Hero Section */}
            <section className="relative h-[75vh] flex items-center overflow-hidden">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={currentImage}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 1 }}
                        className="absolute inset-0 z-0"
                    >
                        <Image
                            src={heroImages[currentImage]}
                            alt="Education"
                            fill
                            className="object-cover brightness-[0.35]"
                            priority
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-black/10"></div>
                    </motion.div>
                </AnimatePresence>

                <div className="relative z-10 max-w-7xl mx-auto px-6 w-full">
                    <motion.div
                        variants={staggerContainer}
                        initial="hidden"
                        animate="visible"
                        className="max-w-xl space-y-4"
                    >
                        <motion.div
                            variants={slideInLeft}
                            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/20 text-emerald-400 text-[8px] font-black uppercase tracking-widest italic"
                        >
                            <Sparkles className="w-2.5 h-2.5" />
                            <span>Academic Excellence</span>
                        </motion.div>

                        <motion.h1
                            variants={slideInLeft}
                            className="text-xl md:text-3xl font-black text-white leading-tight uppercase italic tracking-tighter"
                        >
                            Infrastructure for <br />
                            <span className="text-emerald-500 text-3xl md:text-4xl">Smart Schools</span>
                        </motion.h1>

                        <motion.p
                            variants={slideInLeft}
                            className="text-[10px] md:text-xs text-gray-300 leading-relaxed max-w-sm font-bold uppercase tracking-widest"
                        >
                            The most advanced administrative ecosystem developed specifically for African educational institutions.
                        </motion.p>

                        <motion.div
                            variants={slideInLeft}
                            className="flex flex-wrap gap-3 pt-4"
                        >
                            <Link href="/login" className="bg-emerald-600 text-white px-5 py-2.5 rounded-lg font-black hover:bg-emerald-700 transition-all hover:scale-105 active:scale-95 text-[9px] uppercase tracking-widest flex items-center gap-2">
                                Launch Portal
                                <ArrowRight className="w-3.5 h-3.5" />
                            </Link>
                            <Link href="/features" className="px-5 py-2.5 rounded-lg font-black border border-white/20 text-white hover:bg-white/10 text-[9px] uppercase tracking-widest transition-all">
                                Tools
                            </Link>
                        </motion.div>
                    </motion.div>
                </div>
            </section>

            {/* Feature Cards - VERY COMPACT */}
            <section className="max-w-7xl mx-auto px-6 w-full -mt-10 relative z-20">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <motion.div
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true }}
                        variants={slideInLeft}
                        className="bg-white p-5 rounded-xl shadow-xl border border-slate-100 flex items-center gap-4"
                    >
                        <div className="w-9 h-9 bg-rose-50 rounded-lg flex items-center justify-center text-rose-600 flex-shrink-0">
                            <Radio className="w-4 h-4 animate-pulse" />
                        </div>
                        <div className="space-y-0.5">
                            <h3 className="text-[11px] font-black text-slate-900 uppercase tracking-tight italic">Live Assessments</h3>
                            <p className="text-[8px] text-slate-400 font-bold uppercase tracking-widest leading-none">Real-time sync.</p>
                        </div>
                    </motion.div>

                    <motion.div
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true }}
                        variants={slideInRight}
                        className="bg-slate-900 p-5 rounded-xl shadow-xl flex items-center gap-4 text-white"
                    >
                        <div className="w-9 h-9 bg-emerald-500 rounded-lg flex items-center justify-center text-white flex-shrink-0">
                            <Zap className="w-4 h-4" />
                        </div>
                        <div className="space-y-0.5">
                            <h3 className="text-[11px] font-black uppercase tracking-tight italic">Auto Grading</h3>
                            <p className="text-[8px] text-emerald-400 font-bold uppercase tracking-widest leading-none">Instant scoring.</p>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Core Pillars */}
            <section className="max-w-7xl mx-auto px-6 w-full py-16 bg-white">
                <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-center max-w-lg mx-auto mb-10 space-y-2"
                >
                    <h2 className="text-[7px] font-black uppercase tracking-[0.4em] text-emerald-600">The Core Nodes</h2>
                    <h3 className="text-xl font-black tracking-tighter text-slate-900 uppercase italic">Powering Smart Institutions</h3>
                </motion.div>

                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                    <CapabilityCard icon={<Activity className="w-4 h-4" />} title="Control" color="text-rose-500" delay={0.1} />
                    <CapabilityCard icon={<BarChart3 className="w-4 h-4" />} title="Analysis" color="text-blue-500" delay={0.2} />
                    <CapabilityCard icon={<Trophy className="w-4 h-4" />} title="Ranking" color="text-amber-500" delay={0.3} />
                    <CapabilityCard icon={<Globe className="w-4 h-4" />} title="Global" color="text-emerald-500" delay={0.4} />
                </div>
            </section>

            {/* CTA */}
            <section className="max-w-4xl mx-auto px-6 w-full mb-10">
                <motion.div
                    initial={{ opacity: 0, scale: 0.98 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    className="bg-emerald-600 rounded-2xl p-8 text-center text-white relative overflow-hidden"
                >
                    <h2 className="text-lg md:text-xl font-black italic uppercase mb-5 tracking-tighter">Ready for deployment?</h2>
                    <Link href="/register" className="inline-flex items-center gap-3 bg-slate-900 text-white px-5 py-2.5 rounded-lg font-black uppercase text-[8px] tracking-[0.2em] hover:scale-105 transition-all">
                        Launch Now <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                </motion.div>
            </section>
        </div>
    );
}

function CapabilityCard({ icon, title, color, delay }: { icon: any, title: string, color: string, delay: number }) {
    return (
        <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay }}
            className="bg-white p-4 rounded-xl border border-slate-50 flex flex-col items-center gap-3 shadow-sm"
        >
            <div className={`w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center ${color}`}>{icon}</div>
            <h4 className="font-black uppercase italic tracking-tighter text-[9px] text-slate-900">{title}</h4>
        </motion.div>
    );
}
