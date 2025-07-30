package com.selinu.callrecordsystem.controller;

import com.selinu.callrecordsystem.model.CallLog;
import com.selinu.callrecordsystem.dto.CallLogDto;
import com.selinu.callrecordsystem.service.CallLogService;
import com.selinu.callrecordsystem.repository.CallLogRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Map;
import java.util.HashMap;

@RestController
@RequestMapping("/api/call-logs")
public class CallLogController {
    @Autowired
    private CallLogService callLogService;
    @Autowired
    private CallLogRepository callLogRepository;

    @GetMapping("")
    public List<CallLogDto> getAll() {
        return callLogService.getAllCallLogsAsDto();
    }

    // Çok hızlı sayfalama endpoint'i
    @GetMapping("/paginated")
    public ResponseEntity<Map<String, Object>> getPaginated(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "id") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir,
            @RequestParam(required = false) String search) {
        
        try {
            Page<CallLogDto> result = callLogService.getPaginatedCallLogs(page, size, sortBy, sortDir, search);
            
            Map<String, Object> response = new HashMap<>();
            response.put("content", result.getContent());
            response.put("total_pages", result.getTotalPages());
            response.put("total_elements", result.getTotalElements());
            response.put("current_page", page);
            response.put("page_size", size);
            response.put("has_next", result.hasNext());
            response.put("has_previous", result.hasPrevious());
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("error", "Veri yüklenirken hata oluştu: " + e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }
    
    // Telefon numarasına göre arama
    @GetMapping("/search/phone")
    public ResponseEntity<Map<String, Object>> searchByPhone(
            @RequestParam String phoneNumber,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "100") int size) {
        
        try {
            Page<CallLogDto> result = callLogService.findByPhoneNumber(phoneNumber, page, size);
            
            Map<String, Object> response = new HashMap<>();
            response.put("content", result.getContent());
            response.put("total_pages", result.getTotalPages());
            response.put("total_elements", result.getTotalElements());
            response.put("current_page", page);
            response.put("page_size", size);
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("error", "Telefon numarası araması sırasında hata: " + e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }
    
    // Tarih aralığına göre arama
    @GetMapping("/search/date-range")
    public ResponseEntity<Map<String, Object>> searchByDateRange(
            @RequestParam String startDate,
            @RequestParam String endDate,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "100") int size) {
        
        try {
            DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd'T'HH:mm:ss");
            LocalDateTime start = LocalDateTime.parse(startDate, formatter);
            LocalDateTime end = LocalDateTime.parse(endDate, formatter);
            
            Page<CallLogDto> result = callLogService.findByDateRange(start, end, page, size);
            
            Map<String, Object> response = new HashMap<>();
            response.put("content", result.getContent());
            response.put("total_pages", result.getTotalPages());
            response.put("total_elements", result.getTotalElements());
            response.put("current_page", page);
            response.put("page_size", size);
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("error", "Tarih aralığı araması sırasında hata: " + e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }
    
    // Çağrı tipine göre arama
    @GetMapping("/search/call-type")
    public ResponseEntity<Map<String, Object>> searchByCallType(
            @RequestParam String callType,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "100") int size) {
        
        try {
            Page<CallLogDto> result = callLogService.findByCallType(callType, page, size);
            
            Map<String, Object> response = new HashMap<>();
            response.put("content", result.getContent());
            response.put("total_pages", result.getTotalPages());
            response.put("total_elements", result.getTotalElements());
            response.put("current_page", page);
            response.put("page_size", size);
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("error", "Çağrı tipi araması sırasında hata: " + e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }
    
    // Santral adına göre arama
    @GetMapping("/search/pbx")
    public ResponseEntity<Map<String, Object>> searchByPbxName(
            @RequestParam String pbxName,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "100") int size) {
        
        try {
            Page<CallLogDto> result = callLogService.findByPbxName(pbxName, page, size);
            
            Map<String, Object> response = new HashMap<>();
            response.put("content", result.getContent());
            response.put("total_pages", result.getTotalPages());
            response.put("total_elements", result.getTotalElements());
            response.put("current_page", page);
            response.put("page_size", size);
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("error", "Santral adı araması sırasında hata: " + e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }
    
    // İstatistik endpoint'i
    @GetMapping("/stats")
    public ResponseEntity<Map<String, Object>> getStats() {
        try {
            Map<String, Object> stats = new HashMap<>();
            stats.put("total_calls", callLogService.getTotalCallCount());
            stats.put("gelen_calls", callLogService.getCallCountByType("Gelen"));
            stats.put("giden_calls", callLogService.getCallCountByType("Giden"));
            
            return ResponseEntity.ok(stats);
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("error", "İstatistik hesaplanırken hata: " + e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    // ID'ye göre arama
    @GetMapping("/search/id")
    public ResponseEntity<Map<String, Object>> searchById(
            @RequestParam Long id,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "100") int size) {
        
        try {
            Page<CallLogDto> result = callLogService.findById(id, page, size);
            
            Map<String, Object> response = new HashMap<>();
            response.put("content", result.getContent());
            response.put("total_pages", result.getTotalPages());
            response.put("total_elements", result.getTotalElements());
            response.put("current_page", page);
            response.put("page_size", size);
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("error", "ID araması sırasında hata: " + e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    @GetMapping("/{id}")
    public CallLog getById(@PathVariable Long id) {
        return callLogRepository.findById(id).orElse(null);
    }

    @PostMapping("")
    public CallLog create(@RequestBody CallLog callLog) {
        return callLogRepository.save(callLog);
    }

    @PutMapping("/{id}")
    public CallLog update(@PathVariable Long id, @RequestBody CallLog callLog) {
        callLog.setId(id);
        return callLogRepository.save(callLog);
    }

    // Parent zinciri (çağrı yönlendirme zinciri)
    @GetMapping("/{id}/chain")
    public List<CallLog> getCallChain(@PathVariable Long id) {
        return callLogService.getCallChain(id);
    }

    // Alt yönlendirmeler (çocuk zinciri)
    @GetMapping("/{id}/descendants")
    public List<CallLog> getAllDescendants(@PathVariable Long id) {
        return callLogService.getAllDescendants(id);
    }
} 