package lk.mobios.nicservice.controller;

import lk.mobios.nicservice.dto.BatchValidationRequest;
import lk.mobios.nicservice.dto.ValidationResult;
import lk.mobios.nicservice.entity.NicRecord;
import lk.mobios.nicservice.service.NicService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/nic")
public class NicController {

    @Autowired
    private NicService nicService;

    @PostMapping("/validate-batch")
    public ResponseEntity<List<NicRecord>> validateBatch(@RequestBody BatchValidationRequest request) {
        List<NicRecord> records = nicService.validateAndSaveBatch(request);
        return ResponseEntity.ok(records);
    }

    @PostMapping("/validate-single")
    public ResponseEntity<ValidationResult> validateSingle(@RequestBody Map<String, String> body) {
        ValidationResult result = nicService.validateSingle(body.get("nic"));
        return ResponseEntity.ok(result);
    }

    @GetMapping("/records")
    public ResponseEntity<List<NicRecord>> getRecords(
            @RequestParam(required = false) String fileName,
            @RequestParam(required = false) String gender,
            @RequestParam(required = false) Boolean isValid,
            @RequestHeader(value = "X-User-ID", required = false) Long userId,
            @RequestHeader(value = "X-User-Role", required = false) String role) {
        return ResponseEntity.ok(nicService.getRecordsWithFilters(fileName, gender, isValid, userId, role));
    }

    @GetMapping("/records/file/{fileId}")
    public ResponseEntity<List<NicRecord>> getRecordsByFile(@PathVariable Long fileId) {
        return ResponseEntity.ok(nicService.getRecordsByFile(fileId));
    }

    @DeleteMapping("/records/file/{fileId}")
    public ResponseEntity<Map<String, String>> deleteRecordsByFile(@PathVariable Long fileId) {
        nicService.deleteRecordsByFileId(fileId);
        return ResponseEntity.ok(Map.of("message", "Records deleted successfully for file ID: " + fileId));
    }

    @GetMapping("/stats")
    public ResponseEntity<Map<String, Object>> getStats(
            @RequestHeader(value = "X-User-ID", required = false) Long userId,
            @RequestHeader(value = "X-User-Role", required = false) String role) {
        Map<String, Object> stats = nicService.getStats(userId, role);
        return ResponseEntity.ok(stats);
    }

    @GetMapping("/health")
    public ResponseEntity<?> health() {
        return ResponseEntity.ok(Map.of("status", "UP", "service", "nic-service"));
    }
}
