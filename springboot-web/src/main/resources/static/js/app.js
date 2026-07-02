const { createApp } = Vue;

function createEmptyBookForm() {
    return {
        title: "",
        author: "",
        category: "",
        publisher: "",
        price: 0,
        stock: 0
    };
}

createApp({
    data() {
        return {
            books: [],
            searchKeyword: "",
            loading: false,
            submitting: false,
            errorMessage: "",
            statusMessage: "正在准备图书数据...",
            showBookDialog: false,
            showPurchaseDialog: false,
            editingBook: {},
            purchaseTarget: {},
            purchaseQuantity: 1,
            bookForm: createEmptyBookForm()
        };
    },
    computed: {
        lowStockCount() {
            return this.books.filter((book) => (book.stock ?? 0) > 0 && (book.stock ?? 0) <= 10).length;
        },
        totalStock() {
            return this.books.reduce((sum, book) => sum + (book.stock ?? 0), 0);
        }
    },
    mounted() {
        this.fetchBooks();
    },
    methods: {
        async request(url, options = {}) {
            const response = await fetch(url, {
                headers: {
                    "Content-Type": "application/json",
                    ...(options.headers || {})
                },
                ...options
            });

            if (!response.ok) {
                const text = await response.text();
                throw new Error(text || "请求失败");
            }

            if (response.status === 204) {
                return null;
            }

            const contentType = response.headers.get("content-type") || "";
            if (contentType.includes("application/json")) {
                return response.json();
            }
            return response.text();
        },
        async fetchBooks() {
            this.loading = true;
            this.errorMessage = "";
            this.statusMessage = "正在加载图书数据...";
            try {
                this.books = await this.request("/api/books");
                this.statusMessage = `已加载 ${this.books.length} 本图书`;
            } catch (error) {
                this.errorMessage = error.message || "加载失败";
            } finally {
                this.loading = false;
            }
        },
        async searchBooks() {
            this.loading = true;
            this.errorMessage = "";
            this.statusMessage = "正在查询图书...";
            const keyword = this.searchKeyword.trim();
            const url = keyword ? `/api/books/search?name=${encodeURIComponent(keyword)}` : "/api/books";
            try {
                this.books = await this.request(url);
                this.statusMessage = keyword
                    ? `找到 ${this.books.length} 本匹配 “${keyword}” 的图书`
                    : `已加载 ${this.books.length} 本图书`;
            } catch (error) {
                this.errorMessage = error.message || "查询失败";
            } finally {
                this.loading = false;
            }
        },
        async resetSearch() {
            this.searchKeyword = "";
            await this.fetchBooks();
        },
        openCreateDialog() {
            this.editingBook = {};
            this.bookForm = createEmptyBookForm();
            this.showBookDialog = true;
        },
        openEditDialog(book) {
            this.editingBook = { ...book };
            this.bookForm = {
                title: book.title ?? "",
                author: book.author ?? "",
                category: book.category ?? "",
                publisher: book.publisher ?? "",
                price: Number(book.price ?? 0),
                stock: Number(book.stock ?? 0)
            };
            this.showBookDialog = true;
        },
        closeBookDialog() {
            this.showBookDialog = false;
            this.editingBook = {};
            this.bookForm = createEmptyBookForm();
        },
        openPurchaseDialog(book) {
            this.purchaseTarget = { ...book };
            this.purchaseQuantity = 1;
            this.showPurchaseDialog = true;
        },
        closePurchaseDialog() {
            this.showPurchaseDialog = false;
            this.purchaseTarget = {};
            this.purchaseQuantity = 1;
        },
        normalizeBookPayload() {
            return {
                title: this.bookForm.title.trim(),
                author: this.bookForm.author.trim(),
                category: this.bookForm.category.trim(),
                publisher: this.bookForm.publisher.trim(),
                price: Number(this.bookForm.price),
                stock: Number(this.bookForm.stock)
            };
        },
        async submitBook() {
            const payload = this.normalizeBookPayload();
            if (!payload.title || !payload.author) {
                this.errorMessage = "书名和作者不能为空";
                return;
            }
            if (Number.isNaN(payload.price) || payload.price < 0) {
                this.errorMessage = "价格必须大于或等于 0";
                return;
            }
            if (!Number.isInteger(payload.stock) || payload.stock < 0) {
                this.errorMessage = "库存必须是大于或等于 0 的整数";
                return;
            }

            this.submitting = true;
            this.errorMessage = "";
            try {
                if (this.editingBook.id) {
                    await this.request(`/api/books/${this.editingBook.id}`, {
                        method: "PUT",
                        body: JSON.stringify(payload)
                    });
                    this.statusMessage = "图书信息已更新";
                } else {
                    await this.request("/api/books", {
                        method: "POST",
                        body: JSON.stringify(payload)
                    });
                    this.statusMessage = "图书已创建";
                }
                this.closeBookDialog();
                await this.searchBooks();
            } catch (error) {
                this.errorMessage = error.message || "提交失败";
            } finally {
                this.submitting = false;
            }
        },
        async deleteBook(book) {
            const confirmed = window.confirm(`确认删除《${book.title}》吗？`);
            if (!confirmed) {
                return;
            }

            this.errorMessage = "";
            this.statusMessage = `正在删除《${book.title}》...`;
            try {
                await this.request(`/api/books/${book.id}`, {
                    method: "DELETE"
                });
                this.statusMessage = "图书已删除";
                await this.searchBooks();
            } catch (error) {
                this.errorMessage = error.message || "删除失败";
            }
        },
        async submitPurchase() {
            if (!Number.isInteger(this.purchaseQuantity) || this.purchaseQuantity <= 0) {
                this.errorMessage = "购买数量必须是正整数";
                return;
            }

            this.submitting = true;
            this.errorMessage = "";
            try {
                await this.request(
                    `/api/books/${this.purchaseTarget.id}/purchase?qty=${this.purchaseQuantity}`,
                    { method: "POST" }
                );
                this.statusMessage = `已购买 ${this.purchaseQuantity} 本《${this.purchaseTarget.title}》`;
                this.closePurchaseDialog();
                await this.searchBooks();
            } catch (error) {
                this.errorMessage = error.message || "购买失败";
            } finally {
                this.submitting = false;
            }
        },
        formatPrice(price) {
            return Number(price ?? 0).toFixed(2);
        },
        stockLevelClass(stock) {
            const value = stock ?? 0;
            if (value <= 0) {
                return "out";
            }
            if (value <= 10) {
                return "low";
            }
            return "high";
        }
    }
}).mount("#app");
