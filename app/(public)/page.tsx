"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    ArrowRight, CheckCircle2, Users, BookOpen, Calendar,
    ShieldCheck, Sparkles, GraduationCap, Radio, Zap, Activity,
    Trophy, BarChart3, Globe, Rocket
} from "lucide-react";

const heroImages = [
    "/images/education.jpg",
    "https://images.unsplash.com/photo-1523050335392-9385117942d4?q=80&w=2070&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1503676260728-1c00da07bb5e?q=80&w=2026&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1509062522246-3755967927d7?q=80&w=2070&auto=format&fit=crop"
];

const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1
        }
    }
};

const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
};

export default function HomePage() {
    const [currentImage, setCurrentImage] = useState(0);

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentImage((prev) => (prev + 1) % heroImages.length);
        }, 2000);
        return () => clearInterval(timer);
    }, []);

    const words = "Future-Proof Education Management".split(" ");

    return (
        <div className="flex flex-col gap-12 md:gap-24 pb-20 overflow-x-hidden bg-white">
            {/* Hero Section */}
            <section className="relative min-h-[90vh] flex items-center overflow-hidden">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={currentImage}
                        initial={{ opacity: 0, scale: 1.1 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 1.5 }}
                        className="absolute inset-0 z-0"
                    >
                        <Image
                            src={heroImages[currentImage]}
                            alt="Education at Ejo Africa"
                            fill
                            className="object-cover brightness-[0.3]"
                            priority
                        />
                        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/20 to-white"></div>
                    </motion.div>
                </AnimatePresence>

                <div className="relative z-10 max-w-7xl mx-auto px-6 w-full">
                    <motion.div
                        variants={containerVariants}
                        initial="hidden"
                        animate="visible"
                        className="max-w-3xl space-y-8"
                    >
                        <motion.div
                            variants={itemVariants}
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 backdrop-blur-md text-emerald-400 text-xs font-black uppercase tracking-[0.2em]"
                        >
                            <Sparkles className="w-3 h-3" />
                            <span>Africa's Leading Learning Hub</span>
                        </motion.div>

                        <h1 className="text-5xl md:text-7xl lg:text-8xl font-black text-white leading-[1] tracking-tighter">
                            {words.map((word, i) => (
                                <motion.span
                                    key={i}
                                    variants={itemVariants}
                                    className="inline-block mr-3"
                                >
                                    {word === "Education" ? (
                                        <span className="text-emerald-400 italic">Education</span>
                                    ) : word}
                                </motion.span>
                            ))}
                        </h1>

                        <motion.p
                            variants={itemVariants}
                            className="text-lg md:text-xl text-gray-300 leading-relaxed max-w-2xl font-medium"
                        >
                            Revolutionize your classroom with real-time assessments, automated grading, and comprehensive school management tools tailored for the African continent.
                        </motion.p>

                        <motion.div
                            variants={itemVariants}
                            className="flex flex-wrap gap-4 pt-4"
                        >
                            <Link href="/login" className="bg-emerald-500 text-white px-10 py-5 rounded-2xl font-black hover:bg-emerald-400 transition-all hover:scale-105 active:scale-95 shadow-2xl shadow-emerald-500/20 text-sm uppercase tracking-widest flex items-center gap-3">
                                Get Started
                                <ArrowRight className="w-5 h-5" />
                            </Link>
                            <Link href="/features" className="px-10 py-5 rounded-2xl font-black border border-white/20 text-white backdrop-blur-md transition-all hover:bg-white/10 text-sm uppercase tracking-widest">
                                Explore Features
                            </Link>
                        </motion.div>
                    </motion.div>
                </div>
            </section>

            {/* Feature Highlights - Live & Auto Grading */}
            <section className="max-w-7xl mx-auto px-6 w-full -mt-20 relative z-20">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <motion.div
                        whileHover={{ y: -10 }}
                        className="bg-white p-10 rounded-[3rem] shadow-2xl border border-slate-100 flex flex-col gap-6"
                    >
                        <div className="w-16 h-16 bg-rose-50 rounded-2xl flex items-center justify-center text-rose-600">
                            <Radio className="w-8 h-8 animate-pulse" />
                        </div>
                        <div className="space-y-3">
                            <h3 className="text-3xl font-black italic tracking-tighter uppercase">Live Assessments</h3>
                            <p className="text-slate-500 font-medium leading-relaxed">
                                Engage students in real-time with our interactive live sessions. Teachers control the pace, and students respond instantly from any device.
                            </p>
                        </div>
                        <div className="flex items-center gap-2 text-rose-600 font-black text-xs uppercase tracking-widest">
                            <div className="w-2 h-2 rounded-full bg-rose-600 animate-ping" />
                            Real-time Interaction
                        </div>
                    </motion.div>

                    <motion.div
                        whileHover={{ y: -10 }}
                        className="bg-slate-900 p-10 rounded-[3rem] shadow-2xl flex flex-col gap-6 text-white"
                    >
                        <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center text-emerald-400">
                            <Zap className="w-8 h-8" />
                        </div>
                        <div className="space-y-3">
                            <h3 className="text-3xl font-black italic tracking-tighter uppercase">Automatic Grading</h3>
                            <p className="text-slate-400 font-medium leading-relaxed">
                                Eliminate the manual labor. Our advanced system grades submissions instantly as they arrive, providing immediate feedback and detailed analytics.
                            </p>
                        </div>
                        <div className="flex items-center gap-2 text-emerald-400 font-black text-xs uppercase tracking-widest">
                            <CheckCircle2 className="w-4 h-4" />
                            Zero Manual Work
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Core Features Grid */}
            <section className="max-w-7xl mx-auto px-6 w-full py-20">
                <div className="text-center max-w-2xl mx-auto mb-20 space-y-4">
                    <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-emerald-600 italic">Advanced Capabilities</h2>
                    <h3 className="text-4xl md:text-5xl font-black tracking-tighter uppercase italic">Built for Excellence</h3>
                    <p className="text-slate-500 font-medium leading-relaxed underline decoration-emerald-200 decoration-4 underline-offset-8">Everything you need to run a modern educational institution in one place.</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    <CoreFeature
                        icon={<Activity className="w-6 h-6" />}
                        title="Live Tracking"
                        desc="Monitor student progress in real-time during every assessment session."
                        color="text-rose-500"
                    />
                    <CoreFeature
                        icon={<BarChart3 className="w-6 h-6" />}
                        title="Deep Analytics"
                        desc="Detailed reports and performance charts for every single student."
                        color="text-blue-500"
                    />
                    <CoreFeature
                        icon={<Trophy className="w-6 h-6" />}
                        title="Auto-Ranking"
                        desc="Instant position calculation and digital award generation."
                        color="text-amber-500"
                    />
                    <CoreFeature
                        icon={<Globe className="w-6 h-6" />}
                        title="Parent Portal"
                        desc="Real-time access for parents to track their children's educational journey."
                        color="text-emerald-500"
                    />
                </div>
            </section>

            {/* Interactive Stats Section */}
            <section className="max-w-7xl mx-auto px-6 w-full mb-20">
                <div className="bg-emerald-600 rounded-[4rem] p-12 md:p-20 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-[100px] -mr-48 -mt-48 transition-all group-hover:bg-white/20"></div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                        <div className="space-y-8 text-white relative z-10">
                            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 border border-white/20 backdrop-blur-md uppercase text-[10px] font-black tracking-widest">
                                <Rocket className="w-4 h-4" />
                                Scalable Infrastructure
                            </div>
                            <h2 className="text-4xl md:text-6xl font-black leading-none italic tracking-tighter">JOIN THE FUTURE OF <span className="underline decoration-white/30 decoration-8 underline-offset-10">RWANDA'S</span> SCHOOLS</h2>
                            <p className="text-emerald-50 font-medium text-lg leading-relaxed">
                                Join hundreds of schools across the continent transitioning to the Ejo Africa digital ecosystem. Standardize your curriculum, empower your teachers, and delight your parents.
                            </p>
                            <Link href="/register" className="inline-flex items-center gap-10 bg-white text-emerald-900 px-12 py-6 rounded-[2rem] font-black uppercase text-xs tracking-[0.3em] hover:bg-emerald-50 transition-all hover:scale-105 shadow-2xl">
                                Join Us Now
                                <ArrowRight className="w-6 h-6" />
                            </Link>
                        </div>
                        <div className="relative aspect-square md:aspect-video lg:aspect-square bg-white/5 rounded-[3.5rem] p-8 backdrop-blur-sm border border-white/10">
                            <div className="grid grid-cols-2 gap-8 h-full">
                                <StatItem label="Active Users" value="25K+" desc="Across Rwanda" />
                                <StatItem label="Assessments" value="1M+" desc="Graded Automatically" />
                                <StatItem label="Success Rate" value="99%" desc="Digital Adoption" />
                                <StatItem label="Schools" value="400+" desc="Trusted Partners" />
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}

function CoreFeature({ icon, title, desc, color }: { icon: any, title: string, desc: string, color: string }) {
    return (
        <motion.div
            whileHover={{ scale: 1.05 }}
            className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-xl transition-all flex flex-col gap-6"
        >
            <div className={`w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center ${color}`}>
                {icon}
            </div>
            <div className="space-y-3">
                <h4 className="font-black uppercase italic tracking-tighter text-lg">{title}</h4>
                <p className="text-slate-500 text-[11px] leading-relaxed font-medium">{desc}</p>
            </div>
        </motion.div>
    );
}

function StatItem({ label, value, desc }: { label: string, value: string, desc: string }) {
    return (
        <div className="flex flex-col justify-center items-center text-center p-6 bg-white/5 rounded-[2.5rem] border border-white/10">
            <p className="text-[9px] font-black uppercase text-emerald-200 tracking-[0.2em] mb-2">{label}</p>
            <p className="text-5xl font-black text-white italic tracking-tighter mb-2">{value}</p>
            <p className="text-[10px] text-emerald-100/60 font-medium uppercase tracking-widest">{desc}</p>
        </div>
    );
}
