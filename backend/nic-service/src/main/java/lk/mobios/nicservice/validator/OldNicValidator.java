package lk.mobios.nicservice.validator;

import java.time.LocalDate;
import java.time.Period;

import org.springframework.stereotype.Component;

import lk.mobios.nicservice.dto.ValidationResult;

/**
 * Validates old-format NIC numbers: 9 digits followed by 'V' or 'X'
 * Format: YYXXXSSSS[V/X]
 * YY = birth year (19YY), XXX = day of year (>500 for female), SSSS = serial, V/X = check
 */
@Component
public class OldNicValidator implements NicValidator {

    @Override
    public boolean canHandle(String nic) {
        if (nic == null) return false;
        return nic.matches("^[0-9]{9}[VvXx]$");
    }

    @Override
    public ValidationResult validate(String nic) {
        ValidationResult result = new ValidationResult();
        result.setNicNumber(nic);
        result.setNicFormat("OLD");

        try {
            String upper = nic.toUpperCase();
            int year = 1900 + Integer.parseInt(upper.substring(0, 2));
            int dayOfYear = Integer.parseInt(upper.substring(2, 5));

            String gender;
            if (dayOfYear > 500) {
                gender = "Female";
                dayOfYear -= 500;
            } else {
                gender = "Male";
            }

            if (dayOfYear < 1 || dayOfYear > 366) {
                result.setValid(false);
                result.setErrorMessage("Invalid day of year: " + dayOfYear);
                return result;
            }

            LocalDate birthday = LocalDate.ofYearDay(year, dayOfYear);
            int age = Period.between(birthday, LocalDate.now()).getYears();

            result.setBirthday(birthday);
            result.setAge(age);
            result.setGender(gender);
            result.setValid(true);

        } catch (NumberFormatException | java.time.DateTimeException e) {
            result.setValid(false);
            result.setErrorMessage("Failed to parse old NIC: " + e.getMessage());
        }

        return result;
    }
}
