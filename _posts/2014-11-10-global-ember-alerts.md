---
layout: post
title:  "Global Ember Alert Messages"
date:   2014-11-10 21:26:35
categories: saas ember ember-cli programming
---

A global messaging system in Ember.js should be simple, but when navigating between controllers and updating templates, it can quickly become confusing. Creating global alert messages doesn't have to be confusing though. Thinking it through and setting it up right can save you tons of time as you build your app.

> All these instructions assume you are using [ember-cli](http://www.ember-cli.com/). If you aren't, you should be!

First you need to start by creating an initializer which will create the interface for interacting with your application messages. The initializer will then inject the interface into the Ember application objects for use.

{% highlight javascript %}
// app/initializers/alerts.js
import Ember from 'ember';

var AlertsInterface = Ember.ArrayProxy.extend({
  content: Ember.A(),
  timeout: 5000,
  pushObject: function(object) {
    object.typeClass = 'alert-' + object.type;
    this._super(object);
  },
  danger: function(message, prefix) {
    this.pushObject({
      type: 'danger',
      text: message,
      prefix: prefix
    });
  },
  warning: function(message, prefix) {
    this.pushObject({
      type: 'warning',
      text: message,
      prefix: prefix
    });
  },
  info: function(message, prefix) {
    this.pushObject({
      type: 'info',
      text: message,
      prefix: prefix
    });
  },
  success: function(message, prefix) {
    this.pushObject({
      type: 'success',
      text: message,
      prefix: prefix
    });
  }
});

export default {
  name:       'alerts',
  initialize: function(container, app) {
    // Register the alerts interface
    container.register('alerts:app', AlertsInterface);

    // Inject the alerts property into the application
    app.inject('controller', 'alerts', 'alerts:app');
    app.inject('component', 'alerts', 'alerts:app');
    app.inject('route', 'alerts', 'alerts:app');
  }
};
{% endhighlight %}

Now comes the fun part. In order for this to be used in your app (most likely a template) we are going to create two components.

{% highlight javascript %}
// app/components/alert-list.js
import Ember from 'ember';

export default Ember.Component.extend({
  classNames: 'alert-messages',
  messages: Ember.computed.alias('alerts')
});

// app/components/page-alert.js
import Ember from 'ember';

export default Ember.Component.extend({
  classNames: ['alerts-container'],
  classNameBindings: ['insertState'],
  insertState: 'pre-insert',
  didInsertElement: function() {
    var self = this;
    self.$().bind('webkitTransitionEnd', function() {
      if (self.get('insertState') === 'destroyed') {
        self.alerts.removeObject(self.get('message'));
      }
    });
    Ember.run.later(function() {
      self.set('insertState', 'inserted');
    }, 250);
    
    // Check for a timeout to remove automatically
    if (self.alerts.timeout) {
      Ember.run.later(function() {
        self.set('insertState', 'destroyed');
      }, self.alerts.timeout);
    }
  },

  click: function() {
    this.set('insertState', 'destroyed');
  }
});
{% endhighlight %}

Each of these components has a matching template for rendering the data into HTML.

{% highlight html %}{% raw %}
<!-- app/templates/components/alert-list.hbs -->
{{#each messages}}
  {{page-alert message=this}}
{{/each}}

<!-- app/templates/components/page-alert.hbs -->
<div {{bind-attr class=":alert :alert-page message.typeClass"}}>
    <button type="button" class="close">×</button>
    <strong>{{#if message.prefix}}{{message.prefix}}{{else}}Well done!{{/if}}</strong> {{message.text}}
</div>
{% endraw %}{% endhighlight %}

The final step to using this would simple be to include it in your application somewhere. Really, you can place this anywhere.

{% highlight html %}{% raw %}
{{alert-list}}
{% endraw %}{% endhighlight %}

Because we registered our `alerts` interface above on the route and controller objects, we can simply use it anywhere in those objects. Adding an alert to the stack is as simple as...

{% highlight javascript %}
this.alerts.success("You did a fantastic job!", "Tutorial!");
{% endhighlight %}

<hr />

__It's really that easy!__ Adding this alerts interface and registering it across your application can really save you some time. If you would like to save even more time and have your alerts be automatically cleared when navigating within your application, you can add the following to your router.

{% highlight javascript %}
// add to app/router.js
Ember.Route.reopen({
  activate: function() {
    this.alerts.clear();
  }
});
{% endhighlight %}

