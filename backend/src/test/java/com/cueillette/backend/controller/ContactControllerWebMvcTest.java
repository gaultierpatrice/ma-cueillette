package com.cueillette.backend.controller;

import com.cueillette.backend.dto.ContactMessageRequest;
import com.cueillette.backend.exception.RestExceptionHandler;
import com.cueillette.backend.security.JwtUtil;
import com.cueillette.backend.service.ContactService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.web.server.ResponseStatusException;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.verify;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(controllers = ContactController.class)
@AutoConfigureMockMvc(addFilters = false)
@Import(RestExceptionHandler.class)
class ContactControllerWebMvcTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private ContactService contactService;

    @MockBean
    private JwtUtil jwtUtil;

    @Test
    void invalidPayloadReturns400WithMessage() throws Exception {
        String body = """
                {"name":"","email":"not-email","message":""}""";

        mockMvc.perform(post("/api/contact")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.status").value(400))
                .andExpect(jsonPath("$.message").exists())
                .andExpect(jsonPath("$.path").value("/api/contact"));
    }

    @Test
    void validPayloadCallsService() throws Exception {
        String body = """
                {"name":"Jean","email":"jean@example.com","message":"Bonjour"}""";

        mockMvc.perform(post("/api/contact")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body))
                .andExpect(status().isNoContent());

        verify(contactService).sendContactMessage(any(ContactMessageRequest.class));
    }

    @Test
    void gatewayErrorReturns502ApiError() throws Exception {
        doThrow(new ResponseStatusException(HttpStatus.BAD_GATEWAY, "mail down"))
                .when(contactService).sendContactMessage(any(ContactMessageRequest.class));

        String body = """
                {"name":"Jean","email":"jean@example.com","message":"Hi"}""";

        mockMvc.perform(post("/api/contact")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body))
                .andExpect(status().isBadGateway())
                .andExpect(jsonPath("$.status").value(502))
                .andExpect(jsonPath("$.message").value("mail down"));
    }
}
