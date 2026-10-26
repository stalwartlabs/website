## Step 5: Sign in to the WebUI

The WebUI is the server's web administration interface, and the rest of the installation takes place in it. After the restart, the server serves it over HTTPS on the server hostname. Open `https://<hostname>/admin` in a browser, where `<hostname>` is the server hostname entered in the wizard, and sign in with the administrator address and password shown on the wizard's last screen. The [WebUI](/docs/management/webui/) page describes its sections.

The first visit may show a certificate warning. At its first regular start the server requests the TLS certificate chosen in the wizard, with automatic DNS management once it has published the DNS records, and until the certificate arrives it presents a self-signed certificate for `localhost`. Do not accept the warning, because once it is accepted the browser can no longer detect an interception of the connection. Wait a short while and reload the page instead.

Once the certificate is in place, the browser connects without a warning and shows a certificate issued by Let's Encrypt for the hostname. After sign-in, the administration interface opens, and the default domain appears in the domain list.

If something goes wrong in this step, [Step 5: WebUI sign-in](#step-5-webui-sign-in) under Common problems lists the usual causes and their fixes.
