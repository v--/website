-- +migrate Up
GRANT ALL ON DATABASE ivasilev TO website;

-- +migrate Down
REVOKE ALL ON DATABASE ivasilev FROM website;
