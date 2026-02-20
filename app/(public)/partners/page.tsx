"use client";

import { motion } from "framer-motion";
import { Quote, GraduationCap, School, BookOpen, Users, Star, ShieldCheck, ArrowRight } from "lucide-react";
import Link from "next/link";

const slideInLeft = {
    hidden: { opacity: 0, x: -30 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.7 } }
};

const slideInRight = {
    hidden: { opacity: 0, x: 30 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.7 } }
};

export default function PartnersPage() {
    const testimonials = [
        {
            school: "Elite Science Academy",
            role: "Science Excellence",
            message: "eShuri has changed how we handle school work. It's much easier to manage everything now.",
            principal: "Head of Institution"
        }
    ];

    return (
        <div className="py-24 space-y-32 bg-white overflow-hidden">
            {/* Header */}
            <section className="max-w-7xl mx-auto px-8 text-center space-y-12">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-6"
                >
                    <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-emerald-50 text-emerald-600 text-[10px] font-black uppercase tracking-[0.3em] border border-emerald-100 italic shadow-sm">
                        <School className="w-4 h-4" />
                        <span>Our Schools</span>
                    </div>
                    <h1 className="text-4xl md:text-6xl font-black tracking-tighter uppercase italic text-slate-900 leading-[1.1]">
                        TRUSTED BY <br />
                        <span className="text-emerald-600">ELITE SCHOOLS</span>
                    </h1>
                    <p className="text-slate-400 max-w-2xl mx-auto font-black uppercase tracking-[0.2em] text-xs leading-relaxed opacity-80">
                        Setting new standards for school management in Africa.
                    </p>
                </motion.div>

                {/* Partner Logos */}
                <div className="flex flex-wrap justify-center gap-8 md:gap-16 pt-12">
                    {[1, 2, 3, 4].map((i) => (
                        <motion.div
                            key={i}
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true }}
                            variants={i % 2 === 0 ? slideInRight : slideInLeft}
                            className="flex flex-col items-center gap-5 group"
                        >
                            <div className="w-24 h-24 bg-slate-50 rounded-[2rem] flex items-center justify-center border border-slate-100 group-hover:bg-emerald-50 transition-all shadow-sm group-hover:shadow-xl group-hover:-translate-y-2 duration-500">
                                {i === 1 ? <GraduationCap className="w-10 h-10 text-slate-400 group-hover:text-emerald-600 transition-colors" /> :
                                    i === 2 ? <School className="w-10 h-10 text-slate-400 group-hover:text-blue-600 transition-colors" /> :
                                        i === 3 ? <BookOpen className="w-10 h-10 text-slate-400 group-hover:text-orange-600 transition-colors" /> :
                                            <Users className="w-10 h-10 text-slate-400 group-hover:text-rose-600 transition-colors" />}
                            </div>
                            <span className="font-black text-[9px] tracking-[0.3em] text-slate-400 uppercase italic opacity-60">
                                {i === 1 ? 'SCIENCE ACADEMY' : i === 2 ? 'GLOBAL HARBORS' : i === 3 ? 'PRESTIGE HS' : 'AFRICAN LEARNING'}
                            </span>
                        </motion.div>
                    ))}
                </div>
            </section>

            {/* Testimonials */}
            <section className="bg-slate-900 py-32 text-white relative overflow-hidden">
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-[120px] -mr-64 -mt-64"></div>
                <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-rose-500/5 rounded-full blur-[120px] -ml-64 -mb-64"></div>

                <div className="max-w-7xl mx-auto px-8 relative z-10">
                    <div className="text-center mb-20 space-y-4">
                        <h2 className="text-[10px] font-black uppercase tracking-[0.5em] text-emerald-400 italic">User Testimonials</h2>
                        <h3 className="text-3xl md:text-5xl font-black italic uppercase tracking-tighter">What they say</h3>
                    </div>

                    <div className="max-w-4xl mx-auto">
                        {testimonials.map((t, idx) => (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0, scale: 0.95 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                viewport={{ once: true }}
                                className="bg-white/5 backdrop-blur-3xl p-12 md:p-20 rounded-[4rem] border border-white/10 relative group shadow-2xl"
                            >
                                <Quote className="absolute -top-12 -left-6 w-32 h-32 text-white/5 group-hover:text-emerald-500/10 transition-colors duration-700" />
                                <div className="relative z-10 space-y-12">
                                    <p className="text-2xl md:text-3xl font-black leading-tight italic text-white/90 tracking-tight">
                                        "{t.message}"
                                    </p>
                                    <div className="pt-12 border-t border-white/10 flex items-center gap-8">
                                        <div className="w-20 h-20 bg-emerald-500 rounded-3xl flex items-center justify-center text-white shadow-2xl">
                                            <Star className="w-10 h-10 fill-current" />
                                        </div>
                                        <div>
                                            <h4 className="font-black text-xl uppercase italic tracking-tighter">{t.school}</h4>
                                            <p className="text-emerald-400 text-[10px] font-black uppercase tracking-[0.4em] mt-1">{t.role}</p>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA - IMPROVED VISIBILITY */}
            <section className="max-w-5xl mx-auto px-8 py-20">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="bg-slate-900 rounded-[4rem] p-20 text-center text-white relative overflow-hidden shadow-[0_50px_100px_-20px_rgba(0,0,0,0.5)] border border-white/10"
                >
                    <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-emerald-500 via-emerald-600 to-emerald-500"></div>
                    <div className="space-y-10 relative z-10">
                        <div className="w-20 h-20 bg-emerald-500/10 rounded-3xl flex items-center justify-center mx-auto border border-emerald-500/20">
                            <ShieldCheck className="w-10 h-10 text-emerald-500" />
                        </div>
                        <div className="space-y-4">
                            <h2 className="text-3xl md:text-5xl font-black tracking-tighter uppercase italic leading-none">Join our Network</h2>
                            <p className="text-xs font-black uppercase tracking-[0.5em] text-white/40 italic">Start your school's journey with eShuri.</p>
                        </div>
                        <div className="flex justify-center pt-4">
                            <Link href="/contact" className="bg-emerald-600 text-white px-12 py-5 rounded-2xl font-black uppercase text-xs tracking-[0.3em] hover:bg-emerald-700 transition-all hover:scale-105 shadow-2xl flex items-center gap-4 italic group">
                                Contact Us
                                <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-all" />
                            </Link>
                        </div>
                    </div>
                </motion.div>
            </section>
        </div>
    );
}
