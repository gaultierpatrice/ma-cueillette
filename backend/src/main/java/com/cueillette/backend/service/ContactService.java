package com.cueillette.backend.service;

import com.cueillette.backend.dto.ContactMessageRequest;
import com.cueillette.backend.dto.ResendEmailRequest;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientResponseException;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.web.util.HtmlUtils;

import java.util.List;

@Service
public class ContactService {

    private static final Logger log = LoggerFactory.getLogger(ContactService.class);

    private final RestClient resendClient;
    private final String fromAddress;
    private final String adminEmail;

    public ContactService(
            RestClient resendRestClient,
            @Value("${resend.from}") String fromAddress,
            @Value("${resend.admin-email}") String adminEmail) {
        this.resendClient = resendRestClient;
        this.fromAddress = fromAddress;
        this.adminEmail = adminEmail;
    }

    public void sendContactMessage(ContactMessageRequest request) {
        String safeName = HtmlUtils.htmlEscape(request.name());
        String safeEmail = HtmlUtils.htmlEscape(request.email());
        String safeMessage = HtmlUtils.htmlEscape(request.message()).replace("\n", "<br>\n");

        String textBody = "De : " + request.name() + " <" + request.email() + ">\n\n" + request.message();

        String htmlBody = """
                <p><strong>De :</strong> %s &lt;%s&gt;</p>
                <p><strong>Message :</strong></p>
                <p>%s</p>
                """.formatted(safeName, safeEmail, safeMessage);

        ResendEmailRequest payload = new ResendEmailRequest(
                fromAddress,
                List.of(adminEmail),
                "[Ma Cueillette] Message de la part de " + request.name(),
                htmlBody,
                textBody,
                List.of(request.email())
        );

        try {
            resendClient.post()
                    .uri("/emails")
                    .body(payload)
                    .retrieve()
                    .toBodilessEntity();
        } catch (RestClientResponseException e) {
            log.warn("Resend API error: status={} body={}", e.getStatusCode().value(), e.getResponseBodyAsString());
            throw new ResponseStatusException(HttpStatus.BAD_GATEWAY, "Impossible d'envoyer le message pour le moment.");
        }
    }
}
