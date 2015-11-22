-- +migrate Up
CREATE TABLE rate (id serial UNIQUE, currency_id int, value decimal(19, 9), date date);
CREATE UNIQUE INDEX rate_currency_date ON rate (currency_id, date);

-- +migrate StatementBegin
CREATE FUNCTION rate_date_extent() RETURNS TABLE(min date, max date) AS $$
BEGIN
    RETURN QUERY SELECT MIN(date), MAX(date) FROM rate
        LIMIT (CASE WHEN EXISTS(SELECT id FROM rate LIMIT 1) THEN 1 ELSE 0 END);
END
$$ LANGUAGE plpgsql;
-- +migrate StatementEnd

-- +migrate Down
DROP TABLE rate;
DROP FUNCTION rate_date_extent();
