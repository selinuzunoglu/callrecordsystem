import React, { useState, useEffect } from "react";

const SantralPage = () => {
  const [pbxData, setPbxData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [newPbx, setNewPbx] = useState({ name: "", active: true });
  const [editModal, setEditModal] = useState<{open: boolean, pbx: any | null}>({open: false, pbx: null});
  const [editPbx, setEditPbx] = useState<{name: string, active: boolean}>({name: "", active: true});
  const [showDeleted, setShowDeleted] = useState(false);
  const [showAddDsModal, setShowAddDsModal] = useState<{open: boolean, pbxId: number | null}>({open: false, pbxId: null});
  const [newDs, setNewDs] = useState({ name: "", ip: "" });
  const [editDsModal, setEditDsModal] = useState<{open: boolean, ds: any, pbxId: number | null}>({open: false, ds: null, pbxId: null});
  const [editDs, setEditDs] = useState<{name: string, ip: string}>({name: "", ip: ""});
  const [expandedPbx, setExpandedPbx] = useState<number | null>(null);

    useEffect(() => {
    setLoading(true);
    fetch("/api/pbxes/with-data-sources")
      .then(res => {
        if (!res.ok) throw new Error("Santral verisi alınamadı");
        return res.json();
      })
      .then(data => setPbxData(data))
      .catch(() => setError("Santral verisi alınamadı"))
      .finally(() => setLoading(false));
    }, []);

  useEffect(() => {
    if (editDsModal.open && editDsModal.ds) {
      setEditDs({ name: editDsModal.ds.name, ip: editDsModal.ds.ip });
    }
  }, [editDsModal]);

  const username = localStorage.getItem("username") || "admin";

  const handleAddPbx = () => {
    setShowAddModal(false); // Formu hemen kapat
    fetch("/api/pbxes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...newPbx, created_by: username }),
    })
      .then(res => {
        if (!res.ok) throw new Error("Santral eklenemedi");
        return res.json();
      })
      .then(added => {
        if (!added.created_by) added.created_by = username;
        setPbxData(prev => [...prev, { ...added, data_sources: [] }]);
        setNewPbx({ name: "", active: true });
      })
      .catch(() => alert("Santral eklenemedi!"));
  };

  const handleSoftDelete = (id: number) => {
    // Optimistic update: Anında state güncelle
    setPbxData(prev => prev.map(p =>
      p.id === id ? { ...p, deleted_at: new Date().toISOString(), deleted_by: username } : p
    ));
    // Sonra backend'e isteği gönder
    fetch(`/api/pbxes/${id}/soft-delete?deletedBy=${username}`, { method: 'PATCH' })
      .then(res => res.json())
      .then(updated => {
        setPbxData(prev => prev.map(p => p.id === id ? { ...p, ...updated } : p));
      });
  };

  const handleEditClick = (pbx: any) => {
    setEditPbx({ name: pbx.name, active: pbx.active });
    setEditModal({ open: true, pbx });
  };

  const handleEditSave = () => {
    if (!editModal.pbx) return;
    // Tabloyu hemen güncelle (optimistic update)
    setPbxData(prev => prev.map(p =>
      p.id === editModal.pbx.id
        ? {
            ...p,
            name: editPbx.name,
            active: editPbx.active,
            updated_at: new Date().toISOString(),
            updated_by: username
          }
        : p
    ));
    setEditModal({ open: false, pbx: null }); // Modalı hemen kapat
    fetch(`/api/pbxes/${editModal.pbx.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: editPbx.name,
        active: editPbx.active,
        updated_by: username
      }),
    })
      .then(res => res.json())
      .then(updated => {
        // Backend'den dönen veriyle tekrar güncelle (gerekirse)
        setPbxData(prev => prev.map(p => p.id === updated.id ? { ...p, ...updated } : p));
      });
  };

  const handleUndoDelete = (id: number) => {
    // Optimistic update: Anında state güncelle
    setPbxData(prev => prev.map(p =>
      p.id === id ? { ...p, deleted_at: null, deleted_by: null } : p
    ));
    // Sonra backend'e isteği gönder
    fetch(`/api/pbxes/${id}/undo-delete`, { method: 'PATCH' })
      .then(res => res.json())
      .then(updated => {
        // Backend'den dönen veriyle tekrar güncelle (gerekirse)
        setPbxData(prev => prev.map(p => p.id === id ? { ...p, ...updated } : p));
      });
  };

  const handleAddDs = () => {
    if (!showAddDsModal.pbxId) return;
    fetch(`/api/data_source?pbx_id=${showAddDsModal.pbxId}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...newDs,
        created_by: username
      }),
    })
      .then(res => res.json())
      .then(added => {
        setPbxData(prev => prev.map(p =>
          p.id === showAddDsModal.pbxId
            ? { ...p, data_sources: [...(p.data_sources || []), { ...added, pbx_id: showAddDsModal.pbxId }] }
            : p
        ));
        setShowAddDsModal({ open: false, pbxId: null });
        setNewDs({ name: "", ip: "" });
      });
  };

  const handleSoftDeleteDs = (id: number) => {
    // Optimistic update: Anında state güncelle
    setPbxData(prev => prev.map(p => ({
      ...p,
      data_sources: p.data_sources.map((ds: any) =>
        ds.id === id ? { ...ds, deleted_at: new Date().toISOString(), deleted_by: username } : ds
      )
    })));
    // Sonra backend'e isteği gönder
    fetch(`/api/data_source/${id}/soft-delete?deletedBy=${username}`, { method: 'PATCH' })
      .then(res => res.json())
      .then(updated => {
        setPbxData(prev => prev.map(p => ({
          ...p,
          data_sources: p.data_sources.map(ds => ds.id === id ? { ...ds, ...updated } : ds)
        })));
      });
  };
  const handleUndoDeleteDs = (id: number) => {
    // Optimistic update: Anında state güncelle
    setPbxData(prev => prev.map(p => ({
      ...p,
      data_sources: p.data_sources.map((ds: any) =>
        ds.id === id ? { ...ds, deleted_at: null, deleted_by: null } : ds
      )
    })));
    // Sonra backend'e isteği gönder
    fetch(`/api/data_source/${id}/undo-delete`, { method: 'PATCH' })
      .then(res => res.json())
      .then(updated => {
        // Backend'den dönen veriyle tekrar güncelle (gerekirse)
        setPbxData(prev => prev.map(p => ({
          ...p,
          data_sources: p.data_sources.map((ds: any) =>
            ds.id === id ? { ...ds, ...updated } : ds
          )
        })));
      });
  };

  const handleEditDsSave = () => {
    if (!editDsModal.ds || !editDsModal.pbxId) return;
    // Optimistic update
    setPbxData(prev => prev.map(p =>
      p.id === editDsModal.pbxId
        ? {
            ...p,
            data_sources: p.data_sources.map((ds: any) =>
              ds.id === editDsModal.ds.id
                ? {
                    ...ds,
                    name: editDs.name,
                    ip: editDs.ip,
                    updated_at: new Date().toISOString(),
                    updated_by: username
                  }
                : ds
            )
          }
        : p
    ));
    setEditDsModal({ open: false, ds: null, pbxId: null });
    fetch(`/api/data_source/${editDsModal.ds.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: editDs.name,
        ip: editDs.ip,
        updated_by: username
      }),
    })
      .then(res => res.json())
      .then(updated => {
        setPbxData(prev => prev.map(p =>
          p.id === editDsModal.pbxId
            ? {
                ...p,
                data_sources: p.data_sources.map((ds: any) =>
                  ds.id === updated.id ? { ...ds, ...updated } : ds
                )
              }
            : p
        ));
      });
  };

  const toggleDataSources = (pbxId: number) => {
    setExpandedPbx(expandedPbx === pbxId ? null : pbxId);
  };

  // pbxData'yı filtrele
  const visiblePbxData = showDeleted
    ? pbxData
    : pbxData.filter(pbx => !pbx.deleted_at);

    return (
        <div className="space-y-6 px-4 md:px-10 mt-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-4">Santral Yönetimi</h1>
      <div className="flex justify-between mb-4">
        <button
          className="px-4 py-2 bg-blue-600 text-white rounded"
          onClick={() => setShowAddModal(true)}
        >
          Santral Ekle
                    </button>
        <label className="flex items-center space-x-2">
          <input type="checkbox" checked={showDeleted} onChange={e => setShowDeleted(e.target.checked)} />
          <span>Silinenleri Göster</span>
        </label>
            </div>

      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded shadow w-80">
            <h2 className="text-lg font-bold mb-4">Yeni Santral Ekle</h2>
            <input
              className="border p-2 w-full mb-2"
              placeholder="Santral adı"
              value={newPbx.name}
              onChange={e => setNewPbx({ ...newPbx, name: e.target.value })}
            />
            <label className="flex items-center mb-4">
              <input
                type="checkbox"
                checked={newPbx.active}
                onChange={e => setNewPbx({ ...newPbx, active: e.target.checked })}
              />
              <span className="ml-2">Aktif</span>
            </label>
            <div className="flex justify-end space-x-2">
              <button onClick={() => setShowAddModal(false)} className="px-3 py-1">İptal</button>
              <button onClick={handleAddPbx} className="px-3 py-1 bg-blue-600 text-white rounded">Kaydet</button>
            </div>
                        </div>
                    </div>
      )}
      {loading ? (
        <div>Yükleniyor...</div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 px-4 md:px-8">
                    <table className="w-full">
                        <thead>
                        <tr className="border-b border-gray-100">
                            <th className="text-left py-4 px-6 text-sm font-medium text-gray-600">Santral Adı</th>
                <th className="text-left py-4 px-6 text-sm font-medium text-gray-600">Aktif mi?</th>
                <th className="text-left py-4 px-6 text-sm font-medium text-gray-600">Oluşturulma Tarihi</th>
                <th className="text-left py-4 px-6 text-sm font-medium text-gray-600">Oluşturan</th>
                <th className="text-left py-4 px-6 text-sm font-medium text-gray-600">Güncellenme Tarihi</th>
                <th className="text-left py-4 px-6 text-sm font-medium text-gray-600">Güncelleyen</th>
                <th className="text-left py-4 px-6 text-sm font-medium text-gray-600">Silinme Tarihi</th>
                <th className="text-left py-4 px-6 text-sm font-medium text-gray-600">Silen</th>
                <th className="text-left py-4 px-6 text-sm font-medium text-gray-600">Veri Kaynakları</th>
                <th className="text-left py-4 px-6 text-sm font-medium text-gray-600">Düzenle</th>
                        </tr>
                        </thead>
                        <tbody>
              {visiblePbxData.map((pbx) => (
                <React.Fragment key={pbx.id}>
                  <tr className={`border-b border-gray-50 ${pbx.deleted_at ? 'bg-gray-100 text-gray-400' : ''}`}>
                    <td className="py-4 px-6 font-medium text-gray-900">{pbx.name}</td>
                    <td className="py-4 px-6">{pbx.active ? "Aktif" : "Pasif"}</td>
                    <td className="py-4 px-6">{pbx.created_at ? new Date(pbx.created_at).toLocaleString() : "-"}</td>
                    <td className="py-4 px-6">{pbx.created_by || "-"}</td>
                    <td className="py-4 px-6">{pbx.updated_at ? new Date(pbx.updated_at).toLocaleString() : "-"}</td>
                    <td className="py-4 px-6">{pbx.updated_by || "-"}</td>
                    <td className="py-4 px-6">{pbx.deleted_at ? new Date(pbx.deleted_at).toLocaleString() : "-"}</td>
                    <td className="py-4 px-6">{pbx.deleted_by || "-"}</td>
                    <td className="py-4 px-6">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => toggleDataSources(pbx.id)}
                          className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded transition"
                          title={`${pbx.name} - Veri Kaynakları`}
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01" />
                          </svg>
                        </button>
                        <span className="text-sm text-gray-500">
                          ({(pbx.data_sources as any[]).filter((ds: any) => showDeleted || !ds.deleted_at).length} kaynak)
                        </span>
                      </div>
                    </td>
                    <td className="py-4 px-6 flex gap-2">
                      <button
                        onClick={() => handleEditClick(pbx)}
                        className="w-7 h-7 flex items-center justify-center text-blue-500 hover:bg-gray-100 rounded transition"
                        title="Düzenle"
                        style={{ minWidth: 28, minHeight: 28, background: 'none', border: 'none' }}
                      >
                        ✏️
                                        </button>
                      {!pbx.deleted_at && (
                        <button
                          onClick={() => handleSoftDelete(pbx.id)}
                          className="w-7 h-7 flex items-center justify-center text-red-500 hover:bg-gray-100 rounded transition"
                          title="Sil"
                          style={{ minWidth: 28, minHeight: 28, background: 'none', border: 'none' }}
                        >
                          🗑️
                                        </button>
                      )}
                      {pbx.deleted_at && (
                        <button
                          onClick={() => handleUndoDelete(pbx.id)}
                          className="w-7 h-7 flex items-center justify-center text-green-500 hover:bg-gray-100 rounded transition"
                          title="Geri Al"
                          style={{ minWidth: 28, minHeight: 28, background: 'none', border: 'none' }}
                        >
                          ♻️
                                        </button>
                      )}
                    </td>
                  </tr>
                  {expandedPbx === pbx.id && (
                    <tr className="bg-gray-50">
                      <td colSpan={10} className="px-6 py-4">
                        <div className="bg-white rounded-lg border border-gray-200 p-4">
                          <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold text-gray-900">{pbx.name} - Veri Kaynakları</h3>
                            <button
                              className="px-3 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 text-sm"
                              onClick={() => setShowAddDsModal({ open: true, pbxId: pbx.id })}
                            >
                              + Veri Kaynağı Ekle
                            </button>
                          </div>
                          <div className="overflow-x-auto">
                            <table className="w-full border border-gray-200">
                              <thead>
                                <tr className="bg-gray-50">
                                  <th className="px-3 py-2 text-sm font-medium text-gray-600 text-left">Ad</th>
                                  <th className="px-3 py-2 text-sm font-medium text-gray-600 text-left">IP</th>
                                  <th className="px-3 py-2 text-sm font-medium text-gray-600 text-left">Oluşturan</th>
                                  <th className="px-3 py-2 text-sm font-medium text-gray-600 text-left">Güncellenme</th>
                                  <th className="px-3 py-2 text-sm font-medium text-gray-600 text-left">Güncelleyen</th>
                                  <th className="px-3 py-2 text-sm font-medium text-gray-600 text-left">Silinme Tarihi</th>
                                  <th className="px-3 py-2 text-sm font-medium text-gray-600 text-left">Silen</th>
                                  <th className="px-3 py-2 text-sm font-medium text-gray-600 text-left">İşlem</th>
                                </tr>
                              </thead>
                              <tbody>
                                {(pbx.data_sources as any[]).filter((ds: any) => showDeleted || !ds.deleted_at).map((ds: any) => (
                                  <tr key={ds.id} className={`border-t border-gray-100 ${ds.deleted_at ? 'bg-gray-100 text-gray-400' : ''}`}>
                                    <td className="px-3 py-2 text-sm">{ds.name}</td>
                                    <td className="px-3 py-2 text-sm font-mono">{ds.ip}</td>
                                    <td className="px-3 py-2 text-sm">{ds.created_by || "-"}</td>
                                    <td className="px-3 py-2 text-sm">{ds.updated_at ? new Date(ds.updated_at).toLocaleString() : "-"}</td>
                                    <td className="px-3 py-2 text-sm">{ds.updated_by || "-"}</td>
                                    <td className="px-3 py-2 text-sm">{ds.deleted_at ? new Date(ds.deleted_at).toLocaleString() : "-"}</td>
                                    <td className="px-3 py-2 text-sm">{ds.deleted_by || "-"}</td>
                                    <td className="px-3 py-2 text-sm">
                                      <div className="flex gap-1">
                                        <button
                                          onClick={() => setEditDsModal({ open: true, ds, pbxId: pbx.id })}
                                          className="w-6 h-6 flex items-center justify-center text-blue-500 hover:bg-gray-100 rounded transition"
                                          title="Düzenle"
                                        >
                                          ✏️
                                        </button>
                                        {!ds.deleted_at && (
                                          <button
                                            onClick={() => handleSoftDeleteDs(ds.id)}
                                            className="w-6 h-6 flex items-center justify-center text-red-500 hover:bg-gray-100 rounded transition"
                                            title="Sil"
                                          >
                                            🗑️
                                          </button>
                                        )}
                                        {ds.deleted_at && (
                                          <button
                                            onClick={() => handleUndoDeleteDs(ds.id)}
                                            className="w-6 h-6 flex items-center justify-center text-green-500 hover:bg-gray-100 rounded transition"
                                            title="Geri Al"
                                          >
                                            ♻️
                                          </button>
                                        )}
                                      </div>
                                    </td>
                                  </tr>
                                ))}
                                {(pbx.data_sources as any[]).filter((ds: any) => showDeleted || !ds.deleted_at).length === 0 && (
                                  <tr>
                                    <td colSpan={8} className="px-3 py-4 text-center text-gray-500">
                                      Bu santral için henüz veri kaynağı eklenmemiş.
                                    </td>
                                  </tr>
                                )}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
                        </tbody>
                    </table>
        </div>
      )}
      {editModal.open && editModal.pbx && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded shadow w-96">
            <h2 className="text-lg font-bold mb-4">Santral Düzenle</h2>
            <input
              className="border p-2 w-full mb-2"
              placeholder="Santral adı"
              value={editPbx.name}
              onChange={e => setEditPbx({ ...editPbx, name: e.target.value })}
            />
            <label className="flex items-center mb-2">
              <input
                type="checkbox"
                checked={editPbx.active}
                onChange={e => setEditPbx({ ...editPbx, active: e.target.checked })}
              />
              <span className="ml-2">Aktif</span>
            </label>
            <div className="mb-2 text-sm text-gray-600">
              <div>Oluşturan: <input className="border p-1 w-40" value={editModal.pbx.created_by || "-"} readOnly /></div>
              <div>Oluşturulma Tarihi: <input className="border p-1 w-40" value={editModal.pbx.created_at ? new Date(editModal.pbx.created_at).toLocaleString() : "-"} readOnly /></div>
            </div>
            <div className="flex justify-end space-x-2">
              <button onClick={() => setEditModal({ open: false, pbx: null })} className="px-3 py-1">İptal</button>
              <button onClick={handleEditSave} className="px-3 py-1 bg-blue-600 text-white rounded">Kaydet</button>
            </div>
          </div>
        </div>
      )}
      {showAddDsModal.open && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded shadow w-96 max-w-full">
            <h2 className="text-lg font-bold mb-4">Veri Kaynağı Ekle</h2>
            <input
              className="border p-2 w-full mb-2"
              placeholder="Ad"
              value={newDs.name}
              onChange={e => setNewDs({ ...newDs, name: e.target.value })}
            />
            <input
              className="border p-2 w-full mb-2"
              placeholder="IP adresi"
              value={newDs.ip}
              onChange={e => setNewDs({ ...newDs, ip: e.target.value })}
            />
            <div className="flex justify-end space-x-2">
              <button onClick={() => setShowAddDsModal({ open: false, pbxId: null })} className="px-3 py-1">İptal</button>
              <button onClick={handleAddDs} className="px-3 py-1 bg-blue-600 text-white rounded">Kaydet</button>
            </div>
          </div>
        </div>
      )}
      {editDsModal.open && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded shadow w-96 max-w-full">
            <h2 className="text-lg font-bold mb-4">Veri Kaynağı Düzenle</h2>
            <input
              className="border p-2 w-full mb-2"
              placeholder="Ad"
              value={editDs.name}
              onChange={e => setEditDs({ ...editDs, name: e.target.value })}
            />
            <input
              className="border p-2 w-full mb-2"
              placeholder="IP adresi"
              value={editDs.ip}
              onChange={e => setEditDs({ ...editDs, ip: e.target.value })}
            />
            <div className="flex justify-end space-x-2">
              <button onClick={() => setEditDsModal({ open: false, ds: null, pbxId: null })} className="px-3 py-1">İptal</button>
              <button onClick={handleEditDsSave} className="px-3 py-1 bg-blue-600 text-white rounded">Kaydet</button>
                </div>
            </div>
        </div>
      )}
        </div>
    );
};

export default SantralPage;