import React, { useState, useEffect } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import {
    Search,
    Settings,
    Bell,
    ChevronDown,
    User
} from "lucide-react";

const Layout = () => {
    const navigate = useNavigate();
    const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
    const username = localStorage.getItem("username") || "Admin";
    const role = localStorage.getItem("role") || "user";
    // permissions'ı state olarak tut
    const [permissions, setPermissions] = useState<string[]>(() => JSON.parse(localStorage.getItem("permissions") || "[]"));

    // localStorage değiştiğinde permissions'ı güncelle
    useEffect(() => {
        const onStorage = () => {
            setPermissions(JSON.parse(localStorage.getItem("permissions") || "[]"));
        };
        window.addEventListener("storage", onStorage);
        return () => window.removeEventListener("storage", onStorage);
    }, []);
    // Sayfa ilk yüklendiğinde de permissions'ı güncelle
    useEffect(() => {
        setPermissions(JSON.parse(localStorage.getItem("permissions") || "[]"));
    }, []);
    // Simüle: Kullanıcı yönetim yetkisi localStorage'da tutuluyor mu?
    const userManagePermission = localStorage.getItem("user_manage") !== "false"; // true (varsa) veya false (yoksa veya "false")

    // user_permission tablosundan gelen izinler
    const currentUserId = Number(localStorage.getItem("user_id"));
    const userPermissions = JSON.parse(localStorage.getItem("user_permissions") || "[]");
    const isAdmin = role === "admin";
    const canSeeUsers = permissions.includes("user_manage");
    const canSeeCalls = permissions.includes("call_view");
    const canSeeSantraller = permissions.includes("santral_view");

    useEffect(() => {
        const interval = setInterval(() => {
            setPermissions(JSON.parse(localStorage.getItem("permissions") || "[]"));
        }, 500);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header - Menü */}
            <header className="bg-white shadow-sm border-b sticky top-0 z-50">
                <div className="px-6 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                            <div className="flex items-center space-x-3">
                                <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-sky-500 rounded-lg flex items-center justify-center">
                                    <span className="text-white font-bold text-sm">K</span>
                                </div>
                                <div className="flex items-center space-x-3">
                                    <img
                                        src="/karel.jpg"
                                        alt="KAREL Logo"
                                        className="h-12 object-contain"
                                    />
                                </div>
                            </div>
                            <nav className="hidden md:flex space-x-6 ml-8">
                                <button
                                    onClick={() => navigate("/dashboard")}
                                    className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${window.location.pathname === "/dashboard" ? "bg-blue-100 text-blue-700" : "text-gray-600 hover:text-gray-900"}`}
                                >
                                    Ana Sayfa
                                </button>
                                {canSeeUsers && (
                                    <button
                                        onClick={() => navigate("/users")}
                                        className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${window.location.pathname === "/users" ? "bg-blue-100 text-blue-700" : "text-gray-600 hover:text-gray-900"}`}
                                    >
                                        Kullanıcılar
                                    </button>
                                )}
                                {canSeeCalls && (
                                    <button
                                        onClick={() => navigate("/calls")}
                                        className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${window.location.pathname === "/calls" ? "bg-blue-100 text-blue-700" : "text-gray-600 hover:text-gray-900"}`}
                                    >
                                        Çağrılar
                                    </button>
                                )}
                                {canSeeSantraller && (
                                    <button
                                        onClick={() => navigate("/santraller")}
                                        className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${window.location.pathname === "/santraller" ? "bg-blue-100 text-blue-700" : "text-gray-600 hover:text-gray-900"}`}
                                    >
                                        Santraller
                                    </button>
                                )}
                                <button
                                    onClick={() => navigate("/profile")}
                                    className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${window.location.pathname === "/profile" ? "bg-blue-100 text-blue-700" : "text-gray-600 hover:text-gray-900"}`}
                                >
                                    Profilim
                                </button>
                            </nav>
                        </div>
                        <div className="flex items-center space-x-4">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                                <input
                                    type="text"
                                    placeholder="Ara..."
                                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>
                            <button className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg">
                                <Bell className="w-5 h-5" />
                            </button>
                            <button className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg">
                                <Settings className="w-5 h-5" />
                            </button>
                            <div className="flex items-center space-x-2 relative">
                                <div className="w-8 h-8 bg-gradient-to-r from-cyan-500 to-sky-500 rounded-full flex items-center justify-center">
                                    <span className="text-white text-sm font-medium">{username[0]?.toUpperCase()}</span>
                                </div>
                                <div className="hidden sm:block cursor-pointer" onClick={() => setProfileDropdownOpen(v => !v)}>
                                    <p className="text-sm font-medium text-gray-700">{username}</p>
                                    <p className="text-xs text-gray-500">{role === "admin" ? "Yönetici" : "Kullanıcı"}</p>
                                </div>
                                <ChevronDown className="w-4 h-4 text-gray-600 cursor-pointer" onClick={() => setProfileDropdownOpen(v => !v)} />
                                {profileDropdownOpen && (
                                    <div className="absolute right-0 top-full mt-2 w-40 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                                        <button
                                            className="w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100 flex items-center space-x-2"
                                            onClick={() => navigate("/profile")}
                                        >
                                            <User className="w-4 h-4" />
                                            <span>Profilim</span>
                                        </button>
                                        <button
                                            className="w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100 flex items-center space-x-2"
                                            onClick={() => {
                                                setProfileDropdownOpen(false);
                                                localStorage.removeItem("token");
                                                localStorage.removeItem("username");
                                                localStorage.removeItem("role");
                                                navigate("/login");
                                            }}
                                        >
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a2 2 0 01-2 2H7a2 2 0 01-2-2V7a2 2 0 012-2h4a2 2 0 012 2v1" />
                                            </svg>
                                            <span>Çıkış Yap</span>
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </header>
            <Outlet />
        </div>
    );
};

export default Layout; 