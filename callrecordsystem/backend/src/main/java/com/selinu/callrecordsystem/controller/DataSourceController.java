package com.selinu.callrecordsystem.controller;

import com.selinu.callrecordsystem.model.DataSource;
import com.selinu.callrecordsystem.model.Pbx;
import com.selinu.callrecordsystem.repository.DataSourceRepository;
import com.selinu.callrecordsystem.repository.PbxRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/data_source")
public class DataSourceController {
    @Autowired
    private DataSourceRepository dataSourceRepository;
    @Autowired
    private PbxRepository pbxRepository;

    @GetMapping("")
    public List<DataSource> getByPbxId(@RequestParam Long pbxId) {
        return dataSourceRepository.findAll()
            .stream()
            .filter(ds -> ds.getPbx() != null && ds.getPbx().getId().equals(pbxId))
            .collect(Collectors.toList());
    }

    @PostMapping("")
    public DataSource addDataSource(@RequestBody DataSource ds, @RequestParam Long pbx_id) {
        ds.setCreatedAt(java.time.LocalDateTime.now());
        Pbx pbx = pbxRepository.findById(pbx_id).orElseThrow();
        ds.setPbx(pbx);
        return dataSourceRepository.save(ds);
    }

    @PatchMapping("/{id}")
    public DataSource updateDataSource(@PathVariable Long id, @RequestBody DataSource update) {
        DataSource ds = dataSourceRepository.findById(id).orElseThrow();
        if (update.getName() != null) ds.setName(update.getName());
        if (update.getIp() != null) ds.setIp(update.getIp());
        ds.setUpdatedAt(java.time.LocalDateTime.now());
        ds.setUpdatedBy(update.getUpdatedBy());
        return dataSourceRepository.save(ds);
    }

    @PatchMapping("/{id}/soft-delete")
    public DataSource softDeleteDataSource(@PathVariable Long id, @RequestParam String deletedBy) {
        DataSource ds = dataSourceRepository.findById(id).orElseThrow();
        ds.setDeletedAt(java.time.LocalDateTime.now());
        ds.setDeletedBy(deletedBy);
        return dataSourceRepository.save(ds);
    }

    @PatchMapping("/{id}/undo-delete")
    public DataSource undoSoftDeleteDataSource(@PathVariable Long id) {
        DataSource ds = dataSourceRepository.findById(id).orElseThrow();
        ds.setDeletedAt(null);
        ds.setDeletedBy(null);
        return dataSourceRepository.save(ds);
    }
} 