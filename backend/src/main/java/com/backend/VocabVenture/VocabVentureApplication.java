package com.backend.VocabVenture;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.domain.EntityScan;

@SpringBootApplication
@EntityScan(basePackages = "com.backend.VocabVenture.model")
public class VocabVentureApplication {

	public static void main(String[] args) {
		SpringApplication.run(VocabVentureApplication.class, args);
	}

}
