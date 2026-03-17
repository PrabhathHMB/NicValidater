package lk.mobios.dashboardservice.controller;

import lk.mobios.dashboardservice.config.ServiceProperties;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;

import java.util.Map;

@RestController
@RequestMapping("/api/dashboard")
public class DashboardController {

    @Autowired
    private RestTemplate restTemplate;

    @Autowired
    private ServiceProperties.NicServiceProperties nicServiceProperties;

    @Autowired
    private ServiceProperties.FileServiceProperties fileServiceProperties;

    @GetMapping("/summary")
    @SuppressWarnings("null")
    public ResponseEntity<?> getSummary(
            @RequestHeader(value = "X-User-ID", required = false) String userId,
            @RequestHeader(value = "X-User-Role", required = false) String role) {
        try {
            HttpHeaders headers = new HttpHeaders();
            if (userId != null) headers.add("X-User-ID", userId);
            if (role != null) headers.add("X-User-Role", role);
            HttpEntity<Void> requestEntity = new HttpEntity<>(headers);

            ResponseEntity<Map<String, Object>> statsResponse = restTemplate.exchange(
                    nicServiceProperties.getUrl() + "/api/nic/stats",
                    HttpMethod.GET,
                    requestEntity,
                    new org.springframework.core.ParameterizedTypeReference<Map<String, Object>>() {});

            ResponseEntity<Object> filesResponse = restTemplate.exchange(
                    fileServiceProperties.getUrl() + "/api/files",
                    HttpMethod.GET,
                    requestEntity,
                    Object.class);

            return ResponseEntity.ok(Map.of(
                    "stats", statsResponse.getBody() != null ? statsResponse.getBody() : Map.of(),
                    "files", filesResponse.getBody() != null ? filesResponse.getBody() : Map.of()
            ));
        } catch (RuntimeException e) {
            return ResponseEntity.status(500).body(Map.of("message", "Error fetching dashboard data: " + e.getMessage()));
        }
    }

    @GetMapping("/health")
    public ResponseEntity<?> health() {
        return ResponseEntity.ok(Map.of("status", "UP", "service", "dashboard-service"));
    }
}
