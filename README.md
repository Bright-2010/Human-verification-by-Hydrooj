## This project has added a Cloudflare human verification feature to the [HydroOJ](https://hydro.js.org)

How do you want to use this plugin?
- Create a directory in ```/root/.hydro/addons``` in this example, the name is ```cf-check```.
- Clone the source code of this addon into the ```/root/.hydro/addons/cf-check``` directory.
- Use ```hydrooj addon add /root/.hydro/addons/cf-check``` to enable this addon.
- Use ```pm2 restart hydrooj``` to restart hydrooj.
- Open your hydrooj select Configuration Management under Control Panel config API Key.
Then a Cloudflare CAPTCHA challenge will be triggered when the user registers.
#### powered by Bright
