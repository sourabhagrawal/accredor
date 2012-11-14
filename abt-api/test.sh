#!/bin/bash

mysql -uroot abt < sql/create_schema.sql
echo 'Recreated the Schema'

mysql -uroot abt < sql/seed.sql
echo 'Populated Seed data'

vows test/suites/* --spec
echo 'Tests Finished'
