package lk.mobios.authservice.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    @Autowired
    private JavaMailSender mailSender;

    @Async
    public void sendOtpEmail(String to, String otp) {
        // Always log to console for development convenience
        System.out.println("\n============================================================");
        System.out.println("PASSWORD RESET OTP REQUEST");
        System.out.println("Email: " + to);
        System.out.println("OTP: " + otp);
        System.out.println("============================================================\n");

        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(to);
        message.setSubject("MobiOs NIC Validator - Password Reset OTP");
        message.setText("""
                Hello,

                Your OTP for resetting your password is: %s

                If you did not request this, please ignore this email.
                This OTP will expire in 10 minutes.
                """.formatted(otp));

        try {
            mailSender.send(message);
        } catch (org.springframework.mail.MailException e) {
            System.err.println("Failed to send email to " + to + ": " + e.getMessage());
            
            // For development, we allow it to proceed if it's the default config
            //boolean isDefaultConfig = false;
            //if (mailSender instanceof JavaMailSenderImpl impl) {
                //if ("smtp.gmail.com".equals(impl.getHost()) && "your-email@gmail.com".equals(impl.getUsername())) {
                    //isDefaultConfig = true;
                //}
           // }
            
            //if (!isDefaultConfig) {
                
                //System.err.println("CRITICAL: Error sending reset email: " + e.getMessage());
            //}
        }
    }
}
