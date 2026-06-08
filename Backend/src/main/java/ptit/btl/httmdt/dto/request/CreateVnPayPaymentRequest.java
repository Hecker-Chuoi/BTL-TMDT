package ptit.btl.httmdt.dto.request;

import lombok.Data;

@Data
public class CreateVnPayPaymentRequest {
    private long amount;
    private String orderId;
    private String orderInfo;
    private String bankCode;
    private String language;
}
