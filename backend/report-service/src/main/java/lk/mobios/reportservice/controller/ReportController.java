package lk.mobios.reportservice.controller;

import com.itextpdf.text.BaseColor;
import com.itextpdf.text.Document;
import com.itextpdf.text.Element;
import com.itextpdf.text.FontFactory;
import com.itextpdf.text.PageSize;
import com.itextpdf.text.Paragraph;
import com.itextpdf.text.Phrase;
import com.itextpdf.text.pdf.PdfPCell;
import com.itextpdf.text.pdf.PdfPTable;
import com.itextpdf.text.pdf.PdfWriter;
import org.apache.commons.csv.CSVFormat;
import org.apache.commons.csv.CSVPrinter;
import org.apache.poi.ss.usermodel.Cell;
import org.apache.poi.ss.usermodel.CellStyle;
import org.apache.poi.ss.usermodel.FillPatternType;
import org.apache.poi.ss.usermodel.IndexedColors;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.ss.usermodel.Workbook;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.http.HttpEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;

import java.io.*;
import java.util.*;

@RestController
@RequestMapping("/api/reports")
public class ReportController {

    @org.springframework.beans.factory.annotation.Autowired
    private lk.mobios.reportservice.config.NicServiceProperties nicServiceProperties;

    @org.springframework.beans.factory.annotation.Autowired
    private RestTemplate restTemplate;

    @SuppressWarnings("null")
    private List<Map<String, Object>> fetchRecords(String fileName, String gender, Boolean isValid, String userId, String role) {
        String url = nicServiceProperties.getUrl() + "/api/nic/records";
        List<String> params = new ArrayList<>();
        if (fileName != null && !fileName.isEmpty()) params.add("fileName=" + fileName);
        if (gender != null && !gender.isEmpty()) params.add("gender=" + gender);
        if (isValid != null) params.add("isValid=" + isValid);
        if (!params.isEmpty()) url += "?" + String.join("&", params);

        HttpHeaders headers = new HttpHeaders();
        if (userId != null) headers.add("X-User-ID", userId);
        if (role != null) headers.add("X-User-Role", role);
        HttpEntity<Void> requestEntity = new HttpEntity<>(headers);

        ResponseEntity<List<Map<String, Object>>> response = restTemplate.exchange(
                url, HttpMethod.GET, requestEntity,
                new ParameterizedTypeReference<List<Map<String, Object>>>() {});
        List<Map<String, Object>> body = response.getBody();
        return body != null ? body : Collections.emptyList();
    }

    @GetMapping("/export")
    @SuppressWarnings("null")
    public ResponseEntity<byte[]> exportReport(
            @RequestParam(defaultValue = "pdf") String format,
            @RequestParam(required = false) String fileName,
            @RequestParam(required = false) String gender,
            @RequestParam(required = false) Boolean isValid,
            @RequestHeader(value = "X-User-ID", required = false) String userId,
            @RequestHeader(value = "X-User-Role", required = false) String role) throws Exception {

        List<Map<String, Object>> records = fetchRecords(fileName, gender, isValid, userId, role);
        byte[] data;
        MediaType mediaType;
        String downloadFileName;

        switch (format.toLowerCase()) {
            case "pdf" -> {
                data = generatePdf(records);
                mediaType = MediaType.APPLICATION_PDF;
                downloadFileName = "nic_report.pdf";
            }
            case "csv" -> {
                data = generateCsv(records);
                mediaType = MediaType.parseMediaType("text/csv");
                downloadFileName = "nic_report.csv";
            }
            case "excel" -> {
                data = generateExcel(records);
                mediaType = MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
                downloadFileName = "nic_report.xlsx";
            }
            default -> throw new IllegalArgumentException("Unsupported format: " + format);
        }

        return ResponseEntity.ok()
                .contentType(mediaType)
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + downloadFileName + "\"")
                .body(data);
    }

    private byte[] generatePdf(List<Map<String, Object>> records) throws Exception {
        ByteArrayOutputStream bos = new ByteArrayOutputStream();
        Document doc = new Document(PageSize.A4.rotate());
        PdfWriter.getInstance(doc, bos);
        doc.open();

        // Title
        com.itextpdf.text.Font titleFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 18, BaseColor.DARK_GRAY);
        Paragraph title = new Paragraph("MobiOs NIC Validation Report", titleFont);
        title.setAlignment(Element.ALIGN_CENTER);
        title.setSpacingAfter(20);
        doc.add(title);

        // Table
        PdfPTable table = new PdfPTable(7);
        table.setWidthPercentage(100);
        String[] headers = {"#", "NIC Number", "Birthday", "Age", "Gender", "Format", "Status"};

        com.itextpdf.text.Font headerFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 10, BaseColor.WHITE);
        for (String h : headers) {
            PdfPCell cell = new PdfPCell(new Phrase(h, headerFont));
            cell.setBackgroundColor(new BaseColor(30, 64, 175));
            cell.setHorizontalAlignment(Element.ALIGN_CENTER);
            cell.setPadding(6);
            table.addCell(cell);
        }

        com.itextpdf.text.Font dataFont = FontFactory.getFont(FontFactory.HELVETICA, 9);
        int idx = 1;
        for (Map<String, Object> r : records) {
            table.addCell(new Phrase(String.valueOf(idx++), dataFont));
            table.addCell(new Phrase(str(r.get("nicNumber")), dataFont));
            table.addCell(new Phrase(str(r.get("birthday")), dataFont));
            table.addCell(new Phrase(str(r.get("age")), dataFont));
            table.addCell(new Phrase(str(r.get("gender")), dataFont));
            table.addCell(new Phrase(str(r.get("nicFormat")), dataFont));
            boolean valid = Boolean.TRUE.equals(r.get("isValid"));
            PdfPCell statusCell = new PdfPCell(new Phrase(valid ? "VALID" : "INVALID", dataFont));
            statusCell.setBackgroundColor(valid ? new BaseColor(220, 252, 231) : new BaseColor(254, 226, 226));
            table.addCell(statusCell);
        }
        doc.add(table);

        // Footer
        Paragraph footer = new Paragraph("\n© 2024 MobiOs Private Ltd | Total Records: " + records.size(),
                FontFactory.getFont(FontFactory.HELVETICA, 9, BaseColor.GRAY));
        footer.setAlignment(Element.ALIGN_RIGHT);
        doc.add(footer);

        doc.close();
        return bos.toByteArray();
    }

    private byte[] generateCsv(List<Map<String, Object>> records) throws IOException {
        ByteArrayOutputStream bos = new ByteArrayOutputStream();
        try (Writer writer = new OutputStreamWriter(bos);
             CSVPrinter printer = new CSVPrinter(writer,
                     CSVFormat.DEFAULT.builder()
                             .setHeader("NIC Number", "Birthday", "Age", "Gender", "Format", "File", "Status")
                             .build())) {
            for (Map<String, Object> r : records) {
                printer.printRecord(
                        r.get("nicNumber"), r.get("birthday"), r.get("age"),
                        r.get("gender"), r.get("nicFormat"), r.get("fileName"),
                        Boolean.TRUE.equals(r.get("isValid")) ? "VALID" : "INVALID"
                );
            }
        }
        return bos.toByteArray();
    }

    private byte[] generateExcel(List<Map<String, Object>> records) throws IOException {
        try (Workbook workbook = new XSSFWorkbook()) {
            Sheet sheet = workbook.createSheet("NIC Records");

            // Header style
            CellStyle headerStyle = workbook.createCellStyle();
            headerStyle.setFillForegroundColor(IndexedColors.ROYAL_BLUE.getIndex());
            headerStyle.setFillPattern(FillPatternType.SOLID_FOREGROUND);
            org.apache.poi.ss.usermodel.Font headerFont = workbook.createFont();
            headerFont.setBold(true);
            headerFont.setColor(IndexedColors.WHITE.getIndex());
            headerStyle.setFont(headerFont);

            Row headerRow = sheet.createRow(0);
            String[] cols = {"#", "NIC Number", "Birthday", "Age", "Gender", "Format", "File Name", "Status"};
            for (int i = 0; i < cols.length; i++) {
                Cell cell = headerRow.createCell(i);
                cell.setCellValue(cols[i]);
                cell.setCellStyle(headerStyle);
                sheet.setColumnWidth(i, 4000);
            }

            int rowNum = 1;
            for (Map<String, Object> r : records) {
                Row row = sheet.createRow(rowNum++);
                row.createCell(0).setCellValue(rowNum - 1);
                row.createCell(1).setCellValue(str(r.get("nicNumber")));
                row.createCell(2).setCellValue(str(r.get("birthday")));
                row.createCell(3).setCellValue(r.get("age") instanceof Number ? ((Number) r.get("age")).intValue() : 0);
                row.createCell(4).setCellValue(str(r.get("gender")));
                row.createCell(5).setCellValue(str(r.get("nicFormat")));
                row.createCell(6).setCellValue(str(r.get("fileName")));
                row.createCell(7).setCellValue(Boolean.TRUE.equals(r.get("isValid")) ? "VALID" : "INVALID");
            }

            ByteArrayOutputStream bos = new ByteArrayOutputStream();
            workbook.write(bos);
            return bos.toByteArray();
        }
    }

    private String str(Object o) {
        return o != null ? o.toString() : "";
    }

    @GetMapping("/health")
    public ResponseEntity<?> health() {
        return ResponseEntity.ok(Map.of("status", "UP", "service", "report-service"));
    }
}
