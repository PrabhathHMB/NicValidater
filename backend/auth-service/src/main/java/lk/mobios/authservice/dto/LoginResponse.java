package lk.mobios.authservice.dto;

public class LoginResponse {
    private Long id;
    private String token;
    private String username;
    private String email;
    private String role;
    private String message;

    public LoginResponse() {}

    public LoginResponse(Long id, String token, String username, String email, String role, String message) {
        this.id = id;
        this.token = token;
        this.username = username;
        this.email = email;
        this.role = role;
        this.message = message;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getToken() { return token; }
    public void setToken(String token) { this.token = token; }
    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }
    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }
}
