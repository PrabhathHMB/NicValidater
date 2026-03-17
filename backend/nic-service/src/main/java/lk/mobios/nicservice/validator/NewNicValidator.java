package lk.mobios.nicservice.validator;

import java.time.LocalDate;
import java.time.Period;

import org.springframework.stereotype.Component;

import lk.mobios.nicservice.dto.ValidationResult;

/**
 * Validates new-format NIC numbers (NIN): 12-digit numeric
 * Format: YYYYXXXSSSSCC
 * YYYY = birth year, XXX = day of year (>500 for female), SSSS = serial, CC = check digits
 */
@Component
public class NewNicValidator implements NicValidator {

    @Override
    public boolean canHandle(String nic) {
        if (nic == null) return false;
        return nic.matches("^[0-9]{12}$");
    }

    @Override
    public ValidationResult validate(String nic) {
        ValidationResult result = new ValidationResult();
        result.setNicNumber(nic);
        result.setNicFormat("NEW");

        try {
            int year = Integer.parseInt(nic.substring(0, 4));
            int dayOfYear = Integer.parseInt(nic.substring(4, 7));

            // Year sanity check
            int currentYear = LocalDate.now().getYear();
            if (year < 1900 || year > currentYear) {
                result.setValid(false);
                result.setErrorMessage("Invalid birth year: " + year);
                return result;
            }

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
            result.setErrorMessage("Failed to parse new NIC: " + e.getMessage());
        }

        return result;
    }
}
