import Image from "next/image";
import Link from "next/link";
import { ArrowRight, CheckCircle2, Users, BookOpen, Calendar, ShieldCheck } from "lucide-react";

export default function HomePage() {
    return (
        <div className="flex flex-col gap-20 pb-20">
            {/* Hero Section */}
            <section className="relative h-[90vh] flex items-center overflow-hidden">
                <div className="absolute inset-0 z-0">
                    <Image
                        src="/images/education.jpg"
                        alt="Students learning"
                        fill
                        className="object-cover brightness-[0.4]"
                        priority
                    />
                </div>

                <div className="relative z-10 max-w-7xl mx-auto px-4 w-full">
                    <div className="max-w-2xl space-y-8 animate-fade-up">
                        <h1 className="text-5xl md:text-7xl font-extrabold text-white leading-tight">
                            Reinventing <span className="text-emerald-400">Education</span> Management in Africa
                        </h1>
                        <p className="text-xl text-gray-200 leading-relaxed">
                            EjoAfrica is a state-of-the-art school management system designed to streamline academic operations, empower teachers, and engage parents.
                        </p>
                        <div className="flex flex-wrap gap-4 pt-4">
                            <Link href="/login" className="btn-primary flex items-center gap-2">
                                Get Started Now <ArrowRight className="w-5 h-5" />
                            </Link>
                            <Link href="/features" className="px-6 py-3 rounded-xl font-semibold border border-white/30 text-white backdrop-blur-sm transition-all hover:bg-white/10">
                                Explore Features
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* Partners Section */}
            <section className="max-w-7xl mx-auto px-4 w-full text-center space-y-8">
                <h2 className="text-sm font-bold uppercase tracking-widest text-emerald-600">Trusted By</h2>
                <div className="flex flex-wrap justify-center items-center gap-12 grayscale opacity-50 hover:grayscale-0 hover:opacity-100 transition-all duration-500">
                    <div className="text-2xl font-black text-gray-400">AFRICA EDU</div>
                    <div className="text-2xl font-black text-gray-400">SMART SCHOOL</div>
                    <div className="text-2xl font-black text-gray-400">FUTURE LEADERS</div>
                    <div className="text-2xl font-black text-gray-400">TECH ACADEMY</div>
                </div>
            </section>

            {/* Brief Features Overview */}
            <section className="bg-gray-50 dark:bg-gray-900/50 py-24">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="text-center max-w-2xl mx-auto mb-16 space-y-4">
                        <h2 className="text-4xl font-bold">Why Choose EjoAfrica?</h2>
                        <p className="text-gray-500">Everything you need to run a modern educational institution in one place.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <FeatureCard
                            icon={<ShieldCheck className="w-10 h-10 text-emerald-500" />}
                            title="Role-Based Security"
                            description="Custom permissions for Administrators, Teachers, Students, and Parents."
                        />
                        <FeatureCard
                            icon={<Calendar className="w-10 h-10 text-emerald-500" />}
                            title="Academic Planning"
                            description="Manage years, terms, classes, and complex timetables effortlessly."
                        />
                        <FeatureCard
                            icon={<BookOpen className="w-10 h-10 text-emerald-500" />}
                            title="Smart Curriculum"
                            description="Deep hierarchy for courses, topics, subtopics, and detailed unit plans."
                        />
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="max-w-7xl mx-auto px-4 w-full">
                <div className="bg-emerald-600 rounded-[2rem] p-8 md:p-16 text-center text-white space-y-8 relative overflow-hidden shadow-2xl shadow-emerald-500/20">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-32 -mt-32"></div>
                    <div className="absolute bottom-0 left-0 w-64 h-64 bg-black/10 rounded-full blur-3xl -ml-32 -mb-32"></div>

                    <h2 className="text-3xl md:text-5xl font-bold">Ready to modernize your school?</h2>
                    <p className="text-emerald-100 text-lg max-w-xl mx-auto">
                        Join the growing network of futuristic schools in Africa. Contact our team to request your administrative account.
                    </p>
                    <div className="flex justify-center pt-4">
                        <Link href="/contact" className="bg-white text-emerald-600 px-8 py-4 rounded-xl font-bold hover:bg-emerald-50 transition-all hover:scale-105 active:scale-95 shadow-xl">
                            Contact Us Today
                        </Link>
                    </div>
                </div>
            </section>
        </div>
    );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
    return (
        <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm transition-all hover:shadow-xl hover:-translate-y-1 group">
            <div className="mb-6 group-hover:scale-110 transition-transform">{icon}</div>
            <h3 className="text-xl font-bold mb-3">{title}</h3>
            <p className="text-gray-500 text-sm leading-relaxed">{description}</p>
        </div>
    );
}
