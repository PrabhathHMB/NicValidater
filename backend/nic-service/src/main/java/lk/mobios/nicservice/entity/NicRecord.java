package lk.mobios.nicservice.entity;

import jakarta.persistence.*;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "nic_records")
public class NicRecord {
    public NicRecord() {}
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "nic_number", nullable = false, length = 20, unique = true)
    private String nicNumber;

    @Column(name = "birthday")
    private LocalDate birthday;

    @Column(name = "age")
    private Integer age;

    @Column(name = "gender", length = 10)
    private String gender;

    @Column(name = "is_valid", nullable = false)
    private Boolean isValid = false;

    @Column(name = "error_message")
    private String errorMessage;

    @Column(name = "file_id", nullable = false)
    private Long fileId;

    @Column(name = "file_name", nullable = false)
    private String fileName;

    @Column(name = "nic_format", length = 10)
    private String nicFormat;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(name = "validated_at", nullable = false)
    private LocalDateTime validatedAt = LocalDateTime.now();

    // Manual Getters and Setters to resolve IDE issues
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getNicNumber() { return nicNumber; }
    public void setNicNumber(String nicNumber) { this.nicNumber = nicNumber; }
    public LocalDate getBirthday() { return birthday; }
    public void setBirthday(LocalDate birthday) { this.birthday = birthday; }
    public Integer getAge() { return age; }
    public void setAge(Integer age) { this.age = age; }
    public String getGender() { return gender; }
    public void setGender(String gender) { this.gender = gender; }
    public Boolean getIsValid() { return isValid; }
    public void setIsValid(Boolean isValid) { this.isValid = isValid; }
    public String getErrorMessage() { return errorMessage; }
    public void setErrorMessage(String errorMessage) { this.errorMessage = errorMessage; }
    public Long getFileId() { return fileId; }
    public void setFileId(Long fileId) { this.fileId = fileId; }
    public String getFileName() { return fileName; }
    public void setFileName(String fileName) { this.fileName = fileName; }
    public String getNicFormat() { return nicFormat; }
    public void setNicFormat(String nicFormat) { this.nicFormat = nicFormat; }
    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }
    public LocalDateTime getValidatedAt() { return validatedAt; }
    public void setValidatedAt(LocalDateTime validatedAt) { this.validatedAt = validatedAt; }
}
