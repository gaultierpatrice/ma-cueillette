package com.cueillette.backend.controller;

import com.cueillette.backend.dto.ContactMessageRequest;
import com.cueillette.backend.service.ContactService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class ContactController {

    private final ContactService contactService;

    public ContactController(ContactService contactService) {
        this.contactService = contactService;
    }

    @PostMapping("/api/contact")
    public ResponseEntity<Void> submitContact(@Valid @RequestBody ContactMessageRequest request) {
        contactService.sendContactMessage(request);
        return ResponseEntity.noContent().build();
    }
}
