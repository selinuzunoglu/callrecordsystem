package com.karel.callrecordsystem.service;

import com.karel.callrecordsystem.entity.Pbx;
import com.karel.callrecordsystem.repository.PbxRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class PbxServiceImpl implements PbxService {

    @Autowired
    private PbxRepository pbxRepository;

    @Override
    public List<Pbx> getAll() {
        return pbxRepository.findAll();
    }

    @Override
    public Pbx getById(Long id) {
        return pbxRepository.findById(id).orElse(null);
    }

    @Override
    public Pbx create(Pbx pbx) {
        return pbxRepository.save(pbx);
    }

    @Override
    public Pbx update(Long id, Pbx pbx) {
        Optional<Pbx> existing = pbxRepository.findById(id);
        if (existing.isPresent()) {
            pbx.setId(id);
            return pbxRepository.save(pbx);
        } else {
            return null;
        }
    }

    @Override
    public void delete(Long id) {
        pbxRepository.deleteById(id);
    }
}
