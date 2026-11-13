-- Runs once, when the Postgres volume is first initialised.
-- The main "contacts" database is created by POSTGRES_DB; this adds the test database.
CREATE DATABASE contacts_test;
