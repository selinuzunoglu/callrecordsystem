package com.karel.callrecordsystem.service;

import com.karel.callrecordsystem.entity.Pbx;
import java.util.List;

public interface PbxService {
    List<Pbx> getAll();
    Pbx getById(Long id);
    Pbx create(Pbx pbx);
    Pbx update(Long id, Pbx pbx);
    void delete(Long id);
}
