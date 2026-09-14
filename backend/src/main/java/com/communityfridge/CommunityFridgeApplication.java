package com.communityfridge;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class CommunityFridgeApplication {

    public static void main(String[] args) {
        SpringApplication.run(CommunityFridgeApplication.class, args);
    }
}
