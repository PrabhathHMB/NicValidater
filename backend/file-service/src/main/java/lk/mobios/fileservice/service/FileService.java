package lk.mobios.fileservice.service; 

import lk.mobios.fileservice.entity.CsvFile;
import lk.mobios.fileservice.repository.CsvFileRepository;
import org.apache.commons.csv.CSVFormat;
import org.apache.commons.csv.CSVParser;
import org.apache.commons.csv.CSVRecord;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.multipart.MultipartFile;

import java.io.*;
import java.nio.charset.StandardCharsets;
import java.util.*;
import java.util.concurrent.CompletableFuture;
import java.util.stream.Collectors;

@Service
public class FileService {

    @Autowired
    private CsvFileRepository csvFileRepository;

    @Autowired
    private lk.mobios.fileservice.config.NicServiceProperties nicServiceProperties;

    @Autowired
    private RestTemplate restTemplate;

    public List<Map<String, Object>> processFiles(MultipartFile[] files, Long userId) {
        if (files == null || files.length == 0) {
            return Collections.emptyList();
        }

        List<CompletableFuture<Map<String, Object>>> futures = Arrays.stream(files)
                .map(file -> CompletableFuture.supplyAsync(() -> processFile(file, userId)))
                .collect(Collectors.toList());

        return futures.stream()
                .map(CompletableFuture::join)
                .collect(Collectors.toList());
    }

    @SuppressWarnings("null")
    private Map<String, Object> processFile(MultipartFile file, Long userId) {
        // Save file metadata
        CsvFile csvFile = new CsvFile();
        csvFile.setFileName(file.getOriginalFilename());
        csvFile.setOriginalName(file.getOriginalFilename());
        csvFile.setFileSize(file.getSize());
        csvFile.setUploadedBy(userId);
        csvFile.setStatus("PROCESSING");
        csvFile = csvFileRepository.save(csvFile);

        // Parse CSV
        List<String> nicNumbers = parseCsv(file);

        // Call NIC Service
        Map<String, Object> requestBody = new HashMap<>();
        requestBody.put("nicNumbers", nicNumbers);
        requestBody.put("fileId", csvFile.getId());
        requestBody.put("fileName", csvFile.getOriginalName());
        requestBody.put("userId", userId);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        HttpEntity<Map<String, Object>> requestEntity = new HttpEntity<>(requestBody, headers);

        ResponseEntity<List<Map<String, Object>>> response = restTemplate.exchange(
                nicServiceProperties.getUrl() + "/api/nic/validate-batch",
                HttpMethod.POST,
                requestEntity,
                new org.springframework.core.ParameterizedTypeReference<List<Map<String, Object>>>() {}
        );

        List<Map<String, Object>> validatedRecords = response.getBody();
        List<Map<String, Object>> storedRecords = new ArrayList<>();

        long validCount = 0;
        if (validatedRecords != null) {
            for (Map<String, Object> r : validatedRecords) {
                if (Boolean.TRUE.equals(r.get("isValid"))) {
                    validCount++;
                }
                storedRecords.add(r);
            }
        }

        csvFile.setRecordCount(nicNumbers.size()); // Total records in file
        csvFile.setValidCount((int) validCount);
        csvFile.setInvalidCount(nicNumbers.size() - (int) validCount);
        csvFile.setStatus("COMPLETED");
        csvFileRepository.save(csvFile);

        Map<String, Object> result = new HashMap<>();
        result.put("fileId", csvFile.getId());
        result.put("fileName", csvFile.getOriginalName());
        result.put("recordCount", nicNumbers.size()); // Total records in file
        result.put("validCount", validCount);
        result.put("invalidCount", nicNumbers.size() - validCount);
        result.put("records", storedRecords); // Only return records that were successfully saved
        return result;
    }

    private List<String> parseCsv(MultipartFile file) {
        List<String> nics = new ArrayList<>();
        try (Reader reader = new InputStreamReader(file.getInputStream(), StandardCharsets.UTF_8);
             CSVParser csvParser = new CSVParser(reader, CSVFormat.DEFAULT.builder()
                     .setHeader()
                     .setSkipHeaderRecord(true)
                     .setIgnoreHeaderCase(true)
                     .setTrim(true)
                     .build())) {

            for (CSVRecord record : csvParser) {
                // Try to find a 'nic' column; fallback to first column
                String nic;
                try {
                    nic = record.get("nic");
                } catch (Exception e) {
                    try {
                        nic = record.get("NIC");
                    } catch (Exception ex) {
                        nic = record.get(0);
                    }
                }
                if (nic != null && !nic.trim().isEmpty()) {
                    nics.add(nic.trim());
                }
            }
        } catch (Exception e) {
            // Try no-header format
            try (Reader reader = new InputStreamReader(file.getInputStream(), StandardCharsets.UTF_8);
                 CSVParser csvParser = new CSVParser(reader, CSVFormat.DEFAULT.builder()
                         .setTrim(true)
                         .build())) {
                for (CSVRecord record : csvParser) {
                    if (record.size() > 0 && !record.get(0).trim().isEmpty()) {
                        nics.add(record.get(0).trim());
                    }
                }
            } catch (IOException ioEx) {
                throw new RuntimeException("Failed to parse CSV: " + ioEx.getMessage());
            }
        }
        return nics;
    }

    public List<CsvFile> getFilesByRole(Long userId, String role) {
        if ("ADMIN".equals(role)) {
            return csvFileRepository.findAll();
        }
        return csvFileRepository.findByUploadedBy(userId);
    }

    public List<CsvFile> getAllFiles() {
        return csvFileRepository.findAll();
    }

    public List<CsvFile> getFilesByUser(Long userId) {
        return csvFileRepository.findByUploadedBy(userId);
    }

    public void deleteFile(Long id) {
        if (id == null) throw new IllegalArgumentException("File ID cannot be null");
        
        CsvFile file = csvFileRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("File not found"));

        // Call NIC Service to delete associated records
        try {
            restTemplate.delete(nicServiceProperties.getUrl() + "/api/nic/records/file/" + id);
        } catch (org.springframework.web.client.RestClientException e) {
            // Log and potentially continue if NIC service is down
            System.err.println("Error deleting NIC records for file " + id + ": " + e.getMessage());
        }

        if (file != null) {
            csvFileRepository.delete(file);
        }
    }

    public void updateFile(Long id, String newName) {
        if (id == null) throw new IllegalArgumentException("File ID cannot be null");
        
        CsvFile file = csvFileRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("File not found"));
        file.setOriginalName(newName);
        csvFileRepository.save(file);
    }
}
