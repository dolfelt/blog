---
layout: post
title:  "Configuration in Golang"
date:   2015-08-20 19:24:16
permalink: golang-configuration
categories: development saas golang
---

Configuration can sometimes be difficult. Pulling variables outside your source that change based on environment or other external services is very important to maintaining your application. Many people use YAML or config files in the native language. When dealing with configuration using Golang, I've always defaulted to using JSON. Partly because it is so easy to ready, but also because it is very portable. Almost any external service or configuration management system (Chef or Ansible) can parse and create JSON.

#### The JSON

We will start with a simple JSON file that has nested objects.

{% highlight json %}
{
  "AWS": {
    "key": "my-special-key",
    "secret": "sUp3rS3cre7",
    "bucket": "s3-bucket.example.com"
  },
  "jwt_key": "another-secret-key"
}
{% endhighlight %}

#### The Struct(ure)
After creating the JSON file, you can map it to a struct. You could also create the struct first and the JSON second. It's up to you how you do it.

{% highlight go %}
type Configuration struct {
  AWS          awsConfig
  JwtKey       string `json:"jwt_key"`
  IgnoreString string `json:"-"`
}
type awsConfig struct {
  AccessKey    string `json:"key"`
  AccessSecret string `json:"secret"`
  Bucket       string `json:"bucket"`
}
{% endhighlight %}

You will notice the difference in each of the fields' tags. When the JSON key and the struct keys do not match, you can map them using `json:"json_key"`. You can also ignore fields (which is especially helpful when writing out JSON) by doing `json:"-"`.

#### Marshalling (or Loading the Config)
Once you've create the struct and setup the JSON configuration file, you're ready to load the data. Loading the configuration is as easy as reading the file from disk and marshalling it into your object.

{% highlight go %}
func LoadConfig(path string) Configuration {
	file, err := ioutil.ReadFile(path)
	if err != nil {
		log.Fatal("Config File Missing. ", err)
	}

	var config Configuration
	err = json.Unmarshal(file, &config)
	if err != nil {
		log.Fatal("Config Parse Error: ", err)
	}

	return config
}
{% endhighlight %}

You can simply use this function in your Go program like so:

{% highlight go %}
config := LoadConfig("./config.json")

fmt.Println("AWS Bucket: " + config.AWS.Bucket)
{% endhighlight %}

Hope this helps. Enjoy!
