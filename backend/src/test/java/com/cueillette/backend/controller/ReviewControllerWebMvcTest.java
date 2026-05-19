package com.cueillette.backend.controller;

import com.cueillette.backend.exception.NotFoundException;
import com.cueillette.backend.exception.RestExceptionHandler;
import com.cueillette.backend.model.Review;
import com.cueillette.backend.security.JwtUtil;
import com.cueillette.backend.service.ReviewService;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.method.annotation.AuthenticationPrincipalArgumentResolver;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.request.RequestPostProcessor;
import org.springframework.web.method.support.HandlerMethodArgumentResolver;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.time.LocalDateTime;
import java.util.List;

import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(controllers = ReviewController.class)
@AutoConfigureMockMvc(addFilters = false)
@Import({RestExceptionHandler.class, ReviewControllerWebMvcTest.MvcTestConfig.class})
class ReviewControllerWebMvcTest {

    private static final String USER_EMAIL = "reviewer@example.com";

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private ReviewService reviewService;

    @MockBean
    private JwtUtil jwtUtil;

    private static RequestPostProcessor authenticatedAs(String email) {
        return request -> {
            var authentication = new UsernamePasswordAuthenticationToken(email, null, List.of());
            SecurityContextHolder.getContext().setAuthentication(authentication);
            return request;
        };
    }

    @AfterEach
    void clearSecurityContext() {
        SecurityContextHolder.clearContext();
    }

    @Test
    void getReviewsByPickingIdReturnsJsonArray() throws Exception {
        Review review = new Review();
        review.setId(1L);
        review.setRating(5);
        review.setComment("Excellent");
        review.setPublishedAt(LocalDateTime.parse("2026-01-15T10:00:00"));
        when(reviewService.getReviewsByPickingId(3L)).thenReturn(List.of(review));

        mockMvc.perform(get("/api/pickings/3/reviews"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$[0].id").value(1))
                .andExpect(jsonPath("$[0].rating").value(5))
                .andExpect(jsonPath("$[0].comment").value("Excellent"));
    }

    @Test
    void createReviewReturnsCreatedReview() throws Exception {
        Review saved = new Review();
        saved.setId(10L);
        saved.setRating(4);
        saved.setComment("Great place");
        when(reviewService.createReview(eq(3L), eq(USER_EMAIL), eq(4), eq("Great place")))
                .thenReturn(saved);

        String body = """
                {"rating":4,"comment":"Great place"}""";

        mockMvc.perform(post("/api/pickings/3/reviews")
                        .with(authenticatedAs(USER_EMAIL))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value(10))
                .andExpect(jsonPath("$.rating").value(4))
                .andExpect(jsonPath("$.comment").value("Great place"));
    }

    @Test
    void createReviewNotFoundReturnsApiError() throws Exception {
        when(reviewService.createReview(eq(3L), eq(USER_EMAIL), eq(4), eq("Great place")))
                .thenThrow(new NotFoundException("Picking not found"));

        String body = """
                {"rating":4,"comment":"Great place"}""";

        mockMvc.perform(post("/api/pickings/3/reviews")
                        .with(authenticatedAs(USER_EMAIL))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.status").value(404))
                .andExpect(jsonPath("$.message").value("Picking not found"))
                .andExpect(jsonPath("$.path").value("/api/pickings/3/reviews"));
    }

    @Test
    void deleteReviewReturnsNoContentWhenDeleted() throws Exception {
        when(reviewService.deleteReview(3L, 10L)).thenReturn(true);

        mockMvc.perform(delete("/api/pickings/3/reviews/10"))
                .andExpect(status().isNoContent());
    }

    @Test
    void deleteReviewReturnsNotFoundWhenMissing() throws Exception {
        when(reviewService.deleteReview(3L, 99L)).thenReturn(false);

        mockMvc.perform(delete("/api/pickings/3/reviews/99"))
                .andExpect(status().isNotFound());
    }

    @TestConfiguration
    static class MvcTestConfig implements WebMvcConfigurer {
        @Override
        public void addArgumentResolvers(List<HandlerMethodArgumentResolver> resolvers) {
            resolvers.add(new AuthenticationPrincipalArgumentResolver());
        }
    }
}
