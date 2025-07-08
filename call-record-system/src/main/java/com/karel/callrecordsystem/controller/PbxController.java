package com.karel.callrecordsystem.controller;

import com.karel.callrecordsystem.entity.Pbx;
import com.karel.callrecordsystem.service.PbxService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/pbx")
public class PbxController {

    @Autowired
    private PbxService pbxService;

    @GetMapping
    public List<Pbx> getAll() {
        return pbxService.getAll();
    }

    @GetMapping("/{id}")
    public Pbx getById(@PathVariable Long id) {
        return pbxService.getById(id);
    }

    @PostMapping
    public Pbx create(@RequestBody Pbx pbx) {
        return pbxService.create(pbx);
    }

    @PutMapping("/{id}")
    public Pbx update(@PathVariable Long id, @RequestBody Pbx pbx) {
        return pbxService.update(id, pbx);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        pbxService.delete(id);
    }
}
