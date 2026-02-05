import Link from "next/link";
import { GraduationCap, Home, Sparkles, Users, MessageCircle, LogIn } from "lucide-react";

export default function PublicLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen flex flex-col">
            <header className="fixed top-0 w-full z-50 glass border-b">
                <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-2 font-bold text-xl tracking-tight text-emerald-600">
                        <GraduationCap className="w-8 h-8" />
                        <span className="hidden sm:inline">EjoAfrica</span>
                    </Link>

                    <nav className="hidden md:flex items-center gap-8 text-sm font-medium">
                        <Link href="/" className="hover:text-emerald-600 transition-colors">Home</Link>
                        <Link href="/features" className="hover:text-emerald-600 transition-colors">Features</Link>
                        <Link href="/partners" className="hover:text-emerald-600 transition-colors">Partners</Link>
                        <Link href="/contact" className="hover:text-emerald-600 transition-colors">Contact</Link>
                    </nav>

                    <div className="flex items-center gap-4">
                        <Link href="/login" className="btn-primary py-2 px-6 text-sm flex items-center gap-2 transition-transform hover:scale-105 active:scale-95">
                            <LogIn className="w-4 h-4 md:hidden" />
                            <span>Login</span>
                        </Link>
                    </div>
                </div>
            </header>

            <main className="flex-grow pt-16 pb-20 md:pb-0">
                {children}
            </main>

            {/* Mobile Bottom Navigation (Insta Style) */}
            <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 glass border-t px-6 py-3 flex items-center justify-between pb-safe">
                <Link href="/" className="flex flex-col items-center gap-1 text-gray-400 hover:text-emerald-600 transition-colors">
                    <Home className="w-6 h-6" />
                    <span className="text-[10px] font-bold uppercase">Home</span>
                </Link>
                <Link href="/features" className="flex flex-col items-center gap-1 text-gray-400 hover:text-emerald-600 transition-colors">
                    <Sparkles className="w-6 h-6" />
                    <span className="text-[10px] font-bold uppercase">Features</span>
                </Link>
                <Link href="/partners" className="flex flex-col items-center gap-1 text-gray-400 hover:text-emerald-600 transition-colors">
                    <Users className="w-6 h-6" />
                    <span className="text-[10px] font-bold uppercase">Partners</span>
                </Link>
                <Link href="/contact" className="flex flex-col items-center gap-1 text-gray-400 hover:text-emerald-600 transition-colors">
                    <MessageCircle className="w-6 h-6" />
                    <span className="text-[10px] font-bold uppercase">Contact</span>
                </Link>
            </nav>

            <footer className="hidden md:block bg-gray-50 dark:bg-gray-900 border-t py-12">
                <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-8">
                    <div className="space-y-4">
                        <div className="flex items-center gap-2 font-bold text-xl text-emerald-600">
                            <GraduationCap className="w-6 h-6" />
                            <span>EjoAfrica</span>
                        </div>
                        <p className="text-sm text-gray-500 leading-relaxed">
                            Empowering African education through modern technology and management solutions.
                        </p>
                    </div>

                    <div>
                        <h4 className="font-bold mb-4 text-sm uppercase tracking-widest text-gray-400">Quick Links</h4>
                        <ul className="space-y-2 text-sm text-gray-500">
                            <li><Link href="/">Home</Link></li>
                            <li><Link href="/features">Features</Link></li>
                            <li><Link href="/partners">Partners</Link></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="font-bold mb-4 text-sm uppercase tracking-widest text-gray-400">Contact</h4>
                        <ul className="space-y-2 text-sm text-gray-500">
                            <li>info@fullstack</li>
                            <li>Emergency Support: 24/7</li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="font-bold mb-4 text-sm uppercase tracking-widest text-gray-400">Legal</h4>
                        <ul className="space-y-2 text-sm text-gray-500">
                            <li>Privacy Policy</li>
                            <li>Terms of Service</li>
                        </ul>
                    </div>
                </div>
                <div className="max-w-7xl mx-auto px-4 mt-8 pt-8 border-t text-center text-[10px] font-black uppercase tracking-widest text-gray-400">
                    © {new Date().getFullYear()} EjoAfrica. Built for the future of education.
                </div>
            </footer>
        </div>
    );
}
