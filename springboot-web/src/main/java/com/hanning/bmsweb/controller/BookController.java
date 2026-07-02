
package com.hanning.bmsweb.controller;

import com.hanning.bmsweb.entity.Book;
import com.hanning.bmsweb.service.BookService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.util.List;

@RestController
@RequestMapping("/api/books")
public class BookController {
    private final BookService service;

    public BookController(BookService service) {
        this.service = service;
    }

    @GetMapping
    public List<Book> all() {
        return service.findAll();
    }

    @GetMapping("/search")
    public List<Book> search(@RequestParam(value = "name", required = false) String name) {
        if (name == null || name.trim().isEmpty()) {
            return service.findAll();
        }
        return service.findByName(name.trim());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Book> get(@PathVariable Integer id) {
        return service.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<Book> create(@RequestBody Book book) {
        Book saved = service.save(book);
        return ResponseEntity.created(URI.create("/api/books/" + saved.getId())).body(saved);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Book> update(@PathVariable Integer id, @RequestBody Book book) {
        return service.findById(id).map(existing -> {
            book.setId(existing.getId());
            Book saved = service.save(book);
            return ResponseEntity.ok(saved);
        }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Integer id) {
        service.deleteById(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/purchase")
    public ResponseEntity<String> purchase(@PathVariable Integer id, @RequestParam(value = "qty", defaultValue = "1") int qty) {
        boolean ok = service.purchase(id, qty);
        if (ok) {
            return ResponseEntity.ok("purchase_success");
        }
        return ResponseEntity.badRequest().body("库存不足、数量非法或图书不存在");
    }
}
