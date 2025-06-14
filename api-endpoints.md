
# API Endpoints untuk Hosting

Buat folder `api/` di hosting dengan file-file PHP berikut:

## 1. Database Connection (api/config/database.php)
```php
<?php
class Database {
    private $host = 'localhost';
    private $db_name = 'sedekat_crm';
    private $username = 'your_db_user';
    private $password = 'your_db_password';
    private $conn;

    public function getConnection() {
        $this->conn = null;
        try {
            $this->conn = new PDO("pgsql:host=" . $this->host . ";dbname=" . $this->db_name, 
                                  $this->username, $this->password);
            $this->conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
        } catch(PDOException $exception) {
            echo "Connection error: " . $exception->getMessage();
        }
        return $this->conn;
    }
}
?>
```

## 2. Auth Endpoints (api/auth/)
- `login.php` - User authentication
- `logout.php` - User logout
- `verify.php` - Token verification

## 3. Database Endpoints (api/database/)
- `query.php` - Execute SQL queries
- `tables.php` - Table operations

## 4. Business Logic (api/*)
- `customers.php` - Customer operations
- `orders.php` - Order management
- `products.php` - Product catalog
- `resellers.php` - Reseller management

File-file PHP ini akan menggantikan fungsi Supabase dan menyediakan API yang sama.
