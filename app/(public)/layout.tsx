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
                    <Link href="/" className="flex items-center gap-2 font-black text-xl tracking-tighter text-white group">
                        <div className="bg-emerald-500 p-1.5 rounded-lg shadow-lg shadow-emerald-500/20 group-hover:rotate-12 transition-transform">
                            <GraduationCap className="w-5 h-5 text-white" />
                        </div>
                        <span className="hidden sm:inline">eShuri</span>
                    </Link>

                    <nav className="hidden md:flex items-center gap-8 text-[9px] font-black uppercase tracking-[0.2em] text-gray-300">
                        <Link href="/" className="flex items-center gap-2 hover:text-emerald-400 transition-all hover:scale-105 active:scale-95">
                            <Home className="w-3.5 h-3.5 text-emerald-500" />
                            <span>Home</span>
                        </Link>
                        <Link href="/features" className="flex items-center gap-2 hover:text-emerald-400 transition-all hover:scale-105 active:scale-95">
                            <Sparkles className="w-3.5 h-3.5 text-emerald-500" />
                            <span>Features</span>
                        </Link>
                        <Link href="/partners" className="flex items-center gap-2 hover:text-emerald-400 transition-all hover:scale-105 active:scale-95">
                            <Users className="w-3.5 h-3.5 text-emerald-500" />
                            <span>Partners</span>
                        </Link>
                        <Link href="/contact" className="flex items-center gap-2 hover:text-emerald-400 transition-all hover:scale-105 active:scale-95">
                            <MessageCircle className="w-3.5 h-3.5 text-emerald-500" />
                            <span>Contact</span>
                        </Link>
                    </nav>

                    <div className="flex items-center gap-4">
                        <Link href="/login" className="bg-white text-slate-900 px-6 py-2.5 rounded-full text-[9px] font-black uppercase tracking-widest flex items-center gap-2 transition-all hover:bg-emerald-500 hover:text-white hover:scale-105 active:scale-95 shadow-xl shadow-white/5">
                            <LogIn className="w-3.5 h-3.5" />
                            <span>System Portal</span>
                        </Link>
                    </div>
                </div>
            </header>

            <main className="flex-grow pt-20 pb-20 md:pb-0">
                {children}
            </main>

            {/* Mobile Bottom Navigation (Insta Style) */}
            <nav className="md:hidden fixed bottom-6 left-6 right-6 z-50 bg-slate-900/90 backdrop-blur-xl border border-white/10 px-8 py-5 rounded-[2rem] flex items-center justify-between shadow-2xl">
                <Link href="/" className="flex flex-col items-center gap-1 text-gray-400 hover:text-emerald-400 transition-colors">
                    <Home className="w-5 h-5" />
                    <span className="text-[8px] font-black uppercase tracking-tighter">Home</span>
                </Link>
                <Link href="/features" className="flex flex-col items-center gap-1 text-gray-400 hover:text-emerald-400 transition-colors">
                    <Sparkles className="w-5 h-5" />
                    <span className="text-[8px] font-black uppercase tracking-tighter">Tools</span>
                </Link>
                <Link href="/partners" className="flex flex-col items-center gap-1 text-gray-400 hover:text-emerald-400 transition-colors">
                    <Users className="w-5 h-5" />
                    <span className="text-[8px] font-black uppercase tracking-tighter">Elite</span>
                </Link>
                <Link href="/contact" className="flex flex-col items-center gap-1 text-gray-400 hover:text-emerald-400 transition-colors">
                    <MessageCircle className="w-5 h-5" />
                    <span className="text-[8px] font-black uppercase tracking-tighter">Contact</span>
                </Link>
            </nav>

            <footer className="hidden md:block bg-slate-900 text-white border-t border-white/5 py-16 mt-auto">
                <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-12">
                    <div className="space-y-6">
                        <div className="flex items-center gap-3 font-black text-xl tracking-tighter text-white">
                            <div className="bg-emerald-500 p-2 rounded-xl">
                                <GraduationCap className="w-5 h-5" />
                            </div>
                            <span>eShuri</span>
                        </div>
                        <p className="text-xs text-gray-400 font-bold leading-relaxed opacity-70">
                            Engineering the next generation of African education through smart management tools with eShuri.
                        </p>
                    </div>

                    <div>
                        <h4 className="font-black mb-6 text-[9px] uppercase tracking-[0.3em] text-emerald-500">Navigation</h4>
                        <ul className="space-y-3 text-[10px] font-bold text-gray-400">
                            <li><Link href="/" className="hover:text-white transition-colors">Home Portal</Link></li>
                            <li><Link href="/features" className="hover:text-white transition-colors">System Tools</Link></li>
                            <li><Link href="/partners" className="hover:text-white transition-colors">Elite Schools</Link></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="font-black mb-6 text-[9px] uppercase tracking-[0.3em] text-emerald-500">Tech Node</h4>
                        <ul className="space-y-3 text-[10px] font-bold text-gray-400">
                            <li>support@eshuri.rw</li>
                            <li>24/7 Monitoring</li>
                            <li>Status: Online</li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="font-black mb-6 text-[9px] uppercase tracking-[0.3em] text-emerald-500">Legal</h4>
                        <ul className="space-y-3 text-[10px] font-bold text-gray-400">
                            <li>Privacy Layer</li>
                            <li>Terms of Service</li>
                            <li>Secure Data</li>
                        </ul>
                    </div>
                </div>
                <div className="max-w-7xl mx-auto px-4 mt-16 pt-10 border-t border-white/5 text-center text-[8px] font-black uppercase tracking-[0.5em] text-gray-600">
                    © {new Date().getFullYear()} eShuri Technology. Excellence Engineered.
                </div>
            </footer>
        </div>
    );
}
