package lk.mobios.dashboardservice.config;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

public class ServiceProperties {

    @Component
    @ConfigurationProperties(prefix = "nic-service")
    public static class NicServiceProperties {
        private String url;

        public String getUrl() { return url; }
        public void setUrl(String url) { this.url = url; }
    }

    @Component
    @ConfigurationProperties(prefix = "file-service")
    public static class FileServiceProperties {
        private String url;

        public String getUrl() { return url; }
        public void setUrl(String url) { this.url = url; }
    }
}
