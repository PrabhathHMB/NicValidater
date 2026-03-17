package lk.mobios.nicservice.repository;

import lk.mobios.nicservice.entity.NicRecord;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import org.springframework.data.jpa.repository.Modifying;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

public interface NicRecordRepository extends JpaRepository<NicRecord, Long> {
    Optional<NicRecord> findByNicNumber(String nicNumber);
    List<NicRecord> findByFileId(Long fileId);
    
    @Modifying
    @Transactional
    void deleteByFileId(Long fileId);
    List<NicRecord> findByFileName(String fileName);
    List<NicRecord> findByGender(String gender);
    List<NicRecord> findByIsValid(Boolean isValid);

    long countByGender(String gender);
    long countByIsValid(Boolean isValid);
    long countByUserIdAndGender(Long userId, String gender);
    long countByUserIdAndIsValid(Long userId, Boolean isValid);

    @Query("SELECT n.fileName, COUNT(n) FROM NicRecord n GROUP BY n.fileName")
    List<Object[]> countByFileNameGrouped();

    @Query("SELECT n.fileName, COUNT(n) FROM NicRecord n WHERE n.userId = :userId GROUP BY n.fileName")
    List<Object[]> countByUserIdAndFileNameGrouped(Long userId);

    @Query("SELECT n.gender, COUNT(n) FROM NicRecord n WHERE n.isValid = true GROUP BY n.gender")
    List<Object[]> countValidByGender();

    @Query("SELECT n.gender, COUNT(n) FROM NicRecord n WHERE n.isValid = true AND n.userId = :userId GROUP BY n.gender")
    List<Object[]> countUserIdAndValidByGender(Long userId);

    @Query("SELECT n FROM NicRecord n WHERE (:userId IS NULL OR n.userId = :userId) " +
           "AND (:fileName IS NULL OR n.fileName = :fileName) " +
           "AND (:gender IS NULL OR n.gender = :gender) " +
           "AND (:isValid IS NULL OR n.isValid = :isValid)")
    List<NicRecord> findWithFilters(Long userId, String fileName, String gender, Boolean isValid);

    long countByUserId(Long userId);
}
