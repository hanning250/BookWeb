
package com.hanning.bmsweb.service;

import com.hanning.bmsweb.entity.Book;

import java.util.List;
import java.util.Optional;

public interface BookService {
    List<Book> findAll();
    Optional<Book> findById(Integer id);
    List<Book> findByName(String name);
    Book save(Book book);
    void deleteById(Integer id);
    boolean purchase(Integer id, int quantity);
}
