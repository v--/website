-- +migrate Up
CREATE TABLE currency (id serial UNIQUE, name text UNIQUE);

-- +migrate Down
DROP TABLE currency;
