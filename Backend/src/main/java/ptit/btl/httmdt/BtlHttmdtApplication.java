package ptit.btl.httmdt;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import ptit.btl.httmdt.config.VnPayProperties;

@SpringBootApplication
@EnableConfigurationProperties(VnPayProperties.class)
public class BtlHttmdtApplication {

	public static void main(String[] args) {
		SpringApplication.run(BtlHttmdtApplication.class, args);
	}

}
