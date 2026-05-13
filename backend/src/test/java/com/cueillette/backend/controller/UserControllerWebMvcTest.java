package com.cueillette.backend.controller;

import com.cueillette.backend.exception.BadRequestException;
import com.cueillette.backend.exception.ConflictException;
import com.cueillette.backend.exception.InvalidCredentialsException;
import com.cueillette.backend.exception.RestExceptionHandler;
import com.cueillette.backend.model.Role;
import com.cueillette.backend.model.User;
import com.cueillette.backend.security.JwtUtil;
import com.cueillette.backend.service.UserService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDateTime;
import java.util.UUID;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(controllers = UserController.class)
@AutoConfigureMockMvc(addFilters = false)
@Import(RestExceptionHandler.class)
class UserControllerWebMvcTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private UserService userService;

    /** Required so {@code JwtAuthenticationFilter} can be created when security config loads in the slice. */
    @MockBean
    private JwtUtil jwtUtil;

    @Test
    void registerReturnsPayloadWithoutPassword() throws Exception {
        User saved = new User();
        saved.setId(UUID.randomUUID());
        saved.setName("Test User");
        saved.setEmail("test@example.com");
        saved.setPassword("$2a$encoded");
        saved.setRole(Role.USER);
        saved.setSubscriptionDate(LocalDateTime.now());

        when(userService.createUser(any(), any(), any(), any(), any()))
                .thenReturn(saved);

        String body = """
                {"name":"Test User","email":"test@example.com","password":"secret12","role":"USER"}""";

        mockMvc.perform(post("/api/users/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.email").value("test@example.com"))
                .andExpect(jsonPath("$.name").value("Test User"))
                .andExpect(jsonPath("$.password").doesNotExist());
    }

    @Test
    void registerConflictReturnsApiError() throws Exception {
        when(userService.createUser(any(), any(), any(), any(), any()))
                .thenThrow(new ConflictException("Email already in use"));

        String body = """
                {"name":"A","email":"dup@example.com","password":"secret123","role":"USER"}""";

        mockMvc.perform(post("/api/users/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.status").value(409))
                .andExpect(jsonPath("$.message").value("Email already in use"))
                .andExpect(jsonPath("$.path").value("/api/users/register"));
    }

    @Test
    void registerAdminForbiddenReturns400() throws Exception {
        when(userService.createUser(any(), any(), any(), eq(Role.ADMIN), any()))
                .thenThrow(new BadRequestException("Admin accounts cannot be created through registration"));

        String body = """
                {"name":"A","email":"a@b.com","password":"secret123","role":"ADMIN"}""";

        mockMvc.perform(post("/api/users/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.status").value(400))
                .andExpect(jsonPath("$.message").value("Admin accounts cannot be created through registration"));
    }

    @Test
    void loginInvalidCredentialsReturns401() throws Exception {
        when(userService.login("x@y.com", "wrong")).thenThrow(new InvalidCredentialsException());

        String body = """
                {"email":"x@y.com","password":"wrong"}""";

        mockMvc.perform(post("/api/users/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.message").value("Invalid email or password"));
    }

    @Test
    void loginSuccessReturnsToken() throws Exception {
        when(userService.login("ok@example.com", "secret123")).thenReturn("jwt-token-here");

        String body = """
                {"email":"ok@example.com","password":"secret123"}""";

        mockMvc.perform(post("/api/users/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").value("jwt-token-here"));
    }

    @Test
    void deleteWithoutAuthenticationReturns401() throws Exception {
        mockMvc.perform(delete("/api/users/delete"))
                .andExpect(status().isUnauthorized());
    }
}
