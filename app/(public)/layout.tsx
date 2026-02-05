import Link from "next/link";
import { GraduationCap } from "lucide-react";

export default function PublicLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen flex flex-col">
            <header className="fixed top-0 w-full z-50 glass border-b">
                <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-2 font-bold text-2xl tracking-tight text-emerald-600">
                        <GraduationCap className="w-8 h-8" />
                        <span>EjoAfrica</span>
                    </Link>

                    <nav className="hidden md:flex items-center gap-8 text-sm font-medium">
                        <Link href="/" className="hover:text-emerald-600 transition-colors">Home</Link>
                        <Link href="/features" className="hover:text-emerald-600 transition-colors">Features</Link>
                        <Link href="/partners" className="hover:text-emerald-600 transition-colors">Partners</Link>
                        <Link href="/contact" className="hover:text-emerald-600 transition-colors">Contact</Link>
                    </nav>

                    <div>
                        <Link href="/login" className="btn-primary py-2 px-5 text-sm">
                            Login
                        </Link>
                    </div>
                </div>
            </header>

            <main className="flex-grow pt-16">
                {children}
            </main>

            <footer className="bg-gray-50 dark:bg-gray-900 border-t py-12">
                <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-8">
                    <div className="space-y-4">
                        <div className="flex items-center gap-2 font-bold text-xl text-emerald-600">
                            <GraduationCap className="w-6 h-6" />
                            <span>EjoAfrica</span>
                        </div>
                        <p className="text-sm text-gray-500">
                            Empowering African education through modern technology and management.
                        </p>
                    </div>

                    <div>
                        <h4 className="font-bold mb-4">Quick Links</h4>
                        <ul className="space-y-2 text-sm text-gray-500">
                            <li><Link href="/">Home</Link></li>
                            <li><Link href="/features">Features</Link></li>
                            <li><Link href="/partners">Partners</Link></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="font-bold mb-4">Contact</h4>
                        <ul className="space-y-2 text-sm text-gray-500">
                            <li>info@fullstack</li>
                            <li>Emergency Support: 24/7</li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="font-bold mb-4">Legal</h4>
                        <ul className="space-y-2 text-sm text-gray-500">
                            <li>Privacy Policy</li>
                            <li>Terms of Service</li>
                        </ul>
                    </div>
                </div>
                <div className="max-w-7xl mx-auto px-4 mt-8 pt-8 border-t text-center text-xs text-gray-400">
                    © {new Date().getFullYear()} EjoAfrica. All rights reserved.
                </div>
            </footer>
        </div>
    );
}
