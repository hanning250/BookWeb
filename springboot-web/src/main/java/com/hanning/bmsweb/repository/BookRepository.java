
package com.hanning.bmsweb.repository;

import com.hanning.bmsweb.entity.Book;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface BookRepository extends JpaRepository<Book, Integer> {
    List<Book> findByTitleContainingIgnoreCase(String title);
}
