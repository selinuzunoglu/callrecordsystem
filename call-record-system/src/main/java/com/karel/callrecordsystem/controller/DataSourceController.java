package com.karel.callrecordsystem.controller;

import com.karel.callrecordsystem.entity.DataSource;
import com.karel.callrecordsystem.service.DataSourceService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/data-sources")
public class DataSourceController {

    private final DataSourceService dataSourceService;

    @Autowired
    public DataSourceController(DataSourceService dataSourceService) {
        this.dataSourceService = dataSourceService;
    }

    @GetMapping
    public List<DataSource> getAllDataSources() {
        return dataSourceService.getAllDataSources();
    }

    @GetMapping("/{id}")
    public DataSource getDataSourceById(@PathVariable Long id) {
        return dataSourceService.getDataSourceById(id);
    }

    @PostMapping
    public DataSource createDataSource(@RequestBody DataSource dataSource) {
        return dataSourceService.createDataSource(dataSource);
    }

    @PutMapping("/{id}")
    public DataSource updateDataSource(@PathVariable Long id, @RequestBody DataSource dataSource) {
        return dataSourceService.updateDataSource(id, dataSource);
    }

    @DeleteMapping("/{id}")
    public void deleteDataSource(@PathVariable Long id) {
        dataSourceService.deleteDataSource(id);
    }
}
