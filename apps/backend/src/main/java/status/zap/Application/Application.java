package status.zap.Application;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.scheduling.annotation.EnableScheduling;
import status.zap.Application.auth.config.CorsProperties;
import status.zap.Application.subscription.config.MercadoPagoProperties;

@SpringBootApplication
@EnableScheduling
@EnableConfigurationProperties({CorsProperties.class, MercadoPagoProperties.class})
public class Application {
    public static void main(String[] args) {
        SpringApplication.run(Application.class, args);
    }
}
