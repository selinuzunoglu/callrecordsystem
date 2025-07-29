import React, { useState, useEffect } from "react";
import { Search, Edit, Trash2, Mail, UserPlus, Filter, Download } from "lucide-react";
import { Shield } from "lucide-react";

// Kullanıcı tipi
type UserType = {
    id: number;
    name: string;
    surname?: string;
    username: string;
    email: string;
    status: string;
};

// Yetki tipi
type PermissionType = {
    permissionId: number;
    code: string;
    name: string;
    description: string;
    disabled: boolean;
};

const UsersPage = () => {
    const [users, setUsers] = useState<UserType[]>([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [showAddUserModal, setShowAddUserModal] = useState(false);
    const [selectedUser, setSelectedUser] = useState<UserType | null>(null);
    const [editForm, setEditForm] = useState({ name: '', surname: '', username: '', email: '' });
    const [showSavedPopup, setShowSavedPopup] = useState(false);
    const [showResetMailPopup, setShowResetMailPopup] = useState(false);
    const [resetMailUser, setResetMailUser] = useState<string | null>(null);
    const [showPermissionModal, setShowPermissionModal] = useState(false);
    const [permissionUser, setPermissionUser] = useState<UserType | null>(null);
    const role = localStorage.getItem("role") || "admin";
    const [userPermissions, setUserPermissions] = useState<PermissionType[]>([]);

    // Sayfa koruması: admin değilse ve user_manage yoksa yönlendir
    useEffect(() => {
        const permissions = JSON.parse(localStorage.getItem("permissions") || "[]");
        if (!permissions.includes("user_manage")) {
            window.location.href = "/dashboard";
        }
    }, []);

    const fetchUsers = async () => {
        const response = await fetch('http://localhost:8080/api/users');
        if (response.ok) {
            const data = await response.json();
            setUsers(data);
        }
    };
    useEffect(() => { fetchUsers(); }, []);

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

    // Kullanıcı ekleme
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
    // Kullanıcı silme
    const handleDeleteUser = async (userId: number, username: string) => {
        if (username === "admin") return;
        const confirmed = window.confirm("Emin misiniz? Bu kullanıcıyı silmek istediğinize?");
        if (!confirmed) return;
        const response = await fetch(`http://localhost:8080/api/users/${userId}`, { method: 'DELETE' });
        if (response.ok) {
            setUsers(users.filter(user => user.id !== userId));
        } else {
            alert('Kullanıcı silinemedi!');
        }
    };
    // Kullanıcı düzenleme
    const handleEditUser = (user: UserType) => {
        setSelectedUser(user);
        setEditForm({
            name: user.name || '',
            surname: user.surname || '',
            username: user.username || '',
            email: user.email || ''
        });
    };
    // Kullanıcı güncelleme
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
            setShowSavedPopup(true);
            setTimeout(() => setShowSavedPopup(false), 2000);
        } else {
            alert('Kullanıcı güncellenemedi!');
        }
    };
    // Şifre sıfırlama
    const handleResetPassword = async (user: UserType) => {
        const response = await fetch(`http://localhost:8080/api/users/${user.id}/reset-password`, { method: 'POST' });
        if (response.ok) {
            setResetMailUser(user.email);
            setShowResetMailPopup(true);
            setTimeout(() => setShowResetMailPopup(false), 2500);
        } else {
            alert('Şifre sıfırlama bağlantısı gönderilemedi!');
        }
    };

    // Kullanıcı satırında Yetkiler butonu
    const handleOpenPermissionPage = (user: UserType) => {
        window.location.href = `/users/${user.id}/permissions`;
    };

    // Modal açıldığında kullanıcının yetkilerini backend'den çek
    useEffect(() => {
        if (showPermissionModal && permissionUser) {
            fetch(`http://localhost:8080/api/users/${permissionUser.id}/permissions`)
                .then(res => res.json())
                .then(data => setUserPermissions(data));
        }
    }, [showPermissionModal, permissionUser]);

    // Yetki değişince backend'e PATCH isteği at
    const handlePermissionToggle = (perm: PermissionType) => {
        if (!permissionUser) return;
        fetch(`http://localhost:8080/api/users/${permissionUser.id}/permissions/${perm.permissionId}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ disabled: !perm.disabled })
        }).then(() => {
            setUserPermissions((perms) => perms.map((p) =>
                p.permissionId === perm.permissionId ? { ...p, disabled: !perm.disabled } : p
            ));
        });
    };

    // Kullanıcı ekleme modalı
    const AddUserModal = () => {
        const [formData, setFormData] = useState({ name: '', surname: '', username: '', email: '' });
        const handleSubmit = (e: React.FormEvent) => {
            e.preventDefault();
            handleAddUser(formData);
            setFormData({ name: '', surname: '', username: '', email: '' });
        };
        return (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white rounded-xl p-6 w-full max-w-md">
                    <h2 className="text-xl font-semibold mb-4 text-gray-800">Yeni Kullanıcı Ekle</h2>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">İsim *</label>
                            <input type="text" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Örn: Ahmet" required />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Soyisim *</label>
                            <input type="text" value={formData.surname} onChange={e => setFormData({ ...formData, surname: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Örn: Yılmaz" required />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Kullanıcı Adı *</label>
                            <input type="text" value={formData.username} onChange={e => setFormData({ ...formData, username: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Örn: ahmet.yilmaz" required title="Kullanıcı adı en az 3 karakter olmalı ve sadece harf, rakam, nokta, alt çizgi veya tire içerebilir." />
                            <p className="text-xs text-gray-500 mt-1">Kullanıcı giriş yaparken bu adı kullanacak</p>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">E-posta *</label>
                            <input type="email" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="ornek@karel.com" required />
                        </div>
                        <div className="flex justify-end space-x-3 pt-4 border-t border-gray-100">
                            <button type="button" onClick={() => { setShowAddUserModal(false); setSelectedUser(null); }} className="px-4 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors">İptal</button>
                            <button type="submit" className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium">Kullanıcı Ekle</button>
                        </div>
                    </form>
                </div>
            </div>
        );
    };
    // Kullanıcı düzenleme modalı
    const EditUserModal = () => (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-6 w-full max-w-md">
                <h2 className="text-xl font-semibold mb-4 text-gray-800">Kullanıcıyı Düzenle</h2>
                <form onSubmit={handleUpdateUser} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">İsim *</label>
                        <input type="text" value={editForm.name} onChange={e => setEditForm({ ...editForm, name: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" required />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Soyisim *</label>
                        <input type="text" value={editForm.surname} onChange={e => setEditForm({ ...editForm, surname: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" required />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Kullanıcı Adı *</label>
                        <input type="text" value={editForm.username} onChange={e => setEditForm({ ...editForm, username: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" required />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">E-posta *</label>
                        <input type="email" value={editForm.email} disabled className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-500 cursor-not-allowed focus:outline-none" required />
                    </div>
                    <div className="flex justify-end space-x-3 pt-4 border-t border-gray-100">
                        <button type="button" onClick={() => setSelectedUser(null)} className="px-4 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors">İptal</button>
                        <button type="submit" className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium">Kaydet</button>
                    </div>
                </form>
            </div>
        </div>
    );

    return (
        <main className="px-6 py-8">
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
                                <th className="text-left py-4 px-6 text-sm font-medium text-gray-600">İsim</th>
                                <th className="text-left py-4 px-6 text-sm font-medium text-gray-600">Soyisim</th>
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
                                    <td className="py-4 px-6">{user.surname}</td>
                                    <td className="py-4 px-6">
                                        <span className="font-mono text-sm bg-gray-100 px-2 py-1 rounded text-gray-800">
                                            {user.username}
                                        </span>
                                    </td>
                                    <td className="py-4 px-6 text-gray-600">{user.email}</td>
                                    <td className="py-4 px-6">
                                        {user.username === "admin" ? (
                                            <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-sm font-semibold">Admin</span>
                                        ) : (
                                            <span className={
                                                user.status === "Aktif" ? "bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm" :
                                                    user.status === "Davet Gönderildi" ? "bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full text-sm" :
                                                        "bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm"
                                            }>
                                                {user.status}
                                            </span>
                                        )}
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
                                            <button
                                                onClick={() => handleOpenPermissionPage(user)}
                                                className="p-1 text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50 rounded"
                                                title="Yetkiler"
                                            >
                                                <Shield className="w-4 h-4" />
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
            {showAddUserModal && <AddUserModal />}
            {selectedUser && <EditUserModal />}
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
        </main>
    );
};

export default UsersPage;
