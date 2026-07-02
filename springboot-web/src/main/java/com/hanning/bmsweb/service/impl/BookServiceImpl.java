
package com.hanning.bmsweb.service.impl;

import com.hanning.bmsweb.entity.Book;
import com.hanning.bmsweb.repository.BookRepository;
import com.hanning.bmsweb.service.BookService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@Transactional
public class BookServiceImpl implements BookService {

    private final BookRepository repository;

    public BookServiceImpl(BookRepository repository) {
        this.repository = repository;
    }

    @Override
    @Transactional(readOnly = true)
    public List<Book> findAll() {
        return repository.findAll();
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<Book> findById(Integer id) {
        return repository.findById(id);
    }

    @Override
    @Transactional(readOnly = true)
    public List<Book> findByName(String name) {
        return repository.findByTitleContainingIgnoreCase(name);
    }

    @Override
    public Book save(Book book) {
        return repository.save(book);
    }

    @Override
    public void deleteById(Integer id) {
        repository.deleteById(id);
    }

    @Override
    public boolean purchase(Integer id, int quantity) {
        if (quantity <= 0) {
            return false;
        }
        
        Optional<Book> optionalBook = repository.findById(id);
        if (optionalBook.isEmpty()) {
            return false;
        }
        
        Book book = optionalBook.get();
        int currentStock = book.getStock() == null ? 0 : book.getStock();
        if (currentStock < quantity) {
            return false;
        }

        book.setStock(currentStock - quantity);
        repository.save(book);
        return true;
    }
}
