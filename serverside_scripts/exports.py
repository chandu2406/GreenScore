#!/usr/bin/env python
# @brief Script which populates "greenscore" db from RESC05alldata.csv.
#        Shouldn't be run more than once.
#
# @author Lucas Ray (ltray)

# imports
import sys
import csv
import copy
import MySQLdb

# parse CSV file
f = open('./RECS05alldata.csv', 'r')
r = csv.reader(f)

all_data = []
mapping = []
canon = {}
a = r.next()
for el in a:
  # basically constructing an anon class
  canon[el] = None
  mapping.append(el)

for data in r:
  this = copy.deepcopy(canon)
  count = 0
  for thing in data:
    mapped = mapping[count]
    count+=1
    this[mapped] = thing
  all_data.append(this)

# all_data now is array of 'objects' (dicts mapping properties to values)

# establish connection to sql db
conn = MySQLdb.connect(charset='utf8', host='localhost', user='greenscore', \
                       passwd='hf&kdsp1', db='greenscore', \
                       unix_socket='/var/tmp/mysql.sock')
cursor = conn.cursor()

# table name
table_name = 'RECS05'

# construct the column definition. escape names with backticks
# HACK: I think NWEIGHT is the only thing of type non-INT...
def_string = '(%s)' % (", ".join(map(\
  lambda el : '`' + el + "` INT" if el != "NWEIGHT" else el + " REAL", \
  mapping)))

# create the table
query = '''CREATE TABLE %s %s''' % (table_name, def_string)
cursor.execute(query)

# construct column string
columns = '''(%s)''' % (", ".join(map(\
  lambda el : '`' + el + '`', mapping)))

# insert the datums!
for datum in all_data:
  values = '''(%s)''' % (", ".join(datum.values()))
  insert_query = "INSERT INTO %s %s VALUES %s" % (table_name, columns, \
                                                          values)
  # XXX: some insert queries are ill-formed for some reason. Ignore them (since
  #      there are only 68 of 4382 that are bad), but should fix eventually
  try:
    cursor.execute(insert_query)
  except:
    # write bad statement to a log
    f2 = open('./errors.log', 'a')
    f2.write("\n" + insert_query)
    f2.close()

# commit and close
cursor.close()
conn.commit()
conn.close()
f.close()
