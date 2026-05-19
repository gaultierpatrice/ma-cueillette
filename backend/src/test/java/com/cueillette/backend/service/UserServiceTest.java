package com.cueillette.backend.service;

import com.cueillette.backend.exception.BadRequestException;
import com.cueillette.backend.exception.ConflictException;
import com.cueillette.backend.exception.InvalidCredentialsException;
import com.cueillette.backend.exception.NotFoundException;
import com.cueillette.backend.model.Role;
import com.cueillette.backend.model.User;
import com.cueillette.backend.repository.UserRepository;
import com.cueillette.backend.security.JwtUtil;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class UserServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private JwtUtil jwtUtil;

    @InjectMocks
    private UserService userService;

    @Test
    void createUser_rejectsAdminRegistration() {
        assertThatThrownBy(() -> userService.createUser("Admin", "admin@test.com", "secret", Role.ADMIN, null))
                .isInstanceOf(BadRequestException.class)
                .hasMessageContaining("Admin accounts");

        verifyNoInteractions(userRepository);
    }

    @Test
    void createUser_throwsWhenEmailAlreadyExists() {
        when(userRepository.existsByEmail("taken@test.com")).thenReturn(true);

        assertThatThrownBy(() -> userService.createUser("Alice", "taken@test.com", "secret", Role.USER, null))
                .isInstanceOf(ConflictException.class)
                .hasMessage("Email already in use");

        verify(userRepository, never()).save(any());
    }

    @Test
    void createUser_encodesPasswordAndSetsFarmNameForProducer() {
        when(userRepository.existsByEmail("producer@test.com")).thenReturn(false);
        when(passwordEncoder.encode("plain")).thenReturn("encoded");
        when(userRepository.save(any(User.class))).thenAnswer(invocation -> {
            User saved = invocation.getArgument(0);
            saved.setId(UUID.randomUUID());
            return saved;
        });

        User result = userService.createUser("Farm Owner", "producer@test.com", "plain", Role.PRODUCER, "  Ma Ferme  ");

        ArgumentCaptor<User> captor = ArgumentCaptor.forClass(User.class);
        verify(userRepository).save(captor.capture());
        User saved = captor.getValue();

        assertThat(saved.getPassword()).isEqualTo("encoded");
        assertThat(saved.getFarmName()).isEqualTo("  Ma Ferme  ");
        assertThat(saved.getRole()).isEqualTo(Role.PRODUCER);
        assertThat(result.getEmail()).isEqualTo("producer@test.com");
        verify(passwordEncoder).encode("plain");
    }

    @Test
    void createUser_omitsFarmNameForNonProducer() {
        when(userRepository.existsByEmail("user@test.com")).thenReturn(false);
        when(passwordEncoder.encode("plain")).thenReturn("encoded");
        when(userRepository.save(any(User.class))).thenAnswer(invocation -> invocation.getArgument(0));

        userService.createUser("Bob", "user@test.com", "plain", Role.USER, "Ignored Farm");

        ArgumentCaptor<User> captor = ArgumentCaptor.forClass(User.class);
        verify(userRepository).save(captor.capture());
        assertThat(captor.getValue().getFarmName()).isNull();
    }

    @Test
    void login_throwsWhenUserNotFound() {
        when(userRepository.findByEmail("missing@test.com")).thenReturn(Optional.empty());

        assertThatThrownBy(() -> userService.login("missing@test.com", "secret"))
                .isInstanceOf(InvalidCredentialsException.class);

        verifyNoInteractions(jwtUtil);
    }

    @Test
    void login_throwsWhenPasswordDoesNotMatch() {
        User user = new User();
        user.setEmail("user@test.com");
        user.setPassword("encoded");
        when(userRepository.findByEmail("user@test.com")).thenReturn(Optional.of(user));
        when(passwordEncoder.matches("wrong", "encoded")).thenReturn(false);

        assertThatThrownBy(() -> userService.login("user@test.com", "wrong"))
                .isInstanceOf(InvalidCredentialsException.class);

        verifyNoInteractions(jwtUtil);
    }

    @Test
    void login_returnsJwtTokenOnSuccess() {
        User user = new User();
        user.setEmail("user@test.com");
        user.setPassword("encoded");
        user.setName("Alice");
        user.setRole(Role.USER);
        user.setFarmName(null);
        when(userRepository.findByEmail("user@test.com")).thenReturn(Optional.of(user));
        when(passwordEncoder.matches("secret", "encoded")).thenReturn(true);
        when(jwtUtil.generateToken("user@test.com", "USER", "Alice", null)).thenReturn("jwt-token");

        String token = userService.login("user@test.com", "secret");

        assertThat(token).isEqualTo("jwt-token");
        verify(jwtUtil).generateToken("user@test.com", "USER", "Alice", null);
    }

    @Test
    void deleteUserAccount_throwsWhenUserNotFound() {
        when(userRepository.findByEmail("ghost@test.com")).thenReturn(Optional.empty());

        assertThatThrownBy(() -> userService.deleteUserAccount("ghost@test.com"))
                .isInstanceOf(NotFoundException.class)
                .hasMessage("User not found");

        verify(userRepository, never()).delete(any());
    }

    @Test
    void deleteUserAccount_deletesExistingUser() {
        User user = new User();
        user.setEmail("user@test.com");
        when(userRepository.findByEmail("user@test.com")).thenReturn(Optional.of(user));

        userService.deleteUserAccount("user@test.com");

        verify(userRepository).delete(user);
    }
}
