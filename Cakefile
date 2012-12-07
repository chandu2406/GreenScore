{spawn, exec} = require 'child_process'

task 'build', 'build the source directory', ->
  exec 'coffee --compile .; scss --update .;npm install', (err, stdout, stderr) ->
    console.log err if err
    throw err if err
    console.log stdout + stderr if stdout or stderr

task 'deploy', 'deploy to kettle', ->
  exec 'git push heroku master', (err, stdout, stderr) ->
    console.log err if err
    throw err if err
    console.log stdout + stderr if stdout or stderr

task 'local', 'deploy locally (runs the node server)', ->
  exec 'cake build', (err, stdout, stderr) ->
    if err
      console.log err
      throw err if err
    else
      console.log stdout + stderr if stdout or stderr
      node = spawn 'node', ['./main.js']
      node.stdout.on 'data', (data) -> console.log data.toString().trim()
      node.stderr.on 'data', (data) -> console.log data.toString().trim()
