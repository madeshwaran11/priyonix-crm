package com.priyonix.crm.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;

@Service
public class EmailService {

    private static final Logger log =
            LoggerFactory.getLogger(EmailService.class);

    private static final String RESEND_ENDPOINT =
            "https://api.resend.com/emails";

    /*
     * Render (and several other hosts) block outbound SMTP
     * traffic on ports 25, 465 and 587, so raw Gmail SMTP
     * cannot be used from the deployed backend.
     *
     * When a Resend API key is configured (or MAIL_PROVIDER
     * is set to "resend") the email is sent through Resend's
     * HTTPS API, which works on those hosts. Otherwise it
     * falls back to SMTP for local development.
     */
    private final JavaMailSender mailSender;

    private final String provider;
    private final String resendApiKey;
    private final String fromAddress;
    private final String smtpUsername;

    private final HttpClient httpClient;

    public EmailService(
            JavaMailSender mailSender,
            @Value("${app.mail.provider:auto}")
            String provider,
            @Value("${app.mail.resend.api-key:}")
            String resendApiKey,
            @Value("${app.mail.from:}")
            String fromAddress,
            @Value("${spring.mail.username:}")
            String smtpUsername) {

        this.mailSender = mailSender;
        this.provider = provider;
        this.resendApiKey = resendApiKey;
        this.fromAddress = fromAddress;
        this.smtpUsername = smtpUsername;

        this.httpClient = HttpClient.newBuilder()
                .connectTimeout(Duration.ofSeconds(10))
                .build();
    }

    public void sendPasswordResetEmail(
            String recipientEmail,
            String resetLink) {

        String subject =
                "PriyoniX CRM - Password Reset";

        String body =
                "Hello,\n\n"
                + "We received a request to reset "
                + "your PriyoniX CRM password.\n\n"
                + "Click the link below to create "
                + "a new password:\n\n"
                + resetLink
                + "\n\n"
                + "This password reset link will "
                + "expire in 15 minutes.\n\n"
                + "If you did not request a password "
                + "reset, you can safely ignore this email.\n\n"
                + "Regards,\n"
                + "PriyoniX CRM Team";

        if (useResend()) {
            sendWithResend(
                    recipientEmail,
                    subject,
                    body
            );
        } else {
            sendWithSmtp(
                    recipientEmail,
                    subject,
                    body
            );
        }
    }

    private boolean useResend() {

        String mode =
                (provider == null || provider.isBlank())
                        ? "auto"
                        : provider.trim();

        if ("smtp".equalsIgnoreCase(mode)) {
            return false;
        }

        if ("resend".equalsIgnoreCase(mode)) {
            return true;
        }

        /*
         * "auto": prefer Resend whenever an API key is
         * configured, otherwise fall back to SMTP.
         */
        return resendApiKey != null
                && !resendApiKey.isBlank();
    }

    // ==========================================
    // RESEND HTTP API
    // ==========================================

    private void sendWithResend(
            String recipientEmail,
            String subject,
            String body) {

        if (resendApiKey == null || resendApiKey.isBlank()) {
            throw new IllegalStateException(
                    "Email provider is set to 'resend' but "
                    + "RESEND_API_KEY is not configured."
            );
        }

        String from =
                (fromAddress == null || fromAddress.isBlank())
                        ? "PriyoniX CRM <onboarding@resend.dev>"
                        : fromAddress;

        try {
            String payload =
                    "{"
                    + "\"from\":" + jsonString(from) + ","
                    + "\"to\":[" + jsonString(recipientEmail) + "],"
                    + "\"subject\":" + jsonString(subject) + ","
                    + "\"text\":" + jsonString(body)
                    + "}";

            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(RESEND_ENDPOINT))
                    .timeout(Duration.ofSeconds(15))
                    .header(
                            "Authorization",
                            "Bearer " + resendApiKey
                    )
                    .header(
                            "Content-Type",
                            "application/json"
                    )
                    .POST(
                            HttpRequest.BodyPublishers
                                    .ofString(payload)
                    )
                    .build();

            HttpResponse<String> response =
                    httpClient.send(
                            request,
                            HttpResponse.BodyHandlers.ofString()
                    );

            if (response.statusCode() < 200
                    || response.statusCode() >= 300) {

                log.error(
                        "Resend API returned status {}: {}",
                        response.statusCode(),
                        response.body()
                );

                throw new RuntimeException(
                        "Failed to send the password reset "
                        + "email (status "
                        + response.statusCode()
                        + ")."
                );
            }

            log.info(
                    "Password reset email sent via Resend to {}",
                    recipientEmail
            );

        } catch (RuntimeException exception) {
            throw exception;

        } catch (Exception exception) {
            log.error(
                    "Failed to send password reset email "
                    + "via Resend",
                    exception
            );

            throw new RuntimeException(
                    "Failed to send the password reset email: "
                    + exception.getMessage()
            );
        }
    }

    /**
     * Minimal JSON string encoder, so no JSON library
     * dependency is required for the Resend payload.
     */
    private static String jsonString(String value) {

        StringBuilder builder = new StringBuilder("\"");

        for (int i = 0; i < value.length(); i++) {

            char character = value.charAt(i);

            switch (character) {

                case '"':
                    builder.append("\\\"");
                    break;

                case '\\':
                    builder.append("\\\\");
                    break;

                case '\n':
                    builder.append("\\n");
                    break;

                case '\r':
                    builder.append("\\r");
                    break;

                case '\t':
                    builder.append("\\t");
                    break;

                case '\b':
                    builder.append("\\b");
                    break;

                case '\f':
                    builder.append("\\f");
                    break;

                default:
                    if (character < 0x20) {
                        builder.append(
                                String.format(
                                        "\\u%04x",
                                        (int) character
                                )
                        );
                    } else {
                        builder.append(character);
                    }
            }
        }

        builder.append("\"");

        return builder.toString();
    }

    // ==========================================
    // SMTP (LOCAL DEVELOPMENT)
    // ==========================================

    private void sendWithSmtp(
            String recipientEmail,
            String subject,
            String body) {

        SimpleMailMessage message =
                new SimpleMailMessage();

        if (smtpUsername != null
                && !smtpUsername.isBlank()) {

            message.setFrom(smtpUsername);
        }

        message.setTo(recipientEmail);
        message.setSubject(subject);
        message.setText(body);

        mailSender.send(message);

        log.info(
                "Password reset email sent via SMTP to {}",
                recipientEmail
        );
    }
}
