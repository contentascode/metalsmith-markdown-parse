---
layout: page
title: "My website is not working as expected"
author: RaReNet
language: en
summary: "A threat faced by many NGOs, independent media and bloggers is having their voices muted because their website is down or has been defaced. This section of the Digital First Aid Kit will walk you through some basic steps to diagnose potential problems."
date: 2018-09
permalink: /en/topics/website-not-working/
parent: /en/
---

# My Website is down, what is going on?

A threat faced by many NGOs, independent media and bloggers is having their voices muted because their website is down or has been defaced. This is a frustrating problem and can have a lot of causes like bad website maintenance, unreliable hosting, [script-kiddies](https://en.wikipedia.org/wiki/Script_kiddie), a 'denial of service' attack or a website takeover. This section of the Digital First Aid Kit will walk you through some basic steps to diagnose potential problems using material from [My Website is Down](https://github.com/OpenInternet/MyWebsiteIsDown/blob/master/MyWebsiteIsDown.md).

It is important to know that there are many reasons why your website can go down. It can range from technical problems at the
company that hosts the website or the not updated CMS like Joomla or Wordpress. Finding the problem and possible solutions to
your website's problem can be cumbersome. It is good practice to **contact your webmaster and the website host** after diagnosing
these common problems below. If none of these options are available to you, [seek help from an organization you trust](#website_down_end).

As a start, consider:

- Who built your website? Are they available to help?
- Was it built using Wordpress or another popular CMS platform?
- Who is your web hosting provider? If you do not know, you can use a tool [like this](http://www.whoishostingthis.com/) to help.

## Workflow

### error_message

Are you seeing error messages?

 - [Yes, I am seeing error messages](#error_message_end)
 - [No](#hosting_message)


### hosting_message

Are you seeing a message from your web hosting provider?

- [Yes, I see a message from my hosting provider](#hosting_message_end)
- [No](#site_not_loading)


### site_not_loading

Is your site not loading at all?

- [Yes, the site is not loading at all](#site_not_loading_end)
- [No, the website is loading](#hosting_working)


### hosting_working

Is your hosting provider's website working, but your website is unavailable?

- [Yes, I can access my hosting provider's website](#hosting_working_end)
- [No](#similar_content_censored)


### similar_content_censored

Are you able to visit other sites with content like your site?

- [I can't visit other sites with similar content, either.](#similar_content_censored_end)
- [Other sites work fine. I just can't visit my site](#loading_intermittently)


### loading_intermittently

Is your site loading intermittently, or unusually slowly?

- [Yes, my site is loading intermittently or is slow](#loading_intermittently_end)
- [No, my website is loading, but it might have been hacked into](#website_defaced)


### website_defaced

Does your website load but the appearance and content are not what you expect to see?

- [Yes, my site does not have the expected content/appearance](#defaced_attack_end)
- [No](#website_down_end)


### error_message_end

> This could be a ***software problem*** -- you should reflect on any recent changes you or your team may have made, and contact your webmaster. Sending your webmaster a screenshot, the link of the page you are having problems with, and any error messages you see will help them figure out what might be the cause of the problem. You might also copy the error messages into a search engine to see if there are any easy fixes.

Has this helped?

- [Yes](#resolved_end)
- [No](#website_down_end)


### hosting_message_end

> You could have been taken offline for legal, [copyright](https://www.eff.org/issues/bloggers/legal/liability/IP), billing, or other reasons. Contact your hosting provider for further details on why they suspended your web hosting.

Has this helped?

- [Yes](#resolved_end)
- [No, I need legal support](#legal_end)
- [No, I need technical support](#website_down_end)

### site_not_loading_end

> Your hosting company may be having problems, in which case you may be facing a ***hosting problem***. Can you visit the website of your hosting company?  Note that this is **not** the admin section of your own site, but the company or organization you work with to host your site.

> Look or search for a "status" blog (e.g. status.dreamhost.com), and also search on twitter.com for other users discussing downtime at the hosting company - a simple search like “(company name) down” can often reveal if many others are having the same problem.

Has this helped?

- [Yes](#resolved_end)
- [No, the website of my hosting provider is not down](#hosting_working_end)
- [No, i need technical support](#website_down_end)


### hosting_working_end

> Check your URL in [this website](https://downforeveryoneorjustme.com/) - your site might be up but you can’t see it.
>
> If your site is up but you can't see it, this is probably a ***network problem***: your own Internet connection could be having issues or be blocking your access to your site.

Do you need further help?

- [No](#resolved_end)
- [Yes, I need help to restore my network connection](#website_down_end)
- [Yes, this is not a network problem and my website is down for everyone](#similar_content_censored)


### similar_content_censored_end

> Try visiting websites with similar content to your website. Also try using [Tor](https://www.torproject.org/projects/gettor.html) or [Psiphon](https://psiphon.ca/products.php) to access your site.
If you can visit your site via Tor or Psiphon, you have a ***censorship problem*** - you are still online for other parts of the world, but are being censored in your own country.

Would you like to do something about this censorship?

- [Yes, I would like to report this publicly and need support for my advocacy campaign](#advocacy_end)
- [Yes, I would like to find a solution to make my website accessible](#website_down_end)
- [No](#resolved_end)


### loading_intermittently_end

> Your site may be overwhelmed by the number and speed of requests for pages it is receiving - this is a ***performance problem***.
>
> This could be "good" in that your site has become more popular and it simply needs some improvements to respond to more readers - check your site analytics for a long-term pattern in growth.  Contact your webmaster or hosting provider for guidance. Many popular blogging and CMS platforms (Joomla, Wordpress, Drupal...) have plugins to help cache your website locally and integrate CDNs, which can dramatically improve site performance and resilience. Many of the solutions below can also help performance problems as well.
>
> If you are experiencing a severe **performance problem**, your site may be the victim of a [**"distributed denial of service" attack**](https://ssd.eff.org/en/glossary/distributed-denial-service-attack) (or DDoS). Follow the steps below to mitigate such an attack:
>
> - Step 1: Contact a trusted person who can help with your website (your webmaster, the people who helped you set up your site, your internal staff or your hosting provider).
>
> - Step 2: Work with the company you bought your domain name from and change the "Time to Live" or TTL to 1 hour (you can find instructions on how to do it on the websites of many providers, like [Network Solutions](http://www.networksolutions.com/support/how-to-manage-advanced-dns-records/) or [GoDaddy](http://support.godaddy.com/help/article/680/managing-dns-for-your-domain-names)). This can help you redirect your site much faster once it comes under attack (the default is 72 hours, or three days). This setting will often be found in the "advanced" properties for your domain, sometimes part of the SRV or Service records.
>
> - Step 3: Move your site to a DDoS mitigation service. To start:
>
>     - [Deflect.ca](https://deflect.ca/)
>     - [Google's Project Shield](https://projectshield.withgoogle.com/en/)
>     - [CloudFlare's Project Galileo](https://www.cloudflare.com/galileo)
>
> For a full list of trusted organizations that can help mitigate a DDoS attack see [this section](#ddos_end)
>
> - Step 4: As soon as you have regained control, review your needs and decide between a secure hosting provider or simply continuing with your DDoS mitigation service.

For a full list of trusted organizations that can provide secure hosting, see [this section](#web_hosting_end)

### defaced_attack_end

> Website defacement is a practice where an attacker replaces the content or the visual appearance of the website with their own content. These attacks are usually conducted by either exploiting vulnerabilities in unmaintained CMS platforms without the latest security updates or by using stolen hosting account usernames/passwords.
>
> - Step 1: Verify that this is a malicious takeover of your website. An unfortunate but legal practice is to buy recently expired domain names to 'take over' the traffic they had for advertising purposes. It is very important to keep payments for your domain name in order.
> - Step 2: If your website has been defaced, first regain control of your website login account and reset its password, see the Account Hijacking section for help.
> - Step 3: Make a backup of the defaced site that can later be used for investigation of the defacement.
> - Step 4: Temporarily turn off your website - use a simple landing page or 'parked' page.
> - Step 5: Determine how your site was hacked. Your hosting provider may be able to help. Common problems are older parts of your site with custom scripts/tools running on them, out of date content management systems, and custom programming with security flaws.
> - Step 6: Restore your original site from backups. If neither you, nor your hosting company have backups, you may have to re-build your website from scratch! Also note that if your only backups are at your hosting provider, an attacker may be able to delete those when they take control of your site!

Have this recommendations helped?

- [Yes](#resolved_end)
- [No](#website_down_end)


### website_down_end

> If you still need help after all the questions you answered you can contact a trusted organization and ask for support:
>
> Before you get in touch, please ask yourself the following questions:
>
> - How is the company/organization structured and sustained? What types of vetting or reporting are they required to do, if any?
> - Consider what country/countries they have a legal presence in and which they would be required to comply with law enforcement and other legal requests
> - What logs are created, and for how long are they available?
> - Are there restrictions regarding the type of content the service will host/proxy, and could they have an impact on your site?
> - Are there restrictions on the countries where they can provide service?
> - Do they accept a form of payment you can use? Can you afford their service?
> - Secure communications - you should be able to log in securely and communicate with the service provider privately.
> - Is there an option for two-factor authentication, to improve the security of administrator access? This or related secure access policies can help reduce the threat of other forms of attacks against your website.
> - What type of ongoing support will you have access to? Is there an additional cost for support, and/or will you receive sufficient support if you are using a 'free' tier?
> - Can you 'test-drive' your website before you move over via a staging site?

:[](organisations?services=web_protection)

### legal_end

> If your website is down due to legal reasons and you need legal support, please get in touch with an organization that can help:

:[](organisations?services=legal)

### advocacy_end

> If you would like support to launch a campaign against censorship, please get in touch with organizations that can help with advocacy efforts:

:[](organisations?services=advocacy)

### ddos_end

> If you need help to mitigate a DDoS attack against your website, please refer to organizations specializing in DDoS mitigation:


:[](organisations?services=ddos)


### web_hosting_end

> If you are looking for a trusted organization to host your website in a secure server, please see the list below:
>
> Before you get in touch with these organizations, please think about these questions:
>
> - Do they offer full support in moving your site over to their service?
> - Are the services equal to or better than your current host, at least for the tools/services you use? Top things to check are:
>     - Management dashboards like cPanel
>     - Email accounts (how many, quotas, access via SMTP, IMAP)
>     - Databases (how many, types, access)
>     - Remote access via SFTP/SSH
>     - Support for the programming language (PHP, Perl, Ruby, cgi-bin access...) or CMS (Drupal, Joomla, Wordpress…) that your site uses

:[](organisations?services=web_hosting)


### resolved_end

We hope your problem was solved.

### final_tips

- **Backups** - In addition to the services and suggestions below, it’s always a good idea to make sure you have backups (that you store somewhere other than the same place your website is!). Many hosts and website platforms have this included, but it’s best to also have additional, offline copies.

- **Keep software up to date** - If you are using a Content Management System (CMS) such as WordPress or Drupal, make sure that your website technology is updated to the latest software, especially if there have been security updates.

- **Monitoring** - There are many services that can constantly check on your site and email or text you if it goes down. [This Mashable article](http://mashable.com/2010/04/09/free-uptime-monitoring/) lists 10 popular ones. Be aware that the email or phone number you use for monitoring will be clearly associated with managing the website.

#### Resources

- [My Website is Down](https://github.com/OpenInternet/MyWebsiteIsDown)
- [Keeping your site alive](https://www.eff.org/keeping-your-site-alive)
- [Security in a Box](https://securityinabox.org/en/chapter_7_2)
- [Threat modeling, Surveillance Self Defense Guide](https://ssd.eff.org/risk/threats)
- [DDoS proactive and reactive measures](https://www.cert.be/files/DDoS-proactive-reactive.pdf)
