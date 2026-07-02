
CREATE TABLE IF NOT EXISTS tb_book (
    id INT PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(255),
    author VARCHAR(255),
    category VARCHAR(128),
    publisher VARCHAR(255),
    price DOUBLE,
    stock INT
);
