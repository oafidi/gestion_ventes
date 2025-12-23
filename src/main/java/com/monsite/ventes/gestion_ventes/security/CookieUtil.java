package com.monsite.ventes.gestion_ventes.security;

import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

@Component
public class CookieUtil {

    @Value("${jwt.cookie.name}")
    private String cookieName;

    @Value("${jwt.cookie.max-age}")
    private int cookieMaxAge;

    @Value("${jwt.cookie.secure}")
    private boolean cookieSecure;

    @Value("${jwt.cookie.http-only}")
    private boolean cookieHttpOnly;

    public void createJwtCookie(HttpServletResponse response, String token) {
        Cookie cookie = new Cookie(cookieName, token);
        cookie.setHttpOnly(cookieHttpOnly);
        cookie.setSecure(cookieSecure);
        cookie.setPath("/");
        cookie.setMaxAge(cookieMaxAge);
        response.addCookie(cookie);
    }

    public void clearJwtCookie(HttpServletResponse response) {
        Cookie cookie = new Cookie(cookieName, null);
        cookie.setHttpOnly(cookieHttpOnly);
        cookie.setSecure(cookieSecure);
        cookie.setPath("/");
        cookie.setMaxAge(0);
        response.addCookie(cookie);
    }
}
