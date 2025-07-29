package com.selinu.callrecordsystem.controller;

import com.selinu.callrecordsystem.model.Pbx;
import com.selinu.callrecordsystem.model.DataSource;
import com.selinu.callrecordsystem.repository.PbxRepository;
import com.selinu.callrecordsystem.repository.DataSourceRepository;
import com.selinu.callrecordsystem.dto.PbxDto;
import com.selinu.callrecordsystem.dto.DataSourceDto;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.stream.Collectors;
import java.time.LocalDateTime;

@RestController
@RequestMapping("/api/pbxes")
public class PbxController {
    @Autowired
    private PbxRepository pbxRepository;
    @Autowired
    private DataSourceRepository dataSourceRepository;

    @GetMapping("")
    public List<Pbx> getAll() {
        return pbxRepository.findAll();
    }

    @GetMapping("/with-data-sources")
    public List<PbxDto> getAllWithDataSources() {
        List<Pbx> pbxes = pbxRepository.findAll();
        return pbxes.stream().map(pbx -> {
            PbxDto dto = new PbxDto();
            dto.id = pbx.getId();
            dto.name = pbx.getName() != null ? pbx.getName() : "";
            dto.active = pbx.getActive() != null ? pbx.getActive() : false;
            dto.created_at = pbx.getCreatedAt() != null ? pbx.getCreatedAt().toString() : null;
            dto.created_by = pbx.getCreatedBy() != null ? pbx.getCreatedBy() : "";
            dto.updated_at = pbx.getUpdatedAt() != null ? pbx.getUpdatedAt().toString() : null;
            dto.updated_by = pbx.getUpdatedBy() != null ? pbx.getUpdatedBy() : "";
            dto.deleted_at = pbx.getDeletedAt() != null ? pbx.getDeletedAt().toString() : null;
            dto.deleted_by = pbx.getDeletedBy() != null ? pbx.getDeletedBy() : "";
            List<DataSource> sources = pbx.getDataSources() != null ? pbx.getDataSources() : new java.util.ArrayList<>();
            dto.data_sources = sources.stream().map(ds -> {
                DataSourceDto dsdto = new DataSourceDto();
                dsdto.id = ds.getId();
                dsdto.pbx_id = ds.getPbx() != null ? ds.getPbx().getId() : null;
                dsdto.name = ds.getName() != null ? ds.getName() : "";
                dsdto.ip = ds.getIp() != null ? ds.getIp() : "";
                dsdto.created_by = ds.getCreatedBy() != null ? ds.getCreatedBy() : "";
                dsdto.updated_at = ds.getUpdatedAt() != null ? ds.getUpdatedAt().toString() : null;
                dsdto.updated_by = ds.getUpdatedBy() != null ? ds.getUpdatedBy() : "";
                dsdto.deleted_at = ds.getDeletedAt() != null ? ds.getDeletedAt().toString() : null;
                dsdto.deleted_by = ds.getDeletedBy() != null ? ds.getDeletedBy() : "";
                return dsdto;
            }).collect(java.util.stream.Collectors.toList());
            return dto;
        }).collect(java.util.stream.Collectors.toList());
    }

    @PostMapping("")
    public Pbx addPbx(@RequestBody Pbx pbx) {
        pbx.setCreatedAt(LocalDateTime.now());
        // created_by frontend'den gelen JSON'dan alınır
        return pbxRepository.save(pbx);
    }

    @PatchMapping("/{id}/soft-delete")
    public Pbx softDeletePbx(@PathVariable Long id, @RequestParam String deletedBy) {
        Pbx pbx = pbxRepository.findById(id).orElseThrow();
        pbx.setDeletedAt(LocalDateTime.now());
        pbx.setDeletedBy(deletedBy);
        return pbxRepository.save(pbx);
    }

    @PatchMapping("/{id}/undo-delete")
    public Pbx undoSoftDeletePbx(@PathVariable Long id) {
        Pbx pbx = pbxRepository.findById(id).orElseThrow();
        pbx.setDeletedAt(null);
        pbx.setDeletedBy(null);
        return pbxRepository.save(pbx);
    }

    @GetMapping("/all")
    public List<Pbx> getAllIncludingDeleted() {
        return pbxRepository.findAll();
    }

    @PatchMapping("/{id}")
    public Pbx updatePbx(@PathVariable Long id, @RequestBody Pbx update) {
        Pbx pbx = pbxRepository.findById(id).orElseThrow();
        if (update.getName() != null) pbx.setName(update.getName());
        pbx.setActive(update.getActive()); // null kontrolü olmadan her zaman güncelle
        pbx.setUpdatedAt(LocalDateTime.now());
        pbx.setUpdatedBy(update.getUpdatedBy());
        // created_by ve created_at değişmez
        return pbxRepository.save(pbx);
    }
} 