package com.shanghai.travelbackend.service;

import com.shanghai.travelbackend.entity.User;
import com.shanghai.travelbackend.entity.UserRole;
import com.shanghai.travelbackend.exception.BusinessException;
import com.shanghai.travelbackend.exception.ErrorCode;
import com.shanghai.travelbackend.repository.UserRepository;
import com.shanghai.travelbackend.service.impl.UserServiceImpl;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.ArgumentMatchers.startsWith;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class UserServiceImplTest {

    @Mock
    private UserRepository userRepository;

    private final PasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    @Test
    void registerNormalizesUsernameBeforeCheckingAndSaving() {
        UserServiceImpl service = new UserServiceImpl(userRepository, passwordEncoder);
        when(userRepository.existsByUsername("demo")).thenReturn(false);
        when(userRepository.save(any(User.class))).thenAnswer(invocation -> {
            User saved = invocation.getArgument(0);
            saved.setId(9L);
            return saved;
        });

        User user = service.register("  demo  ", "123456");

        assertThat(user.getId()).isEqualTo(9L);
        assertThat(user.getUsername()).isEqualTo("demo");
        assertThat(user.getRole()).isEqualTo(UserRole.USER);
        assertThat(user.getPassword()).isNotEqualTo("123456");
        assertThat(passwordEncoder.matches("123456", user.getPassword())).isTrue();
        verify(userRepository).existsByUsername("demo");
    }

    @Test
    void loginUsesOneCredentialErrorForUnknownUser() {
        PasswordEncoder mockedPasswordEncoder = mock(PasswordEncoder.class);
        UserServiceImpl service = new UserServiceImpl(userRepository, mockedPasswordEncoder);
        when(userRepository.findByUsername("missing")).thenReturn(Optional.empty());

        assertThatThrownBy(() -> service.login("missing", "123456"))
                .isInstanceOfSatisfying(BusinessException.class, exception -> {
                    assertThat(exception.getErrorCode()).isEqualTo(ErrorCode.INVALID_CREDENTIALS);
                    assertThat(exception.getMessage()).isEqualTo("用户名或密码错误");
                });
        verify(mockedPasswordEncoder).matches(eq("123456"), startsWith("$2a$"));
    }

    @Test
    void loginVerifiesBcryptHash() {
        UserServiceImpl service = new UserServiceImpl(userRepository, passwordEncoder);
        User user = new User();
        user.setId(3L);
        user.setUsername("demo");
        user.setPassword(passwordEncoder.encode("123456"));
        when(userRepository.findByUsername("demo")).thenReturn(Optional.of(user));

        assertThat(service.login(" demo ", "123456")).isSameAs(user);
    }
}
