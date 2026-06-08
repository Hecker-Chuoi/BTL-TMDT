package ptit.btl.httmdt.dto.response;

public class CreateVnPayPaymentResponse {
    private String code;
    private String message;
    private String orderId;
    private String paymentUrl;

    public CreateVnPayPaymentResponse(String code, String message, String orderId, String paymentUrl) {
        this.code = code;
        this.message = message;
        this.orderId = orderId;
        this.paymentUrl = paymentUrl;
    }

    public String getCode() {
        return code;
    }

    public String getMessage() {
        return message;
    }

    public String getOrderId() {
        return orderId;
    }

    public String getPaymentUrl() {
        return paymentUrl;
    }
}
