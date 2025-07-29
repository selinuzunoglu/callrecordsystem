package com.selinu.callrecordsystem.service;

import com.selinu.callrecordsystem.model.CallLog;
import com.selinu.callrecordsystem.dto.CallLogDto;
import com.selinu.callrecordsystem.repository.CallLogRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class CallLogService {
    @Autowired
    private CallLogRepository callLogRepository;

    // Bir çağrının tüm yönlendirme zincirini (parent zinciri) getirir
    public List<CallLog> getCallChain(Long callId) {
        List<CallLog> chain = new ArrayList<>();
        CallLog current = callLogRepository.findById(callId).orElse(null);
        while (current != null) {
            chain.add(current);
            if (current.getCallId() != null) {
                current = callLogRepository.findById(current.getCallId().longValue()).orElse(null);
            } else {
                break;
            }
        }
        return chain;
    }

    // Bir çağrının tüm alt yönlendirmelerini (çocuk zinciri) recursive olarak getirir
    public List<CallLog> getAllDescendants(Long callId) {
        List<CallLog> result = new ArrayList<>();
        List<CallLog> children = callLogRepository.findByCallId(callId.intValue());
        for (CallLog child : children) {
            result.add(child);
            result.addAll(getAllDescendants(child.getId()));
        }
        return result;
    }

    // CallLog'u DTO'ya çevir
    public CallLogDto convertToDto(CallLog callLog) {
        CallLogDto dto = new CallLogDto();
        dto.setId(callLog.getId());
        dto.setCallId(callLog.getId().toString()); // ID'yi string olarak kullan
        dto.setSwitchboardName(getSwitchboardName(callLog.getCallType())); // Santral adını türet
        dto.setTransferFrom(callLog.getTransferFrom());
        dto.setTransferredTo(callLog.getTransferredTo());
        dto.setSourceId(callLog.getSource() != null ? callLog.getSource().getId() : null);
        dto.setSourceName(callLog.getSource() != null && callLog.getSource().getPbx() != null ? 
            callLog.getSource().getPbx().getName() : "Bilinmeyen");
        dto.setCallerPhoneNr(callLog.getCallerPhoneNr());
        dto.setCalledPhoneNr(callLog.getCalledPhoneNr());
        dto.setCallType(callLog.getCallType());
        dto.setStartedAt(callLog.getStartedAt());
        dto.setEndedAt(callLog.getEndedAt());
        dto.setDuration(callLog.getDuration());
        dto.setAudioRecordingFile(callLog.getAudioRecordingFile());
        return dto;
    }

    // CallType'dan santral adını türet
    private String getSwitchboardName(String callType) {
        if (callType == null) return "Bilinmeyen";
        
        switch (callType.toUpperCase()) {
            case "NETWORK":
                return "Ağ Santrali";
            case "ANALOG":
                return "Analog Santral";
            case "TAFICS":
                return "TAFICS Santrali";
            case "SIP":
                return "SIP Santrali";
            case "NUMERIC":
                return "Sayısal Santral";
            default:
                return callType + " Santrali";
        }
    }

    // Tüm çağrıları DTO olarak getir
    public List<CallLogDto> getAllCallLogsAsDto() {
        List<CallLog> callLogs = callLogRepository.findAll();
        return callLogs.stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    // Optimize edilmiş sayfalama ile çağrıları getir
    public Page<CallLogDto> getPaginatedCallLogs(int page, int size, String sortBy, String sortDir, String search) {
        // Varsayılan sıralama ID'ye göre (en hızlı)
        if (sortBy == null || sortBy.isEmpty()) {
            sortBy = "id";
        }
        
        // Sadece ID sıralaması için optimize et
        Sort sort;
        if (sortBy.equals("id")) {
            sort = sortDir.equalsIgnoreCase("desc") ? Sort.by("id").descending() : Sort.by("id").ascending();
        } else {
            sort = sortDir.equalsIgnoreCase("desc") ? Sort.by(sortBy).descending() : Sort.by(sortBy).ascending();
        }
        
        Pageable pageable = PageRequest.of(page, size, sort);
        
        Page<CallLog> callLogsPage;
        
        if (search != null && !search.trim().isEmpty()) {
            String searchTerm = search.trim();
            
            // Akıllı arama - farklı arama türlerini otomatik algıla
            if (searchTerm.matches("\\d+")) {
                // Sadece sayı ise ID araması yap
                try {
                    Long id = Long.parseLong(searchTerm);
                    callLogsPage = callLogRepository.findByIdExact(id, pageable);
                } catch (NumberFormatException e) {
                    // ID araması başarısız olursa genel arama yap
                    callLogsPage = callLogRepository.findBySearchTerm("%" + searchTerm + "%", pageable);
                }
            } else if (searchTerm.matches("\\d+") && searchTerm.length() >= 2) {
                // En az 2 rakam varsa telefon araması yap
                if (searchTerm.length() == 4) {
                    // 4 haneli ise son 4 hane araması yap (çok hızlı)
                    callLogsPage = callLogRepository.findByPhoneLastDigits(searchTerm, pageable);
                } else {
                    // Diğer durumlarda genel telefon araması
                    callLogsPage = callLogRepository.findByPhoneNumber(searchTerm, pageable);
                }
            } else if (searchTerm.equalsIgnoreCase("Gelen") || searchTerm.equalsIgnoreCase("Giden") ||
                      searchTerm.equalsIgnoreCase("TAFICS") || searchTerm.equalsIgnoreCase("SIP") ||
                      searchTerm.equalsIgnoreCase("ANALOG") || searchTerm.equalsIgnoreCase("NUMERIC") ||
                      searchTerm.equalsIgnoreCase("NETWORK")) {
                // Çağrı tipi araması
                callLogsPage = callLogRepository.findByCallType(searchTerm, pageable);
            } else {
                // Genel arama - % işaretlerini ekle
                callLogsPage = callLogRepository.findBySearchTerm("%" + searchTerm + "%", pageable);
            }
        } else {
            // Arama terimi yoksa tüm kayıtları getir (source ve pbx ile birlikte)
            // ID'ye göre DESC sırala (en yeni önce)
            Pageable sortedPageable = PageRequest.of(pageable.getPageNumber(), pageable.getPageSize(), 
                Sort.by("id").descending());
            callLogsPage = callLogRepository.findAllWithSourceAndPbx(sortedPageable);
        }
        
        return callLogsPage.map(this::convertToDto);
    }
    
    // Gelişmiş arama metodları
    public Page<CallLogDto> findByPhoneNumber(String phoneNumber, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("id").descending());
        return callLogRepository.findByPhoneNumber(phoneNumber, pageable).map(this::convertToDto);
    }
    
    public Page<CallLogDto> findByDateRange(LocalDateTime startDate, LocalDateTime endDate, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("startedAt").descending());
        return callLogRepository.findByDateRange(startDate, endDate, pageable).map(this::convertToDto);
    }
    
    public Page<CallLogDto> findByCallType(String callType, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("id").descending());
        return callLogRepository.findByCallType(callType, pageable).map(this::convertToDto);
    }
    
    public Page<CallLogDto> findByPbxName(String pbxName, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("id").descending());
        return callLogRepository.findByPbxName(pbxName, pageable).map(this::convertToDto);
    }
    
    public Page<CallLogDto> findByTransferInfo(Integer transferFrom, Integer transferredTo, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("id").descending());
        return callLogRepository.findByTransferInfo(transferFrom, transferredTo, pageable).map(this::convertToDto);
    }

    // ID'ye göre arama
    public Page<CallLogDto> findById(Long id, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("id").descending());
        return callLogRepository.findByIdExact(id, pageable).map(this::convertToDto);
    }
    
    // İstatistik metodları (dashboard için)
    public long getTotalCallCount() {
        return callLogRepository.count();
    }
    
    public long getCallCountByType(String callType) {
        return callLogRepository.findByCallType(callType, PageRequest.of(0, 1)).getTotalElements();
    }
    
    public long getCallCountByDateRange(LocalDateTime startDate, LocalDateTime endDate) {
        return callLogRepository.findByDateRange(startDate, endDate, PageRequest.of(0, 1)).getTotalElements();
    }
} 