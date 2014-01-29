#!/usr/bin/env python
# @brief Simple script to read key from RECS05layoutAllData.csv and filter
#        out crucial/useful information. See README.md for key.
#
# @author Lucas Ray (ltray)

def main():
  infile = open('./RECS05layoutAllData.csv', 'r')
  outfile = open('./leyoutData.md', 'w')

  out = {
    'input': [],
    'possible_input': [],
    'output': []
  }
  for line in infile:
    line = line.rstrip()
    def switch(e, l):
      return {
        '#': lambda: None,
        ' ': lambda: out['possible_input'].append(l),
        '*': lambda: out['input'].append(l),
        '=': lambda: out['output'].append(l)
      }[e]()
    switch(line[0], line[1:])

  outfile.write("INPUT\n")
  for line in out['input']:
    outfile.write(line + "\n")
  outfile.write("\n----------------------------")
  outfile.write("\nPOSSIBLE OTHER INPUT\n")
  for line in out['possible_input']:
    outfile.write(line + "\n")
  outfile.write("\n----------------------------")
  outfile.write("\nOUTPUT\n")
  for line in out['output']:
    outfile.write(line + "\n")

  outfile.close()
  infile.close()

if __name__ == '__main__':
  main()
