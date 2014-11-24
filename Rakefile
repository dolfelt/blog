require 'cgi'
require 'net/http'

desc 'Ping pubsubhubbub server.'
task :ping do
  
  print 'Pinging pubsubhubbub server'
  data = 'hub.mode=publish&hub.url=' + CGI::escape("http://ctobyday.com/feed")
  http = Net::HTTP.new('pubsubhubbub.appspot.com', 80)
  resp, data = http.post('http://pubsubhubbub.appspot.com/publish',
                         data,
                         {'Content-Type' => 'application/x-www-form-urlencoded'})

  puts "Ping error: #{resp}, #{data}" unless resp.code == "204"
end