package lk.mobios.nicservice.dto;

import java.time.LocalDate;

public class ValidationResult {
    public ValidationResult() {}

    public ValidationResult(String nicNumber, LocalDate birthday, Integer age, String gender, boolean valid, String errorMessage, String nicFormat) {
        this.nicNumber = nicNumber;
        this.birthday = birthday;
        this.age = age;
        this.gender = gender;
        this.valid = valid;
        this.errorMessage = errorMessage;
        this.nicFormat = nicFormat;
    }
    private String nicNumber;
    private LocalDate birthday;
    private Integer age;
    private String gender;
    private boolean valid;
    private String errorMessage;
    private String nicFormat;  // "OLD" or "NEW"

    public String getNicNumber() { return nicNumber; }
    public void setNicNumber(String nicNumber) { this.nicNumber = nicNumber; }

    public java.time.LocalDate getBirthday() { return birthday; }
    public void setBirthday(java.time.LocalDate birthday) { this.birthday = birthday; }

    public Integer getAge() { return age; }
    public void setAge(Integer age) { this.age = age; }

    public String getGender() { return gender; }
    public void setGender(String gender) { this.gender = gender; }

    public boolean isValid() { return valid; }
    public void setValid(boolean valid) { this.valid = valid; }

    public String getErrorMessage() { return errorMessage; }
    public void setErrorMessage(String errorMessage) { this.errorMessage = errorMessage; }

    public String getNicFormat() { return nicFormat; }
    public void setNicFormat(String nicFormat) { this.nicFormat = nicFormat; }
}
