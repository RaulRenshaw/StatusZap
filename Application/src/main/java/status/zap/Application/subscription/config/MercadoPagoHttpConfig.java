package status.zap.Application.subscription.config;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.client.RestClient;

@Configuration
public class MercadoPagoHttpConfig {

    @Bean
    RestClient.Builder restClientBuilder() {
        return RestClient.builder();
    }

    @Bean
    ObjectMapper objectMapper() {
        return new ObjectMapper().findAndRegisterModules();
    }
}
