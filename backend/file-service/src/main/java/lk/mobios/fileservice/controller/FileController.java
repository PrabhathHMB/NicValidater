package lk.mobios.fileservice.controller;

import lk.mobios.fileservice.entity.CsvFile;
import lk.mobios.fileservice.service.FileService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/files")
public class FileController {

    @Autowired
    private FileService fileService;

    @PostMapping("/upload")
    public ResponseEntity<?> uploadFiles(
            @RequestParam("files") MultipartFile[] files,
            @RequestHeader(value = "X-User-ID", defaultValue = "1") Long userId) {
        try {
            List<Map<String, Object>> results = fileService.processFiles(files, userId);
            return ResponseEntity.ok(Map.of(
                    "message", "Files processed successfully",
                    "results", results
            ));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("message", "Error processing files: " + e.getMessage()));
        }
    }

    @GetMapping
    public ResponseEntity<List<CsvFile>> getAllFiles(
            @RequestHeader(value = "X-User-ID", required = false) Long userId,
            @RequestHeader(value = "X-User-Role", required = false) String role) {
        return ResponseEntity.ok(fileService.getFilesByRole(userId, role));
    }

    @GetMapping("/health")
    public ResponseEntity<?> health() {
        return ResponseEntity.ok(Map.of("status", "UP", "service", "file-service"));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, String>> deleteFile(@PathVariable Long id) {
        fileService.deleteFile(id);
        return ResponseEntity.ok(Map.of("message", "File and associated records deleted successfully"));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Map<String, String>> updateFile(@PathVariable Long id, @RequestBody Map<String, String> body) {
        String newName = body.get("fileName");
        fileService.updateFile(id, newName);
        return ResponseEntity.ok(Map.of("message", "File updated successfully"));
    }
}
