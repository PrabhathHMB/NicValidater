package lk.mobios.nicservice.service;

import lk.mobios.nicservice.dto.BatchValidationRequest;
import lk.mobios.nicservice.dto.ValidationResult;
import lk.mobios.nicservice.entity.NicRecord;
import lk.mobios.nicservice.repository.NicRecordRepository;
import lk.mobios.nicservice.validator.NicValidator;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class NicService {

    @Autowired
    private List<NicValidator> validators;

    @Autowired
    private NicRecordRepository nicRecordRepository;

    @SuppressWarnings("null")
    public List<NicRecord> validateAndSaveBatch(BatchValidationRequest request) {
        List<NicRecord> results = new ArrayList<>();

        for (String nic : request.getNicNumbers()) {
            String trimmed = nic != null ? nic.trim() : "";
            if (trimmed.isEmpty()) continue;

            ValidationResult result = validateSingle(trimmed);
            
            // Check if NIC already exists to prevent duplicates
            Optional<NicRecord> existing = nicRecordRepository.findByNicNumber(trimmed);
            if (existing.isPresent()) {
                results.add(existing.get());
                continue;
            }

            NicRecord record = toEntity(result, request.getFileId(), request.getFileName(), request.getUserId());
            record = nicRecordRepository.save(record);
            results.add(record);
        }
        return results;
    }

    public ValidationResult validateSingle(String nic) {
        for (NicValidator validator : validators) {
            if (validator.canHandle(nic)) {
                return validator.validate(nic);
            }
        }
        ValidationResult result = new ValidationResult();
        result.setNicNumber(nic);
        result.setValid(false);
        result.setErrorMessage("Unrecognized NIC format. Must be 9-digit+V/X (old) or 12-digit (new).");
        return result;
    }

    private NicRecord toEntity(ValidationResult r, Long fileId, String fileName, Long userId) {
        NicRecord rec = new NicRecord();
        rec.setNicNumber(r.getNicNumber());
        rec.setBirthday(r.getBirthday());
        rec.setAge(r.getAge());
        rec.setGender(r.getGender());
        rec.setIsValid(r.isValid());
        rec.setErrorMessage(r.getErrorMessage());
        rec.setFileId(fileId);
        rec.setFileName(fileName);
        rec.setUserId(userId);
        rec.setNicFormat(r.getNicFormat());
        rec.setValidatedAt(LocalDateTime.now());
        return rec;
    }

    public List<NicRecord> getAllRecords() {
        return nicRecordRepository.findAll();
    }

    public List<NicRecord> getRecordsByFile(Long fileId) {
        return nicRecordRepository.findByFileId(fileId);
    }

    public List<NicRecord> getRecordsWithFilters(String fileName, String gender, Boolean isValid, Long userId, String role) {
        Long filterUserId = "ADMIN".equals(role) ? null : userId;
        return nicRecordRepository.findWithFilters(filterUserId, fileName, gender, isValid);
    }

    public Map<String, Object> getStats(Long userId, String role) {
        Map<String, Object> stats = new HashMap<>();
        boolean isAdmin = "ADMIN".equals(role);

        if (isAdmin) {
            stats.put("totalRecords", nicRecordRepository.count());
            stats.put("maleCount", nicRecordRepository.countByGender("Male"));
            stats.put("femaleCount", nicRecordRepository.countByGender("Female"));
            stats.put("validCount", nicRecordRepository.countByIsValid(true));
            stats.put("invalidCount", nicRecordRepository.countByIsValid(false));
            stats.put("byFile", nicRecordRepository.countByFileNameGrouped());
            stats.put("byGender", nicRecordRepository.countValidByGender());
        } else {
            stats.put("totalRecords", nicRecordRepository.countByUserId(userId));
            stats.put("maleCount", nicRecordRepository.countByUserIdAndGender(userId, "Male"));
            stats.put("femaleCount", nicRecordRepository.countByUserIdAndGender(userId, "Female"));
            stats.put("validCount", nicRecordRepository.countByUserIdAndIsValid(userId, true));
            stats.put("invalidCount", nicRecordRepository.countByUserIdAndIsValid(userId, false));
            stats.put("byFile", nicRecordRepository.countByUserIdAndFileNameGrouped(userId));
            stats.put("byGender", nicRecordRepository.countUserIdAndValidByGender(userId));
        }
        return stats;
    }

    @Transactional
    public void deleteRecordsByFileId(Long fileId) {
        nicRecordRepository.deleteByFileId(fileId);
    }
}
