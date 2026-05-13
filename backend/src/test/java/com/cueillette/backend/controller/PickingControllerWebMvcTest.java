package com.cueillette.backend.controller;

import com.cueillette.backend.exception.RestExceptionHandler;
import com.cueillette.backend.repository.UserRepository;
import com.cueillette.backend.service.PickingService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;

import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(controllers = PickingController.class)
@AutoConfigureMockMvc(addFilters = false)
@Import(RestExceptionHandler.class)
class PickingControllerWebMvcTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private PickingService pickingService;

    @MockBean
    private UserRepository userRepository;

    @Test
    void listPickingsReturnsJsonArray() throws Exception {
        when(pickingService.getAllPickingsWithRatings()).thenReturn(List.of());

        mockMvc.perform(get("/api/pickings"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray());
    }
}
