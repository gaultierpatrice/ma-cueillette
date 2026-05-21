package com.cueillette.backend.security;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfigurationSource;

@Configuration
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthenticationFilter;
    private final CorsConfigurationSource corsConfigurationSource;

    public SecurityConfig(JwtAuthenticationFilter jwtAuthenticationFilter, CorsConfigurationSource corsConfigurationSource) {
        this.jwtAuthenticationFilter = jwtAuthenticationFilter;
        this.corsConfigurationSource = corsConfigurationSource;
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
                .csrf(csrf -> csrf.disable())
                .cors(cors -> cors.configurationSource(corsConfigurationSource))
                .formLogin(form -> form.disable())
                .httpBasic(basic -> basic.disable())
                .sessionManagement(session -> session
                        .sessionCreationPolicy(SessionCreationPolicy.STATELESS)
                )
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers("/api/users/register", "/api/users/login").permitAll()
                        .requestMatchers(HttpMethod.POST, "/api/contact").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/uploads/**").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/pickings/mine").hasRole("PRODUCER")
                        .requestMatchers(HttpMethod.PUT, "/api/pickings/*").hasRole("PRODUCER")
                        .requestMatchers(HttpMethod.POST, "/api/pickings/*/image").hasRole("PRODUCER")
                        .requestMatchers(HttpMethod.GET, "/api/pickings/**").permitAll()
                        .requestMatchers(HttpMethod.POST, "/api/pickings/*/reviews").authenticated()
                        .requestMatchers(HttpMethod.POST, "/api/pickings").hasRole("PRODUCER")
                        .requestMatchers(HttpMethod.DELETE, "/api/pickings/*/reviews/*").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.DELETE, "/api/pickings/*").hasRole("ADMIN")
                        .requestMatchers(request -> "OPTIONS".equals(request.getMethod())).permitAll()
                        .requestMatchers("/api/favorites/**").authenticated()
                        .anyRequest().authenticated()
                )
                .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);
        return http.build();
    }
}