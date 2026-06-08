package ptit.btl.httmdt.service;

import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.util.UriComponentsBuilder;
import ptit.btl.httmdt.config.VnPayProperties;
import ptit.btl.httmdt.dto.request.CreateVnPayPaymentRequest;
import ptit.btl.httmdt.dto.response.CreateVnPayPaymentResponse;
import ptit.btl.httmdt.dto.response.VnPayPaymentResult;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.security.SecureRandom;
import java.text.SimpleDateFormat;
import java.util.Calendar;
import java.util.Map;
import java.util.Random;
import java.util.TimeZone;
import java.util.TreeMap;

@Service
public class VnPayService {
    private static final String VERSION = "2.1.0";
    private static final String COMMAND_PAY = "pay";
    private static final String CURRENCY = "VND";
    private static final String DEFAULT_LOCALE = "vn";
    private static final String DEFAULT_ORDER_TYPE = "other";
    private static final Random RANDOM = new SecureRandom();

    private final VnPayProperties properties;

    public VnPayService(VnPayProperties properties) {
        this.properties = properties;
    }

    public CreateVnPayPaymentResponse createPayment(
            CreateVnPayPaymentRequest paymentRequest,
            HttpServletRequest servletRequest
    ) {
        if (paymentRequest == null) {
            throw new IllegalArgumentException("payment request is required");
        }
        if (paymentRequest.getAmount() <= 0) {
            throw new IllegalArgumentException("amount must be greater than 0");
        }
        requireConfigured(properties.getTmnCode(), "payment.vnpay.tmn-code");
        requireConfigured(properties.getHashSecret(), "payment.vnpay.hash-secret");
        requireConfigured(properties.getPayUrl(), "payment.vnpay.pay-url");
        requireConfigured(properties.getReturnUrl(), "payment.vnpay.return-url");

        String orderId = StringUtils.hasText(paymentRequest.getOrderId())
                ? paymentRequest.getOrderId().trim()
                : generateTxnRef(10);

        Map<String, String> params = new TreeMap<>();
        params.put("vnp_Version", VERSION);
        params.put("vnp_Command", COMMAND_PAY);
        params.put("vnp_TmnCode", properties.getTmnCode());
        params.put("vnp_Amount", String.valueOf(paymentRequest.getAmount() * 100));
        params.put("vnp_CurrCode", CURRENCY);
        params.put("vnp_TxnRef", orderId);
        params.put("vnp_OrderInfo", resolveOrderInfo(paymentRequest, orderId));
        params.put("vnp_OrderType", DEFAULT_ORDER_TYPE);
        params.put("vnp_Locale", resolveLocale(paymentRequest.getLanguage()));
        params.put("vnp_ReturnUrl", properties.getReturnUrl());
        params.put("vnp_IpAddr", getIpAddress(servletRequest));

        SimpleDateFormat formatter = new SimpleDateFormat("yyyyMMddHHmmss");
        formatter.setTimeZone(TimeZone.getTimeZone("Asia/Ho_Chi_Minh"));
        Calendar calendar = Calendar.getInstance(TimeZone.getTimeZone("Asia/Ho_Chi_Minh"));
        params.put("vnp_CreateDate", formatter.format(calendar.getTime()));
        calendar.add(Calendar.MINUTE, 15);
        params.put("vnp_ExpireDate", formatter.format(calendar.getTime()));

        String query = buildQuery(params);
        String secureHash = hmacSHA512(properties.getHashSecret(), query);
        String paymentUrl = UriComponentsBuilder
                .fromUriString(properties.getPayUrl())
                .query(query)
                .queryParam("vnp_SecureHash", secureHash)
                .build(true)
                .toUriString();

        return new CreateVnPayPaymentResponse("00", "success", orderId, paymentUrl);
    }

    public VnPayPaymentResult validatePayment(Map<String, String> callbackParams) {
        String receivedHash = callbackParams.get("vnp_SecureHash");
        if (!StringUtils.hasText(receivedHash)) {
            return toPaymentResult(callbackParams, false, "Missing secure hash");
        }

        Map<String, String> signedParams = new TreeMap<>(callbackParams);
        signedParams.remove("vnp_SecureHash");
        signedParams.remove("vnp_SecureHashType");

        String secureHash = hmacSHA512(properties.getHashSecret(), buildQuery(signedParams));
        boolean validSignature = secureHash.equalsIgnoreCase(receivedHash);
        String message = validSignature ? "success" : "Invalid secure hash";
        return toPaymentResult(callbackParams, validSignature, message);
    }

    public Map<String, String> createIpnResponse(Map<String, String> callbackParams) {
        VnPayPaymentResult result = validatePayment(callbackParams);
        if (!result.isValidSignature()) {
            return Map.of("RspCode", "97", "Message", "Fail checksum");
        }
        return Map.of("RspCode", "00", "Message", "success");
    }

    private VnPayPaymentResult toPaymentResult(
            Map<String, String> params,
            boolean validSignature,
            String message
    ) {
        String responseCode = params.get("vnp_ResponseCode");
        String transactionStatus = params.get("vnp_TransactionStatus");
        boolean success = validSignature && "00".equals(responseCode) && "00".equals(transactionStatus);
        return new VnPayPaymentResult(
                validSignature,
                success,
                params.get("vnp_TxnRef"),
                parseAmount(params.get("vnp_Amount")),
                responseCode,
                transactionStatus,
                params.get("vnp_TransactionNo"),
                params.get("vnp_BankCode"),
                message
        );
    }

    private String resolveOrderInfo(CreateVnPayPaymentRequest request, String orderId) {
        if (StringUtils.hasText(request.getOrderInfo())) {
            return request.getOrderInfo().trim();
        }
        return "Thanh toan don hang " + orderId;
    }

    private String parseAmount(String rawAmount) {
        if (!StringUtils.hasText(rawAmount)) {
            return null;
        }
        try {
            return String.valueOf(Long.parseLong(rawAmount) / 100);
        } catch (NumberFormatException exception) {
            return rawAmount;
        }
    }

    private String resolveLocale(String language) {
        if (StringUtils.hasText(language)) {
            return language.trim();
        }
        return DEFAULT_LOCALE;
    }

    private void requireConfigured(String value, String propertyName) {
        if (!StringUtils.hasText(value)) {
            throw new IllegalStateException(propertyName + " is not configured");
        }
    }

    private String buildQuery(Map<String, String> params) {
        StringBuilder query = new StringBuilder();
        params.forEach((key, value) -> {
            if (StringUtils.hasText(value)) {
                if (!query.isEmpty()) {
                    query.append('&');
                }
                query.append(urlEncode(key));
                query.append('=');
                query.append(urlEncode(value));
            }
        });
        return query.toString();
    }

    private String hmacSHA512(String key, String data) {
        try {
            Mac hmac512 = Mac.getInstance("HmacSHA512");
            SecretKeySpec secretKey = new SecretKeySpec(key.getBytes(StandardCharsets.UTF_8), "HmacSHA512");
            hmac512.init(secretKey);
            byte[] result = hmac512.doFinal(data.getBytes(StandardCharsets.UTF_8));
            StringBuilder hex = new StringBuilder(result.length * 2);
            for (byte b : result) {
                hex.append(String.format("%02x", b & 0xff));
            }
            return hex.toString();
        } catch (Exception exception) {
            throw new IllegalStateException("Cannot create VNPay secure hash", exception);
        }
    }

    private String urlEncode(String value) {
        return URLEncoder.encode(value, StandardCharsets.UTF_8);
    }

    private String getIpAddress(HttpServletRequest request) {
        String forwardedFor = request.getHeader("X-FORWARDED-FOR");
        if (StringUtils.hasText(forwardedFor)) {
            return forwardedFor.split(",")[0].trim();
        }
        return request.getRemoteAddr();
    }

    private String generateTxnRef(int length) {
        String digits = "0123456789";
        StringBuilder builder = new StringBuilder(length);
        for (int i = 0; i < length; i++) {
            builder.append(digits.charAt(RANDOM.nextInt(digits.length())));
        }
        return builder.toString();
    }
}
