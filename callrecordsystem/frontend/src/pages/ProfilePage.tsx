import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
    Search,
    Settings,
    Bell,
    ChevronDown,
    User,
    Lock,
    Mail,
    Eye,
    EyeOff,
    ArrowLeft
} from "lucide-react";

const ProfilePage = () => {
    const [form, setForm] = useState({
        name: "",
        surname: "",
        username: "",
        email: "",
        password: "",
        newPassword: "",
        newPasswordRepeat: ""
    });
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showNewPasswordRepeat, setShowNewPasswordRepeat] = useState(false);
    const navigate = useNavigate();
    const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
    const username = localStorage.getItem("username") || "Admin";
    const role = localStorage.getItem("role") || "admin";

    useEffect(() => {
        if (!localStorage.getItem("token")) {
            navigate("/login");
            return;
        }

        // Kullanıcı bilgilerini çek
        const fetchProfile = async () => {
            try {
                const token = localStorage.getItem("token");
                console.log("Token:", token); // Debug için token'ı kontrol et
                
                const response = await fetch("http://localhost:8080/api/users/me", {
                    headers: { 
                        "Authorization": `Bearer ${token}`,
                        "Content-Type": "application/json"
                    }
                });
                
                console.log("Response status:", response.status); // Debug için response status
                console.log("Response headers:", response.headers); // Debug için headers
                
                if (response.ok) {
                    const data = await response.json();
                    console.log("Profil verisi:", data); // Debug için
                    setForm(prevForm => ({
                        ...prevForm,
                        name: data.name || "",
                        surname: data.surname || "",
                        username: data.username || username,
                        email: data.email || ""
                    }));
                } else if (response.status === 401) {
                    console.log("401 Unauthorized - Token geçersiz"); // Debug için
                    localStorage.removeItem("token");
                    localStorage.removeItem("username");
                    localStorage.removeItem("role");
                    navigate("/login");
                } else {
                    console.error("Profil yükleme hatası:", response.status);
                    const errorText = await response.text();
                    console.error("Error response:", errorText); // Debug için error response
                }
            } catch (error) {
                console.error("Profil yükleme hatası:", error);
                setError("Profil bilgileri yüklenirken hata oluştu.");
            }
        };

        fetchProfile();
    }, [navigate, username]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setSuccess("");
        
        if (form.newPassword && form.newPassword !== form.newPasswordRepeat) {
            setError("Yeni şifreler eşleşmiyor.");
            return;
        }

        try {
            const token = localStorage.getItem("token");
            const response = await fetch("http://localhost:8080/api/users/me", {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({
                    name: form.name,
                    surname: form.surname,
                    username: form.username
                    // email gönderme!
                })
            });

            if (response.ok) {
                setSuccess("Profil başarıyla güncellendi.");
                setForm(f => ({ ...f, password: "", newPassword: "", newPasswordRepeat: "" }));
                setTimeout(() => setSuccess(""), 3000);
            } else {
                const data = await response.json().catch(() => ({}));
                setError(data.error || "Güncelleme başarısız.");
            }
        } catch (error) {
            console.error("Profil güncelleme hatası:", error);
            setError("Profil güncellenirken hata oluştu.");
        }
    };

    const handleLogout = () => {
        setProfileDropdownOpen(false);
        localStorage.removeItem("token");
        localStorage.removeItem("username");
        localStorage.removeItem("role");
        localStorage.removeItem("permissions");
        navigate("/login");
    };

    const handleBackToAdmin = () => {
        navigate("/admin");
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Sabit Profil Bilgileri */}
            <div className="bg-white shadow-sm border-b sticky top-[72px] z-40">
                <div className="max-w-4xl mx-auto px-6 py-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <div className="w-16 h-16 bg-gradient-to-r from-cyan-500 to-sky-500 rounded-full flex items-center justify-center">
                            <span className="text-white text-2xl font-bold">
                                {form.name ? form.name.split(' ').map(n => n[0]).join('').slice(0, 2) : username[0]?.toUpperCase()}
                            </span>
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-1">
                                {form.name && form.surname ? `${form.name} ${form.surname}` : username}
                            </h3>
                            <p className="text-sm text-gray-500 mb-1">{form.email}</p>
                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${role === "admin" ? "bg-blue-100 text-blue-700" : "bg-gray-100 text-gray-700"}`}>
                                {role === "admin" ? "Yönetici" : "Kullanıcı"}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <main className="px-6 py-8">
                <div className="max-w-4xl mx-auto">
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">Profil Ayarları</h1>
                        <p className="text-gray-600">Hesap bilgilerinizi ve güvenlik ayarlarınızı yönetin</p>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Profil Bilgileri Formu */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col justify-between">
                            <form onSubmit={handleSubmit} className="space-y-6 flex-1 flex flex-col justify-between h-full">
                                    <div>
                                        <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                                            <User className="w-5 h-5 mr-2 text-gray-500" />
                                            Kişisel Bilgiler
                                        </h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">İsim *</label>
                                                <input
                                                    type="text"
                                                    name="name"
                                                    value={form.name}
                                                    onChange={handleChange}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                    placeholder="İsminiz"
                                                    required
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">Soyisim *</label>
                                                <input
                                                    type="text"
                                                    name="surname"
                                                    value={form.surname}
                                                    onChange={handleChange}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                    placeholder="Soyisminiz"
                                                    required
                                                />
                                            </div>
                                        </div>
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                                            <Mail className="w-5 h-5 mr-2 text-gray-500" />
                                            Hesap Bilgileri
                                        </h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">Kullanıcı Adı *</label>
                                                <input
                                                    type="text"
                                                    name="username"
                                                    value={form.username}
                                                    onChange={handleChange}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                    placeholder="Kullanıcı adınız"
                                                    required
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">E-posta *</label>
                                                <input
                                                    type="email"
                                                    name="email"
                                                    value={form.email}
                                                    disabled
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-500 cursor-not-allowed focus:outline-none"
                                                    placeholder="E-posta adresiniz"
                                                    required
                                                />
                                            </div>
                                        </div>
                                    </div>
                                {/* Hata ve Başarı Mesajları */}
                                {error && (
                                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                                        <div className="flex">
                                            <div className="flex-shrink-0">
                                                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                                </svg>
                                            </div>
                                            <div className="ml-3">
                                                <p className="text-sm text-red-800">{error}</p>
                                            </div>
                                        </div>
                                    </div>
                                )}
                                {success && (
                                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                                        <div className="flex">
                                            <div className="flex-shrink-0">
                                                <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                                </svg>
                                            </div>
                                            <div className="ml-3">
                                                <p className="text-sm text-green-800">{success}</p>
                                            </div>
                                        </div>
                                    </div>
                                )}
                                <div className="flex justify-end pt-4 border-t border-gray-100">
                                    <button
                                        type="submit"
                                        className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                                    >
                                        Bilgileri Kaydet
                                    </button>
                                </div>
                            </form>
                        </div>
                        {/* Şifre Değiştirme Formu */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col justify-between">
                            <form onSubmit={async (e) => {
                                e.preventDefault();
                                setError("");
                                setSuccess("");
                                if (form.newPassword && form.newPassword !== form.newPasswordRepeat) {
                                    setError("Yeni şifreler eşleşmiyor.");
                                    return;
                                }
                                try {
                                    const token = localStorage.getItem("token");
                                    const response = await fetch("http://localhost:8080/api/users/me", {
                                        method: "PUT",
                                        headers: {
                                            "Content-Type": "application/json",
                                            "Authorization": `Bearer ${token}`
                                        },
                                        body: JSON.stringify({
                                            password: form.password,
                                            newPassword: form.newPassword
                                        })
                                    });
                                    if (response.ok) {
                                        setSuccess("Şifre başarıyla güncellendi.");
                                        setForm(f => ({ ...f, password: "", newPassword: "", newPasswordRepeat: "" }));
                                        setTimeout(() => setSuccess(""), 3000);
                                    } else {
                                        const data = await response.json().catch(() => ({}));
                                        setError(data.error || "Şifre güncelleme başarısız.");
                                    }
                                } catch (error) {
                                    console.error("Şifre güncelleme hatası:", error);
                                    setError("Şifre güncellenirken hata oluştu.");
                                }
                            }} className="space-y-6 flex-1 flex flex-col justify-between h-full">
                                <div>
                                        <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                                            <Lock className="w-5 h-5 mr-2 text-gray-500" />
                                            Şifre Değiştirme
                                        </h3>
                                        <div className="space-y-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">Mevcut Şifre *</label>
                                                <div className="relative">
                                                    <input
                                                        type={showPassword ? "text" : "password"}
                                                        name="password"
                                                        value={form.password}
                                                        onChange={handleChange}
                                                        className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                        placeholder="Mevcut şifreniz"
                                                        required
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() => setShowPassword(!showPassword)}
                                                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                                    >
                                                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                                    </button>
                                                </div>
                                            </div>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">Yeni Şifre</label>
                                                    <div className="relative">
                                                        <input
                                                            type={showNewPassword ? "text" : "password"}
                                                            name="newPassword"
                                                            value={form.newPassword}
                                                            onChange={handleChange}
                                                            className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                            placeholder="Yeni şifre (boş bırakılabilir)"
                                                        />
                                                        <button
                                                            type="button"
                                                            onClick={() => setShowNewPassword(!showNewPassword)}
                                                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                                        >
                                                            {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                                        </button>
                                                    </div>
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">Yeni Şifre (Tekrar)</label>
                                                    <div className="relative">
                                                        <input
                                                            type={showNewPasswordRepeat ? "text" : "password"}
                                                            name="newPasswordRepeat"
                                                            value={form.newPasswordRepeat}
                                                            onChange={handleChange}
                                                            className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                            placeholder="Yeni şifre tekrar"
                                                        />
                                                        <button
                                                            type="button"
                                                            onClick={() => setShowNewPasswordRepeat(!showNewPasswordRepeat)}
                                                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                                        >
                                                            {showNewPasswordRepeat ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                <div className="flex justify-end pt-4 border-t border-gray-100">
                                        <button
                                            type="submit"
                                            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                                        >
                                        Şifreyi Kaydet
                                        </button>
                                    </div>
                                </form>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default ProfilePage;