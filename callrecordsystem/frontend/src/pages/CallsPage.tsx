import { Filter, Download, Search, Phone, Clock, Eye, PlayCircle, Calendar, X } from "lucide-react";
import { useState, useEffect, useCallback, useMemo } from "react";

interface CallLogType {
    id: number;
    call_id: string;
    switchboard_name: string;
    transfer_from?: number;
    transferred_to?: number;
    source_id: number;
    source_name: string;
    caller_phone_nr: string;
    called_phone_nr: string;
    call_type: string;
    started_at?: string;
    ended_at?: string;
    duration: number;
    audio_recording_file?: string;
}

interface SearchFilters {
    searchTerm: string;
    searchType: string; // 'all', 'id', 'phone', 'callType', 'pbx'
    callType: string;
    dateRange: {
        start: string;
        end: string;
    };
    pbxName: string;
    phoneNumber: string;
}

const CallsPage = () => {
    const [searchFilters, setSearchFilters] = useState<SearchFilters>({
        searchTerm: "",
        searchType: "all", // Varsayılan arama türü
        callType: "",
        dateRange: { start: "", end: "" },
        pbxName: "",
        phoneNumber: ""
    });
    
    const [calls, setCalls] = useState<CallLogType[]>([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(0);
    const [pageSize, setPageSize] = useState(10);
    const [totalPages, setTotalPages] = useState(0);
    const [totalElements, setTotalElements] = useState(0);
    const [error, setError] = useState<string | null>(null);
    const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
    const [isSearching, setIsSearching] = useState(false);

    useEffect(() => {
        const permissions = JSON.parse(localStorage.getItem("permissions") || "[]");
        if (!permissions.includes("call_view")) {
            window.location.href = "/dashboard";
        }
    }, []);

    // Debounced search function
    const debouncedSearch = useCallback(
        (() => {
            let timeoutId: any;
            return (filters: SearchFilters) => {
                clearTimeout(timeoutId);
                timeoutId = setTimeout(() => {
                    fetchCallLogs(0, pageSize, filters);
                }, 100);
            };
        })(),
        [pageSize]
    );

    const fetchCallLogs = useCallback(async (page: number, size: number, filters: SearchFilters) => {
        setLoading(true);
        setError(null);
        
        try {
            let url = `http://localhost:8080/api/call-logs/paginated?page=${page}&size=${size}&sortBy=id&sortDir=desc`;
            
            // Arama türüne göre farklı endpoint'ler kullan
            if (filters.searchTerm.trim()) {
                switch (filters.searchType) {
                    case 'id':
                        url = `http://localhost:8080/api/call-logs/search/id?id=${filters.searchTerm.trim()}&page=${page}&size=${size}`;
                        break;
                    case 'phone':
                        url = `http://localhost:8080/api/call-logs/search/phone?phoneNumber=${encodeURIComponent(filters.searchTerm.trim())}&page=${page}&size=${size}`;
                        break;
                    case 'callType':
                        url = `http://localhost:8080/api/call-logs/search/call-type?callType=${encodeURIComponent(filters.searchTerm.trim())}&page=${page}&size=${size}`;
                        break;
                    case 'pbx':
                        url = `http://localhost:8080/api/call-logs/search/pbx?pbxName=${encodeURIComponent(filters.searchTerm.trim())}&page=${page}&size=${size}`;
                        break;
                    default:
                        // Genel arama
                        url += `&search=${encodeURIComponent(filters.searchTerm.trim())}`;
                        break;
                }
            }
            
            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    "Content-Type": "application/json"
                }
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            
            if (data.error) {
                throw new Error(data.error);
            }
            
            setCalls(data.content || []);
            setTotalPages(data.total_pages || 0);
            setTotalElements(data.total_elements || 0);
            setCurrentPage(page);
            
        } catch (error) {
            console.error("Çağrı kayıtları yükleme hatası:", error);
            setError(error instanceof Error ? error.message : "Bilinmeyen hata");
        } finally {
            setLoading(false);
            setIsSearching(false);
        }
    }, [pageSize]);

    // İlk yükleme
    useEffect(() => {
        fetchCallLogs(0, pageSize, searchFilters);
    }, [fetchCallLogs]);

    // Arama filtreleri değiştiğinde
    useEffect(() => {
        if (searchFilters.searchTerm || searchFilters.callType || searchFilters.dateRange.start || 
            searchFilters.dateRange.end || searchFilters.pbxName || searchFilters.phoneNumber) {
            setIsSearching(true);
            debouncedSearch(searchFilters);
        } else {
            // Arama terimi yoksa tüm kayıtları yükle
            setCurrentPage(0);
            fetchCallLogs(0, pageSize, searchFilters);
        }
    }, [searchFilters, debouncedSearch, fetchCallLogs, pageSize]);

    // Sayfalama kontrolleri
    const handlePageChange = useCallback((page: number) => {
        fetchCallLogs(page, pageSize, searchFilters);
    }, [fetchCallLogs, pageSize, searchFilters]);

    const handlePageSizeChange = useCallback((size: number) => {
        setPageSize(size);
        fetchCallLogs(0, size, searchFilters);
    }, [fetchCallLogs, searchFilters]);

    // Filtre temizleme
    const clearFilters = useCallback(() => {
        const emptyFilters = {
            searchTerm: "",
            searchType: "all",
            callType: "",
            dateRange: { start: "", end: "" },
            pbxName: "",
            phoneNumber: ""
        };
        setSearchFilters(emptyFilters);
        // Filtreleri temizledikten sonra ilk sayfayı yükle
        setCurrentPage(0);
        fetchCallLogs(0, pageSize, emptyFilters);
    }, [fetchCallLogs, pageSize]);

    const getStatus = (call: CallLogType) => {
        if (!call.ended_at) return "Devam Ediyor";
        if (call.duration === 0) return "Kayıp";
        return "Tamamlandı";
    };

    const formatDuration = (seconds: number) => {
        if (!seconds) return "-";
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;
        
        if (hours > 0) {
            return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
        }
        return `${minutes}:${secs.toString().padStart(2, '0')}`;
    };

    // Memoized table rows for performance
    const tableRows = useMemo(() => {
        return calls.map((call) => (
            <tr key={call.id} className="border-b border-gray-50 hover:bg-gray-50">
                <td className="py-3 px-4">
                    <span className="font-mono text-sm text-gray-900">{call.id}</span>
                </td>
                <td className="py-3 px-4">
                    <span className="font-medium text-sm text-blue-600">{call.source_name}</span>
                </td>
                <td className="py-3 px-4 text-gray-600 text-sm">
                    {call.transfer_from || "-"}
                </td>
                <td className="py-3 px-4 text-gray-600 text-sm">
                    {call.transferred_to || "-"}
                </td>
                <td className="py-3 px-4">
                    <div className="flex items-center space-x-2">
                        <Phone className="w-4 h-4 text-gray-400" />
                        <span className="font-medium text-gray-900">{call.caller_phone_nr}</span>
                    </div>
                </td>
                <td className="py-3 px-4 text-gray-600">{call.called_phone_nr}</td>
                <td className="py-3 px-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        call.call_type === "Gelen" ? "bg-green-100 text-green-700" : "bg-blue-100 text-blue-700"
                    }`}>
                        {call.call_type}
                    </span>
                </td>
                <td className="py-3 px-4 text-gray-600 text-sm">
                    {call.started_at ? new Date(call.started_at).toLocaleString('tr-TR') : "-"}
                </td>
                <td className="py-3 px-4 text-gray-600 text-sm">
                    {call.ended_at ? new Date(call.ended_at).toLocaleString('tr-TR') : "-"}
                </td>
                <td className="py-3 px-4 text-gray-600">
                    <div className="flex items-center space-x-1">
                        <Clock className="w-3 h-3 text-gray-400" />
                        <span>{formatDuration(call.duration)}</span>
                    </div>
                </td>
                <td className="py-3 px-4 text-gray-600 text-sm">
                    {call.audio_recording_file ? (
                        <span className="text-green-600 font-medium">Mevcut</span>
                    ) : (
                        <span className="text-gray-400">Yok</span>
                    )}
                </td>
                <td className="py-3 px-4">
                    <div className="flex items-center space-x-2">
                        <button className="p-1 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded" title="Detayları Görüntüle">
                            <Eye className="w-4 h-4" />
                        </button>
                        {call.audio_recording_file && (
                            <button className="p-1 text-green-600 hover:text-green-800 hover:bg-green-50 rounded" title="Ses Kaydını Dinle">
                                <PlayCircle className="w-4 h-4" />
                            </button>
                        )}
                        <button className="p-1 text-gray-600 hover:text-gray-800 hover:bg-gray-50 rounded" title="İndir">
                            <Download className="w-4 h-4" />
                        </button>
                    </div>
                </td>
            </tr>
        ));
    }, [calls]);

    return (
        <div className="space-y-6 px-4 md:px-10 mt-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Çağrı Kayıtları</h1>
                    <p className="text-gray-600">Tüm çağrı kayıtlarını görüntüleyin ve yönetin</p>
                </div>
                <div className="flex items-center space-x-3">
                    <button 
                        onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                        className="px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg flex items-center space-x-2"
                    >
                        <Filter className="w-4 h-4" />
                        <span>Gelişmiş Filtreler</span>
                    </button>
                    <button className="px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg flex items-center space-x-2">
                        <Download className="w-4 h-4" />
                        <span>Dışa Aktar</span>
                    </button>
                    
                    {/* Sayfalama Kontrolleri */}
                    <div className="flex items-center space-x-4 ml-4">
                        <span className="text-sm text-gray-600">Sayfa başına:</span>
                        <select 
                            value={pageSize} 
                            onChange={(e) => handlePageSizeChange(Number(e.target.value))}
                            className="px-3 py-1 border border-gray-300 rounded-md text-sm"
                        >
                            <option value={10}>10</option>
                            <option value={50}>50</option>
                            <option value={100}>100</option>
                        </select>
                        
                        <div className="flex items-center space-x-2">
                            <button
                                onClick={() => handlePageChange(currentPage - 1)}
                                disabled={currentPage === 0 || loading}
                                className="px-3 py-1 text-sm border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                            >
                                Önceki
                            </button>
                            
                            <span className="px-3 py-1 text-sm text-gray-600">
                                Sayfa {currentPage + 1} / {totalPages}
                            </span>
                            
                            <button
                                onClick={() => handlePageChange(currentPage + 1)}
                                disabled={currentPage >= totalPages - 1 || loading}
                                className="px-3 py-1 text-sm border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                            >
                                Sonraki
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Gelişmiş Filtreler */}
            {showAdvancedFilters && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Çağrı Tipi</label>
                            <select 
                                value={searchFilters.callType}
                                onChange={(e) => setSearchFilters(prev => ({ ...prev, callType: e.target.value }))}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="">Tüm Çağrı Tipleri</option>
                                <option value="Gelen">Gelen</option>
                                <option value="Giden">Giden</option>
                                <option value="TAFICS">TAFICS</option>
                                <option value="SIP">SIP</option>
                                <option value="ANALOG">ANALOG</option>
                                <option value="NUMERIC">NUMERIC</option>
                                <option value="NETWORK">NETWORK</option>
                            </select>
                        </div>
                        
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Başlangıç Tarihi</label>
                            <input
                                type="datetime-local"
                                value={searchFilters.dateRange.start}
                                onChange={(e) => setSearchFilters(prev => ({ 
                                    ...prev, 
                                    dateRange: { ...prev.dateRange, start: e.target.value }
                                }))}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Bitiş Tarihi</label>
                            <input
                                type="datetime-local"
                                value={searchFilters.dateRange.end}
                                onChange={(e) => setSearchFilters(prev => ({ 
                                    ...prev, 
                                    dateRange: { ...prev.dateRange, end: e.target.value }
                                }))}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Santral Adı</label>
                            <input
                                type="text"
                                placeholder="Santral adı ara..."
                                value={searchFilters.pbxName}
                                onChange={(e) => setSearchFilters(prev => ({ ...prev, pbxName: e.target.value }))}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Telefon Numarası</label>
                            <input
                                type="text"
                                placeholder="Arayan veya aranan numara..."
                                value={searchFilters.phoneNumber}
                                onChange={(e) => setSearchFilters(prev => ({ ...prev, phoneNumber: e.target.value }))}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        
                        <div className="flex items-end">
                            <button
                                onClick={clearFilters}
                                className="px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg flex items-center space-x-2"
                            >
                                <X className="w-4 h-4" />
                                <span>Filtreleri Temizle</span>
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 px-4 md:px-8">
                <div className="p-6 border-b border-gray-100">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                            {/* Arama Türü Seçimi */}
                            <div className="flex items-center space-x-2">
                                                            <select 
                                value={searchFilters.searchType}
                                onChange={(e) => {
                                    setSearchFilters(prev => ({ 
                                        ...prev, 
                                        searchType: e.target.value,
                                        searchTerm: "" // Arama türü değiştiğinde arama terimini temizle
                                    }));
                                }}
                                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                            >
                                    <option value="all">Tüm Alanlar</option>
                                    <option value="id">ID</option>
                                    <option value="phone">Telefon Numarası</option>
                                    <option value="callType">Çağrı Tipi</option>
                                    <option value="pbx">Santral Adı</option>
                                </select>
                            </div>
                            
                            {/* Arama Kutusu */}
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                                <input
                                    type="text"
                                    placeholder={
                                        searchFilters.searchType === 'id' ? "ID numarası girin..." :
                                        searchFilters.searchType === 'phone' ? "Telefon numarası girin..." :
                                        searchFilters.searchType === 'callType' ? "Çağrı tipi girin..." :
                                        searchFilters.searchType === 'pbx' ? "Santral adı girin..." :
                                        "Santral adı, arayan veya aranan ara..."
                                    }
                                    value={searchFilters.searchTerm}
                                    onChange={e => setSearchFilters(prev => ({ ...prev, searchTerm: e.target.value }))}
                                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>
                        </div>
                        <div className="text-sm text-gray-500">
                            {loading ? "Yükleniyor..." : `Toplam ${totalElements} çağrı (Sayfa ${currentPage + 1}/${totalPages})`}
                        </div>
                    </div>
                </div>

                {error && (
                    <div className="p-4 bg-red-50 border border-red-200 rounded-lg m-4">
                        <p className="text-red-600 text-sm">{error}</p>
                    </div>
                )}

                <div className="overflow-x-auto mt-2">
                    <table className="w-full">
                        <thead>
                        <tr className="border-b border-gray-100">
                            <th className="text-left py-4 px-4 text-sm font-medium text-gray-600">ID</th>
                            <th className="text-left py-4 px-4 text-sm font-medium text-gray-600">Santral Adı</th>
                            <th className="text-left py-4 px-4 text-sm font-medium text-gray-600">Transfer Nereden</th>
                            <th className="text-left py-4 px-4 text-sm font-medium text-gray-600">Transfer Nereye</th>
                            <th className="text-left py-4 px-4 text-sm font-medium text-gray-600">Arayan Numara</th>
                            <th className="text-left py-4 px-4 text-sm font-medium text-gray-600">Aranan Numara</th>
                            <th className="text-left py-4 px-4 text-sm font-medium text-gray-600">Çağrı Tipi</th>
                            <th className="text-left py-4 px-4 text-sm font-medium text-gray-600">Başlangıç Zamanı</th>
                            <th className="text-left py-4 px-4 text-sm font-medium text-gray-600">Bitiş Zamanı</th>
                            <th className="text-left py-4 px-4 text-sm font-medium text-gray-600">Süre (sn)</th>
                            <th className="text-left py-4 px-4 text-sm font-medium text-gray-600">Ses Dosyası</th>
                            <th className="text-left py-4 px-4 text-sm font-medium text-gray-600">İşlemler</th>
                        </tr>
                        </thead>
                        <tbody>
                        {loading ? (
                            <tr>
                                <td colSpan={12} className="py-8 text-center text-gray-500">
                                    <div className="flex items-center justify-center space-x-2">
                                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
                                        <span>Veriler yükleniyor...</span>
                                    </div>
                                </td>
                            </tr>
                        ) : calls.length === 0 ? (
                            <tr>
                                <td colSpan={12} className="py-8 text-center text-gray-500">
                                    {isSearching ? "Arama sonucu bulunamadı" : "Henüz çağrı kaydı bulunmuyor"}
                                </td>
                            </tr>
                        ) : (
                            tableRows
                        )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default CallsPage; 