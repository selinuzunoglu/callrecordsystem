import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import karelLogo from "../assets/karel.jpg";
import axios from "axios";

function useQuery() {
    return new URLSearchParams(useLocation().search);
}

function ResetPasswordPage() {
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState("");
    const navigate = useNavigate();
    const query = useQuery();
    const token = query.get("token");
    const email = query.get("email"); // <-- email parametresi

    const handleReset = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        if (password.length < 6) {
            setError("Şifre en az 6 karakter olmalı.");
            return;
        }
        if (password !== confirmPassword) {
            setError("Şifreler eşleşmiyor.");
            return;
        }
        try {
            await axios.post("http://localhost:8080/api/auth/reset-password", {
                token,
                email, // <-- email de gönderiliyor
                password
            });
            window.alert("Şifreniz başarıyla oluşturuldu! Giriş ekranına yönlendiriliyorsunuz.");
            navigate("/"); // login ekranı
        } catch (err) {
            if (err.response && err.response.data && err.response.data.error) {
                setError(err.response.data.error);
            } else {
                setError("Şifre oluşturulurken hata oluştu veya bağlantı süresi doldu.");
            }
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-[#00AEEF] to-[#0072BC]">
            <div className="bg-white p-10 rounded-2xl shadow-2xl w-full max-w-md">
                <div className="flex justify-center mb-6">
                    <img src={karelLogo} alt="Karel Logo" className="h-16" />
                </div>
                <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">Şifre Oluştur</h2>
                <form onSubmit={handleReset} className="space-y-5">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Yeni Şifre</label>
                        <div className="flex">
                            <input
                                type={showPassword ? "text" : "password"}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-l-lg focus:ring-2 focus:ring-sky-500 focus:outline-none"
                                placeholder="••••••••"
                                required
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="px-4 bg-sky-500 text-white rounded-r-lg hover:bg-sky-600 transition"
                            >
                                {showPassword ? "Gizle" : "Göster"}
                            </button>
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Yeni Şifre (Tekrar)</label>
                        <input
                            type={showPassword ? "text" : "password"}
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:outline-none"
                            placeholder="••••••••"
                            required
                        />
                    </div>
                    {error && <div className="text-red-600 text-sm">{error}</div>}
                    <button
                        type="submit"
                        className="w-full bg-sky-500 text-white py-2 rounded-lg hover:bg-sky-600 transition"
                    >
                        Şifreyi Oluştur
                    </button>
                </form>
            </div>
        </div>
    );
}

export default ResetPasswordPage; 