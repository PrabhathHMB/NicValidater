package lk.mobios.fileservice.repository; 

import lk.mobios.fileservice.entity.CsvFile;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface CsvFileRepository extends JpaRepository<CsvFile, Long> {
    List<CsvFile> findByUploadedBy(Long uploadedBy);
}
