package ptit.btl.httmdt.controller;

import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import ptit.btl.httmdt.dto.request.CreateVnPayPaymentRequest;
import ptit.btl.httmdt.dto.response.CreateVnPayPaymentResponse;
import ptit.btl.httmdt.dto.response.VnPayPaymentResult;
import ptit.btl.httmdt.service.VnPayService;

import java.util.Map;

@RestController
@RequestMapping("/api/payment/vnpay")
public class PaymentController {
    private final VnPayService vnPayService;

    public PaymentController(VnPayService vnPayService) {
        this.vnPayService = vnPayService;
    }

    @PostMapping("/create")
    public CreateVnPayPaymentResponse createPayment(
            @RequestBody CreateVnPayPaymentRequest paymentRequest,
            HttpServletRequest servletRequest
    ) {
        return vnPayService.createPayment(paymentRequest, servletRequest);
    }

    @GetMapping("/create")
    public CreateVnPayPaymentResponse createPaymentByQuery(
            @RequestParam long amount,
            @RequestParam(required = false) String orderId,
            @RequestParam(required = false) String orderInfo,
            @RequestParam(required = false) String bankCode,
            @RequestParam(required = false) String language,
            HttpServletRequest servletRequest
    ) {
        CreateVnPayPaymentRequest paymentRequest = new CreateVnPayPaymentRequest();
        paymentRequest.setAmount(amount);
        paymentRequest.setOrderId(orderId);
        paymentRequest.setOrderInfo(orderInfo);
        paymentRequest.setBankCode(bankCode);
        paymentRequest.setLanguage(language);
        return vnPayService.createPayment(paymentRequest, servletRequest);
    }

    @GetMapping("/return")
    public VnPayPaymentResult paymentReturn(@RequestParam Map<String, String> params) {
        return vnPayService.validatePayment(params);
    }

    @GetMapping("/ipn")
    public Map<String, String> paymentIpn(@RequestParam Map<String, String> params) {
        return vnPayService.createIpnResponse(params);
    }

    @ExceptionHandler({IllegalArgumentException.class, IllegalStateException.class})
    public ResponseEntity<Map<String, String>> handleBadRequest(RuntimeException exception) {
        return ResponseEntity
                .status(HttpStatus.BAD_REQUEST)
                .body(Map.of("code", "99", "message", exception.getMessage()));
    }
}
