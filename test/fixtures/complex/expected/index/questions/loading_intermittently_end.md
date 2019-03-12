<blockquote>
<p>Your site may be overwhelmed by the number and speed of requests for pages it is receiving - this is a <strong><em>performance problem</em></strong>.</p>
<p>This could be &quot;good&quot; in that your site has become more popular and it simply needs some improvements to respond to more readers - check your site analytics for a long-term pattern in growth.  Contact your webmaster or hosting provider for guidance. Many popular blogging and CMS platforms (Joomla, Wordpress, Drupal...) have plugins to help cache your website locally and integrate CDNs, which can dramatically improve site performance and resilience. Many of the solutions below can also help performance problems as well.</p>
<p>If you are experiencing a severe <strong>performance problem</strong>, your site may be the victim of a <a href="https://ssd.eff.org/en/glossary/distributed-denial-service-attack"><strong>&quot;distributed denial of service&quot; attack</strong></a> (or DDoS). Follow the steps below to mitigate such an attack:</p>
<ul>
<li><p>Step 1: Contact a trusted person who can help with your website (your webmaster, the people who helped you set up your site, your internal staff or your hosting provider).</p>
</li>
<li><p>Step 2: Work with the company you bought your domain name from and change the &quot;Time to Live&quot; or TTL to 1 hour (you can find instructions on how to do it on the websites of many providers, like <a href="http://www.networksolutions.com/support/how-to-manage-advanced-dns-records/">Network Solutions</a> or <a href="http://support.godaddy.com/help/article/680/managing-dns-for-your-domain-names">GoDaddy</a>). This can help you redirect your site much faster once it comes under attack (the default is 72 hours, or three days). This setting will often be found in the &quot;advanced&quot; properties for your domain, sometimes part of the SRV or Service records.</p>
</li>
<li><p>Step 3: Move your site to a DDoS mitigation service. To start:</p>
<ul>
<li><a href="https://deflect.ca/">Deflect.ca</a></li>
<li><a href="https://projectshield.withgoogle.com/en/">Google&#39;s Project Shield</a></li>
<li><a href="https://www.cloudflare.com/galileo">CloudFlare&#39;s Project Galileo</a></li>
</ul>
</li>
</ul>
<p>For a full list of trusted organizations that can help mitigate a DDoS attack see <a href="../ddos_end">this section</a></p>
<ul>
<li>Step 4: As soon as you have regained control, review your needs and decide between a secure hosting provider or simply continuing with your DDoS mitigation service.</li>
</ul>
</blockquote>
<p>For a full list of trusted organizations that can provide secure hosting, see <a href="../web_hosting_end">this section</a></p>
<ul>
<li><p><strong>Backups</strong> - In addition to the services and suggestions below, it’s always a good idea to make sure you have backups (that you store somewhere other than the same place your website is!). Many hosts and website platforms have this included, but it’s best to also have additional, offline copies.</p>
</li>
<li><p><strong>Keep software up to date</strong> - If you are using a Content Management System (CMS) such as WordPress or Drupal, make sure that your website technology is updated to the latest software, especially if there have been security updates.</p>
</li>
<li><p><strong>Monitoring</strong> - There are many services that can constantly check on your site and email or text you if it goes down. <a href="http://mashable.com/2010/04/09/free-uptime-monitoring/">This Mashable article</a> lists 10 popular ones. Be aware that the email or phone number you use for monitoring will be clearly associated with managing the website.</p>
</li>
</ul>
<h2 id="resources">Resources</h2>
<ul>
<li><a href="https://github.com/OpenInternet/MyWebsiteIsDown">My Website is Down</a></li>
<li><a href="https://www.eff.org/keeping-your-site-alive">Keeping your site alive</a></li>
<li><a href="https://securityinabox.org/en/chapter_7_2">Security in a Box</a></li>
<li><a href="https://ssd.eff.org/risk/threats">Threat modeling, Surveillance Self Defense Guide</a></li>
<li><a href="https://www.cert.be/files/DDoS-proactive-reactive.pdf">DDoS proactive and reactive measures</a></li>
</ul>
