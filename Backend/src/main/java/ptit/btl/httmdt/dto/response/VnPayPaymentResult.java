package ptit.btl.httmdt.dto.response;

import lombok.Data;

@Data
public class VnPayPaymentResult {
    private final boolean validSignature;
    private final boolean success;
    private final String orderId;
    private final String amount;
    private final String responseCode;
    private final String transactionStatus;
    private final String transactionNo;
    private final String bankCode;
    private final String message;
}
