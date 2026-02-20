"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function WelcomePage() {
    const [user, setUser] = useState<{ email: string; isAdmin: boolean } | null>(null);
    const router = useRouter();

    useEffect(() => {
        // Check if user is logged in
        const userData = localStorage.getItem("user");
        if (!userData) {
            router.push("/login");
        } else {
            setUser(JSON.parse(userData));
        }
    }, [router]);

    const handleLogout = () => {
        localStorage.removeItem("user");
        router.push("/");
    };

    if (!user) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
            {/* Navigation */}
            <nav className="bg-white shadow-sm border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <div className="flex items-center">
                            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                                eShuri
                            </h1>
                        </div>
                        <div className="flex items-center space-x-4">
                            <span className="text-sm text-gray-600">{user.email}</span>
                            {user.isAdmin && (
                                <span className="px-3 py-1 bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-xs font-semibold rounded-full">
                                    Admin
                                </span>
                            )}
                            <button
                                onClick={handleLogout}
                                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-all font-medium"
                            >
                                Logout
                            </button>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                {/* Welcome Hero */}
                <div className="text-center mb-12">
                    <h2 className="text-5xl font-bold text-gray-900 mb-4">
                        Welcome to eShuri! 🎉
                    </h2>
                    <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                        Your journey with us begins here. Explore our platform and discover amazing opportunities.
                    </p>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                    <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-shadow">
                        <div className="flex items-center justify-between mb-4">
                            <div className="p-3 bg-blue-100 rounded-lg">
                                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                </svg>
                            </div>
                            <span className="text-3xl font-bold text-gray-900">1</span>
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-1">Active Users</h3>
                        <p className="text-sm text-gray-600">You're logged in!</p>
                    </div>

                    <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-shadow">
                        <div className="flex items-center justify-between mb-4">
                            <div className="p-3 bg-purple-100 rounded-lg">
                                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <span className="text-3xl font-bold text-gray-900">100%</span>
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-1">Account Status</h3>
                        <p className="text-sm text-gray-600">Fully activated</p>
                    </div>

                    <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-shadow">
                        <div className="flex items-center justify-between mb-4">
                            <div className="p-3 bg-pink-100 rounded-lg">
                                <svg className="w-6 h-6 text-pink-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                </svg>
                            </div>
                            <span className="text-3xl font-bold text-gray-900">∞</span>
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-1">Possibilities</h3>
                        <p className="text-sm text-gray-600">Unlimited potential</p>
                    </div>
                </div>

                {/* Admin Panel (Only for Admins) */}
                {user.isAdmin && (
                    <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-2xl shadow-lg p-8 mb-12 border-2 border-yellow-200">
                        <div className="flex items-center mb-4">
                            <div className="p-3 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-lg mr-4">
                                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                </svg>
                            </div>
                            <div>
                                <h3 className="text-2xl font-bold text-gray-900">Admin Dashboard</h3>
                                <p className="text-gray-600">You have administrative privileges</p>
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                            <button className="bg-white px-6 py-4 rounded-lg shadow hover:shadow-md transition-all text-left">
                                <h4 className="font-semibold text-gray-900 mb-1">Manage Users</h4>
                                <p className="text-sm text-gray-600">View and manage all users</p>
                            </button>
                            <button className="bg-white px-6 py-4 rounded-lg shadow hover:shadow-md transition-all text-left">
                                <h4 className="font-semibold text-gray-900 mb-1">System Settings</h4>
                                <p className="text-sm text-gray-600">Configure platform settings</p>
                            </button>
                        </div>
                    </div>
                )}

                {/* Quick Actions */}
                <div className="bg-white rounded-2xl shadow-lg p-8">
                    <h3 className="text-2xl font-bold text-gray-900 mb-6">Quick Actions</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <button className="p-6 border-2 border-gray-200 rounded-xl hover:border-blue-500 hover:bg-blue-50 transition-all group">
                            <div className="text-4xl mb-3">📊</div>
                            <h4 className="font-semibold text-gray-900 group-hover:text-blue-600">Dashboard</h4>
                            <p className="text-sm text-gray-600 mt-1">View analytics</p>
                        </button>
                        <button className="p-6 border-2 border-gray-200 rounded-xl hover:border-purple-500 hover:bg-purple-50 transition-all group">
                            <div className="text-4xl mb-3">⚙️</div>
                            <h4 className="font-semibold text-gray-900 group-hover:text-purple-600">Settings</h4>
                            <p className="text-sm text-gray-600 mt-1">Manage account</p>
                        </button>
                        <button className="p-6 border-2 border-gray-200 rounded-xl hover:border-green-500 hover:bg-green-50 transition-all group">
                            <div className="text-4xl mb-3">📁</div>
                            <h4 className="font-semibold text-gray-900 group-hover:text-green-600">Projects</h4>
                            <p className="text-sm text-gray-600 mt-1">Browse projects</p>
                        </button>
                        <button className="p-6 border-2 border-gray-200 rounded-xl hover:border-pink-500 hover:bg-pink-50 transition-all group">
                            <div className="text-4xl mb-3">💬</div>
                            <h4 className="font-semibold text-gray-900 group-hover:text-pink-600">Messages</h4>
                            <p className="text-sm text-gray-600 mt-1">Check inbox</p>
                        </button>
                    </div>
                </div>
            </main>

            {/* Footer */}
            <footer className="bg-white border-t border-gray-200 mt-12">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <p className="text-center text-gray-600">
                        © 2024 eShuri. All rights reserved.
                    </p>
                </div>
            </footer>
        </div>
    );
}
