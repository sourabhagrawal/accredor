#!/bin/bash
export NODE_ENV=test

mysql -uroot abt_test < sql/create_schema.sql
echo 'Recreated the Schema'

mysql -uroot abt_test < sql/seed.sql
echo 'Populated Seed data'

vows test/suites/* --spec
echo 'Tests Finished'
