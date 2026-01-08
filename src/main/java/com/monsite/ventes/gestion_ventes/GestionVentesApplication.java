package com.monsite.ventes.gestion_ventes;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableAsync;

@SpringBootApplication
@EnableAsync
public class GestionVentesApplication {

	public static void main(String[] args) {
		SpringApplication.run(GestionVentesApplication.class, args);
	}

}
