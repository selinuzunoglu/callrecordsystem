import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import karelLogo from "../assets/karel-logo.jpg";
import axios from "axios";

function LoginPage() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState("");
    const navigate = useNavigate();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        try {
            const response = await axios.post(
                "http://localhost:8080/api/auth/login",
                {
                    username,
                    password
                },
                {
                    withCredentials: true // 🔥 CORS cookie bazlıysa bu şart!
                }
            );



            // Token varsa login başarılı say
            if (response.data.token) {
                localStorage.setItem("token", response.data.token);
                navigate("/dashboard");
            } else {
                setError("Sunucudan geçersiz yanıt.");
            }
        } catch (err) {
            setError("Kullanıcı adı veya şifre hatalı.");
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-[#00AEEF] to-[#0072BC]">
            <div className="bg-white p-10 rounded-2xl shadow-2xl w-full max-w-md">
                <div className="flex justify-center mb-6">
                    <img src={karelLogo} alt="Karel Logo" className="h-16" />
                </div>
                <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">Giriş Yap</h2>

                <form onSubmit={handleLogin} className="space-y-5">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Kullanıcı Adı</label>
                        <input
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:outline-none"
                            placeholder="admin"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Şifre</label>
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

                    {error && <div className="text-red-600 text-sm">{error}</div>}

                    <div className="text-right text-sm">
                        <a href="#" className="text-sky-600 hover:underline">Şifremi unuttum?</a>
                    </div>

                    <button
                        type="submit"
                        className="w-full bg-sky-500 text-white py-2 rounded-lg hover:bg-sky-600 transition"
                    >
                        Giriş Yap
                    </button>
                </form>
            </div>
        </div>
    );
}

export default LoginPage;
