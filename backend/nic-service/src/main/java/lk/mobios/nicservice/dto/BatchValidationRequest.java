package lk.mobios.nicservice.dto;

import java.util.List;

public class BatchValidationRequest {
    private List<String> nicNumbers;
    private Long fileId;
    private String fileName;
    private Long userId;

    public List<String> getNicNumbers() {
        return nicNumbers;
    }

    public void setNicNumbers(List<String> nicNumbers) {
        this.nicNumbers = nicNumbers;
    }

    public Long getFileId() {
        return fileId;
    }

    public void setFileId(Long fileId) {
        this.fileId = fileId;
    }

    public String getFileName() {
        return fileName;
    }

    public void setFileName(String fileName) {
        this.fileName = fileName;
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }
}
