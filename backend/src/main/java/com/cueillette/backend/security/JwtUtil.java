package com.cueillette.backend.security;

import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.security.Key;
import java.util.Date;
import java.util.Map;

@Component
public class JwtUtil {

    @Value("${jwt.secret}")
    private String secret;

    @Value("${jwt.expiration}")
    private long expiration;

    private Key getKey() {
        return Keys.hmacShaKeyFor(secret.getBytes());
    }

    public String generateToken(String email, String role, String name, String farmName) {
        var builder = Jwts.builder()
                .setSubject(email)
                .claim("role", role)
                .claim("name", name)
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + expiration));
        
        if (farmName != null && !farmName.isEmpty()) {
            builder.claim("farmName", farmName);
        }
        
        return builder.signWith(getKey(), SignatureAlgorithm.HS256)
                .compact();
    }

    public String extractEmail(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(getKey())
                .build()
                .parseClaimsJws(token)
                .getBody()
                .getSubject();
    }

    public String extractRole(String token) {
        Map<String, Object> claims = Jwts.parserBuilder()
                .setSigningKey(getKey())
                .build()
                .parseClaimsJws(token)
                .getBody();
        Object role = claims.get("role");
        return role != null ? role.toString() : null;
    }

    public boolean isTokenValid(String token) {
        try {
            Jwts.parserBuilder().setSigningKey(getKey()).build().parseClaimsJws(token);
            return true;
        } catch (JwtException e) {
            return false;
        }
    }
}