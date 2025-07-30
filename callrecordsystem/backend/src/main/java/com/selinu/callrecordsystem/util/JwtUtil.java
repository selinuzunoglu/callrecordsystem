package com.selinu.callrecordsystem.util;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.util.Date;
import java.util.Map;
import java.util.function.Function;

@Component
public class JwtUtil {
    private final String SECRET_KEY_STRING = "gizliAnahtar123!gizliAnahtar123!gizliAnahtar123!gizliAnahtar123!"; // 256-bit key için
    private final SecretKey SECRET_KEY = Keys.hmacShaKeyFor(SECRET_KEY_STRING.getBytes());
    private final long EXPIRATION_TIME = 1000 * 60 * 60 * 10; // 10 saat

    public String generateToken(String username, Map<String, Object> claims) {
        return Jwts.builder()
                .claims(claims)
                .subject(username)
                .issuedAt(new Date(System.currentTimeMillis()))
                .expiration(new Date(System.currentTimeMillis() + EXPIRATION_TIME))
                .signWith(SECRET_KEY)
                .compact();
    }

    public Boolean validateToken(String token, String username) {
        try {
            System.out.println("Validating token for username: " + username);
        final String extractedUsername = extractUsername(token);
            boolean isValid = (extractedUsername != null && extractedUsername.equals(username) && !isTokenExpired(token));
            System.out.println("Token validation result: " + isValid);
            return isValid;
        } catch (Exception e) {
            System.out.println("Error validating token: " + e.getMessage());
            e.printStackTrace();
            return false;
        }
    }

    public String extractUsername(String token) {
        try {
            System.out.println("Extracting username from token: " + token);
            String username = extractClaim(token, Claims::getSubject);
            System.out.println("Extracted username: " + username);
            return username;
        } catch (Exception e) {
            System.out.println("Error extracting username: " + e.getMessage());
            e.printStackTrace();
            return null;
        }
    }

    public Date extractExpiration(String token) {
        return extractClaim(token, Claims::getExpiration);
    }

    public <T> T extractClaim(String token, Function<Claims, T> claimsResolver) {
        final Claims claims = extractAllClaims(token);
        return claimsResolver.apply(claims);
    }

    private Claims extractAllClaims(String token) {
        return Jwts.parser()
                .verifyWith(SECRET_KEY)
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }

    private Boolean isTokenExpired(String token) {
        return extractExpiration(token).before(new Date());
    }
} 