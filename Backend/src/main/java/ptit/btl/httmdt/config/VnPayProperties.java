package ptit.btl.httmdt.config;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;

@Data
@ConfigurationProperties(prefix = "payment.vnpay")
public class VnPayProperties {
    private String tmnCode;
    private String hashSecret;
    private String payUrl;
    private String returnUrl;
    private String apiUrl;
}
