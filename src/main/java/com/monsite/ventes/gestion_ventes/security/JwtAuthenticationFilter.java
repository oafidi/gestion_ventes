package com.monsite.ventes.gestion_ventes.security;

import com.monsite.ventes.gestion_ventes.service.CustomUserDetailsService;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtTokenProvider tokenProvider;
    private final CustomUserDetailsService userDetailsService;

    @Value("${jwt.cookie.name}")
    private String cookieName;

    public JwtAuthenticationFilter(JwtTokenProvider tokenProvider, CustomUserDetailsService userDetailsService) {
        this.tokenProvider = tokenProvider;
        this.userDetailsService = userDetailsService;
        System.out.println("########## JwtAuthenticationFilter INITIALIZED ##########");
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {
        
        System.out.println("########## JWT FILTER CALLED ##########");
        System.out.println("Request URI: " + request.getRequestURI());
        System.out.println("Request Method: " + request.getMethod());
        
        try {
            String jwt = getJwtFromRequest(request);
            String requestURI = request.getRequestURI();
            
            System.out.println("=== JWT Filter === URI: " + requestURI);
            System.out.println("JWT Token présent: " + (jwt != null ? "OUI (longueur: " + jwt.length() + ")" : "NON"));
            System.out.println("Authorization Header: " + request.getHeader("Authorization"));

            if (StringUtils.hasText(jwt)) {
                System.out.println("Token reçu: " + jwt.substring(0, Math.min(50, jwt.length())) + "...");
                
                boolean isValid = tokenProvider.validateToken(jwt);
                System.out.println("Token valide: " + isValid);
                
                if (isValid) {
                    String email = tokenProvider.getEmailFromToken(jwt);
                    System.out.println("Email extrait du token: " + email);
                    
                    UserDetails userDetails = userDetailsService.loadUserByUsername(email);
                    System.out.println("UserDetails chargé: " + userDetails.getUsername());
                    System.out.println("Authorities: " + userDetails.getAuthorities());

                    UsernamePasswordAuthenticationToken authentication =
                            new UsernamePasswordAuthenticationToken(userDetails, null, userDetails.getAuthorities());
                    authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));

                    SecurityContextHolder.getContext().setAuthentication(authentication);
                    System.out.println("Authentification définie dans le contexte de sécurité");
                }
            } else {
                System.out.println("Aucun token JWT trouvé dans la requête");
            }
        } catch (Exception ex) {
            System.out.println("ERREUR dans JWT Filter: " + ex.getMessage());
            ex.printStackTrace();
        }

        filterChain.doFilter(request, response);
    }

    private String getJwtFromRequest(HttpServletRequest request) {
        // D'abord vérifier le cookie HttpOnly
        Cookie[] cookies = request.getCookies();
        if (cookies != null) {
            for (Cookie cookie : cookies) {
                if (cookieName.equals(cookie.getName())) {
                    return cookie.getValue();
                }
            }
        }

        // Ensuite vérifier l'en-tête Authorization
        String bearerToken = request.getHeader("Authorization");
        if (StringUtils.hasText(bearerToken) && bearerToken.startsWith("Bearer ")) {
            return bearerToken.substring(7);
        }

        return null;
    }
}
