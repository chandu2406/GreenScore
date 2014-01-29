#!/bin/sh
# @brief Simple script which watches for changes (coffeescript and scss).
#        Must be run from root of standard mvc directory.
# @author Lucas Ray

scss --watch . &
scss_pid=$!
coffee --watch --compile . &
coffee_pid=$!
kill_all() {
  echo "\n\x1B[0;31mKilling scss, pid:\x1B[0m \x1B[0;32m${scss_pid}\x1B[0m"
  kill $scss_pid
  echo "\x1B[0;31mKilling coffee, pid:\x1B[0m \x1B[0;32m${coffee_pid}\x1B[0m"
  kill $coffee_pid
  exit 1
}
trap kill_all SIGINT
while true; do sleep 1; done
