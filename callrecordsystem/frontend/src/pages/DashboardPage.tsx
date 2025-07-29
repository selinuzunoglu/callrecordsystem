import { useState, useEffect } from "react";
import {
    Phone,
    BarChart3,
    Calendar,
    Search,
    Settings,
    Bell,
    ChevronDown,
    TrendingUp,
    TrendingDown,
    Filter,
    Download,
    UserPlus,
    Edit,
    Trash2,
    Eye,
    Clock,
    CheckCircle,
    PlayCircle,
    Mail
} from "lucide-react";
import { useNavigate } from "react-router-dom";

type UserType = {
    id: number;
    name: string;
    surname?: string;
    username: string;
    email: string;
    status: string;
};

const KarelAdminPanel = () => {
    const [activeTab, setActiveTab] = useState("overview");
    const [showAddUserModal, setShowAddUserModal] = useState(false);
    const [selectedUser, setSelectedUser] = useState<UserType | null>(null);
    const [users, setUsers] = useState<UserType[]>([
        { id: 1, name: "Ahmet Yılmaz", username: "ahmet.yilmaz", email: "ahmet@karel.com", status: "Aktif" },
        { id: 2, name: "Fatma Kaya", username: "fatma.kaya", email: "fatma@karel.com", status: "Davet Gönderildi" },
        { id: 3, name: "Mehmet Demir", username: "mehmet.demir", email: "mehmet@karel.com", status: "Aktif" },
        { id: 4, name: "Ayşe Öztürk", username: "ayse.ozturk", email: "ayse@karel.com", status: "Davet Gönderildi" },
    ]);
    const [searchTerm, setSearchTerm] = useState("");

    const callRecords = [
        { id: 1, caller: "0532 123 4567", called: "0212 555 0123", duration: "05:23", status: "Tamamlandı", date: "10.07.2025 14:30", operator: "Ahmet Yılmaz", type: "Gelen" },
        { id: 2, caller: "0505 987 6543", called: "0212 555 0124", duration: "02:45", status: "Devam Ediyor", date: "10.07.2025 15:15", operator: "Fatma Kaya", type: "Giden" },
        { id: 3, caller: "0543 456 7890", called: "0212 555 0125", duration: "08:12", status: "Tamamlandı", date: "10.07.2025 13:45", operator: "Ayşe Öztürk", type: "Gelen" },
        { id: 4, caller: "0536 789 0123", called: "0212 555 0126", duration: "00:32", status: "Kayıp", date: "10.07.2025 12:20", operator: "-", type: "Gelen" },
    ];

    const [stats, setStats] = useState([
        { title: "Toplam Kullanıcılar", value: "0", change: "0", trend: "up" },
        { title: "Aktif Kullanıcılar", value: "0", change: "0", trend: "up" },
        { title: "Günlük Çağrı", value: "156", change: "-8.1%", trend: "down" },
        { title: "Ortalama Süre", value: "4:32", change: "+0.8%", trend: "up" }
    ]);

    const fetchUsers = async () => {
        const response = await fetch('http://localhost:8080/api/users');
        if (response.ok) {
            const data = await response.json();
            setUsers(data);
        }
    };

    const fetchUserStats = async () => {
        try {
            const response = await fetch('http://localhost:8080/api/users/stats');
            if (response.ok) {
                const data = await response.json();
                
                // Stats'i güncelle
                setStats(prevStats => [
                    { ...prevStats[0], value: data.totalUsers.toString(), change: `+${data.totalUsers}`, trend: "up" },
                    { ...prevStats[1], value: data.activeUsers.toString(), change: `+${data.activeUsers}`, trend: "up" },
                    prevStats[2],
                    prevStats[3]
                ]);
            }
        } catch (error) {
            console.error('Kullanıcı istatistikleri alınamadı:', error);
        }
    };

    useEffect(() => {
        fetchUsers();
        fetchUserStats();
    }, []);

    const navigate = useNavigate();
    const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
    const username = localStorage.getItem("username") || "Admin";
    const role = localStorage.getItem("role") || "admin";
    const permissions = JSON.parse(localStorage.getItem("permissions") || "[]");

    useEffect(() => {
        if (!localStorage.getItem("token")) {
            navigate("/login");
        }
    }, [navigate]);

    const handleAddUser = async (userData: { name: string; surname: string; username: string; email: string }) => {
        const response = await fetch('http://localhost:8080/api/users/invite', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(userData),
        });
        if (response.ok) {
            fetchUsers();
        } else {
            alert('Kullanıcı eklenemedi!');
        }
        setShowAddUserModal(false);
        setSelectedUser(null);
    };

    const handleDeleteUser = async (userId: number, username: string) => {
        if (username === "admin") return; // Admin silinemez, buton da görünmeyecek zaten
        const confirmed = window.confirm("Emin misiniz? Bu kullanıcıyı silmek istediğinize?");
        if (!confirmed) return;
        const response = await fetch(`http://localhost:8080/api/users/${userId}`, {
            method: 'DELETE',
        });
        if (response.ok) {
            setUsers(users.filter(user => user.id !== userId));
        } else {
            alert('Kullanıcı silinemedi!');
        }
    };

    const handleEditUser = (user: UserType) => {
        setSelectedUser(user);
        // setShowAddUserModal(true); // KALDIRILDI, sadece yeni kullanıcı ekle için kullanılacak
    };

    const AddUserModal = () => {
        const [formData, setFormData] = useState({
            name: '',
            surname: '',
            username: '',
            email: ''
        });

        const handleSubmit = (e: React.FormEvent) => {
            e.preventDefault();
            handleAddUser(formData);
            setFormData({ name: '', surname: '', username: '', email: '' });
        };

        return (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white rounded-xl p-6 w-full max-w-md">
                    <h2 className="text-xl font-semibold mb-4 text-gray-800">
                        Yeni Kullanıcı Ekle
                    </h2>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">İsim *</label>
                            <input
                                type="text"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="Örn: Ahmet"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Soyisim *</label>
                            <input
                                type="text"
                                value={formData.surname}
                                onChange={(e) => setFormData({ ...formData, surname: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="Örn: Yılmaz"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Kullanıcı Adı *</label>
                            <input
                                type="text"
                                value={formData.username}
                                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="Örn: ahmet.yilmaz"
                                required
                                title="Kullanıcı adı en az 3 karakter olmalı ve sadece harf, rakam, nokta, alt çizgi veya tire içerebilir."
                            />
                            <p className="text-xs text-gray-500 mt-1">Kullanıcı giriş yaparken bu adı kullanacak</p>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">E-posta *</label>
                            <input
                                type="email"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="ornek@karel.com"
                                required
                            />
                        </div>
                        <div className="flex justify-end space-x-3 pt-4 border-t border-gray-100">
                            <button
                                type="button"
                                onClick={() => {
                                    setShowAddUserModal(false);
                                    setSelectedUser(null);
                                }}
                                className="px-4 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
                            >
                                İptal
                            </button>
                            <button
                                type="submit"
                                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                            >
                                Kullanıcı Ekle
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        );
    };

    // Düzenleme modalı için form state
    const [editForm, setEditForm] = useState({
        name: '',
        surname: '',
        username: '',
        email: ''
    });

    // Düzenle modalı açıldığında seçili kullanıcıyı forma aktar
    useEffect(() => {
        if (selectedUser) {
            setEditForm({
                name: selectedUser.name || '',
                surname: selectedUser.surname || '',
                username: selectedUser.username || '',
                email: selectedUser.email || ''
            });
        }
    }, [selectedUser]);

    // Kullanıcı güncelleme fonksiyonu
    const handleUpdateUser = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedUser) return;
        const response = await fetch(`http://localhost:8080/api/users/${selectedUser.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(editForm),
        });
        if (response.ok) {
            fetchUsers();
            setSelectedUser(null);
            setShowSavedPopup(true); // Pop-up göster
            setTimeout(() => setShowSavedPopup(false), 2000); // 2 sn sonra kapat
        } else {
            alert('Kullanıcı güncellenemedi!');
        }
    };

    // Düzenle Modalı
    const EditUserModal = () => (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-6 w-full max-w-md">
                <h2 className="text-xl font-semibold mb-4 text-gray-800">Kullanıcıyı Düzenle</h2>
                <form onSubmit={handleUpdateUser} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">İsim *</label>
                        <input
                            type="text"
                            value={editForm.name}
                            onChange={e => setEditForm({ ...editForm, name: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Soyisim *</label>
                        <input
                            type="text"
                            value={editForm.surname}
                            onChange={e => setEditForm({ ...editForm, surname: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Kullanıcı Adı *</label>
                        <input
                            type="text"
                            value={editForm.username}
                            onChange={e => setEditForm({ ...editForm, username: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">E-posta *</label>
                        <input
                            type="email"
                            value={editForm.email}
                            disabled
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-500 cursor-not-allowed focus:outline-none"
                            // onChange kaldırıldı, çünkü değiştirilemez
                            required
                        />
                    </div>
                    <div className="flex justify-end space-x-3 pt-4 border-t border-gray-100">
                        <button
                            type="button"
                            onClick={() => setSelectedUser(null)}
                            className="px-4 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                            İptal
                        </button>
                        <button
                            type="submit"
                            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                        >
                            Kaydet
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );

    const handleLogout = () => {
        setProfileDropdownOpen(false); // Önce menüyü kapat
        localStorage.removeItem("token");
        localStorage.removeItem("username");
        localStorage.removeItem("role");
        navigate("/login");
    };

    const handleProfile = () => {
        setProfileDropdownOpen(false);
        navigate("/profile");
    };

    // Kullanıcıları arama terimine göre filtrele
    const filteredUsers = users.filter(user =>
        user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Admin her zaman en üstte olacak şekilde sıralama
    const sortedUsers = [
        ...filteredUsers.filter(u => u.username === "admin"),
        ...filteredUsers.filter(u => u.username !== "admin")
    ];

    // Pop-up için state
    const [showSavedPopup, setShowSavedPopup] = useState(false);
    // Şifre sıfırlama pop-up'ı için state
    const [showResetMailPopup, setShowResetMailPopup] = useState(false);
    const [resetMailUser, setResetMailUser] = useState<string | null>(null);

    // Şifre sıfırlama fonksiyonu
    const handleResetPassword = async (user: UserType) => {
        // API çağrısı: backend'de ilgili endpoint olmalı
        const response = await fetch(`http://localhost:8080/api/users/${user.id}/reset-password`, {
            method: 'POST',
        });
        if (response.ok) {
            setResetMailUser(user.email);
            setShowResetMailPopup(true);
            setTimeout(() => setShowResetMailPopup(false), 2500);
        } else {
            alert('Şifre sıfırlama bağlantısı gönderilemedi!');
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <main className="px-6 py-8">
                {window.location.pathname === "/dashboard" && (
                    <div className="space-y-8">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 mb-2">Ana Sayfa</h1>
                            <p className="text-gray-600">KAREL Çağrı Kayıt Sistemi yönetim paneline hoş geldiniz.</p>
                        </div>

                        {/* Stats Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            {stats.map((stat) => (
                                <div key={stat.title} className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                                    <div className="flex items-center justify-between mb-4">
                                        <h3 className="text-sm font-medium text-gray-600">{stat.title}</h3>
                                        {stat.trend === "up" ? (
                                            <TrendingUp className="w-4 h-4 text-green-500" />
                                        ) : (
                                            <TrendingDown className="w-4 h-4 text-red-500" />
                                        )}
                                    </div>
                                    <div className="flex items-end space-x-2">
                                        <span className="text-2xl font-bold text-gray-900">{stat.value}</span>
                                        <span className={`text-sm font-medium ${
                                            stat.trend === "up" ? "text-green-600" : "text-red-600"
                                        }`}>
                                            {stat.change}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Charts Section */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">Çağrı Hacmi</h3>
                                <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
                                    <div className="text-center">
                                        <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                                        <p className="text-gray-500">Çağrı analitik grafiği</p>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">Performans Özeti</h3>
                                <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
                                    <div className="text-center">
                                        <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                                        <p className="text-gray-500">Performans metrikleri</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {window.location.pathname === "/users" && permissions.includes("user_manage") && (
                    <div className="space-y-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-600">Çağrı sistemi kullanıcılarını yönetin ve yetkilendirin</p>
                            </div>
                            <div className="flex items-center space-x-3">
                                <button className="px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg flex items-center space-x-2">
                                    <Filter className="w-4 h-4" />
                                    <span>Filtrele</span>
                                </button>
                                <button className="px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg flex items-center space-x-2">
                                    <Download className="w-4 h-4" />
                                    <span>Dışa Aktar</span>
                                </button>
                                <button
                                    onClick={() => setShowAddUserModal(true)}
                                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
                                >
                                    <UserPlus className="w-4 h-4" />
                                    <span>Kullanıcı Ekle</span>
                                </button>
                            </div>
                        </div>

                        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
                            <div className="p-6 border-b border-gray-100">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-4">
                                        <div className="relative">
                                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                                            <input
                                                type="text"
                                                placeholder="Kullanıcı ara..."
                                                value={searchTerm}
                                                onChange={e => setSearchTerm(e.target.value)}
                                                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            />
                                        </div>
                                    </div>
                                    <div className="text-sm text-gray-500">
                                        Toplam {filteredUsers.length} kullanıcı
                                    </div>
                                </div>
                            </div>

                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                    <tr className="border-b border-gray-100">
                                        <th className="text-left py-4 px-6 text-sm font-medium text-gray-600">İsim Soyisim</th>
                                        <th className="text-left py-4 px-6 text-sm font-medium text-gray-600">Kullanıcı Adı</th>
                                        <th className="text-left py-4 px-6 text-sm font-medium text-gray-600">E-posta</th>
                                        <th className="text-left py-4 px-6 text-sm font-medium text-gray-600">Durum</th>
                                        <th className="text-left py-4 px-6 text-sm font-medium text-gray-600">İşlemler</th>
                                    </tr>
                                    </thead>
                                    <tbody>
                                    {sortedUsers.map((user) => (
                                        <tr key={user.id} className="border-b border-gray-50 hover:bg-gray-50">
                                            <td className="py-4 px-6">
                                                <div className="flex items-center space-x-3">
                                                    <div className="w-10 h-10 bg-gradient-to-r from-cyan-400 to-sky-400 rounded-full flex items-center justify-center">
                                                            <span className="text-sm font-medium text-white">
                                                                {user.name.split(' ').map(n => n[0]).join('')}
                                                            </span>
                                                    </div>
                                                    <div>
                                                        <div className="font-medium text-gray-900">{user.name}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="py-4 px-6">
                                                <span className="font-mono text-sm bg-gray-100 px-2 py-1 rounded text-gray-800">
                                                    {user.username}
                                                </span>
                                            </td>
                                            <td className="py-4 px-6 text-gray-600">{user.email}</td>
                                            <td className="py-4 px-6">
                                                <span className={
                                                    user.status === "Aktif" ? "bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm" :
                                                        user.status === "Davet Gönderildi" ? "bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full text-sm" :
                                                            "bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm"
                                                }>
                                                    {user.status}
                                                </span>
                                            </td>
                                            <td className="py-4 px-6">
                                                <div className="flex items-center space-x-2">
                                                    <button
                                                        onClick={() => handleEditUser(user)}
                                                        className="p-1 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded"
                                                        title="Düzenle"
                                                    >
                                                        <Edit className="w-4 h-4" />
                                                    </button>
                                                    {user.username !== "admin" && (
                                                        <>
                                                            <button
                                                                onClick={() => handleDeleteUser(user.id, user.username)}
                                                                className="p-1 text-red-600 hover:text-red-800 hover:bg-red-50 rounded"
                                                                title="Sil"
                                                            >
                                                                <Trash2 className="w-4 h-4" />
                                                            </button>
                                                            <button
                                                                onClick={() => handleResetPassword(user)}
                                                                className="p-1 text-yellow-600 hover:text-yellow-800 hover:bg-yellow-50 rounded"
                                                                title="Şifre Sıfırla"
                                                            >
                                                                <Mail className="w-4 h-4" />
                                                            </button>
                                                        </>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}

                {window.location.pathname === "/calls" && (
                    <div className="space-y-6">
                        <div className="flex items-center justify-between">
                            <div>
                                
                                <p className="text-gray-600">Tüm çağrı kayıtlarını görüntüleyin ve yönetin</p>
                            </div>
                            <div className="flex items-center space-x-3">
                                <button className="px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg flex items-center space-x-2">
                                    <Filter className="w-4 h-4" />
                                    <span>Filtrele</span>
                                </button>
                                <button className="px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg flex items-center space-x-2">
                                    <Download className="w-4 h-4" />
                                    <span>Dışa Aktar</span>
                                </button>
                            </div>
                        </div>

                        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
                            <div className="p-6 border-b border-gray-100">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-4">
                                        <div className="relative">
                                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                                            <input
                                                type="text"
                                                placeholder="Çağrı ara..."
                                                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            />
                                        </div>
                                        <select className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                                            <option>Tüm Durumlar</option>
                                            <option>Tamamlandı</option>
                                            <option>Devam Ediyor</option>
                                            <option>Kayıp</option>
                                        </select>
                                    </div>
                                    <div className="text-sm text-gray-500">
                                        Toplam {callRecords.length} çağrı
                                    </div>
                                </div>
                            </div>

                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                    <tr className="border-b border-gray-100">
                                        <th className="text-left py-4 px-6 text-sm font-medium text-gray-600">Arayan</th>
                                        <th className="text-left py-4 px-6 text-sm font-medium text-gray-600">Aranan</th>
                                        <th className="text-left py-4 px-6 text-sm font-medium text-gray-600">Tip</th>
                                        <th className="text-left py-4 px-6 text-sm font-medium text-gray-600">Süre</th>
                                        <th className="text-left py-4 px-6 text-sm font-medium text-gray-600">Durum</th>
                                        <th className="text-left py-4 px-6 text-sm font-medium text-gray-600">Operatör</th>
                                        <th className="text-left py-4 px-6 text-sm font-medium text-gray-600">Tarih</th>
                                        <th className="text-left py-4 px-6 text-sm font-medium text-gray-600">İşlemler</th>
                                    </tr>
                                    </thead>
                                    <tbody>
                                    {callRecords.map((call) => (
                                        <tr key={call.id} className="border-b border-gray-50 hover:bg-gray-50">
                                            <td className="py-4 px-6">
                                                <div className="flex items-center space-x-2">
                                                    <Phone className="w-4 h-4 text-gray-400" />
                                                    <span className="font-medium text-gray-900">{call.caller}</span>
                                                </div>
                                            </td>
                                            <td className="py-4 px-6 text-gray-600">{call.called}</td>
                                            <td className="py-4 px-6">
                                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                                        call.type === "Gelen" ? "bg-green-100 text-green-700" :
                                                            "bg-blue-100 text-blue-700"
                                                    }`}>
                                                        {call.type}
                                                    </span>
                                            </td>
                                            <td className="py-4 px-6">
                                                <div className="flex items-center space-x-1">
                                                    <Clock className="w-4 h-4 text-gray-400" />
                                                    <span className="text-gray-900">{call.duration}</span>
                                                </div>
                                            </td>
                                            <td className="py-4 px-6">
                                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                                        call.status === "Tamamlandı" ? "bg-green-100 text-green-700" :
                                                            call.status === "Devam Ediyor" ? "bg-yellow-100 text-yellow-700" :
                                                                "bg-red-100 text-red-700"
                                                    }`}>
                                                        {call.status}
                                                    </span>
                                            </td>
                                            <td className="py-4 px-6 text-gray-600">{call.operator}</td>
                                            <td className="py-4 px-6 text-gray-600">{call.date}</td>
                                            <td className="py-4 px-6">
                                                <div className="flex items-center space-x-2">
                                                    <button className="p-1 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded">
                                                        <Eye className="w-4 h-4" />
                                                    </button>
                                                    <button className="p-1 text-green-600 hover:text-green-800 hover:bg-green-50 rounded">
                                                        <PlayCircle className="w-4 h-4" />
                                                    </button>
                                                    <button className="p-1 text-gray-600 hover:text-gray-800 hover:bg-gray-50 rounded">
                                                        <Download className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}

                {window.location.pathname === "/reports" && (
                    <div className="space-y-6">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 mb-2">Raporlar</h1>
                            <p className="text-gray-600">Sistem performansı ve kullanım raporlarını görüntüleyin</p>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* Günlük Rapor */}
                            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-lg font-semibold text-gray-900">Günlük Çağrı Raporu</h3>
                                    <button className="px-3 py-1 bg-blue-600 text-white text-xs rounded-lg hover:bg-blue-700">
                                        PDF İndir
                                    </button>
                                </div>
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                                        <span className="text-gray-600">Toplam Çağrı</span>
                                        <span className="font-semibold text-gray-900">156</span>
                                    </div>
                                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                                        <span className="text-gray-600">Yanıtlanan</span>
                                        <span className="font-semibold text-green-600">142</span>
                                    </div>
                                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                                        <span className="text-gray-600">Kayıp Çağrı</span>
                                        <span className="font-semibold text-red-600">14</span>
                                    </div>
                                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                                        <span className="text-gray-600">Ortalama Süre</span>
                                        <span className="font-semibold text-gray-900">4:32</span>
                                    </div>
                                </div>
                            </div>

                            {/* Kullanıcı Performansı */}
                            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-lg font-semibold text-gray-900">Kullanıcı Performansı</h3>
                                    <button className="px-3 py-1 bg-green-600 text-white text-xs rounded-lg hover:bg-green-700">
                                        Excel İndir
                                    </button>
                                </div>
                                <div className="space-y-3">
                                    {users.slice(0, 4).map((user, index) => (
                                        <div key={user.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                            <div className="flex items-center space-x-3">
                                                <div className="w-8 h-8 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full flex items-center justify-center">
                                                    <span className="text-xs font-medium text-white">
                                                        {user.name.split(' ').map(n => n[0]).join('')}
                                                    </span>
                                                </div>
                                                <div>
                                                    <div className="text-sm font-medium text-gray-900">{user.name}</div>
                                                    {/* <div className="text-xs text-gray-500">{user.department}</div> */}
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                {/* <div className="text-sm font-semibold text-gray-900">{user.callCount}</div> */}
                                                <div className="text-xs text-gray-500">çağrı</div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Haftalık Trend */}
                            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">Haftalık Trend</h3>
                                <div className="h-48 bg-gray-50 rounded-lg flex items-center justify-center">
                                    <div className="text-center">
                                        <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                                        <p className="text-gray-500">Haftalık çağrı trendi</p>
                                    </div>
                                </div>
                            </div>

                            {/* Sistem Durumu */}
                            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">Sistem Durumu</h3>
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200">
                                        <div className="flex items-center space-x-2">
                                            <CheckCircle className="w-5 h-5 text-green-600" />
                                            <span className="text-sm font-medium text-green-800">Çağrı Kayıt Sistemi</span>
                                        </div>
                                        <span className="text-xs text-green-600">Aktif</span>
                                    </div>
                                    <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200">
                                        <div className="flex items-center space-x-2">
                                            <CheckCircle className="w-5 h-5 text-green-600" />
                                            <span className="text-sm font-medium text-green-800">Kimlik Doğrulama</span>
                                        </div>
                                        <span className="text-xs text-green-600">Aktif</span>
                                    </div>
                                    <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                                        <div className="flex items-center space-x-2">
                                            <Clock className="w-5 h-5 text-yellow-600" />
                                            <span className="text-sm font-medium text-yellow-800">Şifre Sıfırlama</span>
                                        </div>
                                        <span className="text-xs text-yellow-600">Bakımda</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </main>

            {/* Modal Components */}
            {showAddUserModal && <AddUserModal />}
            {selectedUser && <EditUserModal />}
            {/* Pop-up (toast) */}
            {showSavedPopup && (
                <div className="fixed top-6 right-6 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 animate-fade-in">
                    Kaydedildi
                </div>
            )}
            {showResetMailPopup && resetMailUser && (
                <div className="fixed top-20 right-6 bg-blue-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 animate-fade-in">
                    {resetMailUser} adresine şifre sıfırlama bağlantısı gönderildi
                </div>
            )}
        </div>
    );
};

export default KarelAdminPanel;