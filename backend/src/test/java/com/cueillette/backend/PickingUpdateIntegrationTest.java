package com.cueillette.backend;

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

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class PickingUpdateIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    void updatePicking_canChangeName() throws Exception {
        String suffix = UUID.randomUUID().toString();
        String producerEmail = "producer-update+" + suffix + "@example.com";

        String producerToken = registerAndLogin(producerEmail);

        MvcResult createResult = mockMvc.perform(post("/api/pickings")
                        .header("Authorization", "Bearer " + producerToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "name":"Ancien Nom",
                                  "address":"10 rue des Pommes",
                                  "postalCode":"75001",
                                  "city":"Paris",
                                  "lat":48.85,
                                  "lng":2.35
                                }"""))
                .andExpect(status().isCreated())
                .andReturn();

        long pickingId = objectMapper
                .readTree(createResult.getResponse().getContentAsString())
                .get("id")
                .asLong();

        mockMvc.perform(put("/api/pickings/" + pickingId)
                        .header("Authorization", "Bearer " + producerToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "name":"Nouveau Nom",
                                  "phone":"01 23 45 67 89",
                                  "categories": { "fruits": true, "vegetables": false },
                                  "products": [],
                                  "labels": []
                                }"""))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("Nouveau Nom"));

        mockMvc.perform(get("/api/pickings/mine").header("Authorization", "Bearer " + producerToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("Nouveau Nom"));

        mockMvc.perform(get("/api/pickings/" + pickingId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("Nouveau Nom"));
    }

    private String registerAndLogin(String email) throws Exception {
        mockMvc.perform(post("/api/users/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"name":"Producer","email":"%s","password":"secret123","role":"PRODUCER","farmName":"Farm JWT"}"""
                                .formatted(email)))
                .andExpect(status().isOk());

        MvcResult loginResult = mockMvc.perform(post("/api/users/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"email":"%s","password":"secret123"}"""
                                .formatted(email)))
                .andExpect(status().isOk())
                .andReturn();

        return objectMapper
                .readTree(loginResult.getResponse().getContentAsString())
                .get("token")
                .asText();
    }
}
