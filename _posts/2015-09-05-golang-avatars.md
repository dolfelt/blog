---
layout: post
title:  "Avatar Service for All using Golang"
date:   2015-09-05 19:24:16
permalink: avatar-service-using-golang
categories: development saas golang
---

Users love avatars, and they love to customize them, which is why I wrote this simple service that easily creates custom avatars for any purpose. The service is light, uses S3 for storage, and can be run easily from a single binary file.

__tl;dr;__  [Check out the source code](https://github.com/dolfelt/avatar-go)

#### Why Custom?

Avatars are usually the last thought for most developers building an awesome product or service. And perhaps they should be. A lot of people just default to Gravatar or some other global service. And this is generally fine, at least at the beginning.

Users' preferences towards avatars can vary greatly. What we discovered at [When I Work](http://wheniwork.com) is that some of our customers thought avatars to be just as important as our scheduling product. They didn't fully understand how to use Gravatar, and support spent way too long explaining things to them.

That's when we decided to write an avatar service (originally in PHP). We architected it outside the main application and just communicated through standard HTTP.

#### Why Golang?

After initially writing the service in PHP, we realized that the load required more servers than we wanted to use (or pay for). And given that the service itself is fairly simple, it made a lot of sense to write it in Go.

Golang is a great language for writing small and fast services. The spec is simple. Uploading the processing images is simple. Serving of images is a simple redirect. And all of them need to be _fast_!

#### The Build

##### Dependencies

In order to manage dependencies for things like image resizing and routing, we chose to use [GoDep](https://github.com/tools/godep). This little script (which is also written in Go) helps to easily maintain all the requirements of the project, including checking them into the repository for version control.

##### Configuration

Configuration should be simple. Using JSON and built in Go structs, it couldn't be easier to access the settings. I've [written about this before](/golang-configuration).


##### Simplicity &amp; Flexibility

The service is simple and doesn't pretend to force you to use it a certain way. Images are associated with a SHA1 hash, then uploaded to S3. There are plans to add additional storage providers, but S3 makes the most sense overall. Data related to the images is all stored in PostgreSQL.

You can hash anything, use that hash to upload, then retrieve it later. It's really that simple.

##### Authentication

Keeping simplicity in mind, authentication is handled using [JWT](http://jwt.io). Setting a secret in the config file and using that same secret when generating your token will make uploads easy.

Using [gocraft/web](https://github.com/gocraft/web), we can easily authentication using middleware:

{% highlight go %}
func Auth(rw web.ResponseWriter, req *web.Request, next web.NextMiddlewareFunc) {
  // Place authentication code here
}
router := web.New()
router.Middleware(Auth)
{% endhighlight %}

#### Open Source

Make sure to check out the [source code](https://github.com/dolfelt/avatar-go). It should be easy to setup and configure using the included scripts. Make sure to reach out or comment if you have questions or need help.
