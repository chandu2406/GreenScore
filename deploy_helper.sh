#!/bin/sh
# @brief Helper to deploy code to kettle.
#
# Mainly necessary since scp'ing to "kettle.ubiq.cs.cmu.edu" defaults to
# some username which not everyone has access to. Could muck around with
# modifying .ssh/config or environment variables, but both of these options
# proved non-trivial. This is minimum viable solution.
#
# @author Lucas Ray (ltray)

printf "Username: "
read name

scp -r ./* ${name}@kettle.ubiq.cs.cmu.edu:/home/greenscore/source/
ssh ${name}@kettle.ubiq.cs.cmu.edu /bin/sh /home/greenscore/scripts/deploy.sh
