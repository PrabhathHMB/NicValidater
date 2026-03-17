package lk.mobios.reportservice.config;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

@Component
@ConfigurationProperties(prefix = "nic-service")
public class NicServiceProperties {
    private String url;

    public String getUrl() { return url; }
    public void setUrl(String url) { this.url = url; }
}
