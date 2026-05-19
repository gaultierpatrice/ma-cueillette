package com.cueillette.backend;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import java.util.UUID;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class PickingFavoriteIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    void createPickingAddFavoriteListAndRemoveEndToEnd() throws Exception {
        String suffix = UUID.randomUUID().toString();
        String producerEmail = "producer+" + suffix + "@example.com";
        String userEmail = "picker+" + suffix + "@example.com";

        String producerToken = registerAndLogin(
                producerEmail,
                """
                {"name":"Producer","email":"%s","password":"secret123","role":"PRODUCER","farmName":"Test Farm"}"""
                        .formatted(producerEmail));

        String pickingJson = """
                {
                  "name":"Ferme Integration",
                  "address":"10 rue des Pommes",
                  "postalCode":"H2X1Y4",
                  "city":"Montreal",
                  "lat":45.5,
                  "lng":-73.5,
                  "description":"Integration test picking"
                }""";

        MvcResult createResult = mockMvc.perform(post("/api/pickings")
                        .header("Authorization", "Bearer " + producerToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(pickingJson))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.name").value("Ferme Integration"))
                .andExpect(jsonPath("$.id").exists())
                .andReturn();

        long pickingId = objectMapper
                .readTree(createResult.getResponse().getContentAsString())
                .get("id")
                .asLong();

        mockMvc.perform(get("/api/pickings"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[?(@.id == " + pickingId + ")].name").value("Ferme Integration"));

        String userToken = registerAndLogin(
                userEmail,
                """
                {"name":"Picker","email":"%s","password":"secret123","role":"USER"}"""
                        .formatted(userEmail));

        mockMvc.perform(post("/api/favorites/" + pickingId)
                        .header("Authorization", "Bearer " + userToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("Picking added to favorites"))
                .andExpect(jsonPath("$.favoriteId").exists());

        mockMvc.perform(get("/api/favorites/check/" + pickingId)
                        .header("Authorization", "Bearer " + userToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.isFavorite").value(true));

        mockMvc.perform(get("/api/favorites").header("Authorization", "Bearer " + userToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$[0].id").value((int) pickingId))
                .andExpect(jsonPath("$[0].name").value("Ferme Integration"));

        mockMvc.perform(delete("/api/favorites/" + pickingId)
                        .header("Authorization", "Bearer " + userToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("Picking removed from favorites"));

        mockMvc.perform(get("/api/favorites/check/" + pickingId)
                        .header("Authorization", "Bearer " + userToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.isFavorite").value(false));

        mockMvc.perform(get("/api/favorites").header("Authorization", "Bearer " + userToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isEmpty());
    }

    private String registerAndLogin(String email, String registerJson) throws Exception {
        mockMvc.perform(post("/api/users/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(registerJson))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.email").value(email));

        String loginJson = """
                {"email":"%s","password":"secret123"}"""
                .formatted(email);

        MvcResult loginResult = mockMvc.perform(post("/api/users/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(loginJson))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").exists())
                .andReturn();

        JsonNode root = objectMapper.readTree(loginResult.getResponse().getContentAsString());
        return root.get("token").asText();
    }
}
