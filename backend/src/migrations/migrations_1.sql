CREATE TABLE IF NOT EXISTS products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    sku VARCHAR(100) UNIQUE NOT NULL,
    image VARCHAR(255),
    price NUMERIC(10, 2) NOT NULL,
    description TEXT NULL,
    stock INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW(),
    modified_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    sku VARCHAR(100) NOT NULL REFERENCES products(sku) ON DELETE CASCADE,
    qty INT NOT NULL CHECK (qty <> 0),
    amount NUMERIC (10,2),
    created_at TIMESTAMP DEFAULT NOW(),
    modified_at TIMESTAMP DEFAULT NOW()
);

CREATE OR REPLACE FUNCTION update_stock_and_calculate_amount() RETURNS trigger AS $$
BEGIN
    IF (TG_OP = 'DELETE') THEN
        UPDATE products
        SET stock = stock - OLD.qty
        WHERE sku = OLD.sku;

        IF (SELECT stock FROM products WHERE sku = OLD.sku) < 0 THEN
            RAISE EXCEPTION 'Insufficient stock for SKU %', OLD.sku;
        END IF;

        RETURN OLD;
    END IF;

    IF (TG_OP = 'INSERT' OR TG_OP = 'UPDATE') THEN
        UPDATE products
        SET stock = stock + NEW.qty - COALESCE(OLD.qty, 0)
        WHERE sku = NEW.sku;

        IF (SELECT stock FROM products WHERE sku = NEW.sku) < 0 THEN
            RAISE EXCEPTION 'Insufficient stock for SKU %', NEW.sku;
        END IF;

        NEW.amount := NEW.qty * (SELECT price FROM products WHERE sku = NEW.sku);
        RETURN NEW;
    END IF;
END;
$$ LANGUAGE plpgsql;


-- Trigger for INSERT and UPDATE operations
CREATE TRIGGER update_stock_and_calculate_amount_trigger
BEFORE INSERT OR UPDATE ON transactions
FOR EACH ROW EXECUTE FUNCTION update_stock_and_calculate_amount();

-- Trigger for DELETE operation
CREATE TRIGGER update_stock_on_delete_trigger
BEFORE DELETE ON transactions
FOR EACH ROW EXECUTE FUNCTION update_stock_and_calculate_amount();


-- Trigger function to update modified_at column
CREATE OR REPLACE FUNCTION update_modified_at() RETURNS trigger AS $$
BEGIN
    NEW.modified_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for updating modified_at on products
CREATE TRIGGER update_products_modified_at_trigger
BEFORE UPDATE ON products
FOR EACH ROW EXECUTE FUNCTION update_modified_at();

-- Trigger for updating modified_at on transactions
CREATE TRIGGER update_transactions_modified_at_trigger
BEFORE UPDATE ON transactions
FOR EACH ROW EXECUTE FUNCTION update_modified_at();



