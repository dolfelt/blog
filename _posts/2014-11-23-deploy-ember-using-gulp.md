---
layout: post
title:  "Deploy Your Application Using Ember-cli and Gulp"
date:   2014-11-23 14:52:19
categories: ember ember-cli development
---

Manual deployments can be time consuming and tedious. You spend your days building and/or fixing your Ember.js application, only to get bogged down in the details of deployments at the end. Uploading each file through FTP takes time, and making sure caching doesn't cause issues shouldn't be something you have to worry about.

#### The Solution

##### ember-cli
[Ember-cli](http://ember-cli.com) can greatly reduce the amount of effort you need building your application. It also can become essential in automating your deployments. If you aren't using ember-cli for your next project, you might want to consider it.

##### Gulp.js
[Gulp.js](http://gulpjs.com/) is a fantastic scripting automation tool (similar to Grunt). We can easily build tasks that make your life easier. What's not to love!?

<hr />

If you haven't used Gulp before, you can begin by installing it.<br />
`npm install -g gulp`

Let's start by looking into the `gulpfile.js`, where the majority of the work is.

##### gulpfile.js

{% highlight javascript %}
var fs = require('fs');

var gulp = require('gulp');
var shell = require('gulp-shell');
var s3 = require('gulp-s3');
var gzip = require('gulp-gzip');
var sftp = require('gulp-sftp');

// Build the project using ember-cli
gulp.task('build', shell.task([
  'ember build --environment production'
]));

// Deploy all the assets to Amazon S3
gulp.task('deploy:assets', function() {
  var aws = JSON.parse(fs.readFileSync('./aws.json'));
  var options = { headers: {'Cache-Control': 'max-age=315360000, no-transform, public'} }

  return gulp.src('./dist/**')
    .pipe(gzip())
    .pipe(s3(aws, options));
});

// Deploy the index.html file to a server of your choice
gulp.task('deploy:index', function() {
  return gulp.src('./dist/index.html')
    .pipe(sftp({
        host: 'example.com',
        user: 'deploy',
        password: '<deploy-password>',
        remotePath: '/var/www/example.com/'
      }));
});

// Combine all these tasks into the deploy task
gulp.task('deploy', ['build', 'deploy:assets', 'deploy:index']);

// Default task will only build ember-cli
gulp.task('default', ['build']);

{% endhighlight %}

> Make sure to install all the dependencies. You can use the `--save-dev` option to add them to your project for future use.

There is a lot going on there. Let's start with the `build` task. This one is simple. It runs the ember-cli build method under the production environment.

The `deploy:assets` task grabs the compiled files, gzips them, and uploads them to a bucket on S3. The credentials and bucket information are stored in the file `aws.json`. 

{% highlight json %}
{
  "key": "<AWS_KEY>",
  "secret": "<AWS_SECRET>",
  "bucket": "bucket-name",
  "region": "us-east-1"
}
{% endhighlight %}

The `deploy:index` task grabs only the `index.html` file and uploads it to a server of your choosing through SSH. [Additional options for gulp-sftp](https://github.com/gtg092x/gulp-sftp) might work better for you. I generally use the `agent` option.

That's all there is for the Gulp side of things. Let's move onto making sure the asset compilation is ready for S3.

##### Brocfile.js

{% highlight javascript %}
var app = new EmberApp({
  fingerprint: {
    prepend: 'https://s3.amazonaws.com/<bucket-name>/'
  }
});
{% endhighlight %}

Ember-cli by default fingerprints all your assets when compiled for production. This takes care of any caching issues when you deploy. The `prepend` parameter allows you to have your assets hosted on a separate host. In our case this is S3, but could easily be a CDN like CloudFront.

##### nginx.conf

In my case, I choose to use Nginx to serve up the `index.html` file. This allows me to have clean URLs and is quite basic. There are many additional options that could be used to host the index file, but I'll assume Nginx for sake of this tutorial.

{% highlight nginx %}
server {
  listen 80;
  server_name example.com;
 
  root /var/www/example.com/;
 
  location / {
     index  index.html;
     try_files $uri $uri/ /index.html?/$request_uri;
   }
}
{% endhighlight %}

<hr />
#### Conclusion

Whew! At first glance, this may appear complicated, but over time you will easily get back your up-front investment. Each deployment will take seconds instead of minutes. It also reduces the risk of human errors.

Source Files: [Github Gist](https://gist.github.com/dolfelt/3fafa3cd89d5bd30c3c3)

#### Future

Because I'm generally never satisfied with my solutions, I'm always thinking of better ideas. Right now I'd like to see a way to roll back easily, or even choose which deployment is active, which would be useful for testing the application after deployment. This could even be broken into a separate task so you can deploy, test the deploy, then activate it for public consumption.