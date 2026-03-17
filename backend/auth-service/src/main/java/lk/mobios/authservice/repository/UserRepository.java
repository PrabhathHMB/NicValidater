package lk.mobios.authservice.repository;

import lk.mobios.authservice.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByUsername(String username);
    Optional<User> findByEmail(String email);
    Optional<User> findByResetToken(String resetToken);
    boolean existsByUsername(String username);
    boolean existsByEmail(String email);

    @Modifying
    @Transactional
    @Query(value = "DELETE FROM nic_records WHERE user_id = :userId", nativeQuery = true)
    void deleteNicRecordsByUserId(@Param("userId") Long userId);

    @Modifying
    @Transactional
    @Query(value = "DELETE FROM csv_files WHERE uploaded_by = :userId", nativeQuery = true)
    void deleteCsvFilesByUserId(@Param("userId") Long userId);
}
