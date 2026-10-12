package com.priyonix.crm.controller;

import com.priyonix.crm.entity.PasswordResetToken;
import com.priyonix.crm.entity.User;
import com.priyonix.crm.repository.PasswordResetTokenRepository;
import com.priyonix.crm.repository.UserRepository;
import com.priyonix.crm.service.EmailService;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/password")
@CrossOrigin(origins = "http://localhost:5173")
public class PasswordResetController {

    private final UserRepository userRepository;
    private final PasswordResetTokenRepository tokenRepository;
    private final EmailService emailService;
    private final PasswordEncoder passwordEncoder;

    /*
     * Base URL of the frontend used to build the password
     * reset link. Defaults to the local Vite dev server and
     * is overridden on Render with FRONTEND_BASE_URL.
     */
    private final String frontendBaseUrl;

    public PasswordResetController(
            UserRepository userRepository,
            PasswordResetTokenRepository tokenRepository,
            EmailService emailService,
            PasswordEncoder passwordEncoder,
            @Value("${app.frontend.base-url:http://localhost:5173}")
            String frontendBaseUrl) {

        this.userRepository = userRepository;
        this.tokenRepository = tokenRepository;
        this.emailService = emailService;
        this.passwordEncoder = passwordEncoder;
        this.frontendBaseUrl = frontendBaseUrl;
    }

    @PostMapping("/forgot")
    public ResponseEntity<?> forgotPassword(
            @RequestBody Map<String, String> request) {

        String email = request.get("email");

        if (email == null || email.isBlank()) {
            return ResponseEntity.badRequest().body(
                    Map.of(
                            "message",
                            "Email address is required."
                    )
            );
        }

        User user = userRepository
                .findByEmail(email.trim())
                .orElse(null);

        /*
         * Do not reveal whether an email exists.
         * This prevents account enumeration.
         */
        if (user == null) {
            return ResponseEntity.ok(
                    Map.of(
                            "message",
                            "If an account exists for this email, "
                            + "a password reset link has been sent."
                    )
            );
        }

        /*
         * Remove any previous reset tokens
         * belonging to this user.
         */
        tokenRepository
                .findAll()
                .stream()
                .filter(token ->
                        token.getUser()
                                .getId()
                                .equals(user.getId()))
                .forEach(token ->
                        tokenRepository.delete(token)
                );

        String tokenValue =
                UUID.randomUUID().toString();

        PasswordResetToken resetToken =
                new PasswordResetToken();

        resetToken.setToken(tokenValue);
        resetToken.setUser(user);
        resetToken.setExpiryDate(
                LocalDateTime.now().plusMinutes(15)
        );
        resetToken.setUsed(false);

        tokenRepository.save(resetToken);

        String baseUrl =
                frontendBaseUrl == null
                        ? ""
                        : frontendBaseUrl.trim();

        if (baseUrl.endsWith("/")) {

            baseUrl = baseUrl.substring(
                    0,
                    baseUrl.length() - 1
            );
        }

        String resetLink =
                baseUrl
                + "/reset-password?token="
                + tokenValue;

        emailService.sendPasswordResetEmail(
                user.getEmail(),
                resetLink
        );

        return ResponseEntity.ok(
                Map.of(
                        "message",
                        "If an account exists for this email, "
                        + "a password reset link has been sent."
                )
        );
    }

    @PostMapping("/reset")
    public ResponseEntity<?> resetPassword(
            @RequestBody Map<String, String> request) {

        String tokenValue =
                request.get("token");

        String newPassword =
                request.get("newPassword");

        if (tokenValue == null ||
                tokenValue.isBlank()) {

            return ResponseEntity.badRequest().body(
                    Map.of(
                            "message",
                            "Reset token is required."
                    )
            );
        }

       if (newPassword == null || newPassword.isBlank()) {

    return ResponseEntity.badRequest().body(
            Map.of(
                    "message",
                    "Password is required."
            )
    );
}

if (newPassword.length() < 8) {

    return ResponseEntity.badRequest().body(
            Map.of(
                    "message",
                    "Password must contain at least 8 characters."
            )
    );
}

if (!newPassword.matches(".*[A-Z].*")) {

    return ResponseEntity.badRequest().body(
            Map.of(
                    "message",
                    "Password must contain at least one uppercase letter."
            )
    );
}

if (!newPassword.matches(".*[a-z].*")) {

    return ResponseEntity.badRequest().body(
            Map.of(
                    "message",
                    "Password must contain at least one lowercase letter."
            )
    );
}

if (!newPassword.matches(".*[0-9].*")) {

    return ResponseEntity.badRequest().body(
            Map.of(
                    "message",
                    "Password must contain at least one number."
            )
    );
}

if (!newPassword.matches(".*[@$!%*?&#].*")) {

    return ResponseEntity.badRequest().body(
            Map.of(
                    "message",
                    "Password must contain at least one special character."
            )
    );
}

        PasswordResetToken resetToken =
                tokenRepository
                        .findByToken(tokenValue)
                        .orElse(null);

        if (resetToken == null) {

            return ResponseEntity.badRequest().body(
                    Map.of(
                            "message",
                            "Invalid password reset link."
                    )
            );
        }

        if (resetToken.isUsed()) {

            return ResponseEntity.badRequest().body(
                    Map.of(
                            "message",
                            "This password reset link has already been used."
                    )
            );
        }

        if (resetToken
                .getExpiryDate()
                .isBefore(LocalDateTime.now())) {

            return ResponseEntity.badRequest().body(
                    Map.of(
                            "message",
                            "This password reset link has expired."
                    )
            );
        }

        User user =
                resetToken.getUser();

        user.setPassword(
                passwordEncoder.encode(newPassword)
        );

        userRepository.save(user);

        resetToken.setUsed(true);

        tokenRepository.save(resetToken);

        return ResponseEntity.ok(
                Map.of(
                        "message",
                        "Password reset successfully. "
                        + "You can now login with your new password."
                )
        );
    }
}