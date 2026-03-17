package lk.mobios.nicservice.validator;

import lk.mobios.nicservice.dto.ValidationResult;

public interface NicValidator {
    boolean canHandle(String nic);
    ValidationResult validate(String nic);
}
