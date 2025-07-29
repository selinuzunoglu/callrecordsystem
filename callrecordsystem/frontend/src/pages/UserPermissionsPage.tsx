import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";

interface PermissionType {
  permissionId: number;
  code: string;
  name: string;
  description: string;
  disabled: boolean;
  hasOverride?: boolean; // user_permission tablosunda kayıt var mı?
}

interface RoleType {
  id: number;
  code: string;
  name: string;
}

const UserPermissionsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [permissions, setPermissions] = useState<PermissionType[]>([]);
  const [userName, setUserName] = useState("");
  const [userRoles, setUserRoles] = useState<RoleType[]>([]);
  const [rolePermissions, setRolePermissions] = useState<number[]>([]); // permissionId list
  const [loading, setLoading] = useState(false);
  const [allRoles, setAllRoles] = useState<RoleType[]>([]);
  const [showRoleMenu, setShowRoleMenu] = useState(false);
  const roleMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch(`http://localhost:8080/api/users/roles`)
      .then(res => res.ok ? res.json() : [])
      .then(data => setAllRoles(data || []));
  }, []);

  // Dışarı tıklanınca menüyü kapat
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (roleMenuRef.current && !roleMenuRef.current.contains(event.target as Node)) {
        setShowRoleMenu(false);
      }
    }
    if (showRoleMenu) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showRoleMenu]);

  useEffect(() => {
    if (userRoles.length === 0) return;
    Promise.all(userRoles.map(role =>
      fetch(`http://localhost:8080/api/roles/${role.id}/permissions`).then(res => res.ok ? res.json() : [])
    )).then(results => {
      const allPermIds = results.flat().map((p: any) => p.permissionId);
      setRolePermissions(Array.from(new Set(allPermIds)));
    });
  }, [userRoles]);

  // Sadece id değişince fetchPermissions çağır
  useEffect(() => {
    fetchPermissions();
  }, [id]);

  // user_permission tablosunda kayıt var mı kontrolü için ayrı bir endpoint yoksa, permissions API'si hasOverride döndürmeli.
  // Burada simüle etmek için: Eğer disabled true/false ise ve user_permission tablosunda kayıt varsa, hasOverride=true olmalı.
  // Backend'den bu bilgi gelmiyorsa, disabled alanı true/false ise hasOverride=true kabul edelim.
  const fetchPermissions = () => {
    fetch(`http://localhost:8080/api/users/${id}/roles`)
      .then(res => res.ok ? res.json() : [])
      .then(userRoles => {
        Promise.all(userRoles.map((role: any) =>
          fetch(`http://localhost:8080/api/roles/${role.id}/permissions`).then(res => res.ok ? res.json() : [])
        )).then(results => {
          const allPermIds = results.flat().map((p: any) => p.permissionId);
          setRolePermissions(Array.from(new Set(allPermIds)));
          // Sonra permissions'ı çek
          fetch(`http://localhost:8080/api/users/${id}/permissions`)
            .then(res => res.json())
            .then(data => {
              setPermissions(data.map((perm: any) => {
                // Hem camelCase hem snake_case destekle
                const permissionId = perm.permissionId ?? perm.permission_id;
                const hasOverride = perm.hasOverride ?? perm.has_override;
                const disabled = perm.disabled;
                return {
                  ...perm,
                  permissionId,
                  hasOverride,
                  disabled
                };
              }));
              // localStorage'a permissions yazma kodu kaldırıldı
            });
        });
      });
  };

  useEffect(() => {
    fetch(`http://localhost:8080/api/users/${id}/roles`)
      .then(res => res.ok ? res.json() : [])
      .then(data => {
        console.log('Kullanıcı rolleri:', data);
        setUserRoles(data || []);
      });
    fetch(`http://localhost:8080/api/users`)
      .then(res => res.json())
      .then(users => {
        const user = users.find((u: any) => u.id === Number(id));
        setUserName(user ? user.name : "");
      });
  }, [id]);

  // permissions ve rolePermissions güncellendikten sonra localStorage'a yazılan permissions dizisini, override ile kapalıysa asla eklenmeyecek şekilde ve rol mantığına göre güvenli şekilde güncelliyorum. Ayrıca, permissions veya rolePermissions değiştiğinde localStorage'a her zaman güncel haliyle yazılacak.
  useEffect(() => {
    const myUserId = localStorage.getItem("user_id");
    if (String(id) === String(myUserId)) {
      const openPerms = permissions
        .filter((perm: any) => {
          // Override varsa ve kapalıysa asla eklenmesin
          if (perm.hasOverride) return perm.disabled === false;
          // Override yoksa, sadece rolünde varsa ekle
          return rolePermissions.includes(perm.permissionId);
        })
        .map((perm: any) => perm.code);
      localStorage.setItem("permissions", JSON.stringify(openPerms));
    }
  }, [permissions, rolePermissions, id]);

  // Mantık: user_permission tablosunda kayıt varsa (hasOverride=true)
  //   - disabled=false => Açık/Kullanıcı
  //   - disabled=true  => Kapalı/Kullanıcı
  // Yoksa:
  //   - rolPermissions'da varsa => Açık/Rol
  //   - yoksa => Kapalı/Yok
  function getPermissionSource(perm: PermissionType): 'Kullanıcı' | 'Rol' | 'Yok' {
    if (perm.hasOverride) {
      return 'Kullanıcı';
    } else if (rolePermissions.includes(perm.permissionId)) {
      return 'Rol';
    } else {
      return 'Yok';
    }
  }

  function getPermissionStatus(perm: PermissionType): string {
    const source = getPermissionSource(perm);
    if (source === 'Kullanıcı') {
      return perm.disabled ? 'Kapalı' : 'Açık';
    } else if (source === 'Rol') {
      return 'Açık';
    } else {
      return 'Kapalı';
    }
  }

  const handleOverride = async (permissionId: number, disabled: boolean) => {
    setLoading(true);
    await fetch(`http://localhost:8080/api/users/${id}/permissions/${permissionId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ disabled })
    });
    await fetchPermissions(); // await ile bekle
    setLoading(false);
  };

  const handleRemoveOverride = async (permissionId: number) => {
    setLoading(true);
    await fetch(`http://localhost:8080/api/users/${id}/permissions/${permissionId}`, {
      method: "DELETE"
    });
    await fetchPermissions(); // await ile bekle
    setLoading(false);
  };

  const handleAddRole = async (roleId: number) => {
    const newRoleIds = [...userRoles.map(r => r.id), roleId];
    await fetch(`http://localhost:8080/api/users/${id}/roles`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newRoleIds)
    });
    setShowRoleMenu(false);
    // Roller güncellensin diye tekrar çek
    fetch(`http://localhost:8080/api/users/${id}/roles`)
      .then(res => res.ok ? res.json() : [])
      .then(data => setUserRoles(data || []));
  };

  const handleRemoveRole = async (roleId: number) => {
    await fetch(`http://localhost:8080/api/users/${id}/roles/${roleId}`, {
      method: "DELETE"
    });
    fetch(`http://localhost:8080/api/users/${id}/roles`)
      .then(res => res.ok ? res.json() : [])
      .then(data => setUserRoles(data || []));
  };

  return (
    <div className="py-8 px-6">
      <button onClick={() => navigate(-1)} className="mb-4 px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300 text-gray-700">Geri</button>
      <h2 className="text-2xl font-semibold mb-2">{userName} Yetkileri</h2>
      <div className="mb-6 flex gap-2 items-center">
        <span className="font-medium text-gray-600">Roller:</span>
        {userRoles.length === 0 ? (
          <span className="bg-gray-200 text-gray-500 px-3 py-1 rounded-full text-sm">Rol atanmamış</span>
        ) : (
          userRoles.map(role => (
            <span key={role.id} className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm flex items-center">
              {role.name}
              <button onClick={() => handleRemoveRole(role.id)} className="ml-1 text-red-500 hover:text-red-700 text-xs font-bold">×</button>
            </span>
          ))
        )}
        <div className="relative">
          <button onClick={() => {
            console.log('allRoles:', allRoles);
            console.log('userRoles:', userRoles);
            setShowRoleMenu(v => !v);
          }} className="ml-2 bg-gray-200 rounded-full w-7 h-7 flex items-center justify-center text-xl hover:bg-gray-300">+</button>
          {showRoleMenu && (
            <div ref={roleMenuRef} className="absolute left-0 top-full z-10 bg-white border rounded shadow p-2 mt-1">
              {allRoles.filter(r => !userRoles.some(ur => String(ur.id) === String(r.id))).length === 0 ? (
                <div className="text-gray-400 px-2 py-1">Tüm roller atanmış</div>
              ) : (
                allRoles.filter(r => !userRoles.some(ur => String(ur.id) === String(r.id))).map(role => (
                  <div key={role.id} onClick={() => handleAddRole(role.id)} className="cursor-pointer hover:bg-gray-100 px-2 py-1">{role.name}</div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-100">
              <th className="text-left py-4 px-6 text-sm font-medium text-gray-600">Yetki Adı</th>
              <th className="text-left py-4 px-6 text-sm font-medium text-gray-600">Açıklama</th>
              <th className="text-left py-4 px-6 text-sm font-medium text-gray-600">İşlem</th>
            </tr>
          </thead>
          <tbody>
            {permissions.map((perm) => {
              const source = getPermissionSource(perm);
              const isRol = source === 'Rol';
              return (
                <tr key={perm.permissionId} className="border-b border-gray-50">
                  <td className="py-4 px-6 flex items-center gap-2">
                    {perm.name}
                    {isRol && (
                      <span className="ml-2 px-2 py-1 rounded-full text-xs font-bold bg-yellow-200 text-yellow-900 border border-yellow-400">
                        Rolden getirildi
                      </span>
                    )}
                  </td>
                  <td className="py-4 px-6">{perm.description}</td>
                  <td className="py-4 px-6">
                    <div className="flex gap-2 items-center">
                      <button
                        disabled={loading}
                        onClick={() => handleOverride(perm.permissionId, false)}
                        className={`px-3 py-1 rounded text-xs ${perm.hasOverride && !perm.disabled ? 'bg-green-200 text-green-800' : !perm.hasOverride && rolePermissions.includes(perm.permissionId) ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-500'}`}
                      >
                        Açık yap
                      </button>
                      <button
                        disabled={loading}
                        onClick={() => handleOverride(perm.permissionId, true)}
                        className={`px-3 py-1 rounded text-xs ${perm.hasOverride && perm.disabled ? 'bg-red-200 text-red-800' : !perm.hasOverride && !rolePermissions.includes(perm.permissionId) ? 'bg-red-50 text-red-700' : 'bg-gray-100 text-gray-500'}`}
                      >
                        Kapalı yap
                      </button>
                      <button
                        disabled={loading || !perm.hasOverride}
                        onClick={() => handleRemoveOverride(perm.permissionId)}
                        className={`px-3 py-1 rounded text-xs ${perm.hasOverride ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-500'}`}
                      >
                        Rolden getir
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default UserPermissionsPage; 