package com.example.chitfund.security;

import com.example.chitfund.entity.User;
import com.example.chitfund.enums.Role;
import com.example.chitfund.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        if (!userRepository.existsByUsername("admin")) {
            User admin = User.builder()
                    .fullName("System Administrator")
                    .username("admin")
                    .password(passwordEncoder.encode("admin@123"))
                    .email("admin@chitcollection.com")
                    .phone("9000000000")
                    .role(Role.ADMIN)
                    .active(true)
                    .build();
            userRepository.save(admin);
            log.info("Default admin user created: username=admin, password=admin@123");
        }

        if (!userRepository.existsByUsername("agent1")) {
            User agent = User.builder()
                    .fullName("Default Agent")
                    .username("agent1")
                    .password(passwordEncoder.encode("agent@123"))
                    .email("agent1@chitcollection.com")
                    .phone("9000000001")
                    .role(Role.AGENT)
                    .active(true)
                    .build();
            userRepository.save(agent);
            log.info("Default agent user created: username=agent1, password=agent@123");
        }
    }
}