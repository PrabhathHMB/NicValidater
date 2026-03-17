package lk.mobios.nicservice;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;

@SpringBootApplication
@EnableDiscoveryClient
public class NicServiceApplication {
    public static void main(String[] args) {
        SpringApplication.run(NicServiceApplication.class, args);
    }
}
