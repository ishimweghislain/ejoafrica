import Link from "next/link";
import { GraduationCap, Home, Sparkles, Users, MessageCircle, LogIn, Menu } from "lucide-react";
import { Toaster } from "react-hot-toast";

export default function PublicLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen flex flex-col bg-slate-50">
            <Toaster
                position="top-right"
                toastOptions={{
                    duration: 4000,
                    style: {
                        background: '#0f172a',
                        color: '#fff',
                        borderRadius: '1.5rem',
                        padding: '1rem 1.5rem',
                        fontWeight: 'bold',
                        fontSize: '13px',
                        border: '1px solid rgba(255,255,255,0.1)',
                        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
                    },
                    success: {
                        iconTheme: {
                            primary: '#10b981',
                            secondary: '#fff',
                        },
                    },
                    error: {
                        iconTheme: {
                            primary: '#ef4444',
                            secondary: '#fff',
                        },
                    },
                }}
            />
            <header className="fixed top-0 w-full z-50 bg-slate-900/95 backdrop-blur-xl border-b border-white/10">
                <div className="max-w-7xl mx-auto px-4 h-20 flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-3 font-black text-2xl tracking-tighter text-white group">
                        <div className="bg-emerald-500 p-2 rounded-xl shadow-lg shadow-emerald-500/20 group-hover:rotate-12 transition-transform">
                            <GraduationCap className="w-8 h-8 text-white" />
                        </div>
                        <span className="hidden sm:inline">Eshuri</span>
                    </Link>

                    <nav className="hidden md:flex items-center gap-10 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">
                        <Link href="/" className="flex items-center gap-2 hover:text-emerald-400 transition-all hover:scale-105 active:scale-95">
                            <Home className="w-4 h-4 text-emerald-500" />
                            <span>Home</span>
                        </Link>
                        <Link href="/features" className="flex items-center gap-2 hover:text-emerald-400 transition-all hover:scale-105 active:scale-95">
                            <Sparkles className="w-4 h-4 text-emerald-500" />
                            <span>Features</span>
                        </Link>
                        <Link href="/partners" className="flex items-center gap-2 hover:text-emerald-400 transition-all hover:scale-105 active:scale-95">
                            <Users className="w-4 h-4 text-emerald-500" />
                            <span>Partners</span>
                        </Link>
                        <Link href="/contact" className="flex items-center gap-2 hover:text-emerald-400 transition-all hover:scale-105 active:scale-95">
                            <MessageCircle className="w-4 h-4 text-emerald-500" />
                            <span>Contact</span>
                        </Link>
                    </nav>

                    <div className="flex items-center gap-4">
                        <Link href="/login" className="bg-white text-slate-900 px-8 py-3 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-2 transition-all hover:bg-emerald-500 hover:text-white hover:scale-105 active:scale-95 shadow-xl shadow-white/5">
                            <LogIn className="w-4 h-4" />
                            <span>System Portal</span>
                        </Link>
                    </div>
                </div>
            </header>

            <main className="flex-grow pt-20 pb-20 md:pb-0">
                {children}
            </main>

            {/* Mobile Bottom Navigation (Insta Style) */}
            <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-slate-900/95 backdrop-blur-xl border-t border-white/10 px-6 py-4 flex items-center justify-between pb-safe shadow-2xl">
                <Link href="/" className="flex flex-col items-center gap-1 text-gray-400 hover:text-emerald-400 transition-colors">
                    <Home className="w-6 h-6" />
                    <span className="text-[9px] font-black uppercase tracking-tighter">Home</span>
                </Link>
                <Link href="/features" className="flex flex-col items-center gap-1 text-gray-400 hover:text-emerald-400 transition-colors">
                    <Sparkles className="w-6 h-6" />
                    <span className="text-[9px] font-black uppercase tracking-tighter">Features</span>
                </Link>
                <Link href="/partners" className="flex flex-col items-center gap-1 text-gray-400 hover:text-emerald-400 transition-colors">
                    <Users className="w-6 h-6" />
                    <span className="text-[9px] font-black uppercase tracking-tighter">Partners</span>
                </Link>
                <Link href="/contact" className="flex flex-col items-center gap-1 text-gray-400 hover:text-emerald-400 transition-colors">
                    <MessageCircle className="w-6 h-6" />
                    <span className="text-[9px] font-black uppercase tracking-tighter">Contact</span>
                </Link>
            </nav>

            <footer className="hidden md:block bg-slate-900 text-white border-t border-white/5 py-20 mt-auto">
                <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-12">
                    <div className="space-y-6">
                        <div className="flex items-center gap-3 font-black text-2xl tracking-tighter text-white">
                            <div className="bg-emerald-500 p-2 rounded-xl">
                                <GraduationCap className="w-6 h-6" />
                            </div>
                            <span>Eshuri</span>
                        </div>
                        <p className="text-sm text-gray-400 font-bold leading-relaxed opacity-70">
                            Engineering the next generation of African education through smart management tools.
                        </p>
                    </div>

                    <div>
                        <h4 className="font-black mb-6 text-[10px] uppercase tracking-[0.3em] text-emerald-500">Navigation</h4>
                        <ul className="space-y-4 text-xs font-bold text-gray-400">
                            <li><Link href="/" className="hover:text-white transition-colors">Home Page</Link></li>
                            <li><Link href="/features" className="hover:text-white transition-colors">Our Features</Link></li>
                            <li><Link href="/partners" className="hover:text-white transition-colors">Our Partners</Link></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="font-black mb-6 text-[10px] uppercase tracking-[0.3em] text-emerald-500">Tech Support</h4>
                        <ul className="space-y-4 text-xs font-bold text-gray-400">
                            <li>contact@eshuri.edu</li>
                            <li>24/7 Support Available</li>
                            <li>System Status: Online</li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="font-black mb-6 text-[10px] uppercase tracking-[0.3em] text-emerald-500">Compliance</h4>
                        <ul className="space-y-4 text-xs font-bold text-gray-400">
                            <li>Privacy Policy</li>
                            <li>Terms of Service</li>
                            <li>Secure Data</li>
                        </ul>
                    </div>
                </div>
                <div className="max-w-7xl mx-auto px-4 mt-20 pt-10 border-t border-white/5 text-center text-[9px] font-black uppercase tracking-[0.5em] text-gray-600">
                    © {new Date().getFullYear()} Eshuri Technology. Designed for Excellence.
                </div>
            </footer>
        </div>
    );
}
