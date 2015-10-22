librato-pm2
===

librato-pm2 is a tiny node application to feed process metrics from [PM2](https://www.npmjs.com/package/pm2) into [librato.com](https://www.librato.com).

##Installation

Install the executable with npm:

```
npm install -g librato-pm2
```

Create a `.librato-pm2rc` file in your home directory (or the directory of the user that PM2 processes run as) containing the following JSON:

```json
{
	"email": "YOUR LIBRATO EMAIL ADDRESS",
	"token": "YOUR LIBRATO API ACCESS TOKEN"
}
```

You can obtain the access token from the [Account Settings > API Access Tokens](https://metrics.librato.com/account/api_tokens) page

Finally, add librato-pm2 to your PM2 process stack.

```
pm2 start librato-pm2
```

Within a few moments you will see new metrics on your librato account for every process currently managed by PM2, named with a prefix followed by the process name in PM2 and the metric available.

![](http://i.imgur.com/ZtMeQkq.png)

The following metrics are supplied:

- `cpu`: CPU usage in percentage from 0 to 100.
- `memory`: Memory usage in bytes.
- `online`: Boolean 0 or 1 for if the process is running.
- `restarts`: Total crashes recorded by PM2.
- `uptime`: Time in seconds since the process was last started (Float).

##Options

In addition to the `email` and `token` values on the configuration file, you can provide the following options:

**`interval`**: Time, in seconds, that the metrics will be polled and submitted. Default is `10`.

**`metricPrefix`**: String used to prefix every metric name. Default is `"pm2."`

Additionally, the config file itself may be installed in any of the locations supported by the [`rc`](https://www.npmjs.com/package/rc) library.